import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AmbienceContext = createContext(null);

const SOUND_ASSETS = {
  rain: '/sounds/rain.mp3',
  thunder: '/sounds/thunder.mp3',
  crickets: '/sounds/crickets.mp3',
  chatting: '/sounds/chatting.mp3',
  fireplace: '/sounds/fireplace.mp3',
  birds: '/sounds/birds.mp3',
  wind: '/sounds/wind.mp3',
  kettle: '/sounds/kettle.mp3'
};

export function AmbienceProvider({ children }) {
  // Sound effect active states (8 environmental effects)
  const [rainActive, setRainActive] = useState(false);
  const [thunderActive, setThunderActive] = useState(false);
  const [cricketsActive, setCricketsActive] = useState(false);
  const [chattingActive, setChattingActive] = useState(false);
  const [fireplaceActive, setFireplaceActive] = useState(false);
  const [birdsActive, setBirdsActive] = useState(false);
  const [windActive, setWindActive] = useState(false);
  const [kettleActive, setKettleActive] = useState(false);

  // Volume levels (0 to 1) matching the screenshot defaults
  const [rainVol, setRainVol] = useState(0.60);
  const [thunderVol, setThunderVol] = useState(0.68);
  const [cricketsVol, setCricketsVol] = useState(0.45);
  const [chattingVol, setChattingVol] = useState(0.32);
  const [fireplaceVol, setFireplaceVol] = useState(0.55);
  const [birdsVol, setBirdsVol] = useState(0.50);
  const [windVol, setWindVol] = useState(0.35);
  const [kettleVol, setKettleVol] = useState(0.50);

  const [activePreset, setActivePreset] = useState(null);
  const [isAmbienceOpen, setIsAmbienceOpen] = useState(false);

  // Audio elements references for authentic recordings
  const audioRefs = useRef({});

  const isAnySoundActive =
    rainActive || thunderActive || cricketsActive || chattingActive ||
    fireplaceActive || birdsActive || windActive || kettleActive;

  // Initialize and preload audio elements
  useEffect(() => {
    Object.entries(SOUND_ASSETS).forEach(([key, src]) => {
      if (!audioRefs.current[key]) {
        const audio = new Audio();
        audio.src = src;
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0.5;
        audioRefs.current[key] = audio;
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach(a => {
        try { a.pause(); } catch (e) {}
      });
    };
  }, []);

  // Sync playback and volumes in real-time
  const syncSound = (key, active, vol) => {
    const audio = audioRefs.current[key];
    if (!audio) return;

    audio.volume = Math.min(1, Math.max(0, vol));

    if (active) {
      if (audio.paused) {
        audio.play().catch(err => {
          console.warn(`Audio play for ${key} paused or pending interaction:`, err.message);
        });
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  };

  useEffect(() => { syncSound('rain', rainActive, rainVol); }, [rainActive, rainVol]);
  useEffect(() => { syncSound('thunder', thunderActive, thunderVol); }, [thunderActive, thunderVol]);
  useEffect(() => { syncSound('crickets', cricketsActive, cricketsVol); }, [cricketsActive, cricketsVol]);
  useEffect(() => { syncSound('chatting', chattingActive, chattingVol); }, [chattingActive, chattingVol]);
  useEffect(() => { syncSound('fireplace', fireplaceActive, fireplaceVol); }, [fireplaceActive, fireplaceVol]);
  useEffect(() => { syncSound('birds', birdsActive, birdsVol); }, [birdsActive, birdsVol]);
  useEffect(() => { syncSound('wind', windActive, windVol); }, [windActive, windVol]);
  useEffect(() => { syncSound('kettle', kettleActive, kettleVol); }, [kettleActive, kettleVol]);

  const setSoundActive = (soundKey, isActive) => {
    switch (soundKey) {
      case 'rain': setRainActive(isActive); break;
      case 'thunder': setThunderActive(isActive); break;
      case 'crickets': setCricketsActive(isActive); break;
      case 'chatting': setChattingActive(isActive); break;
      case 'fireplace': setFireplaceActive(isActive); break;
      case 'birds': setBirdsActive(isActive); break;
      case 'wind': setWindActive(isActive); break;
      case 'kettle': setKettleActive(isActive); break;
      default: break;
    }
  };

  const toggleSound = (soundKey) => {
    switch (soundKey) {
      case 'rain': setRainActive(prev => !prev); break;
      case 'thunder': setThunderActive(prev => !prev); break;
      case 'crickets': setCricketsActive(prev => !prev); break;
      case 'chatting': setChattingActive(prev => !prev); break;
      case 'fireplace': setFireplaceActive(prev => !prev); break;
      case 'birds': setBirdsActive(prev => !prev); break;
      case 'wind': setWindActive(prev => !prev); break;
      case 'kettle': setKettleActive(prev => !prev); break;
      default: break;
    }
  };

  const applyPreset = (presetKey) => {
    // If the clicked preset is already active, toggle it OFF (reset)
    if (activePreset === presetKey) {
      setRainActive(false);
      setThunderActive(false);
      setCricketsActive(false);
      setChattingActive(false);
      setFireplaceActive(false);
      setBirdsActive(false);
      setWindActive(false);
      setKettleActive(false);
      setActivePreset(null);
      return;
    }

    setActivePreset(presetKey);

    if (presetKey === 'mazha_sandhya') {
      setRainActive(true); setRainVol(0.60);
      setThunderActive(false);
      setCricketsActive(true); setCricketsVol(0.45);
      setChattingActive(false);
      setFireplaceActive(false);
      setBirdsActive(true); setBirdsVol(0.45);
      setWindActive(true); setWindVol(0.40);
      setKettleActive(false);
    } else if (presetKey === 'chaya_samayam') {
      setRainActive(true); setRainVol(0.40);
      setThunderActive(false);
      setCricketsActive(false);
      setChattingActive(true); setChattingVol(0.50);
      setFireplaceActive(true); setFireplaceVol(0.55);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.35);
      setKettleActive(true); setKettleVol(0.50);
    } else if (presetKey === 'padhanam') {
      setRainActive(true); setRainVol(0.50);
      setThunderActive(false);
      setCricketsActive(false);
      setChattingActive(false);
      setFireplaceActive(true); setFireplaceVol(0.45);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.35);
      setKettleActive(false);
    } else if (presetKey === 'mazhakaalam') {
      setRainActive(true); setRainVol(0.85);
      setThunderActive(true); setThunderVol(0.68);
      setCricketsActive(false);
      setChattingActive(false);
      setFireplaceActive(false);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.70);
      setKettleActive(false);
    } else if (presetKey === 'raatri') {
      setRainActive(false);
      setThunderActive(false);
      setCricketsActive(true); setCricketsVol(0.55);
      setChattingActive(false);
      setFireplaceActive(true); setFireplaceVol(0.50);
      setBirdsActive(false);
      setWindActive(true); setWindVol(0.40);
      setKettleActive(false);
    } else if (presetKey === 'innathethu') {
      setRainActive(true); setRainVol(0.60);
      setThunderActive(false);
      setCricketsActive(true); setCricketsVol(0.40);
      setChattingActive(true); setChattingVol(0.35);
      setFireplaceActive(true); setFireplaceVol(0.45);
      setBirdsActive(true); setBirdsVol(0.40);
      setWindActive(true); setWindVol(0.35);
      setKettleActive(true); setKettleVol(0.40);
    }
  };

  const toggleAmbience = () => {
    if (isAnySoundActive) {
      setRainActive(false);
      setThunderActive(false);
      setCricketsActive(false);
      setChattingActive(false);
      setFireplaceActive(false);
      setBirdsActive(false);
      setWindActive(false);
      setKettleActive(false);
      setActivePreset(null);
    } else {
      applyPreset('mazha_sandhya');
    }
  };

  return (
    <AmbienceContext.Provider value={{
      isEnabled: isAnySoundActive,
      activePreset,
      rainVol, thunderVol, cricketsVol, chattingVol, fireplaceVol, birdsVol, windVol, kettleVol,
      rainActive, thunderActive, cricketsActive, chattingActive, fireplaceActive, birdsActive, windActive, kettleActive,
      isAmbienceOpen,
      setIsAmbienceOpen,
      setRainVol, setThunderVol, setCricketsVol, setChattingVol, setFireplaceVol, setBirdsVol, setWindVol, setKettleVol,
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
