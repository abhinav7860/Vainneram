import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AmbienceContext = createContext(null);

export function AmbienceProvider({ children }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [rainVol, setRainVol] = useState(0.5);
  const [kettleVol, setKettleVol] = useState(0.35);
  const [radioWarmthVol, setRadioWarmthVol] = useState(0.2);
  const [isAmbienceOpen, setIsAmbienceOpen] = useState(false);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const rainGainRef = useRef(null);
  const kettleGainRef = useRef(null);
  const radioGainRef = useRef(null);
  const nodesRef = useRef([]);

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

    // 1. Rain Synthesizer (Filtered noise + random droplet bursts)
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
    rainFilter.frequency.value = 1000;
    rainFilter.Q.value = 0.8;

    const rainGain = ctx.createGain();
    rainGain.gain.value = rainVol;
    rainGainRef.current = rainGain;

    whiteNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(masterGain);
    whiteNoise.start();

    // 2. Tea Stall Kettle & Steam Synthesizer
    const steamFilter = ctx.createBiquadFilter();
    steamFilter.type = 'lowpass';
    steamFilter.frequency.value = 520;

    const kettleGain = ctx.createGain();
    kettleGain.gain.value = kettleVol;
    kettleGainRef.current = kettleGain;

    // Kettle subtle boiling resonance
    const kettleOsc = ctx.createOscillator();
    kettleOsc.type = 'sine';
    kettleOsc.frequency.value = 180;
    
    // Modulation for steam boiling
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 3.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 15;
    lfo.connect(lfoGain);
    lfoGain.connect(kettleOsc.frequency);
    lfo.start();

    kettleOsc.connect(steamFilter);
    steamFilter.connect(kettleGain);
    kettleGain.connect(masterGain);
    kettleOsc.start();

    // 3. Radio Warmth (Muted low hum & warm analog vinyl touch)
    const humOsc = ctx.createOscillator();
    humOsc.type = 'triangle';
    humOsc.frequency.value = 60; // 60Hz warm ground hum

    const radioGain = ctx.createGain();
    radioGain.gain.value = radioWarmthVol;
    radioGainRef.current = radioGain;

    humOsc.connect(radioGain);
    radioGain.connect(masterGain);
    humOsc.start();

    nodesRef.current = [whiteNoise, kettleOsc, lfo, humOsc];
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

  // Update individual volume gains
  useEffect(() => {
    if (rainGainRef.current) rainGainRef.current.gain.value = rainVol;
  }, [rainVol]);

  useEffect(() => {
    if (kettleGainRef.current) kettleGainRef.current.gain.value = kettleVol;
  }, [kettleVol]);

  useEffect(() => {
    if (radioGainRef.current) radioGainRef.current.gain.value = radioWarmthVol;
  }, [radioWarmthVol]);

  return (
    <AmbienceContext.Provider value={{
      isEnabled,
      rainVol,
      kettleVol,
      radioWarmthVol,
      isAmbienceOpen,
      setIsAmbienceOpen,
      setRainVol,
      setKettleVol,
      setRadioWarmthVol,
      toggleAmbience
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
