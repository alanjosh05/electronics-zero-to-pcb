// Interactive widgets. Any element with data-widget="name" gets built here.
// Each widget: a little calculator/simulator with instant feedback.
(function () {
  const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
  const nextE12 = (r) => { for (let d = 1; d <= 1e7; d *= 10) for (const v of E12) if (v * d >= r - 1e-9) return v * d; };
  const fmtR = (r) => r >= 1e6 ? +(r / 1e6).toFixed(2) + ' MΩ' : r >= 1000 ? +(r / 1000).toFixed(2) + ' kΩ' : +r.toFixed(1) + ' Ω';
  const out = 'pop-card bg-sheet px-4 py-3 text-sm space-y-1';
  const slider = (id, label, min, max, step, val) =>
    `<label class="block text-xs">${label}: <b id="${id}v"></b><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
  const select = (id, label, opts) =>
    `<label class="block text-xs">${label}<select id="${id}" class="mt-1 w-full border border-ink rounded-lg bg-sheet px-2 py-1.5">${opts.map(([v, t, sel]) => `<option value="${v}" ${sel ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`;
  const $ = (root, id) => root.querySelector('#' + id);
  const wire = (root, ids, fn) => { ids.forEach((id) => { const el = $(root, id); el.oninput = el.onchange = fn; }); fn(); };

  const W = {
    // ---------- voltage divider ----------
    divider(root) {
      root.innerHTML = `<div class="text-sm font-bold">Voltage divider</div>
        <svg viewBox="0 0 300 150" class="w-full max-w-xs mx-auto">
          <text x="10" y="20" font-size="11" font-weight="700" id="dvin">Vin</text>
          <line x1="60" y1="15" x2="150" y2="15" stroke="#1d1b18" stroke-width="2"/><line x1="150" y1="15" x2="150" y2="30" stroke="#1d1b18" stroke-width="2"/>
          <rect x="138" y="30" width="24" height="36" fill="#fcdcbd" stroke="#1d1b18" stroke-width="2"/><text x="170" y="52" font-size="11" font-weight="700">R1</text>
          <line x1="150" y1="66" x2="150" y2="84" stroke="#1d1b18" stroke-width="2"/><line x1="150" y1="75" x2="230" y2="75" stroke="#d0683a" stroke-width="2"/>
          <text x="235" y="79" font-size="11" font-weight="800" fill="#d0683a" id="dvout">Vout</text>
          <rect x="138" y="84" width="24" height="36" fill="#fcdcbd" stroke="#1d1b18" stroke-width="2"/><text x="170" y="106" font-size="11" font-weight="700">R2</text>
          <line x1="150" y1="120" x2="150" y2="140" stroke="#1d1b18" stroke-width="2"/><text x="120" y="148" font-size="10">GND</text>
        </svg>
        ${slider('dvi', 'Vin', 1, 12, 0.1, 5)}${slider('dr1', 'R1 (top)', 100, 20000, 100, 1000)}${slider('dr2', 'R2 (bottom)', 100, 20000, 100, 2000)}
        <div class="${out}" id="dvo"></div>`;
      wire(root, ['dvi', 'dr1', 'dr2'], () => {
        const vi = +$(root, 'dvi').value, r1 = +$(root, 'dr1').value, r2 = +$(root, 'dr2').value, vo = vi * r2 / (r1 + r2);
        $(root, 'dviv').textContent = vi.toFixed(1) + ' V'; $(root, 'dr1v').textContent = fmtR(r1); $(root, 'dr2v').textContent = fmtR(r2);
        $(root, 'dvin').textContent = vi.toFixed(1) + 'V'; $(root, 'dvout').textContent = vo.toFixed(2) + 'V';
        $(root, 'dvo').innerHTML = `Vout = Vin × R2 ÷ (R1 + R2) = <b class="text-rust text-lg">${vo.toFixed(2)} V</b><br><span class="text-xs text-muted">Try: 5 V, R1 = 1 kΩ, R2 = 2 kΩ → 3.33 V (a 5 V → 3.3 V signal shifter)</span>`;
      });
    },

    // ---------- battery life + power ----------
    battery(root) {
      root.innerHTML = `<div class="text-sm font-bold">How long will my battery last?</div>
        ${slider('bc', 'Battery capacity', 100, 5000, 50, 2000)}${slider('bi', 'Your gadget draws', 1, 500, 1, 80)}${slider('bv', 'Battery voltage', 1.2, 12, 0.1, 3.7)}
        <div class="${out}" id="bo"></div>
        <p class="text-[11px] text-muted">Ideal maths. Real batteries give less, especially at high current or in the cold.</p>`;
      wire(root, ['bc', 'bi', 'bv'], () => {
        const c = +$(root, 'bc').value, i = +$(root, 'bi').value, v = +$(root, 'bv').value, h = c / i;
        $(root, 'bcv').textContent = c + ' mAh'; $(root, 'biv').textContent = i + ' mA'; $(root, 'bvv').textContent = v.toFixed(1) + ' V';
        $(root, 'bo').innerHTML = `Runtime ≈ ${c} ÷ ${i} = <b class="text-rust text-lg">${h >= 48 ? (h / 24).toFixed(1) + ' days' : h.toFixed(1) + ' hours'}</b><br>Power used: P = V × I = ${v.toFixed(1)} × ${(i / 1000).toFixed(3)} = <b>${(v * i).toFixed(0)} mW</b><br>Energy stored ≈ ${(c * v / 1000).toFixed(1)} Wh`;
      });
    },

    // ---------- RC charging ----------
    rc(root) {
      root.innerHTML = `<div class="text-sm font-bold">Filling the bucket (RC charging)</div>
        <svg viewBox="0 0 320 150" class="w-full"><line x1="30" y1="130" x2="310" y2="130" stroke="#1d1b18"/><line x1="30" y1="10" x2="30" y2="130" stroke="#1d1b18"/>
          <line x1="30" y1="30" x2="310" y2="30" stroke="#c6bbac" stroke-dasharray="4 4"/><text x="34" y="26" font-size="9" fill="#6f6961">100%</text>
          <line x1="30" y1="67" x2="310" y2="67" stroke="#c6bbac" stroke-dasharray="2 4"/><text x="34" y="63" font-size="9" fill="#6f6961">63%</text>
          <path id="rcp" fill="none" stroke="#d0683a" stroke-width="3"/><line id="rct" y1="20" y2="130" stroke="#1f63a0" stroke-dasharray="3 3"/>
          <text id="rctl" y="145" font-size="9" fill="#1f63a0">τ</text><text x="250" y="145" font-size="9" fill="#6f6961">time → 1 s</text></svg>
        ${select('rcr', 'Resistor R', [[1000, '1 kΩ'], [10000, '10 kΩ', 1], [100000, '100 kΩ']])}
        ${select('rcc', 'Capacitor C', [[1e-6, '1 µF'], [10e-6, '10 µF', 1], [100e-6, '100 µF']])}
        <div class="${out}" id="rco"></div>`;
      wire(root, ['rcr', 'rcc'], () => {
        const tau = +$(root, 'rcr').value * +$(root, 'rcc').value, T = 1, pts = [];
        for (let k = 0; k <= 100; k++) { const t = T * k / 100; pts.push(`${30 + 280 * k / 100},${130 - 100 * (1 - Math.exp(-t / tau))}`); }
        $(root, 'rcp').setAttribute('d', 'M' + pts.join(' L'));
        const x = 30 + 280 * Math.min(tau / T, 1);
        ['x1', 'x2'].forEach((a) => $(root, 'rct').setAttribute(a, x)); $(root, 'rctl').setAttribute('x', x - 3);
        $(root, 'rco').innerHTML = `τ = R × C = <b class="text-rust text-lg">${tau >= 1 ? tau.toFixed(2) + ' s' : (tau * 1000).toFixed(1) + ' ms'}</b><br>After 1τ: 63% full · after 5τ: basically full (≈99%)${tau > T ? '<br><span class="text-xs text-muted">τ is off this 1 s chart, so the curve is still climbing.</span>' : ''}`;
      });
    },

    // ---------- BJT base resistor ----------
    basecalc(root) {
      root.innerHTML = `<div class="text-sm font-bold">NPN switch: base resistor</div>
        ${select('bp', 'Pin voltage', [[3.3, '3.3 V (ESP32)'], [5, '5 V (Uno)', 1]])}
        ${slider('bl', 'Load current (what the motor/LEDs need)', 10, 200, 5, 100)}
        <div class="${out}" id="bo2"></div>
        <p class="text-[11px] text-muted">Rule of thumb for a hard "on" switch: give the base about 1/10 of the load current, and assume ≈ 0.7 V across base→emitter.</p>`;
      wire(root, ['bp', 'bl'], () => {
        const vp = +$(root, 'bp').value, il = +$(root, 'bl').value, ib = il / 10, r = (vp - 0.7) / (ib / 1000);
        const E = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82]; let pick = 10;
        for (let d = 1; d <= 1e6; d *= 10) for (const v of E) if (v * d <= r) pick = v * d; // round DOWN → a bit more base current
        $(root, 'blv').textContent = il + ' mA';
        $(root, 'bo2').innerHTML = `Base current ≈ ${il} ÷ 10 = ${ib.toFixed(1)} mA<br>R = (${vp} − 0.7) ÷ ${(ib / 1000).toFixed(4)} = ${fmtR(r)}<br>Use: <b class="text-rust text-lg">${fmtR(pick)}</b> <span class="text-xs">(round <b>down</b> here, so the tap opens fully)</span><br>${ib > 20 ? '<b class="text-danger">Too much for one pin. Use a MOSFET instead (lesson 08).</b>' : '✅ Pin current is under ~20 mA. Safe.'}`;
      });
    },

    // ---------- LDO heat vs buck ----------
    ldo(root) {
      root.innerHTML = `<div class="text-sm font-bold">LDO or buck?</div>
        ${slider('lvi', 'Input voltage', 3.6, 12, 0.1, 5)}${slider('li', 'Load current', 10, 1000, 10, 300)}
        <div class="${out}" id="lo"></div>`;
      wire(root, ['lvi', 'li'], () => {
        const vi = +$(root, 'lvi').value, i = +$(root, 'li').value / 1000, vo = 3.3, p = (vi - vo) * i, eff = vo / vi * 100, pb = vo * i / 0.9 - vo * i;
        $(root, 'lviv').textContent = vi.toFixed(1) + ' V'; $(root, 'liv').textContent = (i * 1000).toFixed(0) + ' mA';
        const drop = vi - vo < 1.3;
        $(root, 'lo').innerHTML = `<b>LDO (e.g. AMS1117-3.3):</b> wastes (${vi.toFixed(1)} − 3.3) × ${i.toFixed(2)} A = <b class="${p > 0.8 ? 'text-danger' : 'text-rust'} text-lg">${(p * 1000).toFixed(0)} mW</b> as heat · efficiency ≈ ${eff.toFixed(0)}%<br>
        ${drop ? '<b class="text-danger">⚠ Input is too close to 3.3 V: the AMS1117 needs about 1.1–1.3 V of headroom. Pick a true low-dropout part.</b><br>' : ''}
        <b>Buck (assume ~90%):</b> wastes ≈ ${(pb * 1000).toFixed(0)} mW<br>
        <span class="text-xs">${p > 0.8 ? '🔥 Too hot for a small LDO package. Use a buck.' : p > 0.4 ? '🤔 LDO works but gets warm. Give it copper to cool on.' : '✅ An LDO is fine here: simple, quiet, cheap.'}</span>`;
      });
    },

    // ---------- ADC ----------
    adc(root) {
      root.innerHTML = `<div class="text-sm font-bold">Voltage → number (ADC)</div>
        ${select('ab', 'Board', [['10,5', 'Arduino Uno: 10-bit, 0–5 V', 1], ['12,3.3', 'ESP32: 12-bit, ~0–3.3 V*']])}
        ${slider('av', 'Voltage on the pin', 0, 5, 0.01, 2.5)}
        <div class="h-5 rounded-full border border-ink bg-sheet overflow-hidden"><div id="abar" class="h-full bg-rust"></div></div>
        <div class="${out}" id="ao"></div>
        <p class="text-[11px] text-muted">*ESP32 needs attenuation set to read up to ~3.3 V, and it's less linear near the ends.</p>`;
      wire(root, ['ab', 'av'], () => {
        const [bits, ref] = $(root, 'ab').value.split(',').map(Number), max = 2 ** bits - 1;
        $(root, 'av').max = ref; let v = Math.min(+$(root, 'av').value, ref);
        const n = Math.round(v / ref * max);
        $(root, 'avv').textContent = v.toFixed(2) + ' V'; $(root, 'abar').style.width = (n / max * 100) + '%';
        $(root, 'ao').innerHTML = `reading = V ÷ ${ref} × ${max} = <b class="text-rust text-lg">${n}</b> (out of 0–${max})<br><span class="text-xs">Each step ≈ ${(ref / (max + 1) * 1000).toFixed(2)} mV</span>`;
      });
    },

    // ---------- PWM ----------
    pwm(root) {
      root.innerHTML = `<div class="text-sm font-bold">PWM: fake "half power" by blinking fast</div>
        <svg viewBox="0 0 320 90" class="w-full"><path id="pw" fill="none" stroke="#d0683a" stroke-width="3"/><line x1="0" y1="80" x2="320" y2="80" stroke="#c6bbac"/></svg>
        <div class="flex items-center gap-4"><div id="pled" class="w-12 h-12 rounded-full border-2 border-ink"></div><div class="flex-1">${slider('pd', 'Duty cycle', 0, 100, 1, 30)}</div></div>
        <div class="${out}" id="po"></div>`;
      wire(root, ['pd'], () => {
        const d = +$(root, 'pd').value, per = 64; let p = 'M0,80';
        for (let x = 0; x < 320; x += per) { const on = per * d / 100; p += ` L${x},80 L${x},15 L${x + on},15 L${x + on},80 L${x + per},80`; }
        $(root, 'pw').setAttribute('d', d === 0 ? 'M0,80 L320,80' : p);
        $(root, 'pdv').textContent = d + '%';
        $(root, 'pled').style.background = `rgba(255,90,60,${0.08 + d / 100 * 0.92})`;
        $(root, 'pled').style.boxShadow = `0 0 ${d / 4}px rgba(255,90,60,.9)`;
        $(root, 'po').innerHTML = `On ${d}% of the time → average ≈ <b class="text-rust">${(5 * d / 100).toFixed(2)} V</b> from a 5 V pin<br>Arduino: <code>analogWrite(pin, ${Math.round(d / 100 * 255)})</code> (0–255)`;
      });
    },

    // ---------- trace width (IPC-2221, external layer) ----------
    trace(root) {
      root.innerHTML = `<div class="text-sm font-bold">How wide should this trace be? (IPC-2221, outer layer)</div>
        ${slider('ti', 'Current', 0.1, 5, 0.1, 1)}${select('tc', 'Copper', [[1, '1 oz (standard)', 1], [2, '2 oz']])}${select('tt', 'Allowed temperature rise', [[10, '10 °C (safe)', 1], [20, '20 °C']])}
        <div class="${out}" id="to"></div>
        <p class="text-[11px] text-muted">IPC-2221 is deliberately cautious. Small signals: 0.25 mm is a comfortable default. Check your fab's minimum.</p>`;
      wire(root, ['ti', 'tc', 'tt'], () => {
        const I = +$(root, 'ti').value, oz = +$(root, 'tc').value, dT = +$(root, 'tt').value;
        const A = Math.pow(I / (0.048 * Math.pow(dT, 0.44)), 1 / 0.725), wMil = A / (1.378 * oz), mm = wMil * 0.0254;
        $(root, 'tiv').textContent = I.toFixed(1) + ' A';
        $(root, 'to').innerHTML = `Minimum width ≈ <b class="text-rust text-lg">${mm.toFixed(2)} mm</b> (${wMil.toFixed(1)} mil)<br><span class="text-xs">Round up generously: ${Math.max(0.25, Math.ceil(mm * 1.5 * 20) / 20).toFixed(2)} mm is a comfy choice.</span>`;
      });
    },

    // ---------- multimeter dial ----------
    meter(root) {
      const tasks = [
        ['Is my USB port really giving 5 V?', 'V⎓', 'COM + VΩmA', 'Across (parallel): red on +, black on −'],
        ['What value is this unmarked resistor?', 'Ω', 'COM + VΩmA', 'Across the part, with the power OFF'],
        ['Is this wire broken inside?', '🔊 continuity', 'COM + VΩmA', 'One probe on each end; beep = connected'],
        ['How much current does my LED draw?', 'A⎓ (mA)', 'COM + mA', 'In series: break the loop and put the meter in it'],
        ['How much current does my motor draw (≈1 A)?', 'A⎓ (10 A)', 'COM + 10A', 'In series, using the unfused/10 A jack'],
      ];
      root.innerHTML = `<div class="text-sm font-bold">Pick the dial setting</div>
        ${select('mt', 'I want to know…', tasks.map((t, i) => [i, t[0], i === 0]))}
        <div class="grid grid-cols-3 gap-2 text-center text-xs" id="mopts"></div>
        <div class="${out}" id="mo">Choose a setting ↑</div>`;
      const dials = ['V⎓', 'Ω', '🔊 continuity', 'A⎓ (mA)', 'A⎓ (10 A)', 'V~'];
      const draw = () => {
        const t = tasks[+$(root, 'mt').value];
        $(root, 'mopts').innerHTML = dials.map((d) => `<button class="btn justify-center" data-d="${d}">${d}</button>`).join('');
        $(root, 'mo').textContent = 'Choose a setting ↑';
        root.querySelectorAll('[data-d]').forEach((b) => b.onclick = () => {
          const ok = b.dataset.d === t[1];
          b.style.background = ok ? '#cfe3b2' : '#f3c4bc';
          $(root, 'mo').innerHTML = ok ? `✅ <b>${t[1]}</b>. Probes: <b>${t[2]}</b>. How: ${t[3]}.` : `✘ Not that one. Think: are you measuring push, squeeze, a connection, or flow?`;
        });
      };
      $(root, 'mt').onchange = draw; draw();
    },
  };

  document.querySelectorAll('[data-widget]').forEach((el) => { const f = W[el.dataset.widget]; if (f) f(el); });
})();
