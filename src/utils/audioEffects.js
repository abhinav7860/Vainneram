// Web Audio Effects processor for the HTML5 Audio element
// Provides real-time Muffled (Vibe / Lowpass) and Spatial (3D Stereo Widening) processing

let audioContext = null;
let mediaSource = null;
let muffleFilter = null;
let dryGain = null;
let wetSpatialGain = null;
let splitter = null;
let merger = null;
let delayNode = null;
let isInitialized = false;

export function initMediaAudioEffects(audioElement) {
  if (isInitialized || !audioElement) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    const ctx = audioContext;

    // Connect audioElement only once
    mediaSource = ctx.createMediaElementSource(audioElement);

    // 1. Muffle (Vibe) Filter - Lowpass filter that cuts high frequencies to simulate muffled audio
    muffleFilter = ctx.createBiquadFilter();
    muffleFilter.type = 'lowpass';
    muffleFilter.frequency.value = 20000; // default fully open / clear
    muffleFilter.Q.value = 1.0;

    // Connect source to muffle filter
    mediaSource.connect(muffleFilter);

    // 2. Spatial Audio Processing (Haas effect + stereo crossfeed widening)
    // Dry signal path
    dryGain = ctx.createGain();
    dryGain.gain.value = 1.0;

    // Wet spatial path (channel splitter -> delay -> channel merger)
    wetSpatialGain = ctx.createGain();
    wetSpatialGain.gain.value = 0.0; // default disabled

    splitter = ctx.createChannelSplitter(2);
    merger = ctx.createChannelMerger(2);

    delayNode = ctx.createDelay();
    delayNode.delayTime.value = 0.016; // 16ms Haas delay for natural 3D widening

    const spatialFilter = ctx.createBiquadFilter();
    spatialFilter.type = 'highpass';
    spatialFilter.frequency.value = 250; // preserve sub bass center

    // Connect muffleFilter to dry gain -> destination
    muffleFilter.connect(dryGain);
    dryGain.connect(ctx.destination);

    // Connect muffleFilter to wet spatial -> destination
    muffleFilter.connect(spatialFilter);
    spatialFilter.connect(splitter);
    splitter.connect(delayNode, 1); // delay right channel slightly
    delayNode.connect(merger, 0, 1);
    splitter.connect(merger, 0, 0); // left channel
    merger.connect(wetSpatialGain);
    wetSpatialGain.connect(ctx.destination);

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
    // Smooth ramp to 820Hz (cozy muffled tea stall vibe)
    muffleFilter.frequency.setValueAtTime(muffleFilter.frequency.value, now);
    muffleFilter.frequency.exponentialRampToValueAtTime(820, now + 0.35);
  } else {
    // Clear sound
    muffleFilter.frequency.setValueAtTime(Math.max(20, muffleFilter.frequency.value), now);
    muffleFilter.frequency.exponentialRampToValueAtTime(20000, now + 0.35);
  }
}

export function setSpatialEffect(isSpatial) {
  if (!wetSpatialGain || !dryGain || !audioContext) return;
  resumeAudioContext();
  const now = audioContext.currentTime;

  wetSpatialGain.gain.cancelScheduledValues(now);
  dryGain.gain.cancelScheduledValues(now);

  if (isSpatial) {
    // Enhance 3D spatial widening
    wetSpatialGain.gain.setValueAtTime(wetSpatialGain.gain.value, now);
    wetSpatialGain.gain.linearRampToValueAtTime(0.75, now + 0.3);
    dryGain.gain.setValueAtTime(dryGain.gain.value, now);
    dryGain.gain.linearRampToValueAtTime(0.7, now + 0.3);
  } else {
    // Normal direct stereo
    wetSpatialGain.gain.setValueAtTime(wetSpatialGain.gain.value, now);
    wetSpatialGain.gain.linearRampToValueAtTime(0, now + 0.25);
    dryGain.gain.setValueAtTime(dryGain.gain.value, now);
    dryGain.gain.linearRampToValueAtTime(1.0, now + 0.25);
  }
}

export function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
  }
  return audioContext;
}
