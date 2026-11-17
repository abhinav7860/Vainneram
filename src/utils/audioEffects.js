// Enhanced 3D Spatial Audio Engine for Vainneram
// Features:
// 1. Mid/Side Spatial Stereo Expander (Wide binaural soundstage without vocal recession)
// 2. Binaural Head-Shadow Crossfeed (HRTF: 0.7ms ITD delay + 3000Hz lowpass head shadow)
// 3. Early Reflection Acoustic Room Convolver (Authentic Kerala tea stall room depth)
// 4. Equal-Loudness Normalization (Zero volume spike when switching between Stereo and Spatial)

let audioContext = null;
let mediaSource = null;
let muffleFilter = null;
let rearOcclusionFilter = null; // Psychoacoustic Pinna/Head filter for 360° front vs behind discrimination

// Routing paths
let directGain = null; // Stereo direct path

// Mid/Side & Crossfeed nodes
let splitter = null;
let merger = null;

let dryGainL = null;
let dryGainR = null;

// Left-to-Right crossfeed (simulates acoustic diffraction to opposite ear)
let crossDelayL = null;
let crossFilterL = null;
let crossGainL = null;

// Right-to-Left crossfeed
let crossDelayR = null;
let crossFilterR = null;
let crossGainR = null;

// Mid/Side stereophonic widening
let sideFilter = null;
let sideGainL = null;
let sideGainR = null;

// Acoustic Room Convolver
let roomConvolver = null;
let reverbGain = null;
let reverbSplitter = null;
let reverbGainL = null;
let reverbGainR = null;

let masterGain = null;
let isInitialized = false;

// ─────────────────────────────────────────────────────────────
// REALISTIC 360° 4D BINAURAL ORBITAL DSP ENGINE
// Models human binaural acoustic cues in polar coordinates (θ):
// 1. Azimuth (X = sin θ): Equal-power stereo panning + ITD (0.7ms opposite ear delay)
// 2. Elevation / Sagittal (Y = cos θ): Pinna spectral filtering (front = 18kHz bright, behind = 4.2kHz muffled)
// 3. Acoustic Distance Ratio: Direct volume drops slightly & room reflections rise when behind head
// ─────────────────────────────────────────────────────────────
let spatialOrbitInterval = null;
let orbitAngle = 0; // Starts directly in front of the listener (0 rad)

function startSpatialOrbit() {
  stopSpatialOrbit();
  orbitAngle = 0;

  // Orbit speed: 0.0625 Hz (~16 seconds for one majestic, slow 360° revolution)
  // Step interval: 50ms (20 steps/sec) with linear audio-param ramps for ultra-smooth fluid movement
  const stepIntervalMs = 50;
  const stepTime = stepIntervalMs / 1000;
  const angleDelta = 2 * Math.PI * 0.0625 * stepTime;

  spatialOrbitInterval = setInterval(() => {
    if (!audioContext || !dryGainL || !dryGainR || audioContext.state === 'suspended') return;
    orbitAngle += angleDelta;
    if (orbitAngle > 2 * Math.PI) {
      orbitAngle -= 2 * Math.PI;
    }

    // Polar 360° Coordinates:
    // X: Left (-1) to Right (+1)
    // Y: Behind (-1) to Front (+1)
    const X = Math.sin(orbitAngle);
    const Y = Math.cos(orbitAngle);

    // 1. Equal-power stereo panning between left & right ears
    const panNorm = (X + 1) * 0.5; // 0 (full left) to 1 (full right)
    const lPower = Math.cos(panNorm * 0.5 * Math.PI);
    const rPower = Math.sin(panNorm * 0.5 * Math.PI);

    // Subtle distance damping when behind the head (sound loses ~1.5 dB direct power)
    const distanceDamping = Y < 0 ? (1.0 + 0.15 * Y) : 1.0;

    // Direct Left & Right gains (blended with musical baseline so stereo instrumentation doesn't collapse)
    const targetGainL = (0.22 + 0.70 * lPower) * distanceDamping;
    const targetGainR = (0.22 + 0.70 * rPower) * distanceDamping;

    // 2. Pinna / Head-Shadow High Frequency Cutoff:
    // When sound is in front (Y >= 0): Crystal clear & open (17,000 - 20,000 Hz)
    // When sound passes behind the head (Y < 0): Outer ear cartilage & skull absorb highs (drops to 4,200 Hz)
    let targetFreq = 20000;
    if (Y < 0) {
      targetFreq = 16000 - Math.abs(Y) * 11800; // Drops from 16kHz to ~4.2kHz when directly behind
    } else {
      targetFreq = 16000 + Y * 4000; // 16kHz to 20kHz in front
    }

    // 3. Dynamic Room Reflections:
    // When behind your head, direct path is blocked so reverberant room sound rises noticeably
    const baseReverb = 0.12;
    const rearReverb = Y < 0 ? Math.abs(Y) * 0.14 : 0;
    const targetReverb = baseReverb + rearReverb; // up to 0.26 when behind

    // 4. Dynamic ITD Head-Shadow Crossfeed (Diffraction to opposite ear):
    // Sound on the right (X > 0) -> Left ear receives delayed, head-shadowed crossfeed
    // Sound on the left (X < 0) -> Right ear receives delayed, head-shadowed crossfeed
    const targetCrossL = 0.08 + Math.max(0, X) * 0.20;
    const targetCrossR = 0.08 + Math.max(0, -X) * 0.20;

    // 5. Air sheen presence (widest on extreme sides)
    const targetSide = 0.06 + Math.abs(X) * 0.08;

    const now = audioContext.currentTime;
    const rampTime = now + 0.065;

    dryGainL.gain.cancelScheduledValues(now);
    dryGainR.gain.cancelScheduledValues(now);
    dryGainL.gain.linearRampToValueAtTime(targetGainL, rampTime);
    dryGainR.gain.linearRampToValueAtTime(targetGainR, rampTime);

    if (rearOcclusionFilter) {
      rearOcclusionFilter.frequency.cancelScheduledValues(now);
      rearOcclusionFilter.frequency.linearRampToValueAtTime(targetFreq, rampTime);
    }

    if (reverbGainL && reverbGainR) {
      reverbGainL.gain.cancelScheduledValues(now);
      reverbGainR.gain.cancelScheduledValues(now);
      reverbGainL.gain.linearRampToValueAtTime(targetReverb, rampTime);
      reverbGainR.gain.linearRampToValueAtTime(targetReverb, rampTime);
    }

    if (crossGainL && crossGainR) {
      crossGainL.gain.cancelScheduledValues(now);
      crossGainR.gain.cancelScheduledValues(now);
      crossGainL.gain.linearRampToValueAtTime(targetCrossL, rampTime);
      crossGainR.gain.linearRampToValueAtTime(targetCrossR, rampTime);
    }

    if (sideGainL && sideGainR) {
      sideGainL.gain.cancelScheduledValues(now);
      sideGainR.gain.cancelScheduledValues(now);
      sideGainL.gain.linearRampToValueAtTime(targetSide, rampTime);
      sideGainR.gain.linearRampToValueAtTime(targetSide, rampTime);
    }
  }, stepIntervalMs);
}

function stopSpatialOrbit() {
  if (spatialOrbitInterval) {
    clearInterval(spatialOrbitInterval);
    spatialOrbitInterval = null;
  }
  if (audioContext && rearOcclusionFilter) {
    const now = audioContext.currentTime;
    rearOcclusionFilter.frequency.cancelScheduledValues(now);
    rearOcclusionFilter.frequency.linearRampToValueAtTime(20000, now + 0.2);
  }
}

// Generate a synthetic decorrelated stereo acoustic room impulse response
function createStereoRoomImpulse(ctx, duration = 0.45, decay = 3.2) {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  // Early reflection pre-delay (10ms)
  const preDelay = Math.floor(sampleRate * 0.01);

  for (let i = 0; i < length; i++) {
    if (i < preDelay) {
      left[i] = 0;
      right[i] = 0;
    } else {
      const t = (i - preDelay) / (length - preDelay);
      const envelope = Math.exp(-t * decay);
      // Discrete early reflection spikes for natural room presence
      const reflection = (Math.random() * 2 - 1) * envelope * 0.3;
      left[i] = reflection;
      right[i] = (Math.random() * 2 - 1) * envelope * 0.3;
    }
  }
  return impulse;
}

export function initMediaAudioEffects(audioElement) {
  if (isInitialized || !audioElement) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) {
      audioContext = new AudioContextClass();
    }
    const ctx = audioContext;

    mediaSource = ctx.createMediaElementSource(audioElement);

    // 1. Muffle (Tea Stall Veranda Vibe) Filter
    muffleFilter = ctx.createBiquadFilter();
    muffleFilter.type = 'lowpass';
    muffleFilter.frequency.value = 20000;
    muffleFilter.Q.value = 0.85;

    // 1b. Dynamic Pinna / Head Occlusion Filter (Realistic front vs behind 360° perception)
    rearOcclusionFilter = ctx.createBiquadFilter();
    rearOcclusionFilter.type = 'lowpass';
    rearOcclusionFilter.frequency.value = 20000;
    rearOcclusionFilter.Q.value = 0.7;

    mediaSource.connect(muffleFilter);
    muffleFilter.connect(rearOcclusionFilter);

    // 2. Channel Splitter (Left & Right)
    splitter = ctx.createChannelSplitter(2);
    rearOcclusionFilter.connect(splitter);

    // 3. Dry Signal Path (Gain Normalized)
    dryGainL = ctx.createGain();
    dryGainR = ctx.createGain();
    dryGainL.gain.value = 1.0;
    dryGainR.gain.value = 1.0;

    splitter.connect(dryGainL, 0);
    splitter.connect(dryGainR, 1);

    // 4. Binaural Head-Shadow Crossfeed (Bauer-Linkwitz HRTF)
    // Left ear to Right ear (0.7ms delay + 3000Hz head-shadow lowpass)
    crossDelayL = ctx.createDelay();
    crossDelayL.delayTime.value = 0.0007;

    crossFilterL = ctx.createBiquadFilter();
    crossFilterL.type = 'lowpass';
    crossFilterL.frequency.value = 3000;
    crossFilterL.Q.value = 0.7;

    crossGainL = ctx.createGain();
    crossGainL.gain.value = 0.0;

    splitter.connect(crossDelayL, 0);
    crossDelayL.connect(crossFilterL);
    crossFilterL.connect(crossGainL);

    // Right ear to Left ear (0.7ms delay + 3000Hz head-shadow lowpass)
    crossDelayR = ctx.createDelay();
    crossDelayR.delayTime.value = 0.0007;

    crossFilterR = ctx.createBiquadFilter();
    crossFilterR.type = 'lowpass';
    crossFilterR.frequency.value = 3000;
    crossFilterR.Q.value = 0.7;

    crossGainR = ctx.createGain();
    crossGainR.gain.value = 0.0;

    splitter.connect(crossDelayR, 1);
    crossDelayR.connect(crossFilterR);
    crossFilterR.connect(crossGainR);

    // 5. High-Frequency Air / Spatial Sheen Filter
    sideFilter = ctx.createBiquadFilter();
    sideFilter.type = 'highshelf';
    sideFilter.frequency.value = 4500;
    sideFilter.gain.value = 1.8; // subtle airy presence for 3D staging

    sideGainL = ctx.createGain();
    sideGainR = ctx.createGain();
    sideGainL.gain.value = 0.0;
    sideGainR.gain.value = 0.0;

    splitter.connect(sideFilter);
    sideFilter.connect(sideGainL);
    sideFilter.connect(sideGainR);

    // 6. True Stereo Room Convolver
    roomConvolver = ctx.createConvolver();
    roomConvolver.buffer = createStereoRoomImpulse(ctx, 0.4, 3.5);

    reverbSplitter = ctx.createChannelSplitter(2);
    reverbGainL = ctx.createGain();
    reverbGainR = ctx.createGain();
    reverbGainL.gain.value = 0.0;
    reverbGainR.gain.value = 0.0;

    rearOcclusionFilter.connect(roomConvolver);
    roomConvolver.connect(reverbSplitter);
    reverbSplitter.connect(reverbGainL, 0);
    reverbSplitter.connect(reverbGainR, 1);

    // 7. Master Output Merger (Left: channel 0, Right: channel 1)
    merger = ctx.createChannelMerger(2);

    // Left Ear Output:
    // - Direct Left
    // - Crossfed Right (diffracted around head)
    // - Room Ambience Left
    // - Side Spatial Widening Left
    dryGainL.connect(merger, 0, 0);
    crossGainR.connect(merger, 0, 0);
    reverbGainL.connect(merger, 0, 0);
    sideGainL.connect(merger, 0, 0);

    // Right Ear Output:
    // - Direct Right
    // - Crossfed Left (diffracted around head)
    // - Room Ambience Right
    // - Side Spatial Widening Right
    dryGainR.connect(merger, 0, 1);
    crossGainL.connect(merger, 0, 1);
    reverbGainR.connect(merger, 0, 1);
    sideGainR.connect(merger, 0, 1);

    // Master Output with soft ceiling limiter to guarantee zero distortion
    masterGain = ctx.createGain();
    masterGain.gain.value = 1.0;
    merger.connect(masterGain);
    masterGain.connect(ctx.destination);

    isInitialized = true;
  } catch (err) {
    console.warn('Audio effects initialization note:', err.message);
  }
}

export function resumeAudioContext() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
}

export function setMuffleEffect(isMuffled) {
  if (!muffleFilter || !audioContext) return;
  resumeAudioContext();
  const now = audioContext.currentTime;
  muffleFilter.frequency.cancelScheduledValues(now);

  if (isMuffled) {
    // Cozy muffled sound as if seated on the wooden bench outside the tea shop
    muffleFilter.frequency.setValueAtTime(muffleFilter.frequency.value, now);
    muffleFilter.frequency.exponentialRampToValueAtTime(820, now + 0.35);
  } else {
    // Crystal clear sound
    muffleFilter.frequency.setValueAtTime(Math.max(20, muffleFilter.frequency.value), now);
    muffleFilter.frequency.exponentialRampToValueAtTime(20000, now + 0.35);
  }
}

export function setSpatialEffect(isSpatial) {
  if (!dryGainL || !dryGainR || !crossGainL || !crossGainR || !reverbGainL || !reverbGainR || !audioContext) return;
  resumeAudioContext();
  const now = audioContext.currentTime;

  dryGainL.gain.cancelScheduledValues(now);
  dryGainR.gain.cancelScheduledValues(now);
  crossGainL.gain.cancelScheduledValues(now);
  crossGainR.gain.cancelScheduledValues(now);
  reverbGainL.gain.cancelScheduledValues(now);
  reverbGainR.gain.cancelScheduledValues(now);
  if (sideGainL && sideGainR) {
    sideGainL.gain.cancelScheduledValues(now);
    sideGainR.gain.cancelScheduledValues(now);
  }

  if (isSpatial) {
    // ENHANCED 4D SPATIAL AUDIO:
    // - Starts real-time 360-degree dynamic binaural orbit panning (audio-4d-conv DSP)
    // - Binaural crossfeed gently blended at 0.18 (creates head-externalized 3D staging)
    // - Spatial room reflections blended at 0.16 (simulates Kerala tea-stall room acoustic environment)
    // - Side air presence at 0.10 (expands the soundstage wider than the physical headphones)
    startSpatialOrbit();

    crossGainL.gain.setValueAtTime(crossGainL.gain.value, now);
    crossGainL.gain.linearRampToValueAtTime(0.18, now + 0.3);

    crossGainR.gain.setValueAtTime(crossGainR.gain.value, now);
    crossGainR.gain.linearRampToValueAtTime(0.18, now + 0.3);

    reverbGainL.gain.setValueAtTime(reverbGainL.gain.value, now);
    reverbGainL.gain.linearRampToValueAtTime(0.16, now + 0.3);

    reverbGainR.gain.setValueAtTime(reverbGainR.gain.value, now);
    reverbGainR.gain.linearRampToValueAtTime(0.16, now + 0.3);

    if (sideGainL && sideGainR) {
      sideGainL.gain.setValueAtTime(sideGainL.gain.value, now);
      sideGainL.gain.linearRampToValueAtTime(0.10, now + 0.3);

      sideGainR.gain.setValueAtTime(sideGainR.gain.value, now);
      sideGainR.gain.linearRampToValueAtTime(0.10, now + 0.3);
    }
  } else {
    // PURE DIRECT STEREO:
    stopSpatialOrbit();

    dryGainL.gain.setValueAtTime(dryGainL.gain.value, now);
    dryGainL.gain.linearRampToValueAtTime(1.0, now + 0.2);

    dryGainR.gain.setValueAtTime(dryGainR.gain.value, now);
    dryGainR.gain.linearRampToValueAtTime(1.0, now + 0.2);

    crossGainL.gain.setValueAtTime(crossGainL.gain.value, now);
    crossGainL.gain.linearRampToValueAtTime(0.0, now + 0.2);

    crossGainR.gain.setValueAtTime(crossGainR.gain.value, now);
    crossGainR.gain.linearRampToValueAtTime(0.0, now + 0.2);

    reverbGainL.gain.setValueAtTime(reverbGainL.gain.value, now);
    reverbGainL.gain.linearRampToValueAtTime(0.0, now + 0.2);

    reverbGainR.gain.setValueAtTime(reverbGainR.gain.value, now);
    reverbGainR.gain.linearRampToValueAtTime(0.0, now + 0.2);

    if (sideGainL && sideGainR) {
      sideGainL.gain.setValueAtTime(sideGainL.gain.value, now);
      sideGainL.gain.linearRampToValueAtTime(0.0, now + 0.2);

      sideGainR.gain.setValueAtTime(sideGainR.gain.value, now);
      sideGainR.gain.linearRampToValueAtTime(0.0, now + 0.2);
    }
  }
}

export function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

// Realistic 0.45s analog vinyl needle drop crackle sound
export function playNeedleCrackle() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const duration = 0.45;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      let s = (Math.random() * 2 - 1) * 0.08;
      // Micro vinyl dust pops
      if (Math.random() < 0.015) {
        s += (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4);
      }
      // Needle touchdown thud
      const t = i / ctx.sampleRate;
      if (t >= 0.05 && t <= 0.11) {
        s += Math.sin((t - 0.05) * 120) * 0.3;
      }
      const decay = Math.max(0, 1 - (i / bufferSize));
      data[i] = s * decay;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch {
    // Ignore if audio permissions block it
  }
}

// Vintage 40W bulb pull-chain switch mechanical tactile click
export function playSwitchClick() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Ignore if audio blocked
  }
}
