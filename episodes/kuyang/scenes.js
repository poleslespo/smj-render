// Ep.6 "Yang Terbang di Atas Atap" (Kuyang) — FULL EPISODE, 25 baris, RESEP GAYA BARU ep.8.
// Basis kode: adegan tes hook yang disetujui user (rig Raka/Darma, set nightYard versi
// ibu-jendela PERTAMA — keputusan user) + figur Kuyang REDESIGN yang disetujui (stills v2).
// Tiap baris = 2-3 SUB-SHOT (set + kamera sendiri), potong hanya di batas frasa /
// 4 momen yang diizinkan resep; pose tokoh kontinu antar-potong (posisi dunia =
// fungsi waktu absolut). Perbaikan temuan sendiri dari adegan tes dipertahankan:
// KONTINUITAS FASE AMBIEN — semua siklus ambien (ayun ibu, tirai, kabut, sway organ
// kuyang, kibar usus) pada fase waktu ABSOLUT, tidak di-reset per sub-shot.
// Kanon kuyang & audit nama: hidden_files/ep-06-kuyang/audit-ep6.md.
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

  /* ================= armKit — lengan 2 segmen (mekanika bersama, pola contoh ep.8) =====
     place(arm, a1, a2, [Sx,Sy], point?) -> posisi telapak H.
     a1 negatif = lengan menyilang badan (defensif) — dilarang untuk gestur terbuka.
     PR §6 no.4: jari telunjuk DITEBALkan (outline 28 / kulit 18) dan 2 RUAS
     (ruas 1: 22 unit searah lengan; ruas 2: 16 unit menekuk 12°). */
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

  /* ================= legKit — kaki 2 segmen (PR §6 no.2) =================
     place(leg, swingDeg, kneeDeg, [Hx,Hy]) -> posisi kaki (foot).
     Lutut menekuk 30-45° saat fase ayun; lurus (±4°) saat menapak. */
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
      const K = [Hx[0] + L.sd * L1 * Math.sin(a1) * 0 + L1 * Math.sin(a1), Hx[1] + L1 * Math.cos(a1)];
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

  /* ================= RAKA (narator, ±26) — 760, tegak, rambut berjambul lancip ===== */
  const Raka = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#cf9868', hair: '#14100c', shirt: '#1f4e52', shirtD: '#143539', pants: '#232a3a', shoe: '#17100b' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 92, ry: 13, fill: '#000', opacity: .28 }, g); // bayangan lembut (resep §1.5)
    const legs = legKit(g, { L1: 168, L2: 158, cloth: C.pants, shoe: C.shoe });
    // torso ramping-sedang
    E('path', { d: 'M-56,-540 C-64,-470 -62,-390 -56,-322 L56,-322 C62,-390 64,-470 56,-540 Q0,-562 -56,-540Z', fill: C.shirt, ...st(4) }, g);
    E('path', { d: 'M56,-540 C64,-470 62,-390 56,-322 L34,-322 C42,-392 44,-468 38,-536Z', fill: C.shirtD }, g);
    const kit = armKit(g, { L1: 128, L2: 118, wO: 38, wF: 32, shirt: C.shirt, shirtD: C.shirtD, skin: C.skin });
    E('rect', { x: -17, y: -572, width: 34, height: 46, rx: 9, fill: C.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('circle', { cx: 0, cy: -626, r: 73, fill: C.skin, ...st(4) }, hg);
    // rambut pendek berjambul lancip (siluet: zigzag di atas, sisi pendek)
    const hair = E('path', { d: 'M-73,-626 C-78,-686 -40,-712 -2,-713 L-14,-690 L4,-706 L10,-686 L28,-700 L30,-680 L52,-690 C68,-672 76,-656 73,-626 C64,-652 46,-660 34,-654 C26,-668 6,-672 -8,-664 C-24,-674 -46,-668 -56,-652 C-64,-664 -70,-646 -73,-626Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 26},-634)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 7.5, ry: 10.5, fill: '#241610' }, open);
      E('circle', { cx: 2.5, cy: -3.5, r: 2.6, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-10,2 Q0,-7 10,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 15},-660 Q${sd * 26},-665 ${sd * 39},-660`, fill: 'none', ...st(3.5, '#3a2718') }, hg));
    E('path', { d: 'M-2,-618 Q-5,-606 2,-604 Q8,-604 8,-611', fill: 'none', ...st(3, '#a06a42') }, hg);
    const closed = E('path', { d: 'M-15,-582 Q0,-573 15,-582', fill: 'none', ...st(3.5, '#8a3b34') }, hg);
    const openM = E('path', { fill: '#6d2620', ...st(3, '#4a2018') }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [20, -22], ra = [17, -20], headR = 0, blink = false, fear = 0, shock = 0, hairSw = 0, legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -556)`);
        hair.setAttribute('transform', `rotate(${(headR * .4 + hairSw).toFixed(2)} 0 -640)`);
        const wide = 1 + .35 * shock;
        eyes.forEach(ey => {
          ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none';
          ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`);
        });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up = fear * 8 + shock * 11;
          b.setAttribute('d', `M${sd * 15},${(-660 - up).toFixed(0)} Q${sd * 26},${(-665 - up).toFixed(0)} ${sd * 39},-660`);
        });
        const mo = fear > .25 || shock > .25;
        closed.style.display = mo ? 'none' : '';
        openM.style.display = mo ? '' : 'none';
        // mulut takut = oval tegak kecil ("o" menahan napas, resep §7) — BUKAN busur lebar
        openM.setAttribute('d', 'M0,-590 C7,-590 10,-584 10,-577 C10,-569 7,-563 0,-563 C-7,-563 -10,-569 -10,-577 C-10,-584 -7,-590 0,-590Z');
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-56, -498], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [56, -498], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-27, -322]);
        legs.place(legs.legs.r, legR[0], legR[1], [27, -322]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= PAK DARMA (tetua) — ±650, BUNGKUK, peci, sarung kotak ===== */
  const Darma = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#bd8256', hair: '#cfc8bd', shirt: '#6f6455', shirtD: '#54493c', sarung: '#5e2f2a', sarungL: '#8a5a3a', shoe: '#2a1c12' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 88, ry: 12, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 150, L2: 140, wO: 38, wF: 30, cloth: '#3a332a', shoe: C.shoe });
    // sarung kotak menutup paha (digambar DI ATAS paha, di bawah pinggang)
    const sar = E('g', {}, g);
    E('path', { d: 'M-66,-312 L66,-312 L80,-92 L-80,-92 Z', fill: C.sarung, ...st(4) }, sar);
    [-40, -13, 13, 40].forEach(lx => E('path', { d: `M${lx},-310 L${lx + (lx > 0 ? 4 : -4)},-94`, stroke: C.sarungL, 'stroke-width': 3, opacity: .55 }, sar));
    [-250, -190, -130].forEach(ly => E('path', { d: `M-72,${ly} L72,${ly}`, stroke: C.sarungL, 'stroke-width': 3, opacity: .45 }, sar));
    E('path', { d: 'M-66,-312 L66,-312 L68,-282 L-68,-282Z', fill: '#47231f' }, sar);
    // grup atas dibungkukkan +7° dari pinggang (0,-300)
    const up = E('g', {}, g);
    E('path', { d: 'M-64,-516 C-70,-450 -68,-372 -62,-306 L62,-306 C68,-372 70,-450 64,-516 Q0,-540 -64,-516Z', fill: C.shirt, ...st(4) }, up);
    E('path', { d: 'M64,-516 C70,-450 68,-372 62,-306 L40,-306 C48,-374 50,-448 44,-512Z', fill: C.shirtD }, up);
    const kit = armKit(up, { L1: 106, L2: 96, wO: 34, wF: 28, shirt: C.shirt, shirtD: C.shirtD, skin: C.skin });
    E('rect', { x: -15, y: -540, width: 30, height: 38, rx: 8, fill: C.skin, ...st(3) }, up);
    const head = E('g', {}, up), hg = E('g', {}, head);
    E('circle', { cx: 8, cy: -592, r: 65, fill: C.skin, ...st(4) }, hg);
    // uban tipis di sisi + botak tengah
    [-1, 1].forEach(sd => E('path', { d: `M${8 + sd * 62},-606 Q${8 + sd * 70},-570 ${8 + sd * 58},-548`, fill: 'none', stroke: C.hair, 'stroke-width': 9, 'stroke-linecap': 'round' }, hg));
    // peci hitam (blok siluet)
    E('path', { d: 'M-52,-618 L68,-618 L64,-664 Q8,-678 -48,-664 Z', fill: '#0d0d10', ...st(3) }, hg);
    // keriput dahi
    [-636, -624].forEach((wy, i) => E('path', { d: `M${-16 + i * 4},${wy + 28} Q8,${wy + 24} ${32 - i * 4},${wy + 28}`, fill: 'none', stroke: '#96683f', 'stroke-width': 2.5, opacity: .7 }, hg));
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${8 + sd * 23},-600)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 6.5, ry: 9, fill: '#241610' }, open);
      E('circle', { cx: 2, cy: -3, r: 2.2, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${8 + sd * 12},-624 Q${8 + sd * 23},-630 ${8 + sd * 35},-624`, fill: 'none', ...st(4, '#8f887c') }, hg));
    E('path', { d: 'M6,-584 Q3,-573 9,-571 Q14,-571 14,-578', fill: 'none', ...st(3, '#96683f') }, hg);
    // kumis + janggut uban
    E('path', { d: 'M-12,-562 Q8,-552 28,-562 Q20,-548 8,-549 Q-4,-548 -12,-562Z', fill: C.hair, ...st(2.5, '#a39a8b') }, hg);
    E('path', { d: 'M-24,-548 Q8,-522 40,-548 Q34,-516 8,-512 Q-18,-516 -24,-548Z', fill: C.hair, opacity: .92, ...st(2.5, '#a39a8b') }, hg);
    const mouth = E('path', { d: 'M-4,-556 Q8,-551 20,-556', fill: 'none', ...st(3.5, '#7c463c') }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [18, -22], ra = [18, -22], headR = 0, blink = false, fear = 0, shock = 0, legL = [0, 4], legR = [0, 4], point = null } = o;
        up.setAttribute('transform', `rotate(7 0 -300)`);
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 8 -528)`);
        const wide = 1 + .3 * shock;
        eyes.forEach(ey => {
          ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none';
          ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`);
        });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up2 = fear * 7 + shock * 9;
          b.setAttribute('d', `M${8 + sd * 12},${(-624 - up2).toFixed(0)} Q${8 + sd * 23},${(-630 - up2).toFixed(0)} ${8 + sd * 35},-624`);
        });
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-60, -472], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [60, -472], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-26, -312]);
        legs.place(legs.legs.r, legR[0], legR[1], [26, -312]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  const Kuyang = (p, o = {}) => {
    const sil = !!o.sil;
    const K = '#010102';
    const C = sil
      ? { hair: K, skin: K, skinD: K, rim: K, cut: K, trak: K, lung: K, heart: K, liver: K, kid: K, gutB: K, gut1: K, gut2: K, gut3: K, line: K, eye: K }
      : { hair: '#0a0c12', skin: '#332b39', skinD: '#28222f', rim: '#93a7cc', cut: '#5c1e22', trak: '#463237', lung: '#5a343d', heart: '#5e1f23', liver: '#49161b', kid: '#3e2129', gutB: '#2b1611', gut1: '#633122', gut2: '#4e271c', gut3: '#6b3828', line: '#191019', eye: '#0b0910' };
    const g = E('g', {}, p);
    // (5) aura merah memanjang searah sumbu tubuh + inti terang di gugus organ
    let glowE = null, glowC = null;
    if (!sil) {
      glowE = E('ellipse', { cx: -14, cy: 74, rx: 100, ry: 76, fill: '#ff4a30', opacity: .12, filter: P.blur(g, 24), transform: 'rotate(24 -14 74)' }, g);
      glowC = E('ellipse', { cx: -4, cy: 92, rx: 46, ry: 40, fill: '#ff6a3c', opacity: .15, filter: P.blur(g, 13) }, g);
    }
    const body = E('g', {}, g);
    const org = E('g', {}, body);      // gugus organ — poros di pangkal leher (0,36)
    const orgIn = E('g', { transform: 'translate(-6,-13)' }, org); // gugus ditarik naik-mundur menempel leher
    const hairB = E('g', {}, body);    // massa rambut belakang, mengalir ke belakang
    const headG = E('g', {}, body);    // kepala + tunggul leher (pitch sendiri)

    /* ---- (3) GUGUS ORGAN: padat, berlingkar, asimetris ---- */
    // ginjal (2, di belakang hati — disebut sekitarkaltim)
    E('ellipse', { cx: -26, cy: 102, rx: 6.5, ry: 9, fill: C.kid, transform: 'rotate(18 -26 102)' }, orgIn);
    E('ellipse', { cx: 25, cy: 99, rx: 6, ry: 8.5, fill: C.kid, transform: 'rotate(-16 25 99)' }, orgIn);
    // SAMBUNGAN leher->organ (perbaikan still v2): trakea lama cuma 2 garis tepi
    // y36-55 yang hampir seluruhnya tertutup tunggul — ujungnya mengintip di bawah
    // rim lalu LANGIT KOSONG sampai gugus (kepala kebaca melayang di atas organ).
    // Sekarang: KOLOM trakea/esofagus TERISI bercincin turun TERUS dari dalam
    // tunggul (y30, tertutup kepala) melewati rim (orgIn y~51-55) sampai masuk ke
    // jantung (y88, tertutup jantung/paru yang digambar sesudahnya) + 2 TALI
    // JARINGAN menyebar dari rim ke puncak kedua paru. Tidak ada langit kosong
    // antara tunggul dan gugus di titik mana pun — organ MENGGANTUNG dari leher.
    E('path', { d: 'M-6,50 C-10,55 -13,59 -15,64', fill: 'none', stroke: C.cut, 'stroke-width': 3.6, 'stroke-linecap': 'round' }, orgIn);
    E('path', { d: 'M7,49 C10,54 12,59 13,65', fill: 'none', stroke: C.cut, 'stroke-width': 3.6, 'stroke-linecap': 'round' }, orgIn);
    E('path', { d: 'M-4,30 C-5,48 -5,68 -3,88 L4,88 C5,68 6,48 6,30 C3,27 -1,27 -4,30 Z', fill: C.trak }, orgIn);
    E('path', { d: 'M-4,32 C-5,50 -5,68 -3,86 M6,32 C6,50 5,68 4,86', fill: 'none', stroke: C.line, 'stroke-width': 1.6, opacity: .55 }, orgIn);
    E('path', { d: 'M-5,42 Q1,45 6,42 M-5,52 Q1,55 6,52 M-5,62 Q1,65 5,62 M-4,72 Q1,75 5,72 M-4,82 Q0,85 4,82', fill: 'none', stroke: C.line, 'stroke-width': 2.2, opacity: .8 }, orgIn);
    // paru-paru (2, mengapit trakea, tak sama besar, terisi pekat + bayangan dalam)
    E('ellipse', { cx: -17, cy: 79, rx: 12.5, ry: 23, fill: C.lung, stroke: C.line, 'stroke-width': 1.2, transform: 'rotate(17 -17 79)' }, orgIn);
    E('ellipse', { cx: 15, cy: 83, rx: 11.5, ry: 21, fill: C.lung, stroke: C.line, 'stroke-width': 1.2, transform: 'rotate(-14 15 83)' }, orgIn);
    E('ellipse', { cx: -19, cy: 84, rx: 7, ry: 15, fill: C.gutB, opacity: .35, transform: 'rotate(17 -19 84)' }, orgIn);
    E('ellipse', { cx: 13, cy: 88, rx: 6.5, ry: 13, fill: C.gutB, opacity: .35, transform: 'rotate(-14 13 88)' }, orgIn);
    // jantung: gumpalan ORGANIK ASIMETRIS (perbaikan still v2 — versi lama dua
    // lobus simetris sempurna + takik tengah + ujung runcing = kebaca jantung
    // Valentine/emoji): lobus kiri lebih besar & lebih tinggi, sisi kanan lebih
    // rendah, ujung bawah TUMPUL miring ke kiri, bayangan dalam tak merata.
    // Tunggul pembuluh naik MENYATU ke kolom trakea (y82 masuk wilayah kolom).
    E('path', { d: 'M-3,94 C-3,89 -2,85 0,82', fill: 'none', stroke: C.cut, 'stroke-width': 5, 'stroke-linecap': 'round' }, orgIn);
    E('path', { d: 'M-3,91 C-6,85 -13,83 -17,88 C-22,93 -23,101 -21,109 C-18,118 -10,125 -4,130 C1,124 10,121 14,113 C17,105 15,95 9,91 C5,88 0,88 -3,91 Z', fill: C.heart, stroke: C.line, 'stroke-width': 2 }, orgIn);
    E('ellipse', { cx: 6, cy: 113, rx: 6, ry: 9.5, fill: C.gutB, opacity: .3, transform: 'rotate(-12 6 113)' }, orgIn);
    E('path', { d: 'M-8,100 C-6,108 -6,116 -8,123', fill: 'none', stroke: C.line, 'stroke-width': 1.8, opacity: .55 }, orgIn);
    // hati: pita lebar di bawah gugus paru/jantung
    E('path', { d: 'M-30,111 C-14,105 14,104 27,109 C30,119 23,129 8,132 C-7,135 -23,131 -29,123 C-31,118 -31,114 -30,111 Z', fill: C.liver, stroke: C.line, 'stroke-width': 2 }, orgIn);
    // usus: GULUNGAN tebal tumpang-tindih (basis menyatukan + lilitan S/U bervariasi)
    E('path', { d: 'M-33,127 C-41,145 -37,168 -23,181 C-7,193 16,193 28,181 C39,168 37,144 27,131 C11,123 -17,121 -33,127 Z', fill: C.gutB }, orgIn);
    E('path', { d: 'M-25,139 C-11,131 12,131 23,139', fill: 'none', stroke: C.gut1, 'stroke-width': 14, 'stroke-linecap': 'round' }, orgIn);
    E('path', { d: 'M-28,153 C-13,145 14,146 26,154', fill: 'none', stroke: C.gut2, 'stroke-width': 15, 'stroke-linecap': 'round' }, orgIn);
    E('path', { d: 'M-23,167 C-9,160 12,160 22,167', fill: 'none', stroke: C.gut1, 'stroke-width': 14, 'stroke-linecap': 'round' }, orgIn);
    E('path', { d: 'M-15,179 C-5,173 8,173 16,178', fill: 'none', stroke: C.gut2, 'stroke-width': 12, 'stroke-linecap': 'round' }, orgIn);
    E('path', { d: 'M-7,136 C1,146 1,157 -5,167', fill: 'none', stroke: C.gut3, 'stroke-width': 10, 'stroke-linecap': 'round' }, orgIn);
    E('path', { d: 'M-27,148 C-31,166 -27,183 -18,191', fill: 'none', stroke: C.gut3, 'stroke-width': 11, 'stroke-linecap': 'round' }, orgIn);

    /* ---- (2) RAMBUT: massa tak rata, unting panjang mengalir ke belakang ---- */
    E('path', { d: 'M-30,-30 C-44,-18 -50,4 -44,30 C-38,12 -36,-8 -24,-20 Z', fill: C.hair }, hairB);
    E('path', { d: 'M-16,-56 C-30,-46 -38,-30 -36,-12 C-28,-24 -22,-38 -10,-48 Z', fill: C.hair }, hairB);
    E('path', { d: 'M-6,-62 C-28,-56 -42,-38 -44,-12', fill: 'none', stroke: C.hair, 'stroke-width': 11, 'stroke-linecap': 'round' }, hairB);
    E('path', { d: 'M-13,-58 C-35,-48 -49,-26 -47,4', fill: 'none', stroke: C.hair, 'stroke-width': 10, 'stroke-linecap': 'round' }, hairB);
    E('path', { d: 'M-19,-50 C-41,-36 -53,-10 -48,28', fill: 'none', stroke: C.hair, 'stroke-width': 9, 'stroke-linecap': 'round' }, hairB);
    E('path', { d: 'M-25,-38 C-43,-22 -51,6 -43,46', fill: 'none', stroke: C.hair, 'stroke-width': 8, 'stroke-linecap': 'round' }, hairB);
    E('path', { d: 'M-29,-22 C-41,-4 -45,22 -35,58', fill: 'none', stroke: C.hair, 'stroke-width': 6, 'stroke-linecap': 'round' }, hairB);
    E('path', { d: 'M0,-64 C-10,-50 -12,-34 -7,-20', fill: 'none', stroke: C.hair, 'stroke-width': 8, 'stroke-linecap': 'round' }, hairB);

    /* ---- (1) KEPALA PROFIL + tunggul leher ---- */
    // tunggul leher (bekas lepas — tepi bawah tak rata + rim luka)
    E('path', { d: 'M-13,10 L11,12 L7,35 C2,40 -7,40 -11,35 Z', fill: C.skinD }, headG);
    E('path', { d: 'M-11,33 C-5,37 2,37 7,33 L6,38 C1,41 -6,41 -10,38 Z', fill: C.cut }, headG);
    // kulit kepala: massa rambut mahkota-belakang + taji menyatu (garis rambut tak rata)
    E('path', { d: 'M-31,-10 C-35,-32 -27,-50 -11,-55 C1,-58 11,-53 16,-44 C5,-48 -5,-46 -12,-39 C-20,-31 -24,-20 -21,-8 C-24,-9 -28,-10 -31,-10 Z', fill: C.hair }, headG);
    E('path', { d: 'M-22,-49 L-26,-59 L-16,-52 Z', fill: C.hair }, headG);
    E('path', { d: 'M-7,-54 L-5,-63 L1,-54 Z', fill: C.hair }, headG);
    // wajah profil v3: dahi tegak -> alis menonjol -> batang hidung -> UJUNG HIDUNG
    // menjorok jauh -> bibir masuk -> dagu menonjol lagi -> rahang memotong ke leher.
    // (v2 masih kebaca topeng telur: tonjolan terlalu kecil dibanding tengkorak.)
    E('path', { d: 'M9,20 C14,17 20,15 23,13 C26,10 27,8 27,5 C23,3 22,2 23,0 C26,-1 28,-1 27,-3 C28,-6 33,-8 38,-11 C33,-16 27,-18 22,-21 C25,-24 27,-25 28,-28 C25,-35 23,-39 21,-43 C15,-52 7,-56 0,-56 C-14,-56 -25,-50 -29,-40 C-33,-30 -32,-20 -29,-12 C-25,-2 -20,7 -15,13 C-13,16 -12,18 -11,19 L9,20 Z', fill: C.skin, stroke: C.line, 'stroke-width': 2.5 }, headG);
    // cahaya bulan di tepi wajah (membaca profil dari jauh)
    E('path', { d: 'M21,-43 C24,-37 26,-33 28,-28 C25,-24 31,-18 38,-11 C33,-6 28,-4 27,-2 C28,1 26,7 23,13', fill: 'none', stroke: C.rim, 'stroke-width': 2.2, opacity: .7, 'stroke-linecap': 'round' }, headG);
    // alis, mata (rongga gelap TANPA kilau — kilau titik putih kebaca mata boneka),
    // lubang hidung, mulut (celah datar, bukan senyum), rahang & pipi
    E('path', { d: 'M0,-30 C6,-34 14,-34 19,-30', fill: 'none', stroke: C.skinD, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, headG);
    E('path', { d: 'M1,-19 C5,-24 14,-24 18,-19 C14,-15 5,-15 1,-19 Z', fill: C.eye }, headG);
    E('circle', { cx: 30, cy: -6, r: 1.4, fill: C.eye }, headG);
    E('path', { d: 'M15,2 C18,3 22,3 25,2.5', fill: 'none', stroke: C.eye, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, headG);
    E('path', { d: 'M20,14 C11,20 0,22 -8,18', fill: 'none', stroke: C.skinD, 'stroke-width': 2, opacity: .7, 'stroke-linecap': 'round' }, headG);
    E('ellipse', { cx: 6, cy: 2, rx: 9, ry: 12, fill: C.skinD, opacity: .3 }, headG);

    const api = {
      g,
      set(o2 = {}) {
        const { sway = 0, hairLag = 0, glowK = 1 } = o2;
        // (4) postur terbang: organ tertinggal +20° dari vertikal, rambut +12°,
        // kepala pitch maju +8° — ayun pendulum tinggal menambah/mengurangi sudut itu.
        org.setAttribute('transform', `rotate(${(20 + sway).toFixed(2)} 0 36)`);
        hairB.setAttribute('transform', `rotate(${(12 + hairLag).toFixed(2)} 0 -24)`);
        headG.setAttribute('transform', 'rotate(8 0 10)');
        if (glowE) { glowE.setAttribute('opacity', (.09 + .06 * glowK).toFixed(3)); glowC.setAttribute('opacity', (.11 + .08 * glowK).toFixed(3)); }
      }
    };
    api.set({});
    return api;
  };


  /* ================= SET — halaman rumah Bu Sari, malam =================
     3 lapis (resep §1.5): jauh = langit gradasi + bulan + kabut + siluet atap;
     tengah = rumah + jendela hangat (satu-satunya titik hangat) + pagar jeruju;
     depan = foreground per shot. Tanah y=1420 s.d. 2420. */
  function nightYard(shot, seed) {
    const r = P.rng(seed);
    // langit + bintang
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#skyGrad)' }, shot);
    for (let i = 0; i < 42; i++) E('circle', { cx: (r() * 1180 - 50).toFixed(0), cy: (r() * 760).toFixed(0), r: (.8 + r() * 1.7).toFixed(1), fill: '#dfe9f5', opacity: (.2 + r() * .5).toFixed(2) }, shot);
    // bulan + halo
    E('circle', { cx: 880, cy: 300, r: 150, fill: 'url(#moonHalo)' }, shot);
    E('circle', { cx: 880, cy: 300, r: 62, fill: '#e6eef7' }, shot);
    E('circle', { cx: 862, cy: 282, r: 10, fill: '#c9d6e4', opacity: .5 }, shot);
    E('circle', { cx: 898, cy: 322, r: 7, fill: '#c9d6e4', opacity: .45 }, shot);
    // lapis jauh: siluet atap + pohon
    E('path', { d: 'M-60,1420 L-60,1300 L90,1240 L240,1300 L240,1420 L420,1420 L420,1330 L540,1270 L660,1330 L660,1420 Z', fill: '#0c1424' }, shot);
    E('path', { d: 'M150,1420 C160,1330 150,1240 128,1170 M150,1420 C170,1340 190,1270 226,1216 M150,1420 C138,1350 110,1290 74,1250', fill: 'none', stroke: '#0c1424', 'stroke-width': 13, 'stroke-linecap': 'round' }, shot);
    // kabut (dikembalikan untuk drift fase absolut)
    const fog1 = E('ellipse', { cx: 300, cy: 1272, rx: 430, ry: 44, fill: '#aebfd8', opacity: .10, filter: P.blur(shot, 18) }, shot);
    const fog2 = E('ellipse', { cx: 800, cy: 1358, rx: 520, ry: 58, fill: '#aebfd8', opacity: .13, filter: P.blur(shot, 22) }, shot);
    // tanah s.d. 2420 + tekstur painted
    E('rect', { x: -320, y: GY, width: 1720, height: 1000, fill: 'url(#gndGrad)' }, shot);
    const stn = E('g', { filter: P.blur(shot, 16) }, shot);
    for (let i = 0; i < 7; i++) E('ellipse', { cx: (r() * 1100).toFixed(0), cy: (1460 + r() * 420).toFixed(0), rx: (70 + r() * 130).toFixed(0), ry: (26 + r() * 44).toFixed(0), fill: i % 2 ? '#1a2a1c' : '#0b1322', opacity: (.10 + r() * .08).toFixed(2) }, stn);
    E('path', { d: 'M420,1920 L470,1420 L600,1420 L700,1920 Z', fill: '#1c2a1e', opacity: .35 }, shot); // jalan setapak ke pintu
    // rumah Bu Sari (kanan)
    const hs = E('g', {}, shot);
    E('path', { d: 'M642,1018 L850,896 L1058,1018 Z', fill: '#1d141c' }, hs); // segitiga gabel (dinding)
    E('path', { d: 'M606,1018 L850,866 L1094,1018 L1058,1018 L850,896 L642,1018 Z', fill: '#0a0f1c' }, hs); // atap
    E('rect', { x: 640, y: 1010, width: 420, height: 412, fill: '#231820' }, hs);
    for (let i = 0; i < 6; i++) E('path', { d: `M${706 + i * 66},1014 L${706 + i * 66},1418`, stroke: '#170f16', 'stroke-width': 5, opacity: .6 }, hs);
    E('rect', { x: 952, y: 1150, width: 62, height: 272, fill: '#120a10' }, hs); // pintu gelap
    // jendela hangat + siluet ibu mengayun bayi (poros ayun di (856,1236))
    E('rect', { x: 776, y: 1056, width: 168, height: 196, fill: '#ff9a3c', opacity: .32, filter: P.blur(shot, 13) }, hs);
    const glowRect = E('rect', { x: 792, y: 1072, width: 136, height: 164, fill: '#ffb45e' }, hs);
    const mother = E('g', {}, hs);
    E('path', { d: 'M836,1236 C832,1188 838,1152 850,1136 C862,1152 868,1188 864,1236 Z', fill: '#1a0d12' }, mother);
    E('circle', { cx: 851, cy: 1122, r: 17, fill: '#1a0d12' }, mother);
    E('circle', { cx: 866, cy: 1108, r: 6, fill: '#1a0d12' }, mother); // sanggul
    E('path', { d: 'M850,1150 C866,1162 880,1168 892,1172', fill: 'none', stroke: '#1a0d12', 'stroke-width': 11, 'stroke-linecap': 'round' }, mother);
    E('ellipse', { cx: 884, cy: 1178, rx: 21, ry: 12, transform: 'rotate(-14 884 1178)', fill: '#241118' }, mother); // buntelan bayi
    const curtainL = E('path', { d: 'M792,1072 L826,1072 C820,1126 820,1182 828,1236 L792,1236 Z', fill: '#2a1420', opacity: .92 }, hs);
    E('path', { d: 'M894,1072 L928,1072 L928,1236 L896,1236 C902,1182 902,1126 894,1072Z', fill: '#2a1420', opacity: .92 }, hs);
    E('rect', { x: 792, y: 1072, width: 136, height: 164, fill: 'none', stroke: '#0d0810', 'stroke-width': 10 }, hs);
    E('path', { d: 'M860,1072 L860,1236 M792,1154 L928,1154', stroke: '#0d0810', 'stroke-width': 7 }, hs);
    // pagar jeruju: tiang + rel + semak berduri (celah gerbang di x 380-500)
    const fc = E('g', {}, shot);
    for (let x = 36; x <= 1050; x += 88) { if (x > 372 && x < 508) continue; E('rect', { x: x, y: 1396, width: 13, height: 66, fill: '#14100c' }, fc); }
    E('path', { d: 'M20,1418 L372,1418 M508,1418 L1066,1418 M20,1444 L372,1444 M508,1444 L1066,1444', stroke: '#14100c', 'stroke-width': 8 }, fc);
    [90, 250, 560, 720, 900].forEach((bx, bi) => {
      const b = E('g', { transform: `translate(${bx},1452)` }, fc);
      [[-26, -18, 34], [8, -30, 44], [34, -14, 30]].forEach(([cx, cy, rr]) => E('circle', { cx, cy, r: rr, fill: '#0a1c11' }, b));
      const rb = P.rng(500 + bi * 17);
      for (let i = 0; i < 13; i++) {   // duri: tipis, panjang, arah tidak beraturan (bukan kipas)
        const a = -Math.PI * (0.02 + rb() * 0.96), len = 24 + rb() * 22, sx = (rb() - .5) * 56, sy = -34 + rb() * 22;
        E('path', { d: `M${sx.toFixed(0)},${sy.toFixed(0)} L${(sx + Math.cos(a) * len).toFixed(0)},${(sy + Math.sin(a) * len * .8).toFixed(0)}`, stroke: '#46684a', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, b);
      }
    });
    return { fog1, fog2, mother, curtainL, glowRect };
  }

  // foreground gelap (mengintip — resep §7)
  function fgLeaves(shot) {
    const fg = E('g', { opacity: .95, filter: P.blur(shot, 5) }, shot);
    E('path', { d: 'M-60,-60 C120,30 230,6 320,96 C210,128 50,96 -60,26 Z', fill: '#060b08' }, fg);
    E('path', { d: 'M1140,-60 C980,44 880,20 800,104 C900,130 1050,100 1140,30 Z', fill: '#060b08' }, fg);
    E('path', { d: 'M-60,1980 C60,1830 40,1700 -10,1600 C60,1740 90,1860 60,1980 Z', fill: '#060b08' }, fg);
    return fg;
  }
  function fgThorns(shot) {
    const fg = E('g', { opacity: .96, filter: P.blur(shot, 4) }, shot);
    [[120, 1952], [420, 1968], [760, 1956], [1010, 1966]].forEach(([bx, by]) => {
      E('ellipse', { cx: bx, cy: by, rx: 150, ry: 62, fill: '#04070a' }, fg);
      for (let i = 0; i < 6; i++) E('path', { d: `M${bx - 90 + i * 34},${by - 30} L${bx - 76 + i * 34},${by - 74 - (i % 3) * 12}`, stroke: '#04070a', 'stroke-width': 9, 'stroke-linecap': 'round' }, fg);
    });
    return fg;
  }
  function fgRoof(shot) {
    const fg = E('g', { opacity: .97, filter: P.blur(shot, 3) }, shot);
    E('path', { d: 'M560,-60 L1140,-60 L1140,150 L880,54 Z', fill: '#04060c' }, fg);
    return fg;
  }

  // senter di tangan kanan Raka (dihitung dari posisi telapak — aset mengikuti tangan)
  function makeSenter(parent) {
    const g = E('g', {}, parent);
    E('rect', { x: -8, y: -34, width: 16, height: 36, rx: 5, fill: '#10131c', ...st(2.5) }, g);
    E('rect', { x: -11, y: -46, width: 22, height: 14, rx: 4, fill: '#1a2030', ...st(2.5) }, g);
    E('circle', { cx: 0, cy: -46, r: 5, fill: '#cfd8e6', opacity: .75 }, g);
    return { set(H, rot) { tr(g, H[0], H[1], 1, rot); } };
  }

  /* ================= DITO (kawan jaga, ±17) — ±645, KURUS, poni samping, tas selempang ===== */
  const Dito = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#d2a06e', hair: '#17120e', shirt: '#6e2434', shirtD: '#521a26', pants: '#2c3038', shoe: '#17100b', strap: '#3a2c1c' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 80, ry: 12, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 155, L2: 148, cloth: C.pants, shoe: C.shoe });
    E('path', { d: 'M-46,-478 C-52,-416 -50,-352 -46,-300 L46,-300 C50,-352 52,-416 46,-478 Q0,-498 -46,-478Z', fill: C.shirt, ...st(4) }, g);
    E('path', { d: 'M46,-478 C52,-416 50,-352 46,-300 L28,-300 C34,-354 36,-414 31,-474Z', fill: C.shirtD }, g);
    E('path', { d: 'M-44,-470 L40,-318', stroke: C.strap, 'stroke-width': 17, 'stroke-linecap': 'round' }, g); // tali tas selempang (siluet)
    E('rect', { x: 26, y: -330, width: 44, height: 54, rx: 8, fill: C.strap, ...st(3) }, g); // tas di pinggul
    const kit = armKit(g, { L1: 118, L2: 108, wO: 35, wF: 29, shirt: C.shirt, shirtD: C.shirtD, skin: C.skin });
    E('rect', { x: -15, y: -506, width: 30, height: 40, rx: 8, fill: C.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('circle', { cx: 0, cy: -572, r: 66, fill: C.skin, ...st(4) }, hg);
    // rambut rata + poni menyapu ke kanan (siluet beda dari jambul Raka)
    E('path', { d: 'M-66,-572 C-70,-626 -34,-652 2,-652 C40,-652 68,-624 66,-572 C58,-606 40,-612 22,-606 C30,-622 14,-634 -6,-630 C-30,-626 -52,-612 -58,-590 C-62,-598 -64,-584 -66,-572Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 23},-580)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 7, ry: 10, fill: '#241610' }, open);
      E('circle', { cx: 2.5, cy: -3.5, r: 2.4, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 13},-604 Q${sd * 23},-609 ${sd * 35},-604`, fill: 'none', ...st(3.5, '#3a2718') }, hg));
    E('path', { d: 'M-2,-564 Q-5,-553 2,-551 Q7,-551 7,-558', fill: 'none', ...st(3, '#a06a42') }, hg);
    const closed = E('path', { d: 'M-13,-530 Q0,-522 13,-530', fill: 'none', ...st(3.5, '#8a3b34') }, hg);
    const openM = E('path', { fill: '#6d2620', ...st(3, '#4a2018') }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [20, -22], ra = [17, -20], headR = 0, blink = false, fear = 0, shock = 0, legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -492)`);
        const wide = 1 + .35 * shock;
        eyes.forEach(ey => {
          ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none';
          ey.open.setAttribute('transform', `scale(${wide.toFixed(2)})`);
        });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up = fear * 8 + shock * 11;
          b.setAttribute('d', `M${sd * 13},${(-604 - up).toFixed(0)} Q${sd * 23},${(-609 - up).toFixed(0)} ${sd * 35},-604`);
        });
        const mo = fear > .25 || shock > .25;
        closed.style.display = mo ? 'none' : '';
        openM.style.display = mo ? '' : 'none';
        openM.setAttribute('d', 'M0,-538 C6,-538 9,-532 9,-526 C9,-518 6,-513 0,-513 C-6,-513 -9,-518 -9,-526 C-9,-532 -6,-538 0,-538Z');
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-46, -440], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [46, -440], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-24, -300]);
        legs.place(legs.legs.r, legR[0], legR[1], [24, -300]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= BU SARI (ibu baru melahirkan) — ±695, sanggul, daster, gendong bayi =====
     Rig PENUH untuk adegan interior (dia orang yang bicara — bukan siluet jendela). */
  const BuSari = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#d9a877', hair: '#191008', dress: '#7a4a56', dressD: '#5f3942', cloth: '#8a5a64', shoe: '#3a2418' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 86, ry: 12, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 148, L2: 140, wO: 36, wF: 30, cloth: C.skin, shoe: C.shoe });
    // daster longgar melebar ke bawah (menutup pinggul/paha)
    E('path', { d: 'M-50,-496 C-58,-420 -70,-300 -80,-128 L80,-128 C70,-300 58,-420 50,-496 Q0,-518 -50,-496Z', fill: C.dress, ...st(4) }, g);
    E('path', { d: 'M50,-496 C58,-420 70,-300 80,-128 L44,-128 C38,-300 30,-416 22,-492Z', fill: C.dressD }, g);
    [-30, 0, 30].forEach((fx, i) => E('circle', { cx: fx, cy: -380 + i * 90, r: 7, fill: C.cloth, opacity: .5 }, g)); // motif bunga kecil
    const kit = armKit(g, { L1: 118, L2: 108, wO: 36, wF: 30, shirt: C.dress, shirtD: C.dressD, skin: C.skin });
    E('rect', { x: -15, y: -524, width: 30, height: 40, rx: 8, fill: C.skin, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('circle', { cx: 36, cy: -618, r: 19, fill: C.hair, ...st(3) }, hg); // sanggul
    E('circle', { cx: 0, cy: -578, r: 67, fill: C.skin, ...st(4) }, hg);
    E('path', { d: 'M-67,-578 C-71,-630 -36,-656 0,-656 C38,-656 69,-628 67,-578 C60,-612 38,-622 16,-618 C-14,-624 -46,-612 -56,-592 C-61,-600 -65,-588 -67,-578Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 24},-586)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 7, ry: 9.5, fill: '#241610' }, open);
      E('circle', { cx: 2.5, cy: -3, r: 2.4, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 13},-609 Q${sd * 24},-613 ${sd * 36},-609`, fill: 'none', ...st(3.5, '#3a2718') }, hg));
    E('path', { d: 'M-2,-568 Q-4,-558 2,-556 Q7,-556 7,-562', fill: 'none', ...st(3, '#a06a42') }, hg);
    const mouth = E('path', { d: 'M-12,-534 Q0,-528 12,-534', fill: 'none', ...st(3.5, '#8a3b34') }, hg);
    // buntelan bayi di dada (kain gendong diagonal + kepala bayi) — digambar di atas daster
    const bundle = E('g', {}, g);
    E('path', { d: 'M-58,-470 L52,-392 L40,-352 L-48,-428 Z', fill: '#a03c31', ...st(3.5) }, bundle); // kain gendong
    E('ellipse', { cx: 6, cy: -424, rx: 30, ry: 24, fill: '#c8b393', ...st(3) }, bundle); // bedong
    E('circle', { cx: 16, cy: -440, r: 15, fill: '#e8b98d', ...st(3) }, bundle); // kepala bayi
    E('path', { d: 'M4,-448 Q16,-456 28,-448', fill: 'none', ...st(2.5, '#8a6a4a') }, bundle);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [-38, -96], ra = [42, -88], headR = 0, blink = false, sad = 0, legL = [0, 4], legR = [0, 4], rock = 0, bundleOn = true } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -498)`);
        eyes.forEach(ey => { ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none'; });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up = sad * 6;
          b.setAttribute('d', `M${sd * 13},${(-609 - up).toFixed(0)} Q${sd * 24},${(-613 - up).toFixed(0)} ${sd * 36},-609`);
        });
        mouth.setAttribute('d', sad > .3 ? 'M-12,-530 Q0,-538 12,-530' : 'M-12,-534 Q0,-528 12,-534');
        bundle.style.display = bundleOn ? '' : 'none';
        bundle.setAttribute('transform', `rotate(${rock.toFixed(2)} 0 -420)`);
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-48, -452]);
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [48, -452]);
        legs.place(legs.legs.l, legL[0], legL[1], [-26, -290]);
        legs.place(legs.legs.r, legR[0], legR[1], [26, -290]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= PEREMPUAN SIANG (wujud manusia kuyang) — ±715, rambut panjang, SELENDANG di leher =====
     Kanon: siang hari dia perempuan biasa; selendang melingkar menutupi bekas luka
     melingkar di lehernya (audit §C, varian Banjar). */
  const Perempuan = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#c99a68', hair: '#0e0a08', dress: '#3d4a3a', dressD: '#2e382c', sel: '#8a2f2a', shoe: '#241a10' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 84, ry: 12, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 150, L2: 142, wO: 36, wF: 30, cloth: C.skin, shoe: C.shoe });
    // rambut panjang terurai di DUA sisi sampai pinggang (siluet khas)
    E('path', { d: 'M-64,-640 C-84,-560 -82,-420 -70,-300 L-44,-300 C-52,-430 -54,-540 -46,-620 Z', fill: C.hair }, g);
    E('path', { d: 'M64,-640 C84,-560 82,-420 70,-300 L44,-300 C52,-430 54,-540 46,-620 Z', fill: C.hair }, g);
    // gaun panjang
    E('path', { d: 'M-48,-520 C-56,-430 -66,-260 -74,-96 L74,-96 C66,-260 56,-430 48,-520 Q0,-542 -48,-520Z', fill: C.dress, ...st(4) }, g);
    E('path', { d: 'M48,-520 C56,-430 66,-260 74,-96 L40,-96 C34,-260 26,-424 18,-516Z', fill: C.dressD }, g);
    const kit = armKit(g, { L1: 122, L2: 112, wO: 36, wF: 30, shirt: C.dress, shirtD: C.dressD, skin: C.skin });
    E('rect', { x: -15, y: -548, width: 30, height: 42, rx: 8, fill: C.skin, ...st(3) }, g);
    // SELENDANG: pita tebal melingkar di leher + ujung menjuntai di dada
    E('path', { d: 'M-26,-540 Q0,-524 26,-540 L26,-516 Q0,-502 -26,-516 Z', fill: C.sel, ...st(3.5) }, g);
    E('path', { d: 'M14,-518 L30,-518 L36,-420 L18,-424 Z', fill: C.sel, ...st(3) }, g);
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('circle', { cx: 0, cy: -606, r: 68, fill: C.skin, ...st(4) }, hg);
    E('path', { d: 'M-68,-606 C-72,-660 -36,-686 0,-686 C38,-686 70,-656 68,-606 C62,-640 40,-652 14,-650 C-18,-652 -48,-640 -58,-618 C-63,-626 -66,-616 -68,-606Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 24},-614)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 7, ry: 6.5, fill: '#241610' }, open); // mata setengah terpejam, datar
      E('circle', { cx: 2.5, cy: -2, r: 2, fill: '#fff', opacity: .8 }, open);
      const shut = E('path', { d: 'M-9,2 Q0,-6 9,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 13},-636 Q${sd * 24},-639 ${sd * 36},-636`, fill: 'none', ...st(3.5, '#2c1c10') }, hg));
    E('path', { d: 'M-2,-596 Q-4,-586 2,-584 Q7,-584 7,-590', fill: 'none', ...st(3, '#96683f') }, hg);
    const mouth = E('path', { d: 'M-11,-562 Q0,-559 11,-562', fill: 'none', ...st(3.5, '#7c4038') }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [16, -18], ra = [14, -16], headR = 0, blink = false, legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -524)`);
        eyes.forEach(ey => { ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none'; });
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-46, -478], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [46, -478], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-25, -292]);
        legs.place(legs.legs.r, legR[0], legR[1], [25, -292]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= WARGA ekstra — siluet beda-beda (aturan variasi) ===== */
  const IbuTua = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#c08a58', hair: '#b8b2a4', top: '#5c4632', kain: '#4a3b52', shoe: '#241a10' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 78, ry: 11, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 132, L2: 124, wO: 34, wF: 28, cloth: C.skin, shoe: C.shoe });
    E('path', { d: 'M-58,-268 L58,-268 L70,-40 L-70,-40 Z', fill: C.kain, ...st(4) }, g); // kain panjang
    const up = E('g', {}, g);
    E('path', { d: 'M-52,-452 C-58,-396 -56,-322 -52,-262 L52,-262 C56,-322 58,-396 52,-452 Q0,-472 -52,-452Z', fill: C.top, ...st(4) }, up);
    const kit = armKit(up, { L1: 104, L2: 94, wO: 33, wF: 27, shirt: C.top, shirtD: '#483826', skin: C.skin });
    E('rect', { x: -13, y: -476, width: 26, height: 34, rx: 7, fill: C.skin, ...st(3) }, up);
    const head = E('g', {}, up), hg = E('g', {}, head);
    E('circle', { cx: 30, cy: -540, r: 16, fill: C.hair, ...st(3) }, hg); // sanggul abu
    E('circle', { cx: 0, cy: -506, r: 58, fill: C.skin, ...st(4) }, hg);
    E('path', { d: 'M-58,-506 C-61,-550 -32,-572 0,-572 C34,-572 60,-548 58,-506 C52,-534 32,-542 12,-540 C-16,-542 -42,-532 -50,-516 C-54,-522 -57,-514 -58,-506Z', fill: C.hair, ...st(3) }, hg);
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 21},-512)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 6, ry: 8.5, fill: '#241610' }, open);
      const shut = E('path', { d: 'M-8,2 Q0,-5 8,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    E('path', { d: 'M-10,-470 Q0,-465 10,-470', fill: 'none', ...st(3.5, '#8a3b34') }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [18, -20], ra = [16, -18], headR = 0, blink = false, legL = [0, 4], legR = [0, 4], point = null } = o;
        up.setAttribute('transform', 'rotate(5 0 -260)');
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -440)`);
        eyes.forEach(ey => { ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none'; });
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-50, -412], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [50, -412], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-23, -262]);
        legs.place(legs.legs.r, legR[0], legR[1], [23, -262]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  const LelakiKurus = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { skin: '#bd8256', hair: '#14100c', shirt: '#44503c', shirtD: '#333d2d', pants: '#26221c', shoe: '#17100b' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 6, rx: 74, ry: 11, fill: '#000', opacity: .28 }, g);
    const legs = legKit(g, { L1: 178, L2: 168, wO: 36, wF: 28, cloth: C.pants, shoe: C.shoe });
    E('path', { d: 'M-38,-540 C-43,-470 -42,-396 -38,-340 L38,-340 C42,-396 43,-470 38,-540 Q0,-556 -38,-540Z', fill: C.shirt, ...st(4) }, g);
    const kit = armKit(g, { L1: 132, L2: 122, wO: 33, wF: 26, shirt: C.shirt, shirtD: C.shirtD, skin: C.skin });
    E('rect', { x: -12, y: -592, width: 24, height: 58, rx: 7, fill: C.skin, ...st(3) }, g); // leher panjang
    const head = E('g', {}, g), hg = E('g', {}, head);
    E('ellipse', { cx: 0, cy: -652, rx: 52, ry: 62, fill: C.skin, ...st(4) }, hg);
    E('path', { d: 'M-54,-668 C-52,-706 -26,-722 0,-722 C28,-722 52,-704 54,-668 C44,-690 24,-696 2,-694 C-24,-696 -44,-688 -50,-674 Z', fill: C.hair, ...st(3) }, hg);
    E('path', { d: 'M-56,-690 L56,-690 L56,-676 L-56,-676 Z', fill: '#10131c', ...st(3) }, hg); // topi pet
    E('rect', { x: 8, y: -692, width: 62, height: 12, rx: 6, fill: '#10131c', ...st(3) }, hg); // lidah topi
    const eyes = [-1, 1].map(sd => {
      const e = E('g', { transform: `translate(${sd * 19},-656)` }, hg);
      const open = E('g', {}, e);
      E('ellipse', { cx: 0, cy: 0, rx: 6, ry: 9, fill: '#241610' }, open);
      E('circle', { cx: 2, cy: -3, r: 2, fill: '#fff' }, open);
      const shut = E('path', { d: 'M-8,2 Q0,-5 8,2', fill: 'none', ...st(3.5, '#241610') }, e);
      return { e, open, shut };
    });
    const brows = [-1, 1].map(sd => E('path', { d: `M${sd * 10},-678 Q${sd * 19},-682 ${sd * 29},-678`, fill: 'none', ...st(3.5, '#3a2718') }, hg));
    E('path', { d: 'M-10,-614 Q0,-609 10,-614', fill: 'none', ...st(3.5, '#8a3b34') }, hg);
    const api = {
      g: root, hands: {},
      set(o = {}) {
        const { la = [16, -18], ra = [15, -17], headR = 0, blink = false, fear = 0, legL = [0, 4], legR = [0, 4], point = null } = o;
        head.setAttribute('transform', `rotate(${headR.toFixed(2)} 0 -540)`);
        eyes.forEach(ey => { ey.open.style.display = blink ? 'none' : ''; ey.shut.style.display = blink ? '' : 'none'; });
        brows.forEach((b, i) => {
          const sd = i === 0 ? -1 : 1, up = fear * 7;
          b.setAttribute('d', `M${sd * 10},${(-678 - up).toFixed(0)} Q${sd * 19},${(-682 - up).toFixed(0)} ${sd * 29},-678`);
        });
        api.hands.l = kit.place(kit.arms.l, la[0], la[1], [-37, -496], point === 'l');
        api.hands.r = kit.place(kit.arms.r, ra[0], ra[1], [37, -496], point === 'r');
        legs.place(legs.legs.l, legL[0], legL[1], [-21, -340]);
        legs.place(legs.legs.r, legR[0], legR[1], [21, -340]);
      }
    };
    api.set();
    tr(root, x, y, s);
    return api;
  };

  /* ================= ANJING tetangga — telinga tegak, hidung ke ATAS saat merengek ===== */
  const Dog = (p, { x = 0, y = 0, s = 1 } = {}) => {
    const C = { fur: '#6b4a2e', furD: '#54391f', ear: '#3d2812' };
    const root = E('g', {}, p), g = E('g', {}, root);
    E('ellipse', { cx: 0, cy: 4, rx: 120, ry: 11, fill: '#000', opacity: .28 }, g);
    // kaki
    [[-78, 0], [-52, 0], [58, 0], [84, 0]].forEach(([lx]) => E('path', { d: `M${lx},-96 L${lx},-6`, stroke: C.furD, 'stroke-width': 17, 'stroke-linecap': 'round' }, g));
    // badan
    E('path', { d: 'M-118,-128 C-126,-186 -90,-214 -30,-218 L44,-218 C100,-214 122,-182 112,-128 C90,-104 -80,-104 -118,-128Z', fill: C.fur, ...st(4) }, g);
    E('ellipse', { cx: -20, cy: -168, rx: 44, ry: 26, fill: C.furD, opacity: .55 }, g); // belang punggung
    // ekor (grup, poros di pangkal)
    const tail = E('g', {}, g);
    E('path', { d: 'M-112,-196 C-146,-216 -152,-252 -138,-276', fill: 'none', stroke: C.fur, 'stroke-width': 15, 'stroke-linecap': 'round' }, tail);
    // kepala (grup berporos di leher (96,-186)): hidung bisa naik menatap langit
    const headG = E('g', {}, g);
    E('path', { d: 'M78,-206 L128,-196 L132,-150 L84,-146 Z', fill: C.fur, ...st(3.5) }, headG); // leher
    E('ellipse', { cx: 148, cy: -196, rx: 46, ry: 38, fill: C.fur, ...st(4) }, headG);
    E('path', { d: 'M176,-186 L216,-172 L214,-148 L172,-152 Z', fill: C.furD, ...st(3.5) }, headG); // moncong
    E('ellipse', { cx: 216, cy: -160, rx: 10, ry: 8, fill: '#120c06' }, headG); // hidung
    const earL = E('path', { d: 'M118,-224 L108,-268 L138,-240 Z', fill: C.ear, ...st(3) }, headG);
    const earR = E('path', { d: 'M158,-230 L162,-274 L184,-238 Z', fill: C.ear, ...st(3) }, headG);
    E('circle', { cx: 158, cy: -200, r: 6.5, fill: '#120c06' }, headG); // mata
    const mouth = E('path', { d: 'M186,-146 Q202,-142 212,-146', fill: 'none', ...st(3, '#2c1a0c') }, headG);
    const api = {
      g: root,
      set(o = {}) {
        const { headUp = 0, tailWag = 0, tremble = 0, t = 0 } = o;
        headG.setAttribute('transform', `rotate(${(-headUp * 44 + Math.sin(t * 31) * tremble * 1.6).toFixed(2)} 96 -186)`);
        tail.setAttribute('transform', `rotate(${(tailWag * 16 * Math.sin(t * 7)).toFixed(2)} -112 -196)`);
        mouth.setAttribute('d', headUp > .4 ? 'M184,-144 Q200,-134 214,-144' : 'M186,-146 Q202,-142 212,-146');
      }
    };
    api.set({});
    tr(root, x, y, s);
    return api;
  };

  /* ================= SET TAMBAHAN (aturan variasi: latar beda per beat) ===== */
  // pagar jeruju generik: tiang + rel + semak berduri; gap = [x0,x1] celah terbuka
  function jeruju(shot, seed, gap = null) {
    const fc = E('g', {}, shot);
    for (let x = 24; x <= 1056; x += 86) { if (gap && x > gap[0] - 10 && x < gap[1]) continue; E('rect', { x, y: 1392, width: 13, height: 70, fill: '#14100c' }, fc); }
    const rail = (y) => { if (gap) { E('path', { d: `M14,${y} L${gap[0]},${y} M${gap[1]},${y} L1068,${y}`, stroke: '#14100c', 'stroke-width': 8 }, fc); } else E('path', { d: `M14,${y} L1068,${y}`, stroke: '#14100c', 'stroke-width': 8 }, fc); };
    rail(1416); rail(1442);
    const r = P.rng(seed);
    [110, 268, 428, 588, 748, 908].forEach((bx, bi) => {
      if (gap && bx > gap[0] - 60 && bx < gap[1] + 40) return;
      const b = E('g', { transform: `translate(${bx},1452)` }, fc);
      [[-26, -18, 34], [8, -30, 44], [34, -14, 30]].forEach(([cx, cy, rr]) => E('circle', { cx, cy, r: rr, fill: '#0a1c11' }, b));
      const rb = P.rng(seed * 31 + bi * 17);
      for (let i = 0; i < 13; i++) {
        const a = -Math.PI * (0.02 + rb() * 0.96), len = 24 + rb() * 22, sx = (rb() - .5) * 56, sy = -34 + rb() * 22;
        E('path', { d: `M${sx.toFixed(0)},${sy.toFixed(0)} L${(sx + Math.cos(a) * len).toFixed(0)},${(sy + Math.sin(a) * len * .8).toFixed(0)}`, stroke: '#46684a', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, b);
      }
    });
    return fc;
  }
  const stars = (shot, seed, n = 42, yMax = 760) => {
    const r = P.rng(seed);
    for (let i = 0; i < n; i++) E('circle', { cx: (r() * 1180 - 50).toFixed(0), cy: (r() * yMax).toFixed(0), r: (.8 + r() * 1.7).toFixed(1), fill: '#dfe9f5', opacity: (.2 + r() * .5).toFixed(2) }, shot);
  };
  const moonAt = (shot, mx, my, mr = 62) => {
    E('circle', { cx: mx, cy: my, r: mr * 2.4, fill: 'url(#moonHalo)' }, shot);
    E('circle', { cx: mx, cy: my, r: mr, fill: '#e6eef7' }, shot);
    E('circle', { cx: mx - mr * .3, cy: my - mr * .3, r: mr * .16, fill: '#c9d6e4', opacity: .5 }, shot);
    E('circle', { cx: mx + mr * .3, cy: my + mr * .35, r: mr * .11, fill: '#c9d6e4', opacity: .45 }, shot);
  };

  // KEBUN BELAKANG — pohon pisang, bale bambu, tepi atap rumah jauh
  function gardenSet(shot, seed) {
    const r = P.rng(seed);
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#skyGrad)' }, shot);
    stars(shot, seed + 3, 30, 620);
    moonAt(shot, 236, 250, 48);
    E('path', { d: 'M700,1420 L700,1330 L830,1272 L960,1330 L960,1420 Z', fill: '#0c1424' }, shot); // atap jauh
    const fog1 = E('ellipse', { cx: 340, cy: 1290, rx: 420, ry: 42, fill: '#aebfd8', opacity: .10, filter: P.blur(shot, 18) }, shot);
    const fog2 = E('ellipse', { cx: 820, cy: 1370, rx: 500, ry: 54, fill: '#aebfd8', opacity: .12, filter: P.blur(shot, 22) }, shot);
    E('rect', { x: -320, y: GY, width: 1720, height: 1000, fill: 'url(#gndGrad)' }, shot);
    const banana = (bx, bs) => {
      const b = E('g', { transform: `translate(${bx},${GY}) scale(${bs})` }, shot);
      E('path', { d: 'M-13,0 C-9,-160 -11,-300 -4,-430 L12,-430 C8,-300 10,-160 13,0 Z', fill: '#12241a' }, b);
      [[-1, -428, -52], [1, -428, 52], [-1, -440, -18], [1, -440, 20], [0, -448, 0]].forEach(([sd, ly, tilt]) => {
        E('path', { d: `M0,${ly} C${sd * 90},${ly - 46} ${sd * 190},${ly - 30} ${sd * 252},${ly + 44}`, fill: 'none', stroke: '#16301f', 'stroke-width': 30, 'stroke-linecap': 'round', transform: `rotate(${tilt * .3} 0 ${ly})` }, b);
      });
      E('circle', { cx: 16, cy: -392, r: 15, fill: '#0e2013' }, b); // jantung pisang
    };
    banana(120, 1.06); banana(948, .92); banana(660, .66);
    // bale bambu (tempat duduk jaga)
    const bl = E('g', {}, shot);
    E('rect', { x: 300, y: 1330, width: 300, height: 26, rx: 6, fill: '#241a10' }, bl);
    [[316, 0], [568, 0]].forEach(([lx]) => E('rect', { x: lx, y: 1356, width: 16, height: 64, fill: '#1a120a' }, bl));
    for (let i = 0; i < 5; i++) E('path', { d: `M${312 + i * 58},1332 L${312 + i * 58},1354`, stroke: '#120c06', 'stroke-width': 4 }, bl);
    // rumpun rumput
    for (let i = 0; i < 9; i++) { const gx = r() * 1040 + 20, gh = 26 + r() * 30; E('path', { d: `M${gx},${GY + 8} Q${gx + 8},${GY - gh} ${gx + 16},${GY + 6} M${gx + 8},${GY + 8} Q${gx + 12},${GY - gh * .7} ${gx + 22},${GY + 4}`, fill: 'none', stroke: '#14251a', 'stroke-width': 5, 'stroke-linecap': 'round' }, shot); }
    return { fog1, fog2 };
  }

  // PANORAMA ATAP — untuk adegan kuyang berputar (tanpa tokoh berdiri)
  function roofSet(shot, seed) {
    const r = P.rng(seed);
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#skyGrad)' }, shot);
    stars(shot, seed + 5, 52, 900);
    moonAt(shot, 268, 268, 56);
    const fog1 = E('ellipse', { cx: 560, cy: 1060, rx: 560, ry: 50, fill: '#aebfd8', opacity: .09, filter: P.blur(shot, 20) }, shot);
    // barisan atap jauh
    E('path', { d: 'M-80,1240 L60,1150 L200,1240 L330,1240 L330,1170 L470,1090 L610,1170 L610,1240 L760,1240 L760,1180 L900,1104 L1040,1180 L1040,1240 L1160,1240 L1160,1500 L-80,1500 Z', fill: '#0a1220' }, shot);
    E('path', { d: 'M470,1090 L486,1006 L502,1090 Z', fill: '#0a1220' }, shot); // cerobong
    E('path', { d: 'M846,1104 L846,1010 L884,1010 L884,1104 Z', fill: '#0a1220' }, shot); // tangki air
    // satu jendela hangat kecil di atap jauh
    E('rect', { x: 388, y: 1186, width: 30, height: 38, fill: '#ffb45e', opacity: .85 }, shot);
    // atap besar depan (lantai adegan terbang)
    const rf = E('g', {}, shot);
    E('path', { d: 'M-320,1920 L-320,1560 L300,1330 L920,1560 L1400,1420 L1400,1920 Z', fill: '#0d1322' }, rf);
    for (let i = 0; i < 7; i++) E('path', { d: `M${-240 + i * 30},${1660 - i * 34} L${620 + i * 26},${1420 - i * 30}`, stroke: '#060a14', 'stroke-width': 7, opacity: .7 }, rf);
    E('path', { d: 'M300,1330 L920,1560', stroke: '#1c2942', 'stroke-width': 9 }, rf); // bubungan
    return { fog1 };
  }

  // INTERIOR rumah Bu Sari — hangat, lampu gantung, ayunan bayi, jendela malam
  function interiorSet(shot, seed) {
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: '#170f14' }, shot);
    E('rect', { x: -320, y: -320, width: 1720, height: 1740, fill: '#241820' }, shot); // dinding
    for (let i = 0; i < 6; i++) E('path', { d: `M-320,${240 + i * 210} L1400,${240 + i * 210}`, stroke: '#170f16', 'stroke-width': 6, opacity: .55 }, shot);
    E('rect', { x: -320, y: GY, width: 1720, height: 1000, fill: '#120a10' }, shot); // lantai
    for (let i = 0; i < 5; i++) E('path', { d: `M${-200 + i * 330},${GY} L${-80 + i * 330},1920`, stroke: '#0a060a', 'stroke-width': 5, opacity: .6 }, shot);
    // jendela (malam di luar) kiri
    const wn = E('g', {}, shot);
    E('rect', { x: 108, y: 420, width: 250, height: 330, fill: '#0d1830' }, wn);
    E('circle', { cx: 300, cy: 492, r: 26, fill: '#e6eef7', opacity: .9 }, wn);
    const curtain = E('path', { d: 'M108,420 L168,420 C160,520 160,640 170,750 L108,750 Z', fill: '#3a2030', opacity: .95 }, wn);
    E('path', { d: 'M298,420 L358,420 L358,750 L300,750 C308,640 308,520 298,420Z', fill: '#3a2030', opacity: .95 }, wn);
    E('rect', { x: 108, y: 420, width: 250, height: 330, fill: 'none', stroke: '#0a060a', 'stroke-width': 12 }, wn);
    E('path', { d: 'M233,420 L233,750 M108,585 L358,585', stroke: '#0a060a', 'stroke-width': 8 }, wn);
    // lampu gantung tengah
    const lamp = E('g', {}, shot);
    E('path', { d: 'M540,-320 L540,300', stroke: '#0a060a', 'stroke-width': 7 }, lamp);
    E('circle', { cx: 540, cy: 430, r: 190, fill: 'url(#lampGrad)' }, lamp);
    E('path', { d: 'M478,330 L602,330 L576,402 L504,402 Z', fill: '#2c1c10', ...st(3.5) }, lamp);
    E('circle', { cx: 540, cy: 416, r: 21, fill: '#ffd9a0' }, lamp);
    // ayunan bayi (kanan): kotak + kain + kaki lengkung
    const cr = E('g', {}, shot);
    E('path', { d: 'M742,1420 C780,1360 940,1360 978,1420', fill: 'none', stroke: '#2c1c10', 'stroke-width': 13, 'stroke-linecap': 'round' }, cr);
    E('rect', { x: 756, y: 1180, width: 208, height: 118, rx: 14, fill: '#33241a', ...st(4) }, cr);
    E('ellipse', { cx: 860, cy: 1186, rx: 92, ry: 26, fill: '#c8b393', ...st(3) }, cr);
    E('circle', { cx: 806, cy: 1172, r: 17, fill: '#e8b98d', ...st(3) }, cr); // kepala bayi di ayunan
    E('path', { d: 'M756,1240 L964,1240 M756,1272 L964,1272', stroke: '#241708', 'stroke-width': 5 }, cr);
    // meja rendah + gelas + tikar
    E('rect', { x: 120, y: 1330, width: 210, height: 20, rx: 6, fill: '#2c1c10' }, shot);
    E('rect', { x: 140, y: 1350, width: 16, height: 70, fill: '#20140a' }, shot);
    E('rect', { x: 294, y: 1350, width: 16, height: 70, fill: '#20140a' }, shot);
    E('path', { d: 'M196,1292 L226,1292 L222,1330 L200,1330 Z', fill: '#7a8a96', opacity: .8, ...st(2.5) }, shot);
    E('path', { d: 'M330,1560 L760,1560 L820,1760 L280,1760 Z', fill: '#3d2c1a', opacity: .8 }, shot); // tikar
    return { lamp, curtain };
  }

  // HALAMAN SIANG — rumah LAIN (kiri, lebih kecil), pagar bambu polos, jemuran
  function dayYard(shot, seed) {
    const r = P.rng(seed);
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#daySkyGrad)' }, shot);
    E('circle', { cx: 902, cy: 240, r: 66, fill: '#fff3c4' }, shot);
    E('circle', { cx: 902, cy: 240, r: 120, fill: '#ffedb5', opacity: .35, filter: P.blur(shot, 16) }, shot);
    [[240, 210, 74], [420, 168, 54], [700, 300, 60]].forEach(([cx, cy, cr2]) => {
      E('ellipse', { cx, cy, rx: cr2, ry: cr2 * .36, fill: '#ffffff', opacity: .85 }, shot);
      E('ellipse', { cx: cx + cr2 * .5, cy: cy + 8, rx: cr2 * .7, ry: cr2 * .3, fill: '#ffffff', opacity: .7 }, shot);
    });
    E('rect', { x: -320, y: GY, width: 1720, height: 1000, fill: 'url(#dayGndGrad)' }, shot);
    for (let i = 0; i < 8; i++) E('ellipse', { cx: (r() * 1100).toFixed(0), cy: (1480 + r() * 380).toFixed(0), rx: (60 + r() * 110).toFixed(0), ry: (22 + r() * 36).toFixed(0), fill: '#4a7a3a', opacity: (.16 + r() * .1).toFixed(2) }, shot);
    // rumah kecil kiri (BEDA dari rumah Bu Sari: dinding abu-teal, atap lebih landai)
    const hs = E('g', {}, shot);
    E('path', { d: 'M60,1050 L300,940 L540,1050 Z', fill: '#33454c' }, hs);
    E('path', { d: 'M36,1050 L300,916 L564,1050 L528,1050 L300,946 L72,1050 Z', fill: '#5c4632' }, hs);
    E('rect', { x: 66, y: 1044, width: 468, height: 378, fill: '#47626b' }, hs);
    for (let i = 0; i < 5; i++) E('path', { d: `M${126 + i * 88},1048 L${126 + i * 88},1418`, stroke: '#38505a', 'stroke-width': 5, opacity: .7 }, hs);
    E('rect', { x: 130, y: 1140, width: 110, height: 140, fill: '#bcd6de' }, hs); // jendela siang
    E('rect', { x: 130, y: 1140, width: 110, height: 140, fill: 'none', stroke: '#2c3e44', 'stroke-width': 9 }, hs);
    E('rect', { x: 392, y: 1130, width: 74, height: 292, fill: '#2c2016' }, hs); // pintu
    // pagar bambu polos (tanpa duri — rumah ini BUKAN rumah yang dipagari jeruju)
    const fc = E('g', {}, shot);
    for (let x = 600; x <= 1060; x += 46) E('rect', { x, y: 1330, width: 15, height: 128, rx: 6, fill: '#8a6f42' }, fc);
    E('path', { d: 'M596,1366 L1072,1366 M596,1418 L1072,1418', stroke: '#755c34', 'stroke-width': 9 }, fc);
    // jemuran
    E('path', { d: 'M640,1050 L640,1420 M1020,1010 L1020,1420 M640,1072 L1020,1032', stroke: '#5c4a2c', 'stroke-width': 6 }, shot);
    const cloth1 = E('path', { d: 'M690,1068 L790,1062 L786,1170 L694,1176 Z', fill: '#a03c31', opacity: .92 }, shot);
    const cloth2 = E('path', { d: 'M850,1056 L940,1050 L944,1146 L854,1152 Z', fill: '#d8d2c2', opacity: .92 }, shot);
    E('path', { d: 'M470,1920 L520,1420 L640,1420 L760,1920 Z', fill: '#7a9a52', opacity: .5 }, shot); // jalan setapak
    return { cloth1, cloth2 };
  }

  // JALAN DESA — 3 rumah beda bentuk, tiang lampu, warung
  function streetSet(shot, seed) {
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#skyGrad)' }, shot);
    stars(shot, seed + 7, 34, 640);
    moonAt(shot, 940, 230, 44);
    const fog1 = E('ellipse', { cx: 420, cy: 1300, rx: 460, ry: 44, fill: '#aebfd8', opacity: .10, filter: P.blur(shot, 18) }, shot);
    // rumah kiri kecil
    E('path', { d: 'M-40,1120 L110,1030 L260,1120 Z', fill: '#101725' }, shot);
    E('rect', { x: -30, y: 1114, width: 280, height: 240, fill: '#131a29' }, shot);
    E('rect', { x: 60, y: 1180, width: 52, height: 66, fill: '#ffb45e', opacity: .8 }, shot);
    // warung tengah (tenda miring)
    E('rect', { x: 380, y: 1160, width: 300, height: 194, fill: '#16202f' }, shot);
    E('path', { d: 'M360,1160 L700,1160 L660,1096 L400,1096 Z', fill: '#0b1220' }, shot);
    E('rect', { x: 420, y: 1210, width: 90, height: 80, fill: '#ffb45e', opacity: .55 }, shot);
    // rumah kanan lebih tinggi
    E('path', { d: 'M790,1060 L940,960 L1090,1060 Z', fill: '#0d1524' }, shot);
    E('rect', { x: 800, y: 1054, width: 280, height: 300, fill: '#111a2a' }, shot);
    E('rect', { x: 980, y: 1130, width: 48, height: 60, fill: '#2c3e55' }, shot);
    // tiang lampu + cahaya
    const lampGlow = E('circle', { cx: 724, cy: 1006, r: 120, fill: 'url(#lampGrad)' }, shot);
    E('rect', { x: 718, y: 1000, width: 11, height: 420, fill: '#0a0f18' }, shot);
    E('circle', { cx: 724, cy: 996, r: 13, fill: '#ffd9a0' }, shot);
    E('path', { d: 'M660,1420 L724,1000 L790,1420 Z', fill: '#ffd9a0', opacity: .05 }, shot);
    // jalan
    E('rect', { x: -320, y: 1354, width: 1720, height: 1066, fill: '#0a0f16' }, shot);
    E('path', { d: 'M-320,1470 L1400,1470', stroke: '#1a2432', 'stroke-width': 10, 'stroke-dasharray': '70 46' }, shot);
    return { fog1, lampGlow };
  }

  // RUMAH RAKA — beda dari rumah Bu Sari (abu-biru, atap lebih curam), jeruju MENGELILINGI
  function rakaHouseSet(shot, seed) {
    E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#skyGrad)' }, shot);
    stars(shot, seed + 9, 38, 700);
    moonAt(shot, 180, 280, 50);
    const fog1 = E('ellipse', { cx: 320, cy: 1286, rx: 430, ry: 44, fill: '#aebfd8', opacity: .10, filter: P.blur(shot, 18) }, shot);
    const fog2 = E('ellipse', { cx: 810, cy: 1366, rx: 510, ry: 56, fill: '#aebfd8', opacity: .12, filter: P.blur(shot, 22) }, shot);
    E('rect', { x: -320, y: GY, width: 1720, height: 1000, fill: 'url(#gndGrad)' }, shot);
    const hs = E('g', {}, shot);
    E('path', { d: 'M330,1000 L560,830 L790,1000 Z', fill: '#1a2432' }, hs); // gabel curam
    E('path', { d: 'M296,1000 L560,798 L824,1000 L786,1000 L560,836 L334,1000 Z', fill: '#080d16' }, hs);
    E('rect', { x: 336, y: 994, width: 448, height: 428, fill: '#26313d' }, hs);
    for (let i = 0; i < 6; i++) E('path', { d: `M${396 + i * 66},998 L${396 + i * 66},1418`, stroke: '#18222c', 'stroke-width': 5, opacity: .65 }, hs);
    E('rect', { x: 516, y: 1130, width: 88, height: 292, fill: '#0d1218' }, hs); // pintu
    E('rect', { x: 386, y: 1100, width: 84, height: 104, fill: '#0f1a28' }, hs); // jendela gelap
    E('rect', { x: 386, y: 1100, width: 84, height: 104, fill: 'none', stroke: '#0a0e14', 'stroke-width': 8 }, hs);
    E('rect', { x: 660, y: 1100, width: 84, height: 104, fill: '#ffb45e', opacity: .28 }, hs); // jendela lampu redup
    // pohon mangga kanan
    E('path', { d: 'M950,1420 C956,1300 950,1180 930,1080', fill: 'none', stroke: '#0c1424', 'stroke-width': 17, 'stroke-linecap': 'round' }, shot);
    [[880, 1020, 120], [990, 960, 140], [1060, 1040, 110]].forEach(([cx, cy, rr]) => E('circle', { cx, cy, r: rr, fill: '#0a1811', opacity: .95 }, shot));
    jeruju(shot, seed + 21, null); // jeruju mengelilingi — TANPA celah
    return { fog1, fog2 };
  }

  /* ================= PEMBANTU BERSAMA adegan ===== */
  const TL = S.TL;
  const lineT = i => TL.lines[i].t, lineD = i => TL.lines[i].d;
  // kamera sub-shot: pusat (cx,cy) + skala melayang halus dari (s0) ke (s1) selama [a,b]
  const shotCam = (g, t, a, b, cx0, cy0, s0, cx1, cy1, s1) => {
    const k = eio(clamp((t - a) / (b - a)));
    const s = lerp(s0, s1, k);
    tr(g, 540 - s * lerp(cx0, cx1, k), 960 - s * lerp(cy0, cy1, k), s);
  };
  // ambien halaman malam — FASE ABSOLUT (perbaikan temuan sendiri, dipertahankan)
  const ambYard = (set, t) => {
    if (set.fog1) set.fog1.setAttribute('cx', (300 + Math.sin(t * .11) * 36).toFixed(1));
    if (set.fog2) set.fog2.setAttribute('cx', (800 + Math.sin(t * .09 + 2) * 44).toFixed(1));
    if (set.mother) set.mother.setAttribute('transform', `rotate(${(Math.sin(t * .85) * 2.6).toFixed(2)} 856 1236)`);
    if (set.curtainL) set.curtainL.setAttribute('transform', `rotate(${(Math.sin(t * .7 + 1) * 2.2).toFixed(2)} 806 1078)`);
    if (set.glowRect) set.glowRect.setAttribute('opacity', (.9 + .1 * Math.sin(t * 2.3) * Math.sin(t * .53 + 1)).toFixed(3));
  };
  const ambFog = (set, t, bx = 560) => { if (set.fog1) set.fog1.setAttribute('cx', (bx + Math.sin(t * .1 + 1) * 40).toFixed(1)); };
  // sorot senter: kerucut cahaya dari telapak ke titik bidik (diupdate per frame)
  const makeBeam = (shot, op = .10) => {
    const poly = E('polygon', { points: '0,0 0,0 0,0', fill: '#ffe9b0', opacity: op }, shot);
    return {
      el: poly,
      set(Hx, Hy, ax, ay, len = 640, wdt = 130) {
        const dx = ax - Hx, dy = ay - Hy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
        const tx = Hx + ux * len, ty = Hy + uy * len, px = -uy, py = ux;
        poly.setAttribute('points', `${Hx.toFixed(0)},${Hy.toFixed(0)} ${(tx + px * wdt).toFixed(0)},${(ty + py * wdt).toFixed(0)} ${(tx - px * wdt).toFixed(0)},${(ty - py * wdt).toFixed(0)}`);
      }
    };
  };
  // kuyang jauh: siluet redesign + cahaya merah sendiri (mode siluet tak punya aura)
  const farKuyang = (shot) => {
    const g = E('g', {}, shot);
    const glow = E('ellipse', { cx: -6, cy: 66, rx: 92, ry: 108, fill: '#ff4a30', opacity: .16, filter: P.blur(g, 16), transform: 'rotate(18 -6 66)' }, g);
    const k = Kuyang(g, { sil: true });
    return { g, glow, k };
  };
  const setFar = (fk, t, x, y, s, swayAmp = 6) => {
    tr(fk.g, x, y, s, Math.sin(t * 1.3) * 2);
    fk.k.set({ sway: Math.sin(t * 2.4 - 1.1) * swayAmp, hairLag: Math.sin(t * 2.4 - 2) * swayAmp * .7, glowK: .5 });
    fk.glow.setAttribute('opacity', (.13 + .06 * Math.sin(t * 4.7)).toFixed(3));
  };
  // SEPASANG TANGAN menggenggam tali dari atas frame (untuk ECU ikat — rig berdiri
  // TIDAK bisa menjangkau tali di pagar: bahu y948 vs tali y1400, jangkauan lengan
  // 246 < 450. Stills gate ronde 1 membuktikan tangan rig melayang jauh dari tali,
  // jadi ECU ikat memakai prop tangan ini: kontak piksel dijamin oleh konstruksi.)
  const gripHands = (shot, gx, gy, sleeve = '#1f4e52') => {
    const g = E('g', {}, shot);
    const mk = (sx, flip) => {
      const a = E('g', {}, g);
      E('path', { d: `M${sx},${gy - 560} L${gx + flip * 14},${gy - 6}`, stroke: '#141021', 'stroke-width': 40, 'stroke-linecap': 'round' }, a);
      E('path', { d: `M${sx},${gy - 560} L${gx + flip * 14},${gy - 6}`, stroke: sleeve, 'stroke-width': 31, 'stroke-linecap': 'round' }, a);
      E('circle', { cx: gx + flip * 14, cy: gy, r: 21, fill: '#cf9868', ...st(3.5) }, a);
      E('path', { d: `M${gx + flip * 14 - 15},${gy - 8} Q${gx + flip * 14},${gy + 12} ${gx + flip * 14 + 15},${gy - 8}`, fill: 'none', stroke: '#a06a42', 'stroke-width': 4 }, a); // jari melengkung di tali
      return a;
    };
    const al = mk(gx - 185, -1), ar = mk(gx + 175, 1);
    return { set(tug = 0) { al.setAttribute('transform', `translate(0,${(-tug).toFixed(1)})`); ar.setAttribute('transform', `translate(0,${(tug * .7).toFixed(1)})`); } };
  };

  /* ================= DEFS BERSAMA =================
     WAJIB di svg tersendiri yang SELALU dirender (bukan di dalam scene): paint
     server di dalam scene yang display:none TIDAK ter-resolve di scene lain
     (terbukti di stills gate ronde 1: langit siang + glow lampu gelap). */
  const sc0 = scene(world, 'hook', 'cut');
  {
    const defsSvg = E('svg', { width: 0, height: 0, style: 'position:absolute' }, world);
    const SD = E('defs', {}, defsSvg);
    const skyG = E('linearGradient', { id: 'skyGrad', x1: 0, y1: 0, x2: 0, y2: 1 }, SD);
    E('stop', { offset: 0, 'stop-color': '#0a1128' }, skyG); E('stop', { offset: .55, 'stop-color': '#16263f' }, skyG); E('stop', { offset: 1, 'stop-color': '#0a0f1c' }, skyG);
    const gndG = E('linearGradient', { id: 'gndGrad', x1: 0, y1: 0, x2: 0, y2: 1 }, SD);
    E('stop', { offset: 0, 'stop-color': '#131d15' }, gndG); E('stop', { offset: 1, 'stop-color': '#04070a' }, gndG);
    const halo = E('radialGradient', { id: 'moonHalo' }, SD);
    E('stop', { offset: 0, 'stop-color': '#dfe9f5', 'stop-opacity': .34 }, halo); E('stop', { offset: 1, 'stop-color': '#dfe9f5', 'stop-opacity': 0 }, halo);
    const lampG = E('radialGradient', { id: 'lampGrad' }, SD);
    E('stop', { offset: 0, 'stop-color': '#ffca7a', 'stop-opacity': .5 }, lampG); E('stop', { offset: 1, 'stop-color': '#ffca7a', 'stop-opacity': 0 }, lampG);
    const dayS = E('linearGradient', { id: 'daySkyGrad', x1: 0, y1: 0, x2: 0, y2: 1 }, SD);
    E('stop', { offset: 0, 'stop-color': '#7fb2dd' }, dayS); E('stop', { offset: .6, 'stop-color': '#bcd9ee' }, dayS); E('stop', { offset: 1, 'stop-color': '#dcebf2' }, dayS);
    const dayG = E('linearGradient', { id: 'dayGndGrad', x1: 0, y1: 0, x2: 0, y2: 1 }, SD);
    E('stop', { offset: 0, 'stop-color': '#5d8a48' }, dayG); E('stop', { offset: 1, 'stop-color': '#2e4a26' }, dayG);
    const dwn = E('linearGradient', { id: 'dawnGrad', x1: 0, y1: 0, x2: 0, y2: 1 }, SD);
    E('stop', { offset: 0, 'stop-color': '#1c2a4a', 'stop-opacity': .25 }, dwn); E('stop', { offset: .62, 'stop-color': '#7a4a3a', 'stop-opacity': .18 }, dwn); E('stop', { offset: .8, 'stop-color': '#e88a4a', 'stop-opacity': .38 }, dwn); E('stop', { offset: 1, 'stop-color': '#0a0f1c', 'stop-opacity': 0 }, dwn);
  }

  /* ================= S0 HOOK (L0) — staging adegan tes v1 + kuyang REDESIGN ================= */
  {
    const sc = sc0;
    const shotA = E('g', {}, sc.cam), shotB = E('g', {}, sc.cam), shotC = E('g', {}, sc.cam);
    const setA = nightYard(shotA, 31);
    const kuyA = farKuyang(shotA);
    const rakaA = Raka(shotA, { x: 118, y: GY, s: .98 });
    const darA = Darma(shotA, { x: 296, y: GY, s: .98 });
    const senA = makeSenter(rakaA.g);
    fgLeaves(shotA);
    const setB = nightYard(shotB, 47);
    const rakaB = Raka(shotB, { x: 428, y: GY, s: .98 });
    const darB = Darma(shotB, { x: 612, y: GY, s: .98 });
    const senB = makeSenter(rakaB.g);
    fgThorns(shotB);
    const setC = nightYard(shotC, 63);
    const glowTop = E('ellipse', { cx: 860, cy: 1006, rx: 190, ry: 54, fill: '#ff4a30', opacity: 0, filter: P.blur(shotC, 14) }, shotC);
    fgRoof(shotC); fgThorns(shotC);
    const gradeC = E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: '#01020a', opacity: 0 }, shotC);
    const cut1 = T('L0%33'), cut2 = T('L0%66');
    const mixA = (A, B, e) => [lerp(A[0], B[0], e), lerp(A[1], B[1], e)];
    during('hook', 'hooke', (t) => {
      const inB = t >= cut1 && t < cut2, inC = t >= cut2;
      shotA.style.display = inB || inC ? 'none' : '';
      shotB.style.display = inB ? '' : 'none';
      shotC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        ambYard(setA, t);
        const wk = clamp((t - .25) / .95), xe = 1 - Math.pow(1 - wk, 2);
        const stopF = 1 - clamp((t - 1.18) / .25);
        const ph = (t - .25) * TAU * .78;
        const bob = Math.abs(Math.sin(ph)) * 11 * stopF + Math.sin(t * 1.9) * 1.1;
        const wl = walkLeg(ph), wr = walkLeg(ph + Math.PI);
        rakaA.set({
          la: [20 + Math.sin(ph) * 13 * stopF, -22], ra: [17 - Math.sin(ph) * 5 * stopF, -20],
          headR: 11 * eio(clamp((t - 1.22) / .4)) + Math.sin(t * 1.9) * .4, blink: blinkAt(t, .3),
          legL: [wl[0] * stopF, 4 + (wl[1] - 4) * stopF], legR: [wr[0] * stopF, 4 + (wr[1] - 4) * stopF]
        });
        tr(rakaA.g, lerp(118, 428, xe), GY - bob, .98);
        senA.set(rakaA.hands.r, -14 + Math.sin(ph) * 3 * stopF);
        const wd = clamp((t - .37) / .95), xed = 1 - Math.pow(1 - wd, 2);
        const phd = (t - .37) * TAU * .78;
        const bobd = Math.abs(Math.sin(phd)) * 9 * stopF + Math.sin(t * 1.7 + 1) * 1;
        const dl = walkLeg(phd), dr = walkLeg(phd + Math.PI);
        darA.set({
          la: [18 + Math.sin(phd) * 12 * stopF, -22], ra: [18 - Math.sin(phd) * 12 * stopF, -22],
          headR: -7 * eio(clamp((t - 1.28) / .35)), blink: blinkAt(t, 1.7),
          legL: [dl[0] * stopF, 4 + (dl[1] - 4) * stopF], legR: [dr[0] * stopF, 4 + (dr[1] - 4) * stopF]
        });
        tr(darA.g, lerp(296, 612, xed), GY - bobd, .98);
        // kilasan kuyang (REDESIGN, siluet) melintasi bulan — rendah, organ berayun tertinggal
        const tg = clamp((t - .72) / .78);
        if (tg > 0 && tg < 1) {
          kuyA.g.style.display = '';
          setFar(kuyA, t, lerp(798, 962, tg), lerp(252, 322, tg) - Math.sin(tg * Math.PI) * 8 + Math.sin(t * 7.3) * 3, .52);
          kuyA.g.setAttribute('opacity', (clamp(tg / .1) * clamp((1 - tg) / .18)).toFixed(2));
        } else kuyA.g.style.display = 'none';
        // kamera shot A = bentuk transform adegan tes persis (pusat (540,1330) memetakan
        // ke layar (540,1330), BUKAN ke tengah frame — kalau dipetakan ke 960, bulan +
        // lintasan kuyang jatuh DI LUAR frame atas; terbukti di stills gate ronde 1)
        const ka = clamp((t - (lineT(0) - .14)) / (cut1 - (lineT(0) - .14))), sa = 1.12 + .05 * eio(ka);
        shotA.setAttribute('transform', `translate(540,1330) scale(${sa.toFixed(4)}) translate(-540,-1330)`);
      } else if (inB) {
        ambYard(setB, t);
        const rakaHead = 11 + 5 * eio(clamp((t - 1.86) / .5)) + 3 * eio(clamp((t - 2.62) / .35));
        const rakaShock = .3 * clamp((t - 2.2) / .3) - .12 * clamp((t - 2.8) / .3);
        rakaB.set({ la: [20, -22], ra: [17, -20], headR: rakaHead, shock: Math.max(0, rakaShock), fear: .3, blink: blinkAt(t, .3) });
        senB.set(rakaB.hands.r, -14);
        // Darma menunjuk ATAP: ancang -> angkat+tunjuk -> TAHAN -> lepas sebagian (3 ketuk)
        let raD, headD, pointD = null;
        if (t < 1.76) { raD = [18, -22]; headD = -7; }
        else if (t < 1.88) { const e = eio((t - 1.76) / .12); raD = mixA([18, -22], [10, -30], e); headD = lerp(-7, -4, e); }
        else if (t < 2.32) { const e = eio((t - 1.88) / .44); raD = mixA([10, -30], [112, 10], e); headD = lerp(-4, -14, e); if (t > 2.02) pointD = 'r'; }
        else if (t < 2.68) { raD = [112 + Math.sin(t * 13) * .8, 10]; headD = -14; pointD = 'r'; }
        else { const e = eio((t - 2.68) / .31); raD = mixA([112, 10], [56, -6], e); headD = lerp(-14, -10, e); if (t < 2.76) pointD = 'r'; }
        darB.set({ la: [18, -22], ra: raD, headR: headD, fear: .35, blink: blinkAt(t, 1.7), point: pointD });
        shotCam(shotB, t, cut1, cut2, 566, 838, 1.55, 566, 838, 1.68);
      } else {
        ambYard(setC, t);
        gradeC.setAttribute('opacity', (.12 * clamp((t - 4.08) / .4)).toFixed(3));
        glowTop.setAttribute('opacity', (.16 * clamp((t - 3.86) / .3) * (1 - clamp((t - 4.34) / .25))).toFixed(3));
        shotCam(shotC, t, cut2, lineT(0) + lineD(0) + .16, 860, 1154, 2.28, 860, 1154, 2.36);
      }
    });
  }

  /* ================= S1 DARMA1 (L1) — Darma menamai kuyang ================= */
  {
    const sc = scene(world, 'darma1', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const setA = nightYard(gA, 71); const rakaA = Raka(gA, { x: 428, y: GY, s: .98 }); const darA = Darma(gA, { x: 612, y: GY, s: .98 }); const senA = makeSenter(rakaA.g); fgLeaves(gA);
    const setB = nightYard(gB, 83); const darB = Darma(gB, { x: 612, y: GY, s: .98 }); const rakaB = Raka(gB, { x: 428, y: GY, s: .98 }); fgThorns(gB);
    const setC = nightYard(gC, 97); const rakaC = Raka(gC, { x: 428, y: GY, s: .98 }); const glowC2 = E('ellipse', { cx: 428, cy: 560, rx: 260, ry: 60, fill: '#ff4a30', opacity: 0, filter: P.blur(gC, 18) }, gC); fgRoof(gC);
    const c1 = T('L1%40'), c2 = T('L1%72'), a0 = lineT(1) - .11, b0 = lineT(1) + lineD(1) + .16;
    // gestur bicara Darma 3 ketuk (tangan kiri terbuka): angkat di awal frasa, ketuk, ketuk
    const beat = (t, t0) => Math.sin(clamp((t - t0) / .3) * Math.PI);
    during('darma1', 'darma1e', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      const gest = beat(t, lineT(1) + .1) * 14 + beat(t, lineT(1) + 1.9) * 12 + beat(t, lineT(1) + 3.3) * 10;
      if (!inB && !inC) {
        ambYard(setA, t);
        darA.set({ la: [18 - gest, -22 - gest * .6], ra: [18, -22], headR: -4 + Math.sin(t * 1.7) * 1.2, blink: blinkAt(t, 1.7) });
        rakaA.set({ la: [20, -22], ra: [17, -20], headR: 8, blink: blinkAt(t, .3) });
        senA.set(rakaA.hands.r, -14);
        shotCam(gA, t, a0, c1, 520, 1150, 1.14, 520, 1150, 1.19);
      } else if (inB) {
        ambYard(setB, t);
        const pt = t > lineT(1) + 2.55 && t < lineT(1) + 3.3;
        darB.set({ la: [10 - gest * .5, -28], ra: pt ? [104, 6] : [18, -22], headR: pt ? -15 : -5, fear: .3, blink: blinkAt(t, 1.7), point: pt ? 'r' : null });
        rakaB.set({ la: [20, -22], ra: [17, -20], headR: 12, blink: blinkAt(t, .3) });
        shotCam(gB, t, c1, c2, 612, 838, 1.58, 612, 838, 1.68);
      } else {
        ambYard(setC, t);
        const sh = clamp((t - (lineT(1) + 3.72)) / .35);
        rakaC.set({ la: [20, -22], ra: [17, -20], headR: 13, shock: sh * .8, fear: .45, blink: blinkAt(t, .3) });
        glowC2.setAttribute('opacity', (.13 * clamp((t - (lineT(1) + 3.9)) / .4)).toFixed(3));
        glowC2.setAttribute('cx', (300 + (t - lineT(1)) * 60).toFixed(0));
        shotCam(gC, t, c2, b0, 428, 800, 2.3, 428, 800, 2.36);
      }
    });
  }

  /* ================= S2 SIANG (L2) — perempuan biasa di siang hari; malam: kepala lepas ================= */
  {
    const sc = scene(world, 'siang', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const setA = dayYard(gA, 41); const perA = Perempuan(gA, { x: 700, y: GY, s: .98 });
    const setB = dayYard(gB, 43); const perB = Perempuan(gB, { x: 640, y: GY, s: .98 });
    const setC = nightYard(gC, 111);
    const winCover = E('rect', { x: 786, y: 1066, width: 148, height: 176, fill: '#0d060c' }, gC);
    const silW = E('g', {}, gC);
    E('path', { d: 'M832,1240 C830,1196 836,1164 850,1150 C864,1164 870,1196 868,1240 Z', fill: '#050308' }, silW);
    const silHead = E('circle', { cx: 851, cy: 1134, r: 17, fill: '#050308' }, silW);
    E('path', { d: 'M836,1118 C844,1104 858,1104 866,1118', fill: 'none', stroke: '#050308', 'stroke-width': 7 }, silW); // rambut terurai di siluet
    const kuyC = farKuyang(gC);
    const gradeN = E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: '#01020a', opacity: .18 }, gC);
    fgLeaves(gC);
    const c1 = T('L2%47'), c2 = T('L2%75'), a0 = lineT(2) - .11, b0 = lineT(2) + lineD(2) + .16;
    const walkX = (t) => lerp(700, 566, eio(clamp((t - lineT(2)) / (lineD(2) * .75))));
    during('siang', 'siange', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      const ph = (t - lineT(2)) * TAU * .52;
      const wl = walkLeg(ph), wr = walkLeg(ph + Math.PI);
      const legSet = { legL: [wl[0] * .8, 4 + (wl[1] - 4) * .8], legR: [wr[0] * .8, 4 + (wr[1] - 4) * .8] };
      const swayC = Math.sin(t * 1.15) * 2.4;
      if (!inB && !inC) {
        setA.cloth1.setAttribute('transform', `rotate(${swayC.toFixed(2)} 740 1066)`);
        setA.cloth2.setAttribute('transform', `rotate(${(-swayC * .8).toFixed(2)} 895 1054)`);
        perA.set({ la: [16 + Math.sin(ph) * 8, -18], ra: [14 - Math.sin(ph) * 8, -16], headR: Math.sin(t * .9) * 2, blink: blinkAt(t, .8), ...legSet });
        tr(perA.g, walkX(t), GY - Math.abs(Math.sin(ph)) * 6, .98);
        shotCam(gA, t, a0, c1, 560, 1080, 1.10, 545, 1080, 1.15);
      } else if (inB) {
        setB.cloth1.setAttribute('transform', `rotate(${swayC.toFixed(2)} 740 1066)`);
        setB.cloth2.setAttribute('transform', `rotate(${(-swayC * .8).toFixed(2)} 895 1054)`);
        perB.set({ la: [16 + Math.sin(ph) * 8, -18], ra: [14 - Math.sin(ph) * 8, -16], headR: lerp(0, -9, eio(clamp((t - (lineT(2) + 2.6)) / .6))), blink: blinkAt(t, .8), ...legSet });
        tr(perB.g, walkX(t), GY - Math.abs(Math.sin(ph)) * 6, .98);
        shotCam(gB, t, c1, c2, walkX(t) - 6, 906, 1.58, walkX(t) - 10, 906, 1.66);
      } else {
        ambYard(setC, t);
        // kepala siluet terlepas naik di dalam jendela, lalu cahaya merah terbit dari atap
        const dt = clamp((t - (c2 + .35)) / .8);
        silHead.setAttribute('cy', (1134 - dt * 66).toFixed(1));
        silHead.setAttribute('opacity', (1 - dt).toFixed(2));
        const rt = clamp((t - (c2 + .55)) / 1.1);
        if (rt > 0 && rt < 1) {
          kuyC.g.style.display = '';
          setFar(kuyC, t, 856 + Math.sin(rt * 5) * 8, lerp(940, 540, eio(rt)), .6 - rt * .18);
        } else kuyC.g.style.display = 'none';
        shotCam(gC, t, c2, b0, 700, 1090, 1.16, 712, 1070, 1.22);
      }
    });
  }

  /* ================= S3 JERUJU (L3) — pagar yang tidak bisa dilewati ================= */
  {
    const sc = scene(world, 'jeruju', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const setA = nightYard(gA, 121); const darA = Darma(gA, { x: 470, y: GY, s: .98 }); const rakaA = Raka(gA, { x: 660, y: GY, s: .98 }); const senA = makeSenter(rakaA.g); fgLeaves(gA);
    const setB = nightYard(gB, 131); fgThorns(gB);
    const setC = roofSet(gC, 141); const kuyC = farKuyang(gC); fgRoof(gC);
    const c1 = T('L3%45'), c2 = T('L3%75'), a0 = lineT(3) - .11, b0 = lineT(3) + lineD(3) + .16;
    during('jeruju', 'jerujue', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        ambYard(setA, t);
        const pt = t > lineT(3) + .5;
        darA.set({ la: [18, -22], ra: pt ? [64, 26] : [18, -22], headR: -3, blink: blinkAt(t, 1.7), point: pt ? 'r' : null });
        rakaA.set({ la: [20, -22], ra: [17, -20], headR: -7, blink: blinkAt(t, .3) });
        senA.set(rakaA.hands.r, -14);
        shotCam(gA, t, a0, c1, 540, 1130, 1.14, 540, 1130, 1.19);
      } else if (inB) {
        ambYard(setB, t);
        // ECU semak jeruju saja: tangan rig berdiri tak bisa menjangkau tali pagar
        // (bahu y948 vs semak y1452) — ronde 1 membuktikan kaki raksasa memenuhi frame.
        shotCam(gB, t, c1, c2, 588, 1460, 2.3, 588, 1460, 2.38);
      } else {
        ambFog(setC, t);
        const ot = (t - c2) / (b0 - c2);
        const ox = 560 + Math.cos(ot * Math.PI * 1.15 + .6) * 300, oy = 720 + Math.sin(ot * Math.PI * 1.15 + .6) * 92;
        setFar(kuyC, t, ox, oy, .62);
        shotCam(gC, t, c2, b0, 540, 1030, 1.13, 540, 1030, 1.18);
      }
    });
  }

  /* ================= S4 SARI (L4) — Bu Sari & bayinya (interior), rumah berpagar ================= */
  {
    const sc = scene(world, 'sari', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const setA = interiorSet(gA, 151); const sariA = BuSari(gA, { x: 545, y: GY, s: .98 });
    const setB = interiorSet(gB, 161); const sariB = BuSari(gB, { x: 545, y: GY, s: .98 });
    const setC = nightYard(gC, 171); fgLeaves(gC);
    const c1 = T('L4%52'), c2 = T('L4%78'), a0 = lineT(4) - .11, b0 = lineT(4) + lineD(4) + .16;
    during('sari', 'sarie', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      const rock = Math.sin(t * .85) * 2.4;   // fase absolut — sama dengan ayunan ibu di jendela
      if (!inB && !inC) {
        sariA.set({ rock, headR: 3 + Math.sin(t * .85) * 1.2, blink: blinkAt(t, 1.1), sad: .25 });
        shotCam(gA, t, a0, c1, 520, 1080, 1.12, 520, 1080, 1.17);
      } else if (inB) {
        sariB.set({ rock, headR: 6 + Math.sin(t * .85) * 1.2, blink: blinkAt(t, 1.1), sad: .4 });
        shotCam(gB, t, c1, c2, 545, 902, 1.56, 545, 902, 1.66);
      } else {
        ambYard(setC, t);
        shotCam(gC, t, c2, b0, 560, 1120, 1.13, 560, 1120, 1.18);
      }
    });
  }

  /* ================= S5 KEPAKAN (L5) — tiga malam kepakan di atap ================= */
  {
    const sc = scene(world, 'kepakan', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const setA = roofSet(gA, 181); const kuyA = farKuyang(gA); fgLeaves(gA);
    roofSet(gB, 191); const kuyB = farKuyang(gB);
    const setC = nightYard(gC, 201); const kuyC = farKuyang(gC); fgThorns(gC);
    const c1 = T('L5%45'), c2 = T('L5%78'), a0 = lineT(5) - .12, b0 = lineT(5) + lineD(5) + .16;
    during('kepakan', 'kepakane', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        ambFog(setA, t);
        const pt = clamp((t - a0) / (c1 - a0));
        setFar(kuyA, t, lerp(120, 900, pt), 560 - Math.sin(pt * Math.PI) * 60 + Math.sin(t * 6.8) * 4, .66);
        shotCam(gA, t, a0, c1, 540, 1030, 1.12, 540, 1030, 1.17);
      } else if (inB) {
        // kuyang melintas BESAR di atas atap (bayangan di genteng gelap tidak terbaca —
        // ronde 1: frame nyaris hitam kosong)
        const pt = clamp((t - c1) / (c2 - c1));
        setFar(kuyB, t, lerp(60, 1000, pt), 1060 - Math.sin(pt * Math.PI) * 130 + Math.sin(t * 6.8) * 5, 1.05);
        shotCam(gB, t, c1, c2, 540, 1250, 1.9, 540, 1250, 2.0);
      } else {
        ambYard(setC, t);
        const pt = clamp((t - c2) / (b0 - c2));
        setFar(kuyC, t, lerp(700, 1010, pt), lerp(430, 240, pt), .55 - pt * .25);
        kuyC.g.setAttribute('opacity', (1 - pt * .8).toFixed(2));
        shotCam(gC, t, c2, b0, 560, 1120, 1.13, 560, 1120, 1.18);
      }
    });
  }

  /* ================= S6 KELELAWAR (L6) — klaim skeptis: cuma kelelawar buah ================= */
  {
    const sc = scene(world, 'kelelawar', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const makeBat = (parent, s = 1) => {
      const g = E('g', {}, parent);
      const wl = E('path', { d: 'M0,0 Q-34,-26 -62,-6 Q-30,-2 0,6Z', fill: '#05070d' }, g);
      const wr = E('path', { d: 'M0,0 Q34,-26 62,-6 Q30,-2 0,6Z', fill: '#05070d' }, g);
      E('ellipse', { cx: 0, cy: 2, rx: 11, ry: 7, fill: '#05070d' }, g);
      E('circle', { cx: 9, cy: -2, r: 5.5, fill: '#05070d' }, g);
      return { g, set(t2, ph) { const f = Math.sin(t2 * 11 + ph) * 26; wl.setAttribute('transform', `rotate(${(-f).toFixed(1)} 0 0)`); wr.setAttribute('transform', `rotate(${f.toFixed(1)} 0 0)`); } };
    };
    const setA = gardenSet(gA, 211); const rakaA = Raka(gA, { x: 400, y: GY, s: .98 }); const darA = Darma(gA, { x: 620, y: GY, s: .98 }); fgLeaves(gA);
    gardenSet(gB, 221); const batsB = [makeBat(gB), makeBat(gB), makeBat(gB)];
    const setC = gardenSet(gC, 231); const rakaC = Raka(gC, { x: 400, y: GY, s: .98 }); const darC = Darma(gC, { x: 620, y: GY, s: .98 });
    const batsC = [makeBat(gC, .7), makeBat(gC, .7), makeBat(gC, .7), makeBat(gC, .7), makeBat(gC, .7)];
    const c1 = T('L6%48'), c2 = T('L6%74'), a0 = lineT(6) - .12, b0 = lineT(6) + lineD(6) + .16;
    during('kelelawar', 'kelelaware', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        ambFog(setA, t, 340);
        const wave = Math.sin(clamp((t - (lineT(6) + .3)) / .5) * Math.PI);
        rakaA.set({ la: [20, -22], ra: [17 - wave * 26, -20 - wave * 30], headR: -3, blink: blinkAt(t, .3) }); // lambaian meremehkan
        darA.set({ la: [18, -22], ra: [18, -22], headR: 5, blink: blinkAt(t, 1.7) });
        shotCam(gA, t, a0, c1, 500, 1080, 1.14, 500, 1080, 1.19);
      } else if (inB) {
        batsB.forEach((b, i) => {
          const pt = clamp((t - c1 - i * .22) / (c2 - c1));
          tr(b.g, lerp(60, 480, pt), 210 + i * 52 + Math.sin(pt * 9 + i) * 14, 1);
          b.set(t, i * 2.1);
        });
        shotCam(gB, t, c1, c2, 250, 300, 1.9, 262, 300, 2.0);
      } else {
        ambFog(setC, t, 340);
        batsC.forEach((b, i) => {
          const pt = clamp((t - c2 - i * .13) / (b0 - c2));
          tr(b.g, lerp(-40, 900, pt), 300 + (i % 3) * 90 + Math.sin(pt * 7 + i * 2) * 18, .7);
          b.set(t, i * 1.7);
        });
        rakaC.set({ la: [20, -22], ra: [96, 4], headR: -12, blink: blinkAt(t, .3), point: 'r' }); // menunjuk kawanan, puas
        darC.set({ la: [18, -22], ra: [18, -22], headR: -8, blink: blinkAt(t, 1.7) });
        shotCam(gC, t, c2, b0, 500, 1080, 1.12, 500, 1080, 1.17);
      }
    });
  }

  /* ================= S7 JAGA (L7) — malam keempat: jaga dari kebun ================= */
  {
    const sc = scene(world, 'jaga', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    // gardu tinggi di kebun (tempat duduk — kaki menjuntai, berayun fase absolut)
    const platform = (shot) => {
      const pl = E('g', {}, shot);
      E('rect', { x: 320, y: 1150, width: 400, height: 30, rx: 6, fill: '#2a1e12' }, pl);
      [[340, 0], [680, 0]].forEach(([lx]) => E('rect', { x: lx, y: 1180, width: 20, height: 240, fill: '#1c130a' }, pl));
      for (let i = 0; i < 6; i++) E('path', { d: `M${336 + i * 62},1152 L${336 + i * 62},1178`, stroke: '#170e06', 'stroke-width': 5 }, pl);
      E('path', { d: 'M320,1150 L720,1150', stroke: '#3a2a18', 'stroke-width': 5 }, pl);
      return pl;
    };
    const setA = gardenSet(gA, 241); platform(gA);
    const rakaA = Raka(gA, { x: 440, y: 1472, s: .98 }); const ditoA = Dito(gA, { x: 622, y: 1450, s: .98 });
    const senA = makeSenter(rakaA.g); fgLeaves(gA);
    const setB = gardenSet(gB, 251); platform(gB);
    const rakaB = Raka(gB, { x: 440, y: 1472, s: .98 }); const ditoB = Dito(gB, { x: 622, y: 1450, s: .98 });
    const senB = makeSenter(rakaB.g);
    const setC = nightYard(gC, 261); const rakaC = Raka(gC, { x: 330, y: GY, s: .8 }); const ditoC = Dito(gC, { x: 455, y: GY, s: .8 }); fgLeaves(gC);
    const c1 = T('L7%36'), c2 = T('L7%68'), a0 = lineT(7) - .12, b0 = lineT(7) + lineD(7) + .16;
    const sitPose = (t) => {
      const dangle = Math.sin(t * 1.35) * 3.2, dangle2 = Math.sin(t * 1.35 + 1.4) * 3.2;
      return {
        raka: { legL: [52 + dangle, -34], legR: [50 + dangle2, -36] },
        dito: { legL: [54 + dangle2, -32], legR: [51 + dangle, -35] }
      };
    };
    during('jaga', 'jagae', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      const sp = sitPose(t);
      if (!inB && !inC) {
        ambFog(setA, t, 340);
        rakaA.set({ la: [24, -30], ra: [30, -34], headR: -4 + Math.sin(t * .8) * 2, blink: blinkAt(t, .3), ...sp.raka });
        ditoA.set({ la: [22, -26], ra: [20, -24], headR: 6, fear: .2, blink: blinkAt(t, .9), ...sp.dito });
        senA.set(rakaA.hands.r, 30);
        shotCam(gA, t, a0, c1, 520, 1060, 1.12, 520, 1060, 1.17);
      } else if (inB) {
        ambFog(setB, t, 340);
        rakaB.set({ la: [24, -30], ra: [30, -34], headR: -6, blink: blinkAt(t, .3), ...sp.raka });
        ditoB.set({ la: [22, -26], ra: [20, -24], headR: -9 + Math.sin(t * 2.2) * 1.6, fear: .55, blink: blinkAt(t, .9), ...sp.dito });
        senB.set(rakaB.hands.r, 30);
        shotCam(gB, t, c1, c2, 524, 856, 1.55, 524, 856, 1.65);
      } else {
        ambYard(setC, t);
        rakaC.set({ la: [20, -22], ra: [17, -20], headR: -13, blink: blinkAt(t, .3) });
        ditoC.set({ la: [20, -22], ra: [17, -20], headR: -13, fear: .4, blink: blinkAt(t, .9) });
        shotCam(gC, t, c2, b0, 640, 1030, 1.2, 640, 1030, 1.28);
      }
    });
  }

  /* ================= S8 BUKA (L8) — uji skeptis: satu ikat jeruju DIBUKA ================= */
  {
    const sc = scene(world, 'buka', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    // buntelan ranting jeruju yang diikat melintasi celah gerbang (440,1416)
    const bundleProp = (shot) => {
      const b = E('g', {}, shot);
      const ropes = E('g', {}, b);
      const r1 = E('path', { d: 'M404,1330 L476,1330', stroke: '#8a6f42', 'stroke-width': 7 }, ropes);
      const r2 = E('path', { d: 'M404,1470 L476,1470', stroke: '#8a6f42', 'stroke-width': 7 }, ropes);
      for (let i = 0; i < 7; i++) {
        const bx = 396 + i * 15;
        E('path', { d: `M${bx},1310 C${bx + 6},1380 ${bx - 5},1440 ${bx + 3},1506`, fill: 'none', stroke: '#0d2013', 'stroke-width': 13, 'stroke-linecap': 'round' }, b);
        for (let j = 0; j < 4; j++) E('path', { d: `M${bx + 2},${1346 + j * 38} L${bx + 20},${1336 + j * 38}`, stroke: '#46684a', 'stroke-width': 3, 'stroke-linecap': 'round' }, b);
      }
      return { g: b, r1, r2 };
    };
    const setA = nightYard(gA, 271); const bunA = bundleProp(gA);
    const rakaA = Raka(gA, { x: 300, y: GY, s: .98 }); const ditoA = Dito(gA, { x: 716, y: GY, s: .98 }); fgLeaves(gA);
    const setB = nightYard(gB, 281); const bunB = bundleProp(gB);
    const gripB = gripHands(gB, 440, 1330); fgThorns(gB);
    const setC = nightYard(gC, 291); const bunC = bundleProp(gC);
    const rakaC = Raka(gC, { x: 402, y: GY, s: .98 }); const ditoC = Dito(gC, { x: 716, y: GY, s: .98 }); fgLeaves(gC);
    const c1 = T('L8%47'), c2 = T('L8%74'), a0 = lineT(8) - .12, b0 = lineT(8) + lineD(8) + .16;
    during('buka', 'bukae', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      // kemajuan membuka: 0 di A, bergerak di B, tuntas di C (fungsi waktu kontinu)
      const openK = eio(clamp((t - (lineT(8) + 2.3)) / 1.1));
      const bunPose = (bun) => {
        bun.g.setAttribute('transform', `rotate(${(-openK * 16).toFixed(2)} 400 1506) translate(${(openK * 34).toFixed(1)},0)`);
        bun.r1.setAttribute('d', `M404,1330 Q440,${1330 + openK * 26} 476,1330`);
        bun.r2.setAttribute('d', `M404,1470 Q440,${1470 + openK * 30} 476,1470`);
      };
      if (!inB && !inC) {
        ambYard(setA, t); bunPose(bunA);
        const wk = clamp((t - lineT(8)) / 1.1), xe = 1 - Math.pow(1 - wk, 2);
        const stopF = 1 - clamp((t - (lineT(8) + 1.05)) / .25);
        const ph = (t - lineT(8)) * TAU * .8;
        const wl = walkLeg(ph), wr = walkLeg(ph + Math.PI);
        rakaA.set({ la: [20 + Math.sin(ph) * 12 * stopF, -22], ra: [17 - Math.sin(ph) * 12 * stopF, -20], headR: 4, blink: blinkAt(t, .3), legL: [wl[0] * stopF, 4 + (wl[1] - 4) * stopF], legR: [wr[0] * stopF, 4 + (wr[1] - 4) * stopF] });
        tr(rakaA.g, lerp(300, 402, xe), GY - Math.abs(Math.sin(ph)) * 10 * stopF, .98);
        ditoA.set({ la: [20, -22], ra: [17, -20], headR: -4, fear: .35, blink: blinkAt(t, .9) });
        shotCam(gA, t, a0, c1, 500, 1120, 1.14, 500, 1120, 1.19);
      } else if (inB) {
        ambYard(setB, t); bunPose(bunB);
        gripB.set(Math.sin(t * 7) * 5 * (1 - openK)); // tangan bekerja membuka ikat, kontak di tali atas
        shotCam(gB, t, c1, c2, 440, 1420, 2.3, 440, 1420, 2.38);
      } else {
        ambYard(setC, t); bunPose(bunC);
        const dust = Math.sin(clamp((t - c2) / .7) * Math.PI * 2);
        rakaC.set({ la: [20 + dust * 9, -22], ra: [17 - dust * 9, -20], headR: -5, blink: blinkAt(t, .3) });
        ditoC.set({ la: [20, -22], ra: [17, -20], headR: 3, fear: .5, blink: blinkAt(t, .9) });
        shotCam(gC, t, c2, b0, 500, 1120, 1.12, 500, 1120, 1.17);
      }
    });
  }

  /* ================= S9 TENANG (L9) — kampung terlelap (hening yang HIDUP) ================= */
  {
    const sc = scene(world, 'tenang', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const setA = streetSet(gA, 301);
    const winA1 = E('rect', { x: 60, y: 1180, width: 52, height: 66, fill: '#ffb45e', opacity: .8 }, gA);
    const winA2 = E('rect', { x: 420, y: 1210, width: 90, height: 80, fill: '#ffb45e', opacity: .55 }, gA);
    const setB = interiorSet(gB, 311); const sariB = BuSari(gB, { x: 545, y: GY, s: .98 });
    const setC = gardenSet(gC, 321); const rakaC = Raka(gC, { x: 430, y: GY, s: .98 }); const ditoC = Dito(gC, { x: 636, y: GY, s: .98 }); fgLeaves(gC);
    const c1 = T('L9%45'), c2 = T('L9%72'), a0 = lineT(9) - .12, b0 = lineT(9) + lineD(9) + .16;
    during('tenang', 'tenange', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        ambFog(setA, t, 420);
        winA1.setAttribute('opacity', (t < lineT(9) + .9 ? .8 : .06).toFixed(2));
        winA2.setAttribute('opacity', (t < lineT(9) + 1.7 ? .55 : .05).toFixed(2));
        setA.lampGlow.setAttribute('opacity', (.85 + .15 * Math.sin(t * 7.3) * Math.sin(t * 1.1)).toFixed(3));
        shotCam(gA, t, a0, c1, 540, 1050, 1.10, 540, 1050, 1.16);
      } else if (inB) {
        const rock = Math.sin(t * .85) * 1.5;
        sariB.set({ rock, headR: 7 + Math.sin(t * .85) * 1, blink: (t % 3.9) < .55, sad: .55 });
        shotCam(gB, t, c1, c2, 545, 950, 1.5, 545, 950, 1.6);
      } else {
        ambFog(setC, t, 340);
        const yawn = Math.sin(clamp((t - (c2 + .3)) / .8) * Math.PI);
        rakaC.set({ la: [20, -22], ra: [17, -20], headR: -4 - yawn * 5, fear: yawn * .34, blink: yawn > .4 || blinkAt(t, .3) });
        ditoC.set({ la: [24, -30], ra: [22, -28], headR: 14 + Math.sin(t * .55) * 1.8, blink: true }); // tertidur bersandar
        shotCam(gC, t, c2, b0, 520, 1060, 1.15, 520, 1060, 1.2);
      }
    });
  }

  /* ================= S10 ANJING (L10) — anjing merengek DULUAN, hidung ke atas ================= */
  {
    const sc = scene(world, 'anjing', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const setA = streetSet(gA, 331); const dogA = Dog(gA, { x: 330, y: GY, s: 1 }); fgLeaves(gA);
    streetSet(gB, 341); const dogB = Dog(gB, { x: 330, y: GY, s: 1.15 });
    const setC = gardenSet(gC, 351); const rakaC = Raka(gC, { x: 430, y: GY, s: .98 }); const ditoC = Dito(gC, { x: 636, y: GY, s: .98 }); const senC = makeSenter(rakaC.g); fgLeaves(gC);
    const c1 = T('L10%50'), c2 = T('L10%76'), a0 = lineT(10) - .17, b0 = lineT(10) + lineD(10) + .16;
    const headUpAt = (t) => eio(clamp((t - (lineT(10) + .9)) / .7));
    during('anjing', 'anjinge', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      const hu = headUpAt(t);
      if (!inB && !inC) {
        ambFog(setA, t, 420);
        dogA.set({ headUp: hu, tailWag: .3, tremble: hu * .5, t });
        shotCam(gA, t, a0, c1, 430, 1130, 1.15, 430, 1130, 1.2);
      } else if (inB) {
        dogB.set({ headUp: 1, tailWag: .15, tremble: .8, t });
        shotCam(gB, t, c1, c2, 330 + 148 * 1.15, 1420 - 196 * 1.15, 2.3, 330 + 148 * 1.15, 1420 - 196 * 1.15, 2.36);
      } else {
        ambFog(setC, t, 340);
        const up = eio(clamp((t - (c2 + .35)) / .5));
        rakaC.set({ la: [20, -22], ra: [17, -20], headR: lerp(2, -14, up), fear: .4 + up * .3, blink: blinkAt(t, .3) });
        ditoC.set({ la: [20, -22], ra: [17, -20], headR: lerp(10, -15, up), fear: .65, blink: blinkAt(t, .9) });
        senC.set(rakaC.hands.r, -14);
        shotCam(gC, t, c2, b0, 524, 880, 1.5, 524, 880, 1.62);
      }
    });
  }

  /* ================= S11 DATANG (L11) — jam satu: kepakan itu datang ================= */
  {
    const sc = scene(world, 'datang', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const setA = roofSet(gA, 361);
    const shadowA = E('ellipse', { cx: 560, cy: 1420, rx: 120, ry: 44, fill: '#01030a', opacity: .3, filter: P.blur(gA, 20) }, gA);
    const setB = gardenSet(gB, 371); const rakaB = Raka(gB, { x: 430, y: GY, s: .98 }); const ditoB = Dito(gB, { x: 636, y: GY, s: .98 });
    const beamB = makeBeam(gB, .12); const senB = makeSenter(rakaB.g); fgLeaves(gB);
    roofSet(gC, 381); const kuyC = farKuyang(gC);
    const c1 = T('L11%30'), c2 = T('L11%68'), a0 = lineT(11) - .38, b0 = lineT(11) + lineD(11) + .16;
    during('datang', 'datange', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        ambFog(setA, t);
        const pt = clamp((t - a0) / (c1 - a0));
        const pulse = 1 + Math.sin(pt * Math.PI * 5) * .1;
        shadowA.setAttribute('rx', (120 + pt * 260 * pulse).toFixed(0));
        shadowA.setAttribute('ry', (44 + pt * 84 * pulse).toFixed(0));
        shadowA.setAttribute('opacity', (.3 + pt * .3).toFixed(2));
        shotCam(gA, t, a0, c1, 540, 1000, 1.12, 540, 1000, 1.18);
      } else if (inB) {
        ambFog(setB, t, 340);
        const fr = .5 + .35 * clamp((t - c1) / (c2 - c1));
        rakaB.set({ la: [20, -22], ra: [30, -52], headR: -15, fear: fr, shock: fr * .5, blink: blinkAt(t, .3) });
        ditoB.set({ la: [26, -34], ra: [24, -30], headR: -16, fear: fr + .15, blink: blinkAt(t, .9) });
        senB.set(rakaB.hands.r, -52);
        const H = rakaB.hands.r;
        beamB.set(430 + H[0] * .98, GY + H[1] * .98, 240, 480, 700, 120);
        shotCam(gB, t, c1, c2, 524, 860, 1.55, 524, 860, 1.68);
      } else {
        const pt = clamp((t - c2) / (b0 - c2));
        setFar(kuyC, t, lerp(120, 430, pt), 268 + Math.sin(pt * Math.PI) * 14, .8);
        shotCam(gC, t, c2, b0, 268, 300, 1.3, 268, 300, 1.4);
      }
    });
  }

  /* ================= S12 PUTAR (L12) — PENAMPAKAN JELAS PERTAMA: dia berputar di atas atap ================= */
  {
    const sc = scene(world, 'putar', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    roofSet(gA, 391); const kuyA = Kuyang(gA, {});
    roofSet(gB, 401); const kuyB = Kuyang(gB, {});
    roofSet(gC, 411); const kuyC = Kuyang(gC, {});
    fgRoof(gA); fgRoof(gC);
    const c1 = T('L12%38'), c2 = T('L12%66'), a0 = lineT(12) - .16, b0 = lineT(12) + lineD(12) + .27;
    // lintasan orbit = fungsi waktu ABSOLUT (pose kontinu di semua potongan)
    const orbit = (t) => {
      const ph = (t - lineT(12)) / lineD(12) * Math.PI * 1.5 + .5;
      return { x: 560 + Math.cos(ph) * 330, y: 620 + Math.sin(ph) * 88, bank: Math.cos(ph) * 9 };
    };
    const flySet = (kuy, t, amp) => kuy.set({ sway: Math.sin(t * 2.2 - 1) * amp, hairLag: Math.sin(t * 2.2 - 2.1) * amp * .9, glowK: .6 + .4 * Math.sin(t * 3.7) });
    during('putar', 'putare', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      const o = orbit(t);
      if (!inB && !inC) {
        tr(kuyA.g, o.x, o.y, 1.05, o.bank); flySet(kuyA, t, 7);
        shotCam(gA, t, a0, c1, 560, 830, 1.25, 560, 830, 1.35);
      } else if (inB) {
        tr(kuyB.g, o.x, o.y, 1.18, o.bank); flySet(kuyB, t, 10); // usus berkibar seperti kain basah
        shotCam(gB, t, c1, c2, o.x - 10, o.y + 60, 1.7, o.x - 4, o.y + 56, 1.82);
      } else {
        tr(kuyC.g, o.x, o.y, 1.32, o.bank); flySet(kuyC, t, 8);
        shotCam(gC, t, c2, b0, o.x - 6, o.y + 44, 2.3, o.x - 2, o.y + 40, 2.38);
      }
    });
  }

  /* ================= S13 CELAH (L13) — tidak pernah turun, mencari satu celah ================= */
  {
    const sc = scene(world, 'celah', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    roofSet(gA, 421); const kuyA = Kuyang(gA, {});
    const setB = gardenSet(gB, 431); const rakaB = Raka(gB, { x: 430, y: GY, s: .98 }); const ditoB = Dito(gB, { x: 636, y: GY, s: .98 }); fgLeaves(gB);
    roofSet(gC, 441); const kuyC = Kuyang(gC, {});
    const c1 = T('L13%42'), c2 = T('L13%70'), a0 = lineT(13) - .17, b0 = lineT(13) + lineD(13) + .16;
    const orbit = (t) => {
      const ph = (t - lineT(13)) / lineD(13) * Math.PI * 1.3 + 2.2;
      return { x: 560 + Math.cos(ph) * 320, y: 600 + Math.sin(ph) * 80, bank: Math.cos(ph) * 9, ph };
    };
    during('celah', 'celahe', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      const o = orbit(t);
      if (!inB && !inC) {
        tr(kuyA.g, o.x, o.y, 1.0, o.bank);
        kuyA.set({ sway: Math.sin(t * 2.2 - 1) * 6, hairLag: Math.sin(t * 2.2 - 2.1) * 5, glowK: .6 });
        shotCam(gA, t, a0, c1, 540, 950, 1.12, 540, 950, 1.17);
      } else if (inB) {
        ambFog(setB, t, 340);
        const track = Math.sin(o.ph) * 13;   // kepala mengikuti putarannya
        rakaB.set({ la: [20, -22], ra: [17, -20], headR: track, fear: .55, blink: blinkAt(t, .3) });
        ditoB.set({ la: [22, -26], ra: [20, -24], headR: track * .9, fear: .7, blink: blinkAt(t, .9) });
        shotCam(gB, t, c1, c2, 524, 870, 1.5, 524, 870, 1.6);
      } else {
        tr(kuyC.g, o.x, o.y, 1.28, o.bank + Math.sin(t * .9) * 3); // memindai ke bawah
        kuyC.set({ sway: Math.sin(t * 2.2 - 1) * 5, hairLag: Math.sin(t * 2.2 - 2.1) * 5, glowK: .8 });
        shotCam(gC, t, c2, b0, o.x - 4, o.y + 40, 2.3, o.x, o.y + 36, 2.36);
      }
    });
  }

  /* ================= S14 DAPUR (L14) — putarannya berubah menuju sisi dapur ================= */
  {
    const sc = scene(world, 'dapur', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    roofSet(gA, 451); const kuyA = Kuyang(gA, {});
    const setB = gardenSet(gB, 461); const rakaB = Raka(gB, { x: 430, y: GY, s: .98 }); const ditoB = Dito(gB, { x: 636, y: GY, s: .98 }); fgLeaves(gB);
    const setC = nightYard(gC, 471);
    const bunC = E('g', { transform: 'rotate(-16 400 1506) translate(34,0)' }, gC);
    for (let i = 0; i < 7; i++) { const bx = 396 + i * 15; E('path', { d: `M${bx},1310 C${bx + 6},1380 ${bx - 5},1440 ${bx + 3},1506`, fill: 'none', stroke: '#0d2013', 'stroke-width': 13, 'stroke-linecap': 'round' }, bunC); }
    const kuyGlowC = farKuyang(gC); fgThorns(gC);
    const c1 = T('L14%40'), c2 = T('L14%68'), a0 = lineT(14) - .16, b0 = lineT(14) + lineD(14) + .16;
    during('dapur', 'dapure', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        const pt = clamp((t - a0) / (c1 - a0));
        const ox = lerp(300, 760, eio(pt)), oy = 600 + Math.sin(pt * Math.PI) * 46;
        tr(kuyA.g, ox, oy, 1.02, lerp(-8, 10, pt));
        kuyA.set({ sway: Math.sin(t * 2.2 - 1) * 6, hairLag: Math.sin(t * 2.2 - 2.1) * 5, glowK: .7 });
        shotCam(gA, t, a0, c1, 560, 900, 1.15, 560, 900, 1.22);
      } else if (inB) {
        ambFog(setB, t, 340);
        const snap = eio(clamp((t - (lineT(14) + 2.6)) / .3));
        rakaB.set({ la: [20, -22], ra: [17, -20], headR: lerp(-8, 17, snap), fear: .5 + snap * .4, shock: snap * .7, blink: blinkAt(t, .3) });
        ditoB.set({ la: [22, -26], ra: [20, -24], headR: -10, fear: .7, blink: blinkAt(t, .9) });
        shotCam(gB, t, c1, c2, 430, 810, 1.6, 430, 810, 1.7);
      } else {
        ambYard(setC, t);
        const pt = clamp((t - c2) / (b0 - c2));
        setFar(kuyGlowC, t, lerp(760, 620, pt), lerp(1080, 1000, pt), .5); // cahaya mendekat terlihat di tepi atas ECU celah
        shotCam(gC, t, c2, b0, 440, 1400, 2.3, 440, 1400, 2.38);
      }
    });
  }

  /* ================= S15 LARI (L15) — lari membawa ikat, tangan perih kena duri ================= */
  {
    const sc = scene(world, 'lari', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const carryBundle = (shot) => {
      const b = E('g', {}, shot);
      for (let i = 0; i < 6; i++) { const bx = -38 + i * 15; E('path', { d: `M${bx},-70 C${bx + 6},0 ${bx - 5},60 ${bx + 3},126`, fill: 'none', stroke: '#0d2013', 'stroke-width': 13, 'stroke-linecap': 'round' }, b); for (let j = 0; j < 3; j++) E('path', { d: `M${bx + 2},${-34 + j * 44} L${bx + 20},${-44 + j * 44}`, stroke: '#46684a', 'stroke-width': 3, 'stroke-linecap': 'round' }, b); }
      E('path', { d: 'M-52,-16 L58,-16', stroke: '#8a6f42', 'stroke-width': 8 }, b);
      return b;
    };
    const setA = nightYard(gA, 481); const ditoA = Dito(gA, { x: 716, y: GY, s: .98 });
    const rakaA = Raka(gA, { x: 250, y: GY, s: .98 }); const bunA = carryBundle(gA); fgLeaves(gA);
    const setB = nightYard(gB, 491); const rakaB = Raka(gB, { x: 402, y: GY, s: .98 }); const bunB = carryBundle(gB); fgThorns(gB);
    const setC = nightYard(gC, 501); const rakaC = Raka(gC, { x: 402, y: GY, s: .98 }); const bunC = carryBundle(gC);
    const c1 = T('L15%52'), c2 = T('L15%76'), a0 = lineT(15) - .16, b0 = lineT(15) + lineD(15) + .16;
    // QC final (26 Nov): buntelan WAJIB di tangan — titik genggam dihitung dari
    // api.hands (resep: prop dari posisi telapak, bukan ditebak). Pose gendong dua
    // tangan di depan badan la/ra [30,-75] -> telapak bertemu di depan paha.
    const handMid = (api, x, y, s, rot = 0) => {
      const r = d2r(rot), c = Math.cos(r), sn = Math.sin(r);
      const mx = (api.hands.l[0] + api.hands.r[0]) / 2, my = (api.hands.l[1] + api.hands.r[1]) / 2;
      return [x + s * (mx * c - my * sn), y + s * (mx * sn + my * c)];
    };
    during('lari', 'larie', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      const runPh = (t - lineT(15)) * TAU * 1.55;
      if (!inB && !inC) {
        ambYard(setA, t);
        const wk = eio(clamp((t - lineT(15)) / (c1 - lineT(15))));
        const rx = lerp(250, 402, wk);
        const by = Math.abs(Math.sin(runPh)) * 13;
        const wl = walkLeg(runPh), wr = walkLeg(runPh + Math.PI);
        rakaA.set({ la: [30, -75], ra: [30, -75], headR: 6, fear: .5, blink: blinkAt(t, .3), legL: [wl[0] * 1.5, 4 + (wl[1] - 4) * 1.3], legR: [wr[0] * 1.5, 4 + (wr[1] - 4) * 1.3] });
        tr(rakaA.g, rx, GY - by, .98);
        const hmA = handMid(rakaA, rx, GY - by, .98);
        tr(bunA, hmA[0] - 3, hmA[1] + 15, .92, Math.sin(runPh) * 4);
        ditoA.set({ la: [20, -22], ra: [17, -20], headR: -6, fear: .6, shock: .4, blink: blinkAt(t, .9) });
        shotCam(gA, t, a0, c1, lerp(430, 470, wk), 1120, 1.2, lerp(430, 470, wk), 1120, 1.28);
      } else if (inB) {
        ambYard(setB, t);
        const prick = Math.sin(clamp((t - (lineT(15) + 1.82)) / .16) * Math.PI); // sentakan kena duri (sinkron sfx hit)
        rakaB.set({ la: [30, -75], ra: [30, -75], headR: 8, fear: .6 + prick * .4, shock: prick * .8, blink: prick > .5 });
        tr(rakaB.g, 402 + prick * 3, GY, .98, -10);
        const hmB = handMid(rakaB, 402 + prick * 3, GY, .98, -10);
        tr(bunB, hmB[0] - 3, hmB[1] + 15, .95, -10); // tali buntelan tepat di kedua telapak (QC: sebelumnya melayang di kaki)
        shotCam(gB, t, c1, c2, 440, 1240, 2.3, 440, 1240, 2.36);
      } else {
        ambYard(setC, t);
        const tie = Math.sin(t * 9) * 6;
        rakaC.set({ la: [30 + tie * .4, -75], ra: [30 - tie * .4, -75], headR: 10, fear: .7, blink: blinkAt(t, .3) });
        tr(rakaC.g, 402, GY, .98, -15);
        const hmC = handMid(rakaC, 402, GY, .98, -15);
        tr(bunC, hmC[0] - 3, hmC[1] + 15, .95, -15 + tie * .3);
        shotCam(gC, t, c2, b0, 440, 1250, 1.5, 440, 1250, 1.62);
      }
    });
  }

  /* ================= S16 PASANG (L16) — KLIMAKS: dia melayang di celah itu =================
     Anatomi jumpscare: jeda narasi 1,2 dtk (skor silence, ambien meredup) = TAHAN;
     sting impact+sub tepat di awal baris = penampakan di celah. */
  {
    const sc = scene(world, 'pasang', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const bundleProp = (shot) => {
      const b = E('g', {}, shot);
      const r1 = E('path', { d: 'M404,1330 L476,1330', stroke: '#8a6f42', 'stroke-width': 7 }, b);
      const r2 = E('path', { d: 'M404,1470 L476,1470', stroke: '#8a6f42', 'stroke-width': 7 }, b);
      for (let i = 0; i < 7; i++) { const bx = 396 + i * 15; E('path', { d: `M${bx},1310 C${bx + 6},1380 ${bx - 5},1440 ${bx + 3},1506`, fill: 'none', stroke: '#0d2013', 'stroke-width': 13, 'stroke-linecap': 'round' }, b); }
      return { g: b, r1, r2 };
    };
    const setA = nightYard(gA, 511); const bunA = bundleProp(gA);
    const rakaA = Raka(gA, { x: 402, y: GY, s: .98 }); const kuyA = Kuyang(gA, {}); fgThorns(gA);
    const setB = nightYard(gB, 521); const bunB = bundleProp(gB);
    const gripB = gripHands(gB, 440, 1330); fgThorns(gB); // ECU ikat: prop tangan menggenggam tali atas buntelan (pola periksa/rumahku — rig berdiri tak menjangkau tali di tanah)
    const setC = nightYard(gC, 531); const bunC = bundleProp(gC);
    const rakaC = Raka(gC, { x: 402, y: GY, s: .98 }); const kuyC = Kuyang(gC, {}); fgThorns(gC);
    const c1 = T('L16%55'), c2 = T('L16%78'), a0 = lineT(16) - .88, b0 = lineT(16) + lineD(16) + .26;
    const LT16 = lineT(16);
    during('pasang', 'pasange', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      const appear = clamp((t - LT16) / .16);         // penampakan tepat di awal baris (sting)
      const freeze = clamp((t - (LT16 + .3)) / .3);    // Raka membeku setelah sting
      const tieW = (1 - freeze) * Math.sin(t * 9) * 6;
      const bunPose = (bun) => {
        const sag = 26 * (1 - eio(clamp((t - (LT16 + 1.9)) / .8)));
        bun.r1.setAttribute('d', `M404,1330 Q440,${1330 + sag} 476,1330`);
        bun.r2.setAttribute('d', `M404,1470 Q440,${1470 + sag} 476,1470`);
      };
      if (!inB && !inC) {
        ambYard(setA, t); bunPose(bunA);
        rakaA.set({ la: [50 + tieW, -44], ra: [54 - tieW, -40], headR: lerp(10, -18, freeze), fear: .55 + freeze * .45, shock: freeze * .9, blink: blinkAt(t, .3) && freeze < .5 });
        tr(rakaA.g, 402, GY, .98, lerp(-15, -6, freeze));
        if (appear > 0) {
          kuyA.g.style.display = '';
          tr(kuyA.g, 486, lerp(1020, 1072, eio(appear)), 1.5, Math.sin(t * 1.1) * 1.6);
          kuyA.set({ sway: Math.sin(t * 1.9 - 1) * 3.6, hairLag: Math.sin(t * 1.9 - 2.2) * 3, glowK: .9 });
          kuyA.g.setAttribute('opacity', appear.toFixed(2));
        } else kuyA.g.style.display = 'none';
        shotCam(gA, t, a0, c1, 446, 1210, 1.4, 446, 1200, 1.52);
      } else if (inB) {
        ambYard(setB, t); bunPose(bunB);
        gripB.set(Math.sin(t * 9) * 3.5); // tangan menyelesaikan ikat terakhir — tarikan kecil di tali, kontak di titik genggam
        shotCam(gB, t, c1, c2, 440, 1380, 2.3, 440, 1380, 2.36);
      } else {
        ambYard(setC, t); bunPose(bunC);
        const recoil = eio(clamp((t - c2) / .35));
        rakaC.set({ la: [50, -44], ra: [lerp(54, -14, recoil), lerp(-40, -126, recoil)], headR: lerp(-16, -22, recoil), fear: 1, shock: .7, blink: blinkAt(t, .3) }); // lengan menutup hidung: bau amis
        tr(rakaC.g, 402, GY, .98, -6);
        tr(kuyC.g, 486, 1072 + Math.sin(t * 1.9) * 3, 1.5, Math.sin(t * 1.1) * 1.6);
        kuyC.set({ sway: Math.sin(t * 1.9 - 1) * 3.6, hairLag: Math.sin(t * 1.9 - 2.2) * 3, glowK: 1 });
        shotCam(gC, t, c2, b0, 452, 1150, 1.6, 452, 1150, 1.7);
      }
    });
  }

  /* ================= S17 DESIS (L17) — mendesis, naik ke gelap, menjauh ke hutan ================= */
  {
    const sc = scene(world, 'desis', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    nightYard(gA, 541); const kuyA = Kuyang(gA, {}); fgThorns(gA);
    const setB = roofSet(gB, 551); const kuyB = Kuyang(gB, {});
    const setC = gardenSet(gC, 561); const rakaC = Raka(gC, { x: 430, y: GY, s: .98 }); const ditoC = Dito(gC, { x: 810, y: GY, s: .98 }); const kuyFar = farKuyang(gC); fgLeaves(gC);
    const c1 = T('L17%30'), c2 = T('L17%62'), a0 = lineT(17) - .17, b0 = lineT(17) + lineD(17) + .16;
    during('desis', 'desise', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        const lunge = 1 + Math.sin(clamp((t - lineT(17)) / .34) * Math.PI) * .1;  // desis: menerjang kecil ke kamera
        tr(kuyA.g, 486, 1072, 1.5 * lunge, Math.sin(t * 1.1) * 1.6);
        kuyA.set({ sway: Math.sin(t * 1.9 - 1) * 4.4, hairLag: Math.sin(t * 1.9 - 2.2) * 4, glowK: 1.2 });
        shotCam(gA, t, a0, c1, 480, 1060, 2.3, 480, 1060, 2.36);
      } else if (inB) {
        ambFog(setB, t);
        const pt = eio(clamp((t - c1) / (c2 - c1)));
        tr(kuyB.g, lerp(486, 620, pt), lerp(900, 260, pt), lerp(1.3, .55, pt), 4);
        kuyB.set({ sway: Math.sin(t * 2.6 - 1) * 7, hairLag: Math.sin(t * 2.6 - 2.1) * 6, glowK: .8 });
        shotCam(gB, t, c1, c2, 540, 800, 1.3, 540, 800, 1.2);
      } else {
        ambFog(setC, t, 340);
        const wk = clamp((t - c2) / .9), xe = 1 - Math.pow(1 - wk, 2);
        const ph = (t - c2) * TAU * 1.2;
        const dl = walkLeg(ph), dr = walkLeg(ph + Math.PI);
        ditoC.set({ la: [20 + Math.sin(ph) * 11, -22], ra: [17 - Math.sin(ph) * 11, -20], headR: -8, fear: .6, blink: blinkAt(t, .9), legL: [dl[0], dl[1]], legR: [dr[0], dr[1]] });
        tr(ditoC.g, lerp(810, 668, xe), GY - Math.abs(Math.sin(ph)) * 9 * (1 - wk * .4), .98);
        rakaC.set({ la: [30, -40], ra: [28, -38], headR: -12, fear: .5, blink: blinkAt(t, .3), legL: [64, -24], legR: [58, -30] }); // terduduk lemas
        const pt = clamp((t - c2) / (b0 - c2));
        setFar(kuyFar, t, lerp(760, 1010, pt), lerp(330, 210, pt), .34);
        kuyFar.g.setAttribute('opacity', (1 - pt).toFixed(2));
        shotCam(gC, t, c2, b0, 520, 1080, 1.12, 520, 1080, 1.17);
      }
    });
  }

  /* ================= S18 SUBUH (L18) — menjelang subuh hilang; kata Pak Darma ================= */
  {
    const sc = scene(world, 'subuh', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const setA = nightYard(gA, 571); const dawnA = E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#dawnGrad)' }, gA);
    const kuyA = farKuyang(gA);
    const setB = nightYard(gB, 581); const dawnB = E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#dawnGrad)', opacity: .85 }, gB);
    const darB = Darma(gB, { x: 612, y: GY, s: .98 }); const rakaB = Raka(gB, { x: 428, y: GY, s: .98 }); fgLeaves(gB);
    const setC = nightYard(gC, 591); const dawnC = E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#dawnGrad)', opacity: .85 }, gC);
    const rakaC = Raka(gC, { x: 428, y: GY, s: .98 }); fgRoof(gC);
    const c1 = T('L18%40'), c2 = T('L18%62'), a0 = lineT(18) - .16, b0 = lineT(18) + lineD(18) + .16;
    during('subuh', 'subuhe', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        ambYard(setA, t);
        const pt = clamp((t - a0) / (c1 - a0));
        if (pt < .8) { kuyA.g.style.display = ''; setFar(kuyA, t, lerp(760, 1030, pt), lerp(430, 560, pt), .3); kuyA.g.setAttribute('opacity', (1 - pt / .8).toFixed(2)); }
        else kuyA.g.style.display = 'none';
        shotCam(gA, t, a0, c1, 540, 1000, 1.10, 540, 1000, 1.16);
      } else if (inB) {
        ambYard(setB, t);
        const gest = Math.sin(clamp((t - (lineT(18) + 2.9)) / .3) * Math.PI) * 10;
        darB.set({ la: [18 - gest, -22 - gest * .5], ra: [18, -22], headR: -3, blink: blinkAt(t, 1.7) });
        rakaB.set({ la: [22, -26], ra: [20, -24], headR: 7, blink: (t % 4.1) < .3 });
        shotCam(gB, t, c1, c2, 520, 950, 1.4, 520, 950, 1.55);
      } else {
        ambYard(setC, t);
        rakaC.set({ la: [22, -26], ra: [20, -24], headR: 4 - 3 * eio(clamp((t - c2) / 1.2)), blink: (t % 4.1) < .35 });
        shotCam(gC, t, c2, b0, 428, 800, 1.55, 428, 800, 1.65);
      }
    });
  }

  /* ================= S19 PAHAM (L19) — twist: dia menunggu orang bodoh membuka pagarnya ================= */
  {
    const sc = scene(world, 'paham', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const tiedBundle = (shot) => {
      const b = E('g', {}, shot);
      E('path', { d: 'M404,1330 L476,1330 M404,1470 L476,1470', stroke: '#8a6f42', 'stroke-width': 7 }, b);
      for (let i = 0; i < 7; i++) { const bx = 396 + i * 15; E('path', { d: `M${bx},1310 C${bx + 6},1380 ${bx - 5},1440 ${bx + 3},1506`, fill: 'none', stroke: '#0d2013', 'stroke-width': 13, 'stroke-linecap': 'round' }, b); }
      return b;
    };
    const setA = nightYard(gA, 601); E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#dawnGrad)', opacity: .55 }, gA);
    tiedBundle(gA); const rakaA = Raka(gA, { x: 402, y: GY, s: .98 }); fgLeaves(gA);
    const setB = nightYard(gB, 611); E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#dawnGrad)', opacity: .55 }, gB);
    tiedBundle(gB); const gripB = gripHands(gB, 440, 1400); fgThorns(gB);
    const setC = nightYard(gC, 621); E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#dawnGrad)', opacity: .55 }, gC);
    const rakaC = Raka(gC, { x: 402, y: GY, s: .98 }); fgRoof(gC);
    const c1 = T('L19%30'), c2 = T('L19%60'), a0 = lineT(19) - .16, b0 = lineT(19) + lineD(19) + .16;
    during('paham', 'pahame', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        ambYard(setA, t);
        rakaA.set({ la: [20, -22], ra: [17, -20], headR: 9, blink: blinkAt(t, .3) });
        shotCam(gA, t, a0, c1, 440, 1180, 1.2, 440, 1180, 1.28);
      } else if (inB) {
        ambYard(setB, t);
        gripB.set(Math.sin(t * 1.4) * 2); // telapak bertumpu diam di ikat yang hampir ia buka
        shotCam(gB, t, c1, c2, 440, 1350, 2.3, 440, 1350, 2.36);
      } else {
        ambYard(setC, t);
        const settle = eio(clamp((t - c2) / 1.4));
        rakaC.set({ la: [20, -22], ra: [17, -20], headR: lerp(9, 2, settle), fear: lerp(.4, 0, settle), shock: lerp(.3, 0, settle), blink: blinkAt(t, .3) });
        shotCam(gC, t, c2, b0, 402, 810, 1.6, 402, 810, 1.7);
      }
    });
  }

  /* ================= S20 BODOH (L20) — orang bodoh itu hampir aku ================= */
  {
    const sc = scene(world, 'bodoh', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    nightYard(gA, 631); E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#dawnGrad)', opacity: .5 }, gA);
    const rakaA = Raka(gA, { x: 430, y: GY, s: .98 }); fgLeaves(gA);
    nightYard(gB, 641); E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#dawnGrad)', opacity: .5 }, gB);
    // tangan besar (prop ECU): telapak + jari + 3 goresan duri kemerahan
    const handB = E('g', {}, gB);
    E('path', { d: 'M470,1240 C450,1150 458,1060 486,990 L500,900 C503,876 528,876 531,900 L538,860 C541,834 568,834 571,860 L576,896 L584,852 C588,828 614,830 616,856 L620,920 L632,884 C638,862 662,868 660,892 C656,990 668,1120 650,1240 C620,1300 510,1300 470,1240Z', fill: '#cf9868', ...st(5) }, handB);
    [[512, 1060], [566, 1030], [612, 1080]].forEach(([sx, sy]) => E('path', { d: `M${sx},${sy} L${sx + 34},${sy + 52}`, stroke: '#b0402f', 'stroke-width': 6, 'stroke-linecap': 'round' }, handB));
    E('path', { d: 'M500,1180 Q570,1210 640,1176', fill: 'none', stroke: '#a06a42', 'stroke-width': 4, opacity: .7 }, handB);
    fgThorns(gB);
    nightYard(gC, 651); E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#dawnGrad)', opacity: .5 }, gC);
    const rakaC = Raka(gC, { x: 430, y: GY, s: .98 }); fgLeaves(gC);
    const c1 = T('L20%48'), c2 = T('L20%74'), a0 = lineT(20) - .17, b0 = lineT(20) + lineD(20) + .16;
    during('bodoh', 'bodohe', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        rakaA.set({ la: [-24, -96], ra: [17, -20], headR: 13, blink: blinkAt(t, .3) }); // menatap telapak sendiri
        shotCam(gA, t, a0, c1, 430, 900, 1.5, 430, 900, 1.6);
      } else if (inB) {
        handB.setAttribute('transform', `translate(${Math.sin(t * 27) * 1.6},0)`); // gemetar halus
        shotCam(gB, t, c1, c2, 566, 1090, 2.3, 566, 1090, 2.36);
      } else {
        const shake = Math.sin(clamp((t - c2) / .8) * Math.PI * 3) * (1 - clamp((t - c2) / .8)) * 4;
        rakaC.set({ la: [20, -22], ra: [17, -20], headR: 6 + shake, blink: blinkAt(t, .3) }); // geleng tak percaya pada diri sendiri
        shotCam(gC, t, c2, b0, 430, 950, 1.3, 430, 950, 1.4);
      }
    });
  }

  /* ================= S21 PERIKSA (L21) — tiap sore: periksa pagar ikat demi ikat ================= */
  {
    const sc = scene(world, 'periksa', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const dusk = (shot, op = .8) => E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#dawnGrad)', opacity: op }, shot);
    const setA = nightYard(gA, 661); dusk(gA); const rakaA = Raka(gA, { x: 210, y: GY, s: .98 }); fgLeaves(gA);
    const setB = nightYard(gB, 671); dusk(gB);
    const ropeB = E('path', { d: 'M196,1400 L340,1400', stroke: '#8a6f42', 'stroke-width': 8 }, gB);
    const gripB = gripHands(gB, 268, 1400); fgThorns(gB);
    const setC = nightYard(gC, 681); dusk(gC); E('rect', { x: 786, y: 1066, width: 148, height: 176, fill: '#140a10' }, gC); const sariC = BuSari(gC, { x: 983, y: GY, s: .92 }); const rakaC = Raka(gC, { x: 430, y: GY, s: .98 }); fgLeaves(gC);
    const c1 = T('L21%55'), c2 = T('L21%78'), a0 = lineT(21) - .16, b0 = lineT(21) + lineD(21) + .16;
    during('periksa', 'periksae', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        ambYard(setA, t);
        const wk = clamp((t - lineT(21)) / (c1 - lineT(21) - .1));
        const stopF = 1 - clamp((wk - .72) / .2);
        const ph = (t - lineT(21)) * TAU * .62;
        const wl = walkLeg(ph), wr = walkLeg(ph + Math.PI);
        rakaA.set({ la: [20 + Math.sin(ph) * 10 * stopF, -22], ra: [30 - Math.sin(ph) * 6 * stopF, -34 + (1 - stopF) * 22], headR: 6 + (1 - stopF) * 5, blink: blinkAt(t, .3), legL: [wl[0] * stopF, 4 + (wl[1] - 4) * stopF], legR: [wr[0] * stopF, 4 + (wr[1] - 4) * stopF] });
        tr(rakaA.g, lerp(210, 322, 1 - Math.pow(1 - wk, 2)), GY - Math.abs(Math.sin(ph)) * 8 * stopF, .98);
        shotCam(gA, t, a0, c1, 430, 1150, 1.15, 436, 1150, 1.2);
      } else if (inB) {
        ambYard(setB, t);
        const tug = Math.sin(clamp((t - c1) / .5) * Math.PI);
        ropeB.setAttribute('d', `M196,1400 Q268,${1400 - tug * 12} 340,1400`);
        gripB.set(tug * 8); // kedua tangan menarik tali — kontak di titik genggam
        shotCam(gB, t, c1, c2, 268, 1345, 2.3, 268, 1345, 2.36);
      } else {
        ambYard(setC, t);
        const wave = Math.sin(clamp((t - (c2 + .2)) / .6) * Math.PI * 2);
        sariC.set({ rock: Math.sin(t * .85) * 2.2, ra: [30 - wave * 18, -60], la: [-38, -96], headR: -4, blink: blinkAt(t, 1.1) });
        rakaC.set({ la: [20, -22], ra: [17 - wave * 14, -20 - wave * 16], headR: -5, blink: blinkAt(t, .3) });
        shotCam(gC, t, c2, b0, 700, 1050, 1.4, 700, 1050, 1.55);
      }
    });
  }

  /* ================= S22 RUMAHKU (L22) — jeruju mengelilingi halamanku ================= */
  {
    const sc = scene(world, 'rumahku', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const setA = rakaHouseSet(gA, 691); fgLeaves(gA);
    const setB = rakaHouseSet(gB, 701); const rakaB = Raka(gB, { x: 470, y: GY, s: .98 }); const ditoB = Dito(gB, { x: 660, y: GY, s: .98 }); fgLeaves(gB);
    rakaHouseSet(gC, 711);
    const ropeC = E('path', { d: 'M500,1406 Q588,1432 676,1406', stroke: '#8a6f42', 'stroke-width': 9 }, gC);
    const gripC = gripHands(gC, 588, 1406); fgThorns(gC);
    const c1 = T('L22%52'), c2 = T('L22%76'), a0 = lineT(22) - .17, b0 = lineT(22) + lineD(22) + .16;
    during('rumahku', 'rumahkue', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        ambFog(setA, t, 320);
        shotCam(gA, t, a0, c1, 540, 1080, 1.10, 540, 1080, 1.16);
      } else if (inB) {
        ambFog(setB, t, 320);
        const tie = Math.sin(t * 7) * 5;
        rakaB.set({ la: [20, -22], ra: [50 + tie, -36], headR: 9, blink: blinkAt(t, .3) });
        ditoB.set({ la: [36, -60], ra: [34, -58], headR: 8, blink: blinkAt(t, .9) }); // menahan tiang
        shotCam(gB, t, c1, c2, 560, 1150, 1.5, 560, 1150, 1.62);
      } else {
        const tight = eio(clamp((t - c2) / 1.1));
        ropeC.setAttribute('d', `M500,1406 Q588,${1432 - tight * 26} 676,1406`);
        gripC.set(tight * 7); // tangan menarik tali sampai kencang — "tidak kubiarkan ada celah"
        shotCam(gC, t, c2, b0, 588, 1400, 2.3, 588, 1400, 2.38);
      }
    });
  }

  /* ================= S23 WARGA (L23) — warga tak lagi menyebutnya kelelawar ================= */
  {
    const sc = scene(world, 'warga', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const dusk = (shot) => E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#dawnGrad)', opacity: .45 }, shot);
    const setA = streetSet(gA, 721); dusk(gA);
    const darA = Darma(gA, { x: 380, y: GY, s: .95 }); const ibuA = IbuTua(gA, { x: 540, y: GY, s: .95 }); const lelA = LelakiKurus(gA, { x: 706, y: GY, s: .95 }); const dogA = Dog(gA, { x: 856, y: GY, s: .9 }); fgLeaves(gA);
    const setB = streetSet(gB, 731); dusk(gB);
    const darB = Darma(gB, { x: 380, y: GY, s: .95 }); const ibuB = IbuTua(gB, { x: 540, y: GY, s: .95 }); const lelB = LelakiKurus(gB, { x: 706, y: GY, s: .95 }); const dogB = Dog(gB, { x: 770, y: GY, s: .9 });
    const setC = streetSet(gC, 741); dusk(gC);
    const batC = E('g', {}, gC);
    E('path', { d: 'M0,0 Q-40,-30 -74,-8 Q-36,-2 0,8 Q36,-2 74,-8 Q40,-30 0,0Z', fill: '#05070d' }, batC);
    const darC = Darma(gC, { x: 380, y: GY, s: .8 }); const ibuC = IbuTua(gC, { x: 520, y: GY, s: .8 }); const lelC = LelakiKurus(gC, { x: 676, y: GY, s: .8 });
    const c1 = T('L23%48'), c2 = T('L23%72'), a0 = lineT(23) - .16, b0 = lineT(23) + lineD(23) + .16;
    during('warga', 'wargae', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        ambFog(setA, t, 420);
        const gest = Math.sin(clamp((t - (lineT(23) + .6)) / .3) * Math.PI) * 9;
        darA.set({ la: [18 - gest, -22], ra: [18, -22], headR: 3, blink: blinkAt(t, 1.7) });
        ibuA.set({ la: [18, -20], ra: [16, -18], headR: -4, blink: blinkAt(t, 1.3) });
        lelA.set({ la: [16, -18], ra: [15, -17], headR: 4, blink: blinkAt(t, .6) });
        dogA.set({ headUp: .15, tailWag: .5, t });
        shotCam(gA, t, a0, c1, 540, 1080, 1.12, 540, 1080, 1.17);
      } else if (inB) {
        ambFog(setB, t, 420);
        const hu = eio(clamp((t - c1) / .6));
        dogB.set({ headUp: hu, tailWag: .1, tremble: hu * .6, t });
        const up1 = eio(clamp((t - (c1 + .25)) / .45)), up2 = eio(clamp((t - (c1 + .4)) / .45)), up3 = eio(clamp((t - (c1 + .55)) / .45));
        darB.set({ la: [18, -22], ra: [18, -22], headR: lerp(0, -13, up1), blink: blinkAt(t, 1.7) });
        ibuB.set({ la: [18, -20], ra: [16, -18], headR: lerp(0, -12, up2), blink: blinkAt(t, 1.3) });
        lelB.set({ la: [16, -18], ra: [15, -17], headR: lerp(0, -14, up3), fear: .3, blink: blinkAt(t, .6) });
        shotCam(gB, t, c1, c2, 620, 980, 1.5, 620, 980, 1.62);
      } else {
        ambFog(setC, t, 420);
        const pt = clamp((t - c2) / (b0 - c2));
        tr(batC, lerp(60, 1020, pt), 420 + Math.sin(pt * 8) * 22, .9, Math.sin(pt * 8) * 5);
        darC.set({ la: [18, -22], ra: [18, -22], headR: -12, blink: blinkAt(t, 1.7) });
        ibuC.set({ la: [18, -20], ra: [16, -18], headR: -11, blink: blinkAt(t, 1.3) });
        lelC.set({ la: [16, -18], ra: [15, -17], headR: -13, blink: blinkAt(t, .6) });
        shotCam(gC, t, c2, b0, 540, 760, 1.2, 540, 760, 1.28);
      }
    });
  }

  /* ================= S24 RAMBUT (L24) — residu: sehelai rambut panjang tersangkut ================= */
  {
    const sc = scene(world, 'rambut', 'cut');
    const gA = E('g', {}, sc.cam), gB = E('g', {}, sc.cam), gC = E('g', {}, sc.cam);
    const dusk = (shot) => E('rect', { x: -320, y: -320, width: 1720, height: 2760, fill: 'url(#dawnGrad)', opacity: .35 }, shot);
    const setA = nightYard(gA, 751); dusk(gA); fgThorns(gA);
    const setB = nightYard(gB, 761); dusk(gB);
    for (let i = 0; i < 7; i++) { const bx = 396 + i * 15; E('path', { d: `M${bx},1310 C${bx + 6},1380 ${bx - 5},1440 ${bx + 3},1506`, fill: 'none', stroke: '#0d2013', 'stroke-width': 13, 'stroke-linecap': 'round' }, gB); }
    E('path', { d: 'M404,1400 L476,1400', stroke: '#8a6f42', 'stroke-width': 8 }, gB);
    const strand = E('g', {}, gB);
    const strandP = E('path', { d: 'M452,1396 C446,1460 460,1520 450,1586 C444,1626 452,1660 448,1690', fill: 'none', stroke: '#05070c', 'stroke-width': 8.5, 'stroke-linecap': 'round' }, strand);
    E('path', { d: 'M458,1398 C454,1450 464,1506 458,1560', fill: 'none', stroke: '#0a0d14', 'stroke-width': 4, 'stroke-linecap': 'round' }, strand);
    fgThorns(gB);
    const setC = nightYard(gC, 771); dusk(gC); fgLeaves(gC);
    const c1 = T('L24%55'), c2 = T('L24%78'), a0 = lineT(24) - .16, b0 = lineT(24) + lineD(24) + .8;
    during('rambut', 'rambute', (t) => {
      const inB = t >= c1 && t < c2, inC = t >= c2;
      gA.style.display = inB || inC ? 'none' : ''; gB.style.display = inB ? '' : 'none'; gC.style.display = inC ? '' : 'none';
      if (!inB && !inC) {
        ambYard(setA, t);
        shotCam(gA, t, a0, c1, lerp(320, 470, clamp((t - a0) / (c1 - a0))), 1400, 1.3, lerp(320, 470, clamp((t - a0) / (c1 - a0))), 1400, 1.4);
      } else if (inB) {
        ambYard(setB, t);
        strand.setAttribute('transform', `rotate(${(Math.sin(t * .9) * 3.4).toFixed(2)} 452 1396)`); // helai rambut berayun — fase absolut
        shotCam(gB, t, c1, c2, 446, 1420, 2.32, 446, 1420, 2.38);
      } else {
        ambYard(setC, t);
        shotCam(gC, t, c2, b0, 560, 1100, 1.10, 560, 1100, 1.15);
      }
    });
  }
};
