import React, { useState } from 'react';
import {
  CloudRain,
  Zap,
  Bug,
  MessageSquare,
  Flame,
  Bird,
  Wind,
  Coffee,
  Sparkles,
  X,
  Radio,
  Sliders,
  Clock,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  Power,
  Volume2
} from 'lucide-react';
import { useAmbience } from '../context/AmbienceContext';
import { usePlayer } from '../context/PlayerContext';

// Tactile Slide Toggle Switch with smooth brass knob and glowing pilot lamp
function SlideToggle({ checked, onChange, activeColor = '#f59e0b', activeLabel = 'ON', inactiveLabel = 'OFF', size = 'md' }) {
  const isSm = size === 'sm';
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className="flex items-center gap-1.5 cursor-pointer select-none group"
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`font-mono font-bold tracking-wider transition-colors ${isSm ? 'text-[8px]' : 'text-[9px]'} ${
          checked ? 'text-[#fef3c7]' : 'text-[#8c7462]'
        }`}
      >
        {checked ? activeLabel : inactiveLabel}
      </span>
      <div
        className={`rounded-full p-0.5 transition-all duration-200 ease-in-out relative border ${
          isSm ? 'w-8 h-4' : 'w-10 h-5'
        }`}
        style={{
          backgroundColor: checked ? activeColor : '#1f120a',
          borderColor: checked ? activeColor : '#3e2316',
          boxShadow: checked ? `0 0 12px ${activeColor}70` : 'none',
        }}
      >
        <div
          className={`rounded-full bg-[#fdf6e7] shadow-md transform transition-transform duration-200 ease-in-out ${
            isSm
              ? `w-3 h-3 ${checked ? 'translate-x-4' : 'translate-x-0'}`
              : `w-4 h-4 ${checked ? 'translate-x-5' : 'translate-x-0'}`
          }`}
        />
      </div>
    </div>
  );
}

// Mini animated vintage needle / equalizer for active sound channels
function MiniEqualizer({ active, color = '#f59e0b' }) {
  if (!active) return null;
  return (
    <div className="flex items-end gap-[2px] h-3 ml-1.5 opacity-90">
      <span
        className="w-[2px] rounded-full animate-bounce"
        style={{ height: '65%', backgroundColor: color, animationDuration: '0.6s' }}
      />
      <span
        className="w-[2px] rounded-full animate-bounce"
        style={{ height: '100%', backgroundColor: color, animationDuration: '0.45s', animationDelay: '0.15s' }}
      />
      <span
        className="w-[2px] rounded-full animate-bounce"
        style={{ height: '45%', backgroundColor: color, animationDuration: '0.7s', animationDelay: '0.3s' }}
      />
      <span
        className="w-[2px] rounded-full animate-bounce"
        style={{ height: '80%', backgroundColor: color, animationDuration: '0.5s', animationDelay: '0.2s' }}
      />
    </div>
  );
}

export function AtmosphericSplitConsole() {
  const {
    activePreset,
    rainVol, thunderVol, cricketsVol, chattingVol, fireplaceVol, birdsVol, windVol, kettleVol,
    rainActive, thunderActive, cricketsActive, chattingActive, fireplaceActive, birdsActive, windActive, kettleActive,
    setRainVol, setThunderVol, setCricketsVol, setChattingVol, setFireplaceVol, setBirdsVol, setWindVol, setKettleVol,
    toggleSound,
    setSoundActive,
    applyPreset
  } = useAmbience();

  const {
    isMuffled,
    isSpatialAudio,
    sleepTimerMinutes,
    sleepTimerRemaining,
    toggleMuffled,
    toggleSpatialAudio,
    startSleepTimer,
    clearSleepTimer
  } = usePlayer();

  const [isCustomTimerOpen, setIsCustomTimerOpen] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('');

  const presets = [
    { id: 'mazha_sandhya', label: 'മഴ സന്ധ്യ', icon: '🌧️', sub: 'Rainy Twilight' },
    { id: 'chaya_samayam', label: 'ചായ സമയം', icon: '☕', sub: 'Warm Chai' },
    { id: 'padhanam', label: 'പഠനം', icon: '📖', sub: 'Deep Focus' },
    { id: 'mazhakaalam', label: 'മഴക്കാലം', icon: '🌧️', sub: 'Monsoon' },
    { id: 'raatri', label: 'രാത്രി', icon: '🌙', sub: 'Quiet Night' },
    { id: 'innathethu', label: 'ഇന്നത്തേത്', icon: '✨', sub: 'Daily Broadcast' },
  ];

  // 8 Artisan channel strips - Kerala Tea Stall Acoustic Environment
  const channelStrips = [
    {
      id: 'rain',
      malayalam: 'മഴ',
      english: 'തകര ഷീറ്റിലെ മഴ (Tin Roof Rain)',
      icon: CloudRain,
      color: '#38bdf8',
      vol: rainVol,
      active: rainActive,
      setVol: setRainVol,
      toggle: () => toggleSound('rain'),
    },
    {
      id: 'kettle',
      malayalam: 'ചായപ്പാത്രം',
      english: 'തിളയ്ക്കുന്ന കെറ്റിൽ (Boiling Chai Kettle)',
      icon: Coffee,
      color: '#f59e0b',
      vol: kettleVol,
      active: kettleActive,
      setVol: setKettleVol,
      toggle: () => toggleSound('kettle'),
    },
    {
      id: 'chatting',
      malayalam: 'ചായക്കട സംസാരം',
      english: 'നാട്ടുവർത്തമാനം (Tea Stall Murmur)',
      icon: MessageSquare,
      color: '#fbbf24',
      vol: chattingVol,
      active: chattingActive,
      setVol: setChattingVol,
      toggle: () => toggleSound('chatting'),
    },
    {
      id: 'wind',
      malayalam: 'കാറ്റ്',
      english: 'ഇടവപ്പാതി കാറ്റ് (Monsoon Breeze)',
      icon: Wind,
      color: '#22d3ee',
      vol: windVol,
      active: windActive,
      setVol: setWindVol,
      toggle: () => toggleSound('wind'),
    },
    {
      id: 'crickets',
      malayalam: 'ചീവീട്',
      english: 'സന്ധ്യാ ചീവീടുകൾ (Evening Crickets)',
      icon: Bug,
      color: '#4ade80',
      vol: cricketsVol,
      active: cricketsActive,
      setVol: setCricketsVol,
      toggle: () => toggleSound('crickets'),
    },
    {
      id: 'fireplace',
      malayalam: 'അടുപ്പ്',
      english: 'വിറകടുപ്പിലെ തീ (Wood Hearth)',
      icon: Flame,
      color: '#fb923c',
      vol: fireplaceVol,
      active: fireplaceActive,
      setVol: setFireplaceVol,
      toggle: () => toggleSound('fireplace'),
    },
    {
      id: 'thunder',
      malayalam: 'ഇടിമിന്നൽ',
      english: 'വിദൂര ഇടിനാദം (Distant Thunder)',
      icon: Zap,
      color: '#c084fc',
      vol: thunderVol,
      active: thunderActive,
      setVol: setThunderVol,
      toggle: () => toggleSound('thunder'),
    },
    {
      id: 'birds',
      malayalam: 'പക്ഷികൾ',
      english: 'കൂടണയും കിളികൾ (Twilight Birds)',
      icon: Bird,
      color: '#a3e635',
      vol: birdsVol,
      active: birdsActive,
      setVol: setBirdsVol,
      toggle: () => toggleSound('birds'),
    },
  ];

  const activeCount = channelStrips.filter(s => s.active).length;
  const currentActivePresetObj = presets.find(p => p.id === activePreset);

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
    <div className="space-y-5">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. CHAYAKADA ATMOSPHERE HEADER CARD */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-[#24150d] via-[#1a0f0a] to-[#120a06] border-2 border-[#4a2b1a] shadow-xl relative overflow-hidden select-none">
        {/* Overhead subtle warm filament ambient glow */}
        <div className="absolute -top-10 left-1/4 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none animate-filament" />
        
        {/* Brass corner brackets */}
        <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#d97706]/70 pointer-events-none" />
        <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#d97706]/70 pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#d97706]/70 pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#d97706]/70 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d97706] to-[#78350f] flex items-center justify-center text-white shadow-md border border-[#f59e0b]/40">
              <span className="text-base">🍵</span>
            </div>
            <div>
              <h3 className="font-serif-vintage text-base font-bold text-[#fef3c7] tracking-wider leading-tight">
                ചായക്കട അന്തരീക്ഷം
              </h3>
              <p className="text-[9px] font-mono tracking-widest uppercase text-[#d97706] font-bold">
                TEA STALL ACOUSTICS • 8 AMBIENT CHANNELS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#100905] border border-[#d97706]/40 shadow-inner">
            <span className={`w-1.5 h-1.5 rounded-full ${activeCount > 0 ? 'bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]' : 'bg-[#4a2e1d]'}`} />
            <span className="text-[9px] font-mono font-bold text-[#fed7aa]">
              {activeCount > 0 ? `${activeCount} SOUNDS LIVE` : 'MUTED'}
            </span>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. DUAL MASTER ACOUSTIC SWITCHES (Tactile Bakelite Controls)*/}
      {/* ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#deb17a]">
            ACOUSTIC ENGINE • സൗണ്ട് ഇഫക്റ്റ്സ്
          </span>
          <span className="text-[9px] font-mono text-[#a88a74]">
            BINAURAL DSP
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* SPATIAL AUDIO TOGGLE (Electric Cyan with Brass Frame) */}
          <div
            onClick={toggleSpatialAudio}
            className={`p-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group select-none cursor-pointer flex flex-col justify-between ${
              isSpatialAudio
                ? 'bg-gradient-to-br from-[#0c2430] to-[#061219] border-[#38bdf8] shadow-[0_0_16px_rgba(56,189,248,0.25)] ring-1 ring-[#38bdf8]/50'
                : 'bg-[#1a0f0a] border-[#382014] hover:border-[#52301e]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors ${
                isSpatialAudio ? 'text-[#38bdf8]' : 'text-[#baa290]'
              }`}>
                <span className="text-xs">🎧</span>
                <span>4D SPATIAL</span>
              </span>

              {/* Tactile Cyan Slide Switch */}
              <SlideToggle
                checked={isSpatialAudio}
                onChange={toggleSpatialAudio}
                activeColor="#38bdf8"
                activeLabel="ON"
                inactiveLabel="OFF"
                size="sm"
              />
            </div>

            <div>
              <p className={`text-[10px] font-medium leading-tight transition-colors ${
                isSpatialAudio ? 'text-[#bae6fd]' : 'text-[#8c7462]'
              }`}>
                {isSpatialAudio ? '4D Orbital Soundstage' : 'Pure Direct Stereo'}
              </p>
              <span className="text-[8px] font-mono text-[#665042] tracking-wider uppercase block mt-0.5">
                {isSpatialAudio ? '360° ORBIT + HRTF ROOM' : 'STANDARD STEREO'}
              </span>
            </div>
          </div>

          {/* MUFFLED (VERANDA VIBE) TOGGLE (Warm Terracotta with Brass Frame) */}
          <div
            onClick={toggleMuffled}
            className={`p-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group select-none cursor-pointer flex flex-col justify-between ${
              isMuffled
                ? 'bg-gradient-to-br from-[#331508] to-[#1a0904] border-[#f97316] shadow-[0_0_16px_rgba(249,115,22,0.25)] ring-1 ring-[#f97316]/50'
                : 'bg-[#1a0f0a] border-[#382014] hover:border-[#52301e]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors ${
                isMuffled ? 'text-[#f97316]' : 'text-[#baa290]'
              }`}>
                <span className="text-xs">☕</span>
                <span>MUFFLED</span>
              </span>

              {/* Tactile Terracotta Slide Switch */}
              <SlideToggle
                checked={isMuffled}
                onChange={toggleMuffled}
                activeColor="#f97316"
                activeLabel="ON"
                inactiveLabel="OFF"
                size="sm"
              />
            </div>

            <div>
              <p className={`text-[10px] font-medium leading-tight transition-colors ${
                isMuffled ? 'text-[#fed7aa]' : 'text-[#8c7462]'
              }`}>
                {isMuffled ? 'Rainy Veranda Acoustic' : 'Crisp Transparency'}
              </p>
              <span className="text-[8px] font-mono text-[#665042] tracking-wider uppercase block mt-0.5">
                {isMuffled ? 'WOOD EAVES RAIN FILTER' : 'BYPASS FILTER'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. SOUND PRESETS (Vintage Radio Station Push-Buttons)      */}
      {/* ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#deb17a]">
            PRESETS • പ്രീസെറ്റുകൾ
          </span>

          {/* Reset indicator badge when preset is active */}
          {activePreset && currentActivePresetObj && (
            <button
              onClick={() => applyPreset(activePreset)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2e1408] border border-[#d97706]/70 text-[#fed7aa] text-[9px] font-mono hover:bg-[#401b0a] transition-colors shadow-sm"
              title="Click to reset preset"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
              <span>{currentActivePresetObj.label} ACTIVE • RESET</span>
              <X className="w-2.5 h-2.5 ml-0.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {presets.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`p-2.5 rounded-xl border text-left transition-all duration-200 relative group select-none ${
                  isActive
                    ? 'bg-gradient-to-br from-[#381d10] to-[#201008] border-[#f59e0b] text-[#fef3c7] shadow-lg shadow-amber-950/60 ring-1 ring-[#f59e0b]/60'
                    : 'bg-[#180e09] border-[#382014] text-[#baa290] hover:text-[#fdf6e7] hover:border-[#52301e] hover:bg-[#21130c]'
                }`}
                title={isActive ? 'Click again to reset' : `Activate ${preset.label}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{preset.icon}</span>
                  {isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#3d2315]" />
                  )}
                </div>
                <div className="font-malayalam text-xs font-bold truncate block">
                  {preset.label}
                </div>
                <span className={`text-[9px] font-sans truncate block mt-0.5 ${
                  isActive ? 'text-[#f59e0b]' : 'text-[#7d6655]'
                }`}>
                  {isActive ? 'Tap to reset' : preset.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. SLEEP TIMER (Analog Segmented Bar)                     */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="p-3 rounded-xl bg-[#160d08] border border-[#382014] flex items-center justify-between flex-wrap gap-2 shadow-inner">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#baa290]">
            SLEEP TIMER
          </span>
          {sleepTimerRemaining !== null && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2a1409] border border-[#d97706]/60 text-[#fed7aa] text-[10px] font-mono">
              <span>{formatSleepRemaining(sleepTimerRemaining)}</span>
              <button onClick={clearSleepTimer} className="hover:text-white" title="Cancel timer">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {[30, 60, 90].map((mins) => {
            const isCurrent = sleepTimerMinutes === mins;
            return (
              <button
                key={mins}
                onClick={() => isCurrent ? clearSleepTimer() : startSleepTimer(mins)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] border-[#f59e0b] text-white shadow-md'
                    : 'bg-[#1f120a] border-[#382014] text-[#baa290] hover:text-[#fdf6e7]'
                }`}
              >
                {mins}m
              </button>
            );
          })}
          <button
            onClick={() => setIsCustomTimerOpen(prev => !prev)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border border-dashed ${
              sleepTimerMinutes && ![30, 60, 90].includes(sleepTimerMinutes)
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] border-[#f59e0b] text-white'
                : 'bg-[#1f120a] border-[#3d2315] text-[#baa290] hover:text-[#fdf6e7]'
            }`}
          >
            + Custom
          </button>
        </div>

        {isCustomTimerOpen && (
          <form onSubmit={handleCustomTimerSubmit} className="w-full flex items-center gap-2 pt-2 border-t border-[#2e190e]">
            <span className="text-[11px] text-[#baa290]">Minutes:</span>
            <input
              type="number"
              min="1"
              max="600"
              value={customMinutesInput}
              onChange={(e) => setCustomMinutesInput(e.target.value)}
              placeholder="45"
              className="w-16 px-2 py-0.5 rounded-lg bg-[#0e0704] border border-[#3e2316] text-xs text-white focus:outline-none focus:border-[#d97706]"
              autoFocus
            />
            <button
              type="submit"
              className="px-2.5 py-0.5 rounded-lg bg-[#d97706] text-white text-[11px] font-bold hover:bg-[#b45309]"
            >
              Start
            </button>
            <button
              type="button"
              onClick={() => setIsCustomTimerOpen(false)}
              className="p-1 text-[#baa290] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. THE 8 ACOUSTIC CHANNELS (Rosewood Sliders with Visualizer)*/}
      {/* ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#deb17a]">
            CHAYAKADA AMBIENCE • അന്തരീക്ഷ ശബ്ദങ്ങൾ
          </span>
          <span className="text-[9px] font-mono text-[#a88a74]">
            8 CHANNELS
          </span>
        </div>

        {/* Vintage wooden channel strips */}
        <div className="space-y-2">
          {channelStrips.map((strip) => {
            const Icon = strip.icon;
            const percent = Math.round(strip.vol * 100);

            return (
              <div
                key={strip.id}
                onClick={() => strip.toggle()}
                className={`p-2.5 rounded-xl border transition-all duration-200 select-none cursor-pointer flex flex-col gap-1.5 ${
                  strip.active
                    ? 'bg-gradient-to-r from-[#26150d] to-[#1c0f09] border-[#4d2a19] shadow-md shadow-black/40'
                    : 'bg-[#150c07] border-[#2c170d] opacity-75 hover:opacity-100 hover:border-[#422515]'
                }`}
              >
                {/* Channel Header Line */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Status LED Dot */}
                    <span
                      className={`w-2 h-2 rounded-full transition-all ${
                        strip.active ? 'animate-pulse shadow-[0_0_6px_#f59e0b]' : 'opacity-25'
                      }`}
                      style={{ backgroundColor: strip.color }}
                    />
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: strip.active ? strip.color : '#826958' }}
                    />
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-malayalam text-xs font-bold text-[#fdf6e7] truncate">
                        {strip.malayalam}
                      </span>
                      <span className="text-[10px] text-[#a8907e] font-sans truncate">
                        {strip.english}
                      </span>
                      {/* Dancing mini visualizer */}
                      <MiniEqualizer active={strip.active} color={strip.color} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-[11px] font-mono font-bold min-w-[32px] text-right"
                      style={{ color: strip.active ? strip.color : '#826958' }}
                    >
                      {percent}%
                    </span>

                    {/* Tactile Slide Switch for each sound effect */}
                    <SlideToggle
                      checked={strip.active}
                      onChange={strip.toggle}
                      activeColor={strip.color}
                      activeLabel="ON"
                      inactiveLabel="OFF"
                      size="sm"
                    />
                  </div>
                </div>

                {/* Tactile Volume Slider */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="px-0.5 pt-0.5"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={strip.vol}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      const val = parseFloat(e.target.value);
                      strip.setVol(val);
                      if (!strip.active && val > 0) {
                        setSoundActive(strip.id, true);
                      }
                    }}
                    style={{
                      background: strip.active
                        ? `linear-gradient(to right, ${strip.color} 0%, ${strip.color} ${percent}%, #23140c ${percent}%, #23140c 100%)`
                        : '#1c100a'
                    }}
                    className="w-full cursor-pointer h-1.5 rounded-full outline-none transition-all"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. VINTAGE KERALA TEA STALL SIGN OFF                      */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="pt-2 pb-1 border-t border-[#331c10] text-center">
        <p className="text-[11px] text-[#fed7aa]/80 font-malayalam leading-relaxed">
          "ഒരു കപ്പ് കട്ടൻ ചായയും, ചാറ്റൽ മഴയും, ഓർമ്മകളുടെ സംഗീതവും..."
        </p>
        <span className="text-[9px] font-mono text-[#8a6e5a] tracking-widest uppercase block mt-0.5">
          VAINNERAM • NADAN CHAYAKADA
        </span>
      </div>
    </div>
  );
}
