/**
 * Sector Landscapes — paysages cosmiques animés propres à chaque secteur
 * Même moteur que la galaxie d'accueil (Canvas 2D, calques pré-rendus, 60fps max,
 * une seule boucle rAF) mais une scène différente, teintée de la couleur de l'étoile :
 * - competences : pulsar & nébuleuse annulaire (cyan)
 * - stage-unova : étoile géante ambrée, protubérances & ceinture d'astéroïdes (ambre)
 * - projets     : galaxie spirale vue par la tranche (bleu ciel)
 * - parcours    : fleuve d'étoiles / voie lactée qui s'écoule (violet)
 * - contact     : horizon planétaire, aurores & balise de communication (émeraude)
 *
 * Une seule scène tourne à la fois, et uniquement quand un secteur est ouvert
 * (la galaxie d'accueil est alors en pause).
 */

import { getQuality, isSuspended, onPerfChange, reportFrame } from './perf.js';

const TAU = Math.PI * 2;

/* ==========================================================================
   OUTILS
   ========================================================================== */

// Aléatoire déterministe : chaque secteur garde la même composition à chaque visite
function seededRandom(seed) {
  return function () {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Approximation gaussienne centrée sur 0 (≈ -1..1)
function gauss(rand) {
  return (rand() + rand() + rand() - 1.5) / 1.5;
}

function pick(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

function createLayer(w, h) {
  const layer = document.createElement('canvas');
  layer.width = Math.max(1, Math.ceil(w));
  layer.height = Math.max(1, Math.ceil(h));
  return layer;
}

// Halo doux pré-rendu, réutilisé via drawImage (aucun dégradé recréé par frame)
function makeGlowSprite(rgb, core = 1, mid = 0.35, size = 128) {
  const c = createLayer(size, size);
  const g = c.getContext('2d');
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, `rgba(${rgb}, ${core})`);
  grad.addColorStop(0.4, `rgba(${rgb}, ${mid})`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

function drawSprite(ctx, sprite, x, y, radius) {
  ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
}

function drawDiffractionStar(ctx, x, y, radius, spikeLen, alpha, color) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.5);
  glowGrad.addColorStop(0, '#ffffff');
  glowGrad.addColorStop(0.3, color);
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(x, y, radius * 3.5, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.9, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - spikeLen, y);
  ctx.lineTo(x + spikeLen, y);
  ctx.moveTo(x, y - spikeLen);
  ctx.lineTo(x, y + spikeLen);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 0.8;
  const diagLen = spikeLen * 0.45;
  ctx.beginPath();
  ctx.moveTo(x - diagLen, y - diagLen);
  ctx.lineTo(x + diagLen, y + diagLen);
  ctx.moveTo(x - diagLen, y + diagLen);
  ctx.lineTo(x + diagLen, y - diagLen);
  ctx.stroke();

  ctx.restore();
}

/* ==========================================================================
   SCÈNES
   ========================================================================== */

const SCENES = {
  /* ------------------------------------------------------------------------
     STACK TECHNIQUE — Pulsar cyan au cœur d'une nébuleuse annulaire,
     faisceaux tournants et ondes de choc périodiques
     ------------------------------------------------------------------------ */
  competences: {
    seed: 11,
    rgb: '103, 232, 249',
    color: '#67e8f9',
    starTints: ['#a5f3fc', '#c7d2fe'],
    bgFocus: [0.7, 0.42],
    accentRgb: '129, 140, 248',
    accentFocus: [0.15, 0.85],
    spikes: [
      { x: 0.1, y: 0.18, size: 5.5, spikeLen: 30, color: '#a5f3fc' },
      { x: 0.32, y: 0.8, size: 4.8, spikeLen: 26, color: '#818cf8' },
      { x: 0.93, y: 0.84, size: 5.2, spikeLen: 28, color: '#67e8f9' }
    ],

    build({ width: W, height: H, rand, density }) {
      const R = Math.min(W, H) * 0.34;
      const palette = ['103, 232, 249', '129, 140, 248', '45, 212, 191', '186, 230, 253'];

      // Nébuleuse annulaire pré-rendue (tourne en bloc à chaque frame)
      const extent = R * 1.55;
      const scale = Math.min(1, 420 / extent);
      const shell = createLayer(extent * 2 * scale, extent * 2 * scale);
      const sctx = shell.getContext('2d');
      sctx.translate(shell.width / 2, shell.height / 2);
      sctx.scale(scale, scale);
      sctx.globalCompositeOperation = 'lighter';
      const sprites = palette.map(rgb => makeGlowSprite(rgb, 1, 0.3));
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * TAU + (rand() - 0.5) * 0.25;
        const rr = R * (0.8 + rand() * 0.38);
        sctx.globalAlpha = 0.08 + rand() * 0.12;
        drawSprite(sctx, sprites[Math.floor(rand() * sprites.length)],
          Math.cos(a) * rr, Math.sin(a) * rr, R * (0.16 + rand() * 0.22));
      }
      // Filaments ténus
      sctx.globalAlpha = 1;
      sctx.lineWidth = 1;
      for (let i = 0; i < 9; i++) {
        const a0 = rand() * TAU;
        const rr = R * (0.85 + rand() * 0.3);
        sctx.strokeStyle = `rgba(${pick(rand, palette)}, ${0.12 + rand() * 0.12})`;
        sctx.beginPath();
        sctx.arc(0, 0, rr, a0, a0 + 0.6 + rand() * 1.2);
        sctx.stroke();
      }

      const dust = [];
      for (let i = 0, n = Math.round(150 * density); i < n; i++) {
        dust.push({
          a: rand() * TAU,
          r: R * (0.7 + rand() * 0.55),
          speed: (0.0004 + rand() * 0.0008) * (rand() < 0.15 ? -1 : 1),
          size: rand() * 1.5 + 0.5,
          alpha: rand() * 0.6 + 0.3,
          color: pick(rand, ['#67e8f9', '#a5f3fc', '#818cf8', '#ffffff'])
        });
      }

      return {
        R, shell, extent, dust,
        rings: [], nextRing: 0, rot: 0,
        halo: makeGlowSprite('103, 232, 249', 0.5, 0.12),
        core: makeGlowSprite('224, 251, 255', 1, 0.45)
      };
    },

    draw(ctx, { width: W, height: H, mx, my }, t, s) {
      const cx = W * 0.7 + mx * 30;
      const cy = H * 0.42 + my * 24;
      const R = s.R;
      const flat = 0.78;
      s.rot += 0.0005;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = 'lighter';

      ctx.globalAlpha = 0.55;
      drawSprite(ctx, s.halo, 0, 0, R * 1.9);
      ctx.globalAlpha = 1;

      // Coquille de la nébuleuse
      ctx.save();
      ctx.scale(1, flat);
      ctx.rotate(s.rot);
      ctx.drawImage(s.shell, -s.extent, -s.extent, s.extent * 2, s.extent * 2);
      ctx.restore();

      // Ondes de choc du pulsar
      if (t > s.nextRing) {
        s.rings.push(t);
        s.nextRing = t + 2600;
      }
      ctx.lineWidth = 1.4;
      for (let i = s.rings.length - 1; i >= 0; i--) {
        const p = (t - s.rings[i]) / 4200;
        if (p >= 1) {
          s.rings.splice(i, 1);
          continue;
        }
        const r = R * (0.12 + p * 1.5);
        ctx.strokeStyle = `rgba(165, 243, 252, ${(1 - p) * 0.32})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * flat, 0, 0, TAU);
        ctx.stroke();
      }

      // Faisceaux tournants (effet phare)
      const beat = Math.pow(Math.max(0, Math.sin(t * 0.0045)), 6);
      const beamAngle = t * 0.00035;
      const L = R * 2.3;
      const w = 0.05;
      for (let k = 0; k < 2; k++) {
        const a = beamAngle + k * Math.PI;
        const tipX = Math.cos(a) * L;
        const tipY = Math.sin(a) * L * flat;
        const grad = ctx.createLinearGradient(0, 0, tipX, tipY);
        grad.addColorStop(0, `rgba(207, 250, 254, ${0.22 + beat * 0.2})`);
        grad.addColorStop(1, 'rgba(103, 232, 249, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a - w) * L, Math.sin(a - w) * L * flat);
        ctx.lineTo(Math.cos(a + w) * L, Math.sin(a + w) * L * flat);
        ctx.closePath();
        ctx.fill();
      }

      // Poussière en orbite
      for (let i = 0; i < s.dust.length; i++) {
        const d = s.dust[i];
        d.a += d.speed;
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(Math.cos(d.a + s.rot) * d.r, Math.sin(d.a + s.rot) * d.r * flat, d.size, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Cœur du pulsar
      drawSprite(ctx, s.core, 0, 0, R * (0.2 + beat * 0.06));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3 + beat * 1.5, 0, TAU);
      ctx.fill();

      ctx.restore();
    }
  },

  /* ------------------------------------------------------------------------
     STAGE UNOVA — Étoile géante ambrée qui se lève dans le coin,
     protubérances solaires, braises et ceinture d'astéroïdes
     ------------------------------------------------------------------------ */
  'stage-unova': {
    seed: 23,
    rgb: '245, 158, 11',
    color: '#f59e0b',
    starTints: ['#fde68a', '#fdba74'],
    bgFocus: [0.12, 0.92],
    accentRgb: '244, 114, 182',
    accentFocus: [0.85, 0.15],
    spikes: [
      { x: 0.78, y: 0.16, size: 5.5, spikeLen: 30, color: '#fbbf24' },
      { x: 0.55, y: 0.06, size: 4.5, spikeLen: 24, color: '#fdba74' },
      { x: 0.92, y: 0.62, size: 5, spikeLen: 26, color: '#f59e0b' }
    ],

    build({ width: W, height: H, rand, density }) {
      const Rs = Math.max(W, H) * 0.19;

      // Disque stellaire avec granulation, pré-rendu
      const scale = Math.min(1, 256 / Rs);
      const size = Rs * 2 * scale;
      const star = createLayer(size, size);
      const g = star.getContext('2d');
      const r = star.width / 2;
      const disc = g.createRadialGradient(r, r, 0, r, r, r);
      disc.addColorStop(0, 'rgb(255, 246, 214)');
      disc.addColorStop(0.45, 'rgb(253, 200, 90)');
      disc.addColorStop(0.82, 'rgb(245, 158, 11)');
      disc.addColorStop(1, 'rgb(194, 65, 12)');
      g.fillStyle = disc;
      g.beginPath();
      g.arc(r, r, r, 0, TAU);
      g.fill();
      g.globalCompositeOperation = 'source-atop';
      const hot = makeGlowSprite('255, 247, 200', 1, 0.3, 64);
      const cool = makeGlowSprite('154, 52, 18', 1, 0.3, 64);
      for (let i = 0; i < 220; i++) {
        const a = rand() * TAU;
        const d = Math.sqrt(rand()) * r;
        g.globalAlpha = 0.08 + rand() * 0.14;
        drawSprite(g, rand() < 0.55 ? hot : cool, r + Math.cos(a) * d, r + Math.sin(a) * d, r * (0.04 + rand() * 0.1));
      }

      // La partie visible du limbe est l'arc haut-droit (étoile dans le coin bas-gauche)
      const arcFrom = -Math.PI * 0.62;
      const arcTo = Math.PI * 0.06;
      const prominences = [];
      for (let i = 0; i < 7; i++) {
        prominences.push({
          angle: arcFrom + rand() * (arcTo - arcFrom),
          span: 0.06 + rand() * 0.12,
          h: Rs * (0.07 + rand() * 0.16),
          phase: rand() * TAU,
          speed: 0.0006 + rand() * 0.0008
        });
      }

      const embers = [];
      for (let i = 0, n = Math.round(110 * density); i < n; i++) {
        embers.push({
          a: arcFrom + rand() * (arcTo - arcFrom),
          d: Rs * (1 + rand() * 0.7),
          v: 0.15 + rand() * 0.45,
          size: rand() * 1.6 + 0.5,
          color: pick(rand, ['#fbbf24', '#fdba74', '#fde68a', '#fb923c'])
        });
      }

      const belt = [];
      for (let i = 0, n = Math.round(420 * density); i < n; i++) {
        belt.push({
          a: rand() * TAU,
          r: Rs * (1.6 + rand() * 0.35),
          speed: 0.0003 + rand() * 0.0003,
          size: rand() * 1.6 + 0.7,
          alpha: rand() * 0.5 + 0.4,
          color: pick(rand, ['#fcd34d', '#d6d3d1', '#fdba74'])
        });
      }

      return {
        Rs, star, prominences, embers, belt, arcFrom, arcTo,
        planet: { a: 5.2, r: Rs * 2.4, size: Math.max(9, Rs * 0.05) },
        corona: makeGlowSprite('245, 158, 11', 0.6, 0.2),
        rot: 0
      };
    },

    draw(ctx, { width: W, height: H, mx, my }, t, s) {
      const cx = W * 0.03 + mx * 18;
      const cy = H * 1.02 + my * 14;
      const Rs = s.Rs;
      const tilt = -0.42;
      const flat = 0.38;

      ctx.save();
      ctx.translate(cx, cy);

      // Couronne
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.75;
      drawSprite(ctx, s.corona, 0, 0, Rs * 2.2 * (1 + Math.sin(t * 0.0009) * 0.04));
      ctx.globalAlpha = 1;

      // Ceinture d'astéroïdes et planète : moitié arrière d'abord, cachée par l'étoile
      const planet = s.planet;
      planet.a += 0.00022;
      const drawBelt = (front) => {
        ctx.save();
        ctx.rotate(tilt);
        for (let i = 0; i < s.belt.length; i++) {
          const b = s.belt[i];
          if (front === Math.sin(b.a) < 0) continue;
          ctx.globalAlpha = b.alpha * (front ? 1 : 0.55);
          ctx.fillStyle = b.color;
          ctx.fillRect(Math.cos(b.a) * b.r, Math.sin(b.a) * b.r * flat, b.size, b.size);
        }
        ctx.globalAlpha = 1;
        if (front !== Math.sin(planet.a) < 0) {
          const px = Math.cos(planet.a) * planet.r;
          const py = Math.sin(planet.a) * planet.r * flat;
          const lit = ctx.createRadialGradient(px - planet.size * 0.45, py, 0, px, py, planet.size);
          lit.addColorStop(0, '#fde68a');
          lit.addColorStop(0.5, '#b45309');
          lit.addColorStop(1, '#1c1208');
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = lit;
          ctx.beginPath();
          ctx.arc(px, py, planet.size, 0, TAU);
          ctx.fill();
          ctx.globalCompositeOperation = 'lighter';
        }
        ctx.restore();
      };
      for (let i = 0; i < s.belt.length; i++) s.belt[i].a += s.belt[i].speed;
      drawBelt(false);

      // Disque de l'étoile (rotation très lente de la granulation)
      ctx.globalCompositeOperation = 'source-over';
      s.rot += 0.00012;
      ctx.save();
      ctx.rotate(s.rot);
      ctx.globalAlpha = 0.88;
      ctx.drawImage(s.star, -Rs, -Rs, Rs * 2, Rs * 2);
      ctx.globalAlpha = 1;
      ctx.restore();

      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(253, 230, 138, 0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, Rs, s.arcFrom - 0.3, s.arcTo + 0.3);
      ctx.stroke();

      // Protubérances solaires
      ctx.lineCap = 'round';
      for (let i = 0; i < s.prominences.length; i++) {
        const p = s.prominences[i];
        const h = p.h * (0.65 + 0.35 * Math.sin(t * p.speed + p.phase));
        const a0 = p.angle - p.span / 2;
        const a1 = p.angle + p.span / 2;
        const ctrl = Rs + h * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a0) * Rs, Math.sin(a0) * Rs);
        ctx.quadraticCurveTo(Math.cos(p.angle) * ctrl, Math.sin(p.angle) * ctrl, Math.cos(a1) * Rs, Math.sin(a1) * Rs);
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.4)';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Braises éjectées
      for (let i = 0; i < s.embers.length; i++) {
        const e = s.embers[i];
        e.d += e.v;
        if (e.d > Rs * 1.75) e.d = Rs * 1.01;
        const life = 1 - (e.d - Rs) / (Rs * 0.75);
        ctx.globalAlpha = Math.max(0, life) * 0.85;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(Math.cos(e.a) * e.d, Math.sin(e.a) * e.d, e.size, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      drawBelt(true);
      ctx.restore();
    }
  },

  /* ------------------------------------------------------------------------
     PROJETS & SAE — Galaxie spirale vue par la tranche, bulbe doré,
     bande de poussière et étoiles en orbite avec profondeur avant/arrière
     ------------------------------------------------------------------------ */
  projets: {
    seed: 37,
    rgb: '56, 189, 248',
    color: '#38bdf8',
    starTints: ['#bae6fd', '#fde68a'],
    bgFocus: [0.6, 0.48],
    accentRgb: '99, 102, 241',
    accentFocus: [0.1, 0.12],
    spikes: [
      { x: 0.08, y: 0.62, size: 5.2, spikeLen: 28, color: '#7dd3fc' },
      { x: 0.42, y: 0.12, size: 4.6, spikeLen: 24, color: '#38bdf8' },
      { x: 0.86, y: 0.88, size: 5.4, spikeLen: 30, color: '#bae6fd' }
    ],

    build({ width: W, height: H, rand, density }) {
      const L = Math.max(W, H) * 0.5;

      // Disque vu par la tranche, pré-rendu (non incliné)
      const scale = Math.min(1, 380 / L);
      const disk = createLayer(L * 2.3 * scale, L * 0.9 * scale);
      const d = disk.getContext('2d');
      d.translate(disk.width / 2, disk.height / 2);
      d.scale(scale, scale);

      const ellipseGlow = (rx, ratio, stops) => {
        d.save();
        d.scale(1, ratio);
        const grad = d.createRadialGradient(0, 0, 0, 0, 0, rx);
        stops.forEach(([o, c]) => grad.addColorStop(o, c));
        d.fillStyle = grad;
        d.beginPath();
        d.arc(0, 0, rx, 0, TAU);
        d.fill();
        d.restore();
      };

      d.globalCompositeOperation = 'lighter';
      ellipseGlow(L * 1.05, 0.34, [[0, 'rgba(56, 189, 248, 0.12)'], [1, 'rgba(56, 189, 248, 0)']]);
      ellipseGlow(L, 0.14, [[0, 'rgba(125, 211, 252, 0.5)'], [0.5, 'rgba(56, 189, 248, 0.18)'], [1, 'rgba(56, 189, 248, 0)']]);

      const clumpSprites = ['125, 211, 252', '224, 242, 254', '244, 114, 182'].map(rgb => makeGlowSprite(rgb, 1, 0.3, 64));
      for (let i = 0; i < 110; i++) {
        const x = gauss(rand) * L * 0.95;
        const y = gauss(rand) * L * 0.035;
        d.globalAlpha = 0.12 + rand() * 0.22;
        drawSprite(d, rand() < 0.12 ? clumpSprites[2] : clumpSprites[Math.floor(rand() * 2)], x, y, L * (0.012 + rand() * 0.035));
      }
      d.globalAlpha = 1;

      ellipseGlow(L * 0.24, 0.62, [
        [0, 'rgba(255, 247, 230, 0.95)'],
        [0.3, 'rgba(251, 191, 36, 0.5)'],
        [1, 'rgba(56, 189, 248, 0)']
      ]);

      // Bande de poussière sombre, légèrement décalée sous le plan
      d.globalCompositeOperation = 'source-over';
      d.save();
      d.translate(0, L * 0.012);
      ellipseGlow(L * 0.95, 0.028, [[0, 'rgba(3, 5, 10, 0.8)'], [0.65, 'rgba(3, 5, 10, 0.45)'], [1, 'rgba(3, 5, 10, 0)']]);
      d.restore();

      const orbiters = [];
      for (let i = 0, n = Math.round(260 * density); i < n; i++) {
        const r = L * (0.06 + Math.pow(rand(), 0.8) * 0.95);
        orbiters.push({
          a: rand() * TAU,
          r,
          speed: (0.0011 / (r / L + 0.35)) * (0.8 + rand() * 0.4),
          off: gauss(rand) * L * 0.02,
          size: rand() * 1.6 + 0.5,
          alpha: rand() * 0.6 + 0.35,
          color: r < L * 0.2 ? pick(rand, ['#fde68a', '#fbbf24', '#ffffff']) : pick(rand, ['#7dd3fc', '#bae6fd', '#ffffff', '#38bdf8'])
        });
      }

      // Galaxies lointaines en arrière-plan
      const farSprites = [makeGlowSprite('125, 211, 252', 0.9, 0.25, 64), makeGlowSprite('253, 230, 138', 0.9, 0.25, 64)];
      const distant = [[0.12, 0.2], [0.3, 0.86], [0.9, 0.3], [0.7, 0.9]].map(([x, y]) => ({
        x, y,
        size: 18 + rand() * 26,
        ratio: 0.3 + rand() * 0.3,
        angle: rand() * Math.PI,
        sprite: pick(rand, farSprites),
        alpha: 0.35 + rand() * 0.3
      }));

      return {
        L, disk, orbiters, distant,
        bulge: makeGlowSprite('255, 237, 200', 0.7, 0.2)
      };
    },

    draw(ctx, { width: W, height: H, mx, my }, t, s) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < s.distant.length; i++) {
        const g = s.distant[i];
        ctx.save();
        ctx.translate(g.x * W + mx * 8, g.y * H + my * 6);
        ctx.rotate(g.angle + t * 0.00002);
        ctx.scale(1, g.ratio);
        ctx.globalAlpha = g.alpha;
        drawSprite(ctx, g.sprite, 0, 0, g.size);
        ctx.restore();
      }
      ctx.restore();

      const L = s.L;
      const flat = 0.1;
      ctx.save();
      ctx.translate(W * 0.6 + mx * 30, H * 0.48 + my * 22);
      ctx.rotate(-0.32);
      ctx.globalCompositeOperation = 'lighter';

      const drawOrbiters = (front) => {
        for (let i = 0; i < s.orbiters.length; i++) {
          const o = s.orbiters[i];
          const sin = Math.sin(o.a);
          if (front === sin < 0) continue;
          ctx.globalAlpha = o.alpha * (front ? 1 : 0.4);
          ctx.fillStyle = o.color;
          ctx.beginPath();
          ctx.arc(Math.cos(o.a) * o.r, sin * o.r * flat + o.off, o.size, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      };

      for (let i = 0; i < s.orbiters.length; i++) s.orbiters[i].a += s.orbiters[i].speed;
      drawOrbiters(false);

      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(s.disk, -L * 1.15, -L * 0.45, L * 2.3, L * 0.9);

      ctx.globalCompositeOperation = 'lighter';
      ctx.save();
      ctx.scale(1, 0.6);
      drawSprite(ctx, s.bulge, 0, 0, L * 0.2 * (1 + Math.sin(t * 0.0011) * 0.05));
      ctx.restore();

      drawOrbiters(true);
      ctx.restore();
    }
  },

  /* ------------------------------------------------------------------------
     PARCOURS — Fleuve d'étoiles violet qui traverse le ciel en diagonale,
     particules qui s'écoulent le long du chemin et jalons lumineux
     ------------------------------------------------------------------------ */
  parcours: {
    seed: 53,
    rgb: '167, 139, 250',
    color: '#a78bfa',
    starTints: ['#ddd6fe', '#fbcfe8'],
    bgFocus: [0.5, 0.5],
    accentRgb: '244, 114, 182',
    accentFocus: [0.88, 0.1],
    spikes: [
      { x: 0.86, y: 0.72, size: 4.8, spikeLen: 24, color: '#c4b5fd' },
      { x: 0.08, y: 0.14, size: 5, spikeLen: 26, color: '#f9a8d4' }
    ],

    build({ width: W, height: H, rand, density }) {
      // Chemin du fleuve : du bas-gauche vers le haut-droit, légèrement ondulé
      const path = (u) => ({
        x: W * (-0.1 + 1.2 * u),
        y: H * (0.92 - 0.84 * u) + Math.sin(u * TAU * 1.1 + 0.6) * H * 0.09
      });
      const normal = (u) => {
        const dx = W * 1.2;
        const dy = H * (-0.84 + Math.cos(u * TAU * 1.1 + 0.6) * TAU * 1.1 * 0.09);
        const len = Math.hypot(dx, dy);
        return { x: -dy / len, y: dx / len };
      };
      const spread = Math.min(W, H) * 0.11;

      // Bande nébuleuse pré-rendue à demi-résolution
      const scale = 0.5;
      const band = createLayer(W * scale, H * scale);
      const b = band.getContext('2d');
      b.scale(scale, scale);
      b.globalCompositeOperation = 'lighter';
      const colors = ['167, 139, 250', '244, 114, 182', '99, 102, 241', '221, 214, 254'];
      const sprites = colors.map(rgb => makeGlowSprite(rgb, 1, 0.3));
      for (let i = 0; i < 150; i++) {
        const u = rand();
        const p = path(u);
        const n = normal(u);
        const off = gauss(rand) * spread;
        b.globalAlpha = 0.05 + rand() * 0.11;
        drawSprite(b, sprites[i % 7 === 0 ? 1 : pick(rand, [0, 0, 2, 3])], p.x + n.x * off, p.y + n.y * off, Math.min(W, H) * (0.06 + rand() * 0.12));
      }
      // Poussière stellaire fixe très fine
      b.fillStyle = '#ede9fe';
      for (let i = 0; i < 420; i++) {
        const u = rand();
        const p = path(u);
        const n = normal(u);
        const off = gauss(rand) * spread * 0.8;
        b.globalAlpha = 0.15 + rand() * 0.35;
        b.fillRect(p.x + n.x * off, p.y + n.y * off, 1.2, 1.2);
      }
      // Nuages sombres qui structurent la bande
      b.globalCompositeOperation = 'source-over';
      const dark = makeGlowSprite('3, 4, 10', 1, 0.5, 64);
      for (let i = 0; i < 40; i++) {
        const u = rand();
        const p = path(u);
        const n = normal(u);
        const off = gauss(rand) * spread * 0.4;
        b.globalAlpha = 0.25 + rand() * 0.25;
        drawSprite(b, dark, p.x + n.x * off, p.y + n.y * off, Math.min(W, H) * (0.02 + rand() * 0.05));
      }

      const flow = [];
      for (let i = 0, n = Math.round(300 * density); i < n; i++) {
        flow.push({
          u: rand() * 1.1 - 0.05,
          off: gauss(rand) * spread * 0.75,
          speed: 0.00018 + rand() * 0.0005,
          size: rand() * 1.6 + 0.5,
          alpha: rand() * 0.6 + 0.3,
          twinkle: rand() * TAU,
          color: pick(rand, ['#c4b5fd', '#ddd6fe', '#f9a8d4', '#ffffff', '#a78bfa'])
        });
      }

      // Jalons du parcours le long du fleuve
      const milestones = [0.14, 0.34, 0.54, 0.74, 0.9].map((u, i) => ({
        ...path(u),
        color: i % 2 ? '#f9a8d4' : '#c4b5fd',
        phase: i * 1.3
      }));

      return { path, normal, band, flow, milestones };
    },

    draw(ctx, { width: W, height: H, mx, my }, t, s) {
      const ox = mx * 16;
      const oy = my * 12;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.85 + Math.sin(t * 0.0004) * 0.15;
      ctx.drawImage(s.band, ox, oy, W, H);

      for (let i = 0; i < s.flow.length; i++) {
        const f = s.flow[i];
        f.u += f.speed;
        if (f.u > 1.05) f.u = -0.05;
        f.twinkle += 0.03;
        const p = s.path(f.u);
        const n = s.normal(f.u);
        ctx.globalAlpha = f.alpha * (0.7 + Math.sin(f.twinkle) * 0.3);
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(p.x + n.x * f.off + ox * 1.4, p.y + n.y * f.off + oy * 1.4, f.size, 0, TAU);
        ctx.fill();
      }
      ctx.restore();

      for (let i = 0; i < s.milestones.length; i++) {
        const m = s.milestones[i];
        const pulse = Math.sin(t * 0.0012 + m.phase);
        drawDiffractionStar(ctx, m.x + ox * 1.6, m.y + oy * 1.6, 4.5, 22 * (1 + pulse * 0.2), 0.8 + pulse * 0.2, m.color);
      }
    }
  },

  /* ------------------------------------------------------------------------
     COMMUNICATION — Horizon d'une planète, atmosphère émeraude,
     aurores ondulantes et balise qui émet des signaux
     ------------------------------------------------------------------------ */
  contact: {
    seed: 71,
    rgb: '52, 211, 153',
    color: '#34d399',
    starTints: ['#a7f3d0', '#c4b5fd'],
    bgFocus: [0.5, 0.85],
    accentRgb: '139, 92, 246',
    accentFocus: [0.2, 0.1],
    spikes: [
      { x: 0.12, y: 0.2, size: 5, spikeLen: 26, color: '#6ee7b7' },
      { x: 0.46, y: 0.08, size: 4.4, spikeLen: 22, color: '#a7f3d0' }
    ],

    build({ width: W, height: H, rand, ctx }) {
      const R = Math.max(W, H) * 1.1;
      const horizon = H * 0.84;
      const pcx = W * 0.5;
      const pcy = horizon + R;

      // Planète + atmosphère pré-rendues (bas de l'écran, avec marge pour la parallaxe)
      const margin = 30;
      const top = H * 0.55;
      const scale = 0.5;
      const planet = createLayer((W + margin * 2) * scale, (H - top + margin) * scale);
      const p = planet.getContext('2d');
      p.scale(scale, scale);
      p.translate(margin, -top);

      const atmo = p.createRadialGradient(pcx, pcy, R * 0.985, pcx, pcy, R * 1.11);
      atmo.addColorStop(0, 'rgba(110, 231, 183, 0.4)');
      atmo.addColorStop(0.12, 'rgba(52, 211, 153, 0.12)');
      atmo.addColorStop(1, 'rgba(52, 211, 153, 0)');
      p.fillStyle = atmo;
      p.fillRect(-margin, top, W + margin * 2, H - top + margin);

      const body = p.createLinearGradient(0, horizon, 0, H + margin);
      body.addColorStop(0, '#07201c');
      body.addColorStop(0.4, '#041210');
      body.addColorStop(1, '#020607');
      p.fillStyle = body;
      p.beginPath();
      p.arc(pcx, pcy, R, 0, TAU);
      p.fill();

      // Lumières de surface et reflets
      p.save();
      p.beginPath();
      p.arc(pcx, pcy, R, 0, TAU);
      p.clip();
      const shine = p.createRadialGradient(pcx, horizon, 0, pcx, horizon, W * 0.6);
      shine.addColorStop(0, 'rgba(52, 211, 153, 0.14)');
      shine.addColorStop(1, 'rgba(52, 211, 153, 0)');
      p.fillStyle = shine;
      p.fillRect(-margin, horizon, W + margin * 2, H - horizon + margin);
      for (let i = 0; i < 60; i++) {
        p.fillStyle = `rgba(167, 243, 208, ${0.15 + rand() * 0.35})`;
        p.fillRect(rand() * W, horizon + 8 + Math.pow(rand(), 1.5) * (H - horizon), 1.3, 1.3);
      }
      p.restore();

      p.strokeStyle = 'rgba(167, 243, 208, 0.75)';
      p.lineWidth = 2;
      p.beginPath();
      p.arc(pcx, pcy, R, 0, TAU);
      p.stroke();

      const ribbons = [
        { base: H * 0.66, amp: H * 0.04, freq: 0.004, speed: 0.0005, height: H * 0.22, top: '139, 92, 246', bottom: '52, 211, 153', alpha: 0.32 },
        { base: H * 0.6, amp: H * 0.05, freq: 0.0031, speed: -0.00038, height: H * 0.18, top: '45, 212, 191', bottom: '110, 231, 183', alpha: 0.24 },
        { base: H * 0.72, amp: H * 0.03, freq: 0.0052, speed: 0.0007, height: H * 0.14, top: '52, 211, 153', bottom: '167, 243, 208', alpha: 0.2 }
      ].map(rb => {
        const grad = ctx.createLinearGradient(0, rb.base - rb.height - rb.amp, 0, rb.base + rb.amp);
        grad.addColorStop(0, `rgba(${rb.top}, 0)`);
        grad.addColorStop(0.5, `rgba(${rb.top}, ${rb.alpha * 0.45})`);
        grad.addColorStop(0.9, `rgba(${rb.bottom}, ${rb.alpha})`);
        grad.addColorStop(1, `rgba(${rb.bottom}, 0)`);
        return { ...rb, grad, xs: new Float32Array(97), ys: new Float32Array(97), hs: new Float32Array(97) };
      });

      return {
        planet, margin, top, ribbons,
        beacon: { x: 0.8, y: 0.26 },
        signals: [], nextSignal: 0,
        beaconGlow: makeGlowSprite('110, 231, 183', 1, 0.3, 64)
      };
    },

    draw(ctx, { width: W, height: H, mx, my }, t, s) {
      // Aurores (avant la planète, qui masque leur base)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(mx * 10, my * 6);
      for (let k = 0; k < s.ribbons.length; k++) {
        const rb = s.ribbons[k];
        const n = rb.xs.length;
        for (let i = 0; i < n; i++) {
          const x = -W * 0.05 + (i / (n - 1)) * W * 1.1;
          rb.xs[i] = x;
          rb.ys[i] = rb.base + Math.sin(x * rb.freq + t * rb.speed) * rb.amp + Math.sin(x * rb.freq * 2.3 - t * rb.speed * 1.7) * rb.amp * 0.4;
          rb.hs[i] = rb.height * (0.55 + 0.45 * Math.sin(x * rb.freq * 1.6 + t * rb.speed * 0.8 + k));
        }
        // Voile doux
        ctx.fillStyle = rb.grad;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(rb.xs[0], rb.ys[0]);
        for (let i = 1; i < n; i++) ctx.lineTo(rb.xs[i], rb.ys[i]);
        for (let i = n - 1; i >= 0; i--) ctx.lineTo(rb.xs[i], rb.ys[i] - rb.hs[i]);
        ctx.closePath();
        ctx.fill();

        // Rideaux de rayons verticaux, en un seul tracé
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = rb.grad;
        ctx.lineWidth = Math.max(1, (W * 1.1) / (n - 1) * 0.22);
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          ctx.moveTo(rb.xs[i], rb.ys[i]);
          ctx.lineTo(rb.xs[i], rb.ys[i] - rb.hs[i] * (0.75 + 0.25 * Math.sin(i * 1.9 + t * 0.002)));
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.strokeStyle = `rgba(167, 243, 208, ${rb.alpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rb.xs[0], rb.ys[0]);
        for (let i = 1; i < n; i++) ctx.lineTo(rb.xs[i], rb.ys[i]);
        ctx.stroke();
      }
      ctx.restore();

      // Planète
      ctx.drawImage(s.planet, -s.margin + mx * 8, s.top + my * 5, W + s.margin * 2, H - s.top + s.margin);

      // Balise de communication et ses signaux
      const bx = s.beacon.x * W + mx * 26 + Math.sin(t * 0.0003) * 8;
      const by = s.beacon.y * H + my * 20 + Math.cos(t * 0.00025) * 5;
      if (t > s.nextSignal) {
        s.signals.push(t);
        s.nextSignal = t + 2200;
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1.3;
      for (let i = s.signals.length - 1; i >= 0; i--) {
        const p = (t - s.signals[i]) / 3200;
        if (p >= 1) {
          s.signals.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(110, 231, 183, ${(1 - p) * 0.45})`;
        ctx.beginPath();
        ctx.arc(bx, by, 6 + p * 150, 0, TAU);
        ctx.stroke();
      }
      const blink = 0.6 + Math.max(0, Math.sin(t * 0.004)) * 0.4;
      ctx.globalAlpha = blink;
      drawSprite(ctx, s.beaconGlow, bx, by, 16);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ecfdf5';
      ctx.beginPath();
      ctx.arc(bx, by, 2.4, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }
};

/* ==========================================================================
   MOTEUR COMMUN
   ========================================================================== */

let canvas = null;
let ctx = null;
let width = 0;
let height = 0;
let dpr = 1;

let sceneId = null;
let scene = null;
let sceneState = null;
let bgLayer = null;
let vignetteLayer = null;
let stars = [];
let meteors = [];
let nextMeteorTime = 0;

let visible = false;
let rafId = 0;
let lastFrame = 0;
let hideTimer = null;
let frameMs = 1000 / 60 - 2;
let density = 1;
let still = false;

let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;


export function initSectorScapes() {
  canvas = document.getElementById('sector-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  if (!ctx) return;

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      if (scene) buildScene();
    }, 120);
  });

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - width / 2) / (width / 2 || 1);
    targetMouseY = (e.clientY - height / 2) / (height / 2 || 1);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestRender();
  });

  onPerfChange((reason) => {
    if (reason === 'tier') {
      resizeCanvas();
      if (scene) buildScene();
    }
    requestRender();
  });

  resizeCanvas();
}

/**
 * Affiche (ou bascule vers) le paysage du secteur demandé
 */
export function showSectorScape(id) {
  if (!ctx) return;
  const next = SCENES[id];
  if (!next) {
    hideSectorScape();
    return;
  }
  clearTimeout(hideTimer);
  if (id !== sceneId) {
    sceneId = id;
    scene = next;
    buildScene();
  }
  visible = true;
  canvas.classList.add('active');
  requestRender();
}

/**
 * Fondu sortant puis arrêt complet de la boucle
 */
export function hideSectorScape() {
  if (!ctx) return;
  canvas.classList.remove('active');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    visible = false;
  }, 600);
}

function resizeCanvas() {
  // Résolution, cadence et densité dépendent du niveau de performance (perf.js)
  const quality = getQuality();
  dpr = quality.pixelRatio;
  frameMs = quality.frameMs;
  density = quality.density;
  still = quality.still;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function buildScene() {
  const rand = seededRandom(scene.seed);

  // Fond teinté + vignette, pré-rendus à demi-résolution (dégradés très doux)
  const s = 0.5;
  bgLayer = createLayer(width * s, height * s);
  const b = bgLayer.getContext('2d');
  b.scale(s, s);
  b.fillStyle = '#03050a';
  b.fillRect(0, 0, width, height);
  const maxDim = Math.max(width, height);
  const [fx, fy] = scene.bgFocus;
  let grad = b.createRadialGradient(width * fx, height * fy, 0, width * fx, height * fy, maxDim * 0.9);
  grad.addColorStop(0, `rgba(${scene.rgb}, 0.13)`);
  grad.addColorStop(0.45, `rgba(${scene.rgb}, 0.04)`);
  grad.addColorStop(1, `rgba(${scene.rgb}, 0)`);
  b.fillStyle = grad;
  b.fillRect(0, 0, width, height);
  const [ax, ay] = scene.accentFocus;
  grad = b.createRadialGradient(width * ax, height * ay, 0, width * ax, height * ay, maxDim * 0.55);
  grad.addColorStop(0, `rgba(${scene.accentRgb}, 0.07)`);
  grad.addColorStop(1, `rgba(${scene.accentRgb}, 0)`);
  b.fillStyle = grad;
  b.fillRect(0, 0, width, height);

  vignetteLayer = createLayer(width * s, height * s);
  const v = vignetteLayer.getContext('2d');
  v.scale(s, s);
  const vg = v.createRadialGradient(width * 0.5, height * 0.5, Math.min(width, height) * 0.35, width * 0.5, height * 0.5, maxDim * 0.8);
  vg.addColorStop(0, 'rgba(7, 10, 16, 0)');
  vg.addColorStop(0.65, 'rgba(7, 10, 16, 0.4)');
  vg.addColorStop(1, 'rgba(5, 7, 12, 0.85)');
  v.fillStyle = vg;
  v.fillRect(0, 0, width, height);

  // Champ d'étoiles scintillantes, aux teintes du secteur
  const count = Math.round(Math.min(240, Math.max(90, (width * height) / 7000)) * density);
  stars = [];
  for (let i = 0; i < count; i++) {
    const r = rand();
    stars.push({
      x: rand(),
      y: rand(),
      radius: rand() * 1.2 + 0.4,
      baseAlpha: rand() * 0.55 + 0.25,
      twinkleSpeed: rand() * 0.025 + 0.008,
      twinklePhase: rand() * TAU,
      depth: rand() * 0.5 + 0.2,
      color: r < 0.6 ? '#ffffff' : (r < 0.85 ? scene.starTints[0] : scene.starTints[1])
    });
  }

  meteors = [];
  nextMeteorTime = performance.now() + 1800;
  sceneState = scene.build({ width, height, rand, ctx, density });
}

function spawnMeteor(now) {
  const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.35;
  const speed = Math.random() * 10 + 14;
  meteors.push({
    x: Math.random() * width * 1.2 - width * 0.1,
    y: Math.random() * height * 0.4,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    length: Math.random() * 110 + 80,
    thickness: Math.random() * 1.4 + 1.1,
    opacity: 1,
    fadeRate: Math.random() * 0.02 + 0.018,
    color: Math.random() > 0.4 ? scene.color : '#ffffff'
  });
  nextMeteorTime = now + Math.random() * 5000 + 4000;
}

function requestRender() {
  if (visible && !document.hidden && !isSuspended() && !rafId) {
    rafId = requestAnimationFrame(render);
  }
}

function render(time) {
  rafId = 0;
  if (!visible || document.hidden || isSuspended() || !scene) return;
  if (time - lastFrame < frameMs) {
    rafId = requestAnimationFrame(render);
    return;
  }
  lastFrame = time;

  mouseX += (targetMouseX - mouseX) * 0.045;
  mouseY += (targetMouseY - mouseY) * 0.045;

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.drawImage(bgLayer, 0, 0, width, height);

  // Étoiles de fond
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    star.twinklePhase += star.twinkleSpeed;
    const alpha = star.baseAlpha + Math.sin(star.twinklePhase) * 0.28;
    const sx = (star.x * width + mouseX * 18 * star.depth + width) % width;
    const sy = (star.y * height + mouseY * 18 * star.depth + height) % height;
    ctx.fillStyle = star.color;
    ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
    ctx.beginPath();
    ctx.arc(sx, sy, star.radius, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Structure propre au secteur
  ctx.save();
  scene.draw(ctx, { width, height, mx: mouseX, my: mouseY }, time, sceneState);
  ctx.restore();

  // Étoiles à aigrettes de premier plan
  for (let i = 0; i < scene.spikes.length; i++) {
    const sp = scene.spikes[i];
    const pulse = Math.sin(time * 0.0012 + i * 1.7);
    drawDiffractionStar(
      ctx,
      sp.x * width + mouseX * 40,
      sp.y * height + mouseY * 34,
      sp.size,
      sp.spikeLen * (1 + pulse * 0.18),
      0.85 + pulse * 0.15,
      sp.color
    );
  }

  // Étoiles filantes
  if (time > nextMeteorTime) spawnMeteor(time);
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.x += m.dx;
    m.y += m.dy;
    m.opacity -= m.fadeRate;
    if (m.opacity <= 0 || m.x > width + 200 || m.y > height + 200) {
      meteors.splice(i, 1);
      continue;
    }
    const len = Math.hypot(m.dx, m.dy);
    const tailX = m.x - (m.dx / len) * m.length;
    const tailY = m.y - (m.dy / len) * m.length;
    const mGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
    mGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    mGrad.addColorStop(0.7, m.color);
    mGrad.addColorStop(1, '#ffffff');
    ctx.globalAlpha = m.opacity;
    ctx.strokeStyle = mGrad;
    ctx.lineWidth = m.thickness;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(m.x, m.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.drawImage(vignetteLayer, 0, 0, width, height);

  // Niveau minimal ou mouvement réduit : une image fixe suffit
  reportFrame(time);
  if (!still) rafId = requestAnimationFrame(render);
}
