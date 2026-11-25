// Builds reference/component-field-guide.html from the cards inside every lesson.
const fs = require('fs'), path = require('path');
const root = process.argv[2];
const window = {};
eval(fs.readFileSync(path.join(root, 'assets/course.js'), 'utf8'));
const { COURSE, SRC } = window;
const cite = (s) => String(s || '').replace(/\{\{(\w+)\}\}/g, (_, k) => SRC[k] ? `<a class="cite" href="${SRC[k][1]}">[${SRC[k][0]}]</a>` : '');
const pad = (n) => String(n).padStart(2, '0');
const cards = [
  { n: 1, name: 'Resistor', sub: 'the foot on the hose', color: 'bg-peach', use: 'limiting current (LEDs, protecting pins), dividers, pull-ups.', rules: 'R = (V<sub>supply</sub> − V<sub>part</sub>) ÷ I → round <b>up</b> to E12 (10 12 15 18 22 27 33 39 47 56 68 82) · power rating ≥ 2× heat · bands: red-red-brown 220 Ω, orange-orange-brown 330 Ω, brown-black-red 1 kΩ. {{en_e12}}' },
  { n: 1, name: 'LED', sub: 'the greedy one-way light', color: 'bg-leaf', use: 'status lights: power, listening, error.', rules: 'long leg = anode = + · always with a resistor · 5–20 mA · red ≈ 2 V, blue/white ≈ 3 V. {{sf_led}}' },
];
for (const l of COURSE.lessons.filter((x) => x.n > 1)) {
  const html = fs.readFileSync(path.join(root, 'lessons', l.file), 'utf8');
  const m = html.match(/window\.LESSON = (\{[\s\S]*?\n\});/);
  if (!m) throw new Error('no LESSON in ' + l.file);
  const L = eval('(' + m[1] + ')');
  (L.cards || []).forEach((c) => cards.push({ ...c, n: l.n }));
}
const lookup = [
  ['limit current / protect a pin or LED', 'Resistor', 1], ['show a status light', 'LED + resistor', 1],
  ['measure what\'s going on', 'Multimeter', 2], ['scale a 5 V signal down to 3.3 V (one way)', 'Voltage divider', 3],
  ['run from a battery', 'Battery (+ charger/protection for Li-ion)', 4], ['keep a chip\'s power clean', '100 nF ceramic cap per power pin', 5],
  ['smooth the board\'s power input', 'Electrolytic / bulk cap', 5], ['survive a backwards battery', 'Schottky diode (or P-MOSFET)', 6],
  ['protect a transistor from a coil\'s kick', 'Flyback diode', 6], ['protect USB lines from static', 'TVS diode', 6],
  ['switch a small load from a 5 V pin', 'NPN transistor', 7], ['switch / dim a big load from 3.3 V', 'Logic-level N-MOSFET', 8],
  ['read a button reliably', 'Pull-up resistor (or INPUT_PULLUP) + debounce', 9], ['add a knob', 'Potentiometer', 10],
  ['sense light / temperature cheaply', 'LDR / thermistor + fixed resistor', 10], ['switch a separate circuit', 'Relay (+ transistor + diode)', 11],
  ['spin something', 'DC motor + MOSFET + diode (H-bridge to reverse)', 11], ['turn 5 V into 3.3 V (small load)', 'LDO regulator', 12],
  ['big voltage drop or big current', 'Buck converter', 12], ['take power from USB-C', '2 × 5.1 kΩ CC resistors', 12],
  ['run code and talk to my app', 'ESP32-S3 module', 13], ['connect 5 V and 3.3 V chips (two-way)', 'Level shifter (BSS138)', 13],
  ['connect a sensor/display/mic', 'I²C / SPI / UART / I²S', 14], ['trust a new part', 'Its datasheet: the five numbers', 15],
];
const byLesson = (n) => COURSE.lessons.find((l) => l.n === n);
const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Component Field Guide: which part, when</title>
<script src="https://cdn.tailwindcss.com"></script><script src="../assets/theme.js"></script>
<link rel="stylesheet" href="../assets/course.css" />
</head>
<body class="min-h-screen">
<!-- GENERATED from the lessons' cards. Rebuild instead of hand-editing (see NOTES.md). -->
<main class="max-w-5xl mx-auto px-6 py-10 space-y-8">
  <header class="space-y-2">
    <a href="../index.html" class="text-xs underline no-print">← Course map</a>
    <span class="chip bg-peach">REFERENCE</span>
    <h1 class="text-3xl font-extrabold">Component Field Guide</h1>
    <p class="text-sm text-muted">"I need to ___" → which part, and the rules for using it. Keep this open while you design. Every card links back to its lesson.</p>
  </header>

  <section class="pop-card p-5 grid sm:grid-cols-3 gap-4 text-sm">
    <div><div class="text-xs text-muted">PUSH</div><b>Voltage · V · volts</b></div>
    <div><div class="text-xs text-muted">FLOW</div><b>Current · I · amps</b> (1 A = 1000 mA)</div>
    <div><div class="text-xs text-muted">SQUEEZE</div><b>Resistance · R · ohms Ω</b></div>
    <div class="sm:col-span-3 text-center font-extrabold border-t border-line pt-3">V = I × R · P = V × I · LED: R = (Vs − Vf) ÷ I · divider: Vout = Vin × R2 ÷ (R1+R2) · τ = R × C</div>
  </section>

  <section class="pop-card p-5">
    <h2 class="font-extrabold mb-3">I need to…</h2>
    <table class="w-full text-sm"><tbody class="divide-y divide-line">
      ${lookup.map(([need, part, n]) => `<tr><td class="py-2 pr-4">${need}</td><td class="py-2 font-bold">${part}</td><td class="py-2 text-xs text-right"><a class="underline" href="../lessons/${byLesson(n).file}">lesson ${pad(n)}</a></td></tr>`).join('\n      ')}
    </tbody></table>
  </section>

  <section class="grid sm:grid-cols-2 gap-5">
    ${cards.map((c) => `<article class="pop-card p-5 space-y-2 text-sm break-inside-avoid">
      <div class="flex items-center gap-2 flex-wrap"><span class="chip ${c.color || 'bg-peach'}">${pad(c.n)}</span><h3 class="font-extrabold text-base">${c.name}</h3><span class="text-muted text-xs">· ${c.sub}</span></div>
      <p><b>Use when:</b> ${cite(c.use)}</p>
      <p><b>Rules:</b> ${cite(c.rules)}</p>
      <a class="text-xs underline no-print" href="../lessons/${byLesson(c.n).file}">→ lesson ${pad(c.n)} · ${byLesson(c.n).title}</a>
    </article>`).join('\n    ')}
  </section>
</main>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'reference/component-field-guide.html'), out);
console.log('cards:', cards.length);
