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
  const [kettleActive, setKettleActive] = useState(false);
  const [glassClinkActive, setGlassClinkActive] = useState(false);

  // Volume levels (0 to 1)
  const [rainVol, setRainVol] = useState(0.65);
  const [thunderVol, setThunderVol] = useState(0.50);
  const [cricketsVol, setCricketsVol] = useState(0.45);
  const [chattingVol, setChattingVol] = useState(0.40);
  const [fireplaceVol, setFireplaceVol] = useState(0.55);
  const [birdsVol, setBirdsVol] = useState(0.50);
  const [windVol, setWindVol] = useState(0.45);
  const [kettleVol, setKettleVol] = useState(0.40);
  const [glassClinkVol, setGlassClinkVol] = useState(0.35);

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
  const kettleGainRef = useRef(null);
  const glassClinkGainRef = useRef(null);

  // Timers and loop flags
  const thunderLoopRef = useRef(null);
  const birdsLoopRef = useRef(null);
  const fireplaceLoopRef = useRef(null);
  const glassClinkLoopRef = useRef(null);

  const thunderActiveRef = useRef(thunderActive);
  const birdsActiveRef = useRef(birdsActive);
  const fireplaceActiveRef = useRef(fireplaceActive);
  const glassClinkActiveRef = useRef(glassClinkActive);

  useEffect(() => { thunderActiveRef.current = thunderActive; }, [thunderActive]);
  useEffect(() => { birdsActiveRef.current = birdsActive; }, [birdsActive]);
  useEffect(() => { fireplaceActiveRef.current = fireplaceActive; }, [fireplaceActive]);
  useEffect(() => { glassClinkActiveRef.current = glassClinkActive; }, [glassClinkActive]);

  const isAnySoundActive =
    rainActive || thunderActive || cricketsActive || chattingActive ||
    fireplaceActive || birdsActive || windActive || kettleActive || glassClinkActive;

  // Initialize Web Audio graph once
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

      // Noise buffer generator (10 seconds loop)
      function createNoiseBuffer(seconds = 10) {
        const bufferSize = ctx.sampleRate * seconds;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        return buffer;
      }

      // 1. 🌧️ RAIN (Rich tin-roof rain with high spatter + low roof rumble)
      const rainGain = ctx.createGain();
      rainGain.gain.value = 0;
      rainGainRef.current = rainGain;
      rainGain.connect(masterGain);

      const rainBuf = createNoiseBuffer(10);
      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = rainBuf;
      rainSrc.loop = true;

      const rainHighFilter = ctx.createBiquadFilter();
      rainHighFilter.type = 'bandpass';
      rainHighFilter.frequency.value = 1600;
      rainHighFilter.Q.value = 0.8;

      const rainLowFilter = ctx.createBiquadFilter();
      rainLowFilter.type = 'lowpass';
      rainLowFilter.frequency.value = 450;

      const rainHighGain = ctx.createGain();
      rainHighGain.gain.value = 0.8;
      const rainLowGain = ctx.createGain();
      rainLowGain.gain.value = 0.6;

      rainSrc.connect(rainHighFilter);
      rainHighFilter.connect(rainHighGain);
      rainHighGain.connect(rainGain);

      rainSrc.connect(rainLowFilter);
      rainLowFilter.connect(rainLowGain);
      rainLowGain.connect(rainGain);

      rainSrc.start();

      // 2. ⚡ THUNDER (Distant rolling sub-bass and rumble generator)
      const thunderGain = ctx.createGain();
      thunderGain.gain.value = 0;
      thunderGainRef.current = thunderGain;
      thunderGain.connect(masterGain);

      // 3. 🦗 CRICKETS (Continuous rhythmic cricket chorus with LFO flutter)
      const cricketsGain = ctx.createGain();
      cricketsGain.gain.value = 0;
      cricketsGainRef.current = cricketsGain;
      cricketsGain.connect(masterGain);

      const cricketsBuf = createNoiseBuffer(6);
      const cricketsSrc = ctx.createBufferSource();
      cricketsSrc.buffer = cricketsBuf;
      cricketsSrc.loop = true;

      const cricketsFilter = ctx.createBiquadFilter();
      cricketsFilter.type = 'bandpass';
      cricketsFilter.frequency.value = 4550;
      cricketsFilter.Q.value = 16.0;

      const cricketsTremolo = ctx.createGain();
      cricketsTremolo.gain.value = 0.5;

      const cricketsLfo = ctx.createOscillator();
      cricketsLfo.type = 'sine';
      cricketsLfo.frequency.value = 8.5; // Natural cricket rhythm
      const cricketsLfoGain = ctx.createGain();
      cricketsLfoGain.gain.value = 0.45;
      cricketsLfo.connect(cricketsLfoGain);
      cricketsLfoGain.connect(cricketsTremolo.gain);
      cricketsLfo.start();

      cricketsSrc.connect(cricketsFilter);
      cricketsFilter.connect(cricketsTremolo);
      cricketsTremolo.connect(cricketsGain);
      cricketsSrc.start();

      // 4. 💬 CHATTING (Tea stall muffled village conversation murmur)
      const chattingGain = ctx.createGain();
      chattingGain.gain.value = 0;
      chattingGainRef.current = chattingGain;
      chattingGain.connect(masterGain);

      const chatBuf = createNoiseBuffer(8);
      const chatSrc = ctx.createBufferSource();
      chatSrc.buffer = chatBuf;
      chatSrc.loop = true;

      const chatFormant1 = ctx.createBiquadFilter();
      chatFormant1.type = 'bandpass';
      chatFormant1.frequency.value = 520;
      chatFormant1.Q.value = 4.0;

      const chatFormant2 = ctx.createBiquadFilter();
      chatFormant2.type = 'bandpass';
      chatFormant2.frequency.value = 1150;
      chatFormant2.Q.value = 3.0;

      const chatLfo = ctx.createOscillator();
      chatLfo.frequency.value = 2.4; // Speech cadence modulation
      const chatLfoGain = ctx.createGain();
      chatLfoGain.gain.value = 0.4;
      const chatModGain = ctx.createGain();
      chatModGain.gain.value = 0.8;
      chatLfo.connect(chatLfoGain);
      chatLfoGain.connect(chatModGain.gain);
      chatLfo.start();

      chatSrc.connect(chatFormant1);
      chatSrc.connect(chatFormant2);
      chatFormant1.connect(chatModGain);
      chatFormant2.connect(chatModGain);
      chatModGain.connect(chattingGain);
      chatSrc.start();

      // 5. 🔥 FIREPLACE (Wood stove warmth hum + active crackle loop)
      const fireplaceGain = ctx.createGain();
      fireplaceGain.gain.value = 0;
      fireplaceGainRef.current = fireplaceGain;
      fireplaceGain.connect(masterGain);

      const fireBuf = createNoiseBuffer(6);
      const fireSrc = ctx.createBufferSource();
      fireSrc.buffer = fireBuf;
      fireSrc.loop = true;

      const fireLowpass = ctx.createBiquadFilter();
      fireLowpass.type = 'lowpass';
      fireLowpass.frequency.value = 220;

      fireSrc.connect(fireLowpass);
      fireLowpass.connect(fireplaceGain);
      fireSrc.start();

      // 6. 🐦 BIRDS (Evening twilight forest bird calls)
      const birdsGain = ctx.createGain();
      birdsGain.gain.value = 0;
      birdsGainRef.current = birdsGain;
      birdsGain.connect(masterGain);

      // 7. 💨 WIND (Gentle swaying monsoon breeze with sweeping gust filter)
      const windGain = ctx.createGain();
      windGain.gain.value = 0;
      windGainRef.current = windGain;
      windGain.connect(masterGain);

      const windBuf = createNoiseBuffer(8);
      const windSrc = ctx.createBufferSource();
      windSrc.buffer = windBuf;
      windSrc.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 350;
      windFilter.Q.value = 1.2;

      const windLfo = ctx.createOscillator();
      windLfo.frequency.value = 0.16; // 6.2s breath cycle
      const windLfoGain = ctx.createGain();
      windLfoGain.gain.value = 180;
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      windLfo.start();

      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      windSrc.start();

      // 8. ☕ KETTLE (Tea stall brass kettle steam hiss)
      const kettleGain = ctx.createGain();
      kettleGain.gain.value = 0;
      kettleGainRef.current = kettleGain;
      kettleGain.connect(masterGain);

      const steamBuf = createNoiseBuffer(6);
      const steamSrc = ctx.createBufferSource();
      steamSrc.buffer = steamBuf;
      steamSrc.loop = true;

      const steamFilter = ctx.createBiquadFilter();
      steamFilter.type = 'bandpass';
      steamFilter.frequency.value = 2700;
      steamFilter.Q.value = 1.4;

      steamSrc.connect(steamFilter);
      steamFilter.connect(kettleGain);
      steamSrc.start();

      // 9. 🥄 GLASS CLINK (Tea glass spoon stirring resonance)
      const glassClinkGain = ctx.createGain();
      glassClinkGain.gain.value = 0;
      glassClinkGainRef.current = glassClinkGain;
      glassClinkGain.connect(masterGain);

      return ctx;
    } catch (e) {
      console.warn('Web Audio synthesis initialization:', e);
      return null;
    }
  };

  // Helper: Play a single thunder strike
  const playThunderStrike = () => {
    const ctx = initAudio();
    if (!ctx || !thunderGainRef.current) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const tFilter = ctx.createBiquadFilter();
      const tGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(50, now);
      osc.frequency.exponentialRampToValueAtTime(24, now + 3.4);

      tFilter.type = 'lowpass';
      tFilter.frequency.value = 90;

      tGain.gain.setValueAtTime(0.001, now);
      tGain.gain.exponentialRampToValueAtTime(0.55, now + 0.6);
      tGain.gain.exponentialRampToValueAtTime(0.2, now + 2.0);
      tGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

      osc.connect(tFilter);
      tFilter.connect(tGain);
      tGain.connect(thunderGainRef.current);

      osc.start(now);
      osc.stop(now + 4.3);
    } catch (e) {}
  };

  // Helper: Play a single bird call
  const playBirdCall = () => {
    const ctx = initAudio();
    if (!ctx || !birdsGainRef.current) return;
    try {
      const now = ctx.currentTime;
      const baseFreq = 2200 + Math.random() * 500;
      const osc = ctx.createOscillator();
      const bGain = ctx.createGain();
      osc.type = 'sine';

      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, now + 0.08);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, now + 0.18);

      bGain.gain.setValueAtTime(0.001, now);
      bGain.gain.exponentialRampToValueAtTime(0.3, now + 0.03);
      bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      osc.connect(bGain);
      bGain.connect(birdsGainRef.current);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  };

  // Helper: Play a wood fire pop
  const playFirePop = () => {
    const ctx = initAudio();
    if (!ctx || !fireplaceGainRef.current) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const pFilter = ctx.createBiquadFilter();
      const pGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260 + Math.random() * 380, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.035);

      pFilter.type = 'bandpass';
      pFilter.frequency.value = 1350;

      pGain.gain.setValueAtTime(0.001, now);
      pGain.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
      pGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(pFilter);
      pFilter.connect(pGain);
      pGain.connect(fireplaceGainRef.current);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  };

  // Helper: Play a tea glass clink
  const playGlassClink = () => {
    const ctx = initAudio();
    if (!ctx || !glassClinkGainRef.current) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2950 + Math.random() * 180, now);

      g.gain.setValueAtTime(0.001, now);
      g.gain.exponentialRampToValueAtTime(0.24, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(g);
      g.connect(glassClinkGainRef.current);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch (e) {}
  };

  // Thunder loop when active
  useEffect(() => {
    if (thunderActive) {
      initAudio();
      playThunderStrike(); // Play immediately on click!

      const loop = () => {
        if (!thunderActiveRef.current) return;
        playThunderStrike();
        const nextTime = 9000 + Math.random() * 12000;
        thunderLoopRef.current = setTimeout(loop, nextTime);
      };
      const initialDelay = 10000 + Math.random() * 4000;
      thunderLoopRef.current = setTimeout(loop, initialDelay);
    } else {
      if (thunderLoopRef.current) clearTimeout(thunderLoopRef.current);
    }
    return () => {
      if (thunderLoopRef.current) clearTimeout(thunderLoopRef.current);
    };
  }, [thunderActive]);

  // Birds loop when active
  useEffect(() => {
    if (birdsActive) {
      initAudio();
      playBirdCall(); // Chirp immediately on click!

      const loop = () => {
        if (!birdsActiveRef.current) return;
        playBirdCall();
        const nextTime = 2500 + Math.random() * 3800;
        birdsLoopRef.current = setTimeout(loop, nextTime);
      };
      birdsLoopRef.current = setTimeout(loop, 2800);
    } else {
      if (birdsLoopRef.current) clearTimeout(birdsLoopRef.current);
    }
    return () => {
      if (birdsLoopRef.current) clearTimeout(birdsLoopRef.current);
    };
  }, [birdsActive]);

  // Fireplace pop loop when active
  useEffect(() => {
    if (fireplaceActive) {
      initAudio();
      playFirePop();

      const loop = () => {
        if (!fireplaceActiveRef.current) return;
        playFirePop();
        const nextTime = 220 + Math.random() * 650;
        fireplaceLoopRef.current = setTimeout(loop, nextTime);
      };
      fireplaceLoopRef.current = setTimeout(loop, 300);
    } else {
      if (fireplaceLoopRef.current) clearTimeout(fireplaceLoopRef.current);
    }
    return () => {
      if (fireplaceLoopRef.current) clearTimeout(fireplaceLoopRef.current);
    };
  }, [fireplaceActive]);

  // Glass clink loop when active
  useEffect(() => {
    if (glassClinkActive) {
      initAudio();
      playGlassClink();

      const loop = () => {
        if (!glassClinkActiveRef.current) return;
        playGlassClink();
        const nextTime = 8000 + Math.random() * 14000;
        glassClinkLoopRef.current = setTimeout(loop, nextTime);
      };
      glassClinkLoopRef.current = setTimeout(loop, 9000);
    } else {
      if (glassClinkLoopRef.current) clearTimeout(glassClinkLoopRef.current);
    }
    return () => {
      if (glassClinkLoopRef.current) clearTimeout(glassClinkLoopRef.current);
    };
  }, [glassClinkActive]);

  // Real-time smooth gain adjustments
  const applyGain = (gainRef, active, volume, scale = 1.0) => {
    if (!gainRef || !gainRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const targetValue = active ? Math.max(0, volume * scale) : 0;
    gainRef.current.gain.cancelScheduledValues(now);
    gainRef.current.gain.linearRampToValueAtTime(targetValue, now + 0.08);
  };

  useEffect(() => { applyGain(rainGainRef, rainActive, rainVol, 0.95); }, [rainActive, rainVol]);
  useEffect(() => { applyGain(thunderGainRef, thunderActive, thunderVol, 0.85); }, [thunderActive, thunderVol]);
  useEffect(() => { applyGain(cricketsGainRef, cricketsActive, cricketsVol, 0.65); }, [cricketsActive, cricketsVol]);
  useEffect(() => { applyGain(chattingGainRef, chattingActive, chattingVol, 0.65); }, [chattingActive, chattingVol]);
  useEffect(() => { applyGain(fireplaceGainRef, fireplaceActive, fireplaceVol, 0.7); }, [fireplaceActive, fireplaceVol]);
  useEffect(() => { applyGain(birdsGainRef, birdsActive, birdsVol, 0.6); }, [birdsActive, birdsVol]);
  useEffect(() => { applyGain(windGainRef, windActive, windVol, 0.7); }, [windActive, windVol]);
  useEffect(() => { applyGain(kettleGainRef, kettleActive, kettleVol, 0.55); }, [kettleActive, kettleVol]);
  useEffect(() => { applyGain(glassClinkGainRef, glassClinkActive, glassClinkVol, 0.65); }, [glassClinkActive, glassClinkVol]);

  // Ensure AudioContext is ready and un-suspended on any user click
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
      case 'kettle': setKettleActive(isActive); break;
      case 'glassClink': setGlassClinkActive(isActive); break;
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
      case 'kettle': setKettleActive(prev => !prev); break;
      case 'glassClink': setGlassClinkActive(prev => !prev); break;
      default: break;
    }
  };

  const applyPreset = (presetKey) => {
    ensureAudioRunning();
    setActivePreset(presetKey);

    if (presetKey === 'mazha_sandhya') {
      setRainActive(true); setRainVol(0.65);
      setThunderActive(false);
      setCricketsActive(true); setCricketsVol(0.40);
      setChattingActive(false);
      setFireplaceActive(false);
      setBirdsActive(true); setBirdsVol(0.45);
      setWindActive(true); setWindVol(0.50);
      setKettleActive(false); setGlassClinkActive(false);
    } else if (presetKey === 'chaya_samayam') {
      setRainActive(true); setRainVol(0.40);
      setThunderActive(false);
      setCricketsActive(false);
      setChattingActive(true); setChattingVol(0.55);
      setFireplaceActive(true); setFireplaceVol(0.55);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.35);
      setKettleActive(true); setKettleVol(0.45);
      setGlassClinkActive(true); setGlassClinkVol(0.40);
    } else if (presetKey === 'padhanam') {
      setRainActive(true); setRainVol(0.50);
      setThunderActive(false);
      setCricketsActive(false);
      setChattingActive(false);
      setFireplaceActive(true); setFireplaceVol(0.45);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.35);
      setKettleActive(false); setGlassClinkActive(false);
    } else if (presetKey === 'mazhakaalam') {
      setRainActive(true); setRainVol(0.85);
      setThunderActive(true); setThunderVol(0.65);
      setCricketsActive(false);
      setChattingActive(false);
      setFireplaceActive(false);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.70);
      setKettleActive(false); setGlassClinkActive(false);
    } else if (presetKey === 'raatri') {
      setRainActive(false);
      setThunderActive(false);
      setCricketsActive(true); setCricketsVol(0.60);
      setChattingActive(false);
      setFireplaceActive(true); setFireplaceVol(0.50);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.40);
      setKettleActive(false); setGlassClinkActive(false);
    } else if (presetKey === 'innathethu') {
      setRainActive(true); setRainVol(0.55);
      setThunderActive(false);
      setCricketsActive(true); setCricketsVol(0.35);
      setChattingActive(true); setChattingVol(0.35);
      setFireplaceActive(true); setFireplaceVol(0.45);
      setBirdsActive(true); setBirdsVol(0.40);
      setWindActive(true); setWindVol(0.40);
      setKettleActive(true); setKettleVol(0.35);
      setGlassClinkActive(false);
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
      setKettleActive(false);
      setGlassClinkActive(false);
      setActivePreset(null);
    } else {
      applyPreset('mazha_sandhya');
    }
  };

  return (
    <AmbienceContext.Provider value={{
      isEnabled: isAnySoundActive,
      activePreset,
      rainVol, thunderVol, cricketsVol, chattingVol, fireplaceVol, birdsVol, windVol, kettleVol, glassClinkVol,
      rainActive, thunderActive, cricketsActive, chattingActive, fireplaceActive, birdsActive, windActive, kettleActive, glassClinkActive,
      isAmbienceOpen,
      setIsAmbienceOpen,
      setRainVol, setThunderVol, setCricketsVol, setChattingVol, setFireplaceVol, setBirdsVol, setWindVol, setKettleVol, setGlassClinkVol,
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
