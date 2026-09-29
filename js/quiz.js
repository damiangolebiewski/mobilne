/* Mini-testy: dane w <script type="application/json"> wewnątrz .quiz */
(function () {
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function render(box) {
    var id = box.getAttribute('data-quiz');
    var data = JSON.parse(box.querySelector('script[type="application/json"]').textContent);
    var form = el('div', 'quiz-body');
    data.forEach(function (q, qi) {
      var wrap = el('div', 'quiz-q');
      wrap.appendChild(el('div', 'q-text', (qi + 1) + '. ' + q.q));
      q.o.forEach(function (opt, oi) {
        var lab = el('label');
        var inp = document.createElement('input');
        inp.type = 'radio'; inp.name = id + '-q' + qi; inp.value = oi;
        lab.appendChild(inp);
        var span = el('span', null, ' ' + opt);
        lab.appendChild(span);
        wrap.appendChild(lab);
      });
      wrap.appendChild(el('div', 'why', q.e));
      form.appendChild(wrap);
    });
    var res = el('div', 'quiz-result');
    var btn = el('button', 'btn', 'Sprawdź odpowiedzi'); btn.type = 'button';
    var again = el('button', 'btn secondary', 'Rozwiąż ponownie'); again.type = 'button'; again.style.display = 'none'; again.style.marginLeft = '.5rem';
    box.appendChild(form); box.appendChild(btn); box.appendChild(again); box.appendChild(res);

    var prev = window.Progress && Progress.quiz(id);
    if (prev) res.textContent = 'Poprzedni wynik: ' + prev.score + '/' + prev.max + ' (najlepszy: ' + prev.best + '/' + prev.max + ', podejść: ' + prev.attempts + ')';

    btn.addEventListener('click', function () {
      var score = 0, answered = 0;
      data.forEach(function (q, qi) {
        var wrap = form.children[qi];
        var sel = wrap.querySelector('input:checked');
        wrap.classList.remove('correct', 'wrong');
        wrap.classList.add('checked');
        var labels = wrap.querySelectorAll('label');
        labels.forEach(function (l, li) { l.classList.toggle('is-answer', li === q.a); });
        if (sel) answered++;
        if (sel && Number(sel.value) === q.a) { score++; wrap.classList.add('correct'); } else { wrap.classList.add('wrong'); }
        wrap.querySelectorAll('input').forEach(function (i) { i.disabled = true; });
      });
      res.textContent = 'Wynik: ' + score + ' / ' + data.length + (answered < data.length ? ' (bez odpowiedzi: ' + (data.length - answered) + ')' : '');
      if (window.Progress) Progress.saveQuiz(id, score, data.length);
      btn.style.display = 'none'; again.style.display = '';
      document.dispatchEvent(new CustomEvent('quiz-saved', { detail: { id: id } }));
    });
    again.addEventListener('click', function () {
      form.querySelectorAll('.quiz-q').forEach(function (w) {
        w.classList.remove('correct', 'wrong', 'checked');
        w.querySelectorAll('input').forEach(function (i) { i.disabled = false; i.checked = false; });
        w.querySelectorAll('label').forEach(function (l) { l.classList.remove('is-answer'); });
      });
      res.textContent = ''; btn.style.display = ''; again.style.display = 'none';
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.quiz[data-quiz]').forEach(render);
  });
})();
