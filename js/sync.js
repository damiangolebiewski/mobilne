/* Opcjonalna synchronizacja postępu online (Google Apps Script).
   Działa tylko, gdy w js/config.js ustawiono syncUrl. Bez tego portal pracuje offline. */
(function () {
  var CFG = window.PORTAL_CONFIG || {};
  var URL = String(CFG.syncUrl || '').trim();
  var P = window.Progress;
  var S = { enabled: !!(URL && P) };
  window.Sync = S;
  if (!S.enabled) return;
  document.documentElement.className += ' sync-on';

  var KEY = 'inf04mobile.sync';
  var HARD_DELAY = 2000, SOFT_DELAY = 180000, RETRY = 30000;
  var PULL_EVERY = CFG.pullEverySec >= 0 ? CFG.pullEverySec * 1000 : 15000; // jak często sprawdzać zmiany z innych urządzeń
  var timer = null, timerAt = 0, busy = false, again = false, changeNo = 0;
  var bar = null, statusEl = null, pendingLogin = null;

  /* ---------- sesja ---------- */
  function getS() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
  function setS(s) { try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); } catch (e) { /* brak */ } }
  S.session = getS;

  function tasksTotal() { return (window.COURSE && window.COURSE.tasks) ? window.COURSE.tasks.length : 0; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hhmm(d) { return (d || new Date()).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }); }
  function fire() { document.dispatchEvent(new CustomEvent('progress-synced')); }

  /* ---------- komunikacja (text/plain = bez zapytania CORS preflight) ---------- */
  function api(obj, cb) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, 25000);
    fetch(URL, { method: 'POST', body: JSON.stringify(obj), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow', signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(t); cb(null, j); }, function (e) { clearTimeout(t); cb(e || new Error('net')); });
  }

  /* ---------- odcisk danych: rozpoznanie własnego zapisu, którego odpowiedź nie dotarła ---------- */
  function canon(o) {
    if (Array.isArray(o)) return '[' + o.map(canon).join(',') + ']';
    if (o && typeof o === 'object') return '{' + Object.keys(o).sort().map(function (k) { return JSON.stringify(k) + ':' + canon(o[k]); }).join(',') + '}';
    return JSON.stringify(o === undefined ? null : o);
  }
  function fp(d) {
    var t = canon(JSON.parse(JSON.stringify(d || P.empty()))), h = 5381;
    for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0;
    return h.toString(36) + '.' + t.length;
  }
  function remember(s, d) { s.sent = [fp(d)].concat(s.sent || []).slice(0, 4); }

  /* ---------- scalanie (gdy ta sama osoba pracowała na dwóch urządzeniach naraz) ---------- */
  function minS(a, b) { return !a ? b : !b ? a : (a < b ? a : b); }
  function maxS(a, b) { return !a ? b : !b ? a : (a > b ? a : b); }
  function merge(a, b) {
    a = a || P.empty(); b = b || P.empty();
    var o = P.empty(), k;
    var bl = {}; for (k in a.blocks || {}) bl[k] = 1; for (k in b.blocks || {}) bl[k] = 1;
    Object.keys(bl).forEach(function (id) {
      var x = (a.blocks || {})[id] || {}, y = (b.blocks || {})[id] || {};
      var done = !!(x.done || y.done);
      o.blocks[id] = {
        visited: minS(x.visited, y.visited), last: maxS(x.last, y.last), done: done,
        doneAt: done ? (x.done && y.done ? minS(x.doneAt, y.doneAt) : (x.done ? x.doneAt : y.doneAt)) : null,
        time: Math.max(Number(x.time) || 0, Number(y.time) || 0)
      };
    });
    var qk = {}; for (k in a.quiz || {}) qk[k] = 1; for (k in b.quiz || {}) qk[k] = 1;
    Object.keys(qk).forEach(function (id) {
      var x = (a.quiz || {})[id], y = (b.quiz || {})[id];
      if (!x || !y) { o.quiz[id] = JSON.parse(JSON.stringify(x || y)); return; }
      var n = (x.date || '') >= (y.date || '') ? x : y;
      o.quiz[id] = { score: n.score, max: n.max, date: n.date, attempts: Math.max(x.attempts || 0, y.attempts || 0), best: Math.max(x.best || 0, y.best || 0) };
    });
    [a.tasks || {}, b.tasks || {}].forEach(function (t) { for (var id in t) o.tasks[id] = minS(o.tasks[id], t[id]); });
    [a.checks || {}, b.checks || {}].forEach(function (c) {
      for (var id in c) {
        var arr = o.checks[id] || [];
        (c[id] || []).forEach(function (v, i) { arr[i] = (arr[i] || v) ? 1 : 0; });
        for (var i = 0; i < arr.length; i++) if (arr[i] === undefined) arr[i] = 0;
        o.checks[id] = arr;
      }
    });
    return o;
  }
  S.merge = merge;

  /* ---------- zapis na serwer ---------- */
  function schedule(delay) {
    var at = Date.now() + delay;
    if (timer && timerAt <= at) return;
    clearTimeout(timer); timerAt = at;
    timer = setTimeout(function () { timer = null; push(); }, delay);
  }
  function push() {
    var s = getS();
    if (!s || s.expired) return;
    if (busy) { again = true; return; }
    busy = true; again = false;
    var myNo = changeNo, payload = P.data();
    remember(s, payload); setS(s);
    setStatus('Zapisywanie…', 'busy');
    api({ action: 'save', id: s.id, token: s.token, rev: s.rev, data: payload, tasksTotal: tasksTotal() }, function (err, r) {
      busy = false;
      var cur = getS();
      if (!cur || cur.id !== s.id) return; // wylogowano w trakcie
      if (err) { setStatus('Brak połączenia — zapiszę później', 'warn'); schedule(RETRY); return; }
      if (r.ok) {
        cur.rev = r.rev; cur.lastPull = Date.now();
        if (changeNo === myNo) cur.dirty = false;
        setS(cur);
        setStatus('Zapisano ' + hhmm(), 'ok');
        if (again || cur.dirty) schedule(HARD_DELAY);
        return;
      }
      if (r.error === 'conflict') {
        // serwer ma nowszą wersję: jeśli to nasz własny wcześniejszy zapis — nadpisujemy; jeśli z innego urządzenia — scalamy
        var own = (cur.sent || []).indexOf(fp(r.data)) >= 0;
        if (!own) { P.replace(merge(P.data(), r.data)); fire(); }
        cur.rev = r.rev; setS(cur);
        schedule(own ? 0 : 200); return;
      }
      if (r.error === 'auth') { expire(); return; }
      setStatus(r.msg || 'Błąd zapisu', 'warn'); schedule(RETRY);
    });
  }
  function beacon() {
    var s = getS();
    if (!s || !s.dirty || s.expired || busy || !navigator.sendBeacon) return;
    try {
      var d = P.data(); remember(s, d); setS(s);
      navigator.sendBeacon(URL, new Blob([JSON.stringify({ action: 'save', id: s.id, token: s.token, rev: s.rev, data: d, tasksTotal: tasksTotal() })], { type: 'text/plain;charset=utf-8' }));
    } catch (e) { /* trudno */ }
    // nie znamy nowego numeru wersji — przy następnym zapisie serwer zgłosi konflikt i dane zostaną scalone
  }

  P.onChange(function (kind) {
    var s = getS();
    if (!s || s.expired) return;
    changeNo++;
    if (!s.dirty) { s.dirty = true; setS(s); }
    schedule(kind === 'soft' ? SOFT_DELAY : HARD_DELAY);
  });

  /* ---------- pobranie z serwera (inne urządzenie) ---------- */
  function pull(force) {
    var s = getS();
    if (!s || s.expired) return;
    if (s.dirty) { push(); return; }
    if (!force && s.lastPull && Date.now() - s.lastPull < PULL_EVERY) { setStatus('Zapisano online', 'ok'); return; }
    setStatus('Sprawdzanie…', 'busy');
    api({ action: 'load', id: s.id, token: s.token, rev: s.rev }, function (err, r) {
      var cur = getS();
      if (!cur || cur.id !== s.id) return;
      if (err) { setStatus('Brak połączenia — pracujesz offline', 'warn'); return; }
      if (!r.ok) { if (r.error === 'auth') expire(); else setStatus(r.msg || 'Błąd', 'warn'); return; }
      cur.lastPull = Date.now();
      if (!r.same && !cur.dirty) { P.replace(r.data || P.empty()); cur.rev = r.rev; setS(cur); fire(); }
      else setS(cur);
      if (cur.dirty) push(); else setStatus('Zapisano online', 'ok');
    });
  }

  /* ---------- logowanie / wylogowanie ---------- */
  function expire() {
    var s = getS(); if (!s) return;
    s.expired = true; setS(s);
    render();
    showForm('Sesja wygasła (np. nauczyciel zresetował PIN). Zaloguj się ponownie — postęp z tej przeglądarki nie zginie.');
  }

  function finishLogin(r, data, dirty) {
    P.replace(data || P.empty());
    setS({ id: r.id, token: r.token, name: r.name, cls: r.cls, rev: r.rev, dirty: !!dirty, lastPull: Date.now() });
    fire(); render();
    if (dirty) push(); else setStatus(r.created ? 'Konto założone — postęp zapisuje się online' : 'Zalogowano', 'ok');
  }

  function doLogin(form) {
    var name = form.querySelector('[name=name]').value, code = form.querySelector('[name=code]').value, pin = form.querySelector('[name=pin]').value;
    var msg = form.querySelector('.sync-msg'), btn = form.querySelector('button[type=submit]');
    msg.textContent = 'Łączenie…'; msg.className = 'sync-msg'; btn.disabled = true;
    try { localStorage.setItem('inf04mobile.code', code.trim()); } catch (e) { /* brak */ }
    api({ action: 'login', name: name, code: code, pin: pin }, function (err, r) {
      btn.disabled = false;
      if (err) { msg.textContent = 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.'; msg.className = 'sync-msg err'; return; }
      if (!r.ok) { msg.textContent = r.msg || 'Nie udało się zalogować.'; msg.className = 'sync-msg err'; return; }
      var old = getS();
      if (old && old.id === r.id) {           // ponowne logowanie po wygaśnięciu sesji — scal lokalne zmiany
        finishLogin(r, merge(P.data(), r.data), true); return;
      }
      if (old) { P.clear(); }                 // ktoś inny był zalogowany na tym komputerze
      if (meaningful(P.data())) {             // postęp zapisany wcześniej bez logowania
        pendingLogin = r; renderMergeQuestion(form); return;
      }
      P.clear();                              // same odwiedziny/czas bez logowania — pomijamy
      finishLogin(r, r.data, false);
    });
  }

  function meaningful(d) {
    var k;
    for (k in d.blocks) if (d.blocks[k].done) return true;
    if (Object.keys(d.quiz).length || Object.keys(d.tasks).length) return true;
    for (k in d.checks) if ((d.checks[k] || []).indexOf(1) >= 0) return true;
    return false;
  }

  function renderMergeQuestion(form) {
    var d = P.data(), nb = 0;
    for (var k in d.blocks) if (d.blocks[k].done) nb++;
    form.innerHTML = '<p><b>W tej przeglądarce jest już postęp zapisany bez logowania</b> (ukończone bloki: ' + nb +
      ', wykonane zadania: ' + Object.keys(d.tasks).length + ').</p><p>Czy to Twoja praca?</p>' +
      '<div class="row-btns"><button type="button" class="btn" data-m="yes">Tak — dołącz do mojego konta</button>' +
      '<button type="button" class="btn secondary" data-m="no">Nie — pomiń (to nie moje)</button></div>';
    form.querySelector('[data-m=yes]').addEventListener('click', function () {
      var r = pendingLogin; pendingLogin = null; finishLogin(r, merge(P.data(), r.data), true);
    });
    form.querySelector('[data-m=no]').addEventListener('click', function () {
      var r = pendingLogin; pendingLogin = null; P.clear(); finishLogin(r, r.data, false);
    });
  }

  function logout() {
    var s = getS();
    function done() { P.clear(); setS(null); fire(); render(); setStatus('Wylogowano. Postęp jest bezpieczny na serwerze.', 'ok'); }
    if (s && s.dirty && !s.expired) {
      setStatus('Zapisywanie przed wylogowaniem…', 'busy');
      api({ action: 'save', id: s.id, token: s.token, rev: s.rev, data: P.data(), tasksTotal: tasksTotal() }, function (err, r) {
        if (err || !r.ok && r.error !== 'conflict') {
          if (!window.confirm('Nie udało się zapisać ostatnich zmian (brak internetu?). Wylogować mimo to? Ostatnie zmiany zostaną utracone.')) { setStatus('Nie zapisano — spróbuj ponownie', 'warn'); return; }
          done(); return;
        }
        if (r.error === 'conflict') { // scal (chyba że to nasz własny zapis) i zapisz jeszcze raz
          var own = (s.sent || []).indexOf(fp(r.data)) >= 0;
          api({ action: 'save', id: s.id, token: s.token, rev: r.rev, data: own ? P.data() : merge(P.data(), r.data), tasksTotal: tasksTotal() }, function () { done(); });
          return;
        }
        done();
      });
    } else done();
  }
  S.logout = logout;

  /* ---------- pasek u góry strony ---------- */
  function setStatus(t, cls) {
    if (!statusEl) return;
    statusEl.textContent = t; statusEl.className = 'sync-st ' + (cls || '');
  }

  function showForm(note) {
    if (!bar) return;
    var f = bar.querySelector('.sync-form');
    if (!f) return;
    f.hidden = false;
    if (note) { var n = f.querySelector('.sync-note-top'); if (n) { n.textContent = note; n.hidden = false; } }
    var first = f.querySelector('[name=name]'); if (first && !first.value) first.focus();
  }

  function render() {
    if (!bar) return;
    var s = getS();
    var savedCode = ''; try { savedCode = localStorage.getItem('inf04mobile.code') || ''; } catch (e) { /* brak */ }
    var form = '<form class="sync-form" hidden autocomplete="off">' +
      '<p class="sync-note-top warn-text" hidden></p>' +
      '<div class="sync-fields">' +
      '<label>Imię i nazwisko<input name="name" required maxlength="60" value="' + (s ? esc(s.name) : '') + '" placeholder="np. Jan Kowalski"></label>' +
      '<label>Kod klasy<input name="code" required maxlength="40" value="' + esc(savedCode) + '" placeholder="od nauczyciela"></label>' +
      '<label>PIN (4–8 cyfr)<input name="pin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" required maxlength="8"></label>' +
      '<button type="submit" class="btn">Zaloguj</button></div>' +
      '<p class="sync-msg"></p>' +
      '<p class="small muted">Pierwsze logowanie zakłada konto — <b>zapamiętaj swój PIN</b> (nie używaj PIN-u do telefonu ani karty). Zapomniany PIN resetuje nauczyciel. Na wspólnym komputerze w szkole <b>wyloguj się</b> po pracy.</p>' +
      '</form>';
    if (s && !s.expired) {
      bar.className = 'syncbar on';
      bar.innerHTML = '<div class="sync-row"><span class="sync-ico">☁</span><span><b>' + esc(s.name) + '</b> <span class="muted">(' + esc(s.cls) + ')</span></span>' +
        '<span class="sync-st"></span><button type="button" class="btn secondary sync-out">Wyloguj</button></div>';
      bar.querySelector('.sync-out').addEventListener('click', logout);
    } else {
      bar.className = 'syncbar off';
      bar.innerHTML = '<div class="sync-row"><span class="sync-ico">☁</span><span>' +
        (s && s.expired ? '<b>' + esc(s.name) + '</b> — sesja wygasła, zaloguj się ponownie.' : 'Zaloguj się, aby Twój postęp zapisywał się online — w szkole i w domu.') +
        '</span><span class="sync-st"></span><button type="button" class="btn sync-in">Zaloguj się</button></div>' + form;
      bar.querySelector('.sync-in').addEventListener('click', function () { var f = bar.querySelector('.sync-form'); if (f.hidden) showForm(); else f.hidden = true; });
      bar.querySelector('.sync-form').addEventListener('submit', function (ev) { ev.preventDefault(); doLogin(ev.target); });
    }
    statusEl = bar.querySelector('.sync-st');
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.hasAttribute('data-nosync')) return;
    var main = document.querySelector('main.wrap');
    if (!main) return;
    bar = document.createElement('div');
    bar.id = 'syncbar';
    main.insertBefore(bar, main.firstChild);
    render();
    var s = getS();
    if (s && !s.expired) pull(false);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') pull(false);
      else if (timer) { clearTimeout(timer); timer = null; beacon(); }
    });
    window.addEventListener('pagehide', function () { if (timer) { clearTimeout(timer); timer = null; beacon(); } });
  });
})();
