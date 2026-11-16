import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AmbienceContext = createContext(null);

export function AmbienceProvider({ children }) {
  // Sound effect active states
  const [rainActive, setRainActive] = useState(false);
  const [thunderActive, setThunderActive] = useState(false);
  const [cricketsActive, setCricketsActive] = useState(false);
  const [chattingActive, setChattingActive] = useState(false);
  const [fireplaceActive, setFireplaceActive] = useState(false);
  const [birdsActive, setBirdsActive] = useState(false);
  const [windActive, setWindActive] = useState(false);

  // Volume levels (0 to 1) matching the screenshot defaults
  const [rainVol, setRainVol] = useState(0.60);
  const [thunderVol, setThunderVol] = useState(0.68);
  const [cricketsVol, setCricketsVol] = useState(0.45);
  const [chattingVol, setChattingVol] = useState(0.32);
  const [fireplaceVol, setFireplaceVol] = useState(0.55);
  const [birdsVol, setBirdsVol] = useState(0.50);
  const [windVol, setWindVol] = useState(0.35);

  const [activePreset, setActivePreset] = useState(null);
  const [isAmbienceOpen, setIsAmbienceOpen] = useState(false);

  // Web Audio graph refs
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const rainGainRef = useRef(null);
  const thunderGainRef = useRef(null);
  const cricketsGainRef = useRef(null);
  const chattingGainRef = useRef(null);
  const fireplaceGainRef = useRef(null);
  const birdsGainRef = useRef(null);
  const windGainRef = useRef(null);

  // Timers and loop flags
  const thunderLoopRef = useRef(null);
  const birdsLoopRef = useRef(null);
  const fireplaceLoopRef = useRef(null);

  const thunderActiveRef = useRef(thunderActive);
  const birdsActiveRef = useRef(birdsActive);
  const fireplaceActiveRef = useRef(fireplaceActive);

  useEffect(() => { thunderActiveRef.current = thunderActive; }, [thunderActive]);
  useEffect(() => { birdsActiveRef.current = birdsActive; }, [birdsActive]);
  useEffect(() => { fireplaceActiveRef.current = fireplaceActive; }, [fireplaceActive]);

  const isAnySoundActive =
    rainActive || thunderActive || cricketsActive || chattingActive ||
    fireplaceActive || birdsActive || windActive;

  // Studio-Grade Pink Noise generator (Paul Kellet 1/f analog filter)
  // Completely eliminates white-noise digital grain and harsh static
  function createStudioPinkNoiseBuffer(ctx, seconds = 10) {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.12;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Smooth warm brown noise generator (1/f² power density for lush sub-bass / warmth)
  function createStudioBrownNoiseBuffer(ctx, seconds = 10) {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // normalize volume
    }
    return buffer;
  }

  // Initialize Web Audio graph
  const initAudio = () => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 1.0;
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      const pinkNoiseBuffer = createStudioPinkNoiseBuffer(ctx, 12);
      const brownNoiseBuffer = createStudioBrownNoiseBuffer(ctx, 12);

      // 1. 🌧️ RAIN (Pure analog pink rain on roof: velvety, zero grain)
      const rainGain = ctx.createGain();
      rainGain.gain.value = 0;
      rainGainRef.current = rainGain;
      rainGain.connect(masterGain);

      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = pinkNoiseBuffer;
      rainSrc.loop = true;

      // Anti-grain high-cut filter (removes any digital fizz above 3200Hz)
      const rainAirCut = ctx.createBiquadFilter();
      rainAirCut.type = 'lowpass';
      rainAirCut.frequency.value = 3200;

      // Droplet resonance filter
      const rainBody = ctx.createBiquadFilter();
      rainBody.type = 'peaking';
      rainBody.frequency.value = 1100;
      rainBody.Q.value = 0.9;
      rainBody.gain.value = 4.0;

      rainSrc.connect(rainAirCut);
      rainAirCut.connect(rainBody);
      rainBody.connect(rainGain);
      rainSrc.start();

      // 2. ⚡ THUNDER (Sub-bass rumble generator)
      const thunderGain = ctx.createGain();
      thunderGain.gain.value = 0;
      thunderGainRef.current = thunderGain;
      thunderGain.connect(masterGain);

      // 3. 🦗 CRICKETS (Pure dual sine oscillators with 8Hz tremolo - zero noise/grain)
      const cricketsGain = ctx.createGain();
      cricketsGain.gain.value = 0;
      cricketsGainRef.current = cricketsGain;
      cricketsGain.connect(masterGain);

      const cOsc1 = ctx.createOscillator();
      cOsc1.type = 'sine';
      cOsc1.frequency.value = 4550;

      const cOsc2 = ctx.createOscillator();
      cOsc2.type = 'sine';
      cOsc2.frequency.value = 4780;

      const cTremoloGain = ctx.createGain();
      cTremoloGain.gain.value = 0.5;

      const cLfo = ctx.createOscillator();
      cLfo.type = 'sine';
      cLfo.frequency.value = 7.8; // Rhythmic cricket chirping
      const cLfoGain = ctx.createGain();
      cLfoGain.gain.value = 0.48;

      cLfo.connect(cLfoGain);
      cLfoGain.connect(cTremoloGain.gain);
      cLfo.start();

      const cBandpass = ctx.createBiquadFilter();
      cBandpass.type = 'bandpass';
      cBandpass.frequency.value = 4660;
      cBandpass.Q.value = 5.0;

      cOsc1.connect(cTremoloGain);
      cOsc2.connect(cTremoloGain);
      cTremoloGain.connect(cBandpass);
      cBandpass.connect(cricketsGain);

      cOsc1.start();
      cOsc2.start();

      // 4. 💬 CHATTING (Warm tea stall conversation formant filter)
      const chattingGain = ctx.createGain();
      chattingGain.gain.value = 0;
      chattingGainRef.current = chattingGain;
      chattingGain.connect(masterGain);

      const chatSrc = ctx.createBufferSource();
      chatSrc.buffer = pinkNoiseBuffer;
      chatSrc.loop = true;

      const chatFilt1 = ctx.createBiquadFilter();
      chatFilt1.type = 'bandpass';
      chatFilt1.frequency.value = 480;
      chatFilt1.Q.value = 3.5;

      const chatFilt2 = ctx.createBiquadFilter();
      chatFilt2.type = 'bandpass';
      chatFilt2.frequency.value = 1100;
      chatFilt2.Q.value = 3.0;

      const chatLfo = ctx.createOscillator();
      chatLfo.frequency.value = 2.2;
      const chatLfoGain = ctx.createGain();
      chatLfoGain.gain.value = 0.35;
      const chatModGain = ctx.createGain();
      chatModGain.gain.value = 0.85;

      chatLfo.connect(chatLfoGain);
      chatLfoGain.connect(chatModGain.gain);
      chatLfo.start();

      chatSrc.connect(chatFilt1);
      chatSrc.connect(chatFilt2);
      chatFilt1.connect(chatModGain);
      chatFilt2.connect(chatModGain);
      chatModGain.connect(chattingGain);
      chatSrc.start();

      // 5. 🔥 FIREPLACE (Deep brown noise warmth + analog wood snaps)
      const fireplaceGain = ctx.createGain();
      fireplaceGain.gain.value = 0;
      fireplaceGainRef.current = fireplaceGain;
      fireplaceGain.connect(masterGain);

      const fireSrc = ctx.createBufferSource();
      fireSrc.buffer = brownNoiseBuffer;
      fireSrc.loop = true;

      const fireLow = ctx.createBiquadFilter();
      fireLow.type = 'lowpass';
      fireLow.frequency.value = 180;

      fireSrc.connect(fireLow);
      fireLow.connect(fireplaceGain);
      fireSrc.start();

      // 6. 🐦 BIRDS (Pure melodic sine oscillators)
      const birdsGain = ctx.createGain();
      birdsGain.gain.value = 0;
      birdsGainRef.current = birdsGain;
      birdsGain.connect(masterGain);

      // 7. 💨 WIND (Warm brown noise breeze with gentle sweeping filter)
      const windGain = ctx.createGain();
      windGain.gain.value = 0;
      windGainRef.current = windGain;
      windGain.connect(masterGain);

      const windSrc = ctx.createBufferSource();
      windSrc.buffer = brownNoiseBuffer;
      windSrc.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 280;
      windFilter.Q.value = 1.2;

      const windLfo = ctx.createOscillator();
      windLfo.frequency.value = 0.15; // 6.6s gust cycle
      const windLfoGain = ctx.createGain();
      windLfoGain.gain.value = 140;
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      windLfo.start();

      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      windSrc.start();

      return ctx;
    } catch (e) {
      console.warn('Web Audio synthesis initialization:', e);
      return null;
    }
  };

  // Trigger studio thunder rumble (rich sub-bass, zero clipping)
  const playThunderStrike = () => {
    const ctx = initAudio();
    if (!ctx || !thunderGainRef.current) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const tFilter = ctx.createBiquadFilter();
      const tGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(52, now);
      osc.frequency.exponentialRampToValueAtTime(22, now + 3.6);

      tFilter.type = 'lowpass';
      tFilter.frequency.value = 85;

      tGain.gain.setValueAtTime(0.001, now);
      tGain.gain.exponentialRampToValueAtTime(0.65, now + 0.55);
      tGain.gain.exponentialRampToValueAtTime(0.22, now + 2.2);
      tGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.4);

      osc.connect(tFilter);
      tFilter.connect(tGain);
      tGain.connect(thunderGainRef.current);

      osc.start(now);
      osc.stop(now + 4.5);
    } catch (e) {}
  };

  // Trigger studio bird call (pure pitch glides, zero distortion)
  const playBirdCall = () => {
    const ctx = initAudio();
    if (!ctx || !birdsGainRef.current) return;
    try {
      const now = ctx.currentTime;
      const baseFreq = 2300 + Math.random() * 450;
      const osc = ctx.createOscillator();
      const bGain = ctx.createGain();
      osc.type = 'sine';

      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.28, now + 0.08);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.94, now + 0.17);

      bGain.gain.setValueAtTime(0.001, now);
      bGain.gain.exponentialRampToValueAtTime(0.28, now + 0.03);
      bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(bGain);
      bGain.connect(birdsGainRef.current);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch (e) {}
  };

  // Trigger organic wood snap
  const playFirePop = () => {
    const ctx = initAudio();
    if (!ctx || !fireplaceGainRef.current) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const pFilter = ctx.createBiquadFilter();
      const pGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240 + Math.random() * 320, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.03);

      pFilter.type = 'bandpass';
      pFilter.frequency.value = 1250;

      pGain.gain.setValueAtTime(0.001, now);
      pGain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
      pGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(pFilter);
      pFilter.connect(pGain);
      pGain.connect(fireplaceGainRef.current);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch (e) {}
  };

  // Thunder recurring loop
  useEffect(() => {
    if (thunderActive) {
      initAudio();
      playThunderStrike();

      const loop = () => {
        if (!thunderActiveRef.current) return;
        playThunderStrike();
        const nextTime = 9000 + Math.random() * 11000;
        thunderLoopRef.current = setTimeout(loop, nextTime);
      };
      thunderLoopRef.current = setTimeout(loop, 10000);
    } else {
      if (thunderLoopRef.current) clearTimeout(thunderLoopRef.current);
    }
    return () => {
      if (thunderLoopRef.current) clearTimeout(thunderLoopRef.current);
    };
  }, [thunderActive]);

  // Birds recurring loop
  useEffect(() => {
    if (birdsActive) {
      initAudio();
      playBirdCall();

      const loop = () => {
        if (!birdsActiveRef.current) return;
        playBirdCall();
        const nextTime = 2400 + Math.random() * 3400;
        birdsLoopRef.current = setTimeout(loop, nextTime);
      };
      birdsLoopRef.current = setTimeout(loop, 2600);
    } else {
      if (birdsLoopRef.current) clearTimeout(birdsLoopRef.current);
    }
    return () => {
      if (birdsLoopRef.current) clearTimeout(birdsLoopRef.current);
    };
  }, [birdsActive]);

  // Fireplace pop loop
  useEffect(() => {
    if (fireplaceActive) {
      initAudio();
      playFirePop();

      const loop = () => {
        if (!fireplaceActiveRef.current) return;
        playFirePop();
        const nextTime = 240 + Math.random() * 600;
        fireplaceLoopRef.current = setTimeout(loop, nextTime);
      };
      fireplaceLoopRef.current = setTimeout(loop, 280);
    } else {
      if (fireplaceLoopRef.current) clearTimeout(fireplaceLoopRef.current);
    }
    return () => {
      if (fireplaceLoopRef.current) clearTimeout(fireplaceLoopRef.current);
    };
  }, [fireplaceActive]);

  // Volume gain ramp hooks
  const applyGain = (gainRef, active, volume, scale = 1.0) => {
    if (!gainRef || !gainRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const targetValue = active ? Math.max(0, volume * scale) : 0;
    gainRef.current.gain.cancelScheduledValues(now);
    gainRef.current.gain.linearRampToValueAtTime(targetValue, now + 0.08);
  };

  useEffect(() => { applyGain(rainGainRef, rainActive, rainVol, 0.95); }, [rainActive, rainVol]);
  useEffect(() => { applyGain(thunderGainRef, thunderActive, thunderVol, 0.9); }, [thunderActive, thunderVol]);
  useEffect(() => { applyGain(cricketsGainRef, cricketsActive, cricketsVol, 0.65); }, [cricketsActive, cricketsVol]);
  useEffect(() => { applyGain(chattingGainRef, chattingActive, chattingVol, 0.7); }, [chattingActive, chattingVol]);
  useEffect(() => { applyGain(fireplaceGainRef, fireplaceActive, fireplaceVol, 0.75); }, [fireplaceActive, fireplaceVol]);
  useEffect(() => { applyGain(birdsGainRef, birdsActive, birdsVol, 0.65); }, [birdsActive, birdsVol]);
  useEffect(() => { applyGain(windGainRef, windActive, windVol, 0.75); }, [windActive, windVol]);

  const ensureAudioRunning = () => {
    const ctx = initAudio();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  const setSoundActive = (soundKey, isActive) => {
    ensureAudioRunning();
    switch (soundKey) {
      case 'rain': setRainActive(isActive); break;
      case 'thunder': setThunderActive(isActive); break;
      case 'crickets': setCricketsActive(isActive); break;
      case 'chatting': setChattingActive(isActive); break;
      case 'fireplace': setFireplaceActive(isActive); break;
      case 'birds': setBirdsActive(isActive); break;
      case 'wind': setWindActive(isActive); break;
      default: break;
    }
  };

  const toggleSound = (soundKey) => {
    ensureAudioRunning();
    switch (soundKey) {
      case 'rain': setRainActive(prev => !prev); break;
      case 'thunder': setThunderActive(prev => !prev); break;
      case 'crickets': setCricketsActive(prev => !prev); break;
      case 'chatting': setChattingActive(prev => !prev); break;
      case 'fireplace': setFireplaceActive(prev => !prev); break;
      case 'birds': setBirdsActive(prev => !prev); break;
      case 'wind': setWindActive(prev => !prev); break;
      default: break;
    }
  };

  const applyPreset = (presetKey) => {
    ensureAudioRunning();
    setActivePreset(presetKey);

    if (presetKey === 'mazha_sandhya') {
      setRainActive(true); setRainVol(0.60);
      setThunderActive(false);
      setCricketsActive(true); setCricketsVol(0.45);
      setChattingActive(false);
      setFireplaceActive(false);
      setBirdsActive(true); setBirdsVol(0.45);
      setWindActive(true); setWindVol(0.40);
    } else if (presetKey === 'chaya_samayam') {
      setRainActive(true); setRainVol(0.40);
      setThunderActive(false);
      setCricketsActive(false);
      setChattingActive(true); setChattingVol(0.50);
      setFireplaceActive(true); setFireplaceVol(0.55);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.35);
    } else if (presetKey === 'padhanam') {
      setRainActive(true); setRainVol(0.50);
      setThunderActive(false);
      setCricketsActive(false);
      setChattingActive(false);
      setFireplaceActive(true); setFireplaceVol(0.45);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.35);
    } else if (presetKey === 'mazhakaalam') {
      setRainActive(true); setRainVol(0.85);
      setThunderActive(true); setThunderVol(0.68);
      setCricketsActive(false);
      setChattingActive(false);
      setFireplaceActive(false);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.70);
    } else if (presetKey === 'raatri') {
      setRainActive(false);
      setThunderActive(false);
      setCricketsActive(true); setCricketsVol(0.55);
      setChattingActive(false);
      setFireplaceActive(true); setFireplaceVol(0.50);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.40);
    } else if (presetKey === 'innathethu') {
      setRainActive(true); setRainVol(0.60);
      setThunderActive(false);
      setCricketsActive(true); setCricketsVol(0.40);
      setChattingActive(true); setChattingVol(0.35);
      setFireplaceActive(true); setFireplaceVol(0.45);
      setBirdsActive(true); setBirdsVol(0.40);
      setWindActive(true); setWindVol(0.35);
    }
  };

  const toggleAmbience = () => {
    ensureAudioRunning();
    if (isAnySoundActive) {
      setRainActive(false);
      setThunderActive(false);
      setCricketsActive(false);
      setChattingActive(false);
      setFireplaceActive(false);
      setBirdsActive(false);
      setWindActive(false);
      setActivePreset(null);
    } else {
      applyPreset('mazha_sandhya');
    }
  };

  return (
    <AmbienceContext.Provider value={{
      isEnabled: isAnySoundActive,
      activePreset,
      rainVol, thunderVol, cricketsVol, chattingVol, fireplaceVol, birdsVol, windVol,
      rainActive, thunderActive, cricketsActive, chattingActive, fireplaceActive, birdsActive, windActive,
      isAmbienceOpen,
      setIsAmbienceOpen,
      setRainVol, setThunderVol, setCricketsVol, setChattingVol, setFireplaceVol, setBirdsVol, setWindVol,
      toggleAmbience,
      toggleSound,
      setSoundActive,
      applyPreset
    }}>
      {children}
    </AmbienceContext.Provider>
  );
}

export function useAmbience() {
  const context = useContext(AmbienceContext);
  if (!context) {
    throw new Error('useAmbience must be used within an AmbienceProvider');
  }
  return context;
}
