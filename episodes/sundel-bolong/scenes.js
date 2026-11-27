// Ep.8 "Rambut yang Tak Pernah Bergerak" (Sundel Bolong) — FULL EPISODE, 27 baris.
// Basis kode: pola Ep.7 wewe-gombel (armKit/legKit/shotCam, scene 2-3 sub-shot,
// potong di batas frasa, pose = fungsi waktu absolut) + RIG SUNDEL dari folder
// review yang DISETUJUI user 27 Nov (3 state rambut, lubang luka sobek di
// TENGAH punggung 68%, gaun kumal, bedong bayi) — rig DISALIN VERBATIM.
// Kanon & spek: hidden_files/ep-08-sundel-bolong/bentuk-sundel-bolong.md.
// Hukum episode: rambut TIDAK PERNAH tertiup angin (gaun boleh); ia BERJALAN
// menapak; wajah selalu cantik; lenyap hanya L23 dan DITANDAI (kedip layar).
// Perbaikan temuan sendiri episode ini: kedip dipakai sebagai penanda vanish
// (konsisten Ep.7) + lampu tikungan BERKEDIP sesaat sebelum vanish L23 —
// cahaya yang "menelan" sosoknya, bukan potongan liar.
window.buildEpisode = (world, S) => {
  const { E, tr, scene, during, prog, eout, eio, clamp, T } = S;
  const P = window.Painted;
  const GY = 1420;
  const TAU = Math.PI * 2;
  const lerp = (a, b, e) => a + (b - a) * e;
  const d2r = d => d * Math.PI / 180;
  const st = (w, c) => ({ stroke: c || '#141021', 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const blinkAt = (t, seed) => ((t * 0.9 + seed) % 3.9) < 0.1;
  const bump = (x, a, b) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

  /* ================= armKit / legKit — mekanika bersama (pola Ep.6/Ep.7) ================= */
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
  const walkLeg = ph => {
    const sw = Math.sin(ph) * 21;
    const knee = 4 + Math.max(0, -Math.cos(ph)) * 36;
    return [sw, knee];
  };

  /* ================= PALET SUNDEL (spek §5.3 + revisi review 27 Nov) ================= */
  const SC = {
    dressL: '#e6eef7', dress: '#c9d6e4', dressD: '#8fa5c0', dirt: '#57503f',
    skin: '#e8d9c4', skinD: '#cbb59a', lip: '#9a5f5c',
    hair: '#0a0d14', hairD: '#05070d', hairHi: '#2c3a52',
    iris: '#14100c', eyeW: '#dfe9f5', holeIn: '#05070d', holeRim: '#1a0d12',
    lamp: '#ffb45e', lampL: '#ffd9a0',
    wound: '#2b0f13', wound2: '#3d1712', cavity: '#0d0507', cavityDeep: '#070304',
    coil: '#3a1414', coil2: '#2e1013', coilHi: '#5a2c22',
    blood: '#2a0f14', blood2: '#3d1512',
    grimeD: '#453d2f', grimeL: '#6f6450', damp: '#232a26'
  };
  const hemJag = 'L-121,-6 L-92,-15 L-58,-5 L-24,-14 L8,-6 L42,-15 L76,-5 L110,-14 L150,-8';
  const dressPath = `M-92,-692 C-98,-520 -124,-280 -150,-14 ${hemJag} C124,-280 98,-520 92,-692 Q0,-716 -92,-692 Z`;
  const dressShadePath = 'M92,-692 C98,-520 124,-280 150,-8 L84,-9 C64,-280 46,-520 42,-688 Q68,-702 92,-692 Z';
  const dirtPath = `M-150,-14 ${hemJag} L144,-104 Q110,-84 74,-118 Q36,-92 0,-124 Q-40,-96 -76,-120 Q-116,-92 -145,-100 Z`;
  const sideDressPath = 'M-56,-692 C-68,-500 -82,-280 -94,-14 L-60,-6 L-24,-14 L12,-6 L48,-14 L102,-8 C86,-280 64,-500 50,-692 Q0,-714 -56,-692 Z';

  /* ============ LAPISAN KOTOR GAUN — dipakai SEMUA tampak Sundel ============ */
  const dressGrime = (g, seed = 1, clip = 'dressClipF') => {
    let sd = seed * 3313 + 7;
    const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const gr = E('g', { 'clip-path': `url(#${clip})` }, g);
    E('ellipse', { cx: -30, cy: -310, rx: 150, ry: 240, fill: '#7d7668', opacity: .13, filter: P.blur(gr, 26) }, gr);
    E('ellipse', { cx: 40, cy: -140, rx: 140, ry: 150, fill: '#6e675b', opacity: .17, filter: P.blur(gr, 22) }, gr);
    E('ellipse', { cx: -78, cy: -120, rx: 52, ry: 88, fill: SC.damp, opacity: .27, filter: P.blur(gr, 14) }, gr);
    E('ellipse', { cx: 88, cy: -215, rx: 40, ry: 70, fill: SC.damp, opacity: .21, filter: P.blur(gr, 12) }, gr);
    E('ellipse', { cx: 6, cy: -54, rx: 66, ry: 40, fill: '#20261f', opacity: .23, filter: P.blur(gr, 12) }, gr);
    const cols = [SC.dirt, SC.grimeD, SC.grimeL, SC.dirt, '#3f382c'];
    for (let i = 0; i < 9; i++) {
      const x = -128 + rnd() * 256, top = -170 - rnd() * 270, len = 150 + rnd() * 200, w = 5 + rnd() * 10;
      const drift = (rnd() - .5) * 22, end = Math.min(-16, top + len);
      E('path', { d: `M${x.toFixed(0)},${top.toFixed(0)} C${(x + drift).toFixed(0)},${(top + len * .5).toFixed(0)} ${(x - drift).toFixed(0)},${(top + len * .8).toFixed(0)} ${(x + drift * .4).toFixed(0)},${end.toFixed(0)}`, fill: 'none', stroke: cols[i % cols.length], 'stroke-width': w.toFixed(1), 'stroke-linecap': 'round', opacity: (.22 + rnd() * .26).toFixed(2) }, gr);
    }
    for (let i = 0; i < 16; i++) {
      E('circle', { cx: (-140 + rnd() * 280).toFixed(0), cy: (-16 - rnd() * 92).toFixed(0), r: (1.8 + rnd() * 4.4).toFixed(1), fill: cols[i % cols.length], opacity: (.35 + rnd() * .3).toFixed(2) }, gr);
    }
    [-118, -64, -18, 30, 74, 122].forEach((x, i) => {
      E('path', { d: `M${x},-10 L${x + (i % 2 ? 3 : -3)},${5 + (i * 3) % 9}`, stroke: SC.grimeD, 'stroke-width': 2.4, opacity: .55, fill: 'none' }, gr);
    });
    return gr;
  };

  /* ================= SUNDEL BOLONG — tampak DEPAN (verbatim rig review) ================= */
  const SundelFront = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 118, ry: 14, fill: '#000', opacity: .34 }, g);
    E('path', { d: dressPath, fill: SC.dress, ...st(4) }, g);
    E('path', { d: dressShadePath, fill: SC.dressD, opacity: .8 }, g);
    const dirt = E('path', { d: dirtPath, fill: SC.dirt, opacity: .45 }, g);
    const flap = E('g', {}, g);
    E('path', { d: 'M-150,-14 C-128,-70 -96,-96 -58,-100 L-64,-30 C-92,-26 -122,-22 -150,-14Z', fill: SC.dressD, opacity: .55 }, flap);
    E('path', { d: 'M-146,-20 C-120,-58 -92,-78 -60,-84', fill: 'none', stroke: SC.dressL, 'stroke-width': 4, opacity: .7 }, flap);
    dressGrime(g, 3);
    const kit = armKit(g, { L1: 132, L2: 122, wO: 36, wF: 30, shirt: SC.dress, shirtD: SC.dressD, skin: SC.skin });
    E('rect', { x: -13, y: -718, width: 26, height: 36, rx: 8, fill: SC.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    const curtL = E('path', { d: 'M-56,-800 C-94,-786 -110,-700 -108,-540 C-106,-400 -102,-280 -98,-182 L-62,-182 C-68,-300 -72,-470 -70,-610 C-69,-706 -64,-772 -56,-800Z', fill: SC.hair, ...st(3, SC.hairD) }, hg);
    const curtR = E('path', { d: 'M56,-800 C94,-786 110,-700 108,-540 C106,-400 102,-280 98,-182 L62,-182 C68,-300 72,-470 70,-610 C69,-706 64,-772 56,-800Z', fill: SC.hair, ...st(3, SC.hairD) }, hg);
    [-84, 84].forEach(cx => E('path', { d: `M${cx},-760 C${cx + (cx < 0 ? -6 : 6)},-620 ${cx + (cx < 0 ? -4 : 4)},-420 ${cx},-230`, fill: 'none', stroke: SC.hairHi, 'stroke-width': 3.5, opacity: .75 }, hg));
    E('ellipse', { cx: 0, cy: -761, rx: 52, ry: 59, fill: SC.skin, ...st(3.5) }, hg);
    E('path', { d: 'M-54,-766 C-60,-820 -30,-842 0,-842 C30,-842 60,-820 54,-766 C42,-790 22,-798 2,-797 L0,-806 L-2,-797 C-22,-798 -42,-790 -54,-766Z', fill: SC.hair, ...st(3, SC.hairD) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 20},-764)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 7.5, ry: 10.5, fill: SC.eyeW }, open);
      E('ellipse', { cx: 0, cy: 1, rx: 4.6, ry: 7.5, fill: SC.iris }, open);
      E('circle', { cx: 1.8, cy: -2.5, r: 1.7, fill: '#fff', opacity: .9 }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#3a2c20') }, e);
      const down = E('path', { d: 'M-9,-1 Q0,5 9,-1', fill: 'none', ...st(3.5, '#3a2c20') }, e);
      return { e, open, shut, down };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 9},-786 Q${sd * 20},-791 ${sd * 32},-786`, fill: 'none', ...st(3.5, '#2a2018') }, hg));
    E('path', { d: 'M-2,-748 Q-5,-736 1,-734 Q7,-734 7,-741', fill: 'none', ...st(2.8, '#b39a7d') }, hg);
    const mouthN = E('path', { d: 'M-10,-712 Q0,-707 10,-712', fill: 'none', ...st(3.5, SC.lip) }, hg);
    const mouthS = E('path', { d: 'M0,-718 C8,-718 12,-711 12,-703 C12,-694 7,-688 0,-688 C-7,-688 -12,-694 -12,-703 C-12,-711 -8,-718 0,-718Z', fill: '#5e2a24', ...st(3, '#40201c') }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [13, -14], ra = [13, -14], headR = 0, headTilt = 0, blink = false, face = 'neutral', wind = 0, bob = 0 } = o;
        head.setAttribute('transform', `rotate(${(headR + headTilt).toFixed(2)} 0 -706) translate(0 ${headTilt ? 7 : 0})`);
        eyes.forEach(ey => {
          ey.open.style.display = blink || face === 'down' ? 'none' : '';
          ey.shut.style.display = blink ? '' : 'none';
          ey.down.style.display = !blink && face === 'down' ? '' : 'none';
          ey.open.setAttribute('transform', `scale(${face === 'scream' ? 1.3 : 1})`);
        });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up = face === 'scream' ? -7 : face === 'down' ? 3 : 0;
          b.setAttribute('d', `M${sd * 9},${-786 + up} Q${sd * 20},${-791 + up} ${sd * 32},${-786 + up}`);
        });
        mouthN.style.display = face === 'scream' ? 'none' : '';
        mouthS.style.display = face === 'scream' ? '' : 'none';
        flap.setAttribute('transform', `rotate(${(-wind * 7).toFixed(2)} -140 -20)`);
        dirt.setAttribute('opacity', .45);
        g.setAttribute('transform', `translate(0 ${bob.toFixed(1)})`);
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-86, -664]);
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [86, -664]);
      }
    };
    api.set({});
    tr(root, x, y, s);
    return api;
  };

  /* ================= SUNDEL BOLONG — tampak BELAKANG (verbatim rig review) ================= */
  const SundelBack = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 118, ry: 14, fill: '#000', opacity: .34 }, g);
    E('path', { d: dressPath, fill: '#b9c9dc', ...st(4) }, g);
    E('path', { d: dressShadePath, fill: SC.dressD, opacity: .7 }, g);
    E('path', { d: dirtPath, fill: SC.dirt, opacity: .45 }, g);
    const backPanel = E('path', { d: 'M-60,-706 L60,-706 L54,-286 L-54,-286 Z', fill: '#b9c9dc' }, g);
    dressGrime(g, 5);
    const bloodG = E('g', {}, g);
    E('ellipse', { cx: 2, cy: -552, rx: 94, ry: 90, fill: SC.blood, opacity: .15, filter: P.blur(bloodG, 13) }, bloodG);
    [[-34, -486, 120, 6], [-8, -478, 320, 8], [18, -482, 140, 5], [42, -490, 84, 5], [-52, -496, 66, 4]].forEach(([x, y, len, w], i) => {
      E('path', { d: `M${x},${y} C${x + 5},${(y + len * .4).toFixed(0)} ${x - 5},${(y + len * .72).toFixed(0)} ${x + 2},${y + len}`, fill: 'none', stroke: i % 2 ? SC.blood2 : SC.blood, 'stroke-width': w, 'stroke-linecap': 'round', opacity: .55 }, bloodG);
      E('circle', { cx: x + 2, cy: y + len + 4, r: (w * .42).toFixed(1), fill: i % 2 ? SC.blood2 : SC.blood, opacity: .5 }, bloodG);
    });
    const holeG = E('g', {}, g);
    const rimD = 'M-60,-582 C-54,-612 -24,-628 8,-626 C38,-624 62,-606 65,-578 C68,-548 52,-518 28,-506 C2,-493 -34,-498 -52,-518 C-66,-534 -66,-554 -60,-582 Z';
    E('path', { d: rimD, fill: SC.wound }, holeG);
    E('path', { d: rimD, fill: SC.wound2, transform: 'translate(7 -553) scale(.86) translate(-2 559)' }, holeG);
    E('ellipse', { cx: -48, cy: -586, rx: 13, ry: 9, fill: SC.wound2, opacity: .9, transform: 'rotate(-24 -48 -586)' }, holeG);
    E('ellipse', { cx: 52, cy: -524, rx: 11, ry: 8, fill: SC.wound2, opacity: .9, transform: 'rotate(30 52 -524)' }, holeG);
    E('ellipse', { cx: -30, cy: -508, rx: 12, ry: 7, fill: SC.wound, opacity: .95, transform: 'rotate(12 -30 -508)' }, holeG);
    E('path', { d: rimD, fill: SC.cavity, transform: 'translate(9 -552) scale(.72) translate(-2 559)' }, holeG);
    E('ellipse', { cx: -14, cy: -548, rx: 34, ry: 24, fill: '#160a0c', opacity: .9 }, holeG);
    E('path', { d: 'M-28,-572 C-14,-584 10,-585 15,-574 C18,-566 10,-559 0,-561', fill: 'none', stroke: SC.coil, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: .8 }, holeG);
    E('path', { d: 'M-16,-542 C-4,-548 12,-545 16,-537', fill: 'none', stroke: SC.coil, 'stroke-width': 5.5, 'stroke-linecap': 'round', opacity: .65 }, holeG);
    E('path', { d: 'M-24,-568 C-12,-576 6,-577 11,-571', fill: 'none', stroke: SC.coilHi, 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: .35 }, holeG);
    E('ellipse', { cx: 21, cy: -540, rx: 15, ry: 10, fill: SC.coil2, opacity: .9, transform: 'rotate(-18 21 -540)' }, holeG);
    E('ellipse', { cx: -19, cy: -534, rx: 12, ry: 8, fill: '#33151a', opacity: .85, transform: 'rotate(14 -19 -534)' }, holeG);
    E('path', { d: 'M24,-568 C30,-560 29,-548 22,-542', fill: 'none', stroke: SC.coil, 'stroke-width': 5.5, 'stroke-linecap': 'round', opacity: .7 }, holeG);
    E('ellipse', { cx: 2, cy: -556, rx: 27, ry: 22, fill: SC.cavityDeep, opacity: .55 }, holeG);
    E('path', { d: 'M-52,-596 L-38,-588 L-54,-580 Z', fill: '#1f0a0e' }, holeG);
    E('path', { d: 'M52,-538 L68,-530 L50,-522 Z', fill: '#1f0a0e' }, holeG);
    E('path', { d: 'M-6,-500 L2,-514 L12,-501 Z', fill: '#1f0a0e' }, holeG);
    const leak = E('path', { d: 'M-30,-528 C-22,-522 -10,-520 0,-522 C-10,-526 -20,-526 -30,-528 Z', fill: SC.lamp, opacity: .24 }, holeG);
    E('rect', { x: -13, y: -718, width: 26, height: 36, rx: 8, fill: SC.skinD, ...st(3) }, g);
    const head = E('g', {}, g);
    E('ellipse', { cx: 0, cy: -761, rx: 52, ry: 59, fill: SC.hair, ...st(3, SC.hairD) }, head);
    const kit = armKit(g, { L1: 132, L2: 122, wO: 36, wF: 30, shirt: '#b9c9dc', shirtD: SC.dressD, skin: SC.skin });
    const hairA = E('g', {}, g);
    E('path', { d: 'M0,-828 C-72,-826 -106,-758 -104,-600 C-102,-430 -98,-290 -90,-178 C-52,-158 52,-158 90,-178 C98,-290 102,-430 104,-600 C106,-758 72,-826 0,-828Z', fill: SC.hair, ...st(3.5, SC.hairD) }, hairA);
    E('path', { d: 'M-30,-820 C-58,-700 -60,-420 -52,-190 C-70,-420 -68,-680 -30,-820Z', fill: SC.hairD, opacity: .8 }, hairA);
    [-58, -24, 14, 52].forEach((cx, i) => E('path', { d: `M${cx},-800 C${cx + (i % 2 ? 7 : -7)},-620 ${cx + (i % 2 ? -5 : 5)},-400 ${cx + (i % 2 ? 4 : -4)},-205`, fill: 'none', stroke: SC.hairHi, 'stroke-width': 3.5, opacity: .7 }, hairA));
    const hairB = E('g', {}, g);
    E('path', { d: 'M-14,-822 C-88,-812 -138,-726 -136,-566 C-134,-430 -126,-300 -116,-192 L-54,-198 C-62,-320 -66,-486 -62,-626 C-59,-736 -48,-806 -14,-822Z', fill: SC.hair, ...st(3.5, SC.hairD) }, hairB);
    E('path', { d: 'M14,-822 C88,-812 138,-726 136,-566 C134,-430 126,-300 116,-192 L54,-198 C62,-320 66,-486 62,-626 C59,-736 48,-806 14,-822Z', fill: SC.hair, ...st(3.5, SC.hairD) }, hairB);
    [-96, 96].forEach(cx => E('path', { d: `M${cx},-780 C${cx + (cx < 0 ? -8 : 8)},-600 ${cx + (cx < 0 ? -5 : 5)},-380 ${cx + (cx < 0 ? -3 : 3)},-220`, fill: 'none', stroke: SC.hairHi, 'stroke-width': 3.5, opacity: .7 }, hairB));
    const hairC = E('g', {}, g);
    E('path', { d: 'M-8,-824 C-80,-818 -108,-740 -102,-610 C-98,-520 -88,-470 -70,-430 C-40,-470 -30,-560 -34,-660 C-36,-750 -28,-812 -8,-824Z', fill: SC.hair, ...st(3.5, SC.hairD) }, hairC);
    E('path', { d: 'M-96,-620 C-40,-570 30,-554 92,-588 C70,-510 20,-468 -34,-480 C-76,-490 -100,-546 -96,-620Z', fill: SC.hair, ...st(3.5, SC.hairD) }, hairC);
    E('path', { d: 'M96,-636 C40,-578 -28,-560 -88,-596 C-64,-506 -8,-472 48,-488 C84,-498 102,-560 96,-636Z', fill: SC.hair, ...st(3.5, SC.hairD) }, hairC);
    [-52, 8, 58].forEach((cx, i) => E('path', { d: `M${cx},-602 C${cx + 12},-570 ${cx - 8},-534 ${cx + 4},-502`, fill: 'none', stroke: SC.hairHi, 'stroke-width': 3, opacity: .65 }, hairC));
    const gripL = E('ellipse', { cx: 0, cy: 0, rx: 17, ry: 24, fill: SC.hair, ...st(2.5, SC.hairD) }, g);
    const gripR = E('ellipse', { cx: 0, cy: 0, rx: 17, ry: 24, fill: SC.hair, ...st(2.5, SC.hairD) }, g);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { hair = 'A', la = [13, -14], ra = [13, -14], headR = 0, hole = 'dark', bob = 0 } = o;
        hairA.style.display = hair === 'A' ? '' : 'none';
        hairB.style.display = hair === 'B' ? '' : 'none';
        hairC.style.display = hair === 'C' ? '' : 'none';
        holeG.style.display = hair === 'B' ? '' : 'none';
        backPanel.style.display = hair === 'A' ? 'none' : '';
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -706)`);
        if (hole === 'lamp') { leak.style.display = ''; leak.setAttribute('fill', SC.lamp); leak.setAttribute('opacity', .24); }
        else if (hole === 'moon') { leak.style.display = ''; leak.setAttribute('fill', '#9fb8d8'); leak.setAttribute('opacity', .16); }
        else { leak.style.display = 'none'; }
        g.setAttribute('transform', `translate(0 ${bob.toFixed(1)})`);
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-92, -664]);
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [92, -664]);
        const grip = hair === 'C';
        gripL.style.display = gripR.style.display = grip ? '' : 'none';
        if (grip && api.hands.l) { gripL.setAttribute('cx', api.hands.l[0]); gripL.setAttribute('cy', api.hands.l[1]); }
        if (grip && api.hands.r) { gripR.setAttribute('cx', api.hands.r[0]); gripR.setAttribute('cy', api.hands.r[1]); }
      }
    };
    api.set({});
    tr(root, x, y, s);
    return api;
  };

  /* ================= SUNDEL BOLONG — PROFIL BERJALAN (verbatim rig review) ================= */
  const SundelSide = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 2, cy: 6, rx: 122, ry: 14, fill: '#000', opacity: .36 }, g);
    const body = E('g', {}, g);
    const footB = E('g', {}, body);
    E('path', { d: 'M0,0 L4,-52', stroke: SC.skinD, 'stroke-width': 17, 'stroke-linecap': 'round' }, footB);
    E('ellipse', { cx: 8, cy: -3, rx: 21, ry: 8, fill: SC.skin, ...st(2.5) }, footB);
    const footF = E('g', {}, body);
    E('path', { d: 'M0,0 L-3,-50', stroke: SC.skinD, 'stroke-width': 17, 'stroke-linecap': 'round' }, footF);
    E('ellipse', { cx: 9, cy: -3, rx: 21, ry: 8, fill: SC.skin, ...st(2.5) }, footF);
    E('path', { d: sideDressPath, fill: SC.dress, ...st(4) }, body);
    E('path', { d: 'M50,-692 C64,-500 86,-280 102,-14 L58,-14 C44,-280 30,-500 24,-688 Q38,-698 50,-692Z', fill: SC.dressD, opacity: .75 }, body);
    E('path', { d: 'M-94,-14 L-60,-6 L-24,-14 L12,-6 L48,-14 L102,-8 L98,-88 Q40,-70 0,-94 Q-52,-78 -90,-88 Z', fill: SC.dirt, opacity: .5 }, body);
    const flapS = E('path', { d: 'M102,-14 C84,-52 58,-72 26,-78 L34,-24 C58,-22 84,-20 102,-14Z', fill: SC.dressD, opacity: .5 }, body);
    dressGrime(body, 7, 'dressClipS');
    E('path', { d: 'M-2,-826 C-56,-820 -82,-742 -80,-584 C-78,-424 -74,-284 -68,-180 L-24,-180 C-32,-300 -36,-472 -34,-624 C-32,-724 -24,-796 -2,-826Z', fill: SC.hair, ...st(3.5, SC.hairD) }, body);
    E('path', { d: 'M-52,-790 C-64,-640 -64,-420 -56,-215', fill: 'none', stroke: SC.hairHi, 'stroke-width': 3.5, opacity: .7 }, body);
    const head = E('g', {}, body);
    E('ellipse', { cx: 8, cy: -759, rx: 45, ry: 58, fill: SC.skin, ...st(3.5) }, head);
    E('path', { d: 'M44,-756 C54,-750 55,-741 47,-736', fill: 'none', ...st(3, '#b39a7d') }, head);
    E('ellipse', { cx: 22, cy: -766, rx: 5.5, ry: 8.5, fill: SC.iris }, head);
    E('path', { d: 'M10,-786 Q22,-791 34,-786', fill: 'none', ...st(3.5, '#2a2018') }, head);
    E('path', { d: 'M34,-722 Q40,-719 35,-714', fill: 'none', ...st(3, SC.lip) }, head);
    E('path', { d: 'M-30,-782 C-36,-824 -8,-842 14,-840 C34,-838 48,-822 46,-792 C36,-808 20,-812 6,-808 C-10,-814 -24,-802 -30,-782Z', fill: SC.hair, ...st(3, SC.hairD) }, head);
    const kit = armKit(body, { L1: 130, L2: 120, wO: 35, wF: 29, shirt: SC.dress, shirtD: SC.dressD, skin: SC.skin });
    [kit.arms.l.o, kit.arms.l.f, kit.arms.l.cuff, kit.arms.l.hand, kit.arms.l.fg1, kit.arms.l.fg1s, kit.arms.l.fg2, kit.arms.l.fg2s].forEach(el => el.style.display = 'none');
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { ph = 0.9, wind = 0 } = o;
        const sw = Math.sin(ph);
        body.setAttribute('transform', `translate(0 ${(-Math.abs(Math.cos(ph)) * 7).toFixed(1)}) rotate(1.6 0 -400)`);
        footF.setAttribute('transform', `translate(${(46 + sw * 58).toFixed(1)} ${(sw > 0 ? -22 : 0).toFixed(1)})`);
        footB.setAttribute('transform', `translate(${(-38 - sw * 52).toFixed(1)} ${(sw < 0 ? -20 : 0).toFixed(1)})`);
        flapS.setAttribute('transform', `rotate(${(-wind * 6).toFixed(2)} 96 -16)`);
        api.hands.r = kit.place(kit.arms.r, -8 + sw * 17, -12, [44, -660]);
        api.hands.l = kit.place(kit.arms.l, -4 - sw * 10, -10, [-30, -660]);
      }
    };
    api.set({});
    tr(root, x, y, s);
    return api;
  };

  /* ================= JOKO — pemuda skeptis, ±752 (verbatim rig review) ================= */
  const Joko = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#cf9868', hair: '#14100c', shirt: '#2e5339', shirtD: '#1f3826', pants: '#2b3a55', shoe: '#1c130b' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 88, ry: 13, fill: '#000', opacity: .3 }, g);
    const legs = legKit(g, { L1: 170, L2: 160, cloth: C.pants, shoe: C.shoe });
    E('path', { d: 'M-56,-560 C-63,-486 -61,-404 -56,-332 L56,-332 C61,-404 63,-486 56,-560 Q0,-582 -56,-560Z', fill: C.shirt, ...st(4) }, g);
    E('path', { d: 'M56,-560 C63,-486 61,-404 56,-332 L36,-332 C43,-406 44,-484 39,-556Z', fill: C.shirtD }, g);
    const kit = armKit(g, { L1: 128, L2: 118, shirt: C.shirt, shirtD: C.shirtD, skin: C.skin });
    E('rect', { x: -15, y: -590, width: 30, height: 40, rx: 8, fill: C.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('ellipse', { cx: 0, cy: -664, rx: 57, ry: 69, fill: C.skin, ...st(4) }, hg);
    E('path', { d: 'M-57,-664 C-60,-716 -32,-740 0,-740 C32,-740 60,-716 57,-664 C48,-686 38,-692 30,-684 L24,-700 L12,-686 L2,-702 L-8,-687 L-18,-699 C-30,-692 -48,-688 -57,-664Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 22},-668)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 6.8, ry: 10, fill: '#241610' }, open);
      E('circle', { cx: 2.4, cy: -3.4, r: 2.4, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 11},-690 Q${sd * 22},-695 ${sd * 34},-690`, fill: 'none', ...st(3.5, '#2c1e12') }, hg));
    E('path', { d: 'M-2,-650 Q-5,-638 2,-636 Q8,-636 8,-644', fill: 'none', ...st(3, '#a06a42') }, hg);
    const grin = E('path', { d: 'M-13,-614 Q0,-604 14,-616', fill: 'none', ...st(3.5, '#8a3b34') }, hg);
    const flat = E('path', { d: 'M-11,-610 L11,-610', fill: 'none', ...st(3.5, '#8a3b34') }, hg);
    const openM = E('ellipse', { cx: 0, cy: -612, rx: 7.5, ry: 0.1, fill: '#6d2620' }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [19, -21], ra = [19, -21], headR = 0, blink = false, fear = 0, shock = 0, talk = 0, mood = 'grin', legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -580)`);
        const wide = 1 + .35 * shock;
        eyes.forEach(ey => { ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none'; ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`); });
        brows.forEach((b, i) => { const sd = i === 0 ? -1 : 1, up = fear * 8 + shock * 10; b.setAttribute('d', `M${sd * 11},${(-690 - up).toFixed(0)} Q${sd * 22},${(-695 - up).toFixed(0)} ${sd * 34},-690`); });
        grin.style.display = mood === 'grin' && talk <= .15 && shock <= .55 ? '' : 'none';
        flat.style.display = mood !== 'grin' && talk <= .15 && shock <= .55 ? '' : 'none';
        openM.style.display = talk > .15 || shock > .55 ? '' : 'none';
        openM.setAttribute('ry', (0.1 + Math.max(talk * 6, shock * 8)).toFixed(2));
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-54, -514], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [54, -514], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-26, -332]);
        legs.place(legs.legs.r, legR[0], legR[1], [26, -332]);
      }
    };
    api.set({});
    tr(root, x, y, s);
    return api;
  };

  /* ================= PAK KARTO — tetua, ±700 (verbatim rig review) ================= */
  const Karto = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#a06a42', hair: '#b8b0a2', shirt: '#6e4f30', shirtD: '#593f26', sarung: '#4a3826', sarungL: '#6b543a', shoe: '#241708' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 92, ry: 13, fill: '#000', opacity: .3 }, g);
    const legs = legKit(g, { L1: 138, L2: 128, wO: 38, wF: 30, cloth: '#38322a', shoe: C.shoe });
    const sar = E('g', {}, g);
    E('path', { d: 'M-64,-302 L64,-302 L78,-90 L-78,-90 Z', fill: C.sarung, ...st(4) }, sar);
    [-36, 0, 36].forEach(lx => E('path', { d: `M${lx},-300 L${lx},-92`, stroke: C.sarungL, 'stroke-width': 3, opacity: .5 }, sar));
    E('path', { d: 'M-64,-302 L64,-302 L66,-274 L-66,-274Z', fill: '#33261a' }, sar);
    E('path', { d: 'M-72,-512 C-80,-440 -78,-368 -64,-296 L64,-296 C78,-368 80,-440 72,-512 Q0,-540 -72,-512Z', fill: C.shirt, ...st(4) }, g);
    [[-38, -452], [-4, -478], [30, -446], [-20, -398], [16, -388], [44, -486]].forEach(([cx, cy]) => E('circle', { cx, cy, r: 5.5, fill: C.shirtD, opacity: .85 }, g));
    E('path', { d: 'M72,-512 C80,-440 78,-368 64,-296 L40,-296 C52,-370 54,-442 48,-508Z', fill: C.shirtD }, g);
    const kit = armKit(g, { L1: 106, L2: 96, wO: 36, wF: 30, shirt: C.shirt, shirtD: C.shirtD, skin: C.skin });
    E('rect', { x: -15, y: -536, width: 30, height: 38, rx: 8, fill: C.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('circle', { cx: 0, cy: -592, r: 61, fill: C.skin, ...st(4) }, hg);
    [-1, 1].forEach(sd => E('path', { d: `M${sd * 56},-598 Q${sd * 62},-572 ${sd * 51},-552`, fill: 'none', stroke: C.hair, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: .85 }, hg));
    E('path', { d: 'M-48,-612 L48,-612 L44,-654 Q0,-666 -44,-654 Z', fill: '#1c1a17', ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 22},-596)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 6.5, ry: 9, fill: '#241610' }, open);
      E('circle', { cx: 2, cy: -3, r: 2.2, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 11},-618 Q${sd * 22},-623 ${sd * 33},-618`, fill: 'none', ...st(4.5, C.hair) }, hg));
    E('path', { d: 'M-2,-580 Q-5,-569 2,-567 Q8,-567 8,-574', fill: 'none', ...st(3, '#7c4f2c') }, hg);
    E('path', { d: 'M-19,-559 Q0,-550 19,-559 Q13,-547 0,-546 Q-13,-547 -19,-559Z', fill: '#9a927f', ...st(2.5, '#7c7668') }, hg);
    [-1, 1].forEach(sd => E('path', { d: `M${sd * 34},-566 Q${sd * 42},-556 ${sd * 40},-544`, fill: 'none', stroke: '#7c4f2c', 'stroke-width': 2.6, opacity: .8 }, hg));
    const mouth = E('path', { d: 'M-8,-540 Q0,-536 8,-540', fill: 'none', ...st(3.5, '#6e3a30') }, hg);
    const talkM = E('ellipse', { cx: 0, cy: -538, rx: 7, ry: 0.1, fill: '#5e2a24' }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [18, -22], ra = [18, -22], headR = 0, blink = false, fear = 0, shock = 0, talk = 0, legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -528)`);
        const wide = 1 + .3 * shock;
        eyes.forEach(ey => { ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none'; ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`); });
        brows.forEach((b, i) => { const sd = i === 0 ? -1 : 1, up = fear * 7 + shock * 9; b.setAttribute('d', `M${sd * 11},${(-618 - up).toFixed(0)} Q${sd * 22},${(-623 - up).toFixed(0)} ${sd * 33},-618`); });
        mouth.style.display = talk > .15 ? 'none' : '';
        talkM.style.display = talk > .15 ? '' : 'none';
        talkM.setAttribute('ry', (0.1 + talk * 5.5).toFixed(2));
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-68, -466], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [68, -466], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-27, -302]);
        legs.place(legs.legs.r, legR[0], legR[1], [27, -302]);
      }
    };
    api.set({});
    tr(root, x, y, s);
    return api;
  };

  /* ================= LASTRI — ibu muda ±690 + BEDONG bayi (verbatim rig review) ================= */
  const Lastri = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#d29c6c', hair: '#1d130c', dress: '#a86a72', dressD: '#8a525a', flower: '#d9a7ad', shoe: '#2a1c12', cloth: '#e8ddc4' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 84, ry: 12, fill: '#000', opacity: .3 }, g);
    const legs = legKit(g, { L1: 136, L2: 126, wO: 35, wF: 27, cloth: '#7c4a52', shoe: C.shoe });
    const dr = E('g', {}, g);
    E('path', { d: 'M-62,-312 L62,-312 L82,-94 L-82,-94 Z', fill: C.dress, ...st(4) }, dr);
    [[-38, -252], [-8, -208], [24, -258], [46, -196], [-26, -146], [12, -138]].forEach(([cx, cy]) => {
      E('circle', { cx, cy, r: 6, fill: C.flower, opacity: .8 }, dr);
      E('circle', { cx, cy, r: 2.2, fill: '#f2d8a0', opacity: .9 }, dr);
    });
    E('path', { d: 'M-62,-312 L62,-312 L64,-284 L-64,-284Z', fill: C.dressD }, dr);
    E('path', { d: 'M-58,-516 C-64,-450 -62,-378 -58,-306 L58,-306 C62,-378 64,-450 58,-516 Q0,-540 -58,-516Z', fill: C.dress, ...st(4) }, g);
    E('path', { d: 'M58,-516 C64,-450 62,-378 58,-306 L36,-306 C44,-380 46,-448 40,-512Z', fill: C.dressD }, g);
    const kit = armKit(g, { L1: 110, L2: 100, wO: 35, wF: 29, shirt: C.dress, shirtD: C.dressD, skin: C.skin });
    const bundle = E('g', { transform: 'translate(-106,-366) rotate(46)' }, g);
    E('path', { d: 'M-34,-22 C-8,-27 26,-25 46,-15 C59,-8 61,3 50,11 C32,22 -6,25 -28,20 C-43,16 -47,-15 -34,-22Z', fill: C.cloth, ...st(3.5) }, bundle);
    [[-14, -21, -25, 18], [8, -23, -3, 20], [29, -20, 18, 17]].forEach(([x1, y1, x2, y2]) =>
      E('path', { d: `M${x1},${y1} L${x2},${y2}`, stroke: '#c9b892', 'stroke-width': 4.5, fill: 'none', opacity: .9 }, bundle));
    E('path', { d: 'M43,-14 C51,-6 51,4 43,11', fill: 'none', stroke: '#c9b892', 'stroke-width': 4 }, bundle);
    E('path', { d: 'M-29,-15 C-23,-4 -23,5 -28,14', fill: 'none', stroke: '#b7a37e', 'stroke-width': 5 }, bundle);
    const bHead = E('g', { transform: 'translate(-47,-3) rotate(-16)' }, bundle);
    E('circle', { cx: 0, cy: 0, r: 20, fill: '#eec39a', ...st(2.5) }, bHead);
    E('path', { d: 'M-15,-8 C-11,-20 11,-20 15,-8 C6,-13 -6,-13 -15,-8Z', fill: '#8a525a' }, bHead);
    E('path', { d: 'M-11,-1 Q-7,2 -3,-1 M3,-1 Q7,2 11,-1', fill: 'none', stroke: '#7c4f2c', 'stroke-width': 2.2 }, bHead);
    E('circle', { cx: 0, cy: 3, r: 1.6, fill: '#c98f5f' }, bHead);
    E('path', { d: 'M-3,8 Q0,10 3,8', fill: 'none', stroke: '#a06a42', 'stroke-width': 2 }, bHead);
    E('circle', { cx: -9, cy: 5, r: 3.4, fill: '#e2a184', opacity: .55 }, bHead);
    E('circle', { cx: 9, cy: 5, r: 3.4, fill: '#e2a184', opacity: .55 }, bHead);
    E('rect', { x: -14, y: -540, width: 28, height: 38, rx: 8, fill: C.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('circle', { cx: 40, cy: -648, r: 21, fill: C.hair, ...st(2.5) }, hg);
    E('ellipse', { cx: 0, cy: -606, rx: 53, ry: 63, fill: C.skin, ...st(4) }, hg);
    E('path', { d: 'M-53,-606 C-57,-652 -30,-672 0,-672 C30,-672 57,-652 53,-606 C44,-632 26,-640 8,-636 C-8,-642 -34,-636 -44,-622 C-50,-618 -52,-612 -53,-606Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 20},-610)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 6.5, ry: 9.5, fill: '#241610' }, open);
      E('circle', { cx: 2.2, cy: -3, r: 2.2, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    [-1, 1].forEach(sd => E('path', { d: `M${sd * 12},-594 Q${sd * 20},-590 ${sd * 28},-594`, fill: 'none', stroke: '#b3814f', 'stroke-width': 2.4, opacity: .8 }, hg));
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 10},-630 Q${sd * 20},-634 ${sd * 30},-630`, fill: 'none', ...st(3.5, '#3a2718') }, hg));
    E('path', { d: 'M-2,-592 Q-4,-581 1,-579 Q6,-579 6,-586', fill: 'none', ...st(2.8, '#a06a42') }, hg);
    const mouth = E('path', { d: 'M-9,-556 Q0,-551 9,-556', fill: 'none', ...st(3.5, '#8a3b34') }, hg);
    const talkM = E('ellipse', { cx: 0, cy: -554, rx: 6.5, ry: 0.1, fill: '#5e2a24' }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { ra = [24, -26], headR = 0, blink = false, fear = 0, shock = 0, talk = 0, legL = [0, 4], legR = [0, 4] } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -532)`);
        const wide = 1 + .3 * shock;
        eyes.forEach(ey => { ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none'; ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`); });
        brows.forEach((b, i) => { const sd = i === 0 ? -1 : 1, up = fear * 7 + shock * 9; b.setAttribute('d', `M${sd * 10},${(-630 - up).toFixed(0)} Q${sd * 20},${(-634 - up).toFixed(0)} ${sd * 30},-630`); });
        mouth.style.display = talk > .15 ? 'none' : '';
        talkM.style.display = talk > .15 ? '' : 'none';
        talkM.setAttribute('ry', (0.1 + talk * 5).toFixed(2));
        api.hands.l = kit.place(kit.arms.l, 52, -96, [-56, -470]);
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [56, -470]);
        legs.place(legs.legs.l, legL[0], legL[1], [-24, -312]);
        legs.place(legs.legs.r, legR[0], legR[1], [24, -312]);
      }
    };
    api.set({});
    tr(root, x, y, s);
    return api;
  };

  // siluet warga latar depan (verbatim review)
  const wargaBack = (shot, x, y, s, kind) => {
    const g = E('g', {}, shot);
    if (kind === 'peci') {
      E('path', { d: 'M-95,190 C-92,90 -60,60 -30,52 L30,52 C60,60 92,90 95,190 Z', fill: '#04050a' }, g);
      E('circle', { cx: 0, cy: 0, r: 56, fill: '#04050a' }, g);
      E('path', { d: 'M-44,-38 L44,-38 L40,-72 Q0,-82 -40,-72 Z', fill: '#04050a' }, g);
    } else if (kind === 'sanggul') {
      E('path', { d: 'M-88,190 C-86,96 -56,64 -28,54 L28,54 C56,64 86,96 88,190 Z', fill: '#04050a' }, g);
      E('circle', { cx: 0, cy: 2, r: 50, fill: '#04050a' }, g);
      E('circle', { cx: 30, cy: -34, r: 17, fill: '#04050a' }, g);
    } else {
      E('path', { d: 'M-92,190 C-90,92 -58,62 -29,53 L29,53 C58,62 90,92 92,190 Z', fill: '#04050a' }, g);
      E('circle', { cx: 0, cy: 0, r: 54, fill: '#04050a' }, g);
      E('path', { d: 'M-54,-14 C-58,-52 -30,-68 0,-68 C30,-68 58,-52 54,-14 C44,-34 24,-40 0,-38 C-24,-40 -44,-34 -54,-14Z', fill: '#04050a' }, g);
    }
    tr(g, x, y, s);
    return g;
  };

  /* ================= DEFS BERSAMA (svg world-level, selalu dirender) ================= */
  const scDefs = scene(world, 'jalan', 'cut');
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
    E('stop', { offset: 0, 'stop-color': '#ffca7a', 'stop-opacity': .55 }, lamp); E('stop', { offset: 1, 'stop-color': '#ffca7a', 'stop-opacity': 0 }, lamp);
    const cpF = E('clipPath', { id: 'dressClipF' }, SD);
    E('path', { d: dressPath }, cpF);
    E('rect', { x: -165, y: -24, width: 330, height: 58 }, cpF);
    const cpS = E('clipPath', { id: 'dressClipS' }, SD);
    E('path', { d: sideDressPath }, cpS);
    E('rect', { x: -115, y: -24, width: 245, height: 58 }, cpS);
  }
  const stars = (shot, seed, n = 36, yMax = 700) => {
    let sd = seed * 7919 + 13;
    const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) E('circle', { cx: (-300 + rnd() * 1680).toFixed(0), cy: (rnd() * yMax).toFixed(0), r: (1.4 + rnd() * 2.2).toFixed(1), fill: '#cfe0f4', opacity: (.3 + rnd() * .55).toFixed(2) }, shot);
  };
  const moonAt = (shot, mx, my, mr = 52) => {
    E('circle', { cx: mx, cy: my, r: mr * 3.1, fill: 'url(#moonHalo)' }, shot);
    E('circle', { cx: mx, cy: my, r: mr, fill: '#dfe9f5' }, shot);
    E('circle', { cx: mx - mr * .34, cy: my - mr * .2, r: mr * .16, fill: '#b9c9dc', opacity: .6 }, shot);
    E('circle', { cx: mx + mr * .22, cy: my + mr * .3, r: mr * .11, fill: '#b9c9dc', opacity: .5 }, shot);
  };
  const fogBand = (shot, cx, cy, rx, ry, op) => E('ellipse', { cx, cy, rx, ry, fill: '#aebfd8', opacity: op, filter: P.blur(shot, 18) }, shot);

  /* ================= SET-SET ================= */
  // jalan desa malam (dari review, dipakai luas)
  const roadSet = (shot, seed) => {
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#nSky)' }, shot);
    stars(shot, seed + 7, 34, 640);
    moonAt(shot, 168, 220, 44);
    const fog1 = E('ellipse', { cx: 420, cy: 1300, rx: 460, ry: 44, fill: '#aebfd8', opacity: .10, filter: P.blur(shot, 18) }, shot);
    E('path', { d: 'M-320,1140 L-90,1020 L140,1140 Z', fill: '#101725' }, shot);
    E('rect', { x: -310, y: 1134, width: 440, height: 286, fill: '#131a29' }, shot);
    E('rect', { x: -180, y: 1200, width: 50, height: 62, fill: '#ffb45e', opacity: .75 }, shot);
    E('path', { d: 'M1050,1080 L1210,990 L1370,1080 Z', fill: '#0d1524' }, shot);
    E('rect', { x: 1060, y: 1074, width: 300, height: 346, fill: '#111a2a' }, shot);
    E('rect', { x: -320, y: 1354, width: 1720, height: 1066, fill: '#0a0f16' }, shot);
    E('path', { d: 'M-320,1470 L1400,1470', stroke: '#1a2432', 'stroke-width': 10, 'stroke-dasharray': '70 46' }, shot);
    E('circle', { cx: 880, cy: 1006, r: 150, fill: 'url(#lampGlow)' }, shot);
    E('rect', { x: 874, y: 1000, width: 11, height: 420, fill: '#0a0f18' }, shot);
    E('circle', { cx: 880, cy: 996, r: 13, fill: '#ffd9a0' }, shot);
    E('path', { d: 'M812,1420 L880,1000 L948,1420 Z', fill: '#ffd9a0', opacity: .05 }, shot);
    const fog2 = fogBand(shot, 860, 1560, 520, 52, .08);
    return { fog1, fog2 };
  };
  // tikungan malam: jalan menekuk ke kanan, semak persembunyian kiri, lampu tikungan
  const bendSet = (shot, seed) => {
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#nSky)' }, shot);
    stars(shot, seed + 3, 30, 600);
    moonAt(shot, 1150, 190, 40);
    E('rect', { x: -320, y: 1180, width: 1720, height: 1240, fill: '#0a0e15' }, shot);
    E('path', { d: 'M-320,2420 L330,1420 L760,1420 L1400,2420 Z', fill: '#0d1220' }, shot);
    E('path', { d: 'M330,1420 L760,1420 L1400,2420 L1180,2420 L700,1500 L420,1500 L-60,2420 L-320,2420 Z', fill: '#11182a', opacity: .7 }, shot);
    // rumah jauh di tikungan
    E('path', { d: 'M-60,1330 L120,1240 L300,1330 Z', fill: '#131c30' }, shot);
    E('rect', { x: -50, y: 1324, width: 340, height: 100, fill: '#16202f' }, shot);
    E('rect', { x: 70, y: 1352, width: 34, height: 44, fill: '#e88a4a', opacity: .55 }, shot);
    // semak besar kiri (tempat bersembunyi) — berlapis, bergoyang angin
    const bush = E('g', {}, shot);
    E('ellipse', { cx: 60, cy: 1330, rx: 240, ry: 130, fill: '#0a140d' }, bush);
    E('ellipse', { cx: 190, cy: 1270, rx: 170, ry: 105, fill: '#0d1a10' }, bush);
    E('ellipse', { cx: -40, cy: 1260, rx: 140, ry: 95, fill: '#0c1710' }, bush);
    [[40, 1220], [130, 1180], [230, 1240], [90, 1300], [180, 1330]].forEach(([cx, cy]) =>
      E('circle', { cx, cy, r: 26, fill: '#12241a', opacity: .8 }, bush));
    // tiang lampu tikungan kanan (kaca menyala) + kerucut cahaya
    const glow = E('circle', { cx: 1006, cy: 700, r: 170, fill: 'url(#lampGlow)' }, shot);
    E('path', { d: 'M946,1420 L1006,700 L1066,1420 Z', fill: '#ffd9a0', opacity: .045 }, shot);
    E('rect', { x: 1000, y: 700, width: 12, height: 720, fill: '#0a0f18' }, shot);
    E('rect', { x: 982, y: 656, width: 48, height: 62, rx: 10, fill: '#39445c', ...st(3.5, '#0a0f18') }, shot);
    const glass = E('rect', { x: 990, y: 666, width: 32, height: 42, rx: 7, fill: '#ffb45e', opacity: .9 }, shot);
    const fog1 = fogBand(shot, 500, 1330, 470, 42, .09);
    const fog2 = fogBand(shot, 900, 1620, 520, 54, .07);
    return { fog1, fog2, bush, glow, glass };
  };
  // depan rumah Lastri malam + jendela besar menyala (dari still klimaks review)
  const houseSet = (shot, seed) => {
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#nSky)' }, shot);
    stars(shot, seed, 22, 420);
    E('path', { d: 'M20,470 L540,300 L1060,470 L1060,520 L20,520 Z', fill: '#0d1524' }, shot);
    E('rect', { x: 20, y: 500, width: 1040, height: 920, fill: '#141c2c' }, shot);
    for (let i = 0; i < 7; i++) E('path', { d: `M${90 + i * 150},506 L${90 + i * 150},1414`, stroke: '#0e1624', 'stroke-width': 6, opacity: .7 }, shot);
    E('rect', { x: 196, y: 640, width: 400, height: 500, fill: '#f7a94e' }, shot);
    E('rect', { x: 216, y: 660, width: 360, height: 460, fill: '#ffca7a' }, shot);
    E('rect', { x: 216, y: 660, width: 360, height: 460, fill: 'none', stroke: '#3a2413', 'stroke-width': 14 }, shot);
    E('path', { d: 'M396,660 L396,1120 M216,890 L576,890', stroke: '#3a2413', 'stroke-width': 10 }, shot);
    E('path', { d: 'M216,660 L262,660 L262,1120 L216,1120 Z M530,660 L576,660 L576,1120 L530,1120 Z', fill: '#7a3b2e', opacity: .85 }, shot);
    E('rect', { x: -320, y: GY, width: 1720, height: 1000, fill: '#0a0f16' }, shot);
    const fog1 = fogBand(shot, 420, 1330, 440, 40, .08);
    return { fog1 };
  };
  // teras rumah warga malam: dinding, bangku, lampu gantung hangat satu titik
  const porchSet = (shot, seed) => {
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: '#0a0f1e' }, shot);
    stars(shot, seed, 14, 300);
    E('rect', { x: -320, y: 260, width: 1720, height: 1160, fill: '#131a29' }, shot);
    for (let i = 0; i < 9; i++) E('path', { d: `M${-240 + i * 190},266 L${-240 + i * 190},1414`, stroke: '#0d1421', 'stroke-width': 7, opacity: .8 }, shot);
    E('path', { d: 'M-320,260 L1400,260 L1400,330 L-320,330 Z', fill: '#0a0f18' }, shot);
    E('rect', { x: 700, y: 560, width: 210, height: 260, fill: '#0d1524', ...st(4, '#060a12') }, shot);
    E('rect', { x: 716, y: 576, width: 80, height: 110, fill: '#ffb45e', opacity: .28 }, shot);
    // bangku panjang
    E('rect', { x: 120, y: 1330, width: 760, height: 34, rx: 8, fill: '#3a2c1c' }, shot);
    E('rect', { x: 150, y: 1364, width: 26, height: 60, fill: '#2c2115' }, shot);
    E('rect', { x: 820, y: 1364, width: 26, height: 60, fill: '#2c2115' }, shot);
    // lampu gantung + cahaya hangat
    E('path', { d: 'M540,330 L540,430', stroke: '#0a0f18', 'stroke-width': 7 }, shot);
    const glow = E('circle', { cx: 540, cy: 500, r: 240, fill: 'url(#lampGlow)' }, shot);
    E('circle', { cx: 540, cy: 486, r: 21, fill: '#ffd9a0' }, shot);
    E('path', { d: 'M508,452 L572,452 L556,486 L524,486 Z', fill: '#232c3e', ...st(3, '#0a0f18') }, shot);
    E('rect', { x: -320, y: GY, width: 1720, height: 1000, fill: '#0a0d13' }, shot);
    const fog1 = fogBand(shot, 900, 1330, 420, 38, .06);
    return { fog1, glow };
  };
  // tikungan MAGRIB (L26) + pagi redup (L27): langit senja, lampu minyak di tiang
  const bendDuskSet = (shot, seed, morning) => {
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#duskSky)' }, shot);
    if (morning) E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: '#5a6c8c', opacity: .45 }, shot);
    E('rect', { x: -320, y: 1180, width: 1720, height: 1240, fill: '#0b0f18' }, shot);
    E('path', { d: 'M-320,2420 L330,1420 L760,1420 L1400,2420 Z', fill: '#0d1220' }, shot);
    E('path', { d: 'M330,1420 L760,1420 L1400,2420 L1180,2420 L700,1500 L420,1500 L-60,2420 L-320,2420 Z', fill: '#11182a', opacity: .7 }, shot);
    E('path', { d: 'M-60,1330 L120,1240 L300,1330 Z', fill: '#131c30' }, shot);
    E('rect', { x: -50, y: 1324, width: 340, height: 100, fill: '#16202f' }, shot);
    E('rect', { x: 70, y: 1352, width: 34, height: 44, fill: '#e88a4a', opacity: .8 }, shot);
    const bush = E('g', {}, shot);
    E('ellipse', { cx: 60, cy: 1330, rx: 240, ry: 130, fill: '#0a120c' }, bush);
    E('ellipse', { cx: 190, cy: 1270, rx: 170, ry: 105, fill: '#0c1710' }, bush);
    // tiang lampu tikungan (kaca di 848,566 — di atas tangan Joko, pola still review)
    E('rect', { x: 842, y: 560, width: 12, height: 860, fill: '#0a0f18' }, shot);
    const glow = E('circle', { cx: 848, cy: 566, r: 120, fill: 'url(#lampGlow)' }, shot);
    E('rect', { x: 824, y: 522, width: 48, height: 62, rx: 10, fill: '#39445c', ...st(3.5, '#0a0f18') }, shot);
    const glass = E('rect', { x: 832, y: 532, width: 32, height: 42, rx: 7, fill: '#ffb45e', opacity: .12 }, shot);
    // tabung minyak di dasar kaca (terlihat di close-up L27: minyaknya PENUH)
    const oil = E('rect', { x: 836, y: 556, width: 24, height: 16, rx: 4, fill: '#ffb45e', opacity: .85 }, shot);
    const fog1 = fogBand(shot, 480, 1360, 430, 40, .07);
    return { fog1, bush, glow, glass, oil };
  };
  // foreground gelap pembingkai (§7 resep: dedaunan di depan kamera)
  const fgDark = (shot, kind = 'leaves') => {
    const g = E('g', {}, shot);
    if (kind === 'leaves') {
      E('path', { d: 'M-320,-320 C-120,-240 -40,-120 -60,60 C-160,-40 -260,-60 -320,-40 Z', fill: '#04070a', opacity: .92 }, g);
      E('path', { d: 'M1400,-320 C1240,-260 1180,-140 1200,20 C1290,-60 1360,-70 1400,-60 Z', fill: '#04070a', opacity: .92 }, g);
      E('path', { d: 'M-320,2420 C-100,2300 100,2360 240,2420 Z M900,2420 C1080,2320 1260,2360 1400,2420 Z', fill: '#04070a', opacity: .9 }, g);
    }
    return g;
  };

  /* ================= PEMBANTU BERSAMA adegan ================= */
  const TL = S.TL;
  const lineT = i => TL.lines[i].t, lineD = i => TL.lines[i].d;
  const shotCam = (g, t, a, b, cx0, cy0, s0, cx1, cy1, s1) => {
    const k = eio(clamp((t - a) / (b - a)));
    const s = lerp(s0, s1, k);
    tr(g, 540 - s * lerp(cx0, cx1, k), 960 - s * lerp(cy0, cy1, k), s);
  };
  const ambFog = (set, t, bx = 420) => {
    if (set.fog1) set.fog1.setAttribute('cx', (bx + Math.sin(t * .1 + 1) * 42).toFixed(1));
    if (set.fog2) set.fog2.setAttribute('cx', (860 + Math.sin(t * .083 + 3) * 48).toFixed(1));
  };
  const makeLids = (shot) => {
    const g = E('g', {}, shot);
    const top = E('rect', { x: -320, y: -320, width: 1720, height: 0, fill: '#000' }, g);
    const bot = E('rect', { x: -320, y: 2420, width: 1720, height: 0, fill: '#000' }, g);
    return { set(k) { const h = k * 1240; top.setAttribute('height', h.toFixed(0)); bot.setAttribute('y', (2420 - h).toFixed(0)); bot.setAttribute('height', h.toFixed(0)); } };
  };
  // kedip penanda vanish: tutup-buka cepat di sekitar waktu tv (detik absolut)
  const blinkK = (t, tv) => {
    const dt = Math.abs(t - tv);
    return dt >= .13 ? 0 : Math.sin((1 - dt / .13) * Math.PI * .5);
  };

  /* ================= ADEGAN ================= */
  // L1 (idx0) JALAN — hook: profil berjalan melintasi jalan sepi; front menunduk mendekat
  {
    const sc = scDefs;
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam);
    const setA = roadSet(A, 11);
    const sdA = SundelSide(A, {});
    roadSet(B, 12);
    const sdB = SundelFront(B, {});
    during('jalan', 'jalane', (t) => {
      const t0 = lineT(0), d = lineD(0), b1 = t0 + d * .45;
      const ph = clamp((t - t0) / d);
      sdA.set({ ph: t * 2.6, wind: .3 });
      tr(sdA.g, lerp(-40, 660, ph), GY, 1.05);
      ambFog(setA, t, 420);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 1040, 1.03, 530, 1032, 1.09);
      sdB.set({ blink: blinkAt(t, 3), face: 'down', headTilt: 2, bob: Math.abs(Math.sin(t * 2.6)) * 6, wind: .5, la: [13 + Math.sin(t * 2.6) * 5, -14], ra: [13 - Math.sin(t * 2.6) * 5, -14] });
      tr(sdB.g, 560, GY, 1.25);
      B.style.display = t >= b1 ? '' : 'none';
      shotCam(B, t, b1, t0 + d, 560, 960, 1.34, 560, 950, 1.5);
    });
  }

  // L2 (idx1) WAJAH — cantik (ECU wajah) lalu punggung: rambut sampai ke lutut
  {
    const sc = scene(world, 'wajah', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    roadSet(A, 21); const sdA = SundelFront(A, {}); tr(sdA.g, 540, GY, 1.5);
    roadSet(B, 22); const sdB = SundelFront(B, {}); tr(sdB.g, 540, GY, 1.5);
    roadSet(C, 23); const sdC = SundelBack(C, {}); tr(sdC.g, 540, GY, 1.5);
    during('wajah', 'wajahe', (t) => {
      const t0 = lineT(1), d = lineD(1), b1 = t0 + d * .36, b2 = t0 + d * .64;
      sdA.set({ blink: blinkAt(t, 4), face: 'neutral' });
      sdB.set({ blink: blinkAt(t, 5), face: 'neutral', headR: Math.sin(t * .5) * 2 });
      sdC.set({ hair: 'A', bob: Math.sin(t * 1.1) * 2 });
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 820, 1.42, 540, 812, 1.52);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 540, 300, 2.3, 540, 298, 2.38);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 540, 900, 1.38, 540, 894, 1.46);
    });
  }

  // L3 (idx2) BELAKANG — tak seorang pun berani di belakangnya: warga hanya menonton dari jauh
  {
    const sc = scene(world, 'belakang', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    roadSet(A, 31);
    const sdA = SundelBack(A, {});
    wargaBack(A, 120, 1830, 1.5, 'peci'); wargaBack(A, 950, 1860, 1.6, 'rambut');
    roadSet(B, 32);
    const sdB = SundelBack(B, {});
    wargaBack(B, 210, 1960, 2.3, 'rambut');
    const setC = roadSet(C, 33);
    during('belakang', 'belakange', (t) => {
      const t0 = lineT(2), d = lineD(2), b1 = t0 + d * .42, b2 = t0 + d * .72;
      const x = 540 + (t - t0) * 92;   // posisi dunia kontinu antar sub-shot
      sdA.set({ hair: 'A', bob: Math.abs(Math.sin(t * 2.4)) * 5 });
      tr(sdA.g, x, GY, .8);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 1030, 1.03, 545, 1024, 1.09);
      sdB.set({ hair: 'A', bob: Math.abs(Math.sin(t * 2.4)) * 5 });
      tr(sdB.g, x, GY, .8);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 580, 1010, 1.48, 585, 1004, 1.56);
      ambFog(setC, t, 420);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 540, 1040, 1.08, 540, 1036, 1.13);
    });
  }

  // L4 (idx3) TEORI — Pak Karto bercerita di teras: sundel bolong, malu pada lubangnya
  {
    const sc = scene(world, 'teori', 'cut');
    const mk = (seed) => {
      const g = E('g', {}, sc.cam), set = porchSet(g, seed);
      const karto = Karto(g, {}), joko = Joko(g, {}), lastri = Lastri(g, {});
      tr(karto.g, 360, GY, .95); tr(joko.g, 690, GY, .9); tr(lastri.g, 945, GY, .86);
      return { g, set, karto, joko, lastri };
    };
    const A = mk(41), B = mk(42), C = mk(43);
    during('teori', 'teorie', (t) => {
      const t0 = lineT(3), d = lineD(3), b1 = t0 + d * .4, b2 = t0 + d * .72;
      const talk = .45 + .55 * Math.abs(Math.sin(t * 6.9));
      const up = bump((t - t0) / d, .08, .32) - bump((t - t0) / d, .6, .9);
      [A, B, C].forEach((S2, i) => {
        S2.karto.set({ la: [20 + up * 10, -22], ra: [22 + up * 44, -24 - up * 48], talk, blink: blinkAt(t, 2), headR: Math.sin(t * .6) * 2 });
        S2.joko.set({ blink: blinkAt(t, 8), mood: i === 2 ? 'flat' : 'grin', headR: -5, la: [17, -16], ra: [17, -16] });
        S2.lastri.set({ blink: blinkAt(t, 5), fear: i === 2 ? .4 : .18, headR: 4 });
        ambFog(S2.set, t, 900);
      });
      A.g.style.display = t < b1 ? '' : 'none';
      shotCam(A.g, t, t0, b1, 560, 1050, 1.12, 550, 1042, 1.18);
      B.g.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B.g, t, b1, b2, 360, 862, 1.6, 360, 858, 1.68);
      C.g.style.display = t >= b2 ? '' : 'none';
      shotCam(C.g, t, b2, t0 + d, 820, 905, 1.5, 820, 900, 1.58);
    });
  }

  // L5 (idx4) DEKAT — langkahnya makin dekat: profil berjalan, kamera makin rapat (posisi dunia kontinu)
  {
    const sc = scene(world, 'dekat', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    roadSet(A, 51); const sdA = SundelSide(A, {});
    roadSet(B, 52); const sdB = SundelSide(B, {});
    roadSet(C, 53); const sdC = SundelSide(C, {});
    during('dekat', 'dekate', (t) => {
      const t0 = lineT(4), d = lineD(4), b1 = t0 + d * .36, b2 = t0 + d * .68;
      const x = 60 + (t - t0) * 118;
      [sdA, sdB, sdC].forEach(sd => { sd.set({ ph: t * 2.6, wind: .35 }); tr(sd.g, x, GY, 1.0); });
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, x, 1010, 1.06, x + 30, 1006, 1.1);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, x, 1000, 1.36, x + 30, 996, 1.42);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, x, 990, 1.68, x + 26, 986, 1.76);
    });
  }

  // L6 (idx5) TANGIS — lewat rumah Lastri: tangis bayi samar; Lastri di jendela menoleh
  {
    const sc = scene(world, 'tangis', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    houseSet(A, 61); const sdA = SundelSide(A, {});
    houseSet(B, 62); const lasB = Lastri(B, {}); tr(lasB.g, 428, 1150, .58);
    const setC = houseSet(C, 63); const sdC = SundelSide(C, {});
    during('tangis', 'tangise', (t) => {
      const t0 = lineT(5), d = lineD(5), b1 = t0 + d * .38, b2 = t0 + d * .7;
      const x = 40 + (t - t0) * 82;
      sdA.set({ ph: t * 2.3, wind: .3 }); tr(sdA.g, x, GY, 1.0);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 500, 1000, 1.14, 510, 996, 1.21);
      const turn = bump((t - b1) / (d * .32), .25, .8);
      lasB.set({ blink: blinkAt(t, 6), fear: .3 + turn * .3, headR: -4 - turn * 7 });
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 400, 890, 2.28, 400, 887, 2.36);
      sdC.set({ ph: t * 2.3, wind: .3 }); tr(sdC.g, x, GY, 1.0);
      ambFog(setC, t, 420);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 540, 1020, 1.05, 540, 1017, 1.1);
    });
  }

  // L7 (idx6) TANYA — warga bertanya-tanya: menjaga, atau mengincar bayi?
  {
    const sc = scene(world, 'tanya', 'cut');
    const mk = (seed) => {
      const g = E('g', {}, sc.cam), set = porchSet(g, seed);
      const karto = Karto(g, {}), joko = Joko(g, {}), lastri = Lastri(g, {});
      tr(karto.g, 380, GY, .95); tr(joko.g, 700, GY, .9); tr(lastri.g, 950, GY, .86);
      return { g, set, karto, joko, lastri };
    };
    const A = mk(71), B = mk(72), C = mk(73);
    during('tanya', 'tanyae', (t) => {
      const t0 = lineT(6), d = lineD(6), b1 = t0 + d * .42, b2 = t0 + d * .72;
      const talk = .45 + .55 * Math.abs(Math.sin(t * 7.3));
      const shrug = bump((t - t0) / d, .1, .35) - bump((t - t0) / d, .55, .85);
      [A, B, C].forEach((S2, i) => {
        S2.karto.set({ la: [24 + shrug * 26, -30 - shrug * 26], ra: [24 + shrug * 26, -30 - shrug * 26], talk, blink: blinkAt(t, 3), headR: i === 1 ? 6 : 0 });
        S2.joko.set({ blink: blinkAt(t, 7), mood: 'grin', la: [64, -8], ra: [64, -8], headR: -4 });
        S2.lastri.set({ blink: blinkAt(t, 5), fear: i === 2 ? .6 : .3, headR: i === 2 ? -7 : 3, ra: [30, -38] });
        ambFog(S2.set, t, 900);
      });
      A.g.style.display = t < b1 ? '' : 'none';
      shotCam(A.g, t, t0, b1, 570, 1050, 1.12, 560, 1044, 1.18);
      B.g.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B.g, t, b1, b2, 380, 862, 1.6, 380, 858, 1.67);
      C.g.style.display = t >= b2 ? '' : 'none';
      shotCam(C.g, t, b2, t0 + d, 950, 905, 1.54, 950, 901, 1.61);
    });
  }

  // L8 (idx7) TAWA — Joko tertawa; warga kesal-khawatir; tawanya memudar jadi tekad
  {
    const sc = scene(world, 'tawa', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    porchSet(A, 81); const jokA = Joko(A, {}); tr(jokA.g, 540, GY, 1.0);
    porchSet(B, 82);
    const karB = Karto(B, {}), lasB = Lastri(B, {}), jokB = Joko(B, {});
    tr(karB.g, 400, GY, .92); tr(lasB.g, 660, GY, .88); tr(jokB.g, 920, GY, .85);
    porchSet(C, 83); const jokC = Joko(C, {}); tr(jokC.g, 540, GY, 1.0);
    during('tawa', 'tawae', (t) => {
      const t0 = lineT(7), d = lineD(7), b1 = t0 + d * .4, b2 = t0 + d * .72;
      const laugh = .5 + .5 * Math.abs(Math.sin(t * 8.6));
      jokA.set({ blink: blinkAt(t, 4), mood: 'grin', talk: laugh * .9, headR: -4 + Math.sin(t * 8.6) * 1.6, la: [30, -26], ra: [30, -26] });
      jokA.g.setAttribute('transform', `translate(540 ${GY + Math.abs(Math.sin(t * 8.6)) * 3}) scale(1)`);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 950, 1.4, 540, 944, 1.48);
      karB.set({ blink: blinkAt(t, 2), fear: .3, headR: 8, la: [16, -16], ra: [16, -16] });
      lasB.set({ blink: blinkAt(t, 6), fear: .5, headR: 6 });
      jokB.set({ blink: blinkAt(t, 9), mood: 'grin', talk: laugh * .6, la: [28, -24], ra: [28, -24] });
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 620, 1000, 1.24, 620, 996, 1.3);
      const fade = bump((t - b2) / (d * .28), .3, .9);
      jokC.set({ blink: blinkAt(t, 4), mood: fade > .5 ? 'flat' : 'grin', talk: (1 - fade) * laugh * .5, headR: -2 + fade * 2, la: [24, -22], ra: [24, -22] });
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 540, 762, 2.28, 540, 760, 2.36);
    });
  }

  // L9 (idx8) SUMPAH — Joko bersumpah: telapak terbuka terangkat (BUKAN menunjuk); menatap jalan
  {
    const sc = scene(world, 'sumpah', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam);
    porchSet(A, 91); const jokA = Joko(A, {}); tr(jokA.g, 540, GY, 1.0);
    roadSet(B, 92); const jokB = Joko(B, {}); tr(jokB.g, 400, GY, 1.0);
    during('sumpah', 'sumpahe', (t) => {
      const t0 = lineT(8), d = lineD(8), b1 = t0 + d * .52;
      const up = bump((t - t0) / d, .12, .45) - bump((t - t0) / d, .8, .98);
      jokA.set({ blink: blinkAt(t, 3), mood: 'flat', ra: [20 + up * 128, -20 - up * 44], la: [18, -18], headR: up * -3 });
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 905, 1.54, 540, 900, 1.62);
      jokB.set({ blink: blinkAt(t, 5), mood: 'flat', headR: 11, la: [16, -16], ra: [16, -16], legL: walkLeg(t * 1.4)[0] * .2, legR: walkLeg(t * 1.4 + Math.PI)[0] * .2 });
      B.style.display = t >= b1 ? '' : 'none';
      shotCam(B, t, b1, t0 + d, 520, 1000, 1.18, 530, 996, 1.24);
    });
  }

  // L10 (idx9) SEMBUNYI — Joko masuk fisik, merunduk di balik semak tikungan; POV jalan kosong
  {
    const sc = scene(world, 'sembunyi', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    bendSet(A, 101); const jokA = Joko(A, {});
    const fgA = E('g', {}, A);
    E('ellipse', { cx: 330, cy: 1560, rx: 250, ry: 150, fill: '#081009' }, fgA);
    E('ellipse', { cx: 200, cy: 1480, rx: 170, ry: 110, fill: '#0a140c' }, fgA);
    bendSet(B, 102); const jokB = Joko(B, {}); tr(jokB.g, 330, GY + 118, 1.0);
    const fgB = E('g', {}, B);
    E('ellipse', { cx: 330, cy: 1590, rx: 260, ry: 150, fill: '#081009' }, fgB);
    E('ellipse', { cx: 470, cy: 1500, rx: 150, ry: 100, fill: '#0a140c' }, fgB);
    const setC = bendSet(C, 103);
    during('sembunyi', 'sembunyie', (t) => {
      const t0 = lineT(9), d = lineD(9), b1 = t0 + d * .42, b2 = t0 + d * .72;
      const walk = clamp((t - t0) / (d * .3));
      const duck = bump((t - t0) / (d * .42), .55, .95);
      const wl = walkLeg(t * 6.2);
      jokA.set({ blink: blinkAt(t, 4), mood: 'flat', fear: .2, legL: walk < 1 ? wl : [0, 4], legR: walk < 1 ? walkLeg(t * 6.2 + Math.PI) : [0, 4], la: [22 + Math.sin(t * 6.2) * 10, -20], ra: [22 - Math.sin(t * 6.2) * 10, -20] });
      tr(jokA.g, lerp(40, 330, walk), GY + duck * 118, 1.0);
      fgA.setAttribute('transform', `rotate(${(Math.sin(t * .9) * 1.4).toFixed(2)} 300 1500)`);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 1020, 1.08, 535, 1016, 1.13);
      jokB.set({ blink: blinkAt(t, 6), mood: 'flat', fear: .35, headR: Math.sin(t * .8) * 6, la: [14, -12], ra: [14, -12] });
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 330, 830, 2.28, 330, 828, 2.36);
      setC.bush.setAttribute('transform', `rotate(${(Math.sin(t * .9 + 2) * 1.2).toFixed(2)} 120 1300)`);
      setC.glass.setAttribute('opacity', (.82 + .18 * Math.sin(t * 7.3) * Math.sin(t * 3.1)).toFixed(3));
      ambFog(setC, t, 500);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 620, 1000, 1.14, 620, 996, 1.27);
    });
  }

  // L11 (idx10) DATANG — tengah malam ia datang: gaun berkibar angin, dari jauh lalu rapat
  {
    const sc = scene(world, 'datang', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    const setA = bendSet(A, 111); const sdA = SundelSide(A, {});
    const jokA = Joko(A, {}); tr(jokA.g, 330, GY + 118, 1.0);
    E('ellipse', { cx: 330, cy: 1590, rx: 260, ry: 150, fill: '#081009' }, A);
    bendSet(B, 112); const sdB = SundelFront(B, {});
    bendSet(C, 113); const sdC = SundelSide(C, {});
    during('datang', 'datange', (t) => {
      const t0 = lineT(10), d = lineD(10), b1 = t0 + d * .4, b2 = t0 + d * .72;
      const x = 1180 - (t - t0) * 62;
      sdA.set({ ph: t * 2.6, wind: .8 }); tr(sdA.g, x, GY, .82);
      jokA.set({ blink: blinkAt(t, 6), mood: 'flat', fear: .5, headR: 5, la: [14, -12], ra: [14, -12] });
      ambFog(setA, t, 500);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 1020, 1.06, 545, 1017, 1.11);
      sdB.set({ blink: blinkAt(t, 3), face: 'down', headTilt: 2, bob: Math.abs(Math.sin(t * 2.6)) * 6, wind: .9, la: [13 + Math.sin(t * 2.6) * 5, -14], ra: [13 - Math.sin(t * 2.6) * 5, -14] });
      tr(sdB.g, 560, GY, 1.3);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 560, 970, 1.38, 560, 962, 1.54);
      sdC.set({ ph: t * 2.6, wind: .95 }); tr(sdC.g, x, GY, 1.55);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, x - 30, 1300, 2.26, x - 22, 1296, 2.34);
    });
  }

  // L12 (idx11) RAMBUT — tapi rambutnya diam, seolah terpahat: kontras kibar gaun vs kaku rambut
  {
    const sc = scene(world, 'rambut', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    bendSet(A, 121); const sdA = SundelBack(A, {}); tr(sdA.g, 540, GY, 1.5);
    bendSet(B, 122); const sdB = SundelFront(B, {}); tr(sdB.g, 540, GY, 1.5);
    bendSet(C, 123); const sdC = SundelSide(C, {}); tr(sdC.g, 480, GY, 1.35);
    during('rambut', 'rambute', (t) => {
      const t0 = lineT(11), d = lineD(11), b1 = t0 + d * .42, b2 = t0 + d * .72;
      sdA.set({ hair: 'A', hole: 'dark' });   // rambut: NOL gerak — hanya kabut yang lewat
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 700, 2.3, 540, 698, 2.37);
      sdB.set({ blink: blinkAt(t, 4), face: 'down', headTilt: 3, wind: .95, la: [13, -14], ra: [13, -14] });
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 540, 880, 1.52, 540, 874, 1.6);
      sdC.set({ ph: 2.2, wind: .95 });   // pose langkah membeku: hem berkibar, rambut kaku
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 500, 1000, 1.22, 500, 997, 1.29);
    });
  }

  // L13 (idx12) BERHENTI — ia berhenti, tidak berbelok, hanya menunggu (hening terdesain + push-in lambat)
  {
    const sc = scene(world, 'berhenti', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam);
    const setA = bendSet(A, 131); const sdA = SundelSide(A, {});
    const jokA = Joko(A, {}); tr(jokA.g, 330, GY + 118, 1.0);
    E('ellipse', { cx: 330, cy: 1590, rx: 260, ry: 150, fill: '#081009' }, A);
    const setB = bendSet(B, 132); const sdB = SundelFront(B, {}); tr(sdB.g, 580, GY, 1.35);
    during('berhenti', 'berhentie', (t) => {
      const t0 = lineT(12), d = lineD(12), b1 = t0 + d * .5;
      const stopK = bump((t - t0) / d, .18, .3);
      const ph = t * 2.6 * (1 - stopK) + stopK * Math.floor(t * 2.6 / (Math.PI * 2)) * Math.PI * 2 + stopK * 2.2;
      sdA.set({ ph: ph, wind: .8 - stopK * .65 }); tr(sdA.g, lerp(760, 700, stopK), GY, 1.1);
      jokA.set({ blink: blinkAt(t, 7), mood: 'flat', fear: .55, headR: 5, la: [14, -12], ra: [14, -12] });
      setA.glass.setAttribute('opacity', (.8 + .2 * Math.sin(t * 6.1) * Math.sin(t * 2.7)).toFixed(3));
      ambFog(setA, t, 500);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 560, 1000, 1.12, 565, 994, 1.3);
      sdB.set({ blink: blinkAt(t, 9), face: 'down', headTilt: 3, bob: 0, wind: .12, la: [13, -14], ra: [13, -14] });
      setB.glass.setAttribute('opacity', (.8 + .2 * Math.sin(t * 6.1) * Math.sin(t * 2.7)).toFixed(3));
      ambFog(setB, t, 500);
      B.style.display = t >= b1 ? '' : 'none';
      shotCam(B, t, b1, t0 + d, 580, 950, 1.44, 580, 944, 1.6);
    });
  }

  // L14 (idx13) KELUAR — Joko melangkah keluar, lurus ke belakangnya
  {
    const sc = scene(world, 'keluar', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    bendSet(A, 141);
    const sdA = SundelBack(A, {}); tr(sdA.g, 770, GY, 1.08);
    const jokA = Joko(A, {});
    bendSet(B, 142);
    const sdB = SundelBack(B, {}); tr(sdB.g, 700, GY, 1.15);
    wargaBack(B, 180, 1980, 2.4, 'rambut');
    const jokB = Joko(B, {});
    bendSet(C, 143); const jokC = Joko(C, {}); tr(jokC.g, 540, GY, 1.0);
    during('keluar', 'keluare', (t) => {
      const t0 = lineT(13), d = lineD(13), b1 = t0 + d * .42, b2 = t0 + d * .74;
      const rise = bump((t - t0) / d, .02, .2);
      const x = 330 + clamp((t - t0) / d) * 300;
      const wl = walkLeg(t * 5.6);
      sdA.set({ hair: 'A' });
      jokA.set({ blink: blinkAt(t, 4), mood: 'flat', fear: .5, legL: wl, legR: walkLeg(t * 5.6 + Math.PI), la: [20 + Math.sin(t * 5.6) * 9, -19], ra: [20 - Math.sin(t * 5.6) * 9, -19] });
      tr(jokA.g, x, GY + (1 - rise) * 118, 1.0);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 560, 1010, 1.1, 565, 1006, 1.15);
      sdB.set({ hair: 'A' });
      jokB.set({ blink: blinkAt(t, 5), mood: 'flat', fear: .55, legL: wl, legR: walkLeg(t * 5.6 + Math.PI), la: [20 + Math.sin(t * 5.6) * 9, -19], ra: [20 - Math.sin(t * 5.6) * 9, -19] });
      tr(jokB.g, x + 60, GY, .92);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 620, 1000, 1.46, 625, 996, 1.54);
      jokC.set({ blink: blinkAt(t, 6), mood: 'flat', fear: .68, shock: .25, headR: Math.sin(t * 1.3) * 1.5, la: [16, -16], ra: [16, -16] });
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 540, 766, 2.3, 540, 764, 2.37);
    });
  }

  // L15 (idx14) SIBAK — tangan Joko mengangkat rambutnya perlahan (kontak tangan-rambut wajib terlihat)
  {
    const sc = scene(world, 'sibak', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam);
    bendSet(A, 151);
    const sdA = SundelBack(A, {}); tr(sdA.g, 610, GY, 1.2);
    const jokA = Joko(A, {}); tr(jokA.g, 330, GY, .98);
    bendSet(B, 152);
    const sdB = SundelBack(B, {}); tr(sdB.g, 560, GY, 1.5);
    const jokB = Joko(B, {}); tr(jokB.g, 218, GY, 1.05);
    during('sibak', 'sibake', (t) => {
      const t0 = lineT(14), d = lineD(14), b1 = t0 + d * .44;
      const reach = bump((t - t0) / d, .1, .75);
      sdA.set({ hair: 'A' });
      jokA.set({ blink: blinkAt(t, 5), mood: 'flat', fear: .6, ra: [20 + reach * 102, -20 - reach * 76], la: [16, -16], headR: 4 });
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 950, 1.34, 540, 946, 1.44);
      sdB.set({ hair: 'A' });
      jokB.set({ blink: blinkAt(t, 6), mood: 'flat', fear: .66, shock: .2, ra: [20 + reach * 102, -20 - reach * 76], la: [16, -16], headR: 4 });
      B.style.display = t >= b1 ? '' : 'none';
      shotCam(B, t, b1, t0 + d, 545, 700, 2.3, 545, 697, 2.37);
    });
  }

  // L16 (idx15) TEMBUS — rambut tidak bergerak sama sekali: tangan Joko menembus kekosongan
  {
    const sc = scene(world, 'tembus', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    bendSet(A, 161);
    const sdA = SundelBack(A, {}); tr(sdA.g, 560, GY, 1.5);
    const jokA = Joko(A, {}); tr(jokA.g, 218, GY, 1.05);
    const mistA = E('ellipse', { cx: 430, cy: 500, rx: 90, ry: 150, fill: '#aebfd6', opacity: 0 }, A);
    bendSet(B, 162); const jokB = Joko(B, {}); tr(jokB.g, 540, GY, 1.0);
    const setC = bendSet(C, 163);
    const sdC = SundelBack(C, {}); tr(sdC.g, 700, GY, 1.1);
    const jokC = Joko(C, {}); tr(jokC.g, 400, GY, .95);
    during('tembus', 'tembuse', (t) => {
      const t0 = lineT(15), d = lineD(15), b1 = t0 + d * .44, b2 = t0 + d * .72;
      const thru = bump((t - t0) / d, .06, .34);
      const tremble = Math.sin(t * 9.3) * 1.6 * thru;
      sdA.set({ hair: 'A' });   // rambut TETAP tidak bergerak
      jokA.set({ blink: blinkAt(t, 5), mood: 'flat', fear: .7, shock: thru * .5, ra: [122 + tremble, -96], la: [16, -16], headR: 4 });
      tr(jokA.g, 218 + thru * 30, GY, 1.05);
      mistA.setAttribute('opacity', (thru * .16).toFixed(3));
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 545, 700, 2.3, 545, 697, 2.37);
      jokB.set({ blink: 0, mood: 'flat', fear: .85, shock: 1, headR: -2, la: [18, -18], ra: [18, -18] });
      tr(jokB.g, 540 - thru * 10, GY, 1.0);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 540, 762, 2.32, 540, 760, 2.39);
      sdC.set({ hair: 'A' });
      jokC.set({ blink: 0, mood: 'flat', fear: .8, shock: .9, ra: [122, -96], la: [16, -16], headR: 4 });
      ambFog(setC, t, 500);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 560, 1000, 1.14, 560, 998, 1.19);
    });
  }

  // L17 (idx16) BISIK — setengah menoleh, berbisik (ECU kepala + teror Joko; near-silence dari skor)
  {
    const sc = scene(world, 'bisik', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam);
    bendSet(A, 171); const sdA = SundelFront(A, {}); tr(sdA.g, 540, GY, 1.5);
    bendSet(B, 172); const jokB = Joko(B, {}); tr(jokB.g, 540, GY, 1.0);
    during('bisik', 'bisike', (t) => {
      const t0 = lineT(16), d = lineD(16), b1 = t0 + d * .55;
      const turn = bump((t - t0) / d, .02, .3);
      sdA.set({ blink: blinkAt(t, 11), face: 'down', headR: -4 - turn * 12, headTilt: 3, la: [13, -14], ra: [13, -14] });
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 520, 322, 2.34, 518, 320, 2.4);
      jokB.set({ blink: 0, mood: 'flat', fear: 1, shock: 1, headR: -3, la: [20, -20], ra: [20, -20] });
      B.style.display = t >= b1 ? '' : 'none';
      shotCam(B, t, b1, t0 + d, 540, 762, 2.3, 540, 761, 2.34);
    });
  }

  // L18 (idx17) LARI — Joko berbalik dan lari; ia tetap berdiri; tikungan kosong
  {
    const sc = scene(world, 'lari', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    bendSet(A, 181);
    const sdA = SundelBack(A, {}); tr(sdA.g, 330, GY, 1.0);
    const jokA = Joko(A, {});
    const setB = bendSet(B, 182);
    const sdB = SundelBack(B, {}); tr(sdB.g, 660, GY, 1.15);
    const setC = bendSet(C, 183);
    const sdC = SundelSide(C, {});
    const fogC = E('ellipse', { cx: 900, cy: 1150, rx: 420, ry: 330, fill: '#8fa3bd', opacity: .3 }, C);
    during('lari', 'larie', (t) => {
      const t0 = lineT(17), d = lineD(17), b1 = t0 + d * .45, b2 = t0 + d * .74;
      const x = 560 + (t - t0) * 320;
      sdA.set({ hair: 'A' });
      jokA.set({ blink: blinkAt(t, 3), mood: 'flat', fear: .9, shock: .6, legL: walkLeg(t * 10.5, 26), legR: walkLeg(t * 10.5 + Math.PI, 26), la: [40 + Math.sin(t * 10.5) * 22, -26], ra: [40 - Math.sin(t * 10.5) * 22, -26], headR: 3 });
      tr(jokA.g, x, GY, .98);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 1010, 1.08, 545, 1007, 1.13);
      sdB.set({ hair: 'A', bob: 0 });
      setB.glass.setAttribute('opacity', (.78 + .22 * Math.sin(t * 6.7) * Math.sin(t * 3.3)).toFixed(3));
      ambFog(setB, t, 500);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 640, 950, 1.3, 645, 946, 1.44);
      sdC.set({ ph: t * 2.2, wind: .25 }); tr(sdC.g, 830 + (t - b2) * 30, GY, .6);
      fogC.setAttribute('opacity', (.3 + clamp((t - b2) / (d * .26)) * .35).toFixed(3));
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 600, 1020, 1.05, 600, 1019, 1.09);
    });
  }

  // L19 (idx18) PECAH — tiga malam kemudian: tangis pecah; Lastri terlonjak; warga berdatangan
  {
    const sc = scene(world, 'pecah', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    houseSet(A, 191);
    const darkA = E('rect', { x: -320, y: -320, width: 1720, height: 2740, fill: '#04070f', opacity: .22 }, A);
    houseSet(B, 192); const lasB = Lastri(B, {}); tr(lasB.g, 428, 1150, .58);
    houseSet(C, 193);
    const karC = Karto(C, {}), jokC = Joko(C, {});
    during('pecah', 'pecahe', (t) => {
      const t0 = lineT(18), d = lineD(18), b1 = t0 + d * .3, b2 = t0 + d * .62;
      darkA.setAttribute('opacity', (.22 - bump((t - t0) / d, .1, .28) * .1).toFixed(3));
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 1000, 1.1, 540, 998, 1.14);
      const jolt = bump((t - b1) / (d * .32), .04, .18) - bump((t - b1) / (d * .32), .5, .95);
      lasB.set({ blink: blinkAt(t, 4), fear: .55 + jolt * .35, headR: -3 - jolt * 4, ra: [38, -44] });
      lasB.g.setAttribute('transform', `translate(428 ${1150 - jolt * 10}) scale(.58)`);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 400, 890, 2.3, 400, 887, 2.37);
      const run = clamp((t - b2) / (d * .38));
      karC.set({ blink: blinkAt(t, 3), fear: .5, legL: walkLeg(t * 9.5, 22), legR: walkLeg(t * 9.5 + Math.PI, 22), la: [30 + Math.sin(t * 9.5) * 16, -22], ra: [30 - Math.sin(t * 9.5) * 16, -22] });
      jokC.set({ blink: blinkAt(t, 5), mood: 'flat', fear: .7, legL: walkLeg(t * 9.5 + 1, 22), legR: walkLeg(t * 9.5 + 1 + Math.PI, 22), la: [30 - Math.sin(t * 9.5) * 16, -22], ra: [30 + Math.sin(t * 9.5) * 16, -22] });
      tr(karC.g, lerp(1180, 830, run), GY, .95); tr(jokC.g, lerp(1260, 940, run), GY, .92);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 560, 1020, 1.12, 560, 1018, 1.17);
    });
  }

  // L20 (idx19) WARGA — warga membeku: ia berdiri di jendela, membelakangi mereka (push-in lambat)
  {
    const sc = scene(world, 'warga', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam);
    houseSet(A, 201);
    const karA = Karto(A, {}), jokA = Joko(A, {});
    wargaBack(A, 150, 1760, 1.35, 'peci');
    houseSet(B, 202);
    const lasB = Lastri(B, {}); tr(lasB.g, 428, 1150, .58);
    const sdB = SundelBack(B, {}); tr(sdB.g, 672, GY, 1.5);
    wargaBack(B, 90, 1800, 1.5, 'rambut'); wargaBack(B, 400, 1880, 1.6, 'peci'); wargaBack(B, 880, 1820, 1.45, 'kerudung');
    during('warga', 'wargae', (t) => {
      const t0 = lineT(19), d = lineD(19), b1 = t0 + d * .38;
      const run = clamp((t - t0) / (d * .3));
      const frz = 1 - bump((t - t0) / d, .26, .36);
      karA.set({ blink: blinkAt(t, 3), fear: .4 + (1 - frz) * .4, shock: (1 - frz) * .5, legL: walkLeg(t * 9.5, 22 * frz), legR: walkLeg(t * 9.5 + Math.PI, 22 * frz), la: [24, -20], ra: [24, -20] });
      jokA.set({ blink: blinkAt(t, 5), mood: 'flat', fear: .6 + (1 - frz) * .3, shock: (1 - frz) * .5, legL: walkLeg(t * 9.5 + 1, 22 * frz), legR: walkLeg(t * 9.5 + 1 + Math.PI, 22 * frz), la: [24, -20], ra: [24, -20] });
      tr(karA.g, lerp(1150, 880, run), GY, .95); tr(jokA.g, lerp(1230, 990, run), GY, .92);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 560, 1020, 1.12, 560, 1018, 1.19);
      lasB.set({ blink: blinkAt(t, 4), fear: .8, headR: -4 });
      sdB.set({ hair: 'A', hole: 'lamp', bob: Math.sin(t * 1.05) * 1.5 });
      B.style.display = t >= b1 ? '' : 'none';
      shotCam(B, t, b1, t0 + d, 560, 980, 1.24, 566, 972, 1.38);
    });
  }

  // L21 (idx20) ULUR — kedua tangannya terulur ke bayi; rambut tersibak ke samping
  {
    const sc = scene(world, 'ulur', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    houseSet(A, 211);
    const lasA = Lastri(A, {}); tr(lasA.g, 428, 1150, .58);
    const sdA = SundelBack(A, {}); tr(sdA.g, 672, GY, 1.5);
    houseSet(B, 212); const lasB = Lastri(B, {}); tr(lasB.g, 428, 1150, .58);
    houseSet(C, 213);
    const lasC = Lastri(C, {}); tr(lasC.g, 428, 1150, .58);
    const sdC = SundelBack(C, {}); tr(sdC.g, 672, GY, 1.5);
    during('ulur', 'ulure', (t) => {
      const t0 = lineT(20), d = lineD(20), b1 = t0 + d * .4, b2 = t0 + d * .7;
      const reach = bump((t - t0) / d, .05, .5);
      const aside = bump((t - t0) / d, .5, .62);
      lasA.set({ blink: blinkAt(t, 4), fear: .8, headR: -4 });
      sdA.set({ hair: aside > .5 ? 'B' : 'A', hole: 'lamp', la: [13 + reach * 142, -14 - reach * 21], ra: [13 + reach * 142, -14 - reach * 21] });
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 620, 900, 1.5, 624, 894, 1.62);
      lasB.set({ blink: 0, fear: 1, headR: Math.sin(t * 22) * 1.6 - 2, ra: [44, -50] });
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 400, 890, 2.3, 400, 888, 2.37);
      lasC.set({ blink: blinkAt(t, 5), fear: .95, headR: -3 });
      sdC.set({ hair: 'B', hole: 'lamp', la: [155, -35], ra: [155, -35] });
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 672, 640, 2.3, 672, 636, 2.38);
    });
  }

  // L22 (idx21) LUBANG — PUNCAK: lubang di tengah punggungnya (ECU push-in, sting di awal baris)
  {
    const sc = scene(world, 'lubang', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam);
    houseSet(A, 221);
    const lasA = Lastri(A, {}); tr(lasA.g, 428, 1150, .58);
    const sdA = SundelBack(A, {}); tr(sdA.g, 672, GY, 1.5);
    const w1 = wargaBack(A, 130, 1830, 1.5, 'rambut'), w2 = wargaBack(A, 940, 1850, 1.55, 'peci');
    houseSet(B, 222);
    const lasB = Lastri(B, {}); tr(lasB.g, 428, 1150, .58);
    const sdB = SundelBack(B, {}); tr(sdB.g, 672, GY, 1.5);
    wargaBack(B, 90, 1800, 1.5, 'rambut'); wargaBack(B, 400, 1880, 1.6, 'peci'); wargaBack(B, 880, 1820, 1.45, 'kerudung');
    during('lubang', 'lubange', (t) => {
      const t0 = lineT(21), d = lineD(21), b1 = t0 + d * .6;
      const fl = bump((t - t0) / d, .0, .05) - bump((t - t0) / d, .12, .3);
      lasA.set({ blink: blinkAt(t, 5), fear: 1, headR: -3 });
      sdA.set({ hair: 'B', hole: 'lamp', la: [155, -35], ra: [155, -35], bob: Math.sin(t * 1.05) * 1.5 });
      w1.setAttribute('transform', `translate(130 ${1830 + fl * 9}) scale(1.5)`);
      w2.setAttribute('transform', `translate(940 ${1850 + fl * 9}) scale(1.55)`);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 672, 600, 2.3, 672, 596, 2.4);
      lasB.set({ blink: blinkAt(t, 4), fear: 1, headR: -3 });
      sdB.set({ hair: 'B', hole: 'lamp', la: [155, -35], ra: [155, -35], bob: Math.sin(t * 1.05) * 1.5 });
      B.style.display = t >= b1 ? '' : 'none';
      shotCam(B, t, b1, t0 + d, 600, 900, 1.58, 604, 896, 1.66);
    });
  }

  // L23 (idx22) LENYAP — semua mata melihat; ia mencengkeram rambutnya sendiri, lalu lenyap (kedip penanda)
  {
    const sc = scene(world, 'lenyap', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    houseSet(A, 231);
    const karA = Karto(A, {}), jokA = Joko(A, {});
    tr(karA.g, 340, GY, 1.0); tr(jokA.g, 720, GY, 1.0);
    houseSet(B, 232);
    const sdB = SundelBack(B, {}); tr(sdB.g, 672, GY, 1.5);
    const lasB = Lastri(B, {}); tr(lasB.g, 428, 1150, .58);
    const setC = houseSet(C, 233);
    const lasC = Lastri(C, {}); tr(lasC.g, 428, 1150, .58);
    wargaBack(C, 90, 1800, 1.5, 'rambut'); wargaBack(C, 400, 1880, 1.6, 'peci'); wargaBack(C, 880, 1820, 1.45, 'kerudung');
    const lids = makeLids(sc.svg);
    const tvOf = () => lineT(22) + lineD(22) * .86;
    during('lenyap', 'lenyape', (t) => {
      const t0 = lineT(22), d = lineD(22), b1 = t0 + d * .34, b2 = t0 + d * .68, tv = tvOf();
      karA.set({ blink: 0, fear: .8, shock: .9, headR: 3, la: [18, -18], ra: [18, -18] });
      jokA.set({ blink: 0, mood: 'flat', fear: .9, shock: 1, headR: -3, la: [18, -18], ra: [18, -18] });
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 530, 800, 1.88, 530, 798, 1.95);
      sdB.set({ hair: 'C', hole: 'lamp', la: [30, -30], ra: [30, -30], headR: Math.sin(t * 38) * 1.3, bob: Math.sin(t * 38) * 1.2 });
      lasB.set({ blink: 0, fear: 1, headR: -3 });
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 672, 800, 1.88, 672, 797, 1.98);
      lasC.set({ blink: blinkAt(t, 4), fear: .7, headR: -3 });
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 560, 980, 1.24, 564, 976, 1.32);
      lids.set(blinkK(t, tv));   // kedip penanda lenyap — di atas semua grup adegan ini
    });
  }

  // L24 (idx23) ANAK — tangis samar itu tangis anaknya sendiri: lengan kosong menimang
  {
    const sc = scene(world, 'anak', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam);
    houseSet(A, 241);
    const darkA = E('rect', { x: -320, y: -320, width: 1720, height: 2740, fill: '#04070f', opacity: .3 }, A);
    E('g', {}, B); // latar polos berkabut untuk B digambar manual di bawah
    E('rect', { x: -320, y: -320, width: 1720, height: 2740, fill: '#0a1220' }, B);
    stars(B, 242);
    const fogB1 = E('ellipse', { cx: 300, cy: 1500, rx: 480, ry: 260, fill: '#8fa3bd', opacity: .22 }, B);
    const fogB2 = E('ellipse', { cx: 820, cy: 1620, rx: 520, ry: 240, fill: '#8fa3bd', opacity: .18 }, B);
    E('rect', { x: -320, y: 1400, width: 1720, height: 1020, fill: '#060b14' }, B);
    const sdB = SundelFront(B, {}); tr(sdB.g, 540, GY, 1.45);
    sdB.g.setAttribute('opacity', .94);
    during('anak', 'anake', (t) => {
      const t0 = lineT(23), d = lineD(23), b1 = t0 + d * .45;
      darkA.setAttribute('opacity', (.3 + Math.sin(t * .5) * .02).toFixed(3));
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 1000, 1.08, 540, 998, 1.14);
      const sway = Math.sin(t * 1.15) * 2.2;   // ayunan menimang yang kosong
      sdB.set({ blink: blinkAt(t, 8), face: 'down', headTilt: 5, headR: sway * .5, la: [56, -92], ra: [56, -92], bob: Math.sin(t * 1.15) * 3 });
      fogB1.setAttribute('transform', `translate(${Math.sin(t * .1) * 30} 0)`);
      fogB2.setAttribute('transform', `translate(${Math.cos(t * .08) * 36} 0)`);
      B.style.display = t >= b1 ? '' : 'none';
      shotCam(B, t, b1, t0 + d, 540, 860, 1.5, 540, 856, 1.58);
    });
  }

  // L25 (idx24) GANTI — ia pergi dengan tangan kosong; Lastri mencium bayinya di jendela
  {
    const sc = scene(world, 'ganti', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam);
    roadSet(A, 251); const sdA = SundelBack(A, {});
    const fogA = E('ellipse', { cx: 950, cy: 1150, rx: 430, ry: 340, fill: '#8fa3bd', opacity: .26 }, A);
    houseSet(B, 252); const lasB = Lastri(B, {}); tr(lasB.g, 428, 1150, .58);
    during('ganti', 'gantie', (t) => {
      const t0 = lineT(24), d = lineD(24), b1 = t0 + d * .52;
      const x = 480 + (t - t0) * 52;
      sdA.set({ hair: 'A', bob: Math.abs(Math.sin(t * 2.2)) * 4 });
      tr(sdA.g, x, GY, .82);
      fogA.setAttribute('opacity', (.26 + clamp((t - t0) / d) * .22).toFixed(3));
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 1010, 1.08, 540, 1008, 1.13);
      const kiss = bump((t - b1) / (d * .48), .15, .5) - bump((t - b1) / (d * .48), .75, 1);
      lasB.set({ blink: blinkAt(t, 5), fear: 0, headR: 2 + kiss * 5, ra: [40, -46] });
      lasB.g.setAttribute('transform', `translate(428 ${1150 + kiss * 7}) scale(.58)`);
      B.style.display = t >= b1 ? '' : 'none';
      shotCam(B, t, b1, t0 + d, 400, 890, 2.3, 400, 888, 2.37);
    });
  }

  // L26 (idx25) LAMPU — malam berikutnya Joko menyalakan lampu tikungan itu sendiri
  {
    const sc = scene(world, 'lampu', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    bendDuskSet(A, 261, false); const jokA = Joko(A, {});
    const setB = bendDuskSet(B, 262, false);
    const jokB = Joko(B, {}); tr(jokB.g, 470, GY, 1.45);
    const flameB = E('g', {}, B);
    const fl1 = E('path', { d: 'M848 640 q-15 -26 0 -52 q15 26 0 52 Z', fill: '#ffd98a' }, flameB);
    const fl2 = E('path', { d: 'M848 636 q-7 -15 0 -30 q7 15 0 30 Z', fill: '#fff3c4' }, flameB);
    const setC = bendDuskSet(C, 263, false); const jokC = Joko(C, {});
    during('lampu', 'lampue', (t) => {
      const t0 = lineT(25), d = lineD(25), b1 = t0 + d * .36, b2 = t0 + d * .7;
      const walk = clamp((t - t0) / (d * .3));
      jokA.set({ blink: blinkAt(t, 4), mood: 'flat', legL: walk < 1 ? walkLeg(t * 5.8) : [0, 4], legR: walk < 1 ? walkLeg(t * 5.8 + Math.PI) : [0, 4], la: [20 + Math.sin(t * 5.8) * 9, -19], ra: [20 - Math.sin(t * 5.8) * 9, -19] });
      tr(jokA.g, lerp(90, 690, walk), GY, 1.0);
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 540, 1010, 1.1, 540, 1008, 1.15);
      const light = bump((t - b1) / (d * .34), .15, .6);
      jokB.set({ blink: blinkAt(t, 5), mood: 'flat', ra: [128, -64], la: [20, -20], headR: -6 });
      setB.glass.setAttribute('opacity', (.1 + light * .82).toFixed(3));
      setB.glow.setAttribute('opacity', (light * .3).toFixed(3));
      flameB.setAttribute('opacity', light.toFixed(3));
      flameB.setAttribute('transform', `translate(0 ${(Math.sin(t * 11) * 2).toFixed(1)}) scale(1 ${1 + Math.sin(t * 13) * .05})`);
      fl1.setAttribute('transform', `rotate(${(Math.sin(t * 9.7) * 3).toFixed(2)} 848 640)`);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 640, 810, 1.68, 640, 806, 1.78);
      setC.glass.setAttribute('opacity', .92); setC.glow.setAttribute('opacity', .3);
      const home = clamp((t - b2) / (d * .3));
      jokC.set({ blink: blinkAt(t, 6), mood: 'grin', legL: home < 1 ? walkLeg(t * 5.2) : [0, 4], legR: home < 1 ? walkLeg(t * 5.2 + Math.PI) : [0, 4], la: [20 - Math.sin(t * 5.2) * 8, -19], ra: [20 + Math.sin(t * 5.2) * 8, -19], headR: 2 });
      tr(jokC.g, lerp(690, 260, home), GY, 1.0);
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 540, 1010, 1.08, 540, 1009, 1.12);
    });
  }

  // L27 (idx26) PADAM — pagi: lampu padam, minyaknya masih penuh (zoom-out lambat)
  {
    const sc = scene(world, 'padam', 'cut');
    const A = E('g', {}, sc.cam), B = E('g', {}, sc.cam), C = E('g', {}, sc.cam);
    const setA = bendDuskSet(A, 271, true); setA.glass.setAttribute('opacity', .05); setA.glow.setAttribute('opacity', 0);
    const setB = bendDuskSet(B, 272, true); setB.glass.setAttribute('opacity', .05); setB.glow.setAttribute('opacity', 0);
    const jokB = Joko(B, {});
    const setC = bendDuskSet(C, 273, true); setC.glass.setAttribute('opacity', .05); setC.glow.setAttribute('opacity', 0);
    const jokC = Joko(C, {}); tr(jokC.g, 380, GY, 1.0);
    during('padam', 'padame', (t) => {
      const t0 = lineT(26), d = lineD(26), b1 = t0 + d * .36, b2 = t0 + d * .68;
      A.style.display = t < b1 ? '' : 'none';
      shotCam(A, t, t0, b1, 848, 600, 2.3, 848, 598, 2.37);
      const walk = clamp((t - b1) / (d * .3));
      jokB.set({ blink: blinkAt(t, 4), mood: 'flat', fear: .22, legL: walk < 1 ? walkLeg(t * 5.4) : [0, 4], legR: walk < 1 ? walkLeg(t * 5.4 + Math.PI) : [0, 4], la: [18, -18], ra: [18, -18], headR: walk >= 1 ? -7 : 0 });
      tr(jokB.g, lerp(120, 400, walk), GY, 1.0);
      B.style.display = t >= b1 && t < b2 ? '' : 'none';
      shotCam(B, t, b1, b2, 620, 950, 1.42, 620, 947, 1.5);
      jokC.set({ blink: blinkAt(t, 6), mood: 'flat', fear: .22, headR: -7, la: [18, -18], ra: [18, -18] });
      C.style.display = t >= b2 ? '' : 'none';
      shotCam(C, t, b2, t0 + d, 540, 1010, 1.16, 540, 1012, 1.03);
    });
  }
};
