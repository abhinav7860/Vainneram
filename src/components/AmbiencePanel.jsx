import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CloudRain,
  Zap,
  Bug,
  MessageSquare,
  Flame,
  Bird,
  Wind,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  ChevronDown,
  Volume2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAmbience } from '../context/AmbienceContext';
import { usePlayer } from '../context/PlayerContext';
import { api } from '../utils/api';
import { formatDuration } from '../utils/formatters';

// Animated multi-bar Equalizer component
function EqualizerBars({ active, color = '#d9822b', barCount = 14 }) {
  const delays = ['0s', '0.22s', '0.4s', '0.12s', '0.35s', '0.5s', '0.18s', '0.45s', '0.28s', '0.08s', '0.32s', '0.15s', '0.42s', '0.25s'];
  const baseHeights = [30, 65, 45, 80, 50, 90, 40, 75, 55, 85, 35, 60, 40, 70];

  return (
    <div className="flex items-end justify-center gap-[3px] h-9 w-full py-1.5 overflow-hidden">
      {Array.from({ length: barCount }).map((_, i) => {
        const targetH = baseHeights[i % baseHeights.length];
        return (
          <div
            key={i}
            className="w-[3px] rounded-full transition-all duration-300"
            style={{
              backgroundColor: color,
              opacity: active ? 0.92 : 0.22,
              height: active ? `${targetH}%` : '15%',
              animation: active
                ? `vainneram-eq 0.7s ease-in-out infinite alternate ${delays[i % delays.length]}`
                : 'none'
            }}
          />
        );
      })}
    </div>
  );
}

// Custom Toggle Switch
function Switch({ checked, onChange, labelLeft, labelRight }) {
  return (
    <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => onChange(!checked)}>
      {labelLeft && (
        <span className={`text-[11px] font-semibold tracking-wider uppercase transition-colors ${checked ? 'text-[#e5a95d]' : 'text-[#7a6a5c]'}`}>
          {labelLeft}
        </span>
      )}
      <div
        className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative ${
          checked ? 'bg-[#d9822b]' : 'bg-[#2a1f17]'
        } border border-[#3e2c20]`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-[#f7f2e8] shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      {labelRight && (
        <span className={`text-[11px] font-semibold tracking-wider uppercase transition-colors ${!checked ? 'text-[#e5a95d]' : 'text-[#7a6a5c]'}`}>
          {labelRight}
        </span>
      )}
    </div>
  );
}

export function AmbiencePanel() {
  const {
    activePreset,
    rainVol, thunderVol, cricketsVol, chattingVol, fireplaceVol, birdsVol, windVol,
    rainActive, thunderActive, cricketsActive, chattingActive, fireplaceActive, birdsActive, windActive,
    isAmbienceOpen,
    setIsAmbienceOpen,
    setRainVol, setThunderVol, setCricketsVol, setChattingVol, setFireplaceVol, setBirdsVol, setWindVol,
    toggleSound,
    setSoundActive,
    applyPreset
  } = useAmbience();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    isMuffled,
    isSpatialAudio,
    sleepTimerMinutes,
    sleepTimerRemaining,
    togglePlayPause,
    seekTo,
    setVolume,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleMuffled,
    toggleSpatialAudio,
    startSleepTimer,
    clearSleepTimer,
    playTrack
  } = usePlayer();

  // Track selector dropdown state
  const [isSongDropdownOpen, setIsSongDropdownOpen] = useState(false);
  const [libraryTracks, setLibraryTracks] = useState([]);
  const [isCustomTimerOpen, setIsCustomTimerOpen] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('');
  const dropdownRef = useRef(null);

  // Fetch library tracks for quick selection
  useEffect(() => {
    if (isAmbienceOpen) {
      api.getTracks().then(res => {
        if (res.tracks) {
          setLibraryTracks(res.tracks);
        }
      }).catch(() => {});
    }
  }, [isAmbienceOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsSongDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAmbienceOpen) return null;

  // Presets from user's image
  const presets = [
    { id: 'mazha_sandhya', label: 'മഴ സന്ധ്യ', icon: '🌧️', english: 'Rainy Dusk' },
    { id: 'chaya_samayam', label: 'ചായ സമയം', icon: '☕', english: 'Chai Time' },
    { id: 'padhanam', label: 'പഠനം', icon: '📖', english: 'Study / Focus' },
    { id: 'mazhakaalam', label: 'മഴക്കാലം', icon: '🌧️', english: 'Monsoon' },
    { id: 'raatri', label: 'രാത്രി', icon: '🌙', english: 'Night' },
    { id: 'innathethu', label: 'ഇന്നത്തേത്', icon: '✨', english: "Today's Vibe" },
  ];

  // 7 Environmental cards
  const soundCards = [
    {
      id: 'rain',
      malayalam: 'മഴ',
      english: 'RAIN',
      icon: CloudRain,
      iconColor: 'text-[#60a5fa]',
      eqColor: '#60a5fa',
      vol: rainVol,
      active: rainActive,
      setVol: setRainVol,
      toggle: () => toggleSound('rain'),
    },
    {
      id: 'thunder',
      malayalam: 'ഇടി',
      english: 'THUNDER',
      icon: Zap,
      iconColor: 'text-[#facc15]',
      eqColor: '#facc15',
      vol: thunderVol,
      active: thunderActive,
      setVol: setThunderVol,
      toggle: () => toggleSound('thunder'),
    },
    {
      id: 'crickets',
      malayalam: 'ചിലവീട്',
      english: 'CRICKETS',
      icon: Bug,
      iconColor: 'text-[#4ade80]',
      eqColor: '#4ade80',
      vol: cricketsVol,
      active: cricketsActive,
      setVol: setCricketsVol,
      toggle: () => toggleSound('crickets'),
    },
    {
      id: 'chatting',
      malayalam: 'സംസാരം',
      english: 'CHATTING',
      icon: MessageSquare,
      iconColor: 'text-[#cbd5e1]',
      eqColor: '#cbd5e1',
      vol: chattingVol,
      active: chattingActive,
      setVol: setChattingVol,
      toggle: () => toggleSound('chatting'),
    },
    {
      id: 'fireplace',
      malayalam: 'അടുപ്പ്',
      english: 'FIREPLACE',
      icon: Flame,
      iconColor: 'text-[#fb923c]',
      eqColor: '#fb923c',
      vol: fireplaceVol,
      active: fireplaceActive,
      setVol: setFireplaceVol,
      toggle: () => toggleSound('fireplace'),
    },
    {
      id: 'birds',
      malayalam: 'പക്ഷികൾ',
      english: 'BIRDS',
      icon: Bird,
      iconColor: 'text-[#c084fc]',
      eqColor: '#c084fc',
      vol: birdsVol,
      active: birdsActive,
      setVol: setBirdsVol,
      toggle: () => toggleSound('birds'),
    },
    {
      id: 'wind',
      malayalam: 'കാറ്റ്',
      english: 'WIND',
      icon: Wind,
      iconColor: 'text-[#38bdf8]',
      eqColor: '#38bdf8',
      vol: windVol,
      active: windActive,
      setVol: setWindVol,
      toggle: () => toggleSound('wind'),
    },
  ];

  // Format sleep remaining
  const formatSleepRemaining = (sec) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCustomTimerSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customMinutesInput, 10);
    if (!isNaN(val) && val > 0) {
      startSleepTimer(val);
      setIsCustomTimerOpen(false);
      setCustomMinutesInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-5xl rounded-3xl bg-[#0f0b08] border border-[#261b14] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Top Bar with Title and Close */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#211610] bg-[#120d09] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#26170d] border border-[#d9822b]/40 flex items-center justify-center text-[#d9822b] shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-vintage text-base font-bold text-[#f7f2e8] tracking-wide">
                വൈകുന്നേരം അന്തരീക്ഷം
              </h2>
              <p className="text-[11px] text-[#8c7b6f] font-mono tracking-wider">
                ATMOSPHERIC TEA STALL CONSOLE
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAmbienceOpen(false)}
            className="p-2 rounded-xl text-[#8c7b6f] hover:text-[#f7f2e8] hover:bg-[#211610] transition-colors"
            title="Close console"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* 1. PRESETS ROW */}
          <div>
            <p className="text-[10px] font-bold text-[#7a6a5c] uppercase tracking-widest mb-2.5 font-mono">
              PRESETS
            </p>
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {presets.map((preset) => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-[#291b10] border-[#d9822b] text-[#f7f2e8] shadow-md shadow-amber-950/40 ring-1 ring-[#d9822b]/50'
                        : 'bg-[#150f0b] border-[#291d15] text-[#9c897a] hover:text-[#f7f2e8] hover:border-[#3d2c20]'
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span className="font-malayalam text-xs">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SECOND ROW: SLEEP TIMER & MODIFIER TOGGLES (VIBE, SPATIAL) */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#140f0b] border border-[#261b14]">
            {/* Sleep Timer */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#7a6a5c] tracking-widest font-mono flex items-center gap-1.5 mr-1">
                <Clock className="w-3.5 h-3.5 text-[#d9822b]" />
                SLEEP
              </span>
              {[30, 60, 90].map((mins) => {
                const isCurrent = sleepTimerMinutes === mins;
                return (
                  <button
                    key={mins}
                    onClick={() => isCurrent ? clearSleepTimer() : startSleepTimer(mins)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all border ${
                      isCurrent
                        ? 'bg-[#d9822b] border-[#e5a95d] text-white shadow-sm'
                        : 'bg-[#1a130e] border-[#2e2118] text-[#8c7b6f] hover:text-[#f7f2e8] hover:border-[#423023]'
                    }`}
                  >
                    {mins}m
                  </button>
                );
              })}

              {/* Custom Timer Button */}
              <button
                onClick={() => setIsCustomTimerOpen(prev => !prev)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all border ${
                  sleepTimerMinutes && ![30, 60, 90].includes(sleepTimerMinutes)
                    ? 'bg-[#d9822b] border-[#e5a95d] text-white shadow-sm'
                    : 'bg-[#1a130e] border-[#2e2118] text-[#8c7b6f] hover:text-[#f7f2e8] hover:border-[#423023]'
                }`}
              >
                + Custom
              </button>

              {/* Remaining Countdown indicator */}
              {sleepTimerRemaining !== null && (
                <div className="flex items-center gap-1.5 ml-1 px-2.5 py-0.5 rounded-full bg-[#2a170d] border border-[#d9822b]/40 text-[#e5a95d] text-xs font-mono">
                  <span>{formatSleepRemaining(sleepTimerRemaining)}</span>
                  <button onClick={clearSleepTimer} className="hover:text-white" title="Cancel sleep timer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Vibe (Muffled) Toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={isMuffled}
                onChange={toggleMuffled}
                labelLeft="VIBE"
                labelRight="CLEAR"
              />
            </div>

            {/* Spatial Audio Toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={isSpatialAudio}
                onChange={toggleSpatialAudio}
                labelLeft="SPATIAL"
                labelRight="STEREO"
              />
            </div>
          </div>

          {/* Custom Sleep Timer Input Popover */}
          {isCustomTimerOpen && (
            <form onSubmit={handleCustomTimerSubmit} className="flex items-center gap-2 p-3 rounded-xl bg-[#1c140e] border border-[#3e2c20]">
              <span className="text-xs text-[#b8a798]">Enter minutes:</span>
              <input
                type="number"
                min="1"
                max="600"
                value={customMinutesInput}
                onChange={(e) => setCustomMinutesInput(e.target.value)}
                placeholder="45"
                className="w-20 px-2.5 py-1 rounded-lg bg-[#120d09] border border-[#2e2118] text-xs text-white focus:outline-none focus:border-[#d9822b]"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-[#d9822b] text-white text-xs font-medium hover:bg-[#e69a38]"
              >
                Set
              </button>
              <button
                type="button"
                onClick={() => setIsCustomTimerOpen(false)}
                className="p-1 text-[#8c7b6f] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. EIGHT GRID CARDS (2 rows x 4 cols on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cards 1-7: Synthesized Environmental Sounds */}
            {soundCards.map((sc) => {
              const Icon = sc.icon;
              const percent = Math.round(sc.vol * 100);

              return (
                <div
                  key={sc.id}
                  className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 ${
                    sc.active
                      ? 'bg-[#18120c] border-[#3d2a1d] shadow-lg shadow-black/40 ring-1 ring-[#d9822b]/25'
                      : 'bg-[#130e0a] border-[#221811] opacity-75 hover:opacity-100 hover:border-[#2e2118]'
                  }`}
                >
                  {/* Card Header: Icon + Titles */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`p-2 rounded-xl bg-[#1c1510] ${sc.iconColor} border border-[#2b1f16]`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-malayalam text-base font-bold text-[#f7f2e8] leading-tight">
                        {sc.malayalam}
                      </h4>
                      <p className="text-[10px] font-mono tracking-widest text-[#7a6a5c] uppercase">
                        {sc.english}
                      </p>
                    </div>
                  </div>

                  {/* Equalizer Visualizer */}
                  <div className="my-1">
                    <EqualizerBars active={sc.active} color={sc.eqColor} barCount={13} />
                  </div>

                  {/* Volume Slider */}
                  <div className="mt-2 mb-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={sc.vol}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        sc.setVol(val);
                        if (!sc.active && val > 0) {
                          setSoundActive(sc.id, true);
                        }
                      }}
                      className="w-full cursor-pointer"
                    />
                  </div>

                  {/* Card Bottom: Percentage & OFF/ON Button */}
                  <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-[#211710]">
                    <span className="text-[#8c7b6f]">{percent}%</span>
                    <button
                      onClick={sc.toggle}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider transition-colors uppercase ${
                        sc.active
                          ? 'bg-[#2b1c11] border border-[#d9822b]/50 text-[#e5a95d]'
                          : 'bg-[#18110b] border border-[#261b14] text-[#6b5c50] hover:text-[#b8a798]'
                      }`}
                    >
                      {sc.active ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Card 8: പാട്ടുകൾ / MUSIC with Mini Player & Visualizer */}
            <div
              className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 ${
                isPlaying
                  ? 'bg-[#18120c] border-[#d9822b]/40 shadow-lg shadow-amber-950/20 ring-1 ring-[#d9822b]/30'
                  : 'bg-[#130e0a] border-[#261b14]'
              }`}
            >
              {/* Card Header: Icon + Titles */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#21160d] text-[#d9822b] border border-[#3d2717]">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-malayalam text-base font-bold text-[#f7f2e8] leading-tight">
                      പാട്ടുകൾ
                    </h4>
                    <p className="text-[10px] font-mono tracking-widest text-[#7a6a5c] uppercase">
                      MUSIC
                    </p>
                  </div>
                </div>

                {/* Right side: Volume percentage badge */}
                <div className="flex flex-col items-end text-right">
                  <span className="text-xs font-mono font-bold text-[#e5a95d]">
                    {Math.round(volume * 100)}
                  </span>
                  <span className="text-[9px] font-mono text-[#6b5c50]">VOL</span>
                </div>
              </div>

              {/* Music Equalizer Visualizer */}
              <div className="my-1">
                <EqualizerBars active={isPlaying} color="#d9822b" barCount={13} />
              </div>

              {/* Track Title */}
              <div className="mt-1 mb-1.5 truncate">
                <p className="text-xs font-semibold text-[#f7f2e8] truncate" title={currentTrack?.title}>
                  {currentTrack ? currentTrack.title : 'ചായപ്പാട്ടുകൾ (Select song)'}
                </p>
                <p className="text-[10px] text-[#8c7b6f] truncate">
                  {currentTrack ? (currentTrack.artist || 'Malayalam🤍') : 'Vainneram Music'}
                </p>
              </div>

              {/* Progress Scrub Bar & Timers */}
              <div className="space-y-1 mb-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  disabled={!currentTrack}
                  className="w-full cursor-pointer disabled:opacity-30"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-[#7a6a5c]">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Transport Controls (Prev, Play, Next, Shuffle) */}
              <div className="flex items-center justify-between py-1 border-t border-[#211710]">
                <button
                  onClick={playPrevious}
                  disabled={!currentTrack}
                  className="p-1 rounded-full text-[#8c7b6f] hover:text-[#f7f2e8] disabled:opacity-30"
                  title="Previous"
                >
                  <SkipBack className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  onClick={togglePlayPause}
                  disabled={!currentTrack && libraryTracks.length === 0}
                  className="w-7 h-7 rounded-full bg-[#d9822b] hover:bg-[#e69a38] text-white flex items-center justify-center shadow-md transition-transform active:scale-95 disabled:opacity-40"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => playNext(false)}
                  disabled={!currentTrack}
                  className="p-1 rounded-full text-[#8c7b6f] hover:text-[#f7f2e8] disabled:opacity-30"
                  title="Next"
                >
                  <SkipForward className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  onClick={toggleShuffle}
                  className={`p-1 rounded transition-colors ${
                    isShuffle ? 'text-[#d9822b]' : 'text-[#6b5c50] hover:text-[#f7f2e8]'
                  }`}
                  title={isShuffle ? 'Shuffle on' : 'Shuffle off'}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Select Song Dropdown */}
              <div className="relative mt-2" ref={dropdownRef}>
                <button
                  onClick={() => setIsSongDropdownOpen(prev => !prev)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#1b130e] border border-[#2e2118] text-left text-xs text-[#d5c5b5] hover:text-white hover:border-[#423023] transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Music className="w-3 h-3 text-[#d9822b] flex-shrink-0" />
                    <span className="truncate">
                      {currentTrack ? currentTrack.title : 'Select Song'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8c7b6f] flex-shrink-0" />
                </button>

                {/* Dropdown Options */}
                {isSongDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-1.5 max-h-48 overflow-y-auto rounded-xl bg-[#18110b] border border-[#3e2c20] shadow-2xl z-20 p-1 space-y-0.5">
                    {libraryTracks.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-[#7a6a5c]">No songs in library yet</p>
                    ) : (
                      libraryTracks.map((tr) => (
                        <button
                          key={tr.id}
                          onClick={() => {
                            playTrack(tr);
                            setIsSongDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs truncate transition-colors ${
                            currentTrack?.id === tr.id
                              ? 'bg-[#2b1c11] text-[#e5a95d] font-semibold'
                              : 'text-[#c2b1a1] hover:bg-[#221710] hover:text-white'
                          }`}
                        >
                          {tr.title}
                          {tr.artist ? ` - ${tr.artist}` : ''}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
