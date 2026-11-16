import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AmbienceContext = createContext(null);

export function AmbienceProvider({ children }) {
  // Individual ON/OFF switches for each sound effect (default off until user turns them on or selects a preset)
  const [rainActive, setRainActive] = useState(false);
  const [thunderActive, setThunderActive] = useState(false);
  const [kettleActive, setKettleActive] = useState(false);
  const [glassClinkActive, setGlassClinkActive] = useState(false);
  const [sizzleActive, setSizzleActive] = useState(false);
  const [radioWarmthActive, setRadioWarmthActive] = useState(false);
  const [cricketsActive, setCricketsActive] = useState(false);

  // Volume levels (0 to 1)
  const [rainVol, setRainVol] = useState(0.55);
  const [thunderVol, setThunderVol] = useState(0.4);
  const [kettleVol, setKettleVol] = useState(0.45);
  const [glassClinkVol, setGlassClinkVol] = useState(0.3);
  const [sizzleVol, setSizzleVol] = useState(0.25);
  const [radioWarmthVol, setRadioWarmthVol] = useState(0.25);
  const [cricketsVol, setCricketsVol] = useState(0.25);

  const [activePreset, setActivePreset] = useState(null);
  const [isAmbienceOpen, setIsAmbienceOpen] = useState(false);

  // Web Audio refs
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const rainGainRef = useRef(null);
  const thunderGainRef = useRef(null);
  const kettleGainRef = useRef(null);
  const glassGainRef = useRef(null);
  const sizzleGainRef = useRef(null);
  const radioGainRef = useRef(null);
  const cricketsGainRef = useRef(null);

  const thunderTimerRef = useRef(null);
  const glassTimerRef = useRef(null);
  const cricketsTimerRef = useRef(null);

  // Any sound currently active?
  const isAnySoundActive = rainActive || thunderActive || kettleActive || glassClinkActive || sizzleActive || radioWarmthActive || cricketsActive;

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

    // Master Gain Bus (stays at 1.0 so any individual sound plays directly)
    const masterGain = ctx.createGain();
    masterGain.gain.value = 1.0;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Generate dedicated independent noise buffers (8 seconds to completely avoid short loop repetition)
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
    const kettleSteamBuffer = createNoiseBuffer(8);
    const sizzleBuffer = createNoiseBuffer(8);

    // 1. 🌧️ Rain Synthesizer (steady gentle rain on tin roof)
    const rainNoise = ctx.createBufferSource();
    rainNoise.buffer = rainBuffer;
    rainNoise.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1100;
    rainFilter.Q.value = 0.9;

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0;
    rainGainRef.current = rainGain;

    rainNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(masterGain);
    rainNoise.start();

    // 2. ⚡ Distant Monsoon Thunder (deep rolling sub-bass rumble)
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
        osc.frequency.setValueAtTime(45, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 3.2);

        tFilter.type = 'lowpass';
        tFilter.frequency.value = 85;

        tGain.gain.setValueAtTime(0.001, now);
        tGain.gain.exponentialRampToValueAtTime(0.5, now + 0.8);
        tGain.gain.exponentialRampToValueAtTime(0.2, now + 2.2);
        tGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(tFilter);
        tFilter.connect(tGain);
        tGain.connect(thunderGain);

        osc.start(now);
        osc.stop(now + 4.6);
      } catch (e) {}

      const nextTime = 12000 + Math.random() * 15000;
      thunderTimerRef.current = setTimeout(triggerThunder, nextTime);
    };
    thunderTimerRef.current = setTimeout(triggerThunder, 3000);

    // 3. ☕ Kettle & Steaming Chai (100% steady, smooth, non-oscillating steam hiss - NO pitch modulation, NO ripple)
    const steamNoise = ctx.createBufferSource();
    steamNoise.buffer = kettleSteamBuffer;
    steamNoise.loop = true;

    // Dual lowpass/bandpass filters for soft, warm, natural continuous steam hiss
    const steamFilter1 = ctx.createBiquadFilter();
    steamFilter1.type = 'bandpass';
    steamFilter1.frequency.value = 2400;
    steamFilter1.Q.value = 1.0;

    const steamFilter2 = ctx.createBiquadFilter();
    steamFilter2.type = 'lowpass';
    steamFilter2.frequency.value = 3500;

    const kettleGain = ctx.createGain();
    kettleGain.gain.value = 0;
    kettleGainRef.current = kettleGain;

    steamNoise.connect(steamFilter1);
    steamFilter1.connect(steamFilter2);
    steamFilter2.connect(kettleGain);
    kettleGain.connect(masterGain);
    steamNoise.start();

    // 4. 🥢 Tea Glass Clinking & Stirring (Kerala tea stall spoon & glass)
    const glassGain = ctx.createGain();
    glassGain.gain.value = 0;
    glassGainRef.current = glassGain;
    glassGain.connect(masterGain);

    const triggerGlassClink = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
      try {
        const now = ctx.currentTime;
        const freqs = [2200, 2750, 3200, 4100];
        const f = freqs[Math.floor(Math.random() * freqs.length)];

        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;

        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(g);
        g.connect(glassGain);
        osc.start(now);
        osc.stop(now + 0.38);

        // Double tap sometimes
        if (Math.random() > 0.45) {
          setTimeout(() => {
            if (!audioCtxRef.current) return;
            const now2 = ctx.currentTime;
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.value = f * 1.05;
            g2.gain.setValueAtTime(0.18, now2);
            g2.gain.exponentialRampToValueAtTime(0.0001, now2 + 0.22);
            osc2.connect(g2);
            g2.connect(glassGain);
            osc2.start(now2);
            osc2.stop(now2 + 0.25);
          }, 110);
        }
      } catch (e) {}

      const nextClink = 3500 + Math.random() * 6000;
      glassTimerRef.current = setTimeout(triggerGlassClink, nextClink);
    };
    glassTimerRef.current = setTimeout(triggerGlassClink, 2000);

    // 5. 🍳 Parippuvada Hot Oil Sizzle (crisp frying crackle)
    const sizzleNoise = ctx.createBufferSource();
    sizzleNoise.buffer = sizzleBuffer;
    sizzleNoise.loop = true;

    const sizzleFilter = ctx.createBiquadFilter();
    sizzleFilter.type = 'bandpass';
    sizzleFilter.frequency.value = 3400;
    sizzleFilter.Q.value = 1.4;

    const sizzleGain = ctx.createGain();
    sizzleGain.gain.value = 0;
    sizzleGainRef.current = sizzleGain;

    sizzleNoise.connect(sizzleFilter);
    sizzleFilter.connect(sizzleGain);
    sizzleGain.connect(masterGain);
    sizzleNoise.start();

    // 6. 📻 Transistor Radio Warmth (steady 1970s radio ground warmth)
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.value = 60;

    const radioGain = ctx.createGain();
    radioGain.gain.value = 0;
    radioGainRef.current = radioGain;

    humOsc.connect(radioGain);
    radioGain.connect(masterGain);
    humOsc.start();

    // 7. 🦗 Night Crickets & Breeze
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
        osc.frequency.value = 4600 + Math.random() * 250;

        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        osc.connect(g);
        g.connect(cricketsGain);
        osc.start(now);
        osc.stop(now + 0.65);
      } catch (e) {}

      const nextCricket = 2200 + Math.random() * 4000;
      cricketsTimerRef.current = setTimeout(triggerCricketChirp, nextCricket);
    };
    cricketsTimerRef.current = setTimeout(triggerCricketChirp, 1800);

    return ctx;
  };

  // Helper to safely set gain
  const applyGain = (gainRef, active, volume, scale = 1.0) => {
    if (!gainRef || !gainRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const targetValue = active ? Math.max(0, volume * scale) : 0;
    gainRef.current.gain.cancelScheduledValues(now);
    gainRef.current.gain.linearRampToValueAtTime(targetValue, now + 0.08);
  };

  // Update gains whenever active or volume changes
  useEffect(() => {
    applyGain(rainGainRef, rainActive, rainVol, 0.9);
  }, [rainActive, rainVol]);

  useEffect(() => {
    applyGain(thunderGainRef, thunderActive, thunderVol, 0.7);
  }, [thunderActive, thunderVol]);

  useEffect(() => {
    applyGain(kettleGainRef, kettleActive, kettleVol, 0.6);
  }, [kettleActive, kettleVol]);

  useEffect(() => {
    applyGain(glassGainRef, glassClinkActive, glassClinkVol, 0.45);
  }, [glassClinkActive, glassClinkVol]);

  useEffect(() => {
    applyGain(sizzleGainRef, sizzleActive, sizzleVol, 0.4);
  }, [sizzleActive, sizzleVol]);

  useEffect(() => {
    applyGain(radioGainRef, radioWarmthActive, radioWarmthVol, 0.35);
  }, [radioWarmthActive, radioWarmthVol]);

  useEffect(() => {
    applyGain(cricketsGainRef, cricketsActive, cricketsVol, 0.35);
  }, [cricketsActive, cricketsVol]);

  // Turn individual sound ON or OFF directly without needing master button
  const toggleSound = (soundKey) => {
    initAudio();

    switch (soundKey) {
      case 'rain':
        setRainActive(prev => !prev);
        break;
      case 'thunder':
        setThunderActive(prev => !prev);
        break;
      case 'kettle':
        setKettleActive(prev => !prev);
        break;
      case 'glassClink':
        setGlassClinkActive(prev => !prev);
        break;
      case 'sizzle':
        setSizzleActive(prev => !prev);
        break;
      case 'radio':
        setRadioWarmthActive(prev => !prev);
        break;
      case 'crickets':
        setCricketsActive(prev => !prev);
        break;
      default:
        break;
    }
  };

  // Master Toggle: If any sound is on, turn ALL off. If all off, turn recommended default sounds on!
  const toggleAmbience = () => {
    initAudio();
    if (isAnySoundActive) {
      // Turn all off
      setRainActive(false);
      setThunderActive(false);
      setKettleActive(false);
      setGlassClinkActive(false);
      setSizzleActive(false);
      setRadioWarmthActive(false);
      setCricketsActive(false);
      setActivePreset(null);
    } else {
      // Turn on gentle tea stall default
      setRainActive(true);
      setKettleActive(true);
      setGlassClinkActive(true);
      setActivePreset('busy_stall');
    }
  };

  // Presets
  const applyPreset = (presetKey) => {
    initAudio();
    setActivePreset(presetKey);

    if (presetKey === 'heavy_rain') {
      setRainActive(true); setRainVol(0.85);
      setThunderActive(true); setThunderVol(0.65);
      setKettleActive(true); setKettleVol(0.2);
      setGlassClinkActive(false);
      setSizzleActive(true); setSizzleVol(0.15);
      setRadioWarmthActive(true); setRadioWarmthVol(0.2);
      setCricketsActive(false);
    } else if (presetKey === 'busy_stall') {
      setRainActive(true); setRainVol(0.35);
      setThunderActive(false);
      setKettleActive(true); setKettleVol(0.6);
      setGlassClinkActive(true); setGlassClinkVol(0.6);
      setSizzleActive(true); setSizzleVol(0.5);
      setRadioWarmthActive(true); setRadioWarmthVol(0.35);
      setCricketsActive(true); setCricketsVol(0.1);
    } else if (presetKey === 'quiet_night') {
      setRainActive(true); setRainVol(0.4);
      setThunderActive(true); setThunderVol(0.15);
      setKettleActive(true); setKettleVol(0.25);
      setGlassClinkActive(true); setGlassClinkVol(0.15);
      setSizzleActive(false);
      setRadioWarmthActive(true); setRadioWarmthVol(0.15);
      setCricketsActive(true); setCricketsVol(0.55);
    } else if (presetKey === 'retro_radio') {
      setRainActive(true); setRainVol(0.3);
      setThunderActive(false);
      setKettleActive(true); setKettleVol(0.3);
      setGlassClinkActive(true); setGlassClinkVol(0.25);
      setSizzleActive(false);
      setRadioWarmthActive(true); setRadioWarmthVol(0.75);
      setCricketsActive(false);
    }
  };

  return (
    <AmbienceContext.Provider value={{
      isEnabled: isAnySoundActive,
      activePreset,
      rainVol, thunderVol, kettleVol, glassClinkVol, sizzleVol, radioWarmthVol, cricketsVol,
      rainActive, thunderActive, kettleActive, glassClinkActive, sizzleActive, radioWarmthActive, cricketsActive,
      isAmbienceOpen,
      setIsAmbienceOpen,
      setRainVol, setThunderVol, setKettleVol, setGlassClinkVol, setSizzleVol, setRadioWarmthVol, setCricketsVol,
      toggleAmbience,
      toggleSound,
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
