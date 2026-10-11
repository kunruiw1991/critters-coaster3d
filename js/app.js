/* ============================================================================
 * Critter Roller Coaster 3D: Star Track Rush!
 * 3D WebGL Spline-Track Roller Coaster Lane-Switch Racer (Three.js r161)
 * ============================================================================ */
(function () {
  'use strict';

  // Verify bundled Three.js revision & r155+ physical light/color management units
  const THREE_REV = typeof THREE !== 'undefined' ? String(THREE.REVISION) : '0';
  console.assert(THREE_REV === '161' || Number(THREE_REV) >= 155, 'Expected Three.js r155+ physical lighting build, found r' + THREE_REV);

  // Canvas 2D roundRect fallback for older/headless environments
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      const rad = typeof r === 'number' ? r : (Array.isArray(r) ? r[0] : 8);
      const cr = Math.min(rad, w * 0.5, h * 0.5);
      this.moveTo(x + cr, y);
      this.arcTo(x + w, y, x + w, y + h, cr);
      this.arcTo(x + w, y + h, x, y + h, cr);
      this.arcTo(x, y + h, x, y, cr);
      this.arcTo(x, y, x + w, y, cr);
      this.closePath();
      return this;
    };
  }

  // 8 Selectable Smiling Critters with distinct palettes and custom 3D silhouettes
  const CRITTERS = [
    { id: 'catnap', name: 'CatNap', emoji: '🐱💜', faceEmoji: '🐱', icon: 'icons/catnap.jpg', color: 0x9b5de5, trim: 0xe0aaff, earType: 'cat' },
    { id: 'dogday', name: 'DogDay', emoji: '🐶☀️', faceEmoji: '🐶', icon: 'icons/dogday.jpg', color: 0xff922b, trim: 0xffe066, earType: 'dog' },
    { id: 'bobby', name: 'Bobby BearHug', emoji: '🐻❤️', faceEmoji: '🐻', icon: 'icons/bobby.jpg', color: 0xe63946, trim: 0xffd6e0, earType: 'bear' },
    { id: 'picky', name: 'PickyPiggy', emoji: '🐷🍎', faceEmoji: '🐷', icon: 'icons/picky.jpg', color: 0xffafcc, trim: 0xff006e, earType: 'pig' },
    { id: 'hoppy', name: 'Hoppy Hopscotch', emoji: '🐰⚡', faceEmoji: '🐰', icon: 'icons/hoppy.jpg', color: 0x2ec4b6, trim: 0x9bf6ff, earType: 'bunny' },
    { id: 'bubba', name: 'Bubba Bubbaphant', emoji: '🐘💡', faceEmoji: '🐘', icon: 'icons/bubba.jpg', color: 0x3a86ff, trim: 0xa0c4ff, earType: 'elephant' },
    { id: 'craftycorn', name: 'CraftyCorn', emoji: '🦄🎨', faceEmoji: '🦄', icon: 'icons/craftycorn.jpg', color: 0x00bbf9, trim: 0xf15bb5, earType: 'unicorn' },
    { id: 'kickin', name: 'KickinChicken', emoji: '🐔⭐', faceEmoji: '🐔', icon: 'icons/kickin.jpg', color: 0xf5c518, trim: 0xff5400, earType: 'crest' }
  ];

  // 8 Distinct 3D Sky Coaster Worlds with unique palettes, landmark 3D props, and loop-de-loop zones
  const STAGES = [
    {
      id: 1,
      theme: 'candy',
      emoji: '☁️🍬',
      skyTop: 0x3b1f7a,
      skyBottom: 0xff99c8,
      railColor: 0x00f5d4,
      tieColor: 0xffd166,
      cloudColor: 0xfff0f6,
      deckColor: 0x482880,
      gateColor: 0xff477e,
      archColor: 0xffd166,
      pillarColor: 0x5a3494,
      particleColor: 0xffe5ec,
      trackLength: 920,
      hills: 3,
      hillAmp: 15,
      curves: 3,
      curveAmp: 24,
      loops: 1,
      gateCount: 11,
      boostCount: 10,
      aiBaseSpeed: 38.5
    },
    {
      id: 2,
      theme: 'carnival',
      emoji: '🌈🎡',
      skyTop: 0x1a3a8a,
      skyBottom: 0x72efdd,
      railColor: 0xffbe0b,
      tieColor: 0xfb5607,
      cloudColor: 0xe0fbfc,
      deckColor: 0x1d4e89,
      gateColor: 0xff006e,
      archColor: 0x3a86ff,
      pillarColor: 0x264653,
      particleColor: 0xffbe0b,
      trackLength: 980,
      hills: 4,
      hillAmp: 18,
      curves: 4,
      curveAmp: 29,
      loops: 1,
      gateCount: 13,
      boostCount: 11,
      aiBaseSpeed: 40.2
    },
    {
      id: 3,
      theme: 'carousel',
      emoji: '🍭🎠',
      skyTop: 0x5f0f40,
      skyBottom: 0xff70a6,
      railColor: 0x9b5de5,
      tieColor: 0x4cc9f0,
      cloudColor: 0xffd6ff,
      deckColor: 0x6b1d57,
      gateColor: 0xf72585,
      archColor: 0xfee440,
      pillarColor: 0x7209b7,
      particleColor: 0xff99c8,
      trackLength: 1040,
      hills: 5,
      hillAmp: 20,
      curves: 4,
      curveAmp: 33,
      loops: 2,
      gateCount: 14,
      boostCount: 11,
      aiBaseSpeed: 41.4
    },
    {
      id: 4,
      theme: 'moon',
      emoji: '🌙🔮',
      skyTop: 0x12002b,
      skyBottom: 0x6a1b9a,
      railColor: 0xc77dff,
      tieColor: 0xe0aaff,
      cloudColor: 0xd0bfff,
      deckColor: 0x240046,
      gateColor: 0x00bbf9,
      archColor: 0x9d4edd,
      pillarColor: 0x3c096c,
      particleColor: 0xe0aaff,
      trackLength: 1100,
      hills: 5,
      hillAmp: 22,
      curves: 5,
      curveAmp: 36,
      loops: 2,
      gateCount: 16,
      boostCount: 12,
      aiBaseSpeed: 42.5
    },
    {
      id: 5,
      theme: 'beach',
      emoji: '☀️🏖️',
      skyTop: 0x0077b6,
      skyBottom: 0x90e0ef,
      railColor: 0xff9f1c,
      tieColor: 0x2ec4b6,
      cloudColor: 0x48cae4,
      deckColor: 0x0096c7,
      gateColor: 0xef476f,
      archColor: 0xffd166,
      pillarColor: 0x005f73,
      particleColor: 0xfff3b0,
      trackLength: 1150,
      hills: 6,
      hillAmp: 24,
      curves: 5,
      curveAmp: 39,
      loops: 2,
      gateCount: 17,
      boostCount: 12,
      aiBaseSpeed: 43.4
    },
    {
      id: 6,
      theme: 'glacier',
      emoji: '❄️💎',
      skyTop: 0x03045e,
      skyBottom: 0x48cae4,
      railColor: 0x38b6ff,
      tieColor: 0xcaf0f8,
      cloudColor: 0xade8f4,
      deckColor: 0x023e8a,
      gateColor: 0x4361ee,
      archColor: 0x90e0ef,
      pillarColor: 0x1d3557,
      particleColor: 0xffffff,
      trackLength: 1210,
      hills: 6,
      hillAmp: 25,
      curves: 6,
      curveAmp: 41,
      loops: 2,
      gateCount: 18,
      boostCount: 13,
      aiBaseSpeed: 44.2
    },
    {
      id: 7,
      theme: 'volcano',
      emoji: '🌋🔥',
      skyTop: 0x370617,
      skyBottom: 0xf48c06,
      railColor: 0xffba08,
      tieColor: 0xd00000,
      cloudColor: 0xffb703,
      deckColor: 0x6a040f,
      gateColor: 0xe85d04,
      archColor: 0xffba08,
      pillarColor: 0x4a0404,
      particleColor: 0xff6b35,
      trackLength: 1270,
      hills: 7,
      hillAmp: 26,
      curves: 6,
      curveAmp: 43,
      loops: 3,
      gateCount: 20,
      boostCount: 13,
      aiBaseSpeed: 44.8
    },
    {
      id: 8,
      theme: 'galaxy',
      emoji: '🌌👑',
      skyTop: 0x050b2e,
      skyBottom: 0xd81159,
      railColor: 0xff007f,
      tieColor: 0x00f5d4,
      cloudColor: 0x72efdd,
      deckColor: 0x1b263b,
      gateColor: 0xffbe0b,
      archColor: 0x00f5d4,
      pillarColor: 0x2b2d42,
      particleColor: 0xffd93d,
      trackLength: 1340,
      hills: 8,
      hillAmp: 27,
      curves: 7,
      curveAmp: 45,
      loops: 3,
      gateCount: 22,
      boostCount: 14,
      aiBaseSpeed: 45.4
    }
  ];

  const LANE_OFFSETS = [-3.4, 0, 3.4]; // 3 parallel coaster lanes (L, M, R)
  const WHEEL_RAIL_GAUGE = 1.08;       // Dual running rails per lane at laneX ± 1.08 matching cart wheel spacing
  const GROUND_Y = -25;                // Cloud-sea floor elevation
  const GRAVITY = 36.0;                // Unified gravity constant for cart hops, particles, and flying coins
  const SLOPE_GRAVITY = 22.0;          // Tangential coaster hill gravity acceleration (u/s²)
  const FLIP_PIVOT_Y = 1.15;           // Center-of-mass pivot height for 360° barrel-loops so carts clear the track
  const BILLBOARD_BASE_Y = 4.25;       // Portrait medallion center height (rim bottom at 3.46 > bunny ear tips 3.26)
  const BILLBOARD_RIM_RADIUS = 0.79;   // Outer rim radius for bottom-edge anchored distance scaling
  const SLAM_RADIUS = 11.5;            // Both gameplay & visual expanding 3D shockwave radius
  const MAGNET_RADIUS = 11.0;          // Matched visual & gameplay star magnet pull radius
  const STORAGE_KEY = 'critters_coaster3d_save_v1';

  // ==================== WEB AUDIO SYNTHESIZER ====================
  class SoundEngine {
    constructor() {
      this.enabled = true;
      this.ctx = null;
      this.masterBus = null;
      this.coinStreak = 0;
      this.lastCoinTime = 0;
    }

    ensureCtx() {
      if (!this.enabled) return null;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          try {
            const comp = this.ctx.createDynamicsCompressor();
            comp.threshold.setValueAtTime(-16, this.ctx.currentTime);
            comp.knee.setValueAtTime(18, this.ctx.currentTime);
            comp.ratio.setValueAtTime(6, this.ctx.currentTime);
            comp.attack.setValueAtTime(0.003, this.ctx.currentTime);
            comp.release.setValueAtTime(0.18, this.ctx.currentTime);
            comp.connect(this.ctx.destination);
            this.masterBus = comp;
          } catch (_) {
            this.masterBus = this.ctx.destination;
          }
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    playTone(freq, endFreq, duration, type = 'sine', gainVal = 0.14) {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(Math.max(40, freq), now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(this.masterBus || ctx.destination);
        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (_) {}
        };
        osc.start(now);
        osc.stop(now + duration + 0.01);
      } catch (_) {}
    }

    coin() {
      const nowMs = performance.now();
      if (nowMs - this.lastCoinTime < 650) {
        this.coinStreak = Math.min(8, this.coinStreak + 1);
      } else {
        this.coinStreak = 0;
      }
      this.lastCoinTime = nowMs;
      const mult = 1 + this.coinStreak * 0.048;
      this.playTone(660 * mult, 1320 * mult, 0.11, 'triangle', 0.13);
    }

    laneSwitch() { this.playTone(320, 540, 0.08, 'sine', 0.11); }
    hop() { this.playTone(280, 760, 0.18, 'sine', 0.15); }
    magnet() { this.playTone(420, 940, 0.28, 'sawtooth', 0.12); }
    turbo() { this.playTone(240, 1120, 0.35, 'sawtooth', 0.16); }
    slam() { this.playTone(180, 75, 0.24, 'square', 0.18); }
    bump() { this.playTone(210, 110, 0.15, 'triangle', 0.14); }
    gateHit() { this.playTone(150, 65, 0.22, 'sawtooth', 0.16); }
    pedalReadyDing() { this.playTone(880, 1480, 0.12, 'triangle', 0.11); }
    cooldownBonk() { this.playTone(140, 95, 0.09, 'sine', 0.11); }
    countdownTick(go) { this.playTone(go ? 880 : 440, go ? 1180 : 440, go ? 0.24 : 0.12, 'triangle', 0.14); }

    feverChime() {
      [587, 740, 880, 1175].forEach((n, idx) => {
        setTimeout(() => this.playTone(n, n * 1.18, 0.16, 'triangle', 0.15), idx * 65);
      });
    }

    fanfare(win) {
      if (win) {
        // Celebratory 4-note rising trumpet fanfare + harmonic triad finale
        [523, 659, 784, 1046].forEach((n, idx) => {
          const isFinal = idx === 3;
          setTimeout(() => {
            this.playTone(n, n * 1.04, isFinal ? 0.42 : 0.17, 'triangle', 0.15);
            if (isFinal) {
              this.playTone(659, 659 * 1.02, 0.40, 'sine', 0.10);
              this.playTone(784, 784 * 1.02, 0.40, 'sine', 0.10);
            }
          }, idx * 95);
        });
      } else {
        // 4-note descending "wah-wah-wah-waaah" Defeat Trombone with sustained pitch slide on final note
        const tromboneNotes = [
          { start: 311, end: 294, dur: 0.20, delay: 0 },
          { start: 293, end: 277, dur: 0.20, delay: 210 },
          { start: 277, end: 261, dur: 0.20, delay: 420 },
          { start: 233, end: 162, dur: 0.55, delay: 630 }
        ];
        tromboneNotes.forEach((step) => {
          setTimeout(() => {
            this.playTone(step.start, step.end, step.dur, 'sawtooth', 0.14);
          }, step.delay);
        });
      }
    }
  }

  const sfx = new SoundEngine();

  // ==================== PERSISTENCE ====================
  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const validCritter = CRITTERS.some((c) => c.id === parsed.selectedCritter)
            ? parsed.selectedCritter
            : 'catnap';
          return {
            selectedCritter: validCritter,
            unlockedStage: Math.max(1, Math.min(8, Number(parsed.unlockedStage) || 1)),
            stageStars: parsed.stageStars || {}
          };
        }
      }
    } catch (_) {}
    return { selectedCritter: 'catnap', unlockedStage: 1, stageStars: {} };
  }

  function saveProgress(saveObj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveObj));
    } catch (_) {}
  }

  // ==================== MAIN 3D COASTER STATE & DOM ====================
  const saveState = loadProgress();

  const state = {
    stageId: 1,
    selectedCritterId: saveState.selectedCritter,
    unlockedStage: saveState.unlockedStage,
    stageStars: saveState.stageStars,
    cameraMode: 0, // 0: chase, 1: cockpit close, 2: sky panoramic
    status: 'countdown', // 'countdown' | 'racing' | 'paused' | 'finished'
    statusBeforePause: 'racing',
    countdownTimer: 1.8,
    lastCountdownTick: 4,
    bufferedCountdownAction: null,
    assetsReady: false,
    contextLost: false,
    simTime: 0,
    feverParticleAccum: 0,
    trackLength: 920,
    rainbowFever: 0,  // 0..100
    feverTimer: 0,
    trauma: 0,        // 0..1 camera trauma (shake = trauma²)
    camBasePos: new THREE.Vector3(),
    camBaseInitialized: false,
    carts: [],
    coins: [],
    bonusCoins: [],
    gates: [],
    boostPads: [],
    loopZones: [],
    loopArches: [],
    stageAnimatedProps: [],
    stageParticleSystem: null,
    lastRankOrder: []
  };

  // Cached DOM References (Zero per-frame querySelector calls)
  const canvas = document.getElementById('coaster-canvas');
  const rainbowFeverBorderEl = document.getElementById('rainbow-fever-border');
  const webglFallbackEl = document.getElementById('webgl-fallback');
  const loadingOverlayEl = document.getElementById('loading-overlay');
  const loadingBarFillEl = document.getElementById('loading-bar-fill');
  const critterPickerToggle = document.getElementById('critter-picker-toggle');
  const activeCritterImg = document.getElementById('active-critter-img');
  const activeCritterEmoji = document.getElementById('active-critter-emoji');
  const critterDrawer = document.getElementById('critter-drawer');
  const stageRail = document.getElementById('stage-rail');
  const totalStarsCount = document.getElementById('total-stars-count');
  const cameraBtn = document.getElementById('camera-btn');
  const soundBtn = document.getElementById('sound-btn');
  const rankMedalEl = document.getElementById('rank-medal');
  const trackFillBar = document.getElementById('track-fill-bar');
  const trackMarkersLayer = document.getElementById('track-markers-layer');
  const coinCounterEl = document.getElementById('coin-counter');
  const speedSegEls = Array.from(document.querySelectorAll('#speed-segments .speed-seg'));
  const liveStandingsStrip = document.getElementById('live-standings-strip');
  const centerCallout = document.getElementById('center-callout');
  const calloutIcon = document.getElementById('callout-icon');
  const calloutSub = document.getElementById('callout-sub');
  const laneDots = Array.from(document.querySelectorAll('.lane-dot'));
  const feverIconEl = document.getElementById('fever-icon');
  const feverBarOuterEl = document.getElementById('fever-bar-outer');
  const feverBarFill = document.getElementById('fever-bar-fill');
  const btnLaneLeftEl = document.getElementById('btn-lane-left');
  const btnLaneRightEl = document.getElementById('btn-lane-right');
  const btnHopEl = document.getElementById('btn-hop');
  const hopAlertBadgeEl = document.getElementById('hop-alert-badge');
  const pedalMagnetBtn = document.getElementById('pedal-magnet');
  const pedalTurboBtn = document.getElementById('pedal-turbo');
  const pedalSlamBtn = document.getElementById('pedal-slam');
  const podiumOverlay = document.getElementById('podium-overlay');
  const podiumResultCrown = document.getElementById('podium-result-crown');
  const podiumStars = Array.from(document.querySelectorAll('.podium-star'));
  const podiumRankChip = document.getElementById('podium-rank-chip');
  const podiumStageGrid = document.getElementById('podium-stage-grid');
  const btnRetryStage = document.getElementById('btn-retry-stage');
  const btnNextStage = document.getElementById('btn-next-stage');
  const magnetCooldownFillEl = document.querySelector('#pedal-magnet .pedal-cooldown-fill');
  const turboCooldownFillEl = document.querySelector('#pedal-turbo .pedal-cooldown-fill');
  const slamCooldownFillEl = document.querySelector('#pedal-slam .pedal-cooldown-fill');

  let cachedTrackDotEls = [];
  let cachedStandingChipEls = [];
  let coinPopTimeout = null;
  const scratchRainbowColor = new THREE.Color();

  function flashButtonPress(btnEl) {
    if (!btnEl) return;
    btnEl.classList.add('pressed');
    setTimeout(() => btnEl.classList.remove('pressed'), 140);
  }

  function addFeverPoints(gain) {
    if (state.feverTimer > 0) {
      // During active Rainbow Fever, earned fever points extend the active Fever timer (up to 4.5s) instead of being lost!
      state.feverTimer = Math.min(4.5, state.feverTimer + gain * 0.025);
      state.rainbowFever = (state.feverTimer / 4.5) * 100;
    } else {
      state.rainbowFever = Math.min(100, state.rainbowFever + gain);
    }
  }

  function triggerCoinCounterPop() {
    if (!coinCounterEl) return;
    coinCounterEl.classList.add('coin-pop');
    if (coinPopTimeout) clearTimeout(coinPopTimeout);
    coinPopTimeout = setTimeout(() => {
      coinCounterEl.classList.remove('coin-pop');
    }, 150);
  }

  function triggerPedalWobble(btnEl) {
    if (!btnEl) return;
    sfx.cooldownBonk();
    btnEl.classList.remove('pedal-wobble');
    void btnEl.offsetWidth;
    btnEl.classList.add('pedal-wobble');
    setTimeout(() => btnEl.classList.remove('pedal-wobble'), 300);
  }

  function triggerPedalReadyPop(btnEl) {
    if (!btnEl) return;
    sfx.pedalReadyDing();
    btnEl.classList.remove('pedal-ready-pop');
    void btnEl.offsetWidth;
    btnEl.classList.add('pedal-ready-pop');
    setTimeout(() => btnEl.classList.remove('pedal-ready-pop'), 420);
  }

  function addCameraTrauma(amount) {
    const p = state.carts[0];
    const speedScale = p ? THREE.MathUtils.clamp(p.speed / 45.0, 0.75, 1.45) : 1.0;
    state.trauma = Math.min(1.0, state.trauma + amount * speedScale);
  }

  // ==================== THREE.JS RENDERER WITH WEBGL FALLBACK & CONTEXT RECOVERY ====================
  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  } catch (err) {
    if (webglFallbackEl) webglFallbackEl.classList.remove('hidden');
    return;
  }

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 4;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xff99c8, 0.0022);

  const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.4, 920);

  // ==================== GRADIENT SKY DOME & CLOUD-SEA GROUND ====================
  const skyDomeGeo = new THREE.SphereGeometry(840, 28, 20);
  const skyDomePosAttr = skyDomeGeo.attributes.position;
  const skyDomeColors = new Float32Array(skyDomePosAttr.count * 3);
  skyDomeGeo.setAttribute('color', new THREE.BufferAttribute(skyDomeColors, 3));

  const skyDomeMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
    toneMapped: false
  });
  const skyDomeMesh = new THREE.Mesh(skyDomeGeo, skyDomeMat);
  skyDomeMesh.renderOrder = -10;
  scene.add(skyDomeMesh);

  function updateSkyDomeGradient(topHex, bottomHex) {
    const topCol = new THREE.Color(topHex);
    const botCol = new THREE.Color(bottomHex);
    const mixCol = new THREE.Color();
    const count = skyDomePosAttr.count;
    for (let i = 0; i < count; i++) {
      const py = skyDomePosAttr.getY(i);
      const t = THREE.MathUtils.clamp(py / 680, 0, 1);
      mixCol.copy(botCol).lerp(topCol, Math.pow(t, 0.78));
      skyDomeColors[i * 3] = mixCol.r;
      skyDomeColors[i * 3 + 1] = mixCol.g;
      skyDomeColors[i * 3 + 2] = mixCol.b;
    }
    skyDomeGeo.attributes.color.needsUpdate = true;
  }

  // Cloud-Sea Shadow-Receiving Ground Plane at y = GROUND_Y (-25)
  const cloudSeaGeo = new THREE.PlaneGeometry(1600, 2200, 1, 1);
  const cloudSeaMat = new THREE.MeshStandardMaterial({
    color: 0xffd6eb,
    roughness: 0.92,
    metalness: 0.02,
    envMapIntensity: 0.25
  });
  const cloudSeaMesh = new THREE.Mesh(cloudSeaGeo, cloudSeaMat);
  cloudSeaMesh.rotation.x = -Math.PI / 2;
  cloudSeaMesh.position.set(0, GROUND_Y, -600);
  cloudSeaMesh.receiveShadow = true;
  scene.add(cloudSeaMesh);

  // ==================== PER-STAGE PMREM ENVIRONMENT MAP ====================
  let currentEnvMap = null;

  function buildStageEnvironmentMap(skyTopHex, skyBottomHex, accentHex) {
    if (currentEnvMap) {
      currentEnvMap.dispose();
      currentEnvMap = null;
    }
    const envScene = new THREE.Scene();
    const brightTop = new THREE.Color(skyTopHex).lerp(new THREE.Color(0xffffff), 0.45);
    envScene.background = brightTop;

    const lowerHemisphere = new THREE.Mesh(
      new THREE.SphereGeometry(20, 14, 10),
      new THREE.MeshBasicMaterial({ color: skyBottomHex, side: THREE.BackSide })
    );
    envScene.add(lowerHemisphere);

    const panelGeo = new THREE.PlaneGeometry(12, 12);
    const cols = [0xffffff, skyBottomHex, accentHex, 0xffd166];
    cols.forEach((col, idx) => {
      const m = new THREE.Mesh(panelGeo, new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide }));
      const ang = (idx / cols.length) * Math.PI * 2;
      m.position.set(Math.cos(ang) * 11, 4, Math.sin(ang) * 11);
      m.lookAt(0, 0, 0);
      envScene.add(m);
    });

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(envScene, 0.04).texture;
    envScene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    pmrem.dispose();
    currentEnvMap = envTex;
    return envTex;
  }

  // Balanced Physically-Correct Lights + Dynamic Shadow Map following the player
  const hemiLight = new THREE.HemisphereLight(0x9b87d8, 0x997088, 0.82);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfff7e6, 2.1);
  sunLight.position.set(32, 68, 28);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 8;
  sunLight.shadow.camera.far = 170;
  sunLight.shadow.camera.left = -26;
  sunLight.shadow.camera.right = 26;
  sunLight.shadow.camera.top = 26;
  sunLight.shadow.camera.bottom = -26;
  sunLight.shadow.bias = -0.0005;
  sunLight.shadow.normalBias = 0.02;
  scene.add(sunLight);
  scene.add(sunLight.target);

  // WebGL Context Lost / Restored Resilience
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    state.contextLost = true;
  });

  canvas.addEventListener('webglcontextrestored', () => {
    state.contextLost = false;
    const cfg = STAGES[(state.stageId - 1) % STAGES.length];
    scene.environment = buildStageEnvironmentMap(cfg.skyTop, cfg.skyBottom, cfg.railColor);
  });

  // ==================== LOADING MANAGER & EMOJI FALLBACK TEXTURES ====================
  const fallbackTextureCache = new Map();
  const textureCache = new Map();
  const badgeMaterialsByCritter = new Map();

  function createEmojiMedallionTexture(critter) {
    if (fallbackTextureCache.has(critter.id)) return fallbackTextureCache.get(critter.id);
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    const hexStr = '#' + critter.color.toString(16).padStart(6, '0');
    const trimStr = '#' + critter.trim.toString(16).padStart(6, '0');
    ctx.fillStyle = hexStr;
    ctx.beginPath();
    ctx.arc(64, 64, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = trimStr;
    ctx.stroke();
    ctx.font = '68px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(critter.faceEmoji || '⭐', 64, 68);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    fallbackTextureCache.set(critter.id, tex);
    return tex;
  }

  const loadingManager = new THREE.LoadingManager();
  loadingManager.onStart = () => {
    if (!state.assetsReady && loadingOverlayEl) {
      loadingOverlayEl.classList.remove('hidden');
    }
  };
  loadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
    if (loadingBarFillEl && itemsTotal > 0) {
      loadingBarFillEl.style.width = `${Math.round((itemsLoaded / itemsTotal) * 100)}%`;
    }
  };
  loadingManager.onLoad = () => {
    state.assetsReady = true;
    if (loadingOverlayEl) loadingOverlayEl.classList.add('hidden');
  };

  const textureLoader = new THREE.TextureLoader(loadingManager);

  function loadCritterPortraitTexture(critter) {
    const fallbackTex = createEmojiMedallionTexture(critter);
    if (textureCache.has(critter.id)) return textureCache.get(critter.id);
    textureCache.set(critter.id, fallbackTex);

    textureLoader.load(
      critter.icon,
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        loadedTex.anisotropy = maxAnisotropy;
        textureCache.set(critter.id, loadedTex);
        const mats = badgeMaterialsByCritter.get(critter.id) || [];
        mats.forEach((mat) => {
          mat.map = loadedTex;
          mat.needsUpdate = true;
        });
      },
      undefined,
      () => {
        textureCache.set(critter.id, fallbackTex);
      }
    );
    return fallbackTex;
  }

  CRITTERS.forEach((c) => loadCritterPortraitTexture(c));

  function createFinishBannerTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext('2d');
    const sq = 16;
    for (let y = 0; y < c.height; y += sq) {
      for (let x = 0; x < c.width; x += sq) {
        ctx.fillStyle = ((x / sq + y / sq) % 2 === 0) ? '#ffffff' : '#180d38';
        ctx.fillRect(x, y, sq, sq);
      }
    }
    ctx.strokeStyle = '#ffd93d';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, c.width - 6, c.height - 6);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    return tex;
  }

  const finishBannerTex = createFinishBannerTexture();

  // Dynamic Scene Group (disposed cleanly on stage switch)
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  // ==================== 128-SLOT PARTICLE POOL WITH OLDEST-STEAL & CART VELOCITY ====================
  const PARTICLE_POOL_SIZE = 128;
  const particlePool = [];
  const sharedParticleGeo = new THREE.OctahedronGeometry(0.42, 0);
  const particleGroup = new THREE.Group();
  scene.add(particleGroup);

  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffd93d, toneMapped: false });
    const mesh = new THREE.Mesh(sharedParticleGeo, mat);
    mesh.visible = false;
    particleGroup.add(mesh);
    particlePool.push({
      mesh,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 0.6
    });
  }

  function acquireParticleSlot() {
    let oldestSlot = particlePool[0];
    for (let i = 0; i < particlePool.length; i++) {
      const p = particlePool[i];
      if (p.life <= 0) return p;
      if (p.life < oldestSlot.life) oldestSlot = p;
    }
    return oldestSlot;
  }

  function spawnStarBurst(originPos, colorHex = 0xffd93d, count = 10, cartForVel = null) {
    let baseVx = 0;
    let baseVy = 0;
    let baseVz = 0;
    let spawnX = originPos.x;
    let spawnY = originPos.y + 1.35;
    let spawnZ = originPos.z;

    if (cartForVel) {
      const f = sampleTrackFrame(cartForVel.distance, cartForVel.lateralX, 1.35 + cartForVel.hopY);
      spawnX = f.pos.x;
      spawnY = f.pos.y;
      spawnZ = f.pos.z;
      baseVx = f.tangent.x * cartForVel.speed * 0.88;
      baseVy = f.tangent.y * cartForVel.speed * 0.88;
      baseVz = f.tangent.z * cartForVel.speed * 0.88;
    }

    for (let s = 0; s < count; s++) {
      const p = acquireParticleSlot();
      p.mesh.visible = true;
      p.mesh.position.set(spawnX, spawnY, spawnZ);
      p.mesh.material.color.setHex(colorHex);
      const angle = Math.random() * Math.PI * 2;
      const radialSpeed = 4.5 + Math.random() * 9.5;
      p.vx = baseVx + Math.cos(angle) * radialSpeed;
      p.vy = baseVy + 6.5 + Math.random() * 9.5;
      p.vz = baseVz + Math.sin(angle) * radialSpeed;
      p.maxLife = 0.48 + Math.random() * 0.24;
      p.life = p.maxLife;
    }
  }

  function updateParticles(dt) {
    for (let i = 0; i < particlePool.length; i++) {
      const p = particlePool[i];
      if (p.life > 0) {
        p.life -= dt;
        if (p.life <= 0) {
          p.mesh.visible = false;
        } else {
          p.mesh.position.x += p.vx * dt;
          p.mesh.position.y += p.vy * dt;
          p.mesh.position.z += p.vz * dt;
          p.vy -= GRAVITY * dt;
          const s = Math.max(0.1, p.life / p.maxLife);
          p.mesh.scale.setScalar(s);
          p.mesh.rotation.y += 6 * dt;
          p.mesh.rotation.x += 4 * dt;
        }
      }
    }
  }

  // ==================== REUSABLE FLYING BONUS STAR COIN POOL ====================
  const BONUS_COIN_POOL_SIZE = 28;
  const bonusCoinPool = [];
  const sharedBonusCoinGeo = new THREE.OctahedronGeometry(0.66, 0);
  const sharedBonusCoinMat = new THREE.MeshStandardMaterial({
    color: 0xffd93d,
    metalness: 0.72,
    roughness: 0.2,
    emissive: 0xffb703,
    emissiveIntensity: 0.45
  });
  const bonusCoinGroup = new THREE.Group();
  scene.add(bonusCoinGroup);

  for (let i = 0; i < BONUS_COIN_POOL_SIZE; i++) {
    const mesh = new THREE.Mesh(sharedBonusCoinGeo, sharedBonusCoinMat);
    mesh.visible = false;
    bonusCoinGroup.add(mesh);
    bonusCoinPool.push({
      mesh,
      active: false,
      t: 0,
      duration: 0.34,
      startPos: new THREE.Vector3(),
      ctrlPos: new THREE.Vector3()
    });
  }

  function spawnFlyingBonusCoins(sourcePos, count = 2) {
    for (let n = 0; n < count; n++) {
      let slot = bonusCoinPool.find((b) => !b.active);
      if (!slot) slot = bonusCoinPool[n % bonusCoinPool.length];
      slot.active = true;
      slot.t = 0;
      slot.duration = 0.28 + n * 0.05;
      slot.startPos.copy(sourcePos);
      slot.startPos.y += 1.2;
      const spreadX = (n - (count - 1) * 0.5) * 2.2;
      slot.ctrlPos.set(sourcePos.x + spreadX, sourcePos.y + 4.8 + n * 0.7, sourcePos.z - 4.0);
      slot.mesh.position.copy(slot.startPos);
      slot.mesh.scale.setScalar(1.05);
      slot.mesh.visible = true;
    }
  }

  const scratchBezierA = new THREE.Vector3();
  const scratchBezierB = new THREE.Vector3();
  const scratchPlayerBodyPos = new THREE.Vector3();

  function updateFlyingBonusCoins(dt, playerBodyPos) {
    for (let i = 0; i < bonusCoinPool.length; i++) {
      const b = bonusCoinPool[i];
      if (!b.active) continue;
      b.t += dt / b.duration;
      if (b.t >= 1) {
        b.active = false;
        b.mesh.visible = false;
        const p = getPlayerCart();
        if (p) {
          p.coins += 1;
          addFeverPoints(3.5);
          sfx.coin();
          triggerCoinCounterPop();
        }
      } else {
        const u = b.t;
        scratchBezierA.lerpVectors(b.startPos, b.ctrlPos, u);
        scratchBezierB.lerpVectors(b.ctrlPos, playerBodyPos, u);
        b.mesh.position.lerpVectors(scratchBezierA, scratchBezierB, u);
        b.mesh.rotation.y += 14 * dt;
        b.mesh.scale.setScalar(1.05 - 0.55 * u);
      }
    }
  }

  function clearGroupDeep(group) {
    badgeMaterialsByCritter.clear();
    state.stageAnimatedProps = [];
    state.stageParticleSystem = null;
    particlePool.forEach((p) => {
      p.life = 0;
      p.mesh.visible = false;
    });
    bonusCoinPool.forEach((b) => {
      b.active = false;
      b.mesh.visible = false;
    });
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      child.traverse((node) => {
        if (node.geometry && node.geometry !== sharedParticleGeo && node.geometry !== sharedBonusCoinGeo) {
          node.geometry.dispose();
        }
        if (node.material && node.material !== sharedBonusCoinMat) {
          if (Array.isArray(node.material)) {
            node.material.forEach((m) => m.dispose());
          } else {
            node.material.dispose();
          }
        }
      });
    }
  }

  // ==================== BANKED CURVATURE SPLINE TRACK FRAME ====================
  let trackSpline = null;
  let currentStageCfg = STAGES[0];

  function buildCoasterSpline(stageCfg) {
    const pts = [];
    const segments = 110;
    const zSpan = stageCfg.trackLength;
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const dist = u * zSpan;
      const env = Math.sin(u * Math.PI);
      const x = Math.sin(u * Math.PI * 2 * stageCfg.curves) * stageCfg.curveAmp * env
              + Math.cos(u * Math.PI * 4) * (stageCfg.curveAmp * 0.22) * env;
      const y = 26
              + Math.sin(u * Math.PI * 2 * stageCfg.hills) * stageCfg.hillAmp * env
              + Math.cos(u * Math.PI * 3 * stageCfg.hills) * (stageCfg.hillAmp * 0.32) * env;
      const z = -dist;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  }

  const worldUp = new THREE.Vector3(0, 1, 0);
  const scratchTanMinus = new THREE.Vector3();
  const scratchTanPlus = new THREE.Vector3();
  const scratchBack = new THREE.Vector3();
  const scratchBasisMatrix = new THREE.Matrix4();

  function createFrameStruct() {
    return {
      u: 0,
      bank: 0,
      kappa: 0,
      pos: new THREE.Vector3(),
      railPos: new THREE.Vector3(),
      centerPos: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3()
    };
  }

  const sharedFrame = createFrameStruct();
  const camBehindFrame = createFrameStruct();
  const camLookFrame = createFrameStruct();

  function sampleTrackFrame(distance, lateralOffset = 0, heightOffset = 0, out = sharedFrame) {
    const u = Math.max(0, Math.min(1, distance / state.trackLength));
    trackSpline.getPointAt(u, out.centerPos);
    trackSpline.getTangentAt(u, out.tangent).normalize();

    out.right.crossVectors(out.tangent, worldUp).normalize();
    if (out.right.lengthSq() < 0.001) out.right.set(1, 0, 0);
    out.up.crossVectors(out.right, out.tangent).normalize();

    const du = 0.006;
    const u0 = Math.max(0, u - du);
    const u1 = Math.min(1, u + du);
    trackSpline.getTangentAt(u0, scratchTanMinus).normalize();
    trackSpline.getTangentAt(u1, scratchTanPlus).normalize();
    const ds = Math.max(0.5, (u1 - u0) * state.trackLength);
    const dTanDotRight = scratchTanPlus.sub(scratchTanMinus).dot(out.right);
    const kappa = dTanDotRight / ds;

    const bankAngle = THREE.MathUtils.clamp(+kappa * 14.5, -0.35, 0.35);
    out.bank = bankAngle;
    out.kappa = kappa;

    out.right.applyAxisAngle(out.tangent, bankAngle).normalize();
    out.up.applyAxisAngle(out.tangent, bankAngle).normalize();

    out.railPos.copy(out.centerPos)
      .addScaledVector(out.right, lateralOffset);

    out.pos.copy(out.railPos)
      .addScaledVector(out.up, heightOffset);

    out.u = u;
    return out;
  }

  function applyTrackFrameOrientation(obj3d, frame) {
    scratchBack.copy(frame.tangent).negate();
    scratchBasisMatrix.makeBasis(frame.right, frame.up, scratchBack);
    obj3d.setRotationFromMatrix(scratchBasisMatrix);
  }

  // ==================== BUILD 3D COASTER CART + 8 DISTINCT CRITTER SILHOUETTES + UPRIGHT BILLBOARD ====================
  function buildCritterHeadSilhouette(riderGroup, critter, earMat) {
    switch (critter.earType) {
      case 'cat': {
        [-0.46, 0.46].forEach((ex) => {
          const ear = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.72, 10), earMat);
          ear.position.set(ex, 0.78, 0);
          ear.rotation.z = ex < 0 ? 0.32 : -0.32;
          ear.castShadow = true;
          riderGroup.add(ear);
        });
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.15, 8), earMat);
        tail.position.set(0, 0.25, 0.72);
        tail.rotation.x = 0.65;
        riderGroup.add(tail);
        break;
      }
      case 'dog': {
        [-0.74, 0.74].forEach((ex) => {
          const ear = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), earMat);
          ear.scale.set(0.45, 1.4, 0.78);
          ear.position.set(ex, 0.12, 0.04);
          ear.rotation.z = ex < 0 ? 0.25 : -0.25;
          ear.castShadow = true;
          riderGroup.add(ear);
        });
        break;
      }
      case 'bear': {
        [-0.55, 0.55].forEach((ex) => {
          const ear = new THREE.Mesh(new THREE.SphereGeometry(0.29, 12, 10), earMat);
          ear.position.set(ex, 0.68, 0);
          ear.castShadow = true;
          riderGroup.add(ear);
        });
        break;
      }
      case 'pig': {
        const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.34, 14), earMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, 0.05, -0.72);
        riderGroup.add(snout);
        [-0.44, 0.44].forEach((ex) => {
          const ear = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.48, 4), earMat);
          ear.position.set(ex, 0.72, -0.1);
          ear.rotation.set(-0.35, 0, ex < 0 ? 0.4 : -0.4);
          ear.castShadow = true;
          riderGroup.add(ear);
        });
        break;
      }
      case 'bunny': {
        [-0.36, 0.36].forEach((ex) => {
          const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.18, 10), earMat);
          ear.position.set(ex, 1.05, 0);
          ear.rotation.z = ex < 0 ? 0.16 : -0.16;
          ear.castShadow = true;
          riderGroup.add(ear);
        });
        break;
      }
      case 'elephant': {
        [-0.86, 0.86].forEach((ex) => {
          const ear = new THREE.Mesh(new THREE.SphereGeometry(0.56, 14, 12), earMat);
          ear.scale.set(0.22, 1.08, 0.85);
          ear.position.set(ex, 0.22, 0);
          ear.castShadow = true;
          riderGroup.add(ear);
        });
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.85, 10), earMat);
        trunk.position.set(0, -0.05, -0.78);
        trunk.rotation.x = -0.6;
        riderGroup.add(trunk);
        break;
      }
      case 'unicorn': {
        const horn = new THREE.Mesh(
          new THREE.ConeGeometry(0.22, 1.08, 12),
          new THREE.MeshBasicMaterial({ color: 0xffd93d, toneMapped: false })
        );
        horn.position.set(0, 1.05, -0.18);
        horn.rotation.x = -0.25;
        riderGroup.add(horn);
        for (let m = 0; m < 3; m++) {
          const mane = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), earMat);
          mane.position.set(0, 0.65 - m * 0.25, 0.58);
          riderGroup.add(mane);
        }
        break;
      }
      case 'crest':
      default: {
        [-0.26, 0, 0.26].forEach((cz, idx) => {
          const comb = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.52 + (idx === 1 ? 0.14 : 0), 8), earMat);
          comb.position.set(0, 0.88, cz);
          comb.castShadow = true;
          riderGroup.add(comb);
        });
        const beak = new THREE.Mesh(
          new THREE.ConeGeometry(0.22, 0.5, 8),
          new THREE.MeshBasicMaterial({ color: 0xff6b35, toneMapped: false })
        );
        beak.rotation.x = -Math.PI / 2;
        beak.position.set(0, 0.08, -0.82);
        riderGroup.add(beak);
        break;
      }
    }
  }

  function createCoasterCartMesh(critter, isPlayer) {
    const root = new THREE.Group();

    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x090418,
      transparent: true,
      opacity: 0.52,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(new THREE.CircleGeometry(1.55, 18), shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.08;
    root.add(shadowMesh);

    const slamGroup = new THREE.Group();
    slamGroup.position.y = 0.55;
    slamGroup.visible = false;
    root.add(slamGroup);

    const slamRingMat = new THREE.MeshBasicMaterial({
      color: 0xff4b91,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      toneMapped: false
    });
    const slamRing = new THREE.Mesh(new THREE.RingGeometry(2.2, 3.6, 28), slamRingMat);
    slamRing.rotation.x = -Math.PI / 2;
    slamGroup.add(slamRing);

    const slamWallMat = new THREE.MeshBasicMaterial({
      color: 0xffd93d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      toneMapped: false
    });
    const slamWall = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 1.45, 28, 1, true), slamWallMat);
    slamWall.position.y = 0.65;
    slamGroup.add(slamWall);

    const hopGroup = new THREE.Group();
    root.add(hopGroup);

    const flipPivot = new THREE.Group();
    flipPivot.position.y = FLIP_PIVOT_Y;
    hopGroup.add(flipPivot);

    const cartBodyGroup = new THREE.Group();
    cartBodyGroup.position.y = -FLIP_PIVOT_Y;
    flipPivot.add(cartBodyGroup);

    const chassisMat = new THREE.MeshStandardMaterial({
      color: critter.color,
      roughness: 0.28,
      metalness: 0.62,
      envMapIntensity: 0.85
    });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.92, 3.1), chassisMat);
    chassis.position.y = 0.72;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    cartBodyGroup.add(chassis);

    const trimMat = new THREE.MeshStandardMaterial({
      color: critter.trim,
      roughness: 0.24,
      metalness: 0.72,
      envMapIntensity: 0.85,
      emissive: critter.trim,
      emissiveIntensity: 0.16
    });
    const frontNose = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.98, 2.05, 14), trimMat);
    frontNose.rotation.z = Math.PI / 2;
    frontNose.position.set(0, 0.68, -1.45);
    frontNose.castShadow = true;
    cartBodyGroup.add(frontNose);

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 14);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x22223b,
      metalness: 0.65,
      roughness: 0.3,
      envMapIntensity: 0.75,
      emissive: isPlayer ? 0xffd93d : 0x00bbf9,
      emissiveIntensity: 0.28
    });
    const wheelPositions = [
      [-WHEEL_RAIL_GAUGE, 0.38, -1.05],
      [WHEEL_RAIL_GAUGE, 0.38, -1.05],
      [-WHEEL_RAIL_GAUGE, 0.38, 1.05],
      [WHEEL_RAIL_GAUGE, 0.38, 1.05]
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      w.castShadow = true;
      cartBodyGroup.add(w);
    });

    const thrusterGeo = new THREE.CylinderGeometry(0.24, 0.34, 0.7, 10);
    const thrusterMat = new THREE.MeshStandardMaterial({
      color: 0xffd93d,
      metalness: 0.8,
      roughness: 0.22,
      envMapIntensity: 0.85,
      emissive: 0xff6b35,
      emissiveIntensity: 0.42
    });
    [-0.55, 0.55].forEach((tx) => {
      const pipe = new THREE.Mesh(thrusterGeo, thrusterMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(tx, 0.78, 1.65);
      cartBodyGroup.add(pipe);
    });

    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, toneMapped: false });
    const flameCone = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.85, 10), flameMat);
    flameCone.rotation.x = Math.PI / 2;
    flameCone.position.set(0, 0.78, 2.42);
    flameCone.visible = false;
    cartBodyGroup.add(flameCone);

    const riderGroup = new THREE.Group();
    riderGroup.position.set(0, 1.62, -0.05);
    cartBodyGroup.add(riderGroup);

    const headMat = new THREE.MeshStandardMaterial({
      color: critter.color,
      roughness: 0.42,
      metalness: 0.1,
      envMapIntensity: 0.35
    });
    const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.76, 18, 16), headMat);
    headSphere.castShadow = true;
    riderGroup.add(headSphere);

    const earMat = new THREE.MeshStandardMaterial({
      color: critter.trim,
      roughness: 0.38,
      metalness: 0.12,
      envMapIntensity: 0.35
    });
    buildCritterHeadSilhouette(riderGroup, critter, earMat);

    const billboardGroup = new THREE.Group();
    billboardGroup.position.set(0, BILLBOARD_BASE_Y, 0);
    hopGroup.add(billboardGroup);

    const portraitTex = loadCritterPortraitTexture(critter);
    const badgeMat = new THREE.MeshBasicMaterial({
      map: portraitTex,
      side: THREE.FrontSide,
      toneMapped: false
    });
    if (!badgeMaterialsByCritter.has(critter.id)) {
      badgeMaterialsByCritter.set(critter.id, []);
    }
    badgeMaterialsByCritter.get(critter.id).push(badgeMat);

    const badgeDisc = new THREE.Mesh(new THREE.CircleGeometry(0.68, 24), badgeMat);
    billboardGroup.add(badgeDisc);

    const rimRing = new THREE.Mesh(
      new THREE.RingGeometry(0.65, BILLBOARD_RIM_RADIUS, 24),
      new THREE.MeshBasicMaterial({ color: isPlayer ? 0xffd93d : critter.trim, side: THREE.FrontSide, toneMapped: false })
    );
    rimRing.position.z = 0.01;
    billboardGroup.add(rimRing);

    const magnetRing = new THREE.Group();
    magnetRing.position.y = 1.05;
    magnetRing.visible = false;
    hopGroup.add(magnetRing);

    const outerMagTorus = new THREE.Mesh(
      new THREE.TorusGeometry(5.2, 0.14, 10, 32),
      new THREE.MeshBasicMaterial({ color: 0x38ef7d, transparent: true, opacity: 0.75, toneMapped: false })
    );
    outerMagTorus.rotation.x = Math.PI / 2;
    magnetRing.add(outerMagTorus);

    const innerMagTorus = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.12, 10, 24),
      new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.85, toneMapped: false })
    );
    innerMagTorus.rotation.x = Math.PI / 2;
    innerMagTorus.position.y = 0.35;
    magnetRing.add(innerMagTorus);

    return {
      root,
      shadowMesh,
      hopGroup,
      flipPivot,
      cartBodyGroup,
      riderGroup,
      billboardGroup,
      flameCone,
      magnetRing,
      slamGroup,
      slamRingMat,
      slamWallMat
    };
  }

  // ==================== PER-STAGE 3D LANDMARK PROPS & AMBIENT PARTICLE LAYER ====================
  function buildStageThemeProps(cfg) {
    const particleCount = 260;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const d = Math.random() * state.trackLength;
      const f = sampleTrackFrame(d, (Math.random() - 0.5) * 65, -4 + Math.random() * 28);
      positions[i * 3] = f.pos.x;
      positions[i * 3 + 1] = f.pos.y;
      positions[i * 3 + 2] = f.pos.z;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: cfg.particleColor,
      size: cfg.theme === 'glacier' || cfg.theme === 'volcano' ? 1.35 : 1.15,
      transparent: true,
      opacity: 0.88,
      toneMapped: false
    });
    const pointsMesh = new THREE.Points(pGeo, pMat);
    worldGroup.add(pointsMesh);
    state.stageParticleSystem = pointsMesh;

    const propCount = 16;
    for (let i = 0; i < propCount; i++) {
      const d = 55 + ((i + 0.35) / propCount) * (state.trackLength - 110);
      const sideSign = i % 2 === 0 ? 1 : -1;
      const sideOffset = sideSign * (13.5 + (i % 3) * 4.5);
      const f = sampleTrackFrame(d, sideOffset, -1.5);
      const propGroup = new THREE.Group();
      propGroup.position.copy(f.pos);

      switch (cfg.theme) {
        case 'candy': {
          const stick = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 7.5, 8),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
          );
          stick.position.y = 3.75;
          propGroup.add(stick);
          const candyHead = new THREE.Mesh(
            new THREE.CylinderGeometry(2.2, 2.2, 0.55, 18),
            new THREE.MeshStandardMaterial({
              color: i % 2 === 0 ? 0xff477e : 0x00f5d4,
              roughness: 0.25,
              emissive: i % 2 === 0 ? 0xff477e : 0x00f5d4,
              emissiveIntensity: 0.22
            })
          );
          candyHead.rotation.x = Math.PI / 2;
          candyHead.position.y = 7.8;
          propGroup.add(candyHead);
          const swirlRing = new THREE.Mesh(
            new THREE.TorusGeometry(1.35, 0.22, 8, 20),
            new THREE.MeshBasicMaterial({ color: 0xffd166, toneMapped: false })
          );
          swirlRing.position.set(0, 7.8, 0.3);
          propGroup.add(swirlRing);
          break;
        }
        case 'carnival': {
          const wheelGroup = new THREE.Group();
          wheelGroup.position.y = 7.5;
          const rim = new THREE.Mesh(
            new THREE.TorusGeometry(4.8, 0.28, 10, 24),
            new THREE.MeshStandardMaterial({ color: 0xffbe0b, metalness: 0.7, roughness: 0.2, emissive: 0xffbe0b, emissiveIntensity: 0.25 })
          );
          wheelGroup.add(rim);
          for (let g = 0; g < 6; g++) {
            const ang = (g / 6) * Math.PI * 2;
            const cab = new THREE.Mesh(
              new THREE.SphereGeometry(0.75, 10, 10),
              new THREE.MeshBasicMaterial({ color: g % 2 === 0 ? 0xff006e : 0x00f5d4, toneMapped: false })
            );
            cab.position.set(Math.cos(ang) * 4.8, Math.sin(ang) * 4.8, 0);
            wheelGroup.add(cab);
          }
          propGroup.add(wheelGroup);
          state.stageAnimatedProps.push({ mesh: wheelGroup, type: 'spinZ', speed: 1.4 });
          break;
        }
        case 'carousel': {
          const carouselGroup = new THREE.Group();
          const base = new THREE.Mesh(
            new THREE.CylinderGeometry(3.6, 3.8, 0.6, 16),
            new THREE.MeshStandardMaterial({ color: 0xfee440, roughness: 0.3 })
          );
          carouselGroup.add(base);
          const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.35, 6.2, 10),
            new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6 })
          );
          pole.position.y = 3.1;
          carouselGroup.add(pole);
          const roof = new THREE.Mesh(
            new THREE.ConeGeometry(4.2, 2.6, 16),
            new THREE.MeshStandardMaterial({ color: 0xf72585, roughness: 0.3, emissive: 0xf72585, emissiveIntensity: 0.2 })
          );
          roof.position.y = 6.8;
          carouselGroup.add(roof);
          propGroup.add(carouselGroup);
          state.stageAnimatedProps.push({ mesh: carouselGroup, type: 'spinY', speed: 1.8 });
          break;
        }
        case 'moon': {
          const crystal = new THREE.Mesh(
            new THREE.OctahedronGeometry(2.6, 0),
            new THREE.MeshStandardMaterial({
              color: 0x00bbf9,
              metalness: 0.6,
              roughness: 0.15,
              emissive: 0x9d4edd,
              emissiveIntensity: 0.45
            })
          );
          crystal.position.y = 5.5;
          propGroup.add(crystal);
          const orbitRing = new THREE.Mesh(
            new THREE.TorusGeometry(3.6, 0.16, 8, 24),
            new THREE.MeshBasicMaterial({ color: 0xe0aaff, toneMapped: false })
          );
          orbitRing.position.y = 5.5;
          orbitRing.rotation.x = 0.8;
          propGroup.add(orbitRing);
          state.stageAnimatedProps.push({ mesh: crystal, type: 'spinY', speed: 2.2 });
          break;
        }
        case 'beach': {
          const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.55, 7.2, 8),
            new THREE.MeshStandardMaterial({ color: 0xb5651d, roughness: 0.7 })
          );
          trunk.position.y = 3.6;
          trunk.rotation.z = sideSign * -0.14;
          propGroup.add(trunk);
          const frondMat = new THREE.MeshStandardMaterial({ color: 0x2ec4b6, roughness: 0.4 });
          for (let fIdx = 0; fIdx < 5; fIdx++) {
            const ang = (fIdx / 5) * Math.PI * 2;
            const frond = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.6, 6), frondMat);
            frond.position.set(Math.cos(ang) * 1.4, 7.2, Math.sin(ang) * 1.4);
            frond.rotation.z = -Math.cos(ang) * 1.1;
            frond.rotation.x = Math.sin(ang) * 1.1;
            propGroup.add(frond);
          }
          break;
        }
        case 'glacier': {
          const mainSpire = new THREE.Mesh(
            new THREE.ConeGeometry(1.8, 9.5, 6),
            new THREE.MeshStandardMaterial({
              color: 0x90e0ef,
              metalness: 0.75,
              roughness: 0.12,
              emissive: 0x00bbf9,
              emissiveIntensity: 0.3
            })
          );
          mainSpire.position.y = 4.75;
          propGroup.add(mainSpire);
          [-1.6, 1.6].forEach((sx) => {
            const subSpire = new THREE.Mesh(
              new THREE.ConeGeometry(1.1, 5.8, 6),
              mainSpire.material
            );
            subSpire.position.set(sx, 2.9, 0.5);
            subSpire.rotation.z = sx < 0 ? 0.28 : -0.28;
            propGroup.add(subSpire);
          });
          break;
        }
        case 'volcano': {
          const cone = new THREE.Mesh(
            new THREE.CylinderGeometry(1.6, 5.2, 8.5, 12),
            new THREE.MeshStandardMaterial({ color: 0x370617, roughness: 0.8 })
          );
          cone.position.y = 4.25;
          propGroup.add(cone);
          const lavaCrater = new THREE.Mesh(
            new THREE.CylinderGeometry(1.65, 1.4, 0.6, 12),
            new THREE.MeshBasicMaterial({ color: 0xffba08, toneMapped: false })
          );
          lavaCrater.position.y = 8.4;
          propGroup.add(lavaCrater);
          break;
        }
        case 'galaxy':
        default: {
          const planet = new THREE.Mesh(
            new THREE.SphereGeometry(2.4, 16, 14),
            new THREE.MeshStandardMaterial({
              color: i % 2 === 0 ? 0xff007f : 0x3a86ff,
              metalness: 0.5,
              roughness: 0.25,
              emissive: i % 2 === 0 ? 0xff007f : 0x00f5d4,
              emissiveIntensity: 0.28
            })
          );
          planet.position.y = 6.2;
          propGroup.add(planet);
          const pRing = new THREE.Mesh(
            new THREE.RingGeometry(3.1, 4.5, 24),
            new THREE.MeshBasicMaterial({ color: 0xffd93d, side: THREE.DoubleSide, toneMapped: false })
          );
          pRing.position.y = 6.2;
          pRing.rotation.x = 1.15;
          propGroup.add(pRing);
          state.stageAnimatedProps.push({ mesh: planet, type: 'spinY', speed: 1.5 });
          break;
        }
      }

      worldGroup.add(propGroup);
    }
  }

  // ==================== BUILD 3D SKY COASTER STAGE ====================
  function buildStageWorld(stageId) {
    clearGroupDeep(worldGroup);

    const cfg = STAGES[(stageId - 1) % STAGES.length];
    currentStageCfg = cfg;
    state.stageId = cfg.id;
    state.simTime = 0;
    state.status = 'countdown';
    state.statusBeforePause = 'countdown';
    state.countdownTimer = 1.8;
    state.lastCountdownTick = 4;
    state.bufferedCountdownAction = null;
    state.rainbowFever = 0;
    state.feverTimer = 0;
    state.trauma = 0;
    state.camBaseInitialized = false;
    state.lastRankOrder = [];
    if (rainbowFeverBorderEl) rainbowFeverBorderEl.classList.add('hidden');

    scene.background = null;
    scene.fog.color.setHex(cfg.skyBottom);
    updateSkyDomeGradient(cfg.skyTop, cfg.skyBottom);
    cloudSeaMat.color.setHex(cfg.cloudColor);

    hemiLight.color.copy(new THREE.Color(cfg.skyTop)).lerp(new THREE.Color(0xffffff), 0.55);
    hemiLight.groundColor.copy(new THREE.Color(cfg.cloudColor)).multiplyScalar(0.55);
    scene.environment = buildStageEnvironmentMap(cfg.skyTop, cfg.skyBottom, cfg.railColor);

    trackSpline = buildCoasterSpline(cfg);
    const splineLen = Math.round(trackSpline.getLength());
    state.trackLength = splineLen;

    const tubularSegments = Math.max(280, Math.round(splineLen / 2.4));
    const railSamples = Math.max(220, Math.round(splineLen / 3.5));
    const railRadius = 0.14;
    const railMat = new THREE.MeshStandardMaterial({
      color: cfg.railColor,
      metalness: 0.78,
      roughness: 0.22,
      envMapIntensity: 0.9,
      emissive: cfg.railColor,
      emissiveIntensity: 0.18
    });

    LANE_OFFSETS.forEach((laneCenter) => {
      [-WHEEL_RAIL_GAUGE, WHEEL_RAIL_GAUGE].forEach((wheelOff) => {
        const railOffset = laneCenter + wheelOff;
        const railPts = [];
        for (let i = 0; i <= railSamples; i++) {
          const d = (i / railSamples) * state.trackLength;
          const f = sampleTrackFrame(d, railOffset, 0);
          railPts.push(f.pos.clone());
        }
        const railCurve = new THREE.CatmullRomCurve3(railPts);
        const tubeGeo = new THREE.TubeGeometry(railCurve, tubularSegments, railRadius, 6, false);
        const tubeMesh = new THREE.Mesh(tubeGeo, railMat);
        tubeMesh.receiveShadow = true;
        worldGroup.add(tubeMesh);
      });
    });

    const spinePts = [];
    for (let i = 0; i <= railSamples; i++) {
      const d = (i / railSamples) * state.trackLength;
      const f = sampleTrackFrame(d, 0, -0.32);
      spinePts.push(f.pos.clone());
    }
    const spineCurve = new THREE.CatmullRomCurve3(spinePts);
    const spineMat = new THREE.MeshStandardMaterial({
      color: cfg.deckColor,
      roughness: 0.45,
      metalness: 0.4,
      envMapIntensity: 0.5
    });
    const spineMesh = new THREE.Mesh(new THREE.TubeGeometry(spineCurve, Math.round(tubularSegments * 0.6), 0.36, 6, false), spineMat);
    spineMesh.receiveShadow = true;
    worldGroup.add(spineMesh);

    const tieGeo = new THREE.BoxGeometry(9.6, 0.24, 0.68);
    const tieMat = new THREE.MeshStandardMaterial({
      color: cfg.tieColor,
      roughness: 0.42,
      metalness: 0.3,
      envMapIntensity: 0.45
    });
    const unitPillarGeo = new THREE.CylinderGeometry(0.42, 0.62, 1.0, 8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: cfg.pillarColor,
      roughness: 0.6,
      metalness: 0.3,
      envMapIntensity: 0.35
    });

    const tieCount = Math.round(state.trackLength / 7.5);
    for (let i = 0; i <= tieCount; i++) {
      const d = (i / tieCount) * state.trackLength;
      const f = sampleTrackFrame(d, 0, -0.06);
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.position.copy(f.pos);
      applyTrackFrameOrientation(tie, f);
      tie.receiveShadow = true;
      worldGroup.add(tie);

      if (i % 6 === 0) {
        const pillarHeight = Math.max(4, f.pos.y - GROUND_Y);
        const pillar = new THREE.Mesh(unitPillarGeo, pillarMat);
        pillar.scale.set(1, pillarHeight, 1);
        pillar.position.set(f.pos.x, GROUND_Y + pillarHeight * 0.5, f.pos.z);
        pillar.receiveShadow = true;
        worldGroup.add(pillar);
      }
    }

    const cloudSphereGeo = new THREE.SphereGeometry(3.2, 12, 10);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: cfg.cloudColor,
      roughness: 0.88,
      metalness: 0.02,
      envMapIntensity: 0.25
    });

    for (let i = 0; i < 28; i++) {
      const d = ((i + 0.5) / 28) * state.trackLength;
      const side = (i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 5.5);
      const heightOff = -6 + Math.sin(i * 1.7) * 8;
      const f = sampleTrackFrame(d, side, heightOff);
      const cloudCluster = new THREE.Group();
      cloudCluster.position.copy(f.pos);

      for (let k = 0; k < 3; k++) {
        const puff = new THREE.Mesh(cloudSphereGeo, cloudMat);
        puff.position.set((k - 1) * 2.5, (k === 1 ? 0.9 : 0), 0);
        puff.scale.setScalar(0.85 + (k === 1 ? 0.35 : 0));
        puff.receiveShadow = true;
        cloudCluster.add(puff);
      }
      worldGroup.add(cloudCluster);
    }

    buildStageThemeProps(cfg);

    state.loopZones = [];
    state.loopArches = [];
    const loopRingGeo = new THREE.TorusGeometry(6.4, 0.36, 10, 28);
    const loopRingMat = new THREE.MeshStandardMaterial({
      color: cfg.archColor,
      emissive: cfg.railColor,
      emissiveIntensity: 0.45,
      metalness: 0.72,
      roughness: 0.2
    });

    for (let lIdx = 0; lIdx < cfg.loops; lIdx++) {
      const centerDist = ((lIdx + 1) / (cfg.loops + 1)) * (state.trackLength - 180) + 90;
      state.loopZones.push({ distance: centerDist, triggeredByPlayer: false });
      for (let r = -2; r <= 2; r++) {
        const ringDist = centerDist + r * 4.5;
        const f = sampleTrackFrame(ringDist, 0, 2.2);
        const ring = new THREE.Mesh(loopRingGeo, loopRingMat);
        ring.position.copy(f.pos);
        applyTrackFrameOrientation(ring, f);
        ring.castShadow = true;
        worldGroup.add(ring);
        state.loopArches.push({ distance: ringDist, mesh: ring });
      }
    }

    state.coins = [];
    const coinGeo = new THREE.OctahedronGeometry(0.68, 0);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd93d,
      metalness: 0.72,
      roughness: 0.22,
      envMapIntensity: 0.8,
      emissive: 0xffb703,
      emissiveIntensity: 0.35
    });

    const totalCoins = 64;
    for (let i = 0; i < totalCoins; i++) {
      const d = 45 + (i / totalCoins) * (state.trackLength - 95);
      const laneIdx = (i + Math.floor(i / 4)) % 3;
      const laneX = LANE_OFFSETS[laneIdx];
      const f = sampleTrackFrame(d, laneX, 1.35);
      const mesh = new THREE.Mesh(coinGeo, coinMat);
      mesh.position.copy(f.pos);
      mesh.castShadow = true;
      worldGroup.add(mesh);
      state.coins.push({
        distance: d,
        laneIndex: laneIdx,
        collected: false,
        flying: false,
        flyT: 0,
        flyStartPos: f.pos.clone(),
        flyCtrlPos: f.pos.clone(),
        mesh,
        basePos: f.pos.clone()
      });
    }

    state.gates = [];
    const gateGeo = new THREE.BoxGeometry(2.65, 1.45, 0.55);
    const gateMat = new THREE.MeshStandardMaterial({
      color: cfg.gateColor,
      roughness: 0.32,
      metalness: 0.38,
      envMapIntensity: 0.5,
      emissive: cfg.gateColor,
      emissiveIntensity: 0.28
    });

    for (let i = 0; i < cfg.gateCount; i++) {
      const d = 85 + ((i + 0.4) / cfg.gateCount) * (state.trackLength - 150);
      const laneIdx = (i * 2 + stageId) % 3;
      const laneX = LANE_OFFSETS[laneIdx];
      const f = sampleTrackFrame(d, laneX, 0.85);
      const mesh = new THREE.Mesh(gateGeo, gateMat);
      mesh.position.copy(f.pos);
      applyTrackFrameOrientation(mesh, f);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      worldGroup.add(mesh);
      state.gates.push({
        distance: d,
        laneIndex: laneIdx,
        triggered: false,
        mesh
      });
    }

    state.boostPads = [];
    const padGeo = new THREE.BoxGeometry(2.5, 0.18, 4.2);
    const padMat = new THREE.MeshBasicMaterial({ color: 0x38ef7d, toneMapped: false });

    for (let i = 0; i < cfg.boostCount; i++) {
      const d = 65 + ((i + 0.2) / cfg.boostCount) * (state.trackLength - 125);
      const laneIdx = (i + stageId) % 3;
      const laneX = LANE_OFFSETS[laneIdx];
      const f = sampleTrackFrame(d, laneX, 0.14);
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.copy(f.pos);
      applyTrackFrameOrientation(pad, f);
      worldGroup.add(pad);
      state.boostPads.push({
        distance: d,
        laneIndex: laneIdx,
        mesh: pad
      });
    }

    const finishFrame = sampleTrackFrame(state.trackLength - 8, 0, 0);
    const finishGroup = new THREE.Group();
    finishGroup.position.copy(finishFrame.pos);
    applyTrackFrameOrientation(finishGroup, finishFrame);

    const postGeo = new THREE.CylinderGeometry(0.45, 0.45, 9, 12);
    const postMat = new THREE.MeshStandardMaterial({ color: 0xffd93d, metalness: 0.75, roughness: 0.25 });
    [-5.4, 5.4].forEach((px) => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(px, 4.5, 0);
      post.castShadow = true;
      finishGroup.add(post);
    });

    const bannerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(11.6, 2.2, 0.4),
      new THREE.MeshBasicMaterial({ map: finishBannerTex, toneMapped: false })
    );
    bannerMesh.position.set(0, 8.2, 0);
    finishGroup.add(bannerMesh);

    if (cfg.theme === 'galaxy') {
      const crownRing = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 1.8, 1.5, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd93d, toneMapped: false })
      );
      crownRing.position.set(0, 10.2, 0);
      finishGroup.add(crownRing);
    }

    worldGroup.add(finishGroup);

    spawnCoasterRacers(cfg);
    renderTopStageRail();
    renderTrackDotsUI();
    initStandingsStripDOM();
    showVisualCallout('3️⃣', `🎢 ${cfg.emoji}`, 650);
  }

  function spawnCoasterRacers(cfg) {
    state.carts = [];
    const playerCritter = CRITTERS.find((c) => c.id === state.selectedCritterId) || CRITTERS[0];
    const rivalPool = CRITTERS.filter((c) => c.id !== playerCritter.id);

    const rotatedRivals = [0, 1, 2, 3].map(
      (j) => rivalPool[((cfg.id - 1) * 2 + j) % rivalPool.length]
    );
    const chosenRacers = [playerCritter, ...rotatedRivals];

    chosenRacers.forEach((critter, idx) => {
      const isPlayer = idx === 0;
      const startLane = idx % 3;
      const startDist = isPlayer ? 6 : 9.5 + idx * 3.6;
      const rivalSpread = (idx - 2.5) * 0.62;
      const meshBundle = createCoasterCartMesh(critter, isPlayer);
      worldGroup.add(meshBundle.root);

      const cart = {
        id: critter.id,
        critter,
        isPlayer,
        laneIndex: startLane,
        lateralX: LANE_OFFSETS[startLane],
        distance: startDist,
        speed: isPlayer ? 45.8 : cfg.aiBaseSpeed + rivalSpread,
        baseAiSpeed: cfg.aiBaseSpeed + rivalSpread,
        hopY: 0,
        hopVy: 0,
        loopFlipAngle: 0,
        kickLat: 0,
        kickLon: 0,
        kickSpin: 0,
        spinAngle: 0,
        bumpCooldown: 0,
        coins: 0,
        magnetTimer: 0,
        magnetDuration: 4.2,
        magnetCooldown: 0,
        wasMagnetCooling: false,
        turboTimer: 0,
        turboDuration: 3.0,
        turboCooldown: 0,
        wasTurboCooling: false,
        slamTimer: 0,
        slamDuration: 0.45,
        slamCooldown: 0,
        wasSlamCooling: false,
        stunTimer: 0,
        aiDecisionTimer: 0.35 + idx * 0.16,
        hitLoopZones: new Set(),
        hitBoostPads: new Set(),
        hitGates: new Set(),
        finished: false,
        finishOrder: 0,
        meshBundle
      };

      const f = sampleTrackFrame(cart.distance, cart.lateralX, 0);
      meshBundle.root.position.copy(f.railPos);
      applyTrackFrameOrientation(meshBundle.root, f);
      state.carts.push(cart);
    });
  }

  // ==================== PLAYER CONTROLS & 3 POWER PEDALS ====================
  function getPlayerCart() {
    return state.carts[0] || null;
  }

  let centerCalloutTimeout = null;
  function showVisualCallout(iconText, subText = '', durationMs = 750) {
    calloutIcon.textContent = iconText;
    calloutSub.textContent = subText;
    centerCallout.classList.remove('hidden');
    if (centerCalloutTimeout) clearTimeout(centerCalloutTimeout);
    centerCalloutTimeout = setTimeout(() => {
      centerCallout.classList.add('hidden');
    }, durationMs);
  }

  function ensureRacingStarted() {
    if (state.status === 'countdown') {
      state.status = 'racing';
      state.countdownTimer = 0;
    }
  }

  // Switch lane: allowed even during 3-2-1 countdown without skipping the countdown!
  function switchLane(delta) {
    flashButtonPress(delta < 0 ? btnLaneLeftEl : btnLaneRightEl);
    const p = getPlayerCart();
    if (!p || state.status === 'finished' || state.status === 'paused') return;
    const nextLane = Math.max(0, Math.min(2, p.laneIndex + delta));
    if (nextLane !== p.laneIndex) {
      p.laneIndex = nextLane;
      sfx.laneSwitch();
      updateLaneDotsUI(nextLane);
    }
  }

  function triggerHop() {
    flashButtonPress(btnHopEl);
    const p = getPlayerCart();
    if (!p || state.status === 'finished' || state.status === 'paused') return;
    if (state.status === 'countdown') {
      state.bufferedCountdownAction = 'hop';
      return;
    }
    if (p.hopY <= 0.08) {
      p.hopVy = 14.5;
      sfx.hop();
      showVisualCallout('🦘✨', '⏫', 450);
    }
  }

  // Pedal 1: Star Magnet Tornado (🌪️)
  function triggerPedalMagnet() {
    flashButtonPress(pedalMagnetBtn);
    const p = getPlayerCart();
    if (!p || state.status === 'finished' || state.status === 'paused') return;
    if (state.status === 'countdown') {
      state.bufferedCountdownAction = 'magnet';
      return;
    }
    if (p.magnetCooldown > 0) {
      triggerPedalWobble(pedalMagnetBtn);
      return;
    }
    p.magnetDuration = 4.2;
    p.magnetTimer = p.magnetDuration;
    p.magnetCooldown = 5.5;
    p.wasMagnetCooling = true;
    addFeverPoints(18);
    sfx.magnet();
    spawnStarBurst(p.meshBundle.root.position, 0x38ef7d, 10, p);
    showVisualCallout('🌪️🧲', '⭐⭐⭐', 600);
  }

  // Pedal 2: Loop-de-Loop Turbo Rocket (⚡)
  function triggerPedalTurbo() {
    flashButtonPress(pedalTurboBtn);
    const p = getPlayerCart();
    if (!p || state.status === 'finished' || state.status === 'paused') return;
    if (state.status === 'countdown') {
      state.bufferedCountdownAction = 'turbo';
      return;
    }
    if (p.turboCooldown > 0) {
      triggerPedalWobble(pedalTurboBtn);
      return;
    }
    p.turboDuration = 3.0;
    p.turboTimer = p.turboDuration;
    p.turboCooldown = 4.8;
    p.wasTurboCooling = true;
    p.loopFlipAngle = Math.PI * 2;
    p.hopVy = Math.max(p.hopVy, 12.2);
    addFeverPoints(24);
    addCameraTrauma(0.28);
    sfx.turbo();
    spawnStarBurst(p.meshBundle.root.position, 0xffd93d, 14, p);
    showVisualCallout('⚡🚀', '🚀🔄', 650);
  }

  // Pedal 3: Sideways Cart Slam Shockwave (💥)
  function triggerPedalSlam() {
    flashButtonPress(pedalSlamBtn);
    const p = getPlayerCart();
    if (!p || state.status === 'finished' || state.status === 'paused') return;
    if (state.status === 'countdown') {
      state.bufferedCountdownAction = 'slam';
      return;
    }
    if (p.slamCooldown > 0) {
      triggerPedalWobble(pedalSlamBtn);
      return;
    }
    p.slamDuration = 0.45;
    p.slamTimer = p.slamDuration;
    p.slamCooldown = 4.2;
    p.wasSlamCooling = true;
    addCameraTrauma(0.52);
    sfx.slam();
    spawnStarBurst(p.meshBundle.root.position, 0xff4b91, 14, p);

    let slammedCount = 0;
    state.carts.forEach((other) => {
      if (other.isPlayer) return;
      const distGap = Math.abs(other.distance - p.distance);
      const latGap = Math.abs(other.lateralX - p.lateralX);
      if (distGap <= SLAM_RADIUS && latGap <= 5.4) {
        const pushDir = other.lateralX > p.lateralX + 0.1
          ? 1
          : other.lateralX < p.lateralX - 0.1
          ? -1
          : (p.laneIndex === 0 ? 1 : p.laneIndex === 2 ? -1 : (slammedCount % 2 === 0 ? 1 : -1));

        other.kickLat = pushDir * 16.5;
        other.kickLon = -12.0;
        other.kickSpin = pushDir * 9.5;
        other.hopVy = Math.max(other.hopVy, 7.5);
        other.stunTimer = 1.45;
        other.bumpCooldown = 0.6;
        other.speed = Math.max(20, other.speed * 0.55);
        slammedCount++;

        spawnStarBurst(other.meshBundle.root.position, 0xffd93d, 8, other);
        spawnFlyingBonusCoins(other.meshBundle.root.position, 3);
      }
    });

    addFeverPoints(22 + slammedCount * 10);
    showVisualCallout('💥🛒', slammedCount > 0 ? '🪙🪙🪙' : '💫', 650);
  }

  function nearestLaneIndex(latX) {
    let bestIdx = 1;
    let bestDist = Infinity;
    for (let i = 0; i < LANE_OFFSETS.length; i++) {
      const d = Math.abs(latX - LANE_OFFSETS[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  // Check whether candidate lane is free of upcoming barrier gates and nearby rival carts
  function isLaneSafeForCart(cart, candLane) {
    for (let gIdx = 0; gIdx < state.gates.length; gIdx++) {
      const g = state.gates[gIdx];
      if (!g.triggered && g.laneIndex === candLane) {
        const ahead = g.distance - cart.distance;
        if (ahead > -2.0 && ahead < 25.0) return false;
      }
    }
    for (let cIdx = 0; cIdx < state.carts.length; cIdx++) {
      const other = state.carts[cIdx];
      if (other !== cart && other.laneIndex === candLane && Math.abs(other.distance - cart.distance) < 5.0) {
        return false;
      }
    }
    return true;
  }

  // ==================== SIMULATION STEP ====================
  function updateSimulation(dt) {
    if (state.contextLost || state.status === 'paused') return;
    updateParticles(dt);

    for (let i = 0; i < state.stageAnimatedProps.length; i++) {
      const prop = state.stageAnimatedProps[i];
      if (prop.type === 'spinZ') prop.mesh.rotation.z += prop.speed * dt;
      else if (prop.type === 'spinY') prop.mesh.rotation.y += prop.speed * dt;
    }

    const p = getPlayerCart();
    if (!p) return;

    // 3-2-1-GO Visual Countdown (taps during countdown are buffered and never skip the GO cue!)
    if (state.status === 'countdown') {
      if (state.assetsReady) {
        state.countdownTimer -= dt;
      }
      // Allow smooth pre-steering on the starting grid during countdown
      const targetLat = LANE_OFFSETS[p.laneIndex];
      p.lateralX += (targetLat - p.lateralX) * Math.min(1, dt * 11.5);
      const startFrame = sampleTrackFrame(p.distance, p.lateralX, 0);
      p.meshBundle.root.position.copy(startFrame.railPos);
      applyTrackFrameOrientation(p.meshBundle.root, startFrame);

      const tickNum = Math.ceil(state.countdownTimer / 0.6);
      if (tickNum !== state.lastCountdownTick && tickNum >= 1 && tickNum <= 3) {
        state.lastCountdownTick = tickNum;
        const glyphs = ['1️⃣', '2️⃣', '3️⃣'];
        showVisualCallout(glyphs[tickNum - 1], `🎢 ${currentStageCfg.emoji}`, 550);
        sfx.countdownTick(false);
      }
      if (state.countdownTimer <= 0) {
        state.status = 'racing';
        showVisualCallout('🚀✨', '🏁', 550);
        sfx.countdownTick(true);
        if (state.bufferedCountdownAction) {
          const act = state.bufferedCountdownAction;
          state.bufferedCountdownAction = null;
          p.speed += 8.0; // Perfect start boost!
          if (act === 'hop') triggerHop();
          else if (act === 'magnet') triggerPedalMagnet();
          else if (act === 'turbo') triggerPedalTurbo();
          else if (act === 'slam') triggerPedalSlam();
        }
      } else {
        updateCameraPose(dt);
        updateHUD();
        return;
      }
    }

    if (state.status !== 'racing') return;
    state.simTime += dt;

    // Check Rainbow Fever activation & full-screen border timer
    if (state.rainbowFever >= 100 && state.feverTimer <= 0) {
      state.feverTimer = 4.5;
      state.rainbowFever = 100;
      addCameraTrauma(0.25);
      sfx.feverChime();
      showVisualCallout('🌈🔥', '⭐⭐⭐', 850);
    }
    if (state.feverTimer > 0) {
      state.feverTimer = Math.max(0, state.feverTimer - dt);
      state.rainbowFever = (state.feverTimer / 4.5) * 100;
      if (rainbowFeverBorderEl) {
        rainbowFeverBorderEl.classList.remove('hidden');
      }
    } else if (rainbowFeverBorderEl) {
      rainbowFeverBorderEl.classList.add('hidden');
    }

    const stageFactor = (state.stageId - 1) / 7; // 0.0 on Stage 1 .. 1.0 on Stage 8
    const aiAvoidProb = 0.50 + stageFactor * 0.35; // 0.50 on Stage 1 up to 0.85 on Stage 8

    // 1. Update all 5 coaster carts (Slope gravity + 3D knockback impulses + hop + flip + 1.6x Fever cooldown recharge)
    for (let i = 0; i < state.carts.length; i++) {
      const cart = state.carts[i];
      const cdMult = (cart.isPlayer && state.feverTimer > 0) ? 1.6 : 1.0;

      cart.magnetTimer = Math.max(0, cart.magnetTimer - dt);
      cart.magnetCooldown = Math.max(0, cart.magnetCooldown - dt * cdMult);
      cart.turboTimer = Math.max(0, cart.turboTimer - dt);
      cart.turboCooldown = Math.max(0, cart.turboCooldown - dt * cdMult);
      cart.slamTimer = Math.max(0, cart.slamTimer - dt);
      cart.slamCooldown = Math.max(0, cart.slamCooldown - dt * cdMult);
      cart.stunTimer = Math.max(0, cart.stunTimer - dt);
      cart.bumpCooldown = Math.max(0, cart.bumpCooldown - dt);

      // Fire Pedal Ready-Pop & Ding when player cooldown finishes
      if (cart.isPlayer) {
        if (cart.wasMagnetCooling && cart.magnetCooldown <= 0) {
          cart.wasMagnetCooling = false;
          triggerPedalReadyPop(pedalMagnetBtn);
        }
        if (cart.wasTurboCooling && cart.turboCooldown <= 0) {
          cart.wasTurboCooling = false;
          triggerPedalReadyPop(pedalTurboBtn);
        }
        if (cart.wasSlamCooling && cart.slamCooldown <= 0) {
          cart.wasSlamCooling = false;
          triggerPedalReadyPop(pedalSlamBtn);
        }
      }

      // Smart Stage-Scaled AI Lane Switching, Safe-Lane Gate Avoidance & Boost-Pad Seeking
      if (!cart.isPlayer) {
        cart.aiDecisionTimer -= dt;
        if (cart.aiDecisionTimer <= 0 && Math.abs(cart.kickLat) < 1.0) {
          cart.aiDecisionTimer = Math.max(0.28, (0.54 - stageFactor * 0.16) + (i * 0.08));
          const gateAhead = state.gates.find(
            (g) => !g.triggered && g.laneIndex === cart.laneIndex && g.distance > cart.distance && g.distance - cart.distance < 23
          );
          if (gateAhead) {
            if (Math.random() < aiAvoidProb) {
              // Prefer adjacent lanes first, then any safe lane free of gates & carts
              const candidateOrder = [0, 1, 2]
                .filter((l) => l !== cart.laneIndex)
                .sort((a, b) => Math.abs(a - cart.laneIndex) - Math.abs(b - cart.laneIndex));
              const safeLane = candidateOrder.find((l) => isLaneSafeForCart(cart, l));
              if (safeLane !== undefined) {
                cart.laneIndex = safeLane;
              } else if (cart.hopY <= 0.05) {
                cart.hopVy = 13.8;
              }
            } else if (cart.hopY <= 0.05 && Math.random() < (0.30 + stageFactor * 0.35)) {
              cart.hopVy = 13.5;
            }
          } else {
            let steeredToBoost = false;
            if (state.stageId >= 3 && Math.random() < (0.25 + stageFactor * 0.45)) {
              const boostAhead = state.boostPads.find(
                (bp) => bp.distance > cart.distance + 4 && bp.distance - cart.distance < 26 && Math.abs(bp.laneIndex - cart.laneIndex) <= 1 && isLaneSafeForCart(cart, bp.laneIndex)
              );
              if (boostAhead) {
                cart.laneIndex = boostAhead.laneIndex;
                steeredToBoost = true;
              }
            }
            if (!steeredToBoost && Math.random() < 0.22) {
              const step = Math.random() < 0.5 ? -1 : 1;
              const nextLane = Math.max(0, Math.min(2, cart.laneIndex + step));
              if (nextLane !== cart.laneIndex && isLaneSafeForCart(cart, nextLane)) {
                cart.laneIndex = nextLane;
              }
            }
          }
        }
      }

      const preFrame = sampleTrackFrame(cart.distance, cart.lateralX, 0);
      const slopeAccel = -SLOPE_GRAVITY * preFrame.tangent.y;

      let targetSpeed = cart.isPlayer ? 46.5 : cart.baseAiSpeed;
      if (cart.isPlayer) {
        targetSpeed += Math.min(6, cart.coins * 0.14);
        if (cart.turboTimer > 0) targetSpeed += 21;
        if (state.feverTimer > 0) targetSpeed += 16;
      } else {
        // Smooth proportional rubber-banding scaled by Stage 1-8 (easy 3-star win on Stage 1, progressive challenge on Stages 2-8)
        const gapToPlayer = p.distance - cart.distance; // >0: player ahead; <0: rival ahead
        if (gapToPlayer > 8) {
          const catchupGain = Math.min(5.2, ((gapToPlayer - 8) / 48) * (2.4 + stageFactor * 2.8));
          targetSpeed += catchupGain;
        } else if (gapToPlayer < 0) {
          const leadDist = -gapToPlayer;
          const yieldFactor = 1.38 - stageFactor * 0.70; // 1.38x yield on Stage 1 down to 0.68x on Stage 8
          const yieldDrop = Math.min(7.5, (leadDist / 28) * 4.8 * yieldFactor);
          targetSpeed -= yieldDrop;
          if (state.stageId <= 2 && p.distance > state.trackLength * 0.60) {
            targetSpeed -= (3 - state.stageId) * 2.4;
          }
        }
        if (cart.turboTimer > 0) {
          targetSpeed += 10.5;
        }
      }

      if (cart.stunTimer > 0) {
        targetSpeed *= 0.62;
      }

      cart.speed += (targetSpeed - cart.speed) * Math.min(1, dt * 2.4) + slopeAccel * dt;
      cart.speed = THREE.MathUtils.clamp(cart.speed, 20, 95);

      cart.distance = THREE.MathUtils.clamp(
        cart.distance + (cart.speed + cart.kickLon) * dt,
        0,
        state.trackLength
      );
      cart.kickLon *= Math.exp(-5.5 * dt);

      if (Math.abs(cart.kickLat) > 0.25) {
        cart.lateralX += cart.kickLat * dt;
        cart.kickLat *= Math.exp(-5.0 * dt);
        cart.lateralX = THREE.MathUtils.clamp(cart.lateralX, LANE_OFFSETS[0] - 0.75, LANE_OFFSETS[2] + 0.75);
        if (Math.abs(cart.kickLat) < 1.2) {
          cart.laneIndex = nearestLaneIndex(cart.lateralX);
        }
      } else {
        cart.kickLat = 0;
        const targetLat = LANE_OFFSETS[cart.laneIndex];
        cart.lateralX += (targetLat - cart.lateralX) * Math.min(1, dt * 11.5);
      }

      if (Math.abs(cart.kickSpin) > 0.1 || Math.abs(cart.spinAngle) > 0.01) {
        cart.spinAngle += cart.kickSpin * dt;
        cart.kickSpin *= Math.exp(-4.5 * dt);
        if (Math.abs(cart.kickSpin) < 0.35) {
          cart.spinAngle *= Math.exp(-8.5 * dt);
        }
      } else {
        cart.spinAngle = 0;
      }

      if (cart.hopY > 0 || cart.hopVy !== 0) {
        cart.hopY += cart.hopVy * dt;
        cart.hopVy -= GRAVITY * dt;
        if (cart.hopY <= 0) {
          cart.hopY = 0;
          cart.hopVy = 0;
        }
      }

      if (cart.loopFlipAngle > 0) {
        cart.loopFlipAngle = Math.max(0, cart.loopFlipAngle - dt * 9.5);
      }
    }

    // 2. Full Pairwise Cart-to-Cart Collision & Separation (Player↔Rival and Rival↔Rival)
    for (let i = 0; i < state.carts.length; i++) {
      for (let j = i + 1; j < state.carts.length; j++) {
        const a = state.carts[i];
        const b = state.carts[j];
        const dz = b.distance - a.distance;
        const absDz = Math.abs(dz);
        const absDx = Math.abs(b.lateralX - a.lateralX);
        const absDy = Math.abs(b.hopY - a.hopY);

        if (absDz < 4.1 && absDx < 2.05 && absDy < 1.35) {
          const involvesPlayer = a.isPlayer || b.isPlayer;
          const playerPowered = p.turboTimer > 0 || p.slamTimer > 0 || state.feverTimer > 0;

          if (involvesPlayer && playerPowered) {
            const rival = a.isPlayer ? b : a;
            if (rival.bumpCooldown <= 0) {
              rival.bumpCooldown = 0.55;
              const pushDir = rival.lateralX > p.lateralX + 0.08
                ? 1
                : rival.lateralX < p.lateralX - 0.08
                ? -1
                : (p.laneIndex === 0 ? 1 : p.laneIndex === 2 ? -1 : 1);
              rival.kickLat = pushDir * 15.5;
              rival.kickLon = -9.5;
              rival.kickSpin = pushDir * 8.5;
              rival.hopVy = Math.max(rival.hopVy, 7.0);
              rival.stunTimer = 1.15;
              addCameraTrauma(0.32);
              sfx.slam();
              spawnStarBurst(rival.meshBundle.root.position, 0xffd93d, 8, rival);
              spawnFlyingBonusCoins(rival.meshBundle.root.position, 2);
            }
          } else {
            const leader = a.distance >= b.distance ? a : b;
            const trailer = leader === a ? b : a;
            const overlap = 4.1 - absDz;
            leader.distance = Math.min(state.trackLength, leader.distance + overlap * 0.35);
            trailer.distance = Math.max(0, trailer.distance - overlap * 0.65);
            trailer.speed = Math.min(trailer.speed, leader.speed - 2.5);
            trailer.kickLon = Math.min(trailer.kickLon, -6.0);

            const latDir = (b.lateralX >= a.lateralX) ? 1 : -1;
            if (a.bumpCooldown <= 0 && b.bumpCooldown <= 0) {
              a.bumpCooldown = 0.45;
              b.bumpCooldown = 0.45;
              a.kickLat = -latDir * 7.5;
              b.kickLat = latDir * 7.5;
              trailer.hopVy = Math.max(trailer.hopVy, 4.2);
              if (involvesPlayer) {
                addCameraTrauma(0.28);
                sfx.bump();
              }
            }
          }
        }
      }
    }

    // 3. Apply final 3D poses, Rainbow Fever 3D visuals, shockwave ring animation, and check finish line
    for (let i = 0; i < state.carts.length; i++) {
      const cart = state.carts[i];
      const frame = sampleTrackFrame(cart.distance, cart.lateralX, 0);
      cart.meshBundle.root.position.copy(frame.railPos);
      applyTrackFrameOrientation(cart.meshBundle.root, frame);

      cart.meshBundle.hopGroup.position.y = cart.hopY;
      const shadowScale = Math.max(0.42, 1 - cart.hopY * 0.15);
      cart.meshBundle.shadowMesh.scale.setScalar(shadowScale);
      cart.meshBundle.shadowMesh.material.opacity = Math.max(0.14, 0.52 - cart.hopY * 0.11);

      cart.meshBundle.flipPivot.rotation.x = -cart.loopFlipAngle;
      cart.meshBundle.cartBodyGroup.rotation.y = cart.spinAngle;
      cart.meshBundle.riderGroup.rotation.y = Math.sin(state.simTime * 5 + i) * 0.14;

      const playerInFever = cart.isPlayer && state.feverTimer > 0;
      cart.meshBundle.flameCone.visible = cart.turboTimer > 0 || playerInFever;
      if (playerInFever) {
        const hue = (state.simTime * 2.5) % 1;
        cart.meshBundle.flameCone.material.color.setHSL(hue, 1.0, 0.58);
        const flamePulse = 1.15 + 0.25 * Math.sin(state.simTime * 20);
        cart.meshBundle.flameCone.scale.set(flamePulse, flamePulse * 1.18, flamePulse);
        state.feverParticleAccum += dt;
        if (state.feverParticleAccum >= 0.065) {
          state.feverParticleAccum = 0;
          const rainbowHex = scratchRainbowColor.setHSL(hue, 1.0, 0.58).getHex();
          spawnStarBurst(cart.meshBundle.root.position, rainbowHex, 2, cart);
        }
      } else {
        cart.meshBundle.flameCone.material.color.setHex(0x00f5d4);
        cart.meshBundle.flameCone.scale.setScalar(1.0);
      }

      const showMagnetRing = cart.magnetTimer > 0 || playerInFever;
      cart.meshBundle.magnetRing.visible = showMagnetRing;
      if (showMagnetRing) {
        const magPulse = 1.0 + 0.11 * Math.sin(state.simTime * 11.0);
        cart.meshBundle.magnetRing.scale.set(magPulse, 1.0 + 0.2 * Math.cos(state.simTime * 13.0), magPulse);
        cart.meshBundle.magnetRing.rotation.x = Math.sin(state.simTime * 8.5) * 0.15;
        cart.meshBundle.magnetRing.rotation.y += (playerInFever ? 8.5 : 5.5) * dt;
      }

      if (cart.slamTimer > 0) {
        cart.meshBundle.slamGroup.visible = true;
        const progress = THREE.MathUtils.clamp(1 - cart.slamTimer / (cart.slamDuration || 0.45), 0, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const maxScale = SLAM_RADIUS / 3.6;
        const ringScale = 0.2 + easeOut * (maxScale - 0.2);
        cart.meshBundle.slamGroup.scale.set(ringScale, 1 - progress * 0.35, ringScale);
        cart.meshBundle.slamRingMat.opacity = 0.9 * (1 - progress);
        cart.meshBundle.slamWallMat.opacity = 0.65 * (1 - progress);
      } else {
        cart.meshBundle.slamGroup.visible = false;
      }

      if (!cart.finished && cart.distance >= state.trackLength - 6) {
        cart.finished = true;
        cart.finishOrder = state.lastRankOrder.length + 1;
        state.lastRankOrder.push(cart);
        if (cart.isPlayer) {
          completeStageRace();
          return;
        }
      }
    }

    const playerPos = p.meshBundle.root.position;
    sampleTrackFrame(p.distance, p.lateralX, 1.25 + p.hopY, sharedFrame);
    scratchPlayerBodyPos.copy(sharedFrame.pos);

    sunLight.target.position.copy(playerPos);
    sunLight.position.set(playerPos.x + 28, playerPos.y + 58, playerPos.z + 24);
    cloudSeaMesh.position.z = playerPos.z;

    updateFlyingBonusCoins(dt, scratchPlayerBodyPos);

    // Multi-Arch Coaster Loop-de-Loop Zone Trigger (Player + 4 AI Rivals barrel-flip!)
    for (let i = 0; i < state.loopZones.length; i++) {
      const lz = state.loopZones[i];
      if (!lz.triggeredByPlayer && Math.abs(p.distance - lz.distance) < 5.5) {
        lz.triggeredByPlayer = true;
        p.loopFlipAngle = Math.PI * 2;
        p.hopVy = Math.max(p.hopVy, 12.2);
        p.turboTimer = Math.max(p.turboTimer, 1.45);
        addFeverPoints(14);
        addCameraTrauma(0.26);
        sfx.turbo();
        spawnStarBurst(playerPos, 0x00f5d4, 12, p);
        showVisualCallout('🎢💫', '🎢🔄', 600);
      }
      for (let cIdx = 1; cIdx < state.carts.length; cIdx++) {
        const rival = state.carts[cIdx];
        if (!rival.hitLoopZones.has(i) && Math.abs(rival.distance - lz.distance) < 5.5) {
          rival.hitLoopZones.add(i);
          rival.loopFlipAngle = Math.PI * 2;
          rival.hopVy = Math.max(rival.hopVy, 11.8);
          rival.turboTimer = Math.max(rival.turboTimer, 1.15);
          spawnStarBurst(rival.meshBundle.root.position, 0x00f5d4, 6, rival);
        }
      }
    }

    // 4. Star Coin Magnet Pull & Physical Quadratic Bézier Fly-to-Cart Collection
    const magnetActive = p.magnetTimer > 0 || state.feverTimer > 0;
    const pullRange = magnetActive ? MAGNET_RADIUS * 1.85 : 4.6;

    for (let i = 0; i < state.coins.length; i++) {
      const c = state.coins[i];
      if (c.collected) continue;

      if (c.flying) {
        c.flyT += dt / 0.22;
        if (c.flyT >= 1) {
          c.collected = true;
          c.flying = false;
          c.mesh.visible = false;
          p.coins += 1;
          addFeverPoints(4.5);
          sfx.coin();
          triggerCoinCounterPop();
          spawnStarBurst(playerPos, 0xffd93d, 5, p);
        } else {
          const u = c.flyT;
          scratchBezierA.lerpVectors(c.flyStartPos, c.flyCtrlPos, u);
          scratchBezierB.lerpVectors(c.flyCtrlPos, scratchPlayerBodyPos, u);
          c.mesh.position.lerpVectors(scratchBezierA, scratchBezierB, u);
          c.mesh.rotation.y += 15 * dt;
          c.mesh.scale.setScalar(1.0 - 0.58 * u);
        }
        continue;
      }

      c.mesh.rotation.y += 3.2 * dt;

      const distAlong = Math.abs(c.distance - p.distance);
      if (distAlong < pullRange) {
        if (magnetActive) {
          c.mesh.position.lerp(scratchPlayerBodyPos, Math.min(1, dt * 11.5));
        }
        const worldDistToBody = c.mesh.position.distanceTo(scratchPlayerBodyPos);
        const startPickup = (magnetActive && (distAlong < MAGNET_RADIUS || worldDistToBody < 5.5))
          || (distAlong < 3.6 && worldDistToBody < 2.65);

        if (startPickup) {
          c.flying = true;
          c.flyT = 0;
          c.flyStartPos.copy(c.mesh.position);
          c.flyCtrlPos.copy(c.mesh.position).lerp(scratchPlayerBodyPos, 0.5);
          c.flyCtrlPos.y += 2.6;
        }
      }
    }

    // 5. Boost Pads (Player + 4 AI Rivals light up rocket flameCone!)
    for (let i = 0; i < state.boostPads.length; i++) {
      const pad = state.boostPads[i];
      if (Math.abs(pad.distance - p.distance) < 3.2 && pad.laneIndex === p.laneIndex) {
        if (p.turboTimer < 0.9) {
          p.turboTimer = 1.1;
          addFeverPoints(7);
          addCameraTrauma(0.2);
          sfx.turbo();
          spawnStarBurst(playerPos, 0x38ef7d, 8, p);
        }
      }
      for (let cIdx = 1; cIdx < state.carts.length; cIdx++) {
        const rival = state.carts[cIdx];
        if (!rival.hitBoostPads.has(i) && Math.abs(pad.distance - rival.distance) < 3.2 && pad.laneIndex === rival.laneIndex) {
          rival.hitBoostPads.add(i);
          rival.turboTimer = Math.max(rival.turboTimer, 0.85);
          spawnStarBurst(rival.meshBundle.root.position, 0x38ef7d, 5, rival);
        }
      }
    }

    // 6. Barrier Gates (Player + 4 AI Rivals physical reaction; AI gate hits keep gate visible for player!)
    for (let i = 0; i < state.gates.length; i++) {
      const gate = state.gates[i];
      if (gate.triggered) continue;
      if (Math.abs(gate.distance - p.distance) < 2.4 && gate.laneIndex === p.laneIndex) {
        gate.triggered = true;
        if (p.hopY > 0.85 || p.turboTimer > 0 || p.slamTimer > 0 || state.feverTimer > 0) {
          gate.mesh.visible = false;
          addFeverPoints(8);
          addCameraTrauma(0.22);
          sfx.coin();
          spawnStarBurst(gate.mesh.position, 0x38ef7d, 9, p);
          spawnFlyingBonusCoins(gate.mesh.position, 2);
        } else {
          gate.mesh.visible = false;
          p.speed = Math.max(22, p.speed * 0.65);
          p.kickLon = -8.5;
          addCameraTrauma(0.42);
          sfx.gateHit();
          spawnStarBurst(gate.mesh.position, 0xff4757, 10, p);
          showVisualCallout('💥🚧', '🦘!', 500);
        }
        continue;
      }
      for (let cIdx = 1; cIdx < state.carts.length; cIdx++) {
        const rival = state.carts[cIdx];
        if (!rival.hitGates.has(i) && Math.abs(gate.distance - rival.distance) < 2.4 && gate.laneIndex === rival.laneIndex) {
          rival.hitGates.add(i);
          if (rival.hopY < 0.85 && rival.turboTimer <= 0) {
            rival.stunTimer = 0.75;
            rival.speed = Math.max(20, rival.speed * 0.72);
            rival.kickLon = -6.5;
            rival.kickSpin = (cIdx % 2 === 0 ? 1 : -1) * 6.5;
            spawnStarBurst(gate.mesh.position, 0xff4757, 6, rival);
          }
        }
      }
    }

    updateCameraPose(dt);
    updateHUD();
  }

  // ==================== CAMERA CHASE, TRAUMA SHAKE, FOV KICK & UPRIGHT BILLBOARD ====================
  const scratchParentQuatInv = new THREE.Quaternion();

  function updateCameraPose(dt) {
    const p = getPlayerCart();
    if (!p) return;

    const camModes = [
      { back: 12.2, up: 5.2, lookAhead: 16 },
      { back: 7.2, up: 3.4, lookAhead: 22 },
      { back: 18.8, up: 9.0, lookAhead: 14 }
    ];
    const cfgCam = camModes[state.cameraMode % camModes.length];

    const behindDist = Math.max(0, p.distance - cfgCam.back);
    sampleTrackFrame(behindDist, p.lateralX * 0.65, cfgCam.up + p.hopY * 0.35, camBehindFrame);
    sampleTrackFrame(Math.min(state.trackLength, p.distance + cfgCam.lookAhead), p.lateralX * 0.35, 1.4, camLookFrame);

    const lerpAlpha = 1 - Math.exp(-10.0 * dt);
    if (!state.camBaseInitialized) {
      state.camBasePos.copy(camBehindFrame.pos);
      state.camBaseInitialized = true;
    } else {
      state.camBasePos.lerp(camBehindFrame.pos, lerpAlpha);
    }

    camera.position.copy(state.camBasePos);

    if (state.trauma > 0) {
      state.trauma = Math.max(0, state.trauma - 2.4 * dt);
      const shake = state.trauma * state.trauma;
      const t = state.simTime || performance.now() * 0.001;
      const n1 = Math.sin(t * 28.0) * 0.55 + Math.cos(t * 41.0) * 0.45;
      const n2 = Math.cos(t * 33.0) * 0.55 + Math.sin(t * 47.0) * 0.45;
      camera.position
        .addScaledVector(camBehindFrame.right, 0.12 * shake * n1)
        .addScaledVector(camBehindFrame.up, 0.10 * shake * n2);
    }

    camera.lookAt(camLookFrame.pos);

    const targetFov = (p.turboTimer > 0 || state.feverTimer > 0) ? 70 : 62;
    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 8.0);
      camera.updateProjectionMatrix();
    }

    skyDomeMesh.position.copy(camera.position);

    for (let i = 0; i < state.carts.length; i++) {
      const cart = state.carts[i];
      const bGroup = cart.meshBundle.billboardGroup;
      if (!bGroup) continue;

      scratchParentQuatInv.copy(cart.meshBundle.root.quaternion).invert();
      bGroup.quaternion.copy(scratchParentQuatInv).multiply(camera.quaternion);

      const camDist = cart.meshBundle.root.position.distanceTo(camera.position);
      const scale = cart.isPlayer
        ? 0.95
        : THREE.MathUtils.clamp(camDist / 16.5, 1.05, 2.85);
      bGroup.scale.setScalar(scale);
      bGroup.position.y = BILLBOARD_BASE_Y + BILLBOARD_RIM_RADIUS * (scale - 1);
    }
  }

  // ==================== TOP-3 PODIUM QUALIFICATION & FINISH ====================
  function getSortedStandings() {
    return [...state.carts].sort((a, b) => {
      if (a.finished && b.finished) {
        return (a.finishOrder || 99) - (b.finishOrder || 99);
      }
      if (a.finished !== b.finished) {
        return a.finished ? -1 : 1;
      }
      return b.distance - a.distance;
    });
  }

  function completeStageRace(forcedRank = null) {
    state.status = 'finished';
    if (rainbowFeverBorderEl) rainbowFeverBorderEl.classList.add('hidden');
    const sorted = getSortedStandings();

    if (typeof forcedRank === 'number' && forcedRank >= 1 && forcedRank <= 5) {
      const playerIdx = sorted.findIndex((c) => c.isPlayer);
      if (playerIdx !== -1) {
        const [playerCart] = sorted.splice(playerIdx, 1);
        sorted.splice(forcedRank - 1, 0, playerCart);
      }
    }

    // Lock final finishOrder on all 5 carts so getSortedStandings() and HUD match Podium Modal 100%
    sorted.forEach((c, idx) => {
      c.finished = true;
      c.finishOrder = idx + 1;
    });

    const playerRank = sorted.findIndex((c) => c.isPlayer) + 1;
    // Strict Top-3 Qualification Rule: 1st=3⭐, 2nd=2⭐, 3rd=1⭐, 4th/5th=0⭐ (Defeat)
    const earnedStars = playerRank === 1 ? 3 : playerRank === 2 ? 2 : playerRank === 3 ? 1 : 0;
    const qualified = playerRank <= 3;

    if (earnedStars > (state.stageStars[state.stageId] || 0)) {
      state.stageStars[state.stageId] = earnedStars;
    }
    if (qualified && state.stageId >= state.unlockedStage && state.unlockedStage < STAGES.length) {
      state.unlockedStage = Math.min(STAGES.length, state.stageId + 1);
    }

    saveProgress({
      selectedCritter: state.selectedCritterId,
      unlockedStage: state.unlockedStage,
      stageStars: state.stageStars
    });

    updateHUD();
    renderTopStageRail();
    renderPodiumModal(sorted, playerRank, earnedStars, qualified);
    sfx.fanfare(qualified);
  }

  const podiumCardEl = document.getElementById('podium-card');
  const qualChipEls = Array.from(document.querySelectorAll('#qualification-rule-strip .qual-chip'));

  function renderPodiumModal(sortedCarts, playerRank, earnedStars, qualified) {
    const rankMedals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    podiumResultCrown.textContent = qualified ? '🏆' : '😢💔';
    // Icon-only big medal on the uniquely bound #podium-rank-chip (no "#n" text)
    podiumRankChip.textContent = rankMedals[playerRank - 1] || '4️⃣';

    if (podiumCardEl) {
      podiumCardEl.classList.toggle('podium-victory', qualified);
      podiumCardEl.classList.toggle('podium-defeat', !qualified);
    }

    const activeQualIdx = playerRank <= 3 ? (playerRank - 1) : 3;
    qualChipEls.forEach((chipEl, idx) => {
      chipEl.classList.toggle('active-qual', idx === activeQualIdx);
    });

    podiumStars.forEach((starEl, idx) => {
      starEl.classList.toggle('earned', idx < earnedStars);
    });

    podiumStageGrid.innerHTML = '';
    sortedCarts.forEach((cart, idx) => {
      const rank = idx + 1;
      const col = document.createElement('div');
      const playerStateClass = cart.isPlayer ? (qualified ? 'is-player player-qualified' : 'is-player player-defeated') : '';
      col.className = `podium-column ${playerStateClass}`.trim();
      const statusBadge = cart.isPlayer
        ? `<span class="podium-status-badge">${rank === 1 ? '👑' : (qualified ? '🎉' : '😢')}</span>`
        : '';
      col.innerHTML = `
        <div class="podium-avatar-wrap">
          <img src="${cart.critter.icon}" alt="" onerror="this.style.display='none'" />
          ${statusBadge}
        </div>
        <div class="podium-pillar pillar-${rank}">
          <span>${rankMedals[idx]}</span>
          <span>${cart.critter.emoji}</span>
        </div>
      `;
      podiumStageGrid.appendChild(col);
    });

    btnNextStage.disabled = !qualified;
    btnNextStage.classList.toggle('hidden', !qualified);
    btnRetryStage.classList.toggle('retry-pulse', !qualified);

    podiumOverlay.classList.remove('hidden');
  }

  // ==================== HUD & UI RENDERING (100% ICON-ONLY GAUGES & CACHED DOM NODES) ====================
  function computeTotalStars() {
    return Object.values(state.stageStars).reduce((acc, v) => acc + (Number(v) || 0), 0);
  }

  function renderTopStageRail() {
    totalStarsCount.textContent = String(computeTotalStars());
    stageRail.innerHTML = '';

    STAGES.forEach((st) => {
      const unlocked = st.id <= state.unlockedStage;
      const stars = state.stageStars[st.id] || 0;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `stage-pill-btn ${st.id === state.stageId ? 'active' : ''} ${unlocked ? '' : 'locked'}`;
      const starStr = unlocked ? ('⭐'.repeat(stars) || '☆') : '🔒';
      btn.innerHTML = `<span>${st.id}${st.emoji}</span><span class="stage-stars-mini">${starStr}</span>`;
      btn.addEventListener('click', () => {
        if (!unlocked) return;
        podiumOverlay.classList.add('hidden');
        critterDrawer.classList.add('hidden');
        buildStageWorld(st.id);
      });
      stageRail.appendChild(btn);
    });
  }

  function closeCritterDrawerAndResume() {
    critterDrawer.classList.add('hidden');
    if (state.status === 'paused') {
      state.status = state.statusBeforePause || 'racing';
    }
  }

  function renderCritterDrawer() {
    const active = CRITTERS.find((c) => c.id === state.selectedCritterId) || CRITTERS[0];
    activeCritterImg.style.display = '';
    activeCritterImg.src = active.icon;
    activeCritterEmoji.textContent = active.emoji;

    critterDrawer.innerHTML = '';
    CRITTERS.forEach((c) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `critter-option-btn ${c.id === state.selectedCritterId ? 'selected' : ''}`;
      btn.innerHTML = `<img src="${c.icon}" alt="" onerror="this.style.display='none'" /><span>${c.emoji}</span>`;
      btn.addEventListener('click', () => {
        selectCritter(c.id);
        closeCritterDrawerAndResume();
      });
      critterDrawer.appendChild(btn);
    });
  }

  function selectCritter(critterId) {
    const found = CRITTERS.find((c) => c.id === critterId);
    if (!found) return false;
    if (found.id === state.selectedCritterId) {
      closeCritterDrawerAndResume();
      return true;
    }
    state.selectedCritterId = found.id;
    saveProgress({
      selectedCritter: state.selectedCritterId,
      unlockedStage: state.unlockedStage,
      stageStars: state.stageStars
    });
    renderCritterDrawer();
    podiumOverlay.classList.add('hidden');
    buildStageWorld(state.stageId);
    return true;
  }

  function renderTrackDotsUI() {
    trackMarkersLayer.innerHTML = '';
    cachedTrackDotEls = [];
    state.carts.forEach((cart, idx) => {
      const dot = document.createElement('div');
      dot.className = `track-cart-dot ${cart.isPlayer ? 'is-player' : ''}`;
      dot.style.backgroundImage = `url('${cart.critter.icon}')`;
      dot.dataset.cartIdx = String(idx);
      trackMarkersLayer.appendChild(dot);
      cachedTrackDotEls.push(dot);
    });
  }

  function initStandingsStripDOM() {
    liveStandingsStrip.innerHTML = '';
    cachedStandingChipEls = [];
    const rankMedals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    for (let i = 0; i < 5; i++) {
      const chip = document.createElement('div');
      chip.className = 'standing-mini-chip';
      const medalSpan = document.createElement('span');
      medalSpan.textContent = rankMedals[i];
      const img = document.createElement('img');
      img.alt = '';
      img.onerror = function () { this.style.display = 'none'; };
      const fallbackEmoji = document.createElement('span');
      chip.appendChild(medalSpan);
      chip.appendChild(img);
      chip.appendChild(fallbackEmoji);
      liveStandingsStrip.appendChild(chip);
      cachedStandingChipEls.push({ chip, medalSpan, img, fallbackEmoji, lastCritterId: '' });
    }
  }

  function updateLaneDotsUI(activeLaneIndex, blockedLanesMask = [false, false, false]) {
    laneDots.forEach((dot, idx) => {
      const isActive = idx === activeLaneIndex;
      const isBlocked = Boolean(blockedLanesMask[idx]);
      dot.classList.toggle('active', isActive);
      dot.classList.toggle('lane-blocked', isBlocked);
      dot.textContent = isActive ? '🛒' : (isBlocked ? '🚧' : '🛤️');
    });
  }

  function updatePedalButtonState(btnEl, fillEl, activeTimer, activeDuration, cooldownTimer, maxCooldown) {
    if (!btnEl || !fillEl) return;
    if (activeTimer > 0) {
      btnEl.classList.add('pedal-active');
      btnEl.classList.remove('pedal-cooling');
      const activePct = Math.min(100, Math.max(0, (activeTimer / Math.max(0.1, activeDuration)) * 100));
      fillEl.style.height = `${activePct.toFixed(1)}%`;
    } else if (cooldownTimer > 0) {
      btnEl.classList.remove('pedal-active');
      btnEl.classList.add('pedal-cooling');
      const coolPct = Math.min(100, Math.max(0, (cooldownTimer / maxCooldown) * 100));
      fillEl.style.height = `${coolPct.toFixed(1)}%`;
    } else {
      btnEl.classList.remove('pedal-active', 'pedal-cooling');
      fillEl.style.height = '0%';
    }
  }

  function updateHUD() {
    const p = getPlayerCart();
    if (!p) return;

    const sorted = getSortedStandings();
    const playerRank = sorted.findIndex((c) => c.isPlayer) + 1;
    const rankMedals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    rankMedalEl.textContent = rankMedals[playerRank - 1] || '🎢';

    const pct = Math.max(0, Math.min(100, (p.distance / state.trackLength) * 100));
    trackFillBar.style.width = `${pct.toFixed(1)}%`;

    for (let idx = 0; idx < state.carts.length; idx++) {
      const dot = cachedTrackDotEls[idx];
      if (dot) {
        const cp = Math.max(2, Math.min(98, (state.carts[idx].distance / state.trackLength) * 100));
        dot.style.left = `${cp.toFixed(1)}%`;
      }
    }

    coinCounterEl.textContent = String(p.coins);

    // 5-Segment Visual Speed Bar driven by (p.speed - 20) / 60
    const speedNorm = THREE.MathUtils.clamp((p.speed - 20) / 60, 0, 1);
    const litCount = Math.max(1, Math.min(5, Math.ceil(speedNorm * 5)));
    const isTurboHot = p.turboTimer > 0 || state.feverTimer > 0;
    for (let sIdx = 0; sIdx < speedSegEls.length; sIdx++) {
      const seg = speedSegEls[sIdx];
      const active = sIdx < litCount;
      seg.classList.toggle('active', active);
      seg.classList.toggle('turbo-hot', active && isTurboHot);
    }

    const inFever = state.feverTimer > 0;
    feverBarFill.style.width = `${Math.round(state.rainbowFever)}%`;
    if (feverBarOuterEl) {
      feverBarOuterEl.classList.toggle('fever-almost-ready', !inFever && state.rainbowFever >= 80);
      feverBarOuterEl.classList.toggle('fever-active', inFever);
    }
    if (feverIconEl) {
      feverIconEl.classList.toggle('fever-active', inFever);
    }

    // Check upcoming gates within 28 u for Hop Urgent Pulse & 3-Rail Mini-Map Blocked Tint
    const blockedLanes = [false, false, false];
    for (let i = 0; i < state.gates.length; i++) {
      const g = state.gates[i];
      if (!g.triggered) {
        const ahead = g.distance - p.distance;
        if (ahead > 0 && ahead <= 28) {
          blockedLanes[g.laneIndex] = true;
        }
      }
    }
    const hopUrgent = blockedLanes[p.laneIndex] && p.hopY <= 0.2;
    if (btnHopEl) btnHopEl.classList.toggle('hop-urgent', hopUrgent);
    if (hopAlertBadgeEl) hopAlertBadgeEl.classList.toggle('hidden', !hopUrgent);

    updateLaneDotsUI(p.laneIndex, blockedLanes);

    // 3-State Power Pedal Visuals (Active vs Cooling vs Ready)
    updatePedalButtonState(pedalMagnetBtn, magnetCooldownFillEl, p.magnetTimer, p.magnetDuration, p.magnetCooldown, 5.5);
    updatePedalButtonState(pedalTurboBtn, turboCooldownFillEl, p.turboTimer, p.turboDuration, p.turboCooldown, 4.8);
    updatePedalButtonState(pedalSlamBtn, slamCooldownFillEl, p.slamTimer, p.slamDuration, p.slamCooldown, 4.2);

    for (let idx = 0; idx < sorted.length && idx < cachedStandingChipEls.length; idx++) {
      const c = sorted[idx];
      const slot = cachedStandingChipEls[idx];
      slot.chip.classList.toggle('is-player', c.isPlayer);
      if (slot.lastCritterId !== c.critter.id) {
        slot.lastCritterId = c.critter.id;
        slot.img.style.display = '';
        slot.img.src = c.critter.icon;
        slot.fallbackEmoji.textContent = c.critter.faceEmoji;
      }
    }
  }

  // ==================== INPUT BINDINGS (KEYBOARD + TOUCH + MOUSE) ====================
  function bindButton(id, handler) {
    const el = document.getElementById(id);
    if (!el) return;
    const trigger = (e) => {
      e.preventDefault();
      el.classList.add('pressed');
      handler();
      setTimeout(() => el.classList.remove('pressed'), 120);
    };
    el.addEventListener('pointerdown', trigger);
  }

  bindButton('btn-lane-left', () => switchLane(-1));
  bindButton('btn-lane-right', () => switchLane(1));
  bindButton('btn-hop', () => triggerHop());
  bindButton('pedal-magnet', () => triggerPedalMagnet());
  bindButton('pedal-turbo', () => triggerPedalTurbo());
  bindButton('pedal-slam', () => triggerPedalSlam());

  critterPickerToggle.addEventListener('click', () => {
    const willOpen = critterDrawer.classList.contains('hidden');
    if (willOpen) {
      critterDrawer.classList.remove('hidden');
      if (state.status === 'racing' || state.status === 'countdown') {
        state.statusBeforePause = state.status;
        state.status = 'paused';
      }
    } else {
      closeCritterDrawerAndResume();
    }
  });

  cameraBtn.addEventListener('click', () => {
    state.cameraMode = (state.cameraMode + 1) % 3;
    updateCameraPose(0.1);
  });

  soundBtn.addEventListener('click', () => {
    sfx.enabled = !sfx.enabled;
    soundBtn.textContent = sfx.enabled ? '🔊' : '🔇';
  });

  btnRetryStage.addEventListener('click', () => {
    podiumOverlay.classList.add('hidden');
    buildStageWorld(state.stageId);
  });

  btnNextStage.addEventListener('click', () => {
    if (btnNextStage.disabled || btnNextStage.classList.contains('hidden')) return;
    podiumOverlay.classList.add('hidden');
    const nextId = state.stageId < STAGES.length ? state.stageId + 1 : 1;
    buildStageWorld(nextId);
  });

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'Escape' && !critterDrawer.classList.contains('hidden')) {
      closeCritterDrawerAndResume();
      return;
    }
    if (state.status === 'finished' && !podiumOverlay.classList.contains('hidden')) {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (!btnNextStage.disabled && !btnNextStage.classList.contains('hidden')) {
          btnNextStage.click();
        } else {
          btnRetryStage.click();
        }
      }
      return;
    }
    if (state.status === 'paused' && !critterDrawer.classList.contains('hidden')) {
      closeCritterDrawerAndResume();
    }
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        switchLane(-1);
        break;
      case 'ArrowRight':
      case 'KeyD':
        switchLane(1);
        break;
      case 'ArrowUp':
      case 'KeyW':
        triggerHop();
        break;
      case 'Digit1':
      case 'Numpad1':
        triggerPedalMagnet();
        break;
      case 'Digit2':
      case 'Numpad2':
      case 'Space':
        e.preventDefault();
        triggerPedalTurbo();
        break;
      case 'Digit3':
      case 'Numpad3':
      case 'Enter':
        triggerPedalSlam();
        break;
    }
  });

  let pointerStart = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (!critterDrawer.classList.contains('hidden')) {
      closeCritterDrawerAndResume();
    }
    pointerStart = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!pointerStart) return;
    const dx = e.clientX - pointerStart.x;
    const dy = e.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) {
      switchLane(dx < 0 ? -1 : 1);
    } else if (dy < -28) {
      triggerHop();
    }
  });

  window.addEventListener('resize', () => {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      lastFrameTime = performance.now();
    }
  });

  // ==================== MAIN ANIMATION LOOP ====================
  let lastFrameTime = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    if (state.contextLost) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
    lastFrameTime = now;
    updateSimulation(dt);
    renderer.render(scene, camera);
  }

  // Initialize Game
  renderCritterDrawer();
  buildStageWorld(1);
  updateCameraPose(0.016);
  updateHUD();
  requestAnimationFrame(animate);

  // Expose QA & Automation API for headless verification
  window.CoasterGame = {
    state,
    CRITTERS,
    STAGES,
    renderer,
    scene,
    camera,
    sampleTrackFrame,
    addCameraTrauma,
    switchLane,
    triggerHop,
    triggerPedalMagnet,
    triggerPedalTurbo,
    triggerPedalSlam,
    selectCritter,
    selectStage: (stageId) => {
      state.unlockedStage = Math.max(state.unlockedStage, stageId);
      podiumOverlay.classList.add('hidden');
      critterDrawer.classList.add('hidden');
      buildStageWorld(stageId);
    },
    forceFinish: (rank) => completeStageRace(rank),
    stepSim: (seconds = 1.0, stepDt = 1 / 60) => {
      state.assetsReady = true;
      if (state.status === 'paused') state.status = 'racing';
      ensureRacingStarted();
      const steps = Math.max(1, Math.round(seconds / stepDt));
      for (let i = 0; i < steps && state.status !== 'finished'; i++) {
        updateSimulation(stepDt);
      }
      renderer.render(scene, camera);
      return {
        status: state.status,
        distance: getPlayerCart() ? getPlayerCart().distance : 0,
        coins: getPlayerCart() ? getPlayerCart().coins : 0
      };
    }
  };
})();
