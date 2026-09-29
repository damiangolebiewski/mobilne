/**
 * INF.04 Mobile — serwer zapisu postępu uczniów (Google Apps Script + Arkusz Google).
 *
 * Jak wdrożyć: zobacz materialy/wdrozenie_online.html w portalu.
 * W skrócie: utwórz Arkusz Google → Rozszerzenia → Apps Script → wklej ten plik →
 * ustaw KLASY i HASLO_NAUCZYCIELA poniżej → uruchom funkcję przygotuj() →
 * Wdróż → Nowe wdrożenie → Aplikacja internetowa (Wykonaj jako: Ja, Dostęp: Każdy) →
 * skopiuj adres URL do pliku js/config.js w portalu.
 */

/* ======================= USTAWIENIA (zmień!) ======================= */

// Kod klasy, który podajesz uczniom → nazwa klasy widoczna w arkuszu.
// Uczeń bez poprawnego kodu nie założy konta. Możesz dodać kilka klas.
var KLASY = {
  '5TP-2026': '5TP'
  // 'INNY-KOD': '4TP'
};

// Hasło do panelu nauczyciela (nauczyciel.html). Musi mieć min. 8 znaków
// i być inne niż domyślne — inaczej panel nie zadziała.
var HASLO_NAUCZYCIELA = 'zmien-to-haslo';

/* ==================== koniec ustawień ==================== */

var LICZBA_BLOKOW = 15;
var ARKUSZ_UCZNIOWIE = 'Uczniowie';
var ARKUSZ_POSTEP = 'Postep';
var DOMYSLNE_HASLO = 'zmien-to-haslo';
var MAX_DANE = 45000;           // limit znaków w jednej komórce to 50 000
var MAX_BLEDNYCH_PIN = 8;       // po tylu błędnych PIN-ach blokada na 10 minut
var BLOKADA_S = 600;

// kolumny arkusza "Uczniowie" (1 = A)
var K = { id: 1, name: 2, cls: 3, pin: 4, token: 5, rev: 6, updated: 7, created: 8, data: 9 };
var NAGLOWKI_UCZNIOWIE = ['id', 'Uczeń', 'Klasa', 'pin_hash (wyczyść = reset PIN)', 'token', 'wersja', 'Ostatni zapis', 'Utworzono', 'dane (JSON)'];

function naglowkiPostep_() {
  var h = ['Klasa', 'Uczeń', 'Ostatnia aktywność', 'Bloki ukończone', 'Zadania wykonane', 'Mini-testy (najlepsze)', 'Czas pracy (min)'];
  for (var i = 1; i <= LICZBA_BLOKOW; i++) h.push('B' + i);
  h.push('id');
  return h;
}

/* ---------------- punkty wejścia ---------------- */

function doGet() {
  return json_({ ok: true, service: 'INF04 Mobile — zapis postępu', time: new Date().toISOString() });
}

function doPost(e) {
  var req;
  try {
    req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'bad_json', msg: 'Niepoprawne dane.' });
  }
  try {
    return json_(handle_(req));
  } catch (err) {
    return json_({ ok: false, error: 'server', msg: 'Błąd serwera: ' + (err && err.message ? err.message : err) });
  }
}

function handle_(req) {
  switch (req.action) {
    case 'login': return withLock_(function () { return login_(req); });
    case 'load': return load_(req);
    case 'save': return withLock_(function () { return save_(req); });
    case 'teacher': return teacher_(req);
    case 'teacherResetPin': return withLock_(function () { return teacherResetPin_(req); });
    default: return { ok: false, error: 'bad_action', msg: 'Nieznana operacja.' };
  }
}

/* ---------------- uczniowie ---------------- */

function login_(req) {
  var name = cleanName_(req.name);
  if (!name) return { ok: false, error: 'name', msg: 'Wpisz imię i nazwisko (dwa słowa, 3–60 znaków).' };
  var code = String(req.code || '').trim();
  var cls = null;
  for (var c in KLASY) if (KLASY.hasOwnProperty(c) && c.toLowerCase() === code.toLowerCase()) cls = KLASY[c];
  if (!cls) return { ok: false, error: 'code', msg: 'Nieprawidłowy kod klasy — zapytaj nauczyciela.' };
  var pin = String(req.pin || '');
  if (!/^\d{4,8}$/.test(pin)) return { ok: false, error: 'pin_format', msg: 'PIN to 4–8 cyfr.' };

  var id = cls + '|' + normName_(name);
  if (isLocked_(id)) return { ok: false, error: 'locked', msg: 'Zbyt wiele błędnych prób. Spróbuj za 10 minut.' };

  var sh = sheet_(ARKUSZ_UCZNIOWIE);
  var row = findRow_(sh, id);
  var now = new Date();
  if (row < 0) {
    var token = Utilities.getUuid();
    sh.appendRow([id, name, cls, hash_(id, pin), token, 0, '', now, '']);
    upsertPostep_(id, name, cls, null, null, null);
    return { ok: true, created: true, id: id, name: name, cls: cls, token: token, rev: 0, data: null };
  }
  var vals = sh.getRange(row, 1, 1, K.data).getValues()[0];
  var stored = String(vals[K.pin - 1] || '');
  if (!stored) {
    // nauczyciel wyczyścił PIN → uczeń ustawia nowy, stare sesje tracą ważność
    var t2 = Utilities.getUuid();
    sh.getRange(row, K.pin).setValue(hash_(id, pin));
    sh.getRange(row, K.token).setValue(t2);
    return okUser_(vals, t2, true);
  }
  if (stored !== hash_(id, pin)) {
    addFail_(id);
    return { ok: false, error: 'pin', msg: 'Błędny PIN. Jeśli go nie pamiętasz, poproś nauczyciela o reset.' };
  }
  clearFail_(id);
  var tok = String(vals[K.token - 1] || '');
  if (!tok) { tok = Utilities.getUuid(); sh.getRange(row, K.token).setValue(tok); }
  return okUser_(vals, tok, false);
}

function okUser_(vals, token, pinReset) {
  return {
    ok: true, created: false, pinReset: pinReset,
    id: vals[K.id - 1], name: vals[K.name - 1], cls: vals[K.cls - 1], token: token,
    rev: Number(vals[K.rev - 1]) || 0, data: parse_(vals[K.data - 1])
  };
}

function auth_(req) {
  var id = String(req.id || ''), token = String(req.token || '');
  if (!id || !token) return null;
  var sh = sheet_(ARKUSZ_UCZNIOWIE);
  var row = findRow_(sh, id);
  if (row < 0) return null;
  var vals = sh.getRange(row, 1, 1, K.data).getValues()[0];
  if (String(vals[K.token - 1]) !== token) return null;
  return { sh: sh, row: row, vals: vals };
}

var AUTH_ERR = { ok: false, error: 'auth', msg: 'Sesja wygasła — zaloguj się ponownie.' };

function load_(req) {
  var a = auth_(req);
  if (!a) return AUTH_ERR;
  var rev = Number(a.vals[K.rev - 1]) || 0;
  if (req.rev !== undefined && Number(req.rev) === rev) return { ok: true, rev: rev, same: true };
  return { ok: true, rev: rev, data: parse_(a.vals[K.data - 1]) };
}

function save_(req) {
  var a = auth_(req);
  if (!a) return AUTH_ERR;
  var rev = Number(a.vals[K.rev - 1]) || 0;
  if (Number(req.rev) !== rev) {
    return { ok: false, error: 'conflict', rev: rev, data: parse_(a.vals[K.data - 1]) };
  }
  var data = sanitizeData_(req.data);
  var txt = JSON.stringify(data);
  if (txt.length > MAX_DANE) return { ok: false, error: 'too_big', msg: 'Za dużo danych do zapisu.' };
  var now = new Date();
  a.sh.getRange(a.row, K.rev, 1, 4).setValues([[rev + 1, now, a.vals[K.created - 1], txt]]);
  var total = Math.max(0, Math.min(500, Number(req.tasksTotal) || 0));
  upsertPostep_(a.vals[K.id - 1], a.vals[K.name - 1], a.vals[K.cls - 1], data, now, total);
  return { ok: true, rev: rev + 1, saved: now.toISOString() };
}

/* ---------------- nauczyciel ---------------- */

function teacherOk_(key) {
  return HASLO_NAUCZYCIELA !== DOMYSLNE_HASLO && String(HASLO_NAUCZYCIELA).length >= 8 &&
    String(key || '') === HASLO_NAUCZYCIELA;
}

function teacher_(req) {
  if (HASLO_NAUCZYCIELA === DOMYSLNE_HASLO || String(HASLO_NAUCZYCIELA).length < 8)
    return { ok: false, error: 'teacher_default', msg: 'Ustaw w Code.gs własne HASLO_NAUCZYCIELA (min. 8 znaków) i wdróż ponownie.' };
  if (isLocked_('teacher')) return { ok: false, error: 'locked', msg: 'Zbyt wiele błędnych prób. Spróbuj za 10 minut.' };
  if (!teacherOk_(req.key)) { addFail_('teacher'); return { ok: false, error: 'teacher_key', msg: 'Błędne hasło nauczyciela.' }; }
  clearFail_('teacher');
  var sh = sheet_(ARKUSZ_UCZNIOWIE);
  var last = sh.getLastRow();
  var students = [];
  if (last >= 2) {
    var rows = sh.getRange(2, 1, last - 1, K.data).getValues();
    rows.forEach(function (r) {
      if (!r[K.id - 1]) return;
      students.push({
        id: r[K.id - 1], name: r[K.name - 1], cls: r[K.cls - 1],
        updated: iso_(r[K.updated - 1]), created: iso_(r[K.created - 1]),
        pinSet: !!r[K.pin - 1], data: parse_(r[K.data - 1])
      });
    });
  }
  return { ok: true, students: students, time: new Date().toISOString() };
}

function teacherResetPin_(req) {
  if (!teacherOk_(req.key)) return { ok: false, error: 'teacher_key', msg: 'Błędne hasło nauczyciela.' };
  var sh = sheet_(ARKUSZ_UCZNIOWIE);
  var row = findRow_(sh, String(req.id || ''));
  if (row < 0) return { ok: false, error: 'not_found', msg: 'Nie znaleziono ucznia.' };
  sh.getRange(row, K.pin).setValue('');
  sh.getRange(row, K.token).setValue('');
  clearFail_(String(req.id));
  return { ok: true };
}

/* ---------------- arkusz "Postep" (czytelny podgląd) ---------------- */

function upsertPostep_(id, name, cls, data, when, tasksTotal) {
  var sh = sheet_(ARKUSZ_POSTEP);
  var idCol = LICZBA_BLOKOW + 8;
  var row = findRow_(sh, id, idCol);
  var line = postepLine_(id, name, cls, data, when, tasksTotal);
  if (row < 0) sh.appendRow(line);
  else sh.getRange(row, 1, 1, line.length).setValues([line]);
}

function postepLine_(id, name, cls, data, when, tasksTotal) {
  data = data || { blocks: {}, quiz: {}, tasks: {}, checks: {} };
  var blocks = data.blocks || {}, quiz = data.quiz || {}, tasks = data.tasks || {};
  var done = 0, qSum = 0, qMax = 0, time = 0, cells = [];
  for (var i = 1; i <= LICZBA_BLOKOW; i++) {
    var bid = 'b' + (i < 10 ? '0' : '') + i;
    var b = blocks[bid] || {}, q = quiz[bid];
    var s = b.done ? '✓' : (b.visited ? '…' : '');
    if (b.done) done++;
    time += Number(b.time) || 0;
    if (q && Number(q.max)) { qSum += Number(q.best) || 0; qMax += Number(q.max); s += (s ? ' ' : '') + (Number(q.best) || 0) + '/' + Number(q.max); }
    cells.push(s);
  }
  var tDone = Object.keys(tasks).length;
  var line = [cls, name, when || '', done + ' / ' + LICZBA_BLOKOW,
    tasksTotal ? tDone + ' / ' + tasksTotal : String(tDone),
    qMax ? Math.round(100 * qSum / qMax) + '%' : '', Math.round(time / 60)];
  return line.concat(cells).concat([id]);
}

/** Uruchom raz po wklejeniu kodu: tworzy arkusze, nagłówki i kolory. */
function przygotuj() {
  var u = sheet_(ARKUSZ_UCZNIOWIE);
  var p = sheet_(ARKUSZ_POSTEP);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  u.setFrozenRows(1);
  p.setFrozenRows(1);
  p.setFrozenColumns(2);
  var rng = p.getRange(2, 8, 500, LICZBA_BLOKOW);
  p.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith('✓').setBackground('#c8e6c9').setRanges([rng]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith('…').setBackground('#fff3c4').setRanges([rng]).build()
  ]);
  p.hideColumns(LICZBA_BLOKOW + 8);
  u.hideColumns(K.token);
  ss.setActiveSheet(p);
  return 'Gotowe. Teraz: Wdróż → Nowe wdrożenie → Aplikacja internetowa.';
}

/* ---------------- pomocnicze ---------------- */

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    var h = name === ARKUSZ_UCZNIOWIE ? NAGLOWKI_UCZNIOWIE : naglowkiPostep_();
    sh.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight('bold');
  }
  return sh;
}

function findRow_(sh, id, col) {
  var last = sh.getLastRow();
  if (last < 2 || !id) return -1;
  var vals = sh.getRange(2, col || K.id, last - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) if (String(vals[i][0]) === id) return i + 2;
  return -1;
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return { ok: false, error: 'busy', msg: 'Serwer zajęty — spróbuj za chwilę.' };
  try { return fn(); } finally { lock.releaseLock(); }
}

function cleanName_(s) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  if (s.length < 3 || s.length > 60 || s.split(' ').length < 2) return '';
  if (/[<>=+@"]/.test(s.charAt(0)) || /[<>"]/.test(s)) return '';
  return s;
}
function normName_(s) { return s.toLowerCase(); }

function hash_(id, pin) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'inf04:' + id + ':' + pin, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function isLocked_(id) { return (Number(CacheService.getScriptCache().get('fail:' + id)) || 0) >= MAX_BLEDNYCH_PIN; }
function addFail_(id) {
  var c = CacheService.getScriptCache(), k = 'fail:' + id;
  c.put(k, String((Number(c.get(k)) || 0) + 1), BLOKADA_S);
}
function clearFail_(id) { CacheService.getScriptCache().remove('fail:' + id); }

function parse_(txt) {
  if (!txt) return null;
  try { return JSON.parse(txt); } catch (e) { return null; }
}

function iso_(v) { return v instanceof Date ? v.toISOString() : (v ? String(v) : ''); }

// Przyjmujemy tylko znaną strukturę danych postępu.
function sanitizeData_(d) {
  var out = { blocks: {}, quiz: {}, tasks: {}, checks: {} };
  if (!d || typeof d !== 'object') return out;
  ['blocks', 'quiz', 'tasks', 'checks'].forEach(function (k) {
    var src = d[k];
    if (!src || typeof src !== 'object' || Array.isArray(src)) return;
    Object.keys(src).slice(0, 400).forEach(function (key) {
      if (!/^[\w.\-]{1,40}$/.test(key)) return;
      out[k][key] = src[key];
    });
  });
  return out;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
