/**
 * Pure Procedural Animated Galaxy Live Wallpaper
 * Features:
 * - 100% Procedural WebGL / Canvas2D rendering (no static photo/image)
 * - Barred spiral galactic structure with swirling gas clouds & nebulae
 * - Dynamic golden core pulsar & volumetric energy corona
 * - Dense multi-color orbiting stardust (amber core, cyan arms, magenta starbursts)
 * - Foreground stars with 4-pointed diffraction spikes (Hubble / James Webb style)
 * - Scintillating deep space starfield & shooting stars (meteors)
 * - Smooth mouse parallax with 3D depth inertia
 * - Full performance optimization (requestAnimationFrame, DPR scaling, visibility pause)
 */

import { getQuality, isSuspended, onPerfChange, reportFrame } from './perf.js';

let isPaused = false;
let isRunning = true;
let triggerRender = null;

export function pauseGalaxy() {
  isPaused = true;
}

export function resumeGalaxy() {
  if (isPaused) {
    isPaused = false;
    if (triggerRender) triggerRender();
  }
}

export function initGalaxyWallpaper() {
  const canvas = document.getElementById('galaxy-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let galaxyBaseRadius = 0;

  // Qualité adaptative (voir perf.js)
  let frameMs = 1000 / 60 - 2;
  let bgStarsDrawn = 0;
  let stardustDrawn = 0;
  let stardustHalos = true;
  let still = false;

  // Pre-rendered static layers (rebuilt on resize only, instead of every frame)
  let bgLayer = null;
  let vignetteLayer = null;
  let nebulaLayer = null;
  let nebulaExtent = 0;

  // Mouse & Parallax State
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  // Galaxy transform state
  let galaxyRotation = 0;
  const ROTATION_SPEED = 0.0004; // Majestic slow rotation

  // Resize handler
  function resize() {
    // Résolution, cadence et densité dépendent du niveau de performance de la machine
    const quality = getQuality();
    dpr = quality.pixelRatio;
    frameMs = quality.frameMs;
    bgStarsDrawn = Math.round(BG_STARS_COUNT * quality.density);
    stardustDrawn = Math.round(STARDUST_COUNT * quality.density);
    stardustHalos = quality.density >= 1;
    still = quality.still;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const minDim = Math.min(width, height);
    const maxDim = Math.max(width, height);
    galaxyBaseRadius = Math.max(minDim * 0.92, maxDim * 0.58);

    buildStaticLayers();
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  // Mouse movement for 3D parallax
  window.addEventListener('mousemove', (e) => {
    const halfW = width / 2;
    const halfH = height / 2;
    targetMouseX = (e.clientX - halfW) / halfW;
    targetMouseY = (e.clientY - halfH) / halfH;
  });

  // Background deep stars (static grid with scintillation)
  const BG_STARS_COUNT = 280;
  const bgStars = [];
  for (let i = 0; i < BG_STARS_COUNT; i++) {
    bgStars.push({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 1.3 + 0.4,
      baseAlpha: Math.random() * 0.6 + 0.25,
      twinkleSpeed: Math.random() * 0.025 + 0.008,
      twinklePhase: Math.random() * Math.PI * 2,
      depth: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.8 ? '#a5f3fc' : (Math.random() > 0.6 ? '#fde68a' : '#ffffff')
    });
  }

  // Foreground Diffraction Spike Stars (matching the 5 constellation navigation nodes)
  // Désactivées : les étoiles de navigation tournent désormais autour de la photo
  const spikeStars = [];

  // Procedural Spiral Arms & Clouds (Soft cosmic gas puffs)
  const NEBULA_CLOUDS_COUNT = 44;
  const nebulaClouds = [];
  for (let i = 0; i < NEBULA_CLOUDS_COUNT; i++) {
    const arm = i % 2 === 0 ? 0 : Math.PI;
    const t = 0.08 + (Math.floor(i / 2) / (NEBULA_CLOUDS_COUNT / 2)) * 0.92;
    const baseAngle = arm + t * 3.6 + (Math.random() - 0.5) * 0.4;
    
    // Cloud color by radius
    let r, g, b, a;
    if (t < 0.25) {
      r = 245; g = 158; b = 11; a = 0.055; // Amber core
    } else if (Math.random() < 0.25) {
      r = 244; g = 114; b = 182; a = 0.045; // Magenta starburst
    } else if (t > 0.65) {
      r = 99; g = 102; b = 241; a = 0.04; // Outer indigo / violet
    } else {
      r = 0; g = 229; b = 255; a = 0.05; // Cyan / azure arms
    }

    nebulaClouds.push({
      t,
      angle: baseAngle,
      radiusScale: 0.15 + t * 0.28,
      r, g, b, a,
      radialJitter: (Math.random() - 0.5) * 35
    });
  }

  // Dense Orbiting Stardust Particles (360 particles forming the barred spiral)
  const STARDUST_COUNT = 360;
  const stardust = [];
  for (let i = 0; i < STARDUST_COUNT; i++) {
    const arm = Math.random() > 0.5 ? 0 : Math.PI;
    const distanceNorm = Math.pow(Math.random(), 0.85); // Denser near center
    const baseAngle = arm + distanceNorm * 3.8 + (Math.random() - 0.5) * 0.55;
    
    let color;
    let alpha;
    if (distanceNorm < 0.22) {
      // Golden/amber core
      color = Math.random() > 0.4 ? '#f59e0b' : (Math.random() > 0.3 ? '#fbbf24' : '#fffbeb');
      alpha = Math.random() * 0.7 + 0.35;
    } else if (Math.random() < 0.22) {
      // Pink/magenta H-II emission clusters
      color = Math.random() > 0.5 ? '#f472b6' : '#fb7185';
      alpha = Math.random() * 0.6 + 0.35;
    } else {
      // Cyan, azure, steel white arms
      color = Math.random() > 0.5 ? '#38bdf8' : (Math.random() > 0.3 ? '#67e8f9' : '#e0e7ff');
      alpha = Math.random() * 0.6 + 0.3;
    }

    stardust.push({
      distanceNorm,
      angle: baseAngle,
      orbitSpeed: (0.00055 / (distanceNorm * 0.9 + 0.3)) * (Math.random() * 0.4 + 0.8),
      size: Math.random() * 2.2 + 0.75,
      color,
      alpha,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
      radialScatter: (Math.random() - 0.5) * 38
    });
  }

  function createLayer(w, h) {
    const layer = document.createElement('canvas');
    layer.width = Math.max(1, Math.ceil(w));
    layer.height = Math.max(1, Math.ceil(h));
    return layer;
  }

  function buildStaticLayers() {
    const pw = canvas.width;
    const ph = canvas.height;

    // Deep space background gradient
    bgLayer = createLayer(pw, ph);
    const bctx = bgLayer.getContext('2d');
    bctx.scale(dpr, dpr);
    const bgGrad = bctx.createRadialGradient(
      width * 0.5, height * 0.5, 50,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.85
    );
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(0.55, '#05070e');
    bgGrad.addColorStop(1, '#020306');
    bctx.fillStyle = bgGrad;
    bctx.fillRect(0, 0, width, height);

    // Soft vignette overlay
    vignetteLayer = createLayer(pw, ph);
    const vctx = vignetteLayer.getContext('2d');
    vctx.scale(dpr, dpr);
    const vignetteGrad = vctx.createRadialGradient(
      width * 0.5, height * 0.5, Math.min(width, height) * 0.35,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.8
    );
    vignetteGrad.addColorStop(0, 'rgba(7, 10, 16, 0)');
    vignetteGrad.addColorStop(0.65, 'rgba(7, 10, 16, 0.45)');
    vignetteGrad.addColorStop(1, 'rgba(5, 7, 12, 0.88)');
    vctx.fillStyle = vignetteGrad;
    vctx.fillRect(0, 0, width, height);

    // Nebula clouds, drawn once in unrotated galaxy space at reduced resolution.
    // Each frame only rotates/squashes this bitmap (1 drawImage instead of 44 big gradients).
    const R = galaxyBaseRadius;
    nebulaExtent = R * 1.6 + 40;
    const scale = Math.min(1, 512 / nebulaExtent);
    const size = nebulaExtent * 2 * scale;
    nebulaLayer = createLayer(size, size);
    const nctx = nebulaLayer.getContext('2d');
    nctx.translate(nebulaLayer.width / 2, nebulaLayer.height / 2);
    nctx.scale(scale, scale);
    nctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < nebulaClouds.length; i++) {
      const c = nebulaClouds[i];
      const r = (c.t * R * 0.95) + c.radialJitter;
      const actualR = r * (1 + Math.cos(c.angle * 2) * 0.25);
      const cx = Math.cos(c.angle) * actualR;
      const cy = Math.sin(c.angle) * actualR;
      const cloudRadius = R * c.radiusScale;

      const cloudGrad = nctx.createRadialGradient(cx, cy, 0, cx, cy, cloudRadius);
      cloudGrad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 1.5})`);
      cloudGrad.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 0.6})`);
      cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      nctx.fillStyle = cloudGrad;
      nctx.beginPath();
      nctx.arc(cx, cy, cloudRadius, 0, Math.PI * 2);
      nctx.fill();
    }
  }

  // Noyau et couronne : dégradés calculés une seule fois au lieu de deux par image
  function createGlowSprite(stops) {
    const sprite = createLayer(256, 256);
    const sctx = sprite.getContext('2d');
    const grad = sctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    stops.forEach(([offset, color]) => grad.addColorStop(offset, color));
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 256, 256);
    return sprite;
  }

  const coreSprite = createGlowSprite([
    [0, 'rgba(255, 250, 230, 0.95)'],
    [0.18, 'rgba(255, 215, 120, 0.7)'],
    [0.42, 'rgba(245, 158, 11, 0.4)'],
    [0.72, 'rgba(217, 119, 6, 0.15)'],
    [1, 'rgba(0, 0, 0, 0)']
  ]);

  const coronaSprite = createGlowSprite([
    [0, 'rgba(0, 229, 255, 0.12)'],
    [0.2, 'rgba(0, 229, 255, 0.12)'],
    [0.6, 'rgba(56, 189, 248, 0.05)'],
    [1, 'rgba(0, 0, 0, 0)']
  ]);

  resize();

  // Shooting Stars (Meteors)
  let meteors = [];
  let nextMeteorTime = performance.now() + 2500;

  function spawnMeteor(now) {
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.35;
    const speed = Math.random() * 10 + 14;
    const startX = Math.random() * width * 1.2 - width * 0.1;
    const startY = Math.random() * height * 0.4;
    meteors.push({
      x: startX,
      y: startY,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      length: Math.random() * 110 + 80,
      thickness: Math.random() * 1.5 + 1.2,
      opacity: 1,
      fadeRate: Math.random() * 0.02 + 0.018,
      color: Math.random() > 0.4 ? '#67e8f9' : '#ffffff'
    });
    nextMeteorTime = now + Math.random() * 4500 + 3500;
  }

  // Draw 4-Pointed Diffraction Spike Star
  function drawDiffractionStar(x, y, radius, spikeLen, alpha, color) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // Core Glow
    const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.5);
    glowGrad.addColorStop(0, '#ffffff');
    glowGrad.addColorStop(0.3, color);
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Central bright dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // 4 diffraction spikes
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - spikeLen, y);
    ctx.lineTo(x + spikeLen, y);
    ctx.moveTo(x, y - spikeLen);
    ctx.lineTo(x, y + spikeLen);
    ctx.stroke();

    // Minor diagonal faint spikes
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

  // Animation Loop
  // A single rAF handle guarantees only one loop ever runs: previously a quick
  // pause/resume or tab switch could stack extra loops, multiplying the work.
  let rafId = 0;
  let lastFrame = 0;

  triggerRender = () => {
    if (isRunning && !isPaused && !isSuspended() && !rafId) {
      rafId = requestAnimationFrame(render);
    }
  };

  document.addEventListener('visibilitychange', () => {
    isRunning = !document.hidden;
    triggerRender();
  });

  function render(time) {
    rafId = 0;
    if (!isRunning || isPaused || isSuspended()) return;
    if (time - lastFrame < frameMs) {
      rafId = requestAnimationFrame(render);
      return;
    }
    lastFrame = time;

    // Smooth Parallax Interpolation
    mouseX += (targetMouseX - mouseX) * 0.045;
    mouseY += (targetMouseY - mouseY) * 0.045;

    // Advance galaxy rotation
    galaxyRotation += ROTATION_SPEED;

    // 1. Deep Space Cosmic Background (opaque, so no clearRect needed)
    ctx.drawImage(bgLayer, 0, 0, width, height);

    // 2. Background Scintillating Micro-Stars
    for (let i = 0; i < bgStarsDrawn; i++) {
      const star = bgStars[i];
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = Math.sin(star.twinklePhase);
      const alpha = star.baseAlpha + twinkle * 0.28;

      const sx = (star.x * width + mouseX * 18 * star.depth + width) % width;
      const sy = (star.y * height + mouseY * 18 * star.depth + height) % height;

      ctx.fillStyle = star.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
      ctx.beginPath();
      ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3. Central Barred Spiral Galaxy Calculations
    const centerX = width * 0.58 + mouseX * 24;
    const centerY = height * 0.50 + mouseY * 20;

    const breathe = 1 + Math.sin(time * 0.0006) * 0.018;
    const galaxyRadius = galaxyBaseRadius * breathe;

    ctx.save();
    ctx.translate(centerX, centerY);

    // 4. Procedural Nebula Clouds along Spiral Arms (pre-rendered, rotated + flattened)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.scale(breathe, breathe * 0.68);
    ctx.rotate(galaxyRotation);
    ctx.drawImage(nebulaLayer, -nebulaExtent, -nebulaExtent, nebulaExtent * 2, nebulaExtent * 2);
    ctx.restore();

    // 5. Core Pulsar & Volumetric Golden Energy Glow
    const corePulse = 1 + Math.sin(time * 0.0018) * 0.12;
    const coreGlowRadius = (galaxyRadius * 0.28) * corePulse;

    // Golden/Amber Nucleus + Subtle Cyan Outer Corona (sprites pré-rendus, redimensionnés)
    ctx.drawImage(coronaSprite, -galaxyRadius * 0.85, -galaxyRadius * 0.85, galaxyRadius * 1.7, galaxyRadius * 1.7);
    ctx.drawImage(coreSprite, -coreGlowRadius, -coreGlowRadius, coreGlowRadius * 2, coreGlowRadius * 2);

    // 6. Orbiting Spiral Stardust (Swirling stars & clusters)
    for (let i = 0; i < stardustDrawn; i++) {
      const p = stardust[i];
      p.angle += p.orbitSpeed;
      p.twinklePhase += p.twinkleSpeed;

      const r = (p.distanceNorm * galaxyRadius * 0.95) + p.radialScatter;
      const ellipseFactor = 1 + Math.cos(p.angle * 2) * 0.25;
      const actualR = r * ellipseFactor;

      const px = Math.cos(p.angle + galaxyRotation) * actualR;
      const py = Math.sin(p.angle + galaxyRotation) * actualR * 0.68;

      const twinkleAlpha = p.alpha * (0.7 + Math.sin(p.twinklePhase) * 0.3);

      ctx.globalAlpha = Math.max(0.12, Math.min(1, twinkleAlpha));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Lightweight glow halo without expensive shadowBlur
      if (stardustHalos && p.size > 1.8) {
        ctx.globalAlpha = Math.max(0.04, Math.min(0.2, twinkleAlpha * 0.3));
        ctx.beginPath();
        ctx.arc(px, py, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    ctx.restore(); // Restore center translation

    // 7. Foreground Hubble Diffraction Spike Stars
    for (let i = 0; i < spikeStars.length; i++) {
      const star = spikeStars[i];
      star.pulsePhase += 0.02;
      const pulse = 1 + Math.sin(star.pulsePhase) * 0.18;
      const currentSpike = star.spikeLen * pulse;
      const currentAlpha = 0.85 + Math.sin(star.pulsePhase) * 0.15;

      const sx = star.x * width + mouseX * 45;
      const sy = star.y * height + mouseY * 40;

      drawDiffractionStar(sx, sy, star.size, currentSpike, currentAlpha, star.color);
    }

    // 8. Shooting Stars (Meteors)
    if (time > nextMeteorTime) {
      spawnMeteor(time);
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.dx;
      m.y += m.dy;
      m.opacity -= m.fadeRate;

      if (m.opacity <= 0 || m.x > width + 200 || m.y > height + 200) {
        meteors.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = m.opacity;
      const tailX = m.x - (m.dx / Math.hypot(m.dx, m.dy)) * m.length;
      const tailY = m.y - (m.dy / Math.hypot(m.dx, m.dy)) * m.length;

      const mGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
      mGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      mGrad.addColorStop(0.7, m.color);
      mGrad.addColorStop(1, '#ffffff');

      ctx.strokeStyle = mGrad;
      ctx.lineWidth = m.thickness;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.thickness * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 9. Soft Vignette Overlay
    ctx.drawImage(vignetteLayer, 0, 0, width, height);

    reportFrame(time);
    // Niveau minimal ou mouvement réduit : une image fixe suffit
    if (!still) rafId = requestAnimationFrame(render);
  }

  onPerfChange((reason) => {
    if (reason === 'tier') resize();
    triggerRender();
  });

  triggerRender();
}
