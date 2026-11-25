// Step-through lessons: one <section data-step> visible at a time, URL hash #/N,
// arrow keys + Prev/Next buttons, and a progress strip.
// Markup needed: sections with [data-step] and [data-title]; #prev, #next, #counter, #progress, #toc (optional).
(function () {
  const steps = [...document.querySelectorAll('[data-step]')];
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const counter = document.getElementById('counter');
  const progress = document.getElementById('progress');
  const toc = document.getElementById('toc');
  const pad = (n) => String(n).padStart(2, '0');

  if (progress) {
    steps.forEach((s, i) => {
      const b = document.createElement('button');
      b.className = 'h-2 flex-1 rounded-full border border-ink transition-colors';
      b.title = s.dataset.title || 'Step ' + (i + 1);
      b.onclick = () => go(i + 1);
      progress.appendChild(b);
    });
  }
  if (toc) {
    steps.forEach((s, i) => {
      const a = document.createElement('a');
      a.href = '#/' + (i + 1);
      a.className = 'block px-2 py-1 rounded-md text-xs hover:bg-card';
      a.textContent = pad(i + 1) + '  ' + (s.dataset.title || '');
      toc.appendChild(a);
    });
  }

  function current() {
    const m = location.hash.match(/#\/(\d+)/);
    const n = m ? parseInt(m[1], 10) : 1;
    return Math.min(Math.max(n, 1), steps.length);
  }
  function go(n) { location.hash = '#/' + n; }
  function render() {
    const n = current();
    steps.forEach((s, i) => s.classList.toggle('active', i === n - 1));
    if (counter) counter.textContent = pad(n) + ' / ' + pad(steps.length);
    if (prev) prev.disabled = n === 1;
    if (next) {
      next.disabled = n === steps.length;
      next.querySelector('span') && (next.querySelector('span').textContent = n === steps.length ? 'Done' : 'Next');
    }
    if (progress) [...progress.children].forEach((b, i) => {
      b.style.background = i < n ? '#d0683a' : 'transparent';
    });
    if (toc) [...toc.children].forEach((a, i) => a.classList.toggle('font-bold', i === n - 1));
    document.dispatchEvent(new CustomEvent('step', { detail: n }));
    window.scrollTo({ top: 0 });
  }
  prev && (prev.onclick = () => go(current() - 1));
  next && (next.onclick = () => go(current() + 1));
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    if (e.key === 'ArrowRight') go(Math.min(current() + 1, steps.length));
    if (e.key === 'ArrowLeft') go(Math.max(current() - 1, 1));
  });
  window.addEventListener('hashchange', render);
  render();
})();
