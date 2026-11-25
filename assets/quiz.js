// Retrieval-practice quiz widget.
// Markup:
// <div class="quiz" data-answer="2" data-why="Explanation shown after answering">
//   <p class="q">Question?</p>
//   <button>Option A</button><button>Option B</button>...
// </div>
// data-answer is the 0-based index of the correct button.
// A <div id="quiz-score"> anywhere on the page shows the running score.
(function () {
  const quizzes = [...document.querySelectorAll('.quiz')];
  let right = 0, answered = 0;
  const score = document.getElementById('quiz-score');
  const show = () => score && (score.textContent = answered ? `${right} / ${answered} right (of ${quizzes.length})` : `0 / ${quizzes.length} answered`);

  quizzes.forEach((q) => {
    const answer = parseInt(q.dataset.answer, 10);
    const buttons = [...q.querySelectorAll('button')];
    const why = document.createElement('p');
    why.className = 'text-xs mt-2 hidden leading-relaxed';
    q.appendChild(why);
    buttons.forEach((b, i) => {
      b.className = 'block w-full text-left text-sm px-3 py-2 my-1.5 rounded-lg border border-ink bg-sheet hover:bg-peach transition';
      b.onclick = () => {
        if (q.dataset.done) return;
        q.dataset.done = '1';
        answered++;
        const ok = i === answer;
        if (ok) right++;
        b.style.background = ok ? '#cfe3b2' : '#f3c4bc';
        buttons[answer].style.background = '#cfe3b2';
        buttons[answer].style.fontWeight = '700';
        why.innerHTML = (ok ? '✔ Yes. ' : '✘ Not quite. ') + (q.dataset.why || '');
        why.classList.remove('hidden');
        show();
      };
    });
  });
  show();
})();
