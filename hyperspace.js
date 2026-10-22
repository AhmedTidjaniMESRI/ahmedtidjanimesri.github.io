/**
 * Hyperspace Warp Drive Engine
 * Pure Canvas 2D / 3D Perspective Space Travel Transition
 * Features:
 * - Visceral radial warp speed jump from exact clicked star coordinates
 * - 3D relativistic star streaks & hypervelocity light beams
 * - Multi-hue cosmic ionization (Cyan, Gold, Sky, Violet, Emerald)
 * - Concentric warp gate shockwaves & radiant central flare bloom
 * - Synthesized cosmic warp audio via Web Audio API (zero audio file dependencies)
 */

import { getQuality, onPerfChange } from './perf.js';

let canvas = null;
let ctx = null;
let width = 0;
let height = 0;
let dpr = 1;

let isWarpingState = false;
let animationFrameId = null;

// Particle pool for warp streaks (adouci et confortable pour les yeux)
const PARTICLE_COUNT = 140;
let stars = [];

// Warp parameters
let originX = 0;
let originY = 0;
let currentSpeed = 3;
let targetSpeed = 3;
let warpProgress = 0;
let activeThemeColor = '#00e5ff';
let shockwaveRadius = 0;
let shockwaveMaxRadius = 0;
let flareAlpha = 0;

// Reusable coordinate buffers to prevent GC allocations during render loop
const themeStreaks = [];
const whiteStreaks = [];

// Web Audio API Synth
let audioCtx = null;
let noiseBuffer = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playWarpSound() {
  try {
    const actx = getAudioContext();
    if (!actx) return;

    const now = actx.currentTime;

    // Master volume node (très doux pour éviter la fatigue auditive)
    const masterGain = actx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.05, now + 0.25);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
    masterGain.connect(actx.destination);

    // 1. Sub-bass warp resonance sweep (Cosmic pulse subtil)
    const osc = actx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(45, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.45);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.9);

    const oscGain = actx.createGain();
    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.linearRampToValueAtTime(0.05, now + 0.9);

    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.95);

    // 2. Filtered cosmic noise whoosh (brise cosmique douce)
    // Buffer généré une seule fois puis réutilisé à chaque saut
    if (!noiseBuffer) {
      const bufferSize = Math.floor(actx.sampleRate * 0.8);
      noiseBuffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }

    const whiteNoise = actx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = actx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2.0;
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.35);
    filter.frequency.exponentialRampToValueAtTime(380, now + 0.8);

    const noiseGain = actx.createGain();
    noiseGain.gain.setValueAtTime(0.005, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.18, now + 0.3);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.95);
  } catch (err) {
    // Audio is optional and non-blocking
  }
}

function playExitSound() {
  try {
    const actx = getAudioContext();
    if (!actx) return;

    const now = actx.currentTime;
    const masterGain = actx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.12, now + 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    masterGain.connect(actx.destination);

    const osc = actx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.45);
    osc.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {}
}

export function initHyperspaceEngine() {
  canvas = document.getElementById('hyperspace-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'hyperspace-canvas';
    canvas.className = 'hyperspace-canvas';
    document.body.appendChild(canvas);
  }

  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  onPerfChange((reason) => { if (reason === 'tier') resize(); });
  initStars();
}

function resize() {
  if (!canvas) return;
  dpr = getQuality().pixelRatio;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  if (ctx) ctx.scale(dpr, dpr);
}

function initStars() {
  stars = [];
  const spreadX = Math.max(width * 1.5, 1200);
  const spreadY = Math.max(height * 1.5, 900);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const z = Math.random() * 1500 + 10;
    stars.push({
      x: (Math.random() - 0.5) * spreadX * 2,
      y: (Math.random() - 0.5) * spreadY * 2,
      z: z,
      pz: z,
      size: Math.random() * 2.2 + 0.8,
      speedMult: Math.random() * 0.45 + 0.8,
      isCore: Math.random() > 0.4
    });
  }
}

function resetStar(star) {
  const spreadX = Math.max(width * 1.5, 1200);
  const spreadY = Math.max(height * 1.5, 900);
  star.x = (Math.random() - 0.5) * spreadX * 2;
  star.y = (Math.random() - 0.5) * spreadY * 2;
  star.z = 1500;
  star.pz = 1500;
}

/**
 * Launch Warp Speed Jump towards target coordinates
 * @param {number} x Screen X center of star
 * @param {number} y Screen Y center of star
 * @param {string} themeColor Hex color of target star
 * @param {function} onArrival Callback fired when peak warp arrives
 * @param {function} onComplete Callback fired when entire sequence ends
 */
export function executeWarpJump(x, y, themeColor, onArrival, onComplete) {
  if (isWarpingState) return;
  isWarpingState = true;

  originX = x ?? width / 2;
  originY = y ?? height / 2;
  activeThemeColor = themeColor || '#00e5ff';

  shockwaveRadius = 0;
  shockwaveMaxRadius = Math.max(width, height) * 1.35;
  flareAlpha = 0;
  warpProgress = 0;

  // Re-seed star depth smoothly
  for (let i = 0; i < stars.length; i++) {
    stars[i].z = Math.random() * 1400 + 100;
    stars[i].pz = stars[i].z;
  }

  playWarpSound();

  canvas.classList.add('active');
  canvas.style.opacity = '0.72'; // Voile doux et translucide au lieu de 1.0

  const startTime = performance.now();
  const DURATION = 540; // ms (plus fluide et moins fatigant pour les yeux)
  let arrivalTriggered = false;

  function loop(currentTime) {
    const elapsed = currentTime - startTime;
    warpProgress = Math.min(1, elapsed / DURATION);

    // Easing curve veloutée : départ en douceur -> vitesse croisière agréable -> décélération progressive
    if (warpProgress < 0.30) {
      // Phase d'accélération mesurée
      const t = warpProgress / 0.30;
      currentSpeed = 3 + (t * t) * 16;
      flareAlpha = t * 0.12;
    } else if (warpProgress < 0.70) {
      // Croisière interstellaire apaisante (sans pic agressif)
      const t = (warpProgress - 0.30) / 0.40;
      currentSpeed = 19 + Math.sin(t * Math.PI) * 7;
      flareAlpha = 0.12 + Math.sin(t * Math.PI) * 0.12;
      shockwaveRadius = shockwaveMaxRadius * t;
    } else {
      // Décélération feutrée
      const t = (warpProgress - 0.70) / 0.30;
      currentSpeed = 22 * (1 - t * t) + 2;
      flareAlpha = Math.max(0, (1 - t) * 0.20);

      if (!arrivalTriggered) {
        arrivalTriggered = true;
        if (typeof onArrival === 'function') onArrival();
      }
    }

    renderWarpFrame();

    if (warpProgress < 1) {
      animationFrameId = requestAnimationFrame(loop);
    } else {
      // Conclude jump
      canvas.style.opacity = '0';
      setTimeout(() => {
        canvas.classList.remove('active');
        if (ctx) ctx.clearRect(0, 0, width, height);
        isWarpingState = false;
        if (typeof onComplete === 'function') onComplete();
      }, 120);
    }
  }

  animationFrameId = requestAnimationFrame(loop);
}

function renderWarpFrame() {
  if (!ctx) return;

  // Fond cosmique sombre et feutré évitant les chocs de luminosité
  ctx.fillStyle = 'rgba(4, 7, 14, 0.45)';
  ctx.fillRect(0, 0, width, height);

  const fov = 340;
  const currentLineWidth = Math.min(1.6, 0.9 + (currentSpeed / 30));

  themeStreaks.length = 0;
  whiteStreaks.length = 0;

  // 3D Streaks calculation
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    star.pz = star.z;
    star.z -= currentSpeed * star.speedMult;

    if (star.z <= 1) {
      resetStar(star);
      continue;
    }

    // 3D Perspective Projection
    const invZ = fov / star.z;
    const sx = originX + star.x * invZ;
    const sy = originY + star.y * invZ;

    const invPz = fov / star.pz;
    const px = originX + star.x * invPz;
    const py = originY + star.y * invPz;

    // Fast bounds cull
    if (sx < -80 || sx > width + 80 || sy < -80 || sy > height + 80) {
      resetStar(star);
      continue;
    }

    if (star.isCore) {
      whiteStreaks.push(px, py, sx, sy);
    } else {
      themeStreaks.push(px, py, sx, sy);
    }
  }

  // 1. Traînées subtiles à la couleur du secteur
  if (themeStreaks.length > 0) {
    ctx.strokeStyle = activeThemeColor;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = currentLineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < themeStreaks.length; i += 4) {
      ctx.moveTo(themeStreaks[i], themeStreaks[i + 1]);
      ctx.lineTo(themeStreaks[i + 2], themeStreaks[i + 3]);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // 2. Traînées blanches douces et tamisées (jamais de blanc perçant agressif)
  if (whiteStreaks.length > 0) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = Math.max(0.8, currentLineWidth * 0.75);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < whiteStreaks.length; i += 4) {
      ctx.moveTo(whiteStreaks[i], whiteStreaks[i + 1]);
      ctx.lineTo(whiteStreaks[i + 2], whiteStreaks[i + 3]);
    }
    ctx.stroke();
  }

  // 3. Onde de choc très fine et aérienne (aucune surcharge rétinienne)
  if (shockwaveRadius > 0 && shockwaveRadius < shockwaveMaxRadius) {
    const ringAlpha = Math.max(0, 1 - (shockwaveRadius / shockwaveMaxRadius));
    ctx.strokeStyle = activeThemeColor;
    ctx.globalAlpha = ringAlpha * 0.22;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(originX, originY, shockwaveRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // 4. Halo central feutré (SUPPRESSION du flash aveuglant pour un confort total des yeux)
  if (flareAlpha > 0.02) {
    const flareRadius = Math.min(width, height) * 0.32 * (warpProgress < 0.7 ? warpProgress / 0.7 : (1 - warpProgress) / 0.3);
    const maxR = Math.max(10, flareRadius);
    const flareGrad = ctx.createRadialGradient(originX, originY, 0, originX, originY, maxR);
    flareGrad.addColorStop(0, `rgba(255, 255, 255, ${flareAlpha * 0.30})`);
    flareGrad.addColorStop(0.35, activeThemeColor);
    flareGrad.addColorStop(0.70, 'rgba(0, 0, 0, 0)');
    flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = flareGrad;
    ctx.globalAlpha = Math.min(0.40, flareAlpha);
    ctx.beginPath();
    ctx.arc(originX, originY, maxR, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/**
 * Execute Reverse Deceleration Exit when returning to Galaxy Map
 */
export function executeExitWarp(onComplete) {
  if (isWarpingState) return;
  isWarpingState = true;

  playExitSound();
  originX = width / 2;
  originY = height / 2;

  canvas.classList.add('active');
  canvas.style.opacity = '0.55';

  const startTime = performance.now();
  const DURATION = 300;

  function loop(currentTime) {
    const elapsed = currentTime - startTime;
    const p = Math.min(1, elapsed / DURATION);

    currentSpeed = 18 * (1 - p) + 1.5;

    ctx.fillStyle = 'rgba(4, 7, 13, 0.45)';
    ctx.fillRect(0, 0, width, height);

    const fov = 340;
    ctx.strokeStyle = '#67e8f9';
    ctx.globalAlpha = Math.max(0, (1 - p) * 0.45);
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();

    for (let i = 0; i < stars.length; i += 2) {
      const star = stars[i];
      star.pz = star.z;
      star.z += currentSpeed * 0.8;

      if (star.z >= 1500) {
        star.z = 200;
        star.pz = 200;
      }

      const invZ = fov / star.z;
      const sx = originX + star.x * invZ;
      const sy = originY + star.y * invZ;

      const invPz = fov / star.pz;
      const px = originX + star.x * invPz;
      const py = originY + star.y * invPz;

      ctx.moveTo(px, py);
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    if (p < 1) {
      requestAnimationFrame(loop);
    } else {
      canvas.style.opacity = '0';
      setTimeout(() => {
        canvas.classList.remove('active');
        if (ctx) ctx.clearRect(0, 0, width, height);
        isWarpingState = false;
        if (typeof onComplete === 'function') onComplete();
      }, 80);
    }
  }

  requestAnimationFrame(loop);
}

export function isWarping() {
  return isWarpingState;
}
