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
  Clock
} from 'lucide-react';
import { useAmbience } from '../context/AmbienceContext';
import { usePlayer } from '../context/PlayerContext';
import { api } from '../utils/api';
import { formatDuration } from '../utils/formatters';

// Animated multi-bar Equalizer with exact heights pattern matching the screenshot
function EqualizerBars({ active, color = '#38bdf8', barCount = 14 }) {
  // Height pattern from screenshot: rising waves on left, resting on right
  const heights = [28, 55, 78, 65, 48, 85, 95, 70, 52, 38, 22, 18, 18, 18];
  const delays = ['0s', '0.15s', '0.35s', '0.1s', '0.25s', '0.45s', '0.2s', '0.4s', '0.18s', '0.3s', '0.05s', '0.22s', '0.12s', '0.38s'];

  return (
    <div className="flex items-end justify-center gap-[3.5px] h-9 w-full py-1 overflow-hidden">
      {Array.from({ length: barCount }).map((_, i) => {
        const h = heights[i % heights.length];
        return (
          <div
            key={i}
            className="w-[3px] rounded-full transition-all duration-300"
            style={{
              backgroundColor: color,
              opacity: active ? (i < 9 ? 0.95 : 0.35) : 0.18,
              height: active ? `${h}%` : '12%',
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

// 4 mini vertical level bars indicator on card top-right (ılıl)
function MiniLevelBars({ active, color = '#38bdf8' }) {
  const bars = [35, 70, 100, 55];
  return (
    <div className="flex items-end gap-[2px] h-3.5 opacity-90">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full transition-all"
          style={{
            backgroundColor: color,
            height: active ? `${h}%` : '20%',
            opacity: active ? 1 : 0.25
          }}
        />
      ))}
    </div>
  );
}

// Custom Switch matching the screenshot's circular pill knob
function Switch({ checked, onChange, labelLeft, labelRight }) {
  return (
    <div
      className="flex items-center gap-2.5 select-none cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      {labelLeft && (
        <span className={`text-[11px] font-mono font-bold tracking-wider uppercase transition-colors ${checked ? 'text-[#e5a95d]' : 'text-[#6e5d4f]'}`}>
          {labelLeft}
        </span>
      )}
      <div
        className={`w-11 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative ${
          checked ? 'bg-[#d9822b]' : 'bg-[#221a14]'
        } border border-[#3a2c20]`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-[#f7f2e8] shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </div>
      {labelRight && (
        <span className={`text-[11px] font-mono font-bold tracking-wider uppercase transition-colors ${!checked ? 'text-[#e5a95d]' : 'text-[#6e5d4f]'}`}>
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

  const [isSongDropdownOpen, setIsSongDropdownOpen] = useState(false);
  const [libraryTracks, setLibraryTracks] = useState([]);
  const [isCustomTimerOpen, setIsCustomTimerOpen] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isAmbienceOpen) {
      api.getTracks().then(res => {
        if (res.tracks) {
          setLibraryTracks(res.tracks);
        }
      }).catch(() => {});
    }
  }, [isAmbienceOpen]);

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

  // Presets from top bar
  const presets = [
    { id: 'mazha_sandhya', label: 'മഴ സന്ധ്യ', icon: '🌧️' },
    { id: 'chaya_samayam', label: 'ചായ സമയം', icon: '☕' },
    { id: 'padhanam', label: 'പഠനം', icon: '📖' },
    { id: 'mazhakaalam', label: 'മഴക്കാലം', icon: '🌧️' },
    { id: 'raatri', label: 'രാത്രി', icon: '🌙' },
    { id: 'innathethu', label: 'ഇന്നത്തേത്', icon: '✨' },
  ];

  // 7 Environmental cards with exact jewel-tone coloring from the image
  const soundCards = [
    {
      id: 'rain',
      malayalam: 'മഴ',
      english: 'RAIN',
      icon: CloudRain,
      iconColor: 'text-[#60a5fa]',
      themeColor: '#38bdf8',
      activeBg: 'bg-[#0e1824]',
      activeBorder: 'border-[#1c3b5e]',
      activeGlow: 'shadow-[0_0_24px_rgba(56,189,248,0.12)]',
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
      iconColor: 'text-[#fbbf24]',
      themeColor: '#a855f7',
      activeBg: 'bg-[#18112b]',
      activeBorder: 'border-[#422b6b]',
      activeGlow: 'shadow-[0_0_24px_rgba(168,85,247,0.14)]',
      vol: thunderVol,
      active: thunderActive,
      setVol: setThunderVol,
      toggle: () => toggleSound('thunder'),
    },
    {
      id: 'crickets',
      malayalam: 'ചീവീട്',
      english: 'CRICKETS',
      icon: Bug,
      iconColor: 'text-[#4ade80]',
      themeColor: '#22c55e',
      activeBg: 'bg-[#0c1f14]',
      activeBorder: 'border-[#1e472a]',
      activeGlow: 'shadow-[0_0_24px_rgba(34,197,94,0.12)]',
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
      iconColor: 'text-[#f5eee6]',
      themeColor: '#d97706',
      activeBg: 'bg-[#21180f]',
      activeBorder: 'border-[#473420]',
      activeGlow: 'shadow-[0_0_24px_rgba(217,119,6,0.12)]',
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
      iconColor: 'text-[#f97316]',
      themeColor: '#ea580c',
      activeBg: 'bg-[#221310]',
      activeBorder: 'border-[#4d2219]',
      activeGlow: 'shadow-[0_0_24px_rgba(234,88,12,0.14)]',
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
      iconColor: 'text-[#f472b6]',
      themeColor: '#4ade80',
      activeBg: 'bg-[#122417]',
      activeBorder: 'border-[#285233]',
      activeGlow: 'shadow-[0_0_24px_rgba(74,222,128,0.12)]',
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
      themeColor: '#0ea5e9',
      activeBg: 'bg-[#0e1d29]',
      activeBorder: 'border-[#1c435c]',
      activeGlow: 'shadow-[0_0_24px_rgba(14,165,233,0.12)]',
      vol: windVol,
      active: windActive,
      setVol: setWindVol,
      toggle: () => toggleSound('wind'),
    },
  ];

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
      <div className="w-full max-w-5xl rounded-3xl bg-[#0d0907] border border-[#261a12] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#211610] bg-[#100b08] flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">🍵</span>
            <div>
              <h2 className="font-serif-vintage text-base font-bold text-[#f7f2e8] tracking-wide">
                വൈകുന്നേരം അന്തരീക്ഷം
              </h2>
              <p className="text-[10px] text-[#7a685a] font-mono tracking-widest">
                ATMOSPHERIC TEA STALL CONSOLE
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAmbienceOpen(false)}
            className="p-2 rounded-xl text-[#7a685a] hover:text-[#f7f2e8] hover:bg-[#1a120c] transition-colors"
            title="Close console"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Console Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* 1. PRESETS ROW */}
          <div>
            <p className="text-[10px] font-bold text-[#6e5d4f] uppercase tracking-widest mb-2 font-mono">
              PRESETS
            </p>
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {presets.map((preset) => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-[#291a10] border-[#d9822b] text-[#f7f2e8] shadow-md shadow-amber-950/40 ring-1 ring-[#d9822b]/50'
                        : 'bg-[#150f0b] border-[#291d15] text-[#8c7b6f] hover:text-[#f7f2e8] hover:border-[#3d2c20]'
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span className="font-malayalam text-xs">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SLEEP TIMER, VIBE & SPATIAL CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-1">
            {/* Sleep Timer */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#6e5d4f] tracking-widest font-mono mr-1">
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
                        : 'bg-[#17110c] border-[#291d15] text-[#8c7b6f] hover:text-[#f7f2e8] hover:border-[#3d2c20]'
                    }`}
                  >
                    {mins}m
                  </button>
                );
              })}

              <button
                onClick={() => setIsCustomTimerOpen(prev => !prev)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all border border-dashed ${
                  sleepTimerMinutes && ![30, 60, 90].includes(sleepTimerMinutes)
                    ? 'bg-[#d9822b] border-[#e5a95d] text-white shadow-sm'
                    : 'bg-[#17110c] border-[#3a2c20] text-[#8c7b6f] hover:text-[#f7f2e8]'
                }`}
              >
                + Custom
              </button>

              {sleepTimerRemaining !== null && (
                <div className="flex items-center gap-1.5 ml-1 px-2.5 py-0.5 rounded-full bg-[#2a170d] border border-[#d9822b]/40 text-[#e5a95d] text-xs font-mono">
                  <span>{formatSleepRemaining(sleepTimerRemaining)}</span>
                  <button onClick={clearSleepTimer} className="hover:text-white" title="Cancel sleep timer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Vibe / Clear Toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={isMuffled}
                onChange={toggleMuffled}
                labelLeft="VIBE"
                labelRight="CLEAR"
              />
            </div>

            {/* Spatial / Stereo Toggle */}
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
            <form onSubmit={handleCustomTimerSubmit} className="flex items-center gap-2 p-3 rounded-xl bg-[#1c130d] border border-[#3e291b]">
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
                Start
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

          {/* 3. EIGHT CARDS GRID WITH EXACT COLOR PALETTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cards 1-7: Synthesized Environmental Sounds */}
            {soundCards.map((sc) => {
              const Icon = sc.icon;
              const percent = Math.round(sc.vol * 100);

              return (
                <div
                  key={sc.id}
                  onClick={() => sc.toggle()}
                  className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 select-none cursor-pointer group hover:scale-[1.015] active:scale-[0.985] ${
                    sc.active
                      ? `${sc.activeBg} ${sc.activeBorder} ${sc.activeGlow}`
                      : 'bg-[#120e0a] border-[#221811] opacity-75 hover:opacity-100 hover:border-[#2e2018]'
                  }`}
                >
                  {/* Card Header: Icon + Titles + Mini Level Bars on top right */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-xl ${sc.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-malayalam text-base font-bold text-[#f7f2e8] leading-tight">
                          {sc.malayalam}
                        </h4>
                        <p className="text-[10px] font-mono tracking-widest text-[#7a685a] uppercase">
                          {sc.english}
                        </p>
                      </div>
                    </div>

                    <MiniLevelBars active={sc.active} color={sc.themeColor} />
                  </div>

                  {/* Equalizer Visualizer */}
                  <div className="my-1">
                    <EqualizerBars active={sc.active} color={sc.themeColor} barCount={14} />
                  </div>

                  {/* Volume Slider with exact colored fill track matching the screenshot */}
                  <div
                    className="mt-2 mb-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={sc.vol}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        const val = parseFloat(e.target.value);
                        sc.setVol(val);
                        if (!sc.active && val > 0) {
                          setSoundActive(sc.id, true);
                        }
                      }}
                      style={{
                        background: sc.active
                          ? `linear-gradient(to right, ${sc.themeColor} 0%, ${sc.themeColor} ${percent}%, #282019 ${percent}%, #282019 100%)`
                          : '#241a12'
                      }}
                      className="w-full cursor-pointer h-1.5 rounded-full outline-none"
                    />
                  </div>

                  {/* Card Footer: Percentage on Left, ON/OFF on Right */}
                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span
                      style={{ color: sc.active ? sc.themeColor : '#7a685a' }}
                      className="font-semibold"
                    >
                      {percent}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sc.toggle();
                      }}
                      style={{ color: sc.active ? sc.themeColor : '#5a4c40' }}
                      className="text-[10px] font-bold tracking-wider uppercase transition-colors"
                    >
                      {sc.active ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Card 8: പാട്ടുകൾ / MUSIC (Matches screenshot's exact layout) */}
            <div
              onClick={togglePlayPause}
              className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 select-none cursor-pointer group hover:scale-[1.015] active:scale-[0.985] ${
                isPlaying
                  ? 'bg-[#191410] border-[#443324] shadow-[0_0_24px_rgba(229,169,93,0.14)]'
                  : 'bg-[#120e0a] border-[#221811] opacity-80 hover:opacity-100 hover:border-[#2e2018]'
              }`}
            >
              {/* Card Header: Icon + Titles + Volume badge on right */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-xl text-[#d9822b]">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-malayalam text-base font-bold text-[#f7f2e8] leading-tight">
                      പാട്ടുകൾ
                    </h4>
                    <p className="text-[10px] font-mono tracking-widest text-[#7a685a] uppercase">
                      MUSIC
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <span className="text-xs font-mono font-bold text-[#7a685a]">
                    {Math.round(volume * 100)}
                  </span>
                  <span className="text-[8px] font-mono text-[#5a4c40]">VOL</span>
                </div>
              </div>

              {/* Music Visualizer */}
              <div className="my-1">
                <EqualizerBars active={isPlaying} color="#e5a95d" barCount={14} />
              </div>

              {/* Current Song Title & Artist (matches screenshot's "il Ninakkaai Ente Kan" style) */}
              <div className="mt-1 mb-1.5 truncate">
                <p className="text-xs font-semibold text-[#e5a95d] truncate" title={currentTrack?.title}>
                  {currentTrack ? currentTrack.title : 'ചായപ്പാട്ടുകൾ (Select song)'}
                </p>
                <p className="text-[10px] text-[#7a685a] truncate">
                  {currentTrack ? (currentTrack.artist || 'Malayalam🤍') : 'Vainneram Music'}
                </p>
              </div>

              {/* Progress Slider & Timestamps (matches screenshot's 2:36 and 5:17) */}
              <div
                className="space-y-1 mb-2"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    seekTo(parseFloat(e.target.value));
                  }}
                  disabled={!currentTrack}
                  style={{
                    background: duration > 0
                      ? `linear-gradient(to right, #d9822b 0%, #d9822b ${(currentTime / duration) * 100}%, #282019 ${(currentTime / duration) * 100}%, #282019 100%)`
                      : '#241a12'
                  }}
                  className="w-full cursor-pointer h-1.5 rounded-full outline-none disabled:opacity-30"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-[#7a685a]">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Transport Buttons: Prev, Play, Next, Shuffle */}
              <div
                className="flex items-center justify-between py-1 border-t border-[#211610]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playPrevious();
                  }}
                  disabled={!currentTrack}
                  className="p-1 rounded-lg text-[#7a685a] hover:text-[#f7f2e8] disabled:opacity-30 transition-colors"
                  title="Previous"
                >
                  <SkipBack className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                  disabled={!currentTrack && libraryTracks.length === 0}
                  className="w-8 h-8 rounded-full bg-[#d9822b] hover:bg-[#e69a38] text-white flex items-center justify-center shadow-lg shadow-black/50 transition-transform active:scale-95 disabled:opacity-40"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playNext(false);
                  }}
                  disabled={!currentTrack}
                  className="p-1 rounded-lg text-[#7a685a] hover:text-[#f7f2e8] disabled:opacity-30 transition-colors"
                  title="Next"
                >
                  <SkipForward className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleShuffle();
                  }}
                  className={`p-1 rounded-lg transition-colors ${
                    isShuffle ? 'text-[#d9822b]' : 'text-[#5a4c40] hover:text-[#f7f2e8]'
                  }`}
                  title={isShuffle ? 'Shuffle on' : 'Shuffle off'}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dropdown: Select Song */}
              <div
                className="relative mt-2"
                ref={dropdownRef}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSongDropdownOpen(prev => !prev);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#1b140f] border border-[#2e2118] text-left text-xs text-[#d5c5b5] hover:text-white hover:border-[#423023] transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Music className="w-3 h-3 text-[#d9822b] flex-shrink-0" />
                    <span className="truncate">
                      {currentTrack ? currentTrack.title : 'Select Song'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#7a685a] flex-shrink-0" />
                </button>

                {isSongDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-1.5 max-h-48 overflow-y-auto rounded-xl bg-[#18110b] border border-[#3e2c20] shadow-2xl z-20 p-1 space-y-0.5">
                    {libraryTracks.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-[#7a685a]">No songs in library yet</p>
                    ) : (
                      libraryTracks.map((tr) => (
                        <button
                          key={tr.id}
                          onClick={(e) => {
                            e.stopPropagation();
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
