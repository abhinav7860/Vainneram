import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AmbienceContext = createContext(null);

export function AmbienceProvider({ children }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [activePreset, setActivePreset] = useState('tea_stall');

  // Sound effect volume levels (0 to 1)
  const [rainVol, setRainVol] = useState(0.55);
  const [thunderVol, setThunderVol] = useState(0.35);
  const [kettleVol, setKettleVol] = useState(0.4);
  const [glassClinkVol, setGlassClinkVol] = useState(0.3);
  const [sizzleVol, setSizzleVol] = useState(0.25);
  const [radioWarmthVol, setRadioWarmthVol] = useState(0.25);
  const [cricketsVol, setCricketsVol] = useState(0.2);

  // Individual ON/OFF switches for each sound effect
  const [rainActive, setRainActive] = useState(true);
  const [thunderActive, setThunderActive] = useState(true);
  const [kettleActive, setKettleActive] = useState(true);
  const [glassClinkActive, setGlassClinkActive] = useState(true);
  const [sizzleActive, setSizzleActive] = useState(true);
  const [radioWarmthActive, setRadioWarmthActive] = useState(true);
  const [cricketsActive, setCricketsActive] = useState(true);

  const [isAmbienceOpen, setIsAmbienceOpen] = useState(false);

  // Web Audio graph refs
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const rainGainRef = useRef(null);
  const thunderGainRef = useRef(null);
  const kettleGainRef = useRef(null);
  const glassGainRef = useRef(null);
  const sizzleGainRef = useRef(null);
  const radioGainRef = useRef(null);
  const cricketsGainRef = useRef(null);

  const timersRef = useRef([]);

  // Initialize Web Audio graph
  const initAudio = () => {
    if (audioCtxRef.current) return audioCtxRef.current;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // 1. Rain Synthesizer (Filtered noise + random droplet bursts on corrugated tin)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1100;
    rainFilter.Q.value = 0.9;

    const rainGain = ctx.createGain();
    rainGain.gain.value = rainActive ? rainVol : 0;
    rainGainRef.current = rainGain;

    whiteNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(masterGain);
    whiteNoise.start();

    // 2. Distant Monsoon Thunder (Occasional deep low frequency rolls)
    const thunderGain = ctx.createGain();
    thunderGain.gain.value = thunderActive ? thunderVol : 0;
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
        osc.frequency.exponentialRampToValueAtTime(30, now + 3);

        tFilter.type = 'lowpass';
        tFilter.frequency.value = 90;

        tGain.gain.setValueAtTime(0.001, now);
        tGain.gain.exponentialRampToValueAtTime(0.6, now + 0.8);
        tGain.gain.exponentialRampToValueAtTime(0.2, now + 2.2);
        tGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(tFilter);
        tFilter.connect(tGain);
        tGain.connect(thunderGain);

        osc.start(now);
        osc.stop(now + 4.6);
      } catch (e) {}

      // Schedule next thunder in 12-25 seconds
      const nextTime = 12000 + Math.random() * 15000;
      const tId = setTimeout(triggerThunder, nextTime);
      timersRef.current.push(tId);
    };
    const tInit = setTimeout(triggerThunder, 4000);
    timersRef.current.push(tInit);

    // 3. Kettle & Steaming Chai (Steady tea kettle steam hiss + heavy brass pot warmth - no ripple)
    // Continuous steam hiss through the spout
    const steamNoise = ctx.createBufferSource();
    steamNoise.buffer = noiseBuffer;
    steamNoise.loop = true;

    const steamFilter = ctx.createBiquadFilter();
    steamFilter.type = 'bandpass';
    steamFilter.frequency.value = 2800;
    steamFilter.Q.value = 1.4;

    const steamSubFilter = ctx.createBiquadFilter();
    steamSubFilter.type = 'lowpass';
    steamSubFilter.frequency.value = 4200;

    const steamGain = ctx.createGain();
    steamGain.gain.value = 0.45;

    steamNoise.connect(steamFilter);
    steamFilter.connect(steamSubFilter);
    steamSubFilter.connect(steamGain);

    // Deep, steady heavy brass tea vessel stove body resonance (pure steady tone, no wobble or ripple)
    const kettleBody = ctx.createOscillator();
    kettleBody.type = 'sine';
    kettleBody.frequency.value = 115;

    const kettleBodyFilter = ctx.createBiquadFilter();
    kettleBodyFilter.type = 'lowpass';
    kettleBodyFilter.frequency.value = 160;

    const kettleBodyGain = ctx.createGain();
    kettleBodyGain.gain.value = 0.1;

    kettleBody.connect(kettleBodyFilter);
    kettleBodyFilter.connect(kettleBodyGain);

    const kettleGain = ctx.createGain();
    kettleGain.gain.value = kettleActive ? kettleVol : 0;
    kettleGainRef.current = kettleGain;

    steamGain.connect(kettleGain);
    kettleBodyGain.connect(kettleGain);
    kettleGain.connect(masterGain);

    steamNoise.start();
    kettleBody.start();

    // 4. Tea Glass Clinking & Stirring (Rhythmic metallic spoons & glasses)
    const glassGain = ctx.createGain();
    glassGain.gain.value = glassActiveToGain();
    glassGainRef.current = glassGain;
    glassGain.connect(masterGain);

    function glassActiveToGain() {
      return glassClinkActive ? glassClinkVol * 0.45 : 0;
    }

    const triggerGlassClink = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
      try {
        const now = ctx.currentTime;
        const freqs = [2100, 2650, 3180, 4200];
        const f = freqs[Math.floor(Math.random() * freqs.length)];

        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;

        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(g);
        g.connect(glassGain);
        osc.start(now);
        osc.stop(now + 0.38);

        // Double clink sometimes
        if (Math.random() > 0.4) {
          setTimeout(() => {
            if (!audioCtxRef.current) return;
            const now2 = ctx.currentTime;
            const osc2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.value = f * 1.08;
            g2.gain.setValueAtTime(0.2, now2);
            g2.gain.exponentialRampToValueAtTime(0.0001, now2 + 0.25);
            osc2.connect(g2);
            g2.connect(glassGain);
            osc2.start(now2);
            osc2.stop(now2 + 0.28);
          }, 120);
        }
      } catch (e) {}

      const nextClink = 3000 + Math.random() * 6000;
      const gId = setTimeout(triggerGlassClink, nextClink);
      timersRef.current.push(gId);
    };
    const gInit = setTimeout(triggerGlassClink, 2500);
    timersRef.current.push(gInit);

    // 5. Parippuvada Hot Oil Sizzle (Crispy fryer crackle)
    const sizzleNoise = ctx.createBufferSource();
    sizzleNoise.buffer = noiseBuffer;
    sizzleNoise.loop = true;

    const sizzleFilter = ctx.createBiquadFilter();
    sizzleFilter.type = 'bandpass';
    sizzleFilter.frequency.value = 3400;
    sizzleFilter.Q.value = 1.4;

    const sizzleGain = ctx.createGain();
    sizzleGain.gain.value = sizzleActive ? sizzleVol * 0.35 : 0;
    sizzleGainRef.current = sizzleGain;

    sizzleNoise.connect(sizzleFilter);
    sizzleFilter.connect(sizzleGain);
    sizzleGain.connect(masterGain);
    sizzleNoise.start();

    // 6. Transistor Radio Warmth (Low ground hum + vinyl texture)
    const humOsc = ctx.createOscillator();
    humOsc.type = 'triangle';
    humOsc.frequency.value = 60;

    const radioGain = ctx.createGain();
    radioGain.gain.value = radioWarmthActive ? radioWarmthVol * 0.4 : 0;
    radioGainRef.current = radioGain;

    humOsc.connect(radioGain);
    radioGain.connect(masterGain);
    humOsc.start();

    // 7. Night Crickets & Breeze (High oscillating frequency chirps)
    const cricketsGain = ctx.createGain();
    cricketsGain.gain.value = cricketsActive ? cricketsVol * 0.25 : 0;
    cricketsGainRef.current = cricketsGain;
    cricketsGain.connect(masterGain);

    const triggerCricketChirp = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 4600 + Math.random() * 300;

        const cLfo = ctx.createOscillator();
        cLfo.frequency.value = 18;
        const cLfoGain = ctx.createGain();
        cLfoGain.gain.value = 0.5;
        cLfo.connect(cLfoGain);
        cLfoGain.connect(g.gain);
        cLfo.start(now);
        cLfo.stop(now + 0.8);

        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

        osc.connect(g);
        g.connect(cricketsGain);
        osc.start(now);
        osc.stop(now + 0.85);
      } catch (e) {}

      const nextCricket = 2000 + Math.random() * 4000;
      const cId = setTimeout(triggerCricketChirp, nextCricket);
      timersRef.current.push(cId);
    };
    const cInit = setTimeout(triggerCricketChirp, 1500);
    timersRef.current.push(cInit);

    return ctx;
  };

  const toggleAmbience = () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);

    const ctx = initAudio();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }

    if (masterGainRef.current && ctx) {
      const now = ctx.currentTime;
      masterGainRef.current.gain.cancelScheduledValues(now);
      if (nextState) {
        masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
        masterGainRef.current.gain.linearRampToValueAtTime(0.7, now + 1.2);
      } else {
        masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
        masterGainRef.current.gain.linearRampToValueAtTime(0, now + 0.8);
      }
    }
  };

  // Toggle individual sound effect
  const toggleSound = (soundKey) => {
    if (!isEnabled) {
      // Auto-turn on master if user toggles a sound
      toggleAmbience();
    }

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

  // Apply atmospheric presets
  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    if (!isEnabled) {
      toggleAmbience();
    }

    if (presetKey === 'heavy_rain') {
      setRainActive(true); setRainVol(0.85);
      setThunderActive(true); setThunderVol(0.65);
      setKettleActive(true); setKettleVol(0.2);
      setGlassClinkActive(false); setGlassClinkVol(0.0);
      setSizzleActive(true); setSizzleVol(0.15);
      setRadioWarmthActive(true); setRadioWarmthVol(0.2);
      setCricketsActive(false); setCricketsVol(0.0);
    } else if (presetKey === 'busy_stall') {
      setRainActive(true); setRainVol(0.35);
      setThunderActive(false); setThunderVol(0.0);
      setKettleActive(true); setKettleVol(0.65);
      setGlassClinkActive(true); setGlassClinkVol(0.6);
      setSizzleActive(true); setSizzleVol(0.5);
      setRadioWarmthActive(true); setRadioWarmthVol(0.4);
      setCricketsActive(true); setCricketsVol(0.1);
    } else if (presetKey === 'quiet_night') {
      setRainActive(true); setRainVol(0.4);
      setThunderActive(true); setThunderVol(0.15);
      setKettleActive(true); setKettleVol(0.25);
      setGlassClinkActive(true); setGlassClinkVol(0.15);
      setSizzleActive(false); setSizzleVol(0.05);
      setRadioWarmthActive(true); setRadioWarmthVol(0.15);
      setCricketsActive(true); setCricketsVol(0.55);
    } else if (presetKey === 'retro_radio') {
      setRainActive(true); setRainVol(0.3);
      setThunderActive(false); setThunderVol(0.0);
      setKettleActive(true); setKettleVol(0.3);
      setGlassClinkActive(true); setGlassClinkVol(0.25);
      setSizzleActive(false); setSizzleVol(0.1);
      setRadioWarmthActive(true); setRadioWarmthVol(0.75);
      setCricketsActive(false); setCricketsVol(0.1);
    }
  };

  // Update gains in real time reflecting both volume and active toggle
  useEffect(() => {
    if (rainGainRef.current) rainGainRef.current.gain.value = rainActive ? rainVol : 0;
  }, [rainVol, rainActive]);

  useEffect(() => {
    if (thunderGainRef.current) thunderGainRef.current.gain.value = thunderActive ? thunderVol : 0;
  }, [thunderVol, thunderActive]);

  useEffect(() => {
    if (kettleGainRef.current) kettleGainRef.current.gain.value = kettleActive ? kettleVol : 0;
  }, [kettleVol, kettleActive]);

  useEffect(() => {
    if (glassGainRef.current) glassGainRef.current.gain.value = glassClinkActive ? glassClinkVol * 0.45 : 0;
  }, [glassClinkVol, glassClinkActive]);

  useEffect(() => {
    if (sizzleGainRef.current) sizzleGainRef.current.gain.value = sizzleActive ? sizzleVol * 0.35 : 0;
  }, [sizzleVol, sizzleActive]);

  useEffect(() => {
    if (radioGainRef.current) radioGainRef.current.gain.value = radioWarmthActive ? radioWarmthVol * 0.4 : 0;
  }, [radioWarmthVol, radioWarmthActive]);

  useEffect(() => {
    if (cricketsGainRef.current) cricketsGainRef.current.gain.value = cricketsActive ? cricketsVol * 0.25 : 0;
  }, [cricketsVol, cricketsActive]);

  return (
    <AmbienceContext.Provider value={{
      isEnabled,
      activePreset,
      rainVol, thunderVol, kettleVol, glassClinkVol, sizzleVol, radioWarmthVol, cricketsVol,
      rainActive, thunderActive, kettleActive, glassClinkActive, sizzleActive, radioWarmthActive, cricketsActive,
      isAmbienceOpen,
      setIsAmbienceOpen,
      setRainVol, setThunderVol, setKettleVol, setGlassClinkVol, setSizzleVol, setRadioWarmthVol, setCricketsVol,
      setRainActive, setThunderActive, setKettleActive, setGlassClinkActive, setSizzleActive, setRadioWarmthActive, setCricketsActive,
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
