/* Zapis postępu ucznia w localStorage. Opcjonalna synchronizacja online: js/sync.js. */
(function () {
  var KEY = 'inf04mobile.v1';
  var memory = null; // zapas, gdy localStorage jest niedostępny
  var storageOk = true;
  var listeners = [];

  function empty() { return { blocks: {}, quiz: {}, tasks: {}, checks: {} }; }

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      return normalize(raw ? JSON.parse(raw) : empty());
    } catch (e) {
      storageOk = false;
      return memory || (memory = empty());
    }
  }
  function normalize(d) {
    d = (d && typeof d === 'object') ? d : {};
    ['blocks', 'quiz', 'tasks', 'checks'].forEach(function (k) { if (!d[k] || typeof d[k] !== 'object' || Array.isArray(d[k])) d[k] = {}; });
    return d;
  }
  // kind: 'hard' (zmiana ucznia) albo 'soft' (licznik czasu) — dla synchronizacji
  function save(d, kind) {
    try { window.localStorage.setItem(KEY, JSON.stringify(d)); }
    catch (e) { storageOk = false; memory = d; }
    if (kind !== 'silent') listeners.forEach(function (fn) { try { fn(kind || 'hard'); } catch (e) { /* ignoruj */ } });
  }
  function now() { return new Date().toISOString(); }

  var P = {
    storageOk: function () { load(); return storageOk; },
    data: load,
    visit: function (id) {
      var d = load(); d.blocks[id] = d.blocks[id] || {};
      if (!d.blocks[id].visited) d.blocks[id].visited = now();
      d.blocks[id].last = now(); save(d);
    },
    isDone: function (id) { var b = load().blocks[id]; return !!(b && b.done); },
    setDone: function (id, v) {
      var d = load(); d.blocks[id] = d.blocks[id] || {};
      d.blocks[id].done = !!v; d.blocks[id].doneAt = v ? now() : null;
      if (!d.blocks[id].visited) d.blocks[id].visited = now();
      save(d);
    },
    status: function (id) {
      var b = load().blocks[id];
      if (b && b.done) return 'done';
      if (b && b.visited) return 'progress';
      return 'new';
    },
    saveQuiz: function (id, score, max) {
      var d = load(); var q = d.quiz[id] || { attempts: 0, best: 0 };
      q.score = score; q.max = max; q.date = now(); q.attempts = (q.attempts || 0) + 1;
      q.best = Math.max(q.best || 0, score); d.quiz[id] = q; save(d);
    },
    quiz: function (id) { return load().quiz[id] || null; },
    isTaskDone: function (id) { return !!load().tasks[id]; },
    setTaskDone: function (id, v) {
      var d = load(); if (v) d.tasks[id] = now(); else delete d.tasks[id]; save(d);
    },
    getChecks: function (id) { return load().checks[id] || []; },
    setCheck: function (id, i, v) {
      var d = load(); var arr = d.checks[id] || []; arr[i] = v ? 1 : 0; d.checks[id] = arr; save(d);
    },
    addTime: function (id, sec) {
      var d = load(); d.blocks[id] = d.blocks[id] || {};
      d.blocks[id].time = (Number(d.blocks[id].time) || 0) + sec;
      d.blocks[id].last = now(); save(d, 'soft');
    },
    time: function (id) { var b = load().blocks[id]; return (b && Number(b.time)) || 0; },
    isEmpty: function () {
      var d = load();
      return !['blocks', 'quiz', 'tasks', 'checks'].some(function (k) { return Object.keys(d[k]).length; });
    },
    onChange: function (fn) { listeners.push(fn); },
    replace: function (d) { save(normalize(JSON.parse(JSON.stringify(d || empty()))), 'silent'); },
    clear: function () {
      try { window.localStorage.removeItem(KEY); } catch (e) { /* brak dostępu */ }
      memory = empty();
    },
    reset: function () {
      P.clear();
      save(empty(), 'hard');
    },
    empty: empty
  };
  window.Progress = P;
})();
