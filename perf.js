/**
 * Performance Governor — qualité adaptative pour que le portfolio reste fluide
 * même sur les PC les plus modestes.
 *
 * 4 niveaux : high (défaut) → medium → low → minimal (fonds figés en image fixe)
 * - Détection au démarrage : nombre de cœurs, RAM, rendu graphique logiciel (pas de GPU)
 * - Surveillance en continu des FPS réels des canvas animés : si ça rame,
 *   on descend d'un niveau (jamais l'inverse, pour éviter les va-et-vient)
 * - Le niveau est exposé sur <html data-perf="..."> pour alléger aussi le CSS
 * - Les canvas sont suspendus quand une modale plein écran les recouvre
 */

const TIERS = {
  // pixelRatio : résolution max du canvas (1 = 1 pixel canvas par pixel CSS)
  // density    : proportion de particules conservées
  // frameMs    : intervalle minimal entre deux images (60fps / 30fps)
  // still      : fond dessiné une seule fois puis figé (machines vraiment trop justes)
  high: { pixelRatio: 1.5, density: 1, frameMs: 1000 / 60 - 2 },
  medium: { pixelRatio: 1, density: 0.65, frameMs: 1000 / 60 - 2 },
  low: { pixelRatio: 0.55, density: 0.35, frameMs: 1000 / 30 - 2 },
  minimal: { pixelRatio: 0.55, density: 0.35, frameMs: 1000 / 30 - 2, still: true }
};
const ORDER = ['high', 'medium', 'low', 'minimal'];
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

let tier = 'high';
let suspended = false;
const listeners = new Set();

function notify(reason) {
  listeners.forEach(cb => {
    try { cb(reason); } catch (e) { /* un renderer défaillant ne bloque pas les autres */ }
  });
}

function setTier(next) {
  if (next === tier) return;
  tier = next;
  document.documentElement.dataset.perf = tier;
  resetSampling();
  notify('tier');
}

/* --------------------------------------------------------------------------
   Détection initiale
   -------------------------------------------------------------------------- */
function isSoftwareRenderer() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return true;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|softpipe|basic render|software/i.test(renderer);
  } catch (e) {
    return false;
  }
}

function detectInitialTier() {
  try {
    const saved = sessionStorage.getItem('perf_tier');
    if (saved && TIERS[saved]) return saved;
  } catch (e) {}

  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 8;
  if (isSoftwareRenderer() || cores <= 2 || memory <= 2) return 'low';
  if (cores <= 4 || memory <= 4) return 'medium';
  return 'high';
}

/* --------------------------------------------------------------------------
   Surveillance des FPS réels
   -------------------------------------------------------------------------- */
const WINDOW_MS = 2000;
const WARMUP_MS = 1500;
let samples = [];
let lastFrameTime = 0;
let windowStart = 0;
let badWindows = 0;
let warmupUntil = 0;

function resetSampling() {
  samples = [];
  lastFrameTime = 0;
  windowStart = 0;
  badWindows = 0;
  warmupUntil = performance.now() + WARMUP_MS;
}

/**
 * Appelé par chaque renderer après avoir dessiné une image
 */
export function reportFrame(time) {
  if (tier === 'minimal' || time < warmupUntil) {
    lastFrameTime = time;
    return;
  }
  if (lastFrameTime) {
    const delta = time - lastFrameTime;
    // Un trou énorme = onglet masqué ou pause, pas une lenteur
    if (delta < 500) samples.push(delta);
  }
  lastFrameTime = time;
  if (!windowStart) windowStart = time;

  if (time - windowStart >= WINDOW_MS) {
    if (samples.length >= 10) {
      const sorted = samples.slice().sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      // Trop lent par rapport à la cadence visée (< ~40 fps en high/medium, < ~22 fps en low)
      const limit = Math.max(25, TIERS[tier].frameMs * 1.4);
      badWindows = median > limit ? badWindows + 1 : 0;
      if (badWindows >= 2) {
        const next = ORDER[ORDER.indexOf(tier) + 1];
        if (next) {
          try { sessionStorage.setItem('perf_tier', next); } catch (e) {}
          setTier(next);
          return;
        }
      }
    }
    samples = [];
    windowStart = time;
  }
}

/* --------------------------------------------------------------------------
   API
   -------------------------------------------------------------------------- */
export function getQuality() {
  const t = TIERS[tier];
  return {
    tier,
    pixelRatio: Math.min(window.devicePixelRatio || 1, t.pixelRatio),
    density: t.density,
    frameMs: t.frameMs,
    still: Boolean(t.still) || Boolean(reducedMotion)
  };
}

export function isSuspended() {
  return suspended;
}

export function onPerfChange(cb) {
  listeners.add(cb);
}

export function initPerformanceGovernor() {
  tier = detectInitialTier();
  document.documentElement.dataset.perf = tier;
  resetSampling();

  // Les modales plein écran recouvrent les canvas : inutile de les animer derrière
  const overlays = ['project-modal', 'cmd-palette-modal']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const refresh = () => {
    const next = overlays.some(o => o.classList.contains('active'));
    if (next !== suspended) {
      suspended = next;
      resetSampling();
      notify('suspend');
    }
  };
  const observer = new MutationObserver(refresh);
  overlays.forEach(o => observer.observe(o, { attributes: true, attributeFilter: ['class'] }));
}
