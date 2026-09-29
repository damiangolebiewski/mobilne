/* Panel nauczyciela: podgląd postępu wszystkich uczniów (dane z Google Apps Script). */
(function () {
  var C = window.COURSE || { blocks: [], tasks: [] };
  var URL = String((window.PORTAL_CONFIG || {}).syncUrl || '').trim();
  var KEYS = 'inf04mobile.teacher';
  var students = [], openId = null, fetchedAt = null;
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmtDate(iso) { if (!iso) return '—'; var d = new Date(iso); if (isNaN(d)) return '—'; return d.toLocaleDateString('pl-PL') + ' ' + d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }); }
  function fmtTime(sec) { var m = Math.round((sec || 0) / 60); if (!m) return '—'; return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; }
  function key() { try { return sessionStorage.getItem(KEYS) || ''; } catch (e) { return ''; } }
  function setKey(k) { try { if (k) sessionStorage.setItem(KEYS, k); else sessionStorage.removeItem(KEYS); } catch (e) { /* brak */ } }

  function api(obj, cb) {
    fetch(URL, { method: 'POST', body: JSON.stringify(obj), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow' })
      .then(function (r) { return r.json(); }).then(function (j) { cb(null, j); }, function (e) { cb(e); });
  }

  /* ---- statystyki ucznia ---- */
  function stats(st) {
    var d = st.data || { blocks: {}, quiz: {}, tasks: {}, checks: {} };
    var bl = d.blocks || {}, qz = d.quiz || {}, tk = d.tasks || {};
    var s = { done: 0, tasks: 0, qSum: 0, qMax: 0, time: 0, last: st.updated || '', per: {} };
    C.blocks.forEach(function (b) {
      var x = bl[b.id] || {}, q = qz[b.id];
      var ts = C.tasks.filter(function (t) { return t.block === b.id; });
      var td = ts.filter(function (t) { return tk[t.id]; });
      if (x.done) s.done++;
      if (q && q.max) { s.qSum += q.best || 0; s.qMax += q.max; }
      s.time += Number(x.time) || 0;
      if (x.last && x.last > s.last) s.last = x.last;
      s.per[b.id] = { st: x.done ? 'done' : x.visited ? 'prog' : 'new', q: q, tasks: td.length, tasksAll: ts.length, taskList: ts, tk: tk, time: Number(x.time) || 0, visited: x.visited, last: x.last, doneAt: x.doneAt };
    });
    C.tasks.forEach(function (t) { if (tk[t.id]) s.tasks++; });
    return s;
  }
  function surname(n) { var p = String(n).trim().split(/\s+/); return (p[p.length - 1] + ' ' + p.slice(0, -1).join(' ')).toLowerCase(); }

  /* ---- tabela ---- */
  function render() {
    var host = $('#tp-table'); if (!host) return;
    var cls = $('#tp-class').value, q = $('#tp-search').value.trim().toLowerCase(), sort = $('#tp-sort').value;
    var rows = students.map(function (st) { return { st: st, s: stats(st) }; })
      .filter(function (r) { return (!cls || r.st.cls === cls) && (!q || String(r.st.name).toLowerCase().indexOf(q) >= 0); });
    rows.sort(function (a, b) {
      if (sort === 'progress') return b.s.done - a.s.done || b.s.tasks - a.s.tasks;
      if (sort === 'last') return (b.s.last || '') < (a.s.last || '') ? -1 : (b.s.last || '') > (a.s.last || '') ? 1 : 0;
      if (sort === 'time') return b.s.time - a.s.time;
      return surname(a.st.name).localeCompare(surname(b.st.name), 'pl');
    });
    var weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    var active = rows.filter(function (r) { return r.s.last && r.s.last >= weekAgo; }).length;
    var avg = rows.length ? Math.round(rows.reduce(function (a, r) { return a + r.s.done; }, 0) / rows.length * 10) / 10 : 0;
    $('#tp-summary').innerHTML = '<div class="stats">' +
      '<div class="stat">Uczniowie<b>' + rows.length + '</b></div>' +
      '<div class="stat">Aktywni w ostatnich 7 dniach<b>' + active + '</b></div>' +
      '<div class="stat">Średnio ukończonych bloków<b>' + String(avg).replace('.', ',') + ' / ' + C.blocks.length + '</b></div>' +
      '<div class="stat">Dane pobrano<b>' + (fetchedAt ? fetchedAt.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : '—') + '</b></div></div>';
    var h = '<div class="table-wrap"><table class="tp-table"><thead><tr><th>Uczeń</th><th>Klasa</th><th>Ostatnia aktywność</th><th>Bloki</th><th>Zadania</th><th>Mini-testy</th><th>Czas</th>';
    C.blocks.forEach(function (b) { h += '<th title="' + esc(b.title) + '">B' + b.num + '</th>'; });
    h += '</tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="' + (7 + C.blocks.length) + '">Brak uczniów' + (students.length ? ' spełniających kryteria.' : '. Uczniowie pojawią się tu po pierwszym zalogowaniu w portalu.') + '</td></tr>';
    rows.forEach(function (r) {
      var st = r.st, s = r.s, old = !s.last || s.last < weekAgo;
      h += '<tr class="st' + (old ? ' old' : '') + '" data-id="' + esc(st.id) + '" title="Kliknij, aby zobaczyć szczegóły"><td class="name"><b>' + esc(st.name) + '</b></td><td>' + esc(st.cls) + '</td>' +
        '<td>' + fmtDate(s.last) + '</td><td>' + s.done + ' / ' + C.blocks.length + '</td><td>' + s.tasks + ' / ' + C.tasks.length + '</td>' +
        '<td>' + (s.qMax ? Math.round(100 * s.qSum / s.qMax) + '%' : '—') + '</td><td>' + fmtTime(s.time) + '</td>';
      C.blocks.forEach(function (b) {
        var p = s.per[b.id];
        var label = p.st === 'done' ? '✓' : p.st === 'prog' ? '…' : '·';
        var tip = 'Blok ' + b.num + ': ' + (p.st === 'done' ? 'ukończony' : p.st === 'prog' ? 'w trakcie' : 'nierozpoczęty') +
          ' · zadania ' + p.tasks + '/' + p.tasksAll + (p.q ? ' · test ' + p.q.best + '/' + p.q.max : '') + (p.time ? ' · ' + fmtTime(p.time) : '');
        h += '<td class="b ' + p.st + '" title="' + esc(tip) + '">' + label + (p.q ? '<br>' + p.q.best + '/' + p.q.max : '') + '</td>';
      });
      h += '</tr>';
      if (openId === st.id) h += '<tr class="tp-detail"><td colspan="' + (7 + C.blocks.length) + '">' + detail(st, s) + '</td></tr>';
    });
    h += '</tbody></table></div>';
    host.innerHTML = h;
    Array.prototype.forEach.call(host.querySelectorAll('tr.st'), function (tr) {
      tr.addEventListener('click', function () { var id = tr.getAttribute('data-id'); openId = openId === id ? null : id; render(); });
    });
    var rb = host.querySelector('.tp-reset');
    if (rb) rb.addEventListener('click', function (ev) { ev.stopPropagation(); resetPin(rb); });
  }

  function detail(st, s) {
    var h = '<h3>' + esc(st.name) + ' <span class="muted small">(' + esc(st.cls) + ') · konto od ' + fmtDate(st.created) + ' · ostatni zapis ' + fmtDate(st.updated) + '</span></h3>';
    h += '<div class="table-wrap"><table><thead><tr><th>Blok</th><th>Status</th><th>Mini-test (ostatni / najlepszy / podejść)</th><th>Zadania</th><th>Czas</th><th>Ostatnio otwarty</th></tr></thead><tbody>';
    C.blocks.forEach(function (b) {
      var p = s.per[b.id];
      var tl = p.taskList.map(function (t) { return (p.tk[t.id] ? '✓ ' : '✗ ') + esc(t.title); }).join('<br>');
      h += '<tr><td>' + b.num + '. ' + esc(b.title) + '</td><td>' + (p.st === 'done' ? 'Ukończony<br><span class="small muted">' + fmtDate(p.doneAt) + '</span>' : p.st === 'prog' ? 'W trakcie' : '—') + '</td>' +
        '<td>' + (p.q ? p.q.score + '/' + p.q.max + ' · ' + p.q.best + '/' + p.q.max + ' · ' + (p.q.attempts || 0) : '—') + '</td>' +
        '<td><details><summary>' + p.tasks + ' / ' + p.tasksAll + '</summary><div class="small">' + tl + '</div></details></td>' +
        '<td>' + fmtTime(p.time) + '</td><td>' + fmtDate(p.last) + '</td></tr>';
    });
    h += '</tbody></table></div>';
    h += '<p class="small">Uczeń zapomniał PIN-u? <button type="button" class="btn small danger tp-reset" data-id="' + esc(st.id) + '">Resetuj PIN</button> <span class="tp-reset-msg small"></span><br>' +
      '<span class="muted">Po resecie uczeń loguje się tym samym imieniem i nazwiskiem oraz kodem klasy i wpisuje nowy PIN. Postęp zostaje.</span></p>';
    return h;
  }

  function resetPin(btn) {
    var msg = btn.parentNode.querySelector('.tp-reset-msg');
    if (!btn.classList.contains('armed')) { btn.classList.add('armed'); btn.textContent = 'Na pewno? Kliknij ponownie'; return; }
    btn.disabled = true; msg.textContent = 'Resetowanie…';
    api({ action: 'teacherResetPin', key: key(), id: btn.getAttribute('data-id') }, function (err, r) {
      btn.disabled = false;
      msg.textContent = err ? 'Brak połączenia.' : r.ok ? 'PIN zresetowany ✓' : (r.msg || 'Błąd');
      btn.classList.remove('armed'); btn.textContent = 'Resetuj PIN';
    });
  }

  /* ---- CSV (Excel, średnik) ---- */
  function csv() {
    var head = ['Uczeń', 'Klasa', 'Ostatnia aktywność', 'Bloki ukończone', 'Zadania wykonane', 'Mini-testy %', 'Czas (min)'];
    C.blocks.forEach(function (b) { head.push('B' + b.num); });
    var lines = [head];
    students.forEach(function (st) {
      var s = stats(st);
      var l = [st.name, st.cls, fmtDate(s.last), s.done, s.tasks, s.qMax ? Math.round(100 * s.qSum / s.qMax) : '', Math.round(s.time / 60)];
      C.blocks.forEach(function (b) { var p = s.per[b.id]; l.push((p.st === 'done' ? 'ukończony' : p.st === 'prog' ? 'w trakcie' : '') + (p.q ? ' ' + p.q.best + '/' + p.q.max : '')); });
      lines.push(l);
    });
    var txt = '﻿' + lines.map(function (l) { return l.map(function (v) { v = String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }).join(';'); }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL_.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
    a.download = 'postep_INF04_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
  var URL_ = window.URL;

  /* ---- logowanie i pobieranie ---- */
  function load(k, cb) {
    var msg = $('#tp-msg');
    msg.textContent = 'Pobieranie danych…'; msg.className = 'sync-msg';
    api({ action: 'teacher', key: k }, function (err, r) {
      if (err) { msg.textContent = 'Brak połączenia z serwerem.'; msg.className = 'sync-msg err'; return; }
      if (!r.ok) { msg.textContent = r.msg || 'Błąd.'; msg.className = 'sync-msg err'; if (r.error === 'teacher_key') { setKey(''); show(false); } return; }
      msg.textContent = '';
      setKey(k); students = r.students || []; fetchedAt = new Date();
      var sel = $('#tp-class'), cur = sel.value, classes = {};
      students.forEach(function (s) { classes[s.cls] = 1; });
      sel.innerHTML = '<option value="">wszystkie</option>' + Object.keys(classes).sort().map(function (c) { return '<option' + (c === cur ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('');
      show(true); render(); if (cb) cb();
    });
  }
  function show(on) { $('#tp-login').hidden = on; $('#tp-main').hidden = !on; }

  document.addEventListener('DOMContentLoaded', function () {
    if (!$('#tp-login')) return;
    if (!URL) { $('#tp-offline').hidden = false; $('#tp-login').hidden = true; return; }
    $('#tp-login').addEventListener('submit', function (ev) { ev.preventDefault(); load($('#tp-key').value); });
    ['#tp-class', '#tp-sort'].forEach(function (s) { $(s).addEventListener('change', render); });
    $('#tp-search').addEventListener('input', render);
    $('#tp-refresh').addEventListener('click', function () { load(key()); });
    $('#tp-csv').addEventListener('click', csv);
    $('#tp-logout').addEventListener('click', function () { setKey(''); students = []; show(false); $('#tp-key').value = ''; });
    if (key()) load(key());
  });
})();
