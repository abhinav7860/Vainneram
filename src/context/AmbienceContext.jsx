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

  const thunderTimerRef = useRef(null);
  const cricketsTimerRef = useRef(null);
  const birdsTimerRef = useRef(null);
  const fireplaceTimerRef = useRef(null);
  const glassClinkTimerRef = useRef(null);

  const isAnySoundActive = rainActive || thunderActive || cricketsActive || chattingActive || fireplaceActive || birdsActive || windActive || kettleActive || glassClinkActive;

  // Initialize Web Audio graph
  const initAudio = () => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 1.0;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    function createNoiseBuffer(seconds = 8) {
      const bufferSize = ctx.sampleRate * seconds;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      return buffer;
    }

    const rainBuffer = createNoiseBuffer(8);
    const windBuffer = createNoiseBuffer(8);
    const chatBuffer = createNoiseBuffer(8);
    const fireBuffer = createNoiseBuffer(8);

    // 1. 🌧️ മഴ / RAIN (Rain on corrugated tin roof)
    const rainNoise = ctx.createBufferSource();
    rainNoise.buffer = rainBuffer;
    rainNoise.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1150;
    rainFilter.Q.value = 0.9;

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0;
    rainGainRef.current = rainGain;

    rainNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(masterGain);
    rainNoise.start();

    // 2. ⚡ ഇടി / THUNDER (Distant rolling sub-bass thunder)
    const thunderGain = ctx.createGain();
    thunderGain.gain.value = 0;
    thunderGainRef.current = thunderGain;
    thunderGain.connect(masterGain);

    const triggerThunder = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const tFilter = ctx.createBiquadFilter();
        const tGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(46, now);
        osc.frequency.exponentialRampToValueAtTime(26, now + 3.2);

        tFilter.type = 'lowpass';
        tFilter.frequency.value = 85;

        tGain.gain.setValueAtTime(0.001, now);
        tGain.gain.exponentialRampToValueAtTime(0.5, now + 0.8);
        tGain.gain.exponentialRampToValueAtTime(0.18, now + 2.2);
        tGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(tFilter);
        tFilter.connect(tGain);
        tGain.connect(thunderGain);

        osc.start(now);
        osc.stop(now + 4.6);
      } catch (e) {}

      const nextTime = 10000 + Math.random() * 14000;
      thunderTimerRef.current = setTimeout(triggerThunder, nextTime);
    };
    thunderTimerRef.current = setTimeout(triggerThunder, 2500);

    // 3. 🦗 ചിലവീട് / CRICKETS (Night cicadas & crickets)
    const cricketsGain = ctx.createGain();
    cricketsGain.gain.value = 0;
    cricketsGainRef.current = cricketsGain;
    cricketsGain.connect(masterGain);

    const triggerCricketChirp = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 4600 + Math.random() * 280;

        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(0.14, now + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

        osc.connect(g);
        g.connect(cricketsGain);
        osc.start(now);
        osc.stop(now + 0.7);
      } catch (e) {}

      const nextCricket = 1800 + Math.random() * 3200;
      cricketsTimerRef.current = setTimeout(triggerCricketChirp, nextCricket);
    };
    cricketsTimerRef.current = setTimeout(triggerCricketChirp, 1200);

    // 4. 💬 സംസാരം / CHATTING (Distant tea stall conversational murmurs)
    const chatNoise = ctx.createBufferSource();
    chatNoise.buffer = chatBuffer;
    chatNoise.loop = true;

    // Resonant formant filters simulating human speech cadence
    const chatFilter1 = ctx.createBiquadFilter();
    chatFilter1.type = 'bandpass';
    chatFilter1.frequency.value = 580;
    chatFilter1.Q.value = 3.5;

    const chatFilter2 = ctx.createBiquadFilter();
    chatFilter2.type = 'lowpass';
    chatFilter2.frequency.value = 950;

    // Subtle slow speech envelope modulation
    const chatLfo = ctx.createOscillator();
    chatLfo.frequency.value = 1.8;
    const chatLfoGain = ctx.createGain();
    chatLfoGain.gain.value = 0.3;
    const chatModGain = ctx.createGain();
    chatModGain.gain.value = 0.7;
    chatLfo.connect(chatLfoGain);
    chatLfoGain.connect(chatModGain.gain);
    chatLfo.start();

    const chattingGain = ctx.createGain();
    chattingGain.gain.value = 0;
    chattingGainRef.current = chattingGain;

    chatNoise.connect(chatFilter1);
    chatFilter1.connect(chatFilter2);
    chatFilter2.connect(chatModGain);
    chatModGain.connect(chattingGain);
    chattingGain.connect(masterGain);
    chatNoise.start();

    // 5. 🔥 അടുപ്പ് / FIREPLACE (Wood fire crackle & stove embers)
    const fireNoise = ctx.createBufferSource();
    fireNoise.buffer = fireBuffer;
    fireNoise.loop = true;

    const fireFilter = ctx.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.value = 240;

    const fireGain = ctx.createGain();
    fireGain.gain.value = 0;
    fireGainRef.current = fireGain;

    fireNoise.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireGain.connect(masterGain);
    fireNoise.start();

    // Embers pop synthesizer
    const triggerPop = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
      try {
        const now = ctx.currentTime;
        const popOsc = ctx.createOscillator();
        const pFilter = ctx.createBiquadFilter();
        const pGain = ctx.createGain();

        popOsc.type = 'triangle';
        popOsc.frequency.setValueAtTime(250 + Math.random() * 400, now);
        popOsc.frequency.exponentialRampToValueAtTime(60, now + 0.04);

        pFilter.type = 'bandpass';
        pFilter.frequency.value = 1400;

        pGain.gain.setValueAtTime(0.001, now);
        pGain.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
        pGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        popOsc.connect(pFilter);
        pFilter.connect(pGain);
        pGain.connect(fireGain);

        popOsc.start(now);
        popOsc.stop(now + 0.06);
      } catch (e) {}

      const nextPop = 300 + Math.random() * 900;
      fireplaceTimerRef.current = setTimeout(triggerPop, nextPop);
    };
    fireplaceTimerRef.current = setTimeout(triggerPop, 500);

    // 6. 🐦 പക്ഷികൾ / BIRDS (Evening twilight forest birds)
    const birdsGain = ctx.createGain();
    birdsGain.gain.value = 0;
    birdsGainRef.current = birdsGain;
    birdsGain.connect(masterGain);

    const triggerBirdCall = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
      try {
        const now = ctx.currentTime;
        const baseFreq = 2400 + Math.random() * 600;
        
        // Two-tone melody chirp
        const osc = ctx.createOscillator();
        const bGain = ctx.createGain();
        osc.type = 'sine';

        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.25, now + 0.08);
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.95, now + 0.18);

        bGain.gain.setValueAtTime(0.001, now);
        bGain.gain.exponentialRampToValueAtTime(0.25, now + 0.04);
        bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc.connect(bGain);
        bGain.connect(birdsGain);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {}

      const nextBird = 2500 + Math.random() * 5000;
      birdsTimerRef.current = setTimeout(triggerBirdCall, nextBird);
    };
    birdsTimerRef.current = setTimeout(triggerBirdCall, 2000);

    // 7. 💨 കാറ്റ് / WIND (Gentle swaying monsoon breeze)
    const windNoise = ctx.createBufferSource();
    windNoise.buffer = windBuffer;
    windNoise.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 320;
    windFilter.Q.value = 1.1;

    // Slow wind gust LFO
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.18; // 5.5 second breath cycle
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 160;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);
    windLfo.start();

    const windGain = ctx.createGain();
    windGain.gain.value = 0;
    windGainRef.current = windGain;

    windNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    windNoise.start();

    // 8. ☕ കെറ്റിൽ / KETTLE (Steady gentle tea kettle steam hiss)
    const steamNoise = ctx.createBufferSource();
    steamNoise.buffer = createNoiseBuffer(8);
    steamNoise.loop = true;

    const steamFilter = ctx.createBiquadFilter();
    steamFilter.type = 'bandpass';
    steamFilter.frequency.value = 2650;
    steamFilter.Q.value = 1.3;

    const kettleGain = ctx.createGain();
    kettleGain.gain.value = 0;
    kettleGainRef.current = kettleGain;

    steamNoise.connect(steamFilter);
    steamFilter.connect(kettleGain);
    kettleGain.connect(masterGain);
    steamNoise.start();

    // 9. 🥄 ഗ്ലാസ് അടി / GLASS CLINK & STIR (Periodic tea glass clink)
    const glassClinkGain = ctx.createGain();
    glassClinkGain.gain.value = 0;
    glassClinkGainRef.current = glassClinkGain;
    glassClinkGain.connect(masterGain);

    const triggerGlassClink = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2950 + Math.random() * 180, now);

        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(0.22, now + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

        osc.connect(g);
        g.connect(glassClinkGain);
        osc.start(now);
        osc.stop(now + 0.26);
      } catch (e) {}

      const nextClink = 11000 + Math.random() * 17000;
      glassClinkTimerRef.current = setTimeout(triggerGlassClink, nextClink);
    };
    glassClinkTimerRef.current = setTimeout(triggerGlassClink, 3500);

    return ctx;
  };

  const applyGain = (gainRef, active, volume, scale = 1.0) => {
    if (!gainRef || !gainRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const targetValue = active ? Math.max(0, volume * scale) : 0;
    gainRef.current.gain.cancelScheduledValues(now);
    gainRef.current.gain.linearRampToValueAtTime(targetValue, now + 0.08);
  };

  // Real-time gain hooks
  useEffect(() => {
    applyGain(rainGainRef, rainActive, rainVol, 0.9);
  }, [rainActive, rainVol]);

  useEffect(() => {
    applyGain(thunderGainRef, thunderActive, thunderVol, 0.75);
  }, [thunderActive, thunderVol]);

  useEffect(() => {
    applyGain(cricketsGainRef, cricketsActive, cricketsVol, 0.4);
  }, [cricketsActive, cricketsVol]);

  useEffect(() => {
    applyGain(chattingGainRef, chattingActive, chattingVol, 0.45);
  }, [chattingActive, chattingVol]);

  useEffect(() => {
    applyGain(fireplaceGainRef, fireplaceActive, fireplaceVol, 0.6);
  }, [fireplaceActive, fireplaceVol]);

  useEffect(() => {
    applyGain(birdsGainRef, birdsActive, birdsVol, 0.5);
  }, [birdsActive, birdsVol]);

  useEffect(() => {
    applyGain(windGainRef, windActive, windVol, 0.65);
  }, [windActive, windVol]);

  useEffect(() => {
    applyGain(kettleGainRef, kettleActive, kettleVol, 0.5);
  }, [kettleActive, kettleVol]);

  useEffect(() => {
    applyGain(glassClinkGainRef, glassClinkActive, glassClinkVol, 0.55);
  }, [glassClinkActive, glassClinkVol]);

  // Set individual sound state directly
  const setSoundActive = (soundKey, isActive) => {
    initAudio();
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

  // Toggle individual sound effect
  const toggleSound = (soundKey) => {
    initAudio();

    switch (soundKey) {
      case 'rain':
        setRainActive(prev => !prev);
        break;
      case 'thunder':
        setThunderActive(prev => !prev);
        break;
      case 'crickets':
        setCricketsActive(prev => !prev);
        break;
      case 'chatting':
        setChattingActive(prev => !prev);
        break;
      case 'fireplace':
        setFireplaceActive(prev => !prev);
        break;
      case 'birds':
        setBirdsActive(prev => !prev);
        break;
      case 'wind':
        setWindActive(prev => !prev);
        break;
      case 'kettle':
        setKettleActive(prev => !prev);
        break;
      case 'glassClink':
        setGlassClinkActive(prev => !prev);
        break;
      default:
        break;
    }
  };

  // Presets matching the user's top bar:
  // മഴ സന്ധ്യ, ചായ സമയം, പഠനം, മഴക്കാലം, രാത്രി, ഇന്നത്തേത്
  const applyPreset = (presetKey) => {
    initAudio();
    setActivePreset(presetKey);

    if (presetKey === 'mazha_sandhya') {
      // 🌧️ മഴ സന്ധ്യ (Rainy Dusk): Rain + Wind + Birds + Crickets
      setRainActive(true); setRainVol(0.65);
      setThunderActive(false);
      setCricketsActive(true); setCricketsVol(0.40);
      setChattingActive(false);
      setFireplaceActive(false);
      setBirdsActive(true); setBirdsVol(0.45);
      setWindActive(true); setWindVol(0.50);
    } else if (presetKey === 'chaya_samayam') {
      // ☕ ചായ സമയം (Tea Time): Fireplace + Chatting + Gentle Rain + Wind
      setRainActive(true); setRainVol(0.40);
      setThunderActive(false);
      setCricketsActive(false);
      setChattingActive(true); setChattingVol(0.55);
      setFireplaceActive(true); setFireplaceVol(0.60);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.35);
    } else if (presetKey === 'padhanam') {
      // 📖 പഠനം (Study / Focus): Rain + Fireplace + Gentle Wind
      setRainActive(true); setRainVol(0.50);
      setThunderActive(false);
      setCricketsActive(false);
      setChattingActive(false);
      setFireplaceActive(true); setFireplaceVol(0.45);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.35);
    } else if (presetKey === 'mazhakaalam') {
      // ⛈️ മഴക്കാലം (Heavy Monsoon): Rain + Thunder + Wind
      setRainActive(true); setRainVol(0.85);
      setThunderActive(true); setThunderVol(0.65);
      setCricketsActive(false);
      setChattingActive(false);
      setFireplaceActive(false);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.70);
    } else if (presetKey === 'raatri') {
      // 🌙 രാത്രി (Night): Crickets + Wind + Fireplace
      setRainActive(false);
      setThunderActive(false);
      setCricketsActive(true); setCricketsVol(0.60);
      setChattingActive(false);
      setFireplaceActive(true); setFireplaceVol(0.50);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.40);
    } else if (presetKey === 'innathethu') {
      // ✨ ഇന്നത്തേത് (Today's Vibe): All harmonious tea-stall elements
      setRainActive(true); setRainVol(0.55);
      setThunderActive(false);
      setCricketsActive(true); setCricketsVol(0.35);
      setChattingActive(true); setChattingVol(0.35);
      setFireplaceActive(true); setFireplaceVol(0.50);
      setBirdsActive(true); setBirdsVol(0.40);
      setWindActive(true); setWindVol(0.40);
    }
  };

  const toggleAmbience = () => {
    initAudio();
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
