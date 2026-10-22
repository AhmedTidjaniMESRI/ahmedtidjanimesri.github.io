import { PROJECTS_DATA, SKILLS_DATA, SKILLS_SYSTEMS, TIMELINE_DATA } from './projects-data.js?v=10';
import { initPerformanceGovernor } from './perf.js';
import { initGalaxyWallpaper, pauseGalaxy, resumeGalaxy } from './galaxy.js';
import { initSectorScapes, showSectorScape, hideSectorScape } from './sector-scapes.js';
import { initHyperspaceEngine, executeWarpJump, executeExitWarp, isWarping } from './hyperspace.js';

// State Management
let currentFilter = 'all';
let searchQuery = '';
// Tous les projets : académiques et de stage (filtrables)
let activeProjects = PROJECTS_DATA;

document.addEventListener('DOMContentLoaded', () => {
  initPerformanceGovernor();
  initGalaxyWallpaper();
  initSectorScapes();
  initHyperspaceEngine();
  initTheme();
  initSectorNavigation();
  initScrollProgress();
  initScrollLock();
  renderProjects();
  initProjectsControls();
  renderSkills();
  renderTimeline();
  initStatsObserver();
  initModalListeners();
  initCommandPalette();
  initCopyEmail();
  initContactForm();
  initProofLightbox();
  checkInitialHash();
});

/* ==========================================================================
   THEME TOGGLE
   ========================================================================== */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('ahmed_theme') || 'dark';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('ahmed_theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  if (theme === 'light') {
    icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  } else {
    icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  }
}

/* ==========================================================================
   CONSTELLATION SECTOR NAVIGATION & HYPERSPACE WARP TRAVEL
   ========================================================================== */
const SECTOR_INFO = {
  'competences': { name: 'Stack Technique', color: '#67e8f9' },
  'projets': { name: 'Projets', color: '#38bdf8' },
  'parcours': { name: 'Parcours', color: '#a78bfa' },
  'contact': { name: 'Communication', color: '#34d399' }
};

let currentActiveSectorId = null;

function initSectorNavigation() {
  // Constellation Star Clicks
  document.querySelectorAll('.star-nav-node').forEach(star => {
    star.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = star.getAttribute('href')?.replace('#', '');
      if (targetId) {
        warpToSector(targetId, star);
      }
    });
  });

  // Top Sector Header Back Button
  const backBtn = document.getElementById('btn-sector-back');
  backBtn?.addEventListener('click', () => {
    returnToGalaxy();
  });

  // Bottom Sector Return Buttons
  document.querySelectorAll('.btn-return-galaxy').forEach(btn => {
    btn.addEventListener('click', () => {
      returnToGalaxy();
    });
  });

  // Inter-Sector Radar Nodes
  document.querySelectorAll('.radar-node').forEach(radar => {
    radar.addEventListener('click', () => {
      const targetId = radar.getAttribute('data-target');
      if (targetId && targetId !== currentActiveSectorId) {
        warpToSector(targetId, radar);
      }
    });
  });

  // Footer Navigation Links
  document.querySelectorAll('.footer-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href') || '';
      const targetId = href.replace('#', '');
      if (targetId === 'accueil' || targetId === '') {
        returnToGalaxy();
      } else {
        warpToSector(targetId, link);
      }
    });
  });

  // Keyboard Shortcuts (Escape to return to Galaxy)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('project-modal');
      const cmdPalette = document.getElementById('cmd-palette-modal');
      if (modal?.classList.contains('active')) {
        modal.classList.remove('active');
        return;
      }
      if (cmdPalette?.classList.contains('active')) {
        cmdPalette.classList.remove('active');
        return;
      }
      if (currentActiveSectorId) {
        returnToGalaxy();
      }
    }
  });

  // Browser History Navigation
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && SECTOR_INFO[hash]) {
      warpToSector(hash, null, true);
    } else {
      returnToGalaxy(false);
    }
  });
}

function checkInitialHash() {
  const hash = window.location.hash.replace('#', '');
  if (hash && SECTOR_INFO[hash]) {
    setTimeout(() => {
      warpToSector(hash, null, true);
    }, 150);
  }
}

/**
 * Warp to destination sector with cosmic space flight transition
 */
export function warpToSector(targetId, triggerElement = null, skipHistory = false) {
  if (isWarping()) return;
  const targetSector = document.getElementById(targetId);
  if (!targetSector) return;
  if (currentActiveSectorId === targetId && targetSector.classList.contains('active')) return;

  const info = SECTOR_INFO[targetId] || { name: 'Secteur', color: '#00e5ff' };

  // Calculate origin coordinates for the warp jump
  let originX = window.innerWidth / 2;
  let originY = window.innerHeight / 2;

  if (triggerElement) {
    const rect = triggerElement.getBoundingClientRect();
    originX = rect.left + rect.width / 2;
    originY = rect.top + rect.height / 2;
  } else {
    const starNode = document.querySelector(`.star-nav-node[href="#${targetId}"]`);
    if (starNode) {
      const rect = starNode.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
    }
  }

  // 1. Camera Plunge Dive on Hero Section (mouvement fluide et doux)
  const hero = document.getElementById('accueil');
  if (hero && !currentActiveSectorId) {
    hero.style.transformOrigin = `${originX}px ${originY}px`;
    hero.style.transform = 'scale(1.05) translateZ(0)';
    hero.style.opacity = '0';
    hero.classList.add('warping-dive');
  }

  // 2. Launch Canvas Warp Drive Speed Streaks
  executeWarpJump(originX, originY, info.color, () => {
    // Pause background galaxy canvas to dedicate 100% GPU to sector view
    pauseGalaxy();
    showSectorScape(targetId);

    // On arrival (peak warp reached):
    document.querySelectorAll('.cosmic-sector.active').forEach(s => s.classList.remove('active'));

    targetSector.classList.add('active');
    targetSector.scrollTop = 0;
    currentActiveSectorId = targetId;

    // Update Top Sector Control Bar
    const navBar = document.getElementById('sector-nav-bar');
    if (navBar) {
      navBar.classList.add('active');
      navBar.style.setProperty('--active-sector-color', info.color);
    }

    const dot = document.getElementById('sector-current-dot');
    if (dot) {
      dot.style.background = info.color;
      dot.style.boxShadow = `0 0 12px ${info.color}`;
    }

    const label = document.getElementById('sector-current-name');
    if (label) {
      label.textContent = `Secteur : ${info.name}`;
    }

    // Update Radar Nodes
    document.querySelectorAll('.radar-node').forEach(node => {
      node.classList.toggle('current', node.getAttribute('data-target') === targetId);
    });

    // Append footer to target sector if not already there
    const footer = document.querySelector('.site-footer');
    const container = targetSector.querySelector('.container');
    if (footer && container && !container.contains(footer)) {
      container.appendChild(footer);
    }

    // Update URL hash
    if (!skipHistory) {
      history.pushState({ sector: targetId }, '', `#${targetId}`);
    }
  }, () => {
    // Warp completed
  });
}

/**
 * Return to Galaxy Map (Carte Stellaire)
 */
export function returnToGalaxy(updateHistory = true) {
  if (isWarping() || !currentActiveSectorId) return;

  // Deactivate currently open sector
  document.querySelectorAll('.cosmic-sector.active').forEach(s => s.classList.remove('active'));
  currentActiveSectorId = null;

  // Hide Top Sector Control Bar
  const navBar = document.getElementById('sector-nav-bar');
  if (navBar) navBar.classList.remove('active');

  // Resume galaxy live wallpaper
  resumeGalaxy();
  hideSectorScape();

  // Reverse Deceleration Warp
  executeExitWarp(() => {
    const hero = document.getElementById('accueil');
    if (hero) {
      hero.style.transform = 'scale(1) translateZ(0)';
      hero.style.opacity = '1';
      hero.classList.remove('warping-dive');
    }

    const bar = document.getElementById('scroll-progress-bar');
    if (bar) bar.style.width = '0%';

    if (updateHistory) {
      history.pushState(null, '', window.location.pathname);
    }
  });
}

// Expose globally for inline buttons/modal
window.warpToSector = warpToSector;
window.returnToGalaxy = returnToGalaxy;

function initScrollLock() {
  // Prevent wheel bouncing on galaxy view without blocking touch events
  window.addEventListener('wheel', (e) => {
    if (!currentActiveSectorId && !document.getElementById('project-modal')?.classList.contains('active')) {
      e.preventDefault();
    }
  }, { passive: false });
}

function initScrollProgress() {
  const bar = document.getElementById('scroll-progress-bar');
  if (!bar) return;

  let scrollRaf = null;
  // Attach passive, rAF-throttled scroll listeners to each cosmic sector
  document.querySelectorAll('.cosmic-sector').forEach(sector => {
    sector.addEventListener('scroll', () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        const total = sector.scrollHeight - sector.clientHeight;
        if (total <= 0) {
          bar.style.width = '0%';
          return;
        }
        const progress = Math.min(100, Math.max(0, (sector.scrollTop / total) * 100));
        bar.style.width = `${progress}%`;
      });
    }, { passive: true });
  });
}

/* ==========================================================================
   RENDER PROJECTS
   ========================================================================== */
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const filtered = activeProjects.filter(item => {
    const matchCategory = currentFilter === 'all' || item.category === currentFilter;
    const searchLow = searchQuery.toLowerCase();
    const matchSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchLow) ||
      item.shortDesc.toLowerCase().includes(searchLow) ||
      item.tags.some(t => t.toLowerCase().includes(searchLow)) ||
      (item.slimeType && item.slimeType.toLowerCase().includes(searchLow));
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1rem;">Aucun projet ne correspond à votre recherche.</p>
        <button class="btn btn-outline btn-sm" id="btn-reset-filters">Réinitialiser les filtres</button>
      </div>
    `;
    document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
      currentFilter = 'all';
      searchQuery = '';
      const input = document.getElementById('project-search');
      if (input) input.value = '';
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      document.querySelector('.filter-tab[data-filter="all"]')?.classList.add('active');
      renderProjects();
    });
    return;
  }

  filtered.forEach(proj => {
    const card = document.createElement('div');
    card.className = `project-card ${proj.isPlaceholder ? 'placeholder-card' : ''}`;
    card.setAttribute('data-id', proj.id);


    card.innerHTML = projectInlineHtml(proj);
    grid.appendChild(card);
  });
}

function initProjectsControls() {
  const tabs = document.querySelectorAll('.filter-tab');
  const searchInput = document.getElementById('project-search');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter') || 'all';
      renderProjects();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderProjects();
    });
  }
}

/* ==========================================================================
   MODAL CASE STUDY (HALLOWNEST JOURNAL ENTRY)
   ========================================================================== */
function initModalListeners() {
  const overlay = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  closeBtn?.addEventListener('click', () => {
    overlay.classList.remove('active');
  });

  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      overlay.classList.remove('active');
    }
  });

  // Boutons directs vers modale de projet (notamment dans la section Stage UNOVA)
  document.querySelectorAll('.btn-open-project').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.getAttribute('data-project-id');
      const proj = PROJECTS_DATA.find(p => p.id === pId);
      if (proj) openProjectModal(proj);
    });
  });
}

function openProjectModal(proj) {
  const overlay = document.getElementById('project-modal');
  const modalImg = document.getElementById('modal-img');
  const modalBadge = document.getElementById('modal-badge');
  const modalYear = document.getElementById('modal-year');
  const modalTitle = document.getElementById('modal-title');
  const modalContext = document.getElementById('modal-context');
  const modalHkImg = document.getElementById('modal-hk-img');
  const modalHkName = document.getElementById('modal-hk-pill-name');
  const modalHkSub = document.getElementById('modal-hk-pill-sub');
  const modalMetrics = document.getElementById('modal-metrics');
  const modalDesc = document.getElementById('modal-desc');
  const modalFeatures = document.getElementById('modal-features');
  const modalChallenges = document.getElementById('modal-challenges');
  const modalTags = document.getElementById('modal-tags');

  modalImg.src = proj.image || '';
  modalImg.closest('.modal-hero')?.classList.toggle('is-empty', !proj.image);
  modalImg.classList.toggle('is-logo', !!proj.image && proj.image.includes('logo'));
  modalBadge.innerHTML = `<strong>${proj.categoryLabel || 'Projet'}</strong> • ${proj.badge}`;
  modalYear.textContent = proj.year;
  modalTitle.textContent = proj.title;
  modalContext.textContent = `📍 ${proj.context} • ${proj.role}`;
  const sheet = proj.sheet || {};
  modalDesc.textContent = proj.sheet ? (sheet.contexte || "") : proj.description;
  modalChallenges.textContent = sheet.resultat || proj.challenges;
  const modalObjectif = document.getElementById('modal-objectif');
  if (modalObjectif) modalObjectif.textContent = sheet.objectif || '';
  const modalPreuves = document.getElementById('modal-preuves');
  if (modalPreuves) {
    // Une preuve est soit un texte, soit une image { img, caption } (cliquable pour l'agrandir)
    modalPreuves.innerHTML = (sheet.preuves || []).map(p => p && p.url ? `
      <li class="modal-feature-item">
        <svg class="feature-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <a href="${p.url}" target="_blank" rel="noopener" style="color:#38bdf8">${p.caption}</a>
      </li>` : typeof p === 'object' ? `
      <li class="modal-proof-item">
        <a href="${p.img}" target="_blank" rel="noopener"><img src="${p.img}" alt="${p.caption}" loading="lazy"></a>
        <span>${p.caption}</span>
      </li>` : `
      <li class="modal-feature-item">
        <svg class="feature-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${p}</span>
      </li>`).join('');
    modalPreuves.classList.toggle('modal-proof-grid', (sheet.preuves || []).some(p => p && p.img));
  }

  // Metrics
  const extendedMetrics = [...(proj.metrics || [])];

  modalMetrics.innerHTML = extendedMetrics.map(m => `
    <div class="modal-metric-box">
      <span class="metric-label">${m.label}</span>
      <span class="metric-val">${m.val}</span>
    </div>
  `).join('');

  // Features
  modalFeatures.innerHTML = (sheet.contribution || proj.features || []).map(f => `
    <li class="modal-feature-item">
      <svg class="feature-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${f}</span>
    </li>
  `).join('');

  // Tags
  modalTags.innerHTML = (sheet.moyens || proj.tags).map(t => `<span class="tech-tag">${t}</span>`).join('');


  // Bouton GitHub : affiché seulement si le projet a un dépôt
  const modalGithub = document.getElementById('modal-btn-github');
  if (modalGithub) {
    modalGithub.style.display = proj.githubUrl ? 'inline-flex' : 'none';
    if (proj.githubUrl) modalGithub.href = proj.githubUrl;
  }

  // Masquer l'intertitre d'une partie vide
  overlay.querySelectorAll('.modal-section-h3[data-for]').forEach(h => {
    const el = document.getElementById(h.dataset.for);
    h.classList.toggle('is-empty', !el || !el.textContent.trim() && !el.children.length);
  });
  overlay.classList.add('active');
}

// Image de carte : vraie capture, logo, ou encadré neutre si aucune capture n'existe
function thumbHtml(proj) {
  if (!proj.image) return '<div class="project-thumb-placeholder">Capture à venir</div>';
  const logo = proj.image.includes('logo') ? ' is-logo' : '';
  return `<img src="${proj.image}" alt="${proj.title}" class="project-thumb-img${logo}" loading="lazy" decoding="async">`;
}

function openProjectById(id) {
  const p = activeProjects.find(item => item.id === id);
  if (p) openProjectModal(p);
}

/* ==========================================================================
   RENDER SKILLS & TIMELINE
   ========================================================================== */
function renderSkills() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  const systems = SKILLS_SYSTEMS || [];

  container.className = 'skills-solar-grid';
  container.innerHTML = systems.map(sys => {
    const renderPlanet = (p) => {
      let orbMarkup = `<span class="planet-orb"></span>`;
      if (p.logos && p.logos.length > 0) {
        if (p.logos.length === 1) {
          orbMarkup = `
            <span class="planet-logo-wrap">
              <img src="${p.logos[0]}" alt="" class="planet-tech-icon" />
            </span>
          `;
        } else {
          orbMarkup = `
            <span class="planet-logo-wrap planet-logo-pair">
              ${p.logos.map(logoUrl => `<img src="${logoUrl}" alt="" class="planet-tech-icon" />`).join('')}
            </span>
          `;
        }
      }

      return `
        <div class="planet-holder ${p.pos}">
          <div class="planet-body" aria-label="${p.name}">
            ${orbMarkup}
            <span class="planet-pill">
              <span class="planet-pill-dot"></span>
              <span class="planet-pill-name">${p.name}</span>
            </span>
          </div>
        </div>
      `;
    };

    return `
      <div class="solar-system-card" style="--system-color: ${sys.themeColor}; --system-glow: ${sys.themeGlow}; --system-rgb: ${sys.themeRgb}; --orbit-speed: ${sys.rotSpeed || '32s'};">
        <div class="solar-viewport" aria-label="Système stellaire ${sys.title}">
          <div class="solar-system-center">
            <!-- Disque orbital unifié : 4 astres à 90° équidistants pour 0 chevauchement -->
            <div class="solar-orrery-disc ${sys.rotDir || 'rot-cw'}">
              <div class="orbit-track orbit-ring">
                ${sys.planets.map(renderPlanet).join('')}
              </div>
            </div>

            <!-- Central Sun (Le Soleil thématique) -->
            <div class="sun-node" role="img" aria-label="${sys.title}">
              <div class="sun-corona"></div>
              <div class="sun-flare-h"></div>
              <div class="sun-flare-v"></div>
              <div class="sun-core">
                <span class="sun-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${sys.icon}</svg>
                </span>
                <span class="sun-name">${sys.sunName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderTimeline() {
  const wrap = document.getElementById('timeline-wrap');
  if (!wrap) return;

  wrap.innerHTML = TIMELINE_DATA.map((t, idx) => `
    <div class="timeline-item ${idx === 0 ? 'active' : ''}">
      <div class="timeline-dot"></div>
      <div class="timeline-content-card">
        <div class="timeline-meta">
          <span class="timeline-period">${t.period}</span>
          <span class="timeline-badge">${t.badge}</span>
        </div>
        <h3 class="timeline-title">${t.title}</h3>
        <p class="timeline-place">${t.place}</p>
        <p class="timeline-desc">${t.description}</p>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   STATS OBSERVER (ANIMATED COUNTER)
   ========================================================================== */
function initStatsObserver() {
  const stats = document.querySelectorAll('.stat-num');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        stats.forEach(s => {
          const target = parseInt(s.getAttribute('data-target') || '0', 10);
          const suffix = s.getAttribute('data-suffix') || '';
          let count = 0;
          const step = Math.max(1, Math.floor(target / 30));
          const interval = setInterval(() => {
            count += step;
            if (count >= target) {
              count = target;
              clearInterval(interval);
            }
            s.textContent = `${count}${suffix}`;
          }, 35);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) observer.observe(statsSection);
}

/* ==========================================================================
   COMMAND PALETTE (CTRL + K)
   ========================================================================== */
function initCommandPalette() {
  const overlay = document.getElementById('cmd-palette-modal');
  const triggerBtn = document.getElementById('cmd-palette-trigger');
  const input = document.getElementById('cmd-input');
  const list = document.getElementById('cmd-list');

  const commands = [
    { label: "Voir Sulf Landing (Site Vitrine & CRM)", action: () => { openProjectById('sulf-landing'); } },
    { label: "Voir Easy-Flow ERP (Logiciel Métier SaaS)", action: () => { openProjectById('easy-flow'); } },
    { label: "Consulter l'analyse comparative Sulf vs Easy-Flow", action: () => { warpToSector('projets'); filterCategory('stage'); } },
    { label: "Accéder aux Compétences Techniques", action: () => warpToSector('competences') },
    { label: "Consulter mon Parcours Universitaire", action: () => warpToSector('parcours') },
    { label: "Accéder au Formulaire de Contact", action: () => warpToSector('contact') },
    { label: "Copier mon adresse email", action: () => copyEmailToClipboard() },
    { label: "Basculer le thème Sombre / Clair", action: () => document.getElementById('theme-toggle')?.click() }
  ];

  function openPalette() {
    overlay.classList.add('active');
    input.value = '';
    renderCmds(commands);
    setTimeout(() => input.focus(), 50);
  }

  function closePalette() {
    overlay.classList.remove('active');
  }

  function renderCmds(items) {
    list.innerHTML = items.map((cmd, idx) => `
      <li class="cmd-item ${idx === 0 ? 'selected' : ''}" data-idx="${idx}">
        <span class="cmd-item-left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          ${cmd.label}
        </span>
        <span class="cmd-shortcut">Entrée</span>
      </li>
    `).join('');

    list.querySelectorAll('.cmd-item').forEach((el, i) => {
      el.addEventListener('click', () => {
        items[i].action();
        closePalette();
      });
    });
  }

  triggerBtn?.addEventListener('click', openPalette);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closePalette();
  });

  input?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = commands.filter(c => c.label.toLowerCase().includes(q));
    renderCmds(filtered);
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (overlay.classList.contains('active')) closePalette();
      else openPalette();
    } else if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closePalette();
    }
  });
}

function filterCategory(cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-tab').forEach(t => {
    if (t.getAttribute('data-filter') === cat) t.classList.add('active');
    else t.classList.remove('active');
  });
  renderProjects();
}

function scrollToId(id) {
  warpToSector(id);
}

/* ==========================================================================
   COPY EMAIL & TOAST NOTIFICATION
   ========================================================================== */
function initCopyEmail() {
  document.querySelectorAll('.copy-email-btn').forEach(btn => {
    btn.addEventListener('click', copyEmailToClipboard);
  });
}

function copyEmailToClipboard() {
  const email = "m.tidjani87@gmail.com";
  navigator.clipboard.writeText(email).then(() => {
    showToast("Adresse email copiée dans le presse-papier !");
  }).catch(() => {
    showToast("Email : " + email);
  });
}

function showToast(msg) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${msg}</span>
  `;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}


// Étoiles en orbite 3D autour de la photo du hero
function initStarOrbit() {
  const nav = document.querySelector('.hero-stars-nav');
  const avatar = document.querySelector('.avatar-card');
  if (!nav || !avatar) return;
  const stars = [...nav.querySelectorAll('.star-nav-node')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 993px)');
  const speed = reduce ? 0 : 0.00008; // rotation lente (~80 s par tour)
  let angle = 0, last = performance.now(), paused = false;

  stars.forEach(s => {
    s.classList.add('is-orbiting');
    s.addEventListener('mouseenter', () => s.classList.add('is-hovered'));
    s.addEventListener('mouseleave', () => s.classList.remove('is-hovered'));
  });

  function frame(now) {
    const dt = now - last; last = now;
    angle += dt * speed;
    if (desktop.matches) {
      const n = nav.getBoundingClientRect();
      // le cadre de la photo avec ses anneaux décoratifs
      const a = (avatar.closest('.avatar-halo-wrapper') || avatar).getBoundingClientRect();
      const cx = a.left + a.width / 2 - n.left;
      const cy = a.top + a.height / 2 - n.top;
      const v = avatar.closest('.hero-visual').getBoundingClientRect();
      const room = cx - (v.left - n.left) - 60;
      // orbite centrée sur la photo : marges assez grandes pour que l'étoile + son titre
      // (~60px de demi-hauteur, ~110px de demi-largeur) ne passent jamais sur l'image
      const rx = Math.max(a.width / 2 + 110, Math.min(a.width * 1.15, room - 40));
      const ry = Math.max(a.height / 2 + 75, Math.min(a.height * 0.8, cy - 50, n.height - cy - 70));
      const tilt = 0;
      stars.forEach((s, i) => {
        const t = angle + (i / stars.length) * Math.PI * 2;
        const scale = s.classList.contains('is-hovered') ? 1.12 : 1;
        const x = Math.cos(t) * rx, y = Math.sin(t) * ry;
        s.style.left = (cx + x * Math.cos(tilt) - y * Math.sin(tilt)) + 'px';
        s.style.top = (cy + x * Math.sin(tilt) + y * Math.cos(tilt)) + 'px';
        s.style.transform = `translate(-50%, -50%) scale(${scale})`;
        s.style.zIndex = 30;
      });
    } else {
      stars.forEach(s => { s.style.cssText = ''; });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Fiche projet complète affichée directement sur la page (plus de fenêtre au clic)
function projectInlineHtml(proj) {
  const s = proj.sheet || {};
  const list = items => items.map(i => `<li>${i}</li>`).join('');
  const block = (title, html) => html ? `<h4 class="pi-h">${title}</h4>${html}` : '';
  const proofs = (s.preuves || []).filter(p => p && p.img).map(p => `
    <a class="pi-proof" href="${p.img}"><img src="${p.img}" alt="${p.caption}" loading="lazy"><span>${p.caption}</span></a>`).join('');
  return `
    <div class="project-thumb">
      ${thumbHtml(proj)}
      <div class="project-thumb-overlay">
        <span class="project-badge-tag">${proj.badge}</span>
        <span class="project-year">${proj.year}</span>
      </div>
    </div>
    <div class="project-body">
      <h3 class="project-card-title">${proj.title}</h3>
      ${block('Contexte', s.contexte ? `<p>${s.contexte}</p>` : '')}
      ${block('Objectif', s.objectif ? `<p>${s.objectif}</p>` : '')}
      ${block('Ma contribution', (s.contribution || []).length ? `<ul class="pi-list">${list(s.contribution)}</ul>` : '')}
      ${block('Technologies et méthodes', `<div class="project-tech-tags">${(s.moyens || proj.tags).map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>`)}
      ${block('Résultat', s.resultat ? `<p>${s.resultat}</p>` : '')}
      ${block('Preuves', proofs ? `<div class="pi-proofs">${proofs}</div>` : '')}
      ${proj.githubUrl ? `<a class="btn btn-outline btn-sm pi-github" href="${proj.githubUrl}" target="_blank" rel="noopener">Dépôt GitHub</a>` : ''}
    </div>`;
}

/* ==========================================================================
   FORMULAIRE DE CONTACT
   Envoi via FormSubmit (formsubmit.co), qui transfère le message par mail.
   Au tout premier envoi, FormSubmit envoie un mail d'activation à l'adresse
   ci-dessous : il faut cliquer sur le lien pour recevoir les messages suivants.
   ========================================================================== */
const CONTACT_EMAIL = 'm.tidjani87@gmail.com';
const CONTACT_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const button = document.getElementById('contact-submit');
  const status = document.getElementById('contact-status');
  const label = button?.querySelector('span');
  const defaultLabel = label?.textContent || 'Envoyer le Message';

  const setStatus = (msg, type = '') => {
    status.textContent = msg;
    status.className = `form-status ${type}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Champs vides ou email invalide : on affiche le message du navigateur
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    if (data._honey) return; // robot détecté

    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      _replyto: data.email.trim(),
      _subject: `Portfolio — ${data.subject.trim()}`,
      message: data.message.trim(),
      _template: 'box',
      _captcha: 'false',
    };

    button.disabled = true;
    if (label) label.textContent = 'Envoi en cours...';
    setStatus('');

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') {
        const reason = String(json.message || `HTTP ${res.status}`);
        console.warn('[Contact] Envoi refusé par FormSubmit :', reason);
        // Premier envoi : le formulaire doit être activé depuis la boîte mail du propriétaire
        if (/activat/i.test(reason)) {
          setStatus("Le formulaire est en cours d'activation : réessayez dans quelques minutes, ou écrivez-moi directement à " + CONTACT_EMAIL + '.', 'error');
          return;
        }
        throw new Error(reason);
      }

      form.reset();
      setStatus('Merci ! Votre message a bien été envoyé, je vous réponds rapidement.', 'success');
      showToast('Message envoyé !');
    } catch (err) {
      console.warn('[Contact] Échec de l\'envoi :', err.message);
      // Repli : on ouvre la messagerie du visiteur avec le message pré-rempli
      const body = `${payload.message}\n\n— ${payload.name} (${payload.email})`;
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(body)}`;
      setStatus('', 'error');
      status.innerHTML = `L'envoi n'a pas pu aboutir. <a href="${mailto}">Cliquez ici pour m'écrire directement</a> (votre message est déjà pré-rempli).`;
    } finally {
      button.disabled = false;
      if (label) label.textContent = defaultLabel;
    }
  });
}

/* ==========================================================================
   ZOOM SUR LES IMAGES DE PREUVES (visionneuse sur la page, sans nouvel onglet)
   ========================================================================== */
function initProofLightbox() {
  const box = document.createElement('div');
  box.className = 'proof-lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Image agrandie');
  box.innerHTML = `
    <button class="plb-btn plb-close" aria-label="Fermer">&times;</button>
    <button class="plb-btn plb-prev" aria-label="Image précédente">&#8249;</button>
    <figure class="plb-figure"><img class="plb-img" alt=""><figcaption class="plb-caption"></figcaption></figure>
    <button class="plb-btn plb-next" aria-label="Image suivante">&#8250;</button>`;
  document.body.appendChild(box);

  const img = box.querySelector('.plb-img');
  const caption = box.querySelector('.plb-caption');
  let items = [];
  let index = 0;

  function show(i) {
    index = (i + items.length) % items.length;
    const link = items[index];
    img.src = link.getAttribute('href');
    img.alt = link.querySelector('img')?.alt || '';
    caption.textContent = link.querySelector('span')?.textContent || '';
    box.classList.toggle('single', items.length < 2);
  }

  function open(link) {
    items = [...link.closest('.pi-proofs').querySelectorAll('.pi-proof')];
    show(items.indexOf(link));
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('.pi-proof');
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    open(link);
  });

  box.addEventListener('click', (e) => {
    if (e.target.closest('.plb-prev')) show(index - 1);
    else if (e.target.closest('.plb-next')) show(index + 1);
    else if (!e.target.closest('.plb-img')) close();
  });

  // Phase de capture : Échap ferme le zoom sans quitter la section en cours
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
    else return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
}