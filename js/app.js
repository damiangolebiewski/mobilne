/* Logika portalu: kopiowanie kodu, checklisty, statusy, dashboard, wyniki. */
(function () {
  var C = window.COURSE || { blocks: [], tasks: [] };
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function root() { return document.body.getAttribute('data-root') || ''; }
  function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }
  function fmtTime(sec) { var m = Math.round((sec || 0) / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; }
  function fmtDate(iso) { if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString('pl-PL') + ' ' + d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }); }

  /* ---- kopiowanie kodu ---- */
  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else { fallback(); }
  }
  function initCopy() {
    $all('.copy-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var code = b.closest('.code').querySelector('code').innerText;
        copyText(code, function (ok) {
          b.textContent = ok ? 'Skopiowano ✓' : 'Zaznacz i Ctrl+C';
          b.classList.toggle('ok', ok);
          setTimeout(function () { b.textContent = 'Kopiuj'; b.classList.remove('ok'); }, 1800);
        });
      });
    });
  }

  /* ---- checklisty ---- */
  function initChecklists() {
    $all('ul.checklist[data-key]').forEach(function (ul) {
      var key = ul.getAttribute('data-key');
      var st = Progress.getChecks(key);
      $all('input[type=checkbox]', ul).forEach(function (inp, i) {
        inp.checked = !!st[i];
        inp.addEventListener('change', function () { Progress.setCheck(key, i, inp.checked); });
      });
    });
  }
  function paintChecklists() {
    $all('ul.checklist[data-key]').forEach(function (ul) {
      var st = Progress.getChecks(ul.getAttribute('data-key'));
      $all('input[type=checkbox]', ul).forEach(function (inp, i) { inp.checked = !!st[i]; });
    });
  }

  /* ---- zadania: oznacz jako wykonane ---- */
  function paintTaskBtn(b) {
    var id = b.getAttribute('data-task');
    var done = Progress.isTaskDone(id);
    b.classList.toggle('done', done);
    b.textContent = done ? '✓ Zadanie wykonane (kliknij, aby cofnąć)' : 'Oznacz zadanie jako wykonane';
  }
  function initTaskBtns() {
    $all('.task-done-btn[data-task]').forEach(function (b) {
      paintTaskBtn(b);
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-task');
        Progress.setTaskDone(id, !Progress.isTaskDone(id));
        paintTaskBtn(b);
      });
    });
  }

  /* ---- blok: ukończony ---- */
  function paintBlockBtns(id) {
    var done = Progress.isDone(id);
    $all('.block-done-btn').forEach(function (b) {
      b.classList.toggle('done', done);
      b.textContent = done ? '✓ Blok ukończony — cofnij' : '✓ Oznacz blok jako ukończony';
    });
    var st = $('#block-status');
    if (st) { st.textContent = done ? 'Ukończony' : 'W trakcie'; st.className = 'badge ' + (done ? 'ok' : ''); }
  }
  function initBlock() {
    var id = document.body.getAttribute('data-block');
    if (!id) return;
    Progress.visit(id);
    paintBlockBtns(id);
    initTimer(id);
    $all('.block-done-btn').forEach(function (b) {
      b.addEventListener('click', function () { Progress.setDone(id, !Progress.isDone(id)); paintBlockBtns(id); });
    });
  }

  /* ---- czas pracy: liczony, gdy strona bloku jest widoczna i uczeń był aktywny w ostatnich 3 min ---- */
  var TICK = 20, IDLE = 180000;
  function initTimer(id) {
    var lastAct = Date.now();
    function act() { lastAct = Date.now(); }
    ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'].forEach(function (ev) {
      window.addEventListener(ev, act, { passive: true });
    });
    setInterval(function () {
      if (document.visibilityState === 'visible' && Date.now() - lastAct < IDLE) Progress.addTime(id, TICK);
    }, TICK * 1000);
  }

  /* ---- dashboard ---- */
  function statusLabel(s) {
    return s === 'done' ? ['Ukończony', 'done'] : s === 'progress' ? ['W trakcie', 'progress-s'] : ['Nierozpoczęty', 'new'];
  }
  function courseStats() {
    var done = 0; C.blocks.forEach(function (b) { if (Progress.isDone(b.id)) done++; });
    var tasksDone = 0; C.tasks.forEach(function (t) { if (Progress.isTaskDone(t.id)) tasksDone++; });
    var quizzes = 0, qSum = 0, qMax = 0;
    var time = 0;
    C.blocks.forEach(function (b) { var q = Progress.quiz(b.id); if (q) { quizzes++; qSum += q.best; qMax += q.max; } time += Progress.time(b.id); });
    return { done: done, total: C.blocks.length, tasksDone: tasksDone, tasksTotal: C.tasks.length, quizzes: quizzes, qSum: qSum, qMax: qMax, time: time };
  }
  function renderHome() {
    var host = $('#dash'); if (!host) return;
    var s = courseStats();
    $('#course-pct').textContent = pct(s.done, s.total) + '%';
    $('#course-bar').style.width = pct(s.done, s.total) + '%';
    $('#course-done').textContent = s.done + ' / ' + s.total;
    $('#course-tasks').textContent = s.tasksDone + ' / ' + s.tasksTotal;
    $('#course-quiz').textContent = s.qMax ? pct(s.qSum, s.qMax) + '%' : '—';
    var phases = { 1: 'Faza I — przypomnienie i wyrównanie poziomu', 2: 'Faza II — łączenie umiejętności', 3: 'Faza III — tryb egzaminacyjny' };
    var html = '';
    [1, 2, 3].forEach(function (ph) {
      html += '<h2 class="phase-title">' + phases[ph] + '</h2><div class="cards">';
      C.blocks.filter(function (b) { return b.phase === ph; }).forEach(function (b) {
        var st = Progress.status(b.id), lab = statusLabel(st), q = Progress.quiz(b.id);
        var n = C.tasks.filter(function (t) { return t.block === b.id; });
        var nd = n.filter(function (t) { return Progress.isTaskDone(t.id); }).length;
        html += '<div class="card"><div class="muted small">Blok ' + b.num + ' · 4 × 45 min</div>' +
          '<h3>' + esc(b.title) + '</h3><div class="small">' + esc(b.short) + '</div>' +
          '<div class="status ' + lab[1] + '">' + lab[0] + '</div>' +
          '<div class="small muted">Zadania: ' + nd + '/' + n.length + ' · Mini-test: ' + (q ? q.best + '/' + q.max : '—') + '</div>' +
          '<div class="foot"><a class="btn" href="bloki/' + b.file + '">' + (st === 'new' ? 'Rozpocznij' : st === 'done' ? 'Otwórz' : 'Kontynuuj') + '</a></div></div>';
      });
      html += '</div>';
    });
    host.innerHTML = html;
  }

  /* ---- Moje wyniki ---- */
  function renderResults() {
    var host = $('#results'); if (!host) return;
    var s = courseStats();
    var h = '<div class="stats">' +
      '<div class="stat">Postęp kursu<b>' + pct(s.done, s.total) + '%</b></div>' +
      '<div class="stat">Ukończone bloki<b>' + s.done + ' / ' + s.total + '</b></div>' +
      '<div class="stat">Zadania wykonane<b>' + s.tasksDone + ' / ' + s.tasksTotal + '</b></div>' +
      '<div class="stat">Mini-testy (najlepsze)<b>' + (s.qMax ? s.qSum + ' / ' + s.qMax : '—') + '</b></div>' +
      '<div class="stat">Czas pracy w blokach<b>' + fmtTime(s.time) + '</b></div></div>' +
      '<div class="progress"><div style="width:' + pct(s.done, s.total) + '%"></div></div>';
    h += '<h2>Bloki i mini-testy</h2><div class="table-wrap"><table><thead><tr><th>Blok</th><th>Status</th><th>Mini-test (ostatni)</th><th>Najlepszy</th><th>Podejść</th><th>Zadania</th><th>Czas</th></tr></thead><tbody>';
    C.blocks.forEach(function (b) {
      var lab = statusLabel(Progress.status(b.id)), q = Progress.quiz(b.id);
      var n = C.tasks.filter(function (t) { return t.block === b.id; });
      var nd = n.filter(function (t) { return Progress.isTaskDone(t.id); }).length;
      h += '<tr><td>' + b.num + '. ' + esc(b.title) + '</td><td>' + lab[0] + (Progress.data().blocks[b.id] && Progress.data().blocks[b.id].doneAt ? '<br><span class="small muted">' + fmtDate(Progress.data().blocks[b.id].doneAt) + '</span>' : '') + '</td>' +
        '<td>' + (q ? q.score + '/' + q.max : '—') + '</td><td>' + (q ? q.best + '/' + q.max : '—') + '</td><td>' + (q ? q.attempts : 0) + '</td><td>' + nd + '/' + n.length + '</td><td>' + (Progress.time(b.id) ? fmtTime(Progress.time(b.id)) : '—') + '</td></tr>';
    });
    h += '</tbody></table></div>';
    h += '<h2>Zadania kontrolne (INF.04 i próbne egzaminy)</h2><div class="table-wrap"><table><thead><tr><th>Blok</th><th>Zadanie</th><th>Status</th></tr></thead><tbody>';
    C.tasks.filter(function (t) { return t.kind === 'exam' || t.kind === 'mock'; }).forEach(function (t) {
      var d = Progress.data().tasks[t.id];
      h += '<tr><td>' + t.num + '</td><td>' + esc(t.title) + '</td><td>' + (d ? '✓ wykonane <span class="small muted">' + fmtDate(d) + '</span>' : '—') + '</td></tr>';
    });
    h += '</tbody></table></div>';
    host.innerHTML = h;
    var pd = $('#print-date'); if (pd) pd.textContent = new Date().toLocaleString('pl-PL');
  }

  /* ---- lista zadań ---- */
  function renderTasks() {
    $all('[data-task-status]').forEach(function (td) {
      var d = Progress.data().tasks[td.getAttribute('data-task-status')];
      td.innerHTML = d ? '✓ <span class="small muted">' + fmtDate(d) + '</span>' : '—';
    });
  }

  /* ---- reset ---- */
  function initReset() {
    var b = $('#reset-btn'); if (!b) return;
    var row = $('#reset-confirm');
    b.addEventListener('click', function () { row.classList.add('show'); });
    $('#reset-no').addEventListener('click', function () { row.classList.remove('show'); });
    $('#reset-yes').addEventListener('click', function () {
      Progress.reset(); row.classList.remove('show'); renderResults(); renderHome();
      var m = $('#reset-msg'); if (m) { m.textContent = 'Postęp został wyczyszczony.'; }
    });
  }

  /* ---- odświeżenie po synchronizacji (js/sync.js) ---- */
  function refreshAll() {
    paintChecklists();
    $all('.task-done-btn[data-task]').forEach(paintTaskBtn);
    var bid = document.body.getAttribute('data-block');
    if (bid) paintBlockBtns(bid);
    renderHome(); renderResults(); renderTasks();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!Progress.storageOk()) { var w = $('.storage-warn'); if (w) w.style.display = 'block'; }
    initCopy(); initChecklists(); initTaskBtns(); initBlock(); renderHome(); renderResults(); renderTasks(); initReset();
    $all('.print-btn').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });
    document.addEventListener('quiz-saved', function () { renderResults(); });
    document.addEventListener('progress-synced', refreshAll);
  });
})();
