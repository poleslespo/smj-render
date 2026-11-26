// Ep.7 "Anak yang Kembali Berbeda" (Wewe Gombel) — FULL EPISODE, 25 baris, RESEP GAYA BARU ep.8.
// Basis kode: pola episode terbukti Ep.6 kuyang (armKit/legKit/shotCam/scene 3 sub-shot)
// — struktur DISALIN, isi (tokoh/set/cerita) BARU semua untuk cerita ini (Pola Kode).
// Tiap baris = 2-3 SUB-SHOT (set + kamera sendiri), potong hanya di batas frasa /
// 4 momen yang diizinkan resep; pose tokoh kontinu antar-potong (posisi dunia =
// fungsi waktu absolut). KONTINUITAS FASE AMBIEN dipertahankan: semua siklus
// ambien (kabut, api obor, debu, sway rambut wewe) pada fase waktu ABSOLUT.
// Kanon wewe gombel & audit nama: hidden_files/ep-07-wewe-gombel/audit-ep7.md.
// PR §6 yang dikerjakan di episode ini: (1) gestur menahan/memanggil = telapak
// terbuka + badan condong, BUKAN menunjuk; (2) kaki 2 segmen lutut 30-45° fase
// ayun; (4) jari telunjuk tebal 2 ruas; (5) bawah frame close-up berisi objek,
// bukan tanah kosong; (6) pusat kamera di-clamp — objek yang dibicarakan tidak
// terpotong; (7) partikel debu di-QC gerak 3 frame. No.3 (beda zaman) tidak
// muncul di cerita ini. Perbaikan temuan sendiri: KEDIP sebagai alat potong —
// vanish hantu di L13 dimarkahi kedip narator (frame gelap 0,12 dtk dari grup
// kelopak di kamera), jadi hilangnya wewe terbaca sebagai peristiwa mata,
// bukan potongan liar; dipakai konsisten dengan hukum kontinuitas.
window.buildEpisode = (world, S) => {
  const { E, tr, scene, during, prog, eout, eio, clamp, T } = S;
  const P = window.Painted;
  const GY = 1420;                       // garis tanah luar (resep §1.5); tanah s.d. y=2420
  const TAU = Math.PI * 2;
  const ein = x => x * x * x;            // ease-in jatuh (core tidak punya)
  const lerp = (a, b, e) => a + (b - a) * e;
  const d2r = d => d * Math.PI / 180;
  const st = (w, c) => ({ stroke: c || '#141021', 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const blinkAt = (t, seed) => ((t * 0.9 + seed) % 3.9) < 0.1;
  const beat = (t, t0) => Math.sin(clamp((t - t0) / .3) * Math.PI);
  const bump = (x, a, b) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); }; // ramp halus 0->1 antara a..b (pola envelope episode ini)

  /* ================= armKit — lengan 2 segmen (mekanika bersama, pola Ep.6/ep.8) =====
     place(arm, a1, a2, [Sx,Sy], point?) -> posisi telapak H.
     a1 negatif = lengan menyilang badan (defensif) — dilarang untuk gestur terbuka.
     PR §6 no.4: jari telunjuk DITEBALkan (outline 28 / kulit 18) dan 2 RUAS. */
  const armKit = (g, o = {}) => {
    const { L1 = 128, L2 = 118, wO = 38, wF = 32, shirt = '#888', shirtD = '#666', skin = '#d9a06e' } = o;
    const mk = sd => {
      const a = E('g', {}, g);
      const oP = E('path', { fill: 'none', ...st(wO) }, a);
      const f = E('path', { fill: 'none', stroke: shirt, 'stroke-width': wF, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, a);
      const cuff = E('circle', { r: 20, fill: shirtD, ...st(3.5) }, a);
      const fg1 = E('line', { ...st(28) }, a), fg1s = E('line', { stroke: skin, 'stroke-width': 18, 'stroke-linecap': 'round' }, a);
      const fg2 = E('line', { ...st(28) }, a), fg2s = E('line', { stroke: skin, 'stroke-width': 18, 'stroke-linecap': 'round' }, a);
      const hand = E('circle', { r: 21, fill: skin, ...st(3.5) }, a);
      return { o: oP, f, cuff, fg1, fg1s, fg2, fg2s, hand, sd };
    };
    const arms = { l: mk(-1), r: mk(1) };
    function place(A, a1, a2, Sx, point) {
      const El = [Sx[0] + A.sd * L1 * Math.sin(d2r(a1)), Sx[1] + L1 * Math.cos(d2r(a1))];
      const H = [El[0] + A.sd * L2 * Math.sin(d2r(a1 + a2)), El[1] + L2 * Math.cos(d2r(a1 + a2))];
      const d = `M${Sx[0]},${Sx[1]} L${El[0].toFixed(1)},${El[1].toFixed(1)} L${H[0].toFixed(1)},${H[1].toFixed(1)}`;
      A.o.setAttribute('d', d); A.f.setAttribute('d', d);
      const u = [(H[0] - El[0]) / L2, (H[1] - El[1]) / L2];
      A.cuff.setAttribute('cx', (H[0] - u[0] * 11).toFixed(1)); A.cuff.setAttribute('cy', (H[1] - u[1] * 11).toFixed(1));
      A.hand.setAttribute('cx', (H[0] + u[0] * 11).toFixed(1)); A.hand.setAttribute('cy', (H[1] + u[1] * 11).toFixed(1));
      const show = point ? '' : 'none';
      const tip = [H[0] + u[0] * 22, H[1] + u[1] * 22];
      const ca = Math.cos(d2r(12)), sa = Math.sin(d2r(12)) * A.sd;
      const u2 = [u[0] * ca - u[1] * sa, u[0] * sa + u[1] * ca];
      const tip2 = [tip[0] + u2[0] * 16, tip[1] + u2[1] * 16];
      [[A.fg1, H, tip], [A.fg2, tip, tip2], [A.fg1s, H, tip], [A.fg2s, tip, tip2]].forEach(([ln, a, b]) => {
        ln.style.display = show;
        ln.setAttribute('x1', a[0].toFixed(1)); ln.setAttribute('y1', a[1].toFixed(1));
        ln.setAttribute('x2', b[0].toFixed(1)); ln.setAttribute('y2', b[1].toFixed(1));
      });
      return H;
    }
    return { arms, place };
  };

  /* ================= legKit — kaki 2 segmen (PR §6 no.2) ================= */
  const legKit = (g, o = {}) => {
    const { L1 = 165, L2 = 155, wO = 42, wF = 34, cloth = '#232a3a', clothD = '#171d29', shoe = '#17100b', skin = null } = o;
    const mk = sd => {
      const a = E('g', {}, g);
      const oP = E('path', { fill: 'none', ...st(wO) }, a);
      const f = E('path', { fill: 'none', stroke: cloth, 'stroke-width': wF, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, a);
      const sh = E('ellipse', { rx: 26, ry: 11, fill: shoe, ...st(3) }, a);
      return { o: oP, f, sh, sd };
    };
    const legs = { l: mk(-1), r: mk(1) };
    function place(L, swing, knee, Hx) {
      const a1 = d2r(swing), a2 = d2r(swing + knee);
      const K = [Hx[0] + L1 * Math.sin(a1), Hx[1] + L1 * Math.cos(a1)];
      const F = [K[0] + L2 * Math.sin(a2), K[1] + L2 * Math.cos(a2)];
      const d = `M${Hx[0]},${Hx[1]} L${K[0].toFixed(1)},${K[1].toFixed(1)} L${F[0].toFixed(1)},${F[1].toFixed(1)}`;
      L.o.setAttribute('d', d); L.f.setAttribute('d', d);
      L.sh.setAttribute('cx', (F[0] + 6).toFixed(1)); L.sh.setAttribute('cy', (F[1] - 2).toFixed(1));
      L.sh.setAttribute('transform', `rotate(${(-swing * 0.4).toFixed(1)} ${F[0].toFixed(1)} ${F[1].toFixed(1)})`);
      return F;
    }
    return { legs, place };
  };
  // pose jalan dari fase: [swing, knee] per kaki (fase ayun = lutut menekuk)
  const walkLeg = ph => {
    const sw = Math.sin(ph) * 21;
    const knee = 4 + Math.max(0, -Math.cos(ph)) * 36;   // 4° menapak -> 40° ayun
    return [sw, knee];
  };

  /* ================= NARATOR ("Aku") — ±735, rambut IKAL mengembang, wajah lonjong ===== */
  const Narator = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#cf9868', hair: '#17110b', shirt: '#2c4a6e', shirtD: '#1d334d', pants: '#4a3826', shoe: '#1c130b' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 90, ry: 13, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 162, L2: 152, cloth: C.pants, shoe: C.shoe });
    E('path', { d: 'M-54,-538 C-62,-468 -60,-392 -54,-320 L54,-320 C60,-392 62,-468 54,-538 Q0,-560 -54,-538Z', fill: C.shirt, ...st(4) }, g);
    E('path', { d: 'M54,-538 C62,-468 60,-392 54,-320 L33,-320 C41,-394 43,-466 37,-534Z', fill: C.shirtD }, g);
    const kit = armKit(g, { L1: 124, L2: 114, wO: 38, wF: 32, shirt: C.shirt, shirtD: C.shirtD, skin: C.skin });
    E('rect', { x: -16, y: -568, width: 32, height: 44, rx: 9, fill: C.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('ellipse', { cx: 0, cy: -642, rx: 62, ry: 76, fill: C.skin, ...st(4) }, hg);
    // rambut ikal: gugus lingkaran tumpang-tindih di mahkota (siluet mengembang)
    [[-46, -688, 24], [-24, -702, 27], [0, -708, 29], [24, -702, 27], [46, -688, 24], [-56, -664, 20], [56, -664, 20], [-14, -694, 25], [15, -695, 25]].forEach(([cx, cy, r]) =>
      E('circle', { cx, cy, r, fill: C.hair }, hg));
    E('path', { d: 'M-60,-664 C-64,-700 -30,-722 0,-722 C30,-722 64,-700 60,-664 C48,-684 30,-690 16,-684 C4,-694 -16,-694 -28,-684 C-42,-690 -54,-682 -60,-664Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 24},-646)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 7, ry: 10, fill: '#241610' }, open);
      E('circle', { cx: 2.5, cy: -3.5, r: 2.4, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-10,2 Q0,-7 10,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 13},-670 Q${sd * 24},-675 ${sd * 37},-670`, fill: 'none', ...st(3.5, '#3a2718') }, hg));
    E('path', { d: 'M-2,-628 Q-5,-615 2,-613 Q8,-613 8,-621', fill: 'none', ...st(3, '#a06a42') }, hg);
    const closed = E('path', { d: 'M-14,-590 Q0,-582 14,-590', fill: 'none', ...st(3.5, '#8a3b34') }, hg);
    const openM = E('path', { fill: '#6d2620', ...st(3, '#4a2018') }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [20, -22], ra = [17, -20], headR = 0, blink = false, fear = 0, shock = 0, hairSw = 0, legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -552)`);
        const wide = 1 + .35 * shock;
        eyes.forEach(ey => {
          ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none';
          ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`);
        });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up = fear * 8 + shock * 11;
          b.setAttribute('d', `M${sd * 13},${(-670 - up).toFixed(0)} Q${sd * 24},${(-675 - up).toFixed(0)} ${sd * 37},-670`);
        });
        const mo = shock > .55;
        closed.style.display = mo ? 'none' : '';
        openM.style.display = mo ? '' : 'none';
        openM.setAttribute('d', 'M0,-598 C7,-598 10,-592 10,-585 C10,-577 7,-571 0,-571 C-7,-571 -10,-577 -10,-585 C-10,-592 -7,-598 0,-598Z');
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-54, -494], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [54, -494], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-26, -320]);
        legs.place(legs.legs.r, legR[0], legR[1], [26, -320]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= PAK DARMA (versi cerita ini) — ±662, peci PUTIH, sarung hijau tua ===== */
  const Darma7 = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#bd8256', hair: '#cfc8bd', shirt: '#ddd6c4', shirtD: '#b3ab97', sarung: '#2f4a38', sarungL: '#476b52', shoe: '#2a1c12' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 84, ry: 12, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 146, L2: 136, wO: 38, wF: 30, cloth: '#38322a', shoe: C.shoe });
    const sar = E('g', {}, g);
    E('path', { d: 'M-62,-306 L62,-306 L76,-92 L-76,-92 Z', fill: C.sarung, ...st(4) }, sar);
    [-36, 0, 36].forEach(lx => E('path', { d: `M${lx},-304 L${lx},-94`, stroke: C.sarungL, 'stroke-width': 3, opacity: .5 }, sar));
    E('path', { d: 'M-62,-306 L62,-306 L64,-278 L-64,-278Z', fill: '#223829' }, sar);
    const up = E('g', {}, g);
    E('path', { d: 'M-58,-508 C-64,-444 -62,-370 -56,-300 L56,-300 C62,-370 64,-444 58,-508 Q0,-530 -58,-508Z', fill: C.shirt, ...st(4) }, up);
    E('path', { d: 'M58,-508 C64,-444 62,-370 56,-300 L36,-300 C44,-372 46,-442 40,-504Z', fill: C.shirtD }, up);
    const kit = armKit(up, { L1: 104, L2: 94, wO: 34, wF: 28, shirt: C.shirt, shirtD: C.shirtD, skin: C.skin });
    E('rect', { x: -14, y: -530, width: 28, height: 36, rx: 8, fill: C.skin, ...st(3) }, up);
    const head = E('g', {}, up), hg = E('g', {}, head);
    E('circle', { cx: 4, cy: -584, r: 62, fill: C.skin, ...st(4) }, hg);
    [-1, 1].forEach(sd => E('path', { d: `M${4 + sd * 58},-596 Q${4 + sd * 66},-566 ${4 + sd * 54},-542`, fill: 'none', stroke: C.hair, 'stroke-width': 8, 'stroke-linecap': 'round' }, hg));
    // peci PUTIH (pembeda siluet dari versi Ep.6 yang hitam)
    E('path', { d: 'M-46,-606 L56,-606 L52,-650 Q4,-662 -42,-650 Z', fill: '#e8e2d4', ...st(3) }, hg);
    [-624, -613].forEach((wy, i) => E('path', { d: `M${-14 + i * 4},${wy + 26} Q4,${wy + 22} ${28 - i * 4},${wy + 26}`, fill: 'none', stroke: '#96683f', 'stroke-width': 2.5, opacity: .7 }, hg));
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${4 + sd * 22},-590)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 6.5, ry: 9, fill: '#241610' }, open);
      E('circle', { cx: 2, cy: -3, r: 2.2, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${4 + sd * 11},-613 Q${4 + sd * 22},-619 ${4 + sd * 33},-613`, fill: 'none', ...st(4, '#8f887c') }, hg));
    E('path', { d: 'M2,-574 Q-1,-563 5,-561 Q10,-561 10,-568', fill: 'none', ...st(3, '#96683f') }, hg);
    // janggut pendek uban (bukan janggut panjang Ep.6)
    E('path', { d: 'M-16,-548 Q4,-534 24,-548 Q20,-528 4,-526 Q-12,-528 -16,-548Z', fill: C.hair, opacity: .95, ...st(2.5, '#a39a8b') }, hg);
    const mouth = E('path', { d: 'M-6,-552 Q4,-547 14,-552', fill: 'none', ...st(3.5, '#7c463c') }, hg);
    const talkM = E('ellipse', { cx: 4, cy: -549, rx: 7, ry: 0.1, fill: '#5e2a24' }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [18, -22], ra = [18, -22], headR = 0, blink = false, fear = 0, shock = 0, talk = 0, legL = [0, 4], legR = [0, 4], point = null } = o;
        up.setAttribute('transform', `rotate(4 0 -296)`);
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 4 -520)`);
        const wide = 1 + .3 * shock;
        eyes.forEach(ey => {
          ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none';
          ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`);
        });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up2 = fear * 7 + shock * 9;
          b.setAttribute('d', `M${4 + sd * 11},${(-613 - up2).toFixed(0)} Q${4 + sd * 22},${(-619 - up2).toFixed(0)} ${4 + sd * 33},-613`);
        });
        mouth.style.display = talk > .15 ? 'none' : '';
        talkM.style.display = talk > .15 ? '' : 'none';
        talkM.setAttribute('ry', (0.1 + talk * 5.5).toFixed(2));
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-56, -462], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [56, -462], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-25, -306]);
        legs.place(legs.legs.r, legR[0], legR[1], [25, -306]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= BIMO (7 tahun) — ±432, cepak poni rata, kaus mustard ===== */
  const Bimo = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#d9a06e', hair: '#14100c', shirt: '#c9972f', shirtD: '#a67c22', pants: '#33549e', shoe: '#7a4a26' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 5, rx: 56, ry: 9, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 118, L2: 110, wO: 30, wF: 24, cloth: C.skin, shoe: C.shoe });
    // celana pendek (blok pinggul di atas paha, seperti sarung Darma tapi pendek)
    E('path', { d: 'M-40,-238 L40,-238 L46,-168 L14,-168 L0,-196 L-14,-168 L-46,-168 Z', fill: C.pants, ...st(3.5) }, g);
    E('path', { d: 'M-38,-330 C-44,-292 -43,-262 -38,-232 L38,-232 C43,-262 44,-292 38,-330 Q0,-346 -38,-330Z', fill: C.shirt, ...st(3.5) }, g);
    E('path', { d: 'M38,-330 C44,-292 43,-262 38,-232 L22,-232 C28,-264 29,-294 25,-328Z', fill: C.shirtD }, g);
    const kit = armKit(g, { L1: 74, L2: 68, wO: 26, wF: 21, shirt: C.shirt, shirtD: C.shirtD, skin: C.skin });
    E('rect', { x: -11, y: -350, width: 22, height: 28, rx: 7, fill: C.skin, ...st(2.5) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('circle', { cx: 0, cy: -398, r: 54, fill: C.skin, ...st(3.5) }, hg);
    // cepak poni rata (siluet: atap datar + garis poni lurus)
    E('path', { d: 'M-54,-398 C-56,-436 -30,-454 0,-454 C30,-454 56,-436 54,-398 C40,-420 22,-424 8,-420 L8,-428 L-8,-428 L-8,-419 C-24,-423 -42,-418 -54,-398Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 20},-402)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 6.5, ry: 11, fill: '#241610' }, open);
      E('circle', { cx: 2.5, cy: -4, r: 2.6, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 10},-424 Q${sd * 20},-428 ${sd * 31},-424`, fill: 'none', ...st(3, '#3a2718') }, hg));
    E('path', { d: 'M-2,-386 Q-4,-377 1,-375 Q6,-375 6,-381', fill: 'none', ...st(2.5, '#a06a42') }, hg);
    const smile = E('path', { d: 'M-11,-362 Q0,-353 11,-362', fill: 'none', ...st(3, '#8a3b34') }, hg);
    const flat = E('path', { d: 'M-9,-358 L9,-358', fill: 'none', ...st(3, '#8a3b34') }, hg);
    const openM = E('ellipse', { cx: 0, cy: -360, rx: 6.5, ry: 0.1, fill: '#6d2620' }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [22, -24], ra = [22, -24], headR = 0, blink = false, fear = 0, shock = 0, talk = 0, mood = 'smile', legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -344)`);
        const wide = 1 + .4 * shock;
        eyes.forEach(ey => {
          ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none';
          ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`);
        });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up = fear * 7 + shock * 9;
          b.setAttribute('d', `M${sd * 10},${(-424 - up).toFixed(0)} Q${sd * 20},${(-428 - up).toFixed(0)} ${sd * 31},-424`);
        });
        smile.style.display = mood === 'smile' && talk <= .15 ? '' : 'none';
        flat.style.display = mood === 'flat' && talk <= .15 ? '' : 'none';
        openM.style.display = talk > .15 ? '' : 'none';
        openM.setAttribute('ry', (0.1 + talk * 6).toFixed(2));
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-37, -302], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [37, -302], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-19, -238]);
        legs.place(legs.legs.r, legR[0], legR[1], [19, -238]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= AYAH BIMO — ±792, PALING LEBAR, bahu bidang ===== */
  const Ayah = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#c08b58', hair: '#100d0a', shirt: '#6b6f75', shirtD: '#4c4f54', pants: '#2e3138', shoe: '#17100b' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 104, ry: 14, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 178, L2: 168, wO: 46, wF: 38, cloth: C.pants, shoe: C.shoe });
    E('path', { d: 'M-76,-556 C-84,-480 -82,-404 -76,-336 L76,-336 C82,-404 84,-480 76,-556 Q0,-580 -76,-556Z', fill: C.shirt, ...st(4) }, g);
    E('path', { d: 'M76,-556 C84,-480 82,-404 76,-336 L48,-336 C56,-406 58,-478 52,-552Z', fill: C.shirtD }, g);
    const kit = armKit(g, { L1: 140, L2: 128, wO: 44, wF: 38, shirt: C.shirt, shirtD: C.shirtD, skin: C.skin });
    E('rect', { x: -18, y: -586, width: 36, height: 46, rx: 9, fill: C.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('path', { d: 'M-66,-664 C-68,-616 -56,-584 -30,-572 L30,-572 C56,-584 68,-616 66,-664 C66,-706 38,-728 0,-728 C-38,-728 -66,-706 -66,-664Z', fill: C.skin, ...st(4) }, hg);
    // rambut belah samping rapi
    E('path', { d: 'M-66,-664 C-70,-712 -34,-734 2,-733 L-6,-716 L14,-726 L18,-708 L38,-716 C56,-706 66,-690 66,-664 C54,-686 34,-694 18,-688 C2,-698 -30,-696 -46,-682 C-56,-690 -62,-678 -66,-664Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 26},-652)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 7, ry: 10, fill: '#241610' }, open);
      E('circle', { cx: 2.5, cy: -3.5, r: 2.4, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-10,2 Q0,-7 10,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 14},-676 Q${sd * 26},-682 ${sd * 40},-676`, fill: 'none', ...st(4, '#2c1e12') }, hg));
    E('path', { d: 'M-2,-634 Q-5,-621 2,-619 Q9,-619 9,-627', fill: 'none', ...st(3, '#96683f') }, hg);
    const mouth = E('path', { d: 'M-13,-596 Q0,-590 13,-596', fill: 'none', ...st(3.5, '#7c463c') }, hg);
    const talkM = E('ellipse', { cx: 0, cy: -594, rx: 8, ry: 0.1, fill: '#5e2a24' }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [19, -21], ra = [19, -21], headR = 0, blink = false, fear = 0, shock = 0, talk = 0, legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -566)`);
        const wide = 1 + .35 * shock;
        eyes.forEach(ey => {
          ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none';
          ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`);
        });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up = fear * 8 + shock * 10;
          b.setAttribute('d', `M${sd * 14},${(-676 - up).toFixed(0)} Q${sd * 26},${(-682 - up).toFixed(0)} ${sd * 40},-676`);
        });
        mouth.style.display = talk > .15 ? 'none' : '';
        talkM.style.display = talk > .15 ? '' : 'none';
        talkM.setAttribute('ry', (0.1 + talk * 6).toFixed(2));
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-74, -508], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [74, -508], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-34, -336]);
        legs.place(legs.legs.r, legR[0], legR[1], [34, -336]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= IBU BIMO — ±688, sanggul rendah, daster batik, wajah lelah ===== */
  const Ibu = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#d29c6c', hair: '#1d130c', dress: '#7a5230', dressD: '#5e3d22', shoe: '#2a1c12' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 86, ry: 12, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 140, L2: 130, wO: 36, wF: 28, cloth: '#5e4630', shoe: C.shoe });
    // daster panjang menutup paha (blok seperti sarung, motif titik batik)
    const dr = E('g', {}, g);
    E('path', { d: 'M-64,-316 L64,-316 L84,-96 L-84,-96 Z', fill: C.dress, ...st(4) }, dr);
    [[-40, -250], [-12, -210], [20, -255], [44, -200], [-26, -150], [10, -140], [52, -130], [-52, -190]].forEach(([cx, cy]) =>
      E('circle', { cx, cy, r: 5, fill: C.dressD, opacity: .8 }, dr));
    E('path', { d: 'M-64,-316 L64,-316 L66,-288 L-66,-288Z', fill: C.dressD }, dr);
    E('path', { d: 'M-58,-520 C-64,-452 -62,-376 -58,-310 L58,-310 C62,-376 64,-452 58,-520 Q0,-544 -58,-520Z', fill: C.dress, ...st(4) }, g);
    E('path', { d: 'M58,-520 C64,-452 62,-376 58,-310 L36,-310 C44,-378 46,-450 40,-516Z', fill: C.dressD }, g);
    const kit = armKit(g, { L1: 112, L2: 102, wO: 36, wF: 30, shirt: C.dress, shirtD: C.dressD, skin: C.skin });
    E('rect', { x: -15, y: -544, width: 30, height: 40, rx: 8, fill: C.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('circle', { cx: 0, cy: -606, r: 64, fill: C.skin, ...st(4) }, hg);
    // sanggul rendah di belakang bawah kepala
    E('circle', { cx: -52, cy: -566, r: 19, fill: C.hair, ...st(2.5) }, hg);
    E('path', { d: 'M-64,-606 C-68,-648 -36,-670 0,-670 C36,-670 68,-648 64,-606 C52,-628 32,-636 16,-630 C0,-640 -28,-638 -44,-626 C-54,-632 -60,-620 -64,-606Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 23},-612)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 6.5, ry: 9.5, fill: '#241610' }, open);
      E('circle', { cx: 2, cy: -3, r: 2.2, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#241610') }, e);
      // kantong mata (wajah lelah — pembeda tokoh ini)
      E('path', { d: 'M-8,13 Q0,17 8,13', fill: 'none', stroke: '#a06a42', 'stroke-width': 2.2, opacity: .8 }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 12},-634 Q${sd * 23},-639 ${sd * 35},-634`, fill: 'none', ...st(3.5, '#3a2718') }, hg));
    E('path', { d: 'M-2,-594 Q-5,-582 2,-580 Q8,-580 8,-587', fill: 'none', ...st(3, '#a06a42') }, hg);
    const mouth = E('path', { d: 'M-11,-566 Q0,-561 11,-566', fill: 'none', ...st(3.5, '#8a3b34') }, hg);
    const talkM = E('ellipse', { cx: 0, cy: -564, rx: 7.5, ry: 0.1, fill: '#5e2a24' }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [19, -22], ra = [19, -22], headR = 0, blink = false, fear = 0, shock = 0, talk = 0, legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -538)`);
        const wide = 1 + .35 * shock;
        eyes.forEach(ey => {
          ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none';
          ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`);
        });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up = fear * 8 + shock * 10;
          b.setAttribute('d', `M${sd * 12},${(-634 - up).toFixed(0)} Q${sd * 23},${(-639 - up).toFixed(0)} ${sd * 35},-634`);
        });
        mouth.style.display = talk > .15 ? 'none' : '';
        talkM.style.display = talk > .15 ? '' : 'none';
        talkM.setAttribute('ry', (0.1 + talk * 6).toFixed(2));
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-57, -476], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [57, -476], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-26, -316]);
        legs.place(legs.legs.r, legR[0], legR[1], [26, -316]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= PAK KARSO (warga pencari) — ±706, kurus, topi pet, kumis tipis ===== */
  const Karso = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#b57e50', hair: '#241a10', shirt: '#54443a', shirtD: '#3e322a', pants: '#3a3630', shoe: '#17100b' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 80, ry: 12, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 168, L2: 158, wO: 38, wF: 30, cloth: C.pants, shoe: C.shoe });
    E('path', { d: 'M-48,-540 C-55,-470 -53,-396 -48,-324 L48,-324 C53,-396 55,-470 48,-540 Q0,-560 -48,-540Z', fill: C.shirt, ...st(4) }, g);
    E('path', { d: 'M48,-540 C55,-470 53,-396 48,-324 L28,-324 C35,-398 37,-468 31,-536Z', fill: C.shirtD }, g);
    const kit = armKit(g, { L1: 126, L2: 116, wO: 36, wF: 30, shirt: C.shirt, shirtD: C.shirtD, skin: C.skin });
    E('rect', { x: -14, y: -566, width: 28, height: 42, rx: 8, fill: C.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('ellipse', { cx: 0, cy: -636, rx: 58, ry: 72, fill: C.skin, ...st(4) }, hg);
    E('path', { d: 'M-58,-648 C-60,-686 -30,-706 0,-706 C30,-706 60,-686 58,-648 C44,-666 24,-672 8,-666 C-8,-674 -34,-670 -48,-658 C-54,-662 -57,-656 -58,-648Z', fill: C.hair, ...st(3) }, hg);
    // topi pet: mahkota + lidah menjorok ke depan (siluet khas)
    E('path', { d: 'M-52,-672 C-50,-700 -24,-712 0,-712 C24,-712 50,-700 52,-672 L52,-662 L-52,-662 Z', fill: '#2c2620', ...st(3) }, hg);
    E('path', { d: 'M-52,-664 L-96,-656 L-94,-646 L-52,-650 Z', fill: '#2c2620', ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 21},-640)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 6.5, ry: 9.5, fill: '#241610' }, open);
      E('circle', { cx: 2, cy: -3, r: 2.2, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 11},-662 Q${sd * 21},-667 ${sd * 33},-662`, fill: 'none', ...st(3.5, '#2c1e12') }, hg));
    E('path', { d: 'M-2,-622 Q-5,-610 2,-608 Q8,-608 8,-615', fill: 'none', ...st(3, '#96683f') }, hg);
    // kumis tipis
    E('path', { d: 'M-14,-592 Q0,-586 14,-592 Q8,-582 0,-583 Q-8,-582 -14,-592Z', fill: C.hair, ...st(2) }, hg);
    const mouth = E('path', { d: 'M-8,-584 Q0,-580 8,-584', fill: 'none', ...st(3, '#7c463c') }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [20, -22], ra = [20, -22], headR = 0, blink = false, fear = 0, shock = 0, legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -556)`);
        const wide = 1 + .35 * shock;
        eyes.forEach(ey => {
          ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none';
          ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`);
        });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up = fear * 8 + shock * 10;
          b.setAttribute('d', `M${sd * 11},${(-662 - up).toFixed(0)} Q${sd * 21},${(-667 - up).toFixed(0)} ${sd * 33},-662`);
        });
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-47, -496], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [47, -496], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-24, -324]);
        legs.place(legs.legs.r, legR[0], legR[1], [24, -324]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= BU WARTI (warga pencari) — ±648, gemuk pendek, gelung tinggi ===== */
  const Warti = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#d9a06e', hair: '#191008', dress: '#5c4460', dressD: '#453349', shoe: '#241a20' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 88, ry: 12, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 128, L2: 118, wO: 38, wF: 30, cloth: '#3c2c40', shoe: C.shoe });
    const dr = E('g', {}, g);
    E('path', { d: 'M-70,-296 L70,-296 L88,-92 L-88,-92 Z', fill: C.dressD, ...st(4) }, dr);
    E('path', { d: 'M-70,-296 L70,-296 L72,-268 L-72,-268Z', fill: '#33253a' }, dr);
    E('path', { d: 'M-68,-486 C-76,-424 -74,-360 -68,-302 L68,-302 C74,-360 76,-424 68,-486 Q0,-512 -68,-486Z', fill: C.dress, ...st(4) }, g);
    E('path', { d: 'M68,-486 C76,-424 74,-360 68,-302 L42,-302 C50,-362 52,-422 46,-482Z', fill: C.dressD }, g);
    const kit = armKit(g, { L1: 106, L2: 96, wO: 38, wF: 32, shirt: C.dress, shirtD: C.dressD, skin: C.skin });
    E('rect', { x: -15, y: -508, width: 30, height: 36, rx: 8, fill: C.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('circle', { cx: 0, cy: -566, r: 66, fill: C.skin, ...st(4) }, hg);
    // gelung TINGGI di mahkota (siluet khas)
    E('circle', { cx: 0, cy: -640, r: 21, fill: C.hair, ...st(3) }, hg);
    E('path', { d: 'M-66,-566 C-70,-610 -36,-632 0,-632 C36,-632 70,-610 66,-566 C54,-588 32,-596 15,-590 C-2,-600 -30,-598 -46,-586 C-56,-592 -62,-580 -66,-566Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 24},-572)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 6.5, ry: 9.5, fill: '#241610' }, open);
      E('circle', { cx: 2, cy: -3, r: 2.2, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 13},-594 Q${sd * 24},-599 ${sd * 36},-594`, fill: 'none', ...st(3.5, '#2c1e12') }, hg));
    E('path', { d: 'M-2,-554 Q-5,-542 2,-540 Q8,-540 8,-547', fill: 'none', ...st(3, '#a06a42') }, hg);
    const mouth = E('path', { d: 'M-10,-528 Q0,-523 10,-528', fill: 'none', ...st(3.5, '#8a3b34') }, hg);
    const talkM = E('ellipse', { cx: 0, cy: -526, rx: 7, ry: 0.1, fill: '#5e2a24' }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [20, -22], ra = [20, -22], headR = 0, blink = false, fear = 0, shock = 0, talk = 0, legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -500)`);
        const wide = 1 + .35 * shock;
        eyes.forEach(ey => {
          ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none';
          ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`);
        });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up = fear * 8 + shock * 10;
          b.setAttribute('d', `M${sd * 13},${(-594 - up).toFixed(0)} Q${sd * 24},${(-599 - up).toFixed(0)} ${sd * 36},-594`);
        });
        mouth.style.display = talk > .15 ? 'none' : '';
        talkM.style.display = talk > .15 ? '' : 'none';
        talkM.setAttribute('ry', (0.1 + talk * 5.5).toFixed(2));
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-66, -446], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [66, -446], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-28, -296]);
        legs.place(legs.legs.r, legR[0], legR[1], [28, -296]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= RIAN (pemuda warga) — ±768, jangkung, gondrong diikat, jaket ===== */
  const Rian = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#caa06a', hair: '#120d08', shirt: '#37505e', shirtD: '#273a44', inner: '#8a8d90', pants: '#26262b', shoe: '#14100c' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 84, ry: 12, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 176, L2: 166, wO: 40, wF: 32, cloth: C.pants, shoe: C.shoe });
    E('path', { d: 'M-52,-552 C-59,-478 -57,-402 -52,-330 L52,-330 C57,-402 59,-478 52,-552 Q0,-574 -52,-552Z', fill: C.shirt, ...st(4) }, g);
    E('path', { d: 'M-16,-556 L16,-556 L13,-336 L-13,-336 Z', fill: C.inner, ...st(3) }, g); // jaket terbuka + kaus dalam
    E('path', { d: 'M52,-552 C59,-478 57,-402 52,-330 L34,-330 C41,-404 43,-476 37,-548Z', fill: C.shirtD }, g);
    const kit = armKit(g, { L1: 134, L2: 124, wO: 38, wF: 32, shirt: C.shirt, shirtD: C.shirtD, skin: C.skin });
    E('rect', { x: -15, y: -580, width: 30, height: 44, rx: 8, fill: C.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    // massa rambut gondrong di belakang kepala + ekor ikat (digambar sebelum wajah)
    E('path', { d: 'M-58,-640 C-72,-600 -70,-540 -58,-500 L-38,-500 C-46,-548 -46,-596 -38,-636 Z', fill: C.hair }, hg);
    E('path', { d: 'M58,-640 C70,-604 70,-556 60,-516 L42,-516 C50,-556 50,-600 42,-634 Z', fill: C.hair }, hg);
    E('ellipse', { cx: 0, cy: -644, rx: 60, ry: 72, fill: C.skin, ...st(4) }, hg);
    E('path', { d: 'M-60,-644 C-64,-690 -32,-714 0,-714 C32,-714 64,-690 60,-644 C48,-666 28,-674 12,-668 C-4,-678 -32,-676 -46,-662 C-54,-668 -58,-658 -60,-644Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 22},-650)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 6.5, ry: 10, fill: '#241610' }, open);
      E('circle', { cx: 2, cy: -3, r: 2.2, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 12},-672 Q${sd * 22},-677 ${sd * 34},-672`, fill: 'none', ...st(3.5, '#241a10') }, hg));
    E('path', { d: 'M-2,-632 Q-5,-620 2,-618 Q8,-618 8,-625', fill: 'none', ...st(3, '#a06a42') }, hg);
    const mouth = E('path', { d: 'M-10,-602 Q0,-597 10,-602', fill: 'none', ...st(3.5, '#7c463c') }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [20, -22], ra = [20, -22], headR = 0, blink = false, fear = 0, shock = 0, legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -568)`);
        const wide = 1 + .35 * shock;
        eyes.forEach(ey => {
          ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none';
          ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`);
        });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up = fear * 8 + shock * 10;
          b.setAttribute('d', `M${sd * 12},${(-672 - up).toFixed(0)} Q${sd * 22},${(-677 - up).toFixed(0)} ${sd * 34},-672`);
        });
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-51, -504], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [51, -504], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-26, -330]);
        legs.place(legs.legs.r, legR[0], legR[1], [26, -330]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= WEWE GOMBEL — ±880, kanon audit §D =================
     Perempuan tua TINGGI gaung; rambut kusut lewat pinggang; wajah keriput
     dalam; mata rongga gelap TANPA kilau & TANPA merah (merah = pocong);
     penanda kanon: dada kebaya MENJUNTAI BERAT sampai bawah pinggang (massa
     kain terkulai — terbaca dari siluet, tidak eksplisit); lengan sangat
     panjang; tangan besar kurus. Gerak lambat & berat, fase absolut. */
  const Wewe = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#8a7360', skinD: '#6e5947', hair: '#191512', hairG: '#4a4238', kebaya: '#2e2a33', kebayaD: '#201c24', kain: '#3a2f2a', line: '#0d0a10' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 96, ry: 13, fill: '#000', opacity: .34 }, g);
    // kaki telanjang di bawah kain panjang
    const feet = [-1, 1].map(sd => E('ellipse', { cx: sd * 30, cy: -2, rx: 30, ry: 10, fill: C.skinD, ...st(2.5, C.line) }, g));
    // kain panjang (rok) — massa gelap sampai dekat tanah
    E('path', { d: 'M-58,-452 L58,-452 L84,-16 L-84,-16 Z', fill: C.kain, ...st(4, C.line) }, g);
    E('path', { d: 'M-20,-450 L-30,-20 M16,-450 L24,-20', fill: 'none', stroke: '#2a211c', 'stroke-width': 4, opacity: .7 }, g);
    // torso gaung (bahu sempit) — grup atas condong ringan dari pinggang
    const up = E('g', {}, g);
    E('path', { d: 'M-52,-646 C-57,-578 -55,-512 -52,-452 L52,-452 C55,-512 57,-578 52,-646 Q0,-664 -52,-646Z', fill: C.kebaya, ...st(4, C.line) }, up);
    E('path', { d: 'M52,-646 C57,-578 55,-512 52,-452 L30,-452 C37,-514 39,-576 34,-642Z', fill: C.kebayaD }, up);
    // === PENANDA KANON: dada menjuntai berat (dua massa kain terkulai tumpang-
    // tindih di dalam satu siluet dada panjang, ujung sampai -330, di bawah
    // pinggang -452) — digambar DI ATAS torso, dari pangkal dada -628.
    const drape = E('g', {}, up);
    E('path', { d: 'M-40,-626 C-46,-540 -44,-430 -30,-352 C-24,-322 -6,-312 0,-330 C4,-314 22,-320 28,-350 C42,-428 44,-540 38,-626 C14,-640 -16,-640 -40,-626Z', fill: '#262029', ...st(3.5, C.line) }, drape);
    E('path', { d: 'M-2,-634 C-4,-540 -3,-440 -1,-348', fill: 'none', stroke: '#171219', 'stroke-width': 5, opacity: .8 }, drape);
    E('path', { d: 'M-28,-560 C-24,-500 -24,-440 -20,-392 M26,-566 C30,-506 30,-446 26,-396', fill: 'none', stroke: '#171219', 'stroke-width': 3.5, opacity: .6 }, drape);
    const kit = armKit(up, { L1: 205, L2: 195, wO: 30, wF: 24, shirt: C.kebaya, shirtD: C.kebayaD, skin: C.skin });
    // leher jenjang
    E('rect', { x: -13, y: -706, width: 26, height: 66, rx: 8, fill: C.skinD, ...st(2.5, C.line) }, up);
    const head = E('g', {}, up), hg = E('g', {}, head);
    // massa rambut belakang: unting kusut panjang lewat pinggang (grup sway sendiri)
    const hairBack = E('g', {}, hg);
    const hairPaths = [];
    [[-46, 330], [-30, 290], [-14, 345], [2, 300], [18, 340], [34, 295], [48, 325]].forEach(([hx, len], i) => {
      const hp = E('path', { d: `M${hx},-736 C${hx + (i % 2 ? 14 : -14)},${-736 + len * .4} ${hx + (i % 2 ? -10 : 10)},${-736 + len * .75} ${hx + (i % 3 - 1) * 12},${-736 + len}`, fill: 'none', stroke: i % 2 ? C.hair : '#211c16', 'stroke-width': 13 - (i % 3), 'stroke-linecap': 'round' }, hairBack);
      hairPaths.push(hp);
    });
    E('ellipse', { cx: 0, cy: -748, rx: 57, ry: 70, fill: C.skin, ...st(3.5, C.line) }, hg);
    // rambut mahkota kusut (helai tak rata menutupi sebagian dahi)
    E('path', { d: 'M-57,-748 C-62,-796 -30,-820 0,-820 C30,-820 62,-796 57,-748 C48,-770 34,-778 22,-772 L18,-786 L4,-774 L-4,-788 L-14,-774 C-28,-780 -46,-772 -57,-748Z', fill: C.hair, ...st(3, C.line) }, hg);
    [[-38, -792], [-12, -806], [16, -800], [40, -788]].forEach(([hx, hy]) =>
      E('path', { d: `M${hx},-762 C${hx - 6},${hy + 26} ${hx + 4},${hy + 52} ${hx - 3},${hy + 74}`, fill: 'none', stroke: C.hair, 'stroke-width': 8, 'stroke-linecap': 'round' }, hg));
    // keriput dalam: dahi 3 garis, pipi 2 garis, garis senyum pahit
    [-778, -766, -754].forEach((wy, i) => E('path', { d: `M${-26 + i * 3},${wy} Q0,${wy - 6} ${26 - i * 3},${wy}`, fill: 'none', stroke: C.skinD, 'stroke-width': 2.6, opacity: .85 }, hg));
    [-742, -724].forEach((wy, i) => E('path', { d: `M${-40 + i * 4},${wy} Q${-30 + i * 3},${wy + 12} ${-24 + i * 3},${wy + 22} M${40 - i * 4},${wy} Q${30 - i * 3},${wy + 12} ${24 - i * 3},${wy + 22}`, fill: 'none', stroke: C.skinD, 'stroke-width': 2.4, opacity: .7 }, hg));
    // mata: rongga gelap cekung TANPA kilau (pelajaran kuyang: kilau = boneka)
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 21},-742)` }, hg);
      E('ellipse', { cx: 0, cy: 0, rx: 9.5, ry: 12, fill: '#07050a' }, e);
      E('path', { d: 'M-11,-9 Q0,-15 11,-9', fill: 'none', stroke: C.skinD, 'stroke-width': 3 }, e); // kelopak berat di atas rongga
      const shut = E('path', { d: 'M-10,1 Q0,-5 10,1', fill: 'none', ...st(3.5, '#07050a') }, e);
      return { e, shut };
    });
    // alis menukik turun (sedih-menekan), hidung panjang, mulut garis pahit
    [-1, 1].forEach(sd => E('path', { d: `M${sd * 10},-762 Q${sd * 21},-766 ${sd * 33},-758`, fill: 'none', stroke: C.hairG, 'stroke-width': 4 }, hg));
    E('path', { d: 'M-2,-736 Q-6,-716 1,-712 Q7,-712 7,-720', fill: 'none', ...st(3, C.skinD) }, hg);
    E('path', { d: 'M-13,-694 Q0,-690 13,-694', fill: 'none', stroke: '#3d2c22', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [10, -14], ra = [10, -14], headR = 0, sway = 0, hairLag = 0, eyesShut = false } = o;
        up.setAttribute('transform', `rotate(${(2.2 + sway).toFixed(2)} 0 -446)`);
        head.setAttribute('transform', `rotate(${(headR + sway * .5).toFixed(2)} 0 -700)`);
        hairBack.setAttribute('transform', `rotate(${hairLag.toFixed(2)} 0 -740)`);
        eyes.forEach(ey => { ey.shut.style.display = eyesShut ? '' : 'none'; });
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-50, -606]);
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [50, -606]);
      }
    };
    api.set({});
    tr(root, x, y, s);
    return api;
  };

  /* ================= PROP ================= */
  // senter di tangan: badan senter + kerucut cahaya (grup di dalam root tokoh,
  // koordinat sama dengan api.hands — pelajaran Ep.6 makeSenter)
  const makeSenter = (parent, op = .13) => {
    const g = E('g', {}, parent);
    const beam = E('polygon', { points: '0,0 0,0 0,0', fill: '#ffe9b0', opacity: op }, g);
    const body = E('g', {}, g);
    E('rect', { x: -13, y: -34, width: 26, height: 40, rx: 7, fill: '#20242c', ...st(3) }, body);
    E('rect', { x: -16, y: -44, width: 32, height: 14, rx: 5, fill: '#39404c', ...st(3) }, body);
    return {
      el: g,
      set(H, angDeg = -10, len = 660, wdt = 120) {
        if (!H) { g.style.display = 'none'; return; }
        g.style.display = '';
        const a = d2r(angDeg), ux = Math.sin(a), uy = -Math.cos(a);
        body.setAttribute('transform', `translate(${H[0].toFixed(1)},${H[1].toFixed(1)}) rotate(${angDeg.toFixed(1)})`);
        const tx = H[0] + ux * len, ty = H[1] + uy * len, px = -uy, py = ux;
        beam.setAttribute('points', `${H[0].toFixed(0)},${(H[1] - 30).toFixed(0)} ${(tx + px * wdt).toFixed(0)},${(ty + py * wdt).toFixed(0)} ${(tx - px * wdt).toFixed(0)},${(ty - py * wdt).toFixed(0)}`);
      }
    };
  };
  // ponsel di tangan (rect kecil + layar menyala)
  const makePhone = (parent) => {
    const g = E('g', {}, parent);
    E('rect', { x: -17, y: -30, width: 34, height: 58, rx: 7, fill: '#101318', ...st(3) }, g);
    const scr = E('rect', { x: -12, y: -24, width: 24, height: 42, rx: 4, fill: '#b8cfe0', opacity: .85 }, g);
    return { el: g, scr, set(H, angDeg = 0) { if (!H) { g.style.display = 'none'; return; } g.style.display = ''; g.setAttribute('transform', `translate(${H[0].toFixed(1)},${H[1].toFixed(1)}) rotate(${angDeg.toFixed(1)})`); } };
  };
  // kilat blitz foto: bintang cahaya sesaat
  const makeFlash = (shot) => {
    const g = E('g', { opacity: 0 }, shot);
    E('circle', { cx: 0, cy: 0, r: 120, fill: '#ffffff', opacity: .5, filter: P.blur(g, 30) }, g);
    let pts = '';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r1 = 150, r2 = 46; pts += `${(Math.cos(a) * r1).toFixed(0)},${(Math.sin(a) * r1).toFixed(0)} ${(Math.cos(a + .39) * r2).toFixed(0)},${(Math.sin(a + .39) * r2).toFixed(0)} `; }
    E('polygon', { points: pts.trim(), fill: '#ffffff', opacity: .9 }, g);
    return { el: g, set(x, y, k) { g.setAttribute('transform', `translate(${x},${y})`); g.setAttribute('opacity', k.toFixed(3)); } };
  };
  // obor: gagang dari tangan + api berkedip fase ABSOLUT + glow hangat
  const makeObor = (parent) => {
    const g = E('g', {}, parent);
    const glow = E('ellipse', { cx: 0, cy: -120, rx: 120, ry: 100, fill: '#ff9a3c', opacity: .16, filter: P.blur(g, 22) }, g);
    E('line', { x1: 0, y1: 26, x2: 0, y2: -104, stroke: '#4a3220', 'stroke-width': 13, 'stroke-linecap': 'round' }, g);
    E('path', { d: 'M-13,-104 L13,-104 L9,-76 L-9,-76 Z', fill: '#5e4630', ...st(2.5) }, g);
    const fl1 = E('ellipse', { cx: 0, cy: -128, rx: 17, ry: 34, fill: '#ff9a3c', opacity: .9 }, g);
    const fl2 = E('ellipse', { cx: 0, cy: -120, rx: 9, ry: 20, fill: '#ffd76a', opacity: .95 }, g);
    return {
      el: g,
      set(H, t, tilt = 0) {
        if (!H) { g.style.display = 'none'; return; }
        g.style.display = '';
        g.setAttribute('transform', `translate(${H[0].toFixed(1)},${H[1].toFixed(1)}) rotate(${tilt.toFixed(1)})`);
        const f = .86 + .14 * Math.sin(t * 11.3) * Math.sin(t * 5.1 + 1);
        fl1.setAttribute('transform', `scale(1,${f.toFixed(3)})`); fl2.setAttribute('transform', `scale(1,${(2 - f).toFixed(3)})`);
        glow.setAttribute('opacity', (.13 + .05 * f).toFixed(3));
      }
    };
  };
  // kursi kayu sederhana
  const chairAt = (shot, x, y, s = 1, flip = 1) => {
    const g = E('g', {}, shot);
    E('path', { d: 'M-52,-150 L-52,0 M52,-150 L52,0', stroke: '#141021', 'stroke-width': 17, 'stroke-linecap': 'round' }, g);
    E('path', { d: 'M-52,-150 L-52,0 M52,-150 L52,0', stroke: '#6e4f30', 'stroke-width': 11, 'stroke-linecap': 'round' }, g);
    E('rect', { x: -64, y: -162, width: 128, height: 17, rx: 6, fill: '#7d5a36', ...st(3) }, g);
    E('path', { d: 'M-46,-162 L-46,-330 M46,-162 L46,-330', stroke: '#141021', 'stroke-width': 15, 'stroke-linecap': 'round' }, g);
    E('path', { d: 'M-46,-162 L-46,-330 M46,-162 L46,-330', stroke: '#6e4f30', 'stroke-width': 9, 'stroke-linecap': 'round' }, g);
    E('rect', { x: -56, y: -336, width: 112, height: 16, rx: 6, fill: '#7d5a36', ...st(3) }, g);
    E('rect', { x: -56, y: -272, width: 112, height: 12, rx: 5, fill: '#75552f', ...st(2.5) }, g);
    tr(g, x, y, s * flip, 0); if (flip < 0) g.setAttribute('transform', `translate(${x},${y}) scale(${-s},${s})`);
    return g;
  };
  // meja makan
  const tableAt = (shot, x, y, s = 1) => {
    const g = E('g', {}, shot);
    E('rect', { x: -250, y: -128, width: 500, height: 26, rx: 8, fill: '#6e4f30', ...st(3.5) }, g);
    E('rect', { x: -236, y: -102, width: 472, height: 10, fill: '#593f26' }, g);
    [-218, 218].forEach(lx => E('path', { d: `M${lx},-102 L${lx},0`, stroke: '#4c3520', 'stroke-width': 16, 'stroke-linecap': 'round' }, g));
    tr(g, x, y, s);
    return g;
  };
  // sepasang sandal jepit (ECU L6)
  const sandalPair = (shot, x, y, s = 1, ang = 0) => {
    const g = E('g', {}, shot);
    [-1, 1].forEach(sd => {
      const sg = E('g', { transform: `translate(${sd * 44},${sd * 8}) rotate(${sd * 7})` }, g);
      E('ellipse', { cx: 0, cy: 0, rx: 40, ry: 15, fill: '#8a4a3a', ...st(3) }, sg);
      E('path', { d: 'M0,-4 L-16,-20 M0,-4 L16,-20 M0,-4 L0,8', fill: 'none', stroke: '#5e2f24', 'stroke-width': 5, 'stroke-linecap': 'round' }, sg);
    });
    g.setAttribute('transform', `translate(${x},${y}) rotate(${ang}) scale(${s})`);
    return g;
  };
  // daun bambu (residu L25)
  const bambooLeaf = (shot, x, y, s = 1, ang = 0) => {
    const g = E('g', {}, shot);
    E('path', { d: 'M-90,0 C-40,-17 40,-15 92,0 C40,13 -40,15 -90,0Z', fill: '#4a7038', ...st(2.5, '#2c4a22') }, g);
    E('path', { d: 'M-88,0 L88,0', stroke: '#2c4a22', 'stroke-width': 2.5 }, g);
    g.setAttribute('transform', `translate(${x},${y}) rotate(${ang}) scale(${s})`);
    return g;
  };
  // lemari kayu (L9/L19)
  const lemariAt = (shot, x, y, s = 1) => {
    const g = E('g', {}, shot);
    E('rect', { x: -120, y: -560, width: 240, height: 560, rx: 8, fill: '#4c3a28', ...st(5) }, g);
    E('rect', { x: -132, y: -584, width: 264, height: 30, rx: 8, fill: '#3c2d1e', ...st(4) }, g);
    E('path', { d: 'M0,-548 L0,-16', stroke: '#2c2015', 'stroke-width': 6 }, g);
    [-64, 64].forEach(dx => { E('rect', { x: dx - 44, y: -520, width: 88, height: 380, rx: 6, fill: 'none', stroke: '#2c2015', 'stroke-width': 4, opacity: .8 }, g); });
    [-16, 16].forEach(dx => E('circle', { cx: dx, cy: -270, r: 9, fill: '#8a6f42', ...st(2.5) }, g));
    [-96, 96].forEach(dx => E('path', { d: `M${dx},0 L${dx},22`, stroke: '#2c2015', 'stroke-width': 12, 'stroke-linecap': 'round' }, g));
    tr(g, x, y, s);
    return g;
  };
  // rumpun bambu: batang bersegmen + rumpun daun (3 nada: jauh/tengah/dekat)
  const bambooCluster = (shot, x, baseY, s, tone) => {
    const cols = { far: ['#33503e', '#2a4434'], mid: ['#3f6b45', '#33573a'], near: ['#1d3325', '#16281d'] };
    const [c1, c2] = cols[tone] || cols.mid;
    const g = E('g', {}, shot);
    const culms = [];
    [[-70, -980], [-24, -1120], [26, -1040], [72, -920]].forEach(([cx, top], i) => {
      const cg = E('g', {}, g);
      E('path', { d: `M${cx},0 L${cx + (i - 1.5) * 9},${top}`, stroke: '#0d1512', 'stroke-width': 21, 'stroke-linecap': 'round' }, cg);
      E('path', { d: `M${cx},0 L${cx + (i - 1.5) * 9},${top}`, stroke: i % 2 ? c1 : c2, 'stroke-width': 14, 'stroke-linecap': 'round' }, cg);
      for (let ny = -170; ny > top; ny -= 168) E('path', { d: `M${cx + (i - 1.5) * 9 * (-ny / top) - 11},${ny} L${cx + (i - 1.5) * 9 * (-ny / top) + 11},${ny}`, stroke: '#0d1512', 'stroke-width': 5, opacity: .55 }, cg);
      culms.push(cg);
      // rumpun daun di pucuk + tengah
      [[cx + (i - 1.5) * 9, top + 30], [cx + (i - 1.5) * 5, top * .55]].forEach(([lx, ly]) => {
        for (let k = 0; k < 5; k++) {
          const a = -160 + k * 38;
          E('path', { d: `M${lx},${ly} C${lx + Math.sin(d2r(a)) * 60},${ly - 26} ${lx + Math.sin(d2r(a)) * 108},${ly + 6} ${lx + Math.sin(d2r(a)) * 132},${ly + 34}`, fill: 'none', stroke: i % 2 ? c1 : c2, 'stroke-width': 9, 'stroke-linecap': 'round' }, cg);
        }
      });
    });
    tr(g, x, baseY, s);
    return { g, culms };
  };
  // ECU ponsel dengan foto sudut ruangan + bayangan tinggi (L9/L18)
  const phonePhoto = (shot, x, y, s = 1) => {
    const g = E('g', {}, shot);
    E('rect', { x: -150, y: -300, width: 300, height: 600, rx: 34, fill: '#0b0e13', ...st(5, '#000') }, g);
    const scr = E('g', {}, g);
    E('rect', { x: -132, y: -278, width: 264, height: 556, rx: 20, fill: '#1a2436' }, scr);
    // foto: ruangan gelap, lantai, sudut kanan berisi bayangan tinggi
    E('rect', { x: -132, y: 60, width: 264, height: 218, fill: '#12161f' }, scr);
    E('path', { d: 'M40,-278 L40,278', stroke: '#05070c', 'stroke-width': 7 }, scr); // garis sudut dinding
    E('path', { d: 'M-132,60 L132,60', stroke: '#05070c', 'stroke-width': 5 }, scr);
    const shadow = E('g', {}, scr);
    E('path', { d: 'M64,58 C60,-40 62,-150 70,-218 C74,-246 92,-246 96,-218 C104,-150 106,-40 102,58 C90,66 76,66 64,58Z', fill: '#010204', opacity: .92 }, shadow);
    E('path', { d: 'M70,-218 C66,-160 66,-90 70,-30 M96,-214 C100,-158 100,-92 97,-34', fill: 'none', stroke: '#000', 'stroke-width': 6, opacity: .6 }, shadow);
    const vig = E('rect', { x: -132, y: -278, width: 264, height: 556, rx: 20, fill: 'none', stroke: '#000', 'stroke-width': 26, opacity: .5 }, scr);
    tr(g, x, y, s);
    return { g, shadow };
  };

  /* ================= SET ================= */
  const skyGnd = (shot, skyFill, gndFill) => {
    E('rect', { x: -320, y: -320, width: 1720, height: 1760, fill: skyFill }, shot);
    E('rect', { x: -320, y: GY, width: 1720, height: 1020, fill: gndFill }, shot);
  };
  const fogBand = (shot, cx, cy, rx, ry, op = .16) => E('ellipse', { cx, cy, rx, ry, fill: '#aebfd4', opacity: op, filter: P.blur(shot, 26) }, shot);
  const stars = (shot, seed, n = 36, yMax = 700) => {
    let sd = seed;
    const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) E('circle', { cx: -280 + rnd() * 1640, cy: -200 + rnd() * yMax, r: 1.6 + rnd() * 2.2, fill: '#dfe9f5', opacity: .35 + rnd() * .5 }, shot);
  };
  const moonAt = (shot, mx, my, mr = 54) => {
    E('circle', { cx: mx, cy: my, r: mr * 2.6, fill: 'url(#moonHalo)' }, shot);
    E('circle', { cx: mx, cy: my, r: mr, fill: '#e8eef4' }, shot);
    E('circle', { cx: mx - mr * .3, cy: my - mr * .2, r: mr * .16, fill: '#cdd8e2', opacity: .7 }, shot);
  };
  // jalan kampung saat maghrib: ramp jingga->indigo, rumah-rumah, rumah kosong di ujung
  function streetDusk(shot, seed) {
    skyGnd(shot, 'url(#duskSky)', '#141210');
    E('circle', { cx: 830, cy: 690, r: 300, fill: '#e88a4a', opacity: .14, filter: P.blur(shot, 40) }, shot);
    // deret rumah jauh (siluet)
    [[-240, 1080, 300, 340], [90, 1040, 340, 380], [470, 1090, 300, 330], [1120, 1060, 320, 360]].forEach(([hx, hy, hw, hh]) => {
      E('rect', { x: hx, y: hy, width: hw, height: hh, fill: '#171423' }, shot);
      E('path', { d: `M${hx - 18},${hy} L${hx + hw / 2},${hy - 92} L${hx + hw + 18},${hy} Z`, fill: '#100d1a' }, shot);
    });
    E('rect', { x: 150, y: 1180, width: 52, height: 66, fill: '#ffb45e', opacity: .55 }, shot); // satu jendela menyala jauh
    // rumah kosong di ujung jalan (kanan, lebih besar, jendela gelap pecah)
    const eh = E('g', {}, shot);
    E('rect', { x: 760, y: 880, width: 380, height: 540, fill: '#131022' }, eh);
    E('path', { d: 'M736,884 L950,772 L1164,884 Z', fill: '#0b0817' }, eh);
    E('rect', { x: 806, y: 1006, width: 92, height: 128, fill: '#05060e' }, eh);
    E('path', { d: 'M806,1006 L898,1134 M898,1006 L806,1134', stroke: '#1d1830', 'stroke-width': 6 }, eh);
    E('rect', { x: 986, y: 1060, width: 96, height: 360, fill: '#080614' }, eh);
    E('path', { d: 'M760,1420 C820,1330 800,1260 850,1180 M1140,1420 C1090,1340 1110,1270 1064,1200', fill: 'none', stroke: '#0a1410', 'stroke-width': 15, 'stroke-linecap': 'round' }, eh);
    // jalan
    E('path', { d: 'M-320,1420 L1400,1420 L1160,2420 L60,2420 Z', fill: '#1b1712' }, shot);
    E('path', { d: 'M560,1420 L700,2420 M330,1420 L330,2420', stroke: '#100d0a', 'stroke-width': 6, opacity: .6 }, shot);
    // pohon dekat kiri (bingkai)
    E('path', { d: 'M-40,1420 C-30,1240 -44,1080 -90,940', fill: 'none', stroke: '#0a0f0c', 'stroke-width': 24, 'stroke-linecap': 'round' }, shot);
    [[-140, 880, 130], [-30, 820, 150], [70, 890, 110]].forEach(([cx, cy, r]) => E('circle', { cx, cy, r, fill: '#0a140d', opacity: .96 }, shot));
    const fog1 = fogBand(shot, 300, 1330, 420, 44, .12), fog2 = fogBand(shot, 820, 1260, 360, 38, .1);
    return { fog1, fog2 };
  }
  // teras rumah warga, petang — satu titik hangat (lampu gantung)
  function porchEve(shot, seed) {
    skyGnd(shot, 'url(#nSky)', '#100d10');
    E('rect', { x: -320, y: 240, width: 1720, height: 1180, fill: '#241a20' }, shot); // dinding rumah
    E('path', { d: 'M-320,240 L1400,240 L1400,330 L-320,330 Z', fill: '#171017' }, shot); // lisplang/atap
    [-200, 1180].forEach(px => E('rect', { x: px, y: 330, width: 34, height: 1090, fill: '#2e2126' }, shot)); // tiang teras
    E('rect', { x: 120, y: 560, width: 210, height: 300, fill: '#120c10' }, shot); // jendela gelap
    E('rect', { x: 120, y: 560, width: 210, height: 300, fill: 'none', stroke: '#0a0608', 'stroke-width': 9 }, shot);
    E('rect', { x: 700, y: 480, width: 190, height: 940, fill: '#170f13' }, shot); // pintu
    // lampu gantung + glow hangat
    E('path', { d: 'M540,330 L540,430', stroke: '#0a0608', 'stroke-width': 6 }, shot);
    const glow = E('ellipse', { cx: 540, cy: 500, rx: 250, ry: 190, fill: 'url(#lampGlow)' }, shot);
    E('path', { d: 'M512,430 L568,430 L560,478 L520,478 Z', fill: '#0d0a0c' }, shot);
    E('circle', { cx: 540, cy: 492, r: 17, fill: '#ffd9a0' }, shot);
    // bangku panjang + pot
    E('rect', { x: 60, y: 1300, width: 460, height: 26, rx: 8, fill: '#33231c' }, shot);
    [-0, 0].forEach(() => {});
    E('path', { d: 'M90,1326 L90,1420 M490,1326 L490,1420', stroke: '#241811', 'stroke-width': 14 }, shot);
    E('path', { d: 'M980,1420 L990,1330 L1060,1330 L1070,1420 Z', fill: '#3a2a20' }, shot);
    E('path', { d: 'M1025,1330 C1000,1270 980,1250 950,1220 M1025,1330 C1040,1266 1066,1240 1096,1218 M1025,1330 C1025,1260 1018,1230 1004,1196', fill: 'none', stroke: '#14251a', 'stroke-width': 9, 'stroke-linecap': 'round' }, shot);
    const fog1 = fogBand(shot, 900, 1350, 380, 40, .08);
    return { fog1, glow };
  }
  // halaman rumah Bimo, sore menjelang maghrib
  function yardBimo(shot, seed) {
    skyGnd(shot, 'url(#duskSky)', '#151a12');
    E('circle', { cx: 240, cy: 640, r: 260, fill: '#e88a4a', opacity: .12, filter: P.blur(shot, 40) }, shot);
    // sisi rumah kiri + pintu + jendela hangat
    E('rect', { x: -320, y: 700, width: 560, height: 720, fill: '#1d1626' }, shot);
    E('path', { d: 'M-340,706 L100,596 L260,706 Z', fill: '#120d1c' }, shot);
    E('rect', { x: -60, y: 960, width: 130, height: 460, fill: '#0d0a18' }, shot);
    E('rect', { x: 110, y: 920, width: 96, height: 110, fill: '#ffb45e', opacity: .4 }, shot);
    // pagar bambu belakang
    for (let i = 0; i < 9; i++) E('path', { d: `M${330 + i * 96},1420 L${322 + i * 96},1120`, stroke: '#0f1a12', 'stroke-width': 13, 'stroke-linecap': 'round' }, shot);
    E('path', { d: 'M300,1200 L1180,1200 M300,1310 L1180,1310', stroke: '#0f1a12', 'stroke-width': 9 }, shot);
    // pohon mangga kanan + kanopi
    E('path', { d: 'M1010,1420 C1018,1260 1006,1120 968,990', fill: 'none', stroke: '#0b120c', 'stroke-width': 21, 'stroke-linecap': 'round' }, shot);
    [[920, 920, 130], [1040, 850, 150], [1150, 930, 115]].forEach(([cx, cy, r]) => E('circle', { cx, cy, r, fill: '#0c1a10', opacity: .97 }, shot));
    // tali jemuran + 2 kain (ref sway fase absolut)
    E('path', { d: 'M240,880 C480,830 700,830 950,890', fill: 'none', stroke: '#05070a', 'stroke-width': 4 }, shot);
    const cloth1 = E('path', { d: 'M380,852 L470,846 L474,986 L384,992 Z', fill: '#5e3a4a', opacity: .92 }, shot);
    const cloth2 = E('path', { d: 'M620,838 L706,840 L710,962 L624,960 Z', fill: '#3c4a5e', opacity: .92 }, shot);
    const fog1 = fogBand(shot, 640, 1340, 430, 42, .1);
    return { fog1, cloth1, cloth2 };
  }
  // interior rumah (ruang tamu / ruang makan) — lampu gantung hangat atau cahaya pagi
  function homeInt(shot, seed, morning = false) {
    E('rect', { x: -320, y: -320, width: 1720, height: 1740, fill: morning ? '#2c2a30' : '#1d1620' }, shot);
    E('rect', { x: -320, y: GY, width: 1720, height: 1020, fill: morning ? '#241d18' : '#171017' }, shot);
    E('path', { d: 'M-320,1420 L1400,1420', stroke: '#0a0608', 'stroke-width': 7 }, shot);
    // jendela kanan: cahaya pagi sejuk / gelap malam
    E('rect', { x: 880, y: 420, width: 300, height: 460, fill: morning ? '#9db8cc' : '#0a0f1e' }, shot);
    E('rect', { x: 880, y: 420, width: 300, height: 460, fill: 'none', stroke: '#0a0608', 'stroke-width': 12 }, shot);
    E('path', { d: 'M1030,420 L1030,880 M880,650 L1180,650', stroke: '#0a0608', 'stroke-width': 9 }, shot);
    if (morning) E('path', { d: 'M880,880 L1180,880 L1330,1420 L700,1420 Z', fill: '#cfe0ee', opacity: .13 }, shot);
    // pintu kiri
    E('rect', { x: -140, y: 500, width: 220, height: 920, fill: morning ? '#241c20' : '#120c12' }, shot);
    E('circle', { cx: 52, cy: 980, r: 10, fill: '#8a6f42' }, shot);
    // lampu gantung tengah
    E('path', { d: 'M540,-320 L540,120', stroke: '#0a0608', 'stroke-width': 6 }, shot);
    const glow = E('ellipse', { cx: 540, cy: 210, rx: 300, ry: 200, fill: 'url(#lampGlow)', opacity: morning ? .25 : .8 }, shot);
    E('path', { d: 'M496,120 L584,120 L568,196 L512,196 Z', fill: '#0d0a0c' }, shot);
    if (!morning) E('circle', { cx: 540, cy: 208, r: 15, fill: '#ffd9a0' }, shot);
    // kalender + foto keluarga kecil di dinding (detail hidup)
    E('rect', { x: 330, y: 470, width: 92, height: 120, fill: '#cbbfa8', opacity: .5 }, shot);
    E('rect', { x: 620, y: 440, width: 130, height: 100, fill: '#0f0b10' }, shot);
    E('rect', { x: 620, y: 440, width: 130, height: 100, fill: 'none', stroke: '#3a2c20', 'stroke-width': 6 }, shot);
    return { glow };
  }
  // depan rumah kosong — dinding retak, pintu (grup bisa berderit), jendela pecah
  function emptyExt(shot, seed) {
    skyGnd(shot, 'url(#nSky)', '#0e1210');
    stars(shot, seed + 5, 26, 560);
    E('rect', { x: 130, y: 620, width: 820, height: 800, fill: '#181423' }, shot);
    E('path', { d: 'M104,626 L540,500 L976,626 Z', fill: '#0d0a18' }, shot);
    E('path', { d: 'M976,626 L1040,660 L1040,760 L976,720 Z', fill: '#0d0a18', opacity: .8 }, shot); // atap miring rusak
    // retakan dinding
    E('path', { d: 'M300,700 L330,790 L306,860 L344,950', fill: 'none', stroke: '#08060f', 'stroke-width': 5, opacity: .8 }, shot);
    E('path', { d: 'M760,760 L736,850 L762,930', fill: 'none', stroke: '#08060f', 'stroke-width': 4, opacity: .7 }, shot);
    // jendela pecah kiri
    E('rect', { x: 226, y: 830, width: 150, height: 190, fill: '#04050c' }, shot);
    E('path', { d: 'M226,830 L300,920 L376,830 M300,920 L300,1020 M226,940 L376,900', stroke: '#241c30', 'stroke-width': 6, fill: 'none' }, shot);
    // pintu: grup berengsel di x=640 — bisa berderit terbuka (rotasi semu via skew/scaleX ringan + celah cahaya)
    const doorG = E('g', {}, shot);
    E('rect', { x: 640, y: 780, width: 170, height: 640, fill: '#060510' }, doorG); // kegelapan di balik pintu
    const doorSlit = E('rect', { x: 640, y: 780, width: 0, height: 640, fill: '#39466a', opacity: .5 }, doorG);
    const door = E('g', {}, doorG);
    E('rect', { x: 640, y: 780, width: 170, height: 640, fill: '#241a20', ...st(5, '#0a060a') }, door);
    E('path', { d: 'M664,830 L664,1050 M664,1120 L664,1370 M786,830 L786,1050 M786,1120 L786,1370', stroke: '#170f14', 'stroke-width': 5 }, door);
    E('circle', { cx: 786, cy: 1110, r: 10, fill: '#6e5a34' }, door);
    // semak + rumput liar di depan
    E('path', { d: 'M130,1420 C180,1330 160,1260 220,1190 M950,1420 C910,1340 940,1270 890,1200 M420,1420 C440,1350 430,1300 460,1240', fill: 'none', stroke: '#0a140d', 'stroke-width': 13, 'stroke-linecap': 'round' }, shot);
    [[180, 1210, 90], [920, 1220, 84], [450, 1260, 60]].forEach(([cx, cy, r]) => E('circle', { cx, cy, r, fill: '#0a140d', opacity: .9 }, shot));
    const fog1 = fogBand(shot, 420, 1340, 430, 44, .13), fog2 = fogBand(shot, 860, 1270, 330, 36, .1);
    const doorApi = { set(k) { const sx = 1 - k * .3; door.setAttribute('transform', `translate(640,0) scale(${sx.toFixed(3)},1) translate(-640,0)`); doorSlit.setAttribute('x', (640 + 170 * sx).toFixed(1)); doorSlit.setAttribute('width', (170 * (1 - sx)).toFixed(1)); } };
    doorApi.set(0);
    return { fog1, fog2, doorApi };
  }
  // interior rumah kosong — sudut ruangan, papan lantai, jaring laba-laba, debu beterbangan
  function emptyInt(shot, seed, withLemari = false) {
    E('rect', { x: -320, y: -320, width: 1720, height: 1740, fill: '#0d0b14' }, shot);
    E('rect', { x: -320, y: GY, width: 1720, height: 1020, fill: '#0a0810' }, shot);
    // sudut ruangan di x=712 (dua dinding bertemu) — pusat cerita L16/L18
    E('path', { d: 'M712,-320 L712,1420', stroke: '#050409', 'stroke-width': 9 }, shot);
    E('rect', { x: 712, y: -320, width: 688, height: 1740, fill: '#0a0812' }, shot);
    E('path', { d: 'M-320,1420 L1400,1420', stroke: '#040308', 'stroke-width': 8 }, shot);
    [-140, 180, 500, 900, 1220].forEach(fx => E('path', { d: `M${fx},1420 L${fx - 60},2420`, stroke: '#050409', 'stroke-width': 5, opacity: .7 }, shot));
    // jaring laba-laba di sudut atas
    const web = E('g', { opacity: .5 }, shot);
    [[712, -320], [712, -320], [712, -320]].forEach(() => {});
    E('path', { d: 'M712,-200 L830,-320 M712,-110 L880,-320 M712,-40 L920,-280', stroke: '#8a94a8', 'stroke-width': 2.4, fill: 'none' }, web);
    E('path', { d: 'M740,-238 Q790,-226 806,-196 M768,-160 Q826,-146 852,-108 M800,-84 Q852,-70 884,-40', stroke: '#8a94a8', 'stroke-width': 2, fill: 'none' }, web);
    // noda lembap dinding + cat mengelupas
    E('ellipse', { cx: 300, cy: 900, rx: 130, ry: 190, fill: '#080610', opacity: .8 }, shot);
    E('path', { d: 'M1080,300 C1120,420 1100,560 1140,700', fill: 'none', stroke: '#060510', 'stroke-width': 16, opacity: .7 }, shot);
    if (withLemari) lemariAt(shot, 300, GY, .92);
    // partikel debu (di-QC gerak 3 frame — digerakkan fase absolut di scene)
    const motes = [];
    let sd = seed;
    const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 7; i++) {
      const m = E('circle', { cx: 0, cy: 0, r: 3 + rnd() * 3.4, fill: '#cfd8e6', opacity: .14 + rnd() * .16 }, shot);
      motes.push({ el: m, bx: -100 + rnd() * 1280, by: 300 + rnd() * 900, ph: rnd() * TAU, sp: .12 + rnd() * .2 });
    }
    const fog1 = fogBand(shot, 760, 1290, 400, 40, .09);
    return { motes, fog1 };
  }
  // kebun bambu tengah malam — 3 lapis rumpun + kabut + jalan setapak
  function bambooNight(shot, seed) {
    skyGnd(shot, 'url(#nSky)', '#0a0f0c');
    stars(shot, seed + 9, 22, 480);
    moonAt(shot, 880, 300, 44);
    bambooCluster(shot, 90, GY, .92, 'far'); bambooCluster(shot, 480, GY, .95, 'far'); bambooCluster(shot, 900, GY, .9, 'far');
    const fog1 = fogBand(shot, 380, 1180, 460, 52, .15), fog2 = fogBand(shot, 820, 1300, 420, 46, .13);
    // jalan setapak terang di tengah
    E('path', { d: 'M430,1420 L650,1420 L760,2420 L280,2420 Z', fill: '#131a13' }, shot);
    const mid1 = bambooCluster(shot, -60, GY, 1.06, 'mid'), mid2 = bambooCluster(shot, 1060, GY, 1.04, 'mid');
    const near1 = bambooCluster(shot, -190, GY, 1.22, 'near'), near2 = bambooCluster(shot, 1210, GY, 1.2, 'near');
    return { fog1, fog2, mid1, mid2, near1, near2 };
  }
  // gerbang kampung sore
  function gateDusk(shot, seed) {
    skyGnd(shot, 'url(#duskSky)', '#141210');
    E('circle', { cx: 300, cy: 660, r: 260, fill: '#e88a4a', opacity: .12, filter: P.blur(shot, 40) }, shot);
    [[60, 1100, 260, 320], [820, 1080, 300, 340]].forEach(([hx, hy, hw, hh]) => {
      E('rect', { x: hx, y: hy, width: hw, height: hh, fill: '#171423' }, shot);
      E('path', { d: `M${hx - 16},${hy} L${hx + hw / 2},${hy - 80} L${hx + hw + 16},${hy} Z`, fill: '#100d1a' }, shot);
    });
    // gapura bambu: 2 tiang + balok atas + atap kecil
    const gp = E('g', {}, shot);
    [-1, 1].forEach(sd => {
      E('path', { d: `M${540 + sd * 330},1420 L${540 + sd * 322},620`, stroke: '#0d0a08', 'stroke-width': 34, 'stroke-linecap': 'round' }, gp);
      E('path', { d: `M${540 + sd * 330},1420 L${540 + sd * 322},620`, stroke: '#4a3a24', 'stroke-width': 24, 'stroke-linecap': 'round' }, gp);
      [760, 980, 1200].forEach(ny => E('path', { d: `M${540 + sd * 326 - 15},${ny} L${540 + sd * 326 + 15},${ny}`, stroke: '#0d0a08', 'stroke-width': 6, opacity: .6 }, gp));
    });
    E('path', { d: 'M196,640 L884,640', stroke: '#0d0a08', 'stroke-width': 30, 'stroke-linecap': 'round' }, gp);
    E('path', { d: 'M196,640 L884,640', stroke: '#54432a', 'stroke-width': 20, 'stroke-linecap': 'round' }, gp);
    E('path', { d: 'M150,620 L540,520 L930,620 L880,648 L540,556 L200,648 Z', fill: '#171021' }, gp);
    E('path', { d: 'M-320,1420 L1400,1420 L1150,2420 L80,2420 Z', fill: '#1b1712' }, shot);
    const fog1 = fogBand(shot, 540, 1340, 440, 42, .1);
    return { fog1 };
  }
  // foreground gelap pembingkai (§7: dahan/jendela di depan kamera)
  function fgDark(shot, kind = 'leaves') {
    const g = E('g', {}, shot);
    if (kind === 'leaves') {
      E('path', { d: 'M-320,-320 C-120,-240 -40,-120 -60,60 C-160,-40 -260,-60 -320,-40 Z', fill: '#04070a', opacity: .92 }, g);
      E('path', { d: 'M1400,-320 C1240,-260 1180,-140 1200,20 C1290,-60 1360,-70 1400,-60 Z', fill: '#04070a', opacity: .92 }, g);
      E('path', { d: 'M-320,2420 C-100,2300 100,2360 240,2420 Z M900,2420 C1080,2320 1260,2360 1400,2420 Z', fill: '#04070a', opacity: .9 }, g);
    } else if (kind === 'bamboo') {
      E('path', { d: 'M-90,-320 L-30,-320 L-52,2420 L-120,2420 Z', fill: '#060b08', opacity: .95 }, g);
      E('path', { d: 'M1130,-320 L1196,-320 L1220,2420 L1150,2420 Z', fill: '#060b08', opacity: .95 }, g);
      E('path', { d: 'M-60,300 C60,340 120,420 150,540 M1180,240 C1080,300 1020,390 996,500', fill: 'none', stroke: '#060b08', 'stroke-width': 15, 'stroke-linecap': 'round' }, g);
    } else if (kind === 'door') {
      E('path', { d: 'M-320,-320 L60,-320 L60,2420 L-320,2420 Z M1020,-320 L1400,-320 L1400,2420 L1020,2420 Z', fill: '#030308', opacity: .94 }, g);
    }
    return g;
  }

  /* ================= PEMBANTU BERSAMA adegan ================= */
  const TL = S.TL;
  const lineT = i => TL.lines[i].t, lineD = i => TL.lines[i].d;
  // kamera sub-shot: pusat (cx,cy) + skala melayang halus dari (s0) ke (s1) selama [a,b]
  const shotCam = (g, t, a, b, cx0, cy0, s0, cx1, cy1, s1) => {
    const k = eio(clamp((t - a) / (b - a)));
    const s = lerp(s0, s1, k);
    tr(g, 540 - s * lerp(cx0, cx1, k), 960 - s * lerp(cy0, cy1, k), s);
  };
  // ambien kabut — FASE ABSOLUT
  const ambFog = (set, t, bx = 420) => {
    if (set.fog1) set.fog1.setAttribute('cx', (bx + Math.sin(t * .1 + 1) * 42).toFixed(1));
    if (set.fog2) set.fog2.setAttribute('cx', (860 + Math.sin(t * .083 + 3) * 48).toFixed(1));
  };
  const ambMotes = (set, t) => {
    if (!set.motes) return;
    set.motes.forEach(m => {
      m.el.setAttribute('cx', (m.bx + Math.sin(t * m.sp + m.ph) * 34).toFixed(1));
      m.el.setAttribute('cy', (m.by + Math.cos(t * m.sp * .8 + m.ph) * 26 - (t * 2.2 % 60)).toFixed(1));
    });
  };
  const ambYard = (set, t) => {
    ambFog(set, t, 640);
    if (set.cloth1) set.cloth1.setAttribute('transform', `rotate(${(Math.sin(t * .8) * 2.4).toFixed(2)} 425 849)`);
    if (set.cloth2) set.cloth2.setAttribute('transform', `rotate(${(Math.sin(t * .8 + 1.4) * 2.1).toFixed(2)} 663 839)`);
  };
  // grup KEDIP layar penuh (perbaikan temuan sendiri): kelopak menutup dari
  // atas+bawah — dipakai untuk memarkahi vanish hantu & potong POV.
  const makeLids = (shot) => {
    const g = E('g', {}, shot);
    const top = E('rect', { x: -320, y: -320, width: 1720, height: 0, fill: '#000' }, g);
    const bot = E('rect', { x: -320, y: 2420, width: 1720, height: 0, fill: '#000' }, g);
    return { set(k) { const h = k * 1240; top.setAttribute('height', h.toFixed(0)); bot.setAttribute('y', (2420 - h).toFixed(0)); bot.setAttribute('height', h.toFixed(0)); } };
  };

  /* ================= DEFS BERSAMA =================
     WAJIB di svg tersendiri yang SELALU dirender (bukan di dalam scene):
     paint server di dalam scene display:none tidak ter-resolve di scene lain
     (pelajaran stills gate Ep.6). Dipakai set-set: url(#duskSky), url(#nSky),
     url(#moonHalo), url(#lampGlow). */
  const sc0 = scene(world, 'magrib', 'cut');
  {
    const defsSvg = E('svg', { width: 0, height: 0, style: 'position:absolute' }, world);
    const SD = E('defs', {}, defsSvg);
    const dusk = E('linearGradient', { id: 'duskSky', x1: 0, y1: 0, x2: 0, y2: 1 }, SD);
    E('stop', { offset: 0, 'stop-color': '#131c3d' }, dusk); E('stop', { offset: .52, 'stop-color': '#3c3054' }, dusk); E('stop', { offset: .78, 'stop-color': '#a34e2c' }, dusk); E('stop', { offset: 1, 'stop-color': '#e88a4a' }, dusk);
    const nsk = E('linearGradient', { id: 'nSky', x1: 0, y1: 0, x2: 0, y2: 1 }, SD);
    E('stop', { offset: 0, 'stop-color': '#060a1c' }, nsk); E('stop', { offset: .6, 'stop-color': '#0d1730' }, nsk); E('stop', { offset: 1, 'stop-color': '#122036' }, nsk);
    const halo = E('radialGradient', { id: 'moonHalo' }, SD);
    E('stop', { offset: 0, 'stop-color': '#dfe9f5', 'stop-opacity': .3 }, halo); E('stop', { offset: 1, 'stop-color': '#dfe9f5', 'stop-opacity': 0 }, halo);
    const lamp = E('radialGradient', { id: 'lampGlow' }, SD);
    E('stop', { offset: 0, 'stop-color': '#ffca7a', 'stop-opacity': .5 }, lamp); E('stop', { offset: 1, 'stop-color': '#ffca7a', 'stop-opacity': 0 }, lamp);
  }

  /* ================= ADEGAN ================= */
  // L1 (idx0) MAGRIB — jalan kampung, anak-anak bergegas pulang; ECU jendela rumah kosong; narator berjalan
  {
    const sc = sc0;
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    const setA = streetDusk(A, 11);
    const bimo = Bimo(A, {}), rian = Rian(A, {}), ibu = Ibu(A, {});
    streetDusk(B, 12);
    streetDusk(C, 13);
    const nar = Narator(C, {});
    during('magrib', 'magribe', (t) => {
      const t0 = lineT(0), d = lineD(0), b1 = t0 + d * .38, b2 = t0 + d * .68;
      const ph = clamp((t - t0) / (d * .38));
      const wx = Math.abs(Math.sin(t * 6.4)) * 13, wx2 = Math.abs(Math.sin(t * 7.6)) * 15;
      bimo.set({ la: [26 + Math.sin(t * 6.4) * 16, -20], ra: [26 - Math.sin(t * 6.4) * 16, -20], legL: [Math.sin(t * 6.4) * 17, 6], legR: [-Math.sin(t * 6.4) * 17, 6], blink: blinkAt(t, 3) });
      tr(bimo.g, lerp(930, 640, ph), GY - wx * .3, .92);
      rian.set({ la: [30 - Math.sin(t * 7.6) * 18, -22], ra: [30 + Math.sin(t * 7.6) * 18, -22], legL: [-Math.sin(t * 7.6) * 19, 6], legR: [Math.sin(t * 7.6) * 19, 6], blink: blinkAt(t, 8) });
      tr(rian.g, lerp(120, 470, ph), GY - wx2 * .3, .8);
      ibu.set({ la: [24 + Math.sin(t * 5.6) * 13, -20], ra: [24 - Math.sin(t * 5.6) * 13, -20], legL: [Math.sin(t * 5.6) * 15, 5], legR: [-Math.sin(t * 5.6) * 15, 5], blink: blinkAt(t, 5) });
      tr(ibu.g, lerp(1150, 950, ph), GY, .78);
      ambFog(setA, t, 300);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 1030, 1.10, 520, 1010, 1.18);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 853, 1066, 2.30, 853, 1066, 2.38);
      const phC = clamp((t - b2) / (d * .32)), gl = bump((t - b2) / (d * .32), .3, .95);
      nar.set({ la: [24 + Math.sin(t * 5.2) * 12, -20], ra: [24 - Math.sin(t * 5.2) * 12, -20], legL: [Math.sin(t * 5.2) * 14, 5], legR: [-Math.sin(t * 5.2) * 14, 5], headR: gl * 13, blink: blinkAt(t, 6) });
      tr(nar.g, lerp(240, 330, phC), GY, .95);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 330, 1010, 1.30, 345, 1000, 1.38);
    });
  }

  // L2 (idx1) DARMA — teras petang; nasihat dengan gestur telapak terbuka (TIDAK menunjuk, PR §6.1)
  {
    const sc = scene(world, 'darma', 'cut');
    const mk = (seed) => {
      const g = E('g', {}, sc.cam), set = porchEve(g, seed);
      const darma = Darma7(g, {}), nar = Narator(g, {});
      tr(darma.g, 430, 1566, .95); tr(nar.g, 830, GY, .92);
      return { g, set, darma, nar };
    };
    const A = mk(21), B = mk(22), C = mk(23);
    during('darma', 'darmae', (t) => {
      const t0 = lineT(1), d = lineD(1), b1 = t0 + d * .42, b2 = t0 + d * .74;
      const talk = .45 + .55 * Math.abs(Math.sin(t * 7.1));
      const ph = (t - t0) / d;
      const up = bump(ph, .06, .3) - bump(ph, .62, .9);
      [A, B, C].forEach((S2, i) => {
        S2.darma.set({ la: [20 + up * 8, -22], ra: [22 + up * 46, -24 - up * 52], talk, legL: [78, -66], legR: [-84, 72], blink: blinkAt(t, 2), headR: Math.sin(t * .7) * 2 });
        S2.nar.set({ la: [18, -18], ra: [18, -18], blink: blinkAt(t, 9), fear: i === 2 ? .45 : .15, headR: i === 2 ? -11 : -4 });
        ambFog(S2.set, t, 900);
      });
      A.g.style.display = t < b1 ? '' : 'none';
      shotCam(A.g, t, t0, b1, 620, 1080, 1.12, 605, 1070, 1.18);
      B.g.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B.g, t, b1, b2, 430, 990, 1.58, 430, 985, 1.66);
      C.g.style.display = t >= b2 ? '' : 'none';
      shotCam(C.g, t, b2, t0 + d, 830, 760, 1.52, 830, 758, 1.60);
    });
  }

  // L3 (idx2) SIMPAN — Darma memeragakan "menyimpan" (dua telapak menengadah); ECU tangan; bayangan tinggi di dinding
  {
    const sc = scene(world, 'simpan', 'cut');
    const mk = (seed) => {
      const g = E('g', {}, sc.cam), set = porchEve(g, seed);
      const darma = Darma7(g, {}); tr(darma.g, 430, 1566, .95);
      return { g, set, darma };
    };
    const A = mk(31), B = mk(32);
    const C = E('g', {}, sc.cam); porchEve(C, 33);
    const sh = E('path', { d: 'M880,1420 C868,1180 872,940 888,760 C894,694 946,694 952,760 C968,940 972,1180 960,1420 C932,1434 908,1434 880,1420Z', fill: '#05040a', opacity: 0 }, C);
    during('simpan', 'simpane', (t) => {
      const t0 = lineT(2), d = lineD(2), b1 = t0 + d * .4, b2 = t0 + d * .7;
      const talk = .45 + .55 * Math.abs(Math.sin(t * 6.8));
      const rock = Math.sin(t * 1.25) * 3;
      [A, B].forEach(S2 => {
        S2.darma.set({ la: [58 + rock, -100], ra: [58 - rock, -100], talk, legL: [78, -66], legR: [-84, 72], blink: blinkAt(t, 4), headR: -3 });
        ambFog(S2.set, t, 900);
      });
      A.g.style.display = t < b1 ? '' : 'none';
      shotCam(A.g, t, t0, b1, 430, 1120, 1.34, 430, 1114, 1.44);
      B.g.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B.g, t, b1, b2, 430, 1258, 2.28, 430, 1255, 2.36);
      const k = bump((t - b2) / (d * .3), .1, .95);
      sh.setAttribute('opacity', (k * .5).toFixed(3));
      sh.setAttribute('transform', `translate(${Math.sin(t * .5) * 5},0)`);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 920, 1060, 1.26, 920, 1052, 1.34);
    });
  }

  // L4 (idx3) BIMO — halaman sore; Bimo bermain; ayah-ibu pamit pergi (keluar bingkai fisik)
  {
    const sc = scene(world, 'bimo', 'cut');
    const A = E('g', {}, sc.cam), setA = yardBimo(A, 41);
    const bimoA = Bimo(A, {}), ball = E('circle', { cx: 0, cy: 0, r: 30, fill: '#a03c30', ...st(3) }, A);
    const ayahA = Ayah(A, {}), ibuA = Ibu(A, {});
    const B = E('g', {}, sc.cam), setB = yardBimo(B, 42);
    const ayah = Ayah(B, {}), ibu = Ibu(B, {});
    const C = E('g', {}, sc.cam), setC = yardBimo(C, 43);
    const bimoC = Bimo(C, {});
    E('circle', { cx: 906, cy: 1392, r: 30, fill: '#a03c30', ...st(3) }, C);
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: '#0a1030', opacity: .3 }, C);
    during('bimo', 'bimoe', (t) => {
      const t0 = lineT(3), d = lineD(3), b1 = t0 + d * .36, b2 = t0 + d * .68;
      const kick = bump((t - t0) / (d * .36), .3, .42), roll = bump((t - t0) / (d * .36), .38, .95);
      ball.setAttribute('cx', (716 + roll * 190).toFixed(0)); ball.setAttribute('cy', (1392 - Math.sin(roll * Math.PI) * 26).toFixed(0));
      bimoA.set({ la: [30, -24], ra: [30 - kick * 26, -24], legL: [8, 4], legR: [-kick * 34, 8], blink: blinkAt(t, 3), mood: 'smile' });
      tr(bimoA.g, 640, GY, .95);
      ayahA.set({ la: [20, -20], ra: [20, -20], blink: blinkAt(t, 7) }); tr(ayahA.g, 96, GY, .8);
      ibuA.set({ la: [20, -20], ra: [20, -20], blink: blinkAt(t, 11) }); tr(ibuA.g, 268, GY, .82);
      ambYard(setA, t);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 560, 1040, 1.12, 575, 1032, 1.18);
      const phB = clamp((t - b1) / (d * .32)), leave = bump(phB, .34, 1);
      const wave = Math.sin(t * 5.2) * 16 * (1 - leave);
      const talkI = phB < .34 ? .45 + .55 * Math.abs(Math.sin(t * 7.4)) : 0;
      const wxA = Math.abs(Math.sin(t * 5.4)) * 12 * leave, wxI = Math.abs(Math.sin(t * 5.9)) * 11 * leave;
      ayah.set({ la: [22, -22], ra: [22 - leave * 8, -22], legL: [Math.sin(t * 5.4) * 16 * leave, 5], legR: [-Math.sin(t * 5.4) * 16 * leave, 5], blink: blinkAt(t, 7), headR: -leave * 6 });
      tr(ayah.g, lerp(330, -260, leave), GY - wxA * .3, .92);
      ibu.set({ la: [22, -22], ra: [96 + wave, -96], talk: talkI, legL: [Math.sin(t * 5.9) * 15 * leave, 5], legR: [-Math.sin(t * 5.9) * 15 * leave, 5], blink: blinkAt(t, 11), headR: -leave * 5 });
      tr(ibu.g, lerp(520, -60, leave), GY - wxI * .3, .94);
      ambYard(setB, t);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 420, 1000, 1.34, 405, 995, 1.42);
      bimoC.set({ la: [24, -20], ra: [24, -20], blink: blinkAt(t, 3), headR: -7, mood: 'flat' });
      tr(bimoC.g, 640, GY, .95);
      ambYard(setC, t);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 620, 1030, 1.12, 628, 1024, 1.17);
    });
  }

  // L5 (idx4) HILANG — ibu mencari ke seluruh rumah & halaman; ECU kasur/bola kosong
  {
    const sc = scene(world, 'hilang', 'cut');
    const A = E('g', {}, sc.cam); homeInt(A, 51, false);
    const ibu = Ibu(A, {});
    const B = E('g', {}, sc.cam), setB = yardBimo(B, 52);
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: '#060a24', opacity: .45 }, B);
    const ibuB = Ibu(B, {});
    const C = E('g', {}, sc.cam); homeInt(C, 53, false);
    E('rect', { x: 330, y: 1330, width: 420, height: 52, rx: 14, fill: '#3c3444', ...st(3) }, C);
    E('rect', { x: 352, y: 1296, width: 130, height: 44, rx: 16, fill: '#8a8296', ...st(3) }, C);
    E('circle', { cx: 880, cy: 1396, r: 27, fill: '#a03c30', ...st(3) }, C);
    const motesC = [0, 1, 2].map(i => E('circle', { cx: 0, cy: 0, r: 3.4, fill: '#cfd8e6', opacity: .2 }, C));
    during('hilang', 'hilange', (t) => {
      const t0 = lineT(4), d = lineD(4), b1 = t0 + d * .38, b2 = t0 + d * .72;
      const phA = clamp((t - t0) / (d * .38));
      const call = (bump(phA, .1, .3) - bump(phA, .5, .7)) + (bump(phA, .62, .82) - bump(phA, .9, 1));
      ibu.set({ la: [22 + call * 66, -22 - call * 76], ra: [22 + call * 66, -22 - call * 76], talk: call > .3 ? .5 + .5 * Math.abs(Math.sin(t * 7.6)) : 0, legL: [Math.sin(t * 5.6) * 15, 5], legR: [-Math.sin(t * 5.6) * 15, 5], blink: blinkAt(t, 6), fear: .55, headR: Math.sin(t * .9) * 9 });
      tr(ibu.g, lerp(190, 800, phA), GY - Math.abs(Math.sin(t * 5.6)) * 4, .94);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 500, 1010, 1.14, 520, 1004, 1.19);
      const callB = bump((t - b1) / (d * .34), .15, .4) - bump((t - b1) / (d * .34), .7, .95);
      ibuB.set({ la: [22 + callB * 68, -22 - callB * 78], ra: [22 + callB * 68, -22 - callB * 78], talk: callB > .3 ? .5 + .5 * Math.abs(Math.sin(t * 7.2)) : 0, blink: blinkAt(t, 6), fear: .7, headR: Math.sin(t * .8) * 13 });
      tr(ibuB.g, 560, GY, .97);
      ambYard(setB, t);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 560, 990, 1.38, 560, 984, 1.46);
      motesC.forEach((m, i) => {
        m.setAttribute('cx', (520 + i * 130 + Math.sin(t * .3 + i * 2) * 26).toFixed(0));
        m.setAttribute('cy', (900 + i * 120 + Math.cos(t * .24 + i) * 20).toFixed(0));
      });
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 560, 1300, 2.26, 560, 1296, 2.34);
    });
  }

  // L6 (idx5) SANDAL — rumah kosong malam; ECU sepasang sandal rapi di depan pintu
  {
    const sc = scene(world, 'sandal', 'cut');
    const A = E('g', {}, sc.cam), setA = emptyExt(A, 61);
    const nar = Narator(A, {}), ayah = Ayah(A, {});
    const sen = makeSenter(nar.g);
    const B = E('g', {}, sc.cam); emptyExt(B, 62);
    E('rect', { x: 520, y: 1402, width: 380, height: 40, rx: 8, fill: '#232030', ...st(3, '#0c0a14') }, B); // undakan batu di depan pintu (mengisi bawah frame ECU)
    sandalPair(B, 706, 1396, 1.15, -3);
    E('path', { d: 'M470,1442 C478,1390 470,1350 486,1310 M940,1442 C934,1394 944,1356 928,1318 M540,1442 C544,1410 540,1384 550,1358', fill: 'none', stroke: '#0c1810', 'stroke-width': 9, 'stroke-linecap': 'round' }, B);
    E('ellipse', { cx: 706, cy: 1370, rx: 210, ry: 120, fill: '#ffe9b0', opacity: .1, filter: P.blur(B, 24) }, B);
    const C = E('g', {}, sc.cam); emptyExt(C, 63);
    const narC = Narator(C, {});
    during('sandal', 'sandale', (t) => {
      const t0 = lineT(5), d = lineD(5), b1 = t0 + d * .4, b2 = t0 + d * .72;
      const phA = clamp((t - t0) / (d * .4));
      nar.set({ la: [20, -20], ra: [52, -30], legL: [Math.sin(t * 4.6) * 11, 5], legR: [-Math.sin(t * 4.6) * 11, 5], blink: blinkAt(t, 4), fear: .4 });
      tr(nar.g, lerp(60, 210, phA), GY, .9);
      sen.set(nar.hands.r, -14 + Math.sin(t * .8) * 9, 700, 130);
      ayah.set({ la: [20, -20], ra: [20, -20], blink: blinkAt(t, 8), fear: .35 });
      tr(ayah.g, lerp(-190, -40, phA), GY, .88);
      ambFog(setA, t, 420);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 500, 1060, 1.12, 515, 1054, 1.18);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 706, 1372, 2.30, 706, 1370, 2.37);
      narC.set({ la: [18, -18], ra: [18, -18], blink: blinkAt(t, 4), fear: .75, shock: .2, headR: 9 });
      tr(narC.g, 380, GY, 1);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 380, 700, 1.56, 380, 698, 1.63);
    });
  }

  // L7 (idx6) WARGA — warga menyebar membawa obor; narator mendorong pintu rumah kosong
  {
    const sc = scene(world, 'warga', 'cut');
    const A = E('g', {}, sc.cam); streetDusk(A, 71);
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: '#040818', opacity: .5 }, A);
    const karso = Karso(A, {}), warti = Warti(A, {}), rian = Rian(A, {});
    const ob1 = makeObor(karso.g), ob2 = makeObor(warti.g), ob3 = makeObor(rian.g);
    const B = E('g', {}, sc.cam), setB = emptyExt(B, 72);
    const nar = Narator(B, {}), sen = makeSenter(nar.g);
    const C = E('g', {}, sc.cam), setC = emptyExt(C, 73);
    const narC = Narator(C, {});
    during('warga', 'wargae', (t) => {
      const t0 = lineT(6), d = lineD(6), b1 = t0 + d * .38, b2 = t0 + d * .7;
      const phA = clamp((t - t0) / (d * .38));
      karso.set({ la: [24, -20], ra: [58, -46], legL: [Math.sin(t * 5.2) * 14, 5], legR: [-Math.sin(t * 5.2) * 14, 5], blink: blinkAt(t, 3) });
      tr(karso.g, lerp(430, 240, phA), GY, .88); ob1.set(karso.hands.r, t, -4);
      warti.set({ la: [58, -46], ra: [24, -20], legL: [-Math.sin(t * 4.8) * 12, 5], legR: [Math.sin(t * 4.8) * 12, 5], blink: blinkAt(t, 6) });
      tr(warti.g, lerp(560, 700, phA), GY, .9); ob2.set(warti.hands.l, t + 2, 4);
      rian.set({ la: [24, -20], ra: [58, -46], legL: [Math.sin(t * 5.8) * 15, 5], legR: [-Math.sin(t * 5.8) * 15, 5], blink: blinkAt(t, 9) });
      tr(rian.g, lerp(700, 1010, phA), GY, .86); ob3.set(rian.hands.r, t + 4, -3);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 560, 1040, 1.13, 575, 1034, 1.19);
      const push = bump((t - b1) / (d * .32), .25, .9);
      nar.set({ la: [20, -20], ra: [lerp(30, 12, push), lerp(-24, 33, push)], blink: blinkAt(t, 4), fear: .55 });
      tr(nar.g, 600, GY, 1);
      setB.doorApi.set(push * .55);
      sen.set(nar.hands.l, -20 + push * 26, 620, 110);
      ambFog(setB, t, 420);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 690, 1060, 1.34, 700, 1054, 1.42);
      const pushC = bump((t - b2) / (d * .3), .2, .85);
      narC.set({ la: [20, -20], ra: [10, 35], blink: blinkAt(t, 4), fear: .7, headR: 6 });
      tr(narC.g, 600, GY, 1);
      setC.doorApi.set(.2 + pushC * .4);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 742, 1085, 2.28, 742, 1082, 2.35);
    });
  }

  // L8 (idx7) BUKTI — menyisir interior gelap; blitz ponsel dua kali; sudut ternyata kosong
  {
    const sc = scene(world, 'bukti', 'cut');
    const A = E('g', {}, sc.cam), setA = emptyInt(A, 81, false);
    const nar = Narator(A, {}), sen = makeSenter(nar.g), ph1 = makePhone(nar.g);
    const B = E('g', {}, sc.cam), setB2 = emptyInt(B, 82, false);
    const narB = Narator(B, {}), senB = makeSenter(narB.g);
    const C = E('g', {}, sc.cam), setC = emptyInt(C, 83, false);
    const narC = Narator(C, {}), phC2 = makePhone(narC.g), fl = makeFlash(C);
    during('bukti', 'buktie', (t) => {
      const t0 = lineT(7), d = lineD(7), b1 = t0 + d * .38, b2 = t0 + d * .7;
      const phA = clamp((t - t0) / (d * .38));
      nar.set({ la: [56, -34], ra: [58, -40], legL: [Math.sin(t * 3.8) * 9, 4], legR: [-Math.sin(t * 3.8) * 9, 4], blink: blinkAt(t, 5), fear: .5 });
      tr(nar.g, lerp(170, 330, phA), GY, .96);
      sen.set(nar.hands.r, -8 + Math.sin(t * .7) * 22, 760, 130);
      ph1.set(nar.hands.l, -12);
      ambMotes(setA, t); ambFog(setA, t, 760);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 480, 1020, 1.16, 495, 1014, 1.21);
      narB.set({ la: [20, -20], ra: [58, -38], blink: blinkAt(t, 5), fear: .65 });
      tr(narB.g, 120, GY, .96);
      senB.set(narB.hands.r, 16 + Math.sin(t * .5 + 1) * 7, 900, 150);
      ambMotes(setB2, t);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 700, 1010, 1.50, 706, 1006, 1.66);
      narC.set({ la: [20, -20], ra: [92, -88], blink: blinkAt(t, 5), fear: .6, headR: 5 });
      tr(narC.g, 390, GY, .97);
      phC2.set(narC.hands.r, 14);
      const phCc = (t - b2) / (d * .3);
      const fk = Math.max(beat(phCc, .18), beat(phCc, .62));
      const fhx = narC.hands.r ? 390 + narC.hands.r[0] * .97 : 620, fhy = narC.hands.r ? GY + narC.hands.r[1] * .97 : 760;
      fl.set(fhx, fhy, clamp(fk) * .95);
      ambMotes(setC, t);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 570, 1000, 1.42, 585, 996, 1.5);
    });
  }

  // L9 (idx8) FOTO — narator memeriksa foto: bayangan tinggi di sudut; ia menepisnya, menunjuk lemari
  {
    const sc = scene(world, 'foto', 'cut');
    const A = E('g', {}, sc.cam); homeInt(A, 91, false);
    const nar = Narator(A, {}), ph1 = makePhone(nar.g);
    const B = E('g', {}, sc.cam);
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: '#07080e' }, B);
    const pp = phonePhoto(B, 540, 980, 1.45);
    const C = E('g', {}, sc.cam); homeInt(C, 92, false);
    lemariAt(C, 235, GY, .82);
    const narC = Narator(C, {});
    during('foto', 'fotoe', (t) => {
      const t0 = lineT(8), d = lineD(8), b1 = t0 + d * .36, b2 = t0 + d * .68;
      const shake = bump((t - t0) / d, .55, .75) * Math.sin(t * 9) * 2.2;
      nar.set({ la: [76, -64], ra: [84, -76], blink: blinkAt(t, 5), headR: shake, fear: .3 });
      tr(nar.g, 470, GY, .97);
      ph1.set(nar.hands.r, 10);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 470, 990, 1.32, 470, 984, 1.4);
      pp.shadow.setAttribute('opacity', (.85 + Math.sin(t * .6) * .06).toFixed(3));
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 540, 980, 1.06, 545, 975, 1.12);
      const shakeC = bump((t - b2) / (d * .32), .1, .6) * Math.sin(t * 8.4) * 2.4;
      narC.set({ la: [58, -58], ra: [20, -20], blink: blinkAt(t, 5), headR: shakeC - 4, fear: .25 });
      tr(narC.g, 640, GY, .97);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 480, 1000, 1.3, 470, 995, 1.37);
    });
  }

  // L10 (idx9) TAWA — tengah malam di kebun bambu: rombongan membeku, kepala serentak menoleh
  {
    const sc = scene(world, 'tawa', 'cut');
    const A = E('g', {}, sc.cam), setA = bambooNight(A, 101);
    const nar = Narator(A, {}), karso = Karso(A, {}), warti = Warti(A, {}), rian = Rian(A, {});
    const sen = makeSenter(nar.g), ob1 = makeObor(karso.g), ob3 = makeObor(rian.g);
    const B = E('g', {}, sc.cam); bambooNight(B, 102); fgDark(B, 'bamboo');
    const narB = Narator(B, {});
    const C = E('g', {}, sc.cam); bambooNight(C, 103);
    const karsoC = Karso(C, {}), wartiC = Warti(C, {});
    const obC = makeObor(karsoC.g);
    during('tawa', 'tawae', (t) => {
      const t0 = lineT(9), d = lineD(9), b1 = t0 + d * .4, b2 = t0 + d * .72;
      const phA = clamp((t - t0) / (d * .4)), freeze = bump(phA, .55, .75);
      const wk = (1 - freeze);
      nar.set({ la: [22, -20], ra: [54, -32], legL: [Math.sin(t * 4.4) * 11 * wk, 4], legR: [-Math.sin(t * 4.4) * 11 * wk, 4], blink: blinkAt(t, 5), fear: freeze * .8, headR: freeze * 12 });
      tr(nar.g, lerp(210, 260, phA), GY, .9); sen.set(nar.hands.r, -6 + freeze * 14, 700, 120);
      karso.set({ la: [22, -20], ra: [58, -46], legL: [Math.sin(t * 4.6) * 11 * wk, 4], legR: [-Math.sin(t * 4.6) * 11 * wk, 4], blink: blinkAt(t, 3), fear: freeze * .7, headR: freeze * 11 });
      tr(karso.g, lerp(430, 470, phA), GY, .88); ob1.set(karso.hands.r, t, -4);
      warti.set({ la: [24, -20], ra: [24 + freeze * 74, -20 - freeze * 84], legL: [-Math.sin(t * 4.2) * 10 * wk, 4], legR: [Math.sin(t * 4.2) * 10 * wk, 4], blink: blinkAt(t, 6), fear: freeze * .9, headR: freeze * 12 });
      tr(warti.g, lerp(640, 665, phA), GY, .9);
      rian.set({ la: [22, -20], ra: [58, -46], legL: [Math.sin(t * 4.8) * 12 * wk, 4], legR: [-Math.sin(t * 4.8) * 12 * wk, 4], blink: blinkAt(t, 9), fear: freeze * .75, headR: freeze * 13 });
      tr(rian.g, lerp(850, 880, phA), GY, .87); ob3.set(rian.hands.r, t + 4, -3);
      ambFog(setA, t, 380);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 545, 1030, 1.15, 552, 1026, 1.2);
      narB.set({ la: [18, -18], ra: [18, -18], blink: blinkAt(t, 5), fear: .9, shock: .55, headR: 13 });
      tr(narB.g, 420, GY, 1.02);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 420, 690, 1.58, 420, 688, 1.65);
      karsoC.set({ la: [22, -20], ra: [74, -66], blink: blinkAt(t, 3), fear: .85, headR: 10 });
      tr(karsoC.g, 330, GY, .95); obC.set(karsoC.hands.r, t, -5);
      wartiC.set({ la: [24, -20], ra: [102, -104], blink: blinkAt(t, 6), fear: 1, headR: 11 });
      tr(wartiC.g, 700, GY, .97);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 515, 900, 1.44, 522, 896, 1.5);
    });
  }

  // L11 (idx10) OBOR — rombongan maju; cahaya menyapu rumpun tengah; tawa berhenti
  {
    const sc = scene(world, 'obor', 'cut');
    const A = E('g', {}, sc.cam), setA = bambooNight(A, 111);
    const nar = Narator(A, {}), karso = Karso(A, {}), rian = Rian(A, {});
    const sen = makeSenter(nar.g), ob1 = makeObor(karso.g), ob3 = makeObor(rian.g);
    const B = E('g', {}, sc.cam), setB = bambooNight(B, 112);
    const sweep = E('ellipse', { cx: 0, cy: 900, rx: 300, ry: 420, fill: '#ffb45e', opacity: .12, filter: P.blur(B, 30) }, B);
    const C = E('g', {}, sc.cam); bambooNight(C, 113);
    const narC = Narator(C, {}), karsoC = Karso(C, {});
    const obC = makeObor(karsoC.g);
    const glowC = E('ellipse', { cx: 660, cy: 800, rx: 330, ry: 300, fill: '#ff9a3c', opacity: .1, filter: P.blur(C, 26) }, C);
    during('obor', 'obore', (t) => {
      const t0 = lineT(10), d = lineD(10), b1 = t0 + d * .38, b2 = t0 + d * .7;
      const phA = clamp((t - t0) / (d * .38));
      nar.set({ la: [22, -20], ra: [54, -32], legL: [Math.sin(t * 4.2) * 10, 4], legR: [-Math.sin(t * 4.2) * 10, 4], blink: blinkAt(t, 5), fear: .6, headR: 6 });
      tr(nar.g, lerp(200, 300, phA), GY, .9); sen.set(nar.hands.r, 2 + Math.sin(t * .6) * 8, 720, 120);
      karso.set({ la: [22, -20], ra: [58, -46], legL: [Math.sin(t * 4.4) * 11, 4], legR: [-Math.sin(t * 4.4) * 11, 4], blink: blinkAt(t, 3), fear: .55, headR: 5 });
      tr(karso.g, lerp(430, 520, phA), GY, .88); ob1.set(karso.hands.r, t, -4);
      rian.set({ la: [22, -20], ra: [58, -46], legL: [Math.sin(t * 4.6) * 11, 4], legR: [-Math.sin(t * 4.6) * 11, 4], blink: blinkAt(t, 9), fear: .6, headR: 7 });
      tr(rian.g, lerp(660, 740, phA), GY, .87); ob3.set(rian.hands.r, t + 4, -3);
      ambFog(setA, t, 380);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 480, 1030, 1.13, 495, 1026, 1.19);
      const phB = (t - b1) / (d * .32);
      sweep.setAttribute('cx', (lerp(120, 900, eio(clamp(phB)))).toFixed(0));
      sweep.setAttribute('opacity', (.05 + .1 * Math.sin(clamp(phB) * Math.PI)).toFixed(3));
      ambFog(setB, t, 380);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 520, 1010, 1.3, 528, 1006, 1.37);
      glowC.setAttribute('opacity', (.08 + .03 * Math.sin(t * 9.7) * Math.sin(t * 4.3)).toFixed(3));
      narC.set({ la: [20, -20], ra: [52, -30], blink: blinkAt(t, 5), fear: .7, headR: 6 });
      tr(narC.g, 300, GY, .98);
      karsoC.set({ la: [22, -20], ra: [62, -52], blink: blinkAt(t, 3), fear: .65, headR: 5 });
      tr(karsoC.g, 680, GY, .95); obC.set(karsoC.hands.r, t, -4);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 490, 930, 1.42, 496, 926, 1.52);
    });
  }

  // L12 (idx11) GANDENG — KEJUTAN KECIL: sosok tinggi menggandeng tangan kecil (kontak dihitung dari hands kedua rig)
  {
    const sc = scene(world, 'gandeng', 'cut');
    const A = E('g', {}, sc.cam); bambooNight(A, 121); fgDark(A, 'bamboo');
    const beam = E('polygon', { points: '40,1560 700,760 900,820', fill: '#ffe9b0', opacity: .12 }, A);
    const B = E('g', {}, sc.cam), setB = bambooNight(B, 122);
    const wewe = Wewe(B, {}), bimo = Bimo(B, {});
    E('polygon', { points: '-60,1500 430,900 700,980', fill: '#ffe9b0', opacity: .1 }, B);
    const C = E('g', {}, sc.cam); bambooNight(C, 123); fgDark(C, 'bamboo');
    const nar = Narator(C, {}), sen = makeSenter(nar.g);
    during('gandeng', 'gandenge', (t) => {
      const t0 = lineT(11), d = lineD(11), b1 = t0 + d * .34, b2 = t0 + d * .74;
      const sw = Math.sin(t * .55) * 60;
      beam.setAttribute('points', `40,1560 ${700 + sw},${760 + Math.sin(t * .4) * 26} ${900 + sw},${820 + Math.sin(t * .4) * 26}`);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 1080, 1.22, 545, 1072, 1.3);
      const sway = Math.sin(t * .5) * 1.1;
      wewe.set({ la: [20, -2], ra: [9, -13], sway, hairLag: Math.sin(t * .5 - .7) * 2.2, headR: 4 });
      tr(wewe.g, 600, GY, .98);
      bimo.set({ la: [24, -20], ra: [38, -30], blink: blinkAt(t, 3), headR: -9, mood: 'flat' });
      const wl = wewe.hands.l, br = bimo.hands.r;
      if (wl && br) tr(bimo.g, 600 + wl[0] * .98 - br[0] * .95, GY + wl[1] * .98 - br[1] * .95, .95);
      ambFog(setB, t, 380);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 480, 1005, 1.44, 483, 1000, 1.60);
      nar.set({ la: [20, -20], ra: [56, -34], blink: false, fear: 1, shock: 1, headR: 4 });
      tr(nar.g, 400, GY, 1.0);
      sen.set(nar.hands.r, 8 + Math.sin(t * 12.7) * 1.6, 700, 120);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 400, 700, 1.58, 400, 700, 1.6);
    });
  }

  // L13 (idx12) KEDIP — narator berkedip (device layar penuh): sosok LENYAP; jejak kaki kecil
  {
    const sc = scene(world, 'kedip', 'cut');
    const A = E('g', {}, sc.cam), setA = bambooNight(A, 131);
    const wewe = Wewe(A, {}), bimo = Bimo(A, {});
    const lids = makeLids(A);
    const B = E('g', {}, sc.cam); bambooNight(B, 132); fgDark(B, 'bamboo');
    const nar = Narator(B, {});
    const C = E('g', {}, sc.cam); bambooNight(C, 133);
    const prints = E('g', {}, C);
    for (let i = 0; i < 5; i++) {
      E('ellipse', { cx: 430 + i * 52, cy: 1560 - i * 66, rx: 15, ry: 24, fill: '#05080a', opacity: .55 - i * .07, transform: `rotate(${-32 + (i % 2) * 14} ${430 + i * 52} ${1560 - i * 66})` }, prints);
      E('ellipse', { cx: 462 + i * 52, cy: 1596 - i * 66, rx: 15, ry: 24, fill: '#05080a', opacity: .5 - i * .07, transform: `rotate(${-20 + (i % 2) * 12} ${462 + i * 52} ${1596 - i * 66})` }, prints);
    }
    E('ellipse', { cx: 540, cy: 1420, rx: 300, ry: 240, fill: '#ffe9b0', opacity: .08, filter: P.blur(C, 26) }, C);
    during('kedip', 'kedipe', (t) => {
      const t0 = lineT(12), d = lineD(12), b1 = t0 + d * .48, b2 = t0 + d * .74;
      const sway = Math.sin(t * .5) * 1.1;
      wewe.set({ la: [20, -2], ra: [9, -13], sway, hairLag: Math.sin(t * .5 - .7) * 2.2, headR: 4 });
      tr(wewe.g, 600, GY, .98);
      bimo.set({ la: [24, -20], ra: [38, -30], blink: blinkAt(t, 3), headR: -9, mood: 'flat' });
      const wl = wewe.hands.l, br = bimo.hands.r;
      if (wl && br) tr(bimo.g, 600 + wl[0] * .98 - br[0] * .95, GY + wl[1] * .98 - br[1] * .95, .95);
      const phA = (t - t0) / d;
      const lidK = (bump(phA, .3, .38) - bump(phA, .38, .47));
      const gone = phA >= .38;
      wewe.g.style.display = gone ? 'none' : ''; bimo.g.style.display = gone ? 'none' : '';
      lids.set(clamp(lidK));
      ambFog(setA, t, 380);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 480, 1002, 1.5, 481, 1000, 1.56);
      const phB = (t - b1) / (d * .26);
      const rub = bump(phB, .2, .45) - bump(phB, .55, .8);
      nar.set({ la: [20, -20], ra: [lerp(24, 138, rub), lerp(-22, -40, rub)], blink: phB < .14, fear: .95, shock: .8, headR: 3 });
      tr(nar.g, 430, GY, 1.0);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 430, 700, 1.56, 430, 698, 1.62);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 520, 1470, 2.28, 528, 1462, 2.36);
    });
  }

  // L14 (idx13) PANGGIL — ayah-ibu memanggil sampai serak di depan rumah kosong
  {
    const sc = scene(world, 'panggil', 'cut');
    const A = E('g', {}, sc.cam), setA = emptyExt(A, 141);
    const ayah = Ayah(A, {}), ibu = Ibu(A, {});
    const B = E('g', {}, sc.cam); emptyExt(B, 142);
    const ibuB = Ibu(B, {});
    const C = E('g', {}, sc.cam), setC = emptyExt(C, 143);
    const ayahC = Ayah(C, {}), ibuC = Ibu(C, {});
    E('ellipse', { cx: 560, cy: 1300, rx: 520, ry: 90, fill: '#aebfd4', opacity: .12, filter: P.blur(C, 30) }, C);
    during('panggil', 'panggile', (t) => {
      const t0 = lineT(13), d = lineD(13), b1 = t0 + d * .42, b2 = t0 + d * .72;
      const shout = .5 + .5 * Math.abs(Math.sin(t * 6.9));
      ayah.set({ la: [98, -98], ra: [98, -98], talk: shout, blink: blinkAt(t, 8), fear: .6, headR: -4 });
      tr(ayah.g, 300, GY, .92);
      ibu.set({ la: [96, -96], ra: [96, -96], talk: .5 + .5 * Math.abs(Math.sin(t * 6.9 + 2)), blink: blinkAt(t, 6), fear: .7, headR: -4 });
      tr(ibu.g, 520, GY, .94);
      ambFog(setA, t, 420);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 460, 1000, 1.3, 455, 996, 1.37);
      const phB = clamp((t - b1) / (d * .3));
      const tire = bump(phB, .5, 1);
      ibuB.set({ la: [lerp(96, 30, tire), lerp(-96, -26, tire)], ra: [lerp(96, 30, tire), lerp(-96, -26, tire)], talk: (1 - tire) * (.4 + .5 * Math.abs(Math.sin(t * 6.4))), blink: blinkAt(t, 6), fear: .8, headR: tire * 10 - 3 });
      tr(ibuB.g, 480, GY, .98);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 480, 800, 1.52, 480, 806, 1.58);
      ayahC.set({ la: [24, -22], ra: [24, -22], blink: blinkAt(t, 8), fear: .5, headR: 8 });
      tr(ayahC.g, 330, GY, .9);
      ibuC.set({ la: [24, -22], ra: [24, -22], blink: blinkAt(t, 6), fear: .6, headR: 9 });
      tr(ibuC.g, 520, GY, .92);
      ambFog(setC, t, 420);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 520, 1060, 1.12, 524, 1058, 1.16);
    });
  }

  // L15 (idx14) SUBUH — HENING RANCANGAN: pintu berderit terbuka sendiri; Bimo keluar sendirian
  {
    const sc = scene(world, 'subuh', 'cut');
    const A = E('g', {}, sc.cam), setA = emptyExt(A, 151);
    E('rect', { x: -320, y: -320, width: 1720, height: 1740, fill: '#5a76a8', opacity: .1 }, A);
    const ayah = Ayah(A, {}), ibu = Ibu(A, {});
    const B = E('g', {}, sc.cam), setB = emptyExt(B, 152);
    const C = E('g', {}, sc.cam), setC = emptyExt(C, 153);
    setC.doorApi.set(.8);
    const bimo = Bimo(C, {});
    const ayahC = Ayah(C, {}), ibuC = Ibu(C, {});
    during('subuh', 'subuhe', (t) => {
      const t0 = lineT(14), d = lineD(14), b1 = t0 + d * .38, b2 = t0 + d * .68;
      ayah.set({ la: [20, -20], ra: [20, -20], blink: blinkAt(t, 8), headR: 5 });
      tr(ayah.g, 210, GY, .88);
      ibu.set({ la: [62, -52], ra: [22, -20], blink: blinkAt(t, 6), headR: 5 });
      tr(ibu.g, 360, GY, .9);
      ambFog(setA, t, 420);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 520, 1050, 1.14, 524, 1048, 1.17);
      const phB = (t - b1) / (d * .3);
      setB.doorApi.set(bump(phB, .18, .92) * .8);
      ambFog(setB, t, 420);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 726, 1090, 2.3, 726, 1088, 2.36);
      const phC = clamp((t - b2) / (d * .32));
      const out = bump(phC, .05, .55);
      const rub = bump(phC, .55, .7) - bump(phC, .78, .92);
      const walkK = bump(phC, .05, .5) * (1 - bump(phC, .5, .6));
      bimo.set({ la: [24, -20], ra: [lerp(24, 140, rub), lerp(-20, -42, rub)], legL: [Math.sin(t * 4.6) * 12 * walkK, 5], legR: [-Math.sin(t * 4.6) * 12 * walkK, 5], blink: blinkAt(t, 3), mood: 'flat', headR: -3 });
      tr(bimo.g, lerp(726, 600, out), GY - Math.abs(Math.sin(t * 4.6)) * 3 * walkK, lerp(.78, .95, out));
      const rush = bump(phC, .86, 1);
      ayahC.set({ la: [30, -26], ra: [30, -26], legL: [Math.sin(t * 7.4) * 17, 6], legR: [-Math.sin(t * 7.4) * 17, 6], blink: blinkAt(t, 8), fear: .3, shock: .4 });
      tr(ayahC.g, lerp(-240, 330, rush), GY, .9);
      ibuC.set({ la: [34, -30], ra: [34, -30], legL: [Math.sin(t * 7.8) * 16, 6], legR: [-Math.sin(t * 7.8) * 16, 6], blink: blinkAt(t, 6), fear: .3, shock: .4 });
      tr(ibuC.g, lerp(1240, 830, rush), GY, .92);
      ambFog(setC, t, 420);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 640, 1040, 1.3, 636, 1036, 1.38);
    });
  }

  // L16 (idx15) SUDUT — Bimo duduk tenang di sudut yang kemarin terfoto kosong (FLAG TELINGA: tempo 3.24 k/s)
  {
    const sc = scene(world, 'sudut', 'cut');
    const mkSudut = (seed) => {
      const g = E('g', {}, sc.cam); homeInt(g, seed, true);
      E('path', { d: 'M760,-320 L760,1420', stroke: '#0a0608', 'stroke-width': 8 }, g);
      E('rect', { x: 760, y: -320, width: 640, height: 1740, fill: '#14101a', opacity: .55 }, g);
      const bimo = Bimo(g, {});
      bimo.set({ la: [42, -32], ra: [42, -32], legL: [80, -70], legR: [-84, 74], mood: 'flat' });
      tr(bimo.g, 800, GY + 128, .92);
      return { g, bimo };
    };
    const A = mkSudut(161), B = mkSudut(162);
    const fr = E('rect', { x: 606, y: 470, width: 330, height: 950, fill: 'none', stroke: '#dfe9f5', 'stroke-width': 5, opacity: 0 }, B.g);
    during('sudut', 'sudute', (t) => {
      const t0 = lineT(15), d = lineD(15), b1 = t0 + d * .52;
      A.bimo.set({ la: [42, -32], ra: [42, -32], legL: [80, -70], legR: [-84, 74], blink: blinkAt(t, 3), mood: 'flat', headR: -4 });
      B.bimo.set({ la: [42, -32], ra: [42, -32], legL: [80, -70], legR: [-84, 74], blink: blinkAt(t, 3), mood: 'flat', headR: -6 });
      const phB = (t - b1) / (d * .48);
      fr.setAttribute('opacity', (Math.sin(clamp(phB) * Math.PI) * .55).toFixed(3));
      A.g.style.display = t < b1 ? '' : 'none';
      shotCam(A.g, t, t0, b1, 720, 1080, 1.34, 726, 1076, 1.41);
      B.g.style.display = t >= b1 ? '' : 'none';
      shotCam(B.g, t, b1, t0 + d, 760, 1060, 1.52, 764, 1056, 1.6);
    });
  }

  // L17 (idx16) NENEK — ibu memeluk Bimo bercerita; sisipan berkabut: tangan kecil menerima mangkuk
  {
    const sc = scene(world, 'nenek', 'cut');
    const A = E('g', {}, sc.cam); homeInt(A, 171, true);
    const ibu = Ibu(A, {}), bimo = Bimo(A, {});
    const B = E('g', {}, sc.cam);
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: '#0a0a12' }, B);
    const inset = E('g', {}, B);
    E('ellipse', { cx: 540, cy: 950, rx: 430, ry: 560, fill: '#141821' }, inset);
    const bigHands = [-1, 1].map(sd => {
      const hg2 = E('g', {}, inset);
      E('path', { d: `M${sd * -30},-190 C${sd * -24},-90 ${sd * -20},-30 ${sd * -16},10`, fill: 'none', stroke: '#8a7360', 'stroke-width': 21, 'stroke-linecap': 'round' }, hg2);
      E('ellipse', { cx: 0, cy: 26, rx: 34, ry: 26, fill: '#8a7360', ...st(2.5, '#0d0a10') }, hg2);
      [-24, -8, 9, 25].forEach((fx, i) => E('path', { d: `M${fx},44 C${fx + (i - 1.5) * 4},${86} ${fx + (i - 1.5) * 7},${118 - Math.abs(i - 1.5) * 12} ${fx + (i - 1.5) * 9},${132 - Math.abs(i - 1.5) * 14}`, fill: 'none', stroke: '#8a7360', 'stroke-width': 10, 'stroke-linecap': 'round' }, hg2));
      return { el: hg2, sd };
    });
    const bowl = E('g', { transform: 'translate(540,760)' }, inset);
    E('path', { d: 'M-95,0 A95,95 0 0,0 95,0 Z', fill: '#7a6a52', ...st(3) }, bowl);
    E('ellipse', { cx: 0, cy: 0, rx: 95, ry: 16, fill: '#a08a64', ...st(3) }, bowl);
    const steams = [-40, 0, 40].map(sx => E('path', { d: `M${sx},-24 C${sx - 14},-58 ${sx + 14},-84 ${sx},-116`, fill: 'none', stroke: '#cfd8e6', 'stroke-width': 5, opacity: .35, 'stroke-linecap': 'round' }, bowl));
    const smallHands = [-1, 1].map(sd => {
      const sh2 = E('g', {}, inset);
      E('ellipse', { cx: 0, cy: 20, rx: 26, ry: 20, fill: '#d9a06e', ...st(2.5) }, sh2);
      [-16, 0, 16].forEach(fx => E('path', { d: `M${fx},6 C${fx},-16 ${fx + (fx ? fx * .2 : 0)},-26 ${fx},-34`, fill: 'none', stroke: '#d9a06e', 'stroke-width': 8, 'stroke-linecap': 'round' }, sh2));
      return { el: sh2, sd };
    });
    E('ellipse', { cx: 540, cy: 950, rx: 470, ry: 600, fill: 'none', stroke: '#aebfd4', 'stroke-width': 60, opacity: .16, filter: P.blur(B, 30) }, B);
    const C = E('g', {}, sc.cam); homeInt(C, 172, true);
    const ibuC = Ibu(C, {}), bimoC = Bimo(C, {});
    during('nenek', 'neneke', (t) => {
      const t0 = lineT(16), d = lineD(16), b1 = t0 + d * .36, b2 = t0 + d * .7;
      ibu.set({ la: [38, 12], ra: [30, 8], talk: .45 + .55 * Math.abs(Math.sin(t * 6.9)), blink: blinkAt(t, 6), fear: .35, headR: 5 });
      tr(ibu.g, 420, GY, .98);
      bimo.set({ la: [26, -22], ra: [26, -22], blink: blinkAt(t, 3), mood: 'flat', headR: -11 });
      tr(bimo.g, 566, GY, .95);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 500, 990, 1.3, 505, 986, 1.37);
      bigHands.forEach(({ el, sd }) => el.setAttribute('transform', `translate(${540 + sd * 190},${560 + Math.sin(t * .7 + sd) * 8})`));
      steams.forEach((st1, i) => st1.setAttribute('transform', `translate(0,${(Math.sin(t * 1.1 + i * 2.1) * 7).toFixed(1)})`));
      const reach = bump((t - b1) / (d * .34), .2, .8);
      smallHands.forEach(({ el, sd }) => el.setAttribute('transform', `translate(${540 + sd * 120},${975 - reach * 85})`));
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 540, 950, 1.08, 540, 948, 1.13);
      const phC = clamp((t - b2) / (d * .3));
      ibuC.set({ la: [38, 12], ra: [30, 8], blink: blinkAt(t, 6), fear: .4 + phC * .35, headR: 4 });
      tr(ibuC.g, 420, GY, .98);
      bimoC.set({ la: [26, -22], ra: [26, -22], blink: blinkAt(t, 3), mood: 'flat', headR: -11 });
      tr(bimoC.g, lerp(566, 540, phC), GY, .95);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 480, 830, 1.5, 480, 834, 1.57);
    });
  }

  // L18 (idx17) PAHAM — PUNCAK: push-in ke sudut foto; sosok tinggi MENJELMA dalam gelap+kabut, lalu cahaya menggesernya
  {
    const sc = scene(world, 'paham', 'cut');
    const A = E('g', {}, sc.cam); homeInt(A, 181, false);
    const nar = Narator(A, {}), ph1 = makePhone(nar.g);
    const B = E('g', {}, sc.cam), setB = emptyInt(B, 182, false);
    const wewe = Wewe(B, {});
    const swirl = E('ellipse', { cx: 800, cy: 1150, rx: 300, ry: 90, fill: '#aebfd4', opacity: .14, filter: P.blur(B, 24) }, B);
    const C = E('g', {}, sc.cam), setC = emptyInt(C, 183, false);
    const weweC = Wewe(C, {});
    const lamp = E('ellipse', { cx: 60, cy: 900, rx: 420, ry: 480, fill: '#ffb45e', opacity: 0, filter: P.blur(C, 34) }, C);
    E('path', { d: 'M240,2420 C230,2140 260,1960 340,1900 C300,1780 340,1660 430,1660 C520,1660 560,1780 520,1900 C600,1960 630,2140 620,2420 Z', fill: '#04050a', opacity: .96 }, C);
    during('paham', 'pahame', (t) => {
      const t0 = lineT(17), d = lineD(17), b1 = t0 + d * .3, b2 = t0 + d * .76;
      nar.set({ la: [76, -64], ra: [84, -76], blink: blinkAt(t, 5), fear: .55, headR: 2 });
      tr(nar.g, 470, GY, .97);
      ph1.set(nar.hands.r, 10);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 470, 990, 1.34, 472, 986, 1.44);
      const phB = (t - b1) / (d * .46);
      const resolve = bump(phB, .5, .62);
      wewe.set({ la: [12, -15], ra: [12, -15], sway: Math.sin(t * .45) * 1, hairLag: Math.sin(t * .45 - .7) * 2, headR: -6 * bump(phB, .6, .8) });
      tr(wewe.g, 800, GY, .99);
      wewe.g.style.opacity = (resolve * .96).toFixed(3);
      swirl.setAttribute('cx', (800 + Math.sin(t * .3) * 30).toFixed(0));
      ambMotes(setB, t);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 770, 1010, 1.52, 782, 1002, 1.94);
      const phC = (t - b2) / (d * .24);
      const fade = bump(phC, .1, .55);
      weweC.set({ la: [12, -15], ra: [12, -15], sway: Math.sin(t * .45) * 1, hairLag: Math.sin(t * .45 - .7) * 2, headR: -6 });
      tr(weweC.g, 800, GY, .99);
      weweC.g.style.opacity = ((1 - fade) * .96).toFixed(3);
      lamp.setAttribute('opacity', (fade * .16).toFixed(3));
      ambMotes(setC, t);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 720, 1030, 1.44, 726, 1028, 1.47);
    });
  }

  // L19 (idx18) LEMARI — lemari SUNGGUHAN diusung keluar warga (senja); sudut kini benar-benar kosong
  {
    const sc = scene(world, 'lemari', 'cut');
    const A = E('g', {}, sc.cam), setA = emptyExt(A, 191);
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: '#e88a4a', opacity: .07 }, A);
    const karso = Karso(A, {}), rian = Rian(A, {});
    const lem = lemariAt(A, 0, GY, .9);
    const B = E('g', {}, sc.cam); emptyExt(B, 192);
    const nar = Narator(B, {});
    const C = E('g', {}, sc.cam), setC = emptyInt(C, 193, false);
    E('path', { d: 'M-320,300 L300,300 L760,1420 L-320,1420 Z', fill: '#ffb45e', opacity: .06 }, C);
    during('lemari', 'lemarie', (t) => {
      const t0 = lineT(18), d = lineD(18), b1 = t0 + d * .44, b2 = t0 + d * .74;
      const phA = clamp((t - t0) / (d * .44));
      lem.setAttribute('transform', `translate(${lerp(726, 545, phA).toFixed(0)},${GY}) scale(.9) rotate(${(-2 + Math.sin(t * 4.4) * .8).toFixed(2)})`);
      karso.set({ la: [44, -34], ra: [44, -34], legL: [Math.sin(t * 4.4) * 12, 5], legR: [-Math.sin(t * 4.4) * 12, 5], blink: blinkAt(t, 3), headR: -6 });
      tr(karso.g, lerp(500, 320, phA), GY, .9);
      rian.set({ la: [44, -34], ra: [44, -34], legL: [-Math.sin(t * 4.4) * 12, 5], legR: [Math.sin(t * 4.4) * 12, 5], blink: blinkAt(t, 9), headR: -6 });
      tr(rian.g, lerp(950, 770, phA), GY, .88);
      ambFog(setA, t, 420);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 620, 1030, 1.18, 600, 1026, 1.24);
      const phB = (t - b1) / (d * .3);
      nar.set({ la: [20, -20], ra: [20, -20], blink: blinkAt(t, 5), fear: .3, shock: .25, headR: Math.sin(bump(phB, .4, .9) * Math.PI) * 4 });
      tr(nar.g, 400, GY, 1);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 400, 700, 1.55, 400, 702, 1.61);
      ambMotes(setC, t);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 720, 1030, 1.48, 724, 1028, 1.55);
    });
  }

  // L20 (idx19) KEMBALI — pelukan fajar; siluet tinggi menjauh memudar di tepi kebun
  {
    const sc = scene(world, 'kembali', 'cut');
    const A = E('g', {}, sc.cam); homeInt(A, 201, true);
    const ayah = Ayah(A, {}), ibu = Ibu(A, {}), bimo = Bimo(A, {});
    const B = E('g', {}, sc.cam), setB = bambooNight(B, 202);
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: '#5a76a8', opacity: .14 }, B);
    const wewe = Wewe(B, {});
    E('ellipse', { cx: 900, cy: 1300, rx: 460, ry: 100, fill: '#aebfd4', opacity: .18, filter: P.blur(B, 30) }, B);
    during('kembali', 'kembalie', (t) => {
      const t0 = lineT(19), d = lineD(19), b1 = t0 + d * .52;
      ayah.set({ la: [46, -20], ra: [46, -20], legL: [84, -76], legR: [-88, 80], blink: blinkAt(t, 8), headR: 5 });
      tr(ayah.g, 330, GY + 128, .94);
      bimo.set({ la: [30, -24], ra: [30, -24], blink: blinkAt(t, 3), mood: 'smile', headR: -5 });
      tr(bimo.g, 545, GY, .95);
      ibu.set({ la: [40, -14], ra: [40, -14], blink: blinkAt(t, 6), headR: -5 });
      tr(ibu.g, 745, GY + 30, .96);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 1010, 1.3, 542, 1008, 1.36);
      const phB = clamp((t - b1) / (d * .48));
      wewe.set({ la: [10, -13], ra: [10, -13], sway: Math.sin(t * .45) * 1, hairLag: Math.sin(t * .45 - .7) * 2 });
      tr(wewe.g, lerp(880, 960, phB), GY, .6);
      wewe.g.style.opacity = ((1 - phB) * .85).toFixed(3);
      ambFog(setB, t, 380);
      B.style.display = t >= b1 ? '' : 'none';
      shotCam(B, t, b1, t0 + d, 700, 1050, 1.16, 706, 1048, 1.2);
    });
  }

  // L21 (idx20) GERBANG — ayah menunggu di gerbang tiap sore; ibu bergegas pulang; Bimo berlari menyambut
  {
    const sc = scene(world, 'gerbang', 'cut');
    const A = E('g', {}, sc.cam), setA = gateDusk(A, 211);
    const ayah = Ayah(A, {});
    const B = E('g', {}, sc.cam), setB = gateDusk(B, 212);
    const ibu = Ibu(B, {}), bimo = Bimo(B, {});
    const C = E('g', {}, sc.cam), setC = gateDusk(C, 213);
    const ayahC = Ayah(C, {}), bimoC = Bimo(C, {}), ibuC = Ibu(C, {});
    during('gerbang', 'gerbange', (t) => {
      const t0 = lineT(20), d = lineD(20), b1 = t0 + d * .38, b2 = t0 + d * .7;
      ayah.set({ la: [68, -84], ra: [68, -84], blink: blinkAt(t, 8), headR: Math.sin(t * .6) * 5 - 3 });
      tr(ayah.g, 268, GY, .93);
      ambFog(setA, t, 540);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 480, 1010, 1.24, 486, 1006, 1.31);
      const phB = clamp((t - b1) / (d * .32));
      ibu.set({ la: [26 + Math.sin(t * 6.2) * 14, -22], ra: [26 - Math.sin(t * 6.2) * 14, -22], legL: [Math.sin(t * 6.2) * 16, 5], legR: [-Math.sin(t * 6.2) * 16, 5], blink: blinkAt(t, 6), headR: -4 });
      tr(ibu.g, lerp(1010, 760, phB), GY - Math.abs(Math.sin(t * 6.2)) * 4, .94);
      const run = bump(phB, .15, .8);
      bimo.set({ la: [34 - Math.sin(t * 8.2) * 18, -24], ra: [34 + Math.sin(t * 8.2) * 18, -24], legL: [Math.sin(t * 8.2) * 20, 6], legR: [-Math.sin(t * 8.2) * 20, 6], blink: blinkAt(t, 3), mood: 'smile' });
      tr(bimo.g, lerp(330, 640, run), GY - Math.abs(Math.sin(t * 8.2)) * 5, .95);
      ambFog(setB, t, 540);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 580, 1020, 1.22, 590, 1016, 1.29);
      const wk = Math.sin(t * 5.2);
      ayahC.set({ la: [24 + wk * 10, -21], ra: [88, -118], legL: [wk * 13, 5], legR: [-wk * 13, 5], blink: blinkAt(t, 8), headR: 3 });
      tr(ayahC.g, 400, GY, .95);
      bimoC.set({ la: [26 - wk * 11, -21], ra: [26 + wk * 11, -21], legL: [-wk * 14, 5], legR: [wk * 14, 5], blink: blinkAt(t, 3), mood: 'smile', headR: -3 });
      tr(bimoC.g, 548, GY, .95);
      ibuC.set({ la: [24 - wk * 10, -21], ra: [24 + wk * 10, -21], legL: [wk * 12, 5], legR: [-wk * 12, 5], blink: blinkAt(t, 6), headR: -3 });
      tr(ibuC.g, 730, GY, .93);
      ambFog(setC, t, 540);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 565, 1010, 1.26, 572, 1006, 1.32);
    });
  }

  // L22 (idx21) BERUBAH — makan malam biasa saja; Bimo makan seperti biasa, lalu melirik sisi kosong meja
  {
    const sc = scene(world, 'berubah', 'cut');
    const mk = (seed) => {
      const g = E('g', {}, sc.cam); homeInt(g, seed, false);
      chairAt(g, 268, GY + 6, .92); chairAt(g, 812, GY + 6, .92);
      tableAt(g, 540, GY - 26, 1);
      const ayah = Ayah(g, {}), ibu = Ibu(g, {}), bimo = Bimo(g, {});
      return { g, ayah, ibu, bimo };
    };
    const A = mk(221), B = mk(222);
    const C = E('g', {}, sc.cam); homeInt(C, 223, false);
    const nar = Narator(C, {});
    during('berubah', 'berubahe', (t) => {
      const t0 = lineT(21), d = lineD(21), b1 = t0 + d * .44, b2 = t0 + d * .74;
      const eat = (Math.sin(t * 1.7) > 0) ? 1 : 0;
      [A, B].forEach((S2, i) => {
        S2.ayah.set({ la: [42, -26], ra: [42, -26], legL: [80, -68], legR: [-84, 72], blink: blinkAt(t, 8), talk: .3 + .4 * Math.abs(Math.sin(t * 6.6)) });
        tr(S2.ayah.g, 268, GY + 148, .92);
        S2.ibu.set({ la: [42, -26], ra: [42, -26], legL: [80, -68], legR: [-84, 72], blink: blinkAt(t, 6) });
        tr(S2.ibu.g, 812, GY + 148, .92);
        const glance = i === 1 ? bump((t - b1) / (d * .3), .5, .8) : 0;
        S2.bimo.set({ la: [38, -28], ra: [lerp(40, 96, eat), lerp(-28, -100, eat)], blink: blinkAt(t, 3), mood: glance > .5 ? 'flat' : 'smile', headR: glance * 13 });
        tr(S2.bimo.g, 540, GY + 66, .84);
      });
      A.g.style.display = t < b1 ? '' : 'none';
      shotCam(A.g, t, t0, b1, 540, 1060, 1.18, 542, 1056, 1.23);
      B.g.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B.g, t, b1, b2, 540, 1010, 1.52, 544, 1008, 1.6);
      nar.set({ la: [20, -20], ra: [20, -20], blink: blinkAt(t, 5), fear: .18, headR: 6 });
      tr(nar.g, 430, GY, 1);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 430, 700, 1.56, 430, 702, 1.62);
    });
  }

  // L23 (idx22) KURSI — Bimo menyeret satu kursi kosong; memprotes saat hendak diduduki
  {
    const sc = scene(world, 'kursi', 'cut');
    const A = E('g', {}, sc.cam); homeInt(A, 231, false);
    tableAt(A, 330, GY - 20, .9);
    const bimo = Bimo(A, {});
    const chair = chairAt(A, 700, GY + 30, .8);
    const B = E('g', {}, sc.cam); homeInt(B, 232, false);
    chairAt(B, 640, GY + 92, .87);
    const rian = Rian(B, {}), bimoB = Bimo(B, {});
    const C = E('g', {}, sc.cam); homeInt(C, 233, false);
    chairAt(C, 640, GY + 92, .87);
    const rianC = Rian(C, {}), bimoC = Bimo(C, {}), ayahC = Ayah(C, {}), ibuC = Ibu(C, {});
    during('kursi', 'kursie', (t) => {
      const t0 = lineT(22), d = lineD(22), b1 = t0 + d * .4, b2 = t0 + d * .72;
      const phA = clamp((t - t0) / (d * .4));
      const drag = bump(phA, .12, .6);
      const chX = lerp(700, 640, drag), chY = GY + lerp(30, 92, drag), chS = lerp(.8, .87, drag);
      bimo.set({ la: [8, -6], ra: [8, -6], legL: [Math.sin(t * 4.2) * 9 * drag * (1 - drag), 5], legR: [-Math.sin(t * 4.2) * 9 * drag * (1 - drag), 5], blink: blinkAt(t, 3), mood: 'flat', headR: 3 });
      tr(bimo.g, chX, chY - 76, .88);
      chair.setAttribute('transform', `translate(${chX},${chY}) scale(${chS}) rotate(${(Math.sin(t * 22) * 1.3 * drag * (1 - drag)).toFixed(2)})`);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 560, 1050, 1.26, 566, 1046, 1.33);
      const phB = (t - b1) / (d * .32);
      const sit = bump(phB, .1, .4) - bump(phB, .55, .8);
      const protest = bump(phB, .42, .6);
      rian.set({ la: [24, -22], ra: [24, -22], legL: [sit * 42, -sit * 26], legR: [-sit * 42, sit * 26], blink: blinkAt(t, 9), headR: -4 });
      tr(rian.g, 830, GY + sit * 66, .94);
      bimoB.set({ la: [lerp(20, 82, protest), lerp(-20, -72, protest)], ra: [lerp(20, 82, protest), lerp(-20, -72, protest)], blink: blinkAt(t, 3), mood: 'flat', headR: protest * Math.sin(t * 11) * 5, fear: protest * .4 });
      tr(bimoB.g, 470, GY, .95);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 620, 1020, 1.36, 626, 1018, 1.43);
      rianC.set({ la: [82, -84], ra: [82, -84], blink: blinkAt(t, 9), headR: -3 });
      tr(rianC.g, 880, GY, .94);
      bimoC.set({ la: [66, -70], ra: [66, -70], blink: blinkAt(t, 3), mood: 'flat', headR: -6 });
      tr(bimoC.g, 460, GY, .95);
      ayahC.set({ la: [20, -20], ra: [20, -20], blink: blinkAt(t, 8), headR: -9 });
      tr(ayahC.g, 120, GY, .9);
      ibuC.set({ la: [20, -20], ra: [20, -20], blink: blinkAt(t, 6), headR: 9 });
      tr(ibuC.g, 1010, GY, .9);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 580, 1030, 1.24, 586, 1028, 1.3);
    });
  }

  // L24 (idx23) BUATNENEK — "Kursi itu buat Nenek." Wajah tulus Bimo; ayah-ibu berpandangan
  {
    const sc = scene(world, 'buatnenek', 'cut');
    const A = E('g', {}, sc.cam); homeInt(A, 241, false);
    const bimo = Bimo(A, {});
    const B = E('g', {}, sc.cam); homeInt(B, 242, false);
    const ayah = Ayah(B, {}), ibu = Ibu(B, {});
    const C = E('g', {}, sc.cam); homeInt(C, 243, false);
    chairAt(C, 838, GY + 40, .94);
    const ayahC = Ayah(C, {}), ibuC = Ibu(C, {});
    during('buatnenek', 'buatneneke', (t) => {
      const t0 = lineT(23), d = lineD(23), b1 = t0 + d * .42, b2 = t0 + d * .74;
      bimo.set({ la: [56, -46], ra: [56, -46], talk: .45 + .55 * Math.abs(Math.sin(t * 7.3)), blink: blinkAt(t, 3), fear: .3, mood: 'flat', headR: -3 });
      tr(bimo.g, 500, GY, .97);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 500, 1010, 1.56, 500, 1008, 1.64);
      const phB = (t - b1) / (d * .32);
      ayah.set({ la: [20, -20], ra: [20, -20], blink: phB > .8 && phB < .88, fear: .3, headR: -10 + Math.sin(bump(phB, .7, 1) * Math.PI) * 3 });
      tr(ayah.g, 330, GY, .95);
      ibu.set({ la: [64, -56], ra: [22, -20], blink: blinkAt(t, 6), fear: .4, headR: 10 });
      tr(ibu.g, 720, GY, .95);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 525, 830, 1.44, 528, 832, 1.5);
      ayahC.set({ la: [20, -20], ra: [20, -20], blink: blinkAt(t, 8), headR: 6 });
      tr(ayahC.g, 150, GY, .88);
      ibuC.set({ la: [20, -20], ra: [20, -20], blink: blinkAt(t, 6), headR: -6 });
      tr(ibuC.g, 320, GY, .88);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 700, 1060, 1.3, 712, 1058, 1.39);
    });
  }

  // L25 (idx24) DAUN — pagi sunyi; ECU sehelai daun bambu di atas kursi; tarik lebar penutup
  {
    const sc = scene(world, 'daun', 'cut');
    const mkMotes = (g, n, seed) => {
      let sd = seed; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      const arr = [];
      for (let i = 0; i < n; i++) {
        const m = E('circle', { cx: 0, cy: 0, r: 2.6 + rnd() * 2.6, fill: '#e8f0fa', opacity: .16 + rnd() * .18 }, g);
        arr.push({ el: m, bx: 380 + rnd() * 560, by: 500 + rnd() * 800, ph: rnd() * TAU });
      }
      return arr;
    };
    const updMotes = (arr, t) => arr.forEach(m => {
      m.el.setAttribute('cx', (m.bx + Math.sin(t * .22 + m.ph) * 30).toFixed(0));
      m.el.setAttribute('cy', (m.by + Math.cos(t * .18 + m.ph) * 24).toFixed(0));
    });
    const A = E('g', {}, sc.cam); homeInt(A, 251, true);
    chairAt(A, 700, GY + 30, .95);
    bambooLeaf(A, 700, GY - 128, 1.05, -6);
    const motesA = mkMotes(A, 6, 77);
    const B = E('g', {}, sc.cam); homeInt(B, 252, true);
    E('path', { d: 'M880,420 L1180,420 L1330,1420 L700,1420 Z', fill: '#cfe0ee', opacity: .12 }, B);
    chairAt(B, 700, GY + 30, .95);
    const leafB = bambooLeaf(B, 700, GY - 128, 1.05, -6);
    const motesB = mkMotes(B, 8, 78);
    const C = E('g', {}, sc.cam); homeInt(C, 253, true);
    chairAt(C, 700, GY + 30, .95);
    bambooLeaf(C, 700, GY - 128, 1.05, -6);
    const motesC = mkMotes(C, 5, 79);
    during('daun', 'daune', (t) => {
      const t0 = lineT(24), d = lineD(24), b1 = t0 + d * .36, b2 = t0 + d * .72;
      updMotes(motesA, t);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 620, 1040, 1.2, 626, 1036, 1.26);
      leafB.setAttribute('transform', `translate(700,${GY - 128}) rotate(${(-6 + Math.sin(t * .5) * .8).toFixed(2)}) scale(1.05)`);
      updMotes(motesB, t);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 700, 1252, 2.3, 700, 1250, 2.37);
      updMotes(motesC, t);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 600, 1050, 1.3, 590, 1054, 1.13);
    });
  }
};
