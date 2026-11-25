// Renders a lesson from window.LESSON (data) into the same step-through layout as lesson 01.
// Page needs <div id="app"></div>. Load order at end of <body>: course.js → lesson data <script> → lesson.js → stepper.js → quiz.js → widgets.js
//
// LESSON = {
//   n, steps: [{ t, chip, h, kid?, body, diagram? | widget? | tiles? | compare? }],
//   quiz: [{ q, o: [..equal-length options..], a: index, why }],
//   build: { need, steps: [..], note?, diagram? },
//   cards: [{ name, sub, use, rules, color? }],
//   source: { title, url, note },
// }
// tiles:   [{ i: '🔋', l: 'label', s: 'sub' }], tilesFlow: true → arrows between tiles
// compare: { good: { t, items: [] }, bad: { t, items: [] } }
(function () {
  const L = window.LESSON, C = window.COURSE, S = window.SRC || {};
  const pad = (n) => String(n).padStart(2, '0');
  const idx = C.lessons.findIndex((x) => x.n === L.n);
  const meta = C.lessons[idx], prevL = C.lessons[idx - 1], nextL = C.lessons[idx + 1];
  const cite = (s) => String(s || '').replace(/\{\{(\w+)\}\}/g, (_, k) =>
    S[k] ? `<a class="cite" href="${S[k][1]}" target="_blank" rel="noopener">[${S[k][0]}]</a>` : '');
  document.title = `${pad(L.n)} · ${meta.title}`;

  const grid = 'gap-8 lg:grid-cols-[minmax(0,430px)_1fr]';
  const stageCard = (inner, extra = '') => `<div class="pop-card grid-paper p-6 min-h-[340px] ${extra}">${inner}</div>`;

  function stage(s) {
    if (s.diagram) return stageCard(s.diagram, 'grid place-items-center');
    if (s.widget) return `<div class="pop-card grid-paper p-6 min-h-[340px] space-y-4" data-widget="${s.widget}"></div>`;
    if (s.tiles) {
      const parts = s.tiles.map((t) => `<div class="pop-card bg-sheet p-4 text-center min-w-[110px] flex-1">
          <div class="text-3xl">${t.i}</div><div class="text-sm font-extrabold mt-1">${cite(t.l)}</div>
          ${t.s ? `<div class="text-[11px] text-muted mt-1 leading-snug">${cite(t.s)}</div>` : ''}</div>`);
      const inner = s.tilesFlow
        ? `<div class="flex flex-wrap items-center gap-2">${parts.join('<div class="font-extrabold text-rust">→</div>')}</div>`
        : `<div class="grid grid-cols-2 gap-3">${parts.join('')}</div>`;
      return stageCard(inner + (s.caption ? `<p class="text-xs text-muted text-center mt-4">${cite(s.caption)}</p>` : ''), 'flex flex-col justify-center');
    }
    if (s.compare) {
      const col = (c, ok) => `<div class="pop-card ${ok ? 'bg-leaf' : 'bg-peach'} p-4 flex-1">
          <div class="font-extrabold text-sm mb-2">${ok ? '✅' : '❌'} ${c.t}</div>
          <ul class="text-sm space-y-1.5">${c.items.map((x) => `<li>${cite(x)}</li>`).join('')}</ul></div>`;
      return stageCard(`<div class="flex flex-col sm:flex-row gap-4">${col(s.compare.good, true)}${col(s.compare.bad, false)}</div>`, 'flex flex-col justify-center');
    }
    return '';
  }

  const steps = L.steps.map((s, i) => `
    <section data-step data-title="${s.t}" class="${grid}">
      <div class="space-y-4">
        <span class="chip bg-peach">${pad(i + 1)} · ${s.chip}</span>
        <h2 class="text-2xl font-extrabold leading-tight">${cite(s.h)}</h2>
        ${s.kid ? `<p class="kid text-sm">${cite(s.kid)}</p>` : ''}
        <div class="text-sm leading-relaxed space-y-3">${cite(s.body)}</div>
      </div>
      ${stage(s)}
    </section>`);

  // ---- quiz step ----
  if (L.quiz && L.quiz.length) {
    steps.push(`
    <section data-step data-title="Check yourself" class="${grid}">
      <div class="space-y-4">
        <span class="chip bg-peach">${pad(steps.length + 1)} · from memory</span>
        <h2 class="text-2xl font-extrabold leading-tight">Answer without scrolling back.</h2>
        <p class="text-sm leading-relaxed">Dragging an answer out of your own head is what makes it stick. A wrong guess followed by the "why" teaches more than re-reading.</p>
        <div id="quiz-score" class="chip bg-leaf"></div>
      </div>
      <div class="pop-card grid-paper p-6 space-y-6">
        ${L.quiz.map((q, i) => `<div class="quiz" data-answer="${q.a}" data-why="${q.why.replace(/"/g, '&quot;')}">
          <p class="q text-sm font-bold">${i + 1}. ${q.q}</p>${q.o.map((o) => `<button>${o}</button>`).join('')}</div>`).join('')}
      </div>
    </section>`);
  }

  // ---- build step ----
  if (L.build) {
    const b = L.build;
    steps.push(`
    <section data-step data-title="Build it" class="${grid}">
      <div class="space-y-4">
        <span class="chip bg-peach">${pad(steps.length + 1)} · hands on</span>
        <h2 class="text-2xl font-extrabold leading-tight">${b.h || 'Now do it for real.'}</h2>
        <p class="text-sm"><b>You need:</b> ${cite(b.need)}</p>
        <div class="space-y-2 text-sm">${b.steps.map((x) => `<label class="flex gap-2 items-start"><input type="checkbox" class="mt-1"> <span>${cite(x)}</span></label>`).join('')}</div>
        ${b.note ? `<p class="text-xs text-muted leading-relaxed">${cite(b.note)}</p>` : ''}
      </div>
      ${b.diagram ? stageCard(b.diagram, 'grid place-items-center') : b.widget ? `<div class="pop-card grid-paper p-6 min-h-[340px] space-y-4" data-widget="${b.widget}"></div>` : stageCard('<div class="text-6xl text-center">🛠️</div>', 'grid place-items-center')}
    </section>`);
  }

  // ---- wrap-up step ----
  const cardHTML = (c) => `<div class="pop-card p-5">
      <div class="flex items-center gap-2 mb-2"><span class="chip ${c.color || 'bg-peach'}">CARD</span><b>${c.name}</b> <span class="text-muted text-xs">· ${c.sub}</span></div>
      <p class="text-sm"><b>Use when:</b> ${cite(c.use)}</p><p class="text-sm mt-1"><b>Rules:</b> ${cite(c.rules)}</p></div>`;
  steps.push(`
    <section data-step data-title="Keep it" class="${grid}">
      <div class="space-y-4">
        <span class="chip bg-peach">${pad(steps.length + 1)} · what you now own</span>
        <h2 class="text-2xl font-extrabold leading-tight">Your win: ${meta.win.toLowerCase()}.</h2>
        <p class="text-sm leading-relaxed">These cards are also in the <a class="underline font-bold" href="../reference/component-field-guide.html">Component Field Guide</a>, the one page to keep open when you design.</p>
        <div class="pop-card bg-sheet p-4 text-sm space-y-2">
          <div class="font-bold">📖 Read next (primary source)</div>
          <a class="underline" href="${L.source.url}" target="_blank" rel="noopener">${L.source.title}</a>
          <p class="text-xs text-muted">${L.source.note}</p>
        </div>
        <div class="pop-card bg-violet p-4 text-sm"><b>🙋 Stuck or curious?</b> Ask me (your Claude teacher) anything about this lesson. Paste a photo of your breadboard or a screenshot of KiCad and I'll check it.</div>
        <div class="flex flex-wrap gap-3 items-center">
          <button id="markDone" class="btn">✓ Mark lesson complete</button>
          ${nextL ? `<a class="btn btn-primary" href="${nextL.file}">Next: ${pad(nextL.n)} ${nextL.title} →</a>` : `<a class="btn btn-primary" href="../index.html">Back to course map →</a>`}
        </div>
      </div>
      <div class="space-y-4">${(L.cards || []).map(cardHTML).join('')}</div>
    </section>`);

  document.getElementById('app').innerHTML = `
  <header class="no-print sticky top-0 z-10 bg-paper/95 backdrop-blur border-b border-line">
    <div class="max-w-6xl mx-auto px-5 py-3 flex items-center gap-4">
      <a href="../index.html" class="w-8 h-8 rounded-lg bg-rust border-[1.5px] border-ink shadow-pop grid place-items-center text-white font-extrabold text-sm">Ω</a>
      <div class="leading-tight">
        <div class="text-[11px] text-muted">${C.title} · Phase ${meta.phase}</div>
        <div class="text-sm font-bold">Lesson ${pad(L.n)} · ${meta.title}</div>
      </div>
      <nav class="ml-auto flex items-center gap-3 text-xs">
        ${prevL ? `<a href="${prevL.file}" class="underline hidden md:inline">← ${pad(prevL.n)}</a>` : ''}
        <a href="../index.html" class="underline">Course map</a>
        <a href="../reference/component-field-guide.html" class="underline">Field guide</a>
        ${nextL ? `<a href="${nextL.file}" class="underline hidden md:inline">${pad(nextL.n)} →</a>` : ''}
        <span id="counter" class="chip bg-sheet"></span>
      </nav>
    </div>
    <div class="max-w-6xl mx-auto px-5 pb-3"><div id="progress" class="flex gap-1.5"></div></div>
  </header>
  <main class="max-w-6xl mx-auto px-5 py-8">${steps.join('')}</main>
  <footer class="no-print sticky bottom-0 bg-paper/95 backdrop-blur border-t border-line">
    <div class="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
      <button id="prev" class="btn">← Prev</button>
      <span class="text-[11px] text-muted hidden sm:block">← → keys work too</span>
      <button id="next" class="btn btn-primary"><span>Next</span> →</button>
    </div>
  </footer>`;

  // completion tracking (shared with index.html)
  const KEY = 'elec:done';
  const done = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const btn = document.getElementById('markDone');
  const paint = () => { const d = done().includes(L.n); btn.textContent = d ? '✓ Completed' : '✓ Mark lesson complete'; btn.style.background = d ? '#cfe3b2' : ''; };
  btn.onclick = () => { let d = done(); d = d.includes(L.n) ? d.filter((x) => x !== L.n) : [...d, L.n]; localStorage.setItem(KEY, JSON.stringify(d)); paint(); };
  paint();
})();
