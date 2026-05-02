/**
 * ProctorGazeDetector.js — Performance-Optimized Production Build
 *
 * VALUES: face.rotation.angle.yaw/pitch/roll are in RADIANS (confirmed from source)
 *         0.52 rad ≈ 30°, 0.79 rad ≈ 45°
 *
 * MODELS NEEDED (minimal set for rotation tracking):
 *   blazeface (526KB) — face detection (bounding box)
 *   facemesh  (1.4MB) — 468-point mesh → required for rotation calculation
 *   That's it. Everything else is disabled.
 *
 * PERFORMANCE:
 *   Detection runs at ~8 FPS (every 120ms) instead of 60fps.
 *   Total model footprint: ~2MB vs 15MB+ with all models.
 */

import Human from '@vladmandic/human';

// ─── Tuning Constants (RADIANS) ──────────────────────────────────────────────
const CHEAT_YAW = 0.25;   // ~31° left/right turn → cheating
const CHEAT_PITCH = 0.35;   // ~26° up/down nod → cheating
const SUSTAIN_MS = 300;    // faster confirmation
const NOFACE_MS = 800;    // faster face-absent check
const ALPHA = 0.45;   // more responsive smoothing
const CAL_MS = 3000;   // shorter calibration
const DETECT_INTERVAL = 100; // ms between detection runs (~10 FPS)
// ─────────────────────────────────────────────────────────────────────────────

export default class ProctorGazeDetector {
  constructor(videoElement) {
    this.video = videoElement;
    this.human = null;
    this.running = false;
    this.loopTimer = null;

    // Calibration
    this.calSamples = [];
    this.center = null;
    this.calStart = null;
    this.calibrated = false;

    // Smoothed values (start at null to initialize from first frame)
    this.smooth = null;

    // Timing
    this.violationSince = null;
    this.noFaceSince = null;
    this.locked = false;  // hysteresis: once cheating confirmed, stays locked

    // Output
    this.state = {
      status: 'INITIALIZING',
      reason: 'Loading models...',
      confidence: 1.0,
      timestamp: Date.now(),
    };
  }

  async init() {
    const config = {
      backend: 'webgl',
      modelBasePath: 'https://vladmandic.github.io/human-models/models/',
      filter: { enabled: false },  // disable image filters for speed
      face: {
        enabled: true,
        detector: {
          rotation: true,
          maxDetected: 3,
          minConfidence: 0.5,
        },
        mesh: { enabled: true },      // REQUIRED for rotation angles
        iris: { enabled: false },
        description: { enabled: false },
        emotion: { enabled: false },
        antispoof: { enabled: false },
        liveness: { enabled: false },
      },
      body: { enabled: false },
      hand: { enabled: false },
      object: { enabled: false },      // disabled for speed — phone detection removed
      gesture: { enabled: false },
      segmentation: { enabled: false },
    };

    this.human = new Human(config);
    await this.human.load();
    await this.human.warmup();
    console.log('[ProctorGaze] Models loaded (blazeface + facemesh only)');
    this._set('GENUINE_EXAM', 'Shield ready', 1.0);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.calStart = null;
    this.calibrated = false;
    this.calSamples = [];
    this.smooth = null;
    this._scheduleNext();
  }

  stop() {
    this.running = false;
    if (this.loopTimer) clearTimeout(this.loopTimer);
  }

  getStatus() {
    return { ...this.state };
  }

  // ─── Throttled Detection Loop (~8 FPS) ──────────────────────────────────

  _scheduleNext() {
    if (!this.running) return;
    this.loopTimer = setTimeout(() => this._tick(), DETECT_INTERVAL);
  }

  async _tick() {
    if (!this.running) return;
    try {
      const result = await this.human.detect(this.video);
      this._analyze(result);
    } catch (e) {
      // swallow — don't crash the loop
    }
    this._scheduleNext();
  }

  // ─── Core Analysis ─────────────────────────────────────────────────────

  _analyze(result) {
    const now = Date.now();
    const faces = result.face || [];

    // ── Face Count ────────────────────────────────────────────────────────
    const real = faces.filter(f => (f.faceScore ?? f.score ?? 0) > 0.5);

    if (real.length > 1) {
      return this._set('CHEATING_DETECTED', `Multiple people (${real.length})`, 0.97);
    }

    // ── No Face ──────────────────────────────────────────────────────────
    if (real.length === 0) {
      if (!this.noFaceSince) this.noFaceSince = now;
      if (now - this.noFaceSince > NOFACE_MS) {
        this.violationSince = null;
        return this._set('CHEATING_DETECTED', 'BREACH: Look back at the screen!', 0.90);
      }
      return this._set('POSSIBLE_CHEATING', 'Face not visible', 0.6);
    }
    this.noFaceSince = null;

    // ── Get Rotation ─────────────────────────────────────────────────────
    const face = real[0];
    const angle = face.rotation?.angle;
    if (!angle) {
      // No rotation data yet (mesh still loading) — don't flag
      return this._set('GENUINE_EXAM', 'Shield Active', 1.0);
    }

    const rawYaw = angle.yaw ?? 0;
    const rawPitch = angle.pitch ?? 0;

    // Initialize smooth from first frame (avoids bias toward 0)
    if (!this.smooth) {
      this.smooth = { yaw: rawYaw, pitch: rawPitch };
    }

    // EMA smoothing
    this.smooth.yaw = ALPHA * rawYaw + (1 - ALPHA) * this.smooth.yaw;
    this.smooth.pitch = ALPHA * rawPitch + (1 - ALPHA) * this.smooth.pitch;

    // ── Calibration ──────────────────────────────────────────────────────
    if (!this.calibrated) {
      if (!this.calStart) this.calStart = now;
      const elapsed = now - this.calStart;
      const pct = Math.min(Math.round((elapsed / CAL_MS) * 100), 99);

      this.calSamples.push({ yaw: this.smooth.yaw, pitch: this.smooth.pitch });

      if (elapsed < CAL_MS) {
        return this._set('GENUINE_EXAM', `Calibrating... ${pct}%`, 1.0);
      }

      // Median center
      const yaws = this.calSamples.map(s => s.yaw).sort((a, b) => a - b);
      const pitches = this.calSamples.map(s => s.pitch).sort((a, b) => a - b);
      const mid = Math.floor(yaws.length / 2);
      this.center = { yaw: yaws[mid], pitch: pitches[mid] };
      this.calibrated = true;
      this.calSamples = [];

      const dY = (this.center.yaw * 180 / Math.PI).toFixed(1);
      const dP = (this.center.pitch * 180 / Math.PI).toFixed(1);
      console.log(`[ProctorGaze] Calibrated center: yaw=${dY}° pitch=${dP}°`);
      return this._set('GENUINE_EXAM', 'Shield Active', 1.0);
    }

    // ── Head Turn Detection (with hysteresis) ────────────────────────────
    const dYaw = Math.abs(this.smooth.yaw - this.center.yaw);
    const dPitch = Math.abs(this.smooth.pitch - this.center.pitch);

    const overThreshold = dYaw > CHEAT_YAW || dPitch > CHEAT_PITCH;
    // To unlock, values must drop to 65% of threshold (clear return to center)
    const backToSafe = dYaw < CHEAT_YAW * 0.65 && dPitch < CHEAT_PITCH * 0.65;

    if (this.locked) {
      // Currently in violation — STAY locked until user clearly returns
      if (backToSafe) {
        this.locked = false;
        this.violationSince = null;
        // fall through to "All Clear" below
      } else {
        // Still looking away — keep showing warning
        const dir = this._dir(
          this.smooth.yaw - this.center.yaw,
          this.smooth.pitch - this.center.pitch
        );
        return this._set('CHEATING_DETECTED', `Looking ${dir} — face the screen!`, 0.95);
      }
    } else if (overThreshold) {
      // Not yet locked — start / continue the sustain timer
      if (!this.violationSince) this.violationSince = now;
      if (now - this.violationSince >= SUSTAIN_MS) {
        this.locked = true;  // LOCK IT — won't clear until backToSafe
        const dir = this._dir(
          this.smooth.yaw - this.center.yaw,
          this.smooth.pitch - this.center.pitch
        );
        return this._set('CHEATING_DETECTED', `Looking ${dir} — face the screen!`, 0.95);
      }
      return this._set('POSSIBLE_CHEATING', 'Head movement detected', 0.65);
    }

    // ── All Clear ────────────────────────────────────────────────────────
    this.violationSince = null;
    // Very slow drift correction
    this.center.yaw = this.center.yaw * 0.998 + this.smooth.yaw * 0.002;
    this.center.pitch = this.center.pitch * 0.998 + this.smooth.pitch * 0.002;
    return this._set('GENUINE_EXAM', 'Shield Active', 1.0);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────

  _dir(yaw, pitch) {
    const l = yaw < -0.15, r = yaw > 0.15;
    const u = pitch > 0.15, d = pitch < -0.15;
    if (l && u) return 'upper-left';
    if (r && u) return 'upper-right';
    if (l && d) return 'lower-left';
    if (r && d) return 'lower-right';
    if (l) return 'left';
    if (r) return 'right';
    if (u) return 'up';
    if (d) return 'down';
    return 'away';
  }

  _set(status, reason, confidence) {
    this.state = { status, reason, confidence, timestamp: Date.now() };
    return this.state;
  }
}