import React, { useState } from 'react';
import {
  X,
  CloudRain,
  Zap,
  Bug,
  MessageSquare,
  Flame,
  Bird,
  Wind,
  Coffee,
  PanelRightClose
} from 'lucide-react';
import { useAmbience } from '../context/AmbienceContext';
import { usePlayer } from '../context/PlayerContext';

// Animated multi-bar Equalizer with exact heights pattern
function EqualizerBars({ active, color = '#38bdf8', barCount = 10 }) {
  const heights = [28, 55, 78, 65, 48, 85, 95, 70, 52, 38, 22, 18];
  const delays = ['0s', '0.15s', '0.35s', '0.1s', '0.25s', '0.45s', '0.2s', '0.4s', '0.18s', '0.3s'];

  return (
    <div className="flex items-end justify-center gap-[3px] h-7 w-full py-0.5 overflow-hidden">
      {Array.from({ length: barCount }).map((_, i) => {
        const h = heights[i % heights.length];
        return (
          <div
            key={i}
            className="w-[2.5px] rounded-full transition-all duration-300"
            style={{
              backgroundColor: color,
              opacity: active ? (i < 8 ? 0.95 : 0.35) : 0.18,
              height: active ? `${h}%` : '14%',
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

// Custom Switch matching the screenshot's circular pill knob with custom accent colors
function Switch({ checked, onChange, labelLeft, labelRight, activeColor = '#d9822b' }) {
  return (
    <div
      className="flex items-center gap-2 select-none cursor-pointer group"
      onClick={() => onChange(!checked)}
    >
      {labelLeft && (
        <span
          className={`text-[10px] font-mono font-bold tracking-wider uppercase transition-colors ${
            checked ? 'text-white' : 'text-[#6e5d4f]'
          }`}
          style={{ color: checked ? activeColor : undefined }}
        >
          {labelLeft}
        </span>
      )}
      <div
        className="w-10 h-5 rounded-full p-0.5 transition-all duration-200 ease-in-out relative border"
        style={{
          backgroundColor: checked ? activeColor : '#221a14',
          borderColor: checked ? activeColor : '#3a2c20',
          boxShadow: checked ? `0 0 10px ${activeColor}55` : 'none',
        }}
      >
        <div
          className={`w-4 h-4 rounded-full bg-[#f7f2e8] shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      {labelRight && (
        <span className={`text-[10px] font-mono font-bold tracking-wider uppercase transition-colors ${!checked ? 'text-[#a89280]' : 'text-[#6e5d4f]'}`}>
          {labelRight}
        </span>
      )}
    </div>
  );
}

export function AmbiencePanel() {
  const {
    activePreset,
    rainVol, thunderVol, cricketsVol, chattingVol, fireplaceVol, birdsVol, windVol, kettleVol,
    rainActive, thunderActive, cricketsActive, chattingActive, fireplaceActive, birdsActive, windActive, kettleActive,
    isAmbienceOpen,
    setIsAmbienceOpen,
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

  // 8 pure environmental sound cards
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
      activeGlow: 'shadow-[0_0_20px_rgba(56,189,248,0.12)]',
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
      activeGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.14)]',
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
      activeGlow: 'shadow-[0_0_20px_rgba(34,197,94,0.12)]',
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
      activeGlow: 'shadow-[0_0_20px_rgba(217,119,6,0.12)]',
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
      activeGlow: 'shadow-[0_0_20px_rgba(234,88,12,0.14)]',
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
      activeGlow: 'shadow-[0_0_20px_rgba(74,222,128,0.12)]',
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
      activeGlow: 'shadow-[0_0_20px_rgba(14,165,233,0.12)]',
      vol: windVol,
      active: windActive,
      setVol: setWindVol,
      toggle: () => toggleSound('wind'),
    },
    {
      id: 'kettle',
      malayalam: 'കെറ്റിൽ',
      english: 'KETTLE & CHAI',
      icon: Coffee,
      iconColor: 'text-[#f59e0b]',
      themeColor: '#e5a95d',
      activeBg: 'bg-[#1a140f]',
      activeBorder: 'border-[#42301f]',
      activeGlow: 'shadow-[0_0_20px_rgba(229,169,93,0.14)]',
      vol: kettleVol,
      active: kettleActive,
      setVol: setKettleVol,
      toggle: () => toggleSound('kettle'),
    },
  ];

  const activeCount = [
    rainActive, thunderActive, cricketsActive, chattingActive,
    fireplaceActive, birdsActive, windActive, kettleActive
  ].filter(Boolean).length;

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
    <>
      {/* Mobile-only backdrop to allow tap-outside dismiss without blocking desktop browsing */}
      <div
        className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsAmbienceOpen(false)}
      />

      {/* Side Window Console Docked to Right */}
      <aside
        className="fixed top-0 right-0 bottom-24 md:bottom-24 w-full sm:w-[440px] md:w-[460px] lg:w-[480px] z-40 bg-[#0d0907]/98 border-l border-[#261a12] shadow-[-16px_0_40px_rgba(0,0,0,0.85)] flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#211610] bg-[#110c08] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🍵</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-vintage text-sm font-bold text-[#f7f2e8] tracking-wide">
                  വൈകുന്നേരം അന്തരീക്ഷം
                </h2>
                {activeCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#2a170d] border border-[#d9822b]/50 text-[#deb17a] text-[10px] font-mono">
                    {activeCount} active
                  </span>
                )}
              </div>
              <p className="text-[9px] text-[#7a685a] font-mono tracking-widest uppercase">
                ATMOSPHERIC SOUNDSCAPE CONSOLE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAmbienceOpen(false)}
              className="p-1.5 rounded-xl text-[#7a685a] hover:text-[#f7f2e8] hover:bg-[#1a120c] transition-colors"
              title="Close side window"
            >
              <PanelRightClose className="w-5 h-5 text-[#deb17a]" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-[#231710]">
          {/* 1. PRESETS ROW */}
          <div>
            <p className="text-[9px] font-bold text-[#6e5d4f] uppercase tracking-widest mb-1.5 font-mono">
              PRESETS
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {presets.map((preset) => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
                      isActive
                        ? 'bg-[#291a10] border-[#d9822b] text-[#f7f2e8] shadow-md shadow-amber-950/40 ring-1 ring-[#d9822b]/50'
                        : 'bg-[#150f0b] border-[#291d15] text-[#8c7b6f] hover:text-[#f7f2e8] hover:border-[#3d2c20]'
                    }`}
                    title={isActive ? 'Click to reset' : `Activate ${preset.label}`}
                  >
                    <span className="text-sm">{preset.icon}</span>
                    <span className="font-malayalam text-[11px]">{preset.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#d9822b] animate-pulse ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ACOUSTIC SWITCHES (MUFFLED & SPATIAL) */}
          <div className="p-3 rounded-2xl bg-[#140e0a] border border-[#261a12] flex items-center justify-around gap-2">
            {/* Muffled / Clear Toggle (Warm Terracotta) */}
            <Switch
              checked={isMuffled}
              onChange={toggleMuffled}
              labelLeft="MUFFLED"
              labelRight="CLEAR"
              activeColor="#f97316"
            />

            <div className="h-6 w-[1px] bg-[#291b12]" />

            {/* Spatial / Stereo Toggle (Electric Cyan) */}
            <Switch
              checked={isSpatialAudio}
              onChange={toggleSpatialAudio}
              labelLeft="SPATIAL"
              labelRight="STEREO"
              activeColor="#38bdf8"
            />
          </div>

          {/* 3. SLEEP TIMER CONTROLS */}
          <div className="p-3 rounded-2xl bg-[#140e0a] border border-[#261a12] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#6e5d4f] tracking-widest font-mono uppercase">
                SLEEP TIMER
              </span>
              {sleepTimerRemaining !== null && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2a170d] border border-[#d9822b]/40 text-[#e5a95d] text-[11px] font-mono">
                  <span>{formatSleepRemaining(sleepTimerRemaining)}</span>
                  <button onClick={clearSleepTimer} className="hover:text-white" title="Cancel timer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[30, 60, 90].map((mins) => {
                const isCurrent = sleepTimerMinutes === mins;
                return (
                  <button
                    key={mins}
                    onClick={() => isCurrent ? clearSleepTimer() : startSleepTimer(mins)}
                    className={`flex-1 py-1 rounded-xl text-[11px] font-mono font-medium transition-all border text-center ${
                      isCurrent
                        ? 'bg-[#d9822b] border-[#e5a95d] text-white shadow-sm'
                        : 'bg-[#18110b] border-[#291d15] text-[#8c7b6f] hover:text-[#f7f2e8] hover:border-[#3d2c20]'
                    }`}
                  >
                    {mins}m
                  </button>
                );
              })}

              <button
                onClick={() => setIsCustomTimerOpen(prev => !prev)}
                className={`px-3 py-1 rounded-xl text-[11px] font-mono font-medium transition-all border border-dashed ${
                  sleepTimerMinutes && ![30, 60, 90].includes(sleepTimerMinutes)
                    ? 'bg-[#d9822b] border-[#e5a95d] text-white shadow-sm'
                    : 'bg-[#18110b] border-[#3a2c20] text-[#8c7b6f] hover:text-[#f7f2e8]'
                }`}
              >
                + Custom
              </button>
            </div>

            {/* Custom Sleep Timer Input Popover */}
            {isCustomTimerOpen && (
              <form onSubmit={handleCustomTimerSubmit} className="flex items-center gap-2 pt-2 border-t border-[#291b12]">
                <span className="text-[11px] text-[#b8a798]">Minutes:</span>
                <input
                  type="number"
                  min="1"
                  max="600"
                  value={customMinutesInput}
                  onChange={(e) => setCustomMinutesInput(e.target.value)}
                  placeholder="45"
                  className="w-16 px-2 py-0.5 rounded-lg bg-[#0e0906] border border-[#2e2118] text-xs text-white focus:outline-none focus:border-[#d9822b]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-0.5 rounded-lg bg-[#d9822b] text-white text-[11px] font-medium hover:bg-[#e69a38]"
                >
                  Start
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomTimerOpen(false)}
                  className="p-1 text-[#8c7b6f] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* 4. EIGHT SOUND EFFECT CARDS (2-column grid in side window) */}
          <div>
            <p className="text-[9px] font-bold text-[#6e5d4f] uppercase tracking-widest mb-2 font-mono">
              SOUND EFFECTS
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {soundCards.map((sc) => {
                const Icon = sc.icon;
                const percent = Math.round(sc.vol * 100);

                return (
                  <div
                    key={sc.id}
                    onClick={() => sc.toggle()}
                    className={`flex flex-col justify-between p-3 rounded-2xl border transition-all duration-200 select-none cursor-pointer group hover:scale-[1.015] active:scale-[0.985] ${
                      sc.active
                        ? `${sc.activeBg} ${sc.activeBorder} ${sc.activeGlow}`
                        : 'bg-[#120e0a] border-[#221811] opacity-75 hover:opacity-100 hover:border-[#2e2018]'
                    }`}
                  >
                    {/* Header: Icon + Titles + Mini Level Bars */}
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1 rounded-lg ${sc.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-malayalam text-xs font-bold text-[#f7f2e8] leading-tight truncate">
                            {sc.malayalam}
                          </h4>
                          <p className="text-[8px] font-mono tracking-wider text-[#7a685a] uppercase truncate">
                            {sc.english}
                          </p>
                        </div>
                      </div>

                      <MiniLevelBars active={sc.active} color={sc.themeColor} />
                    </div>

                    {/* Equalizer Visualizer */}
                    <div className="my-0.5">
                      <EqualizerBars active={sc.active} color={sc.themeColor} barCount={10} />
                    </div>

                    {/* Volume Slider with colored fill track */}
                    <div
                      className="mt-1 mb-2"
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

                    {/* Footer: % on Left, ON/OFF button on Right */}
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span
                        style={{ color: sc.active ? sc.themeColor : '#7a685a' }}
                        className="font-semibold text-[10px]"
                      >
                        {percent}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sc.toggle();
                        }}
                        style={{ color: sc.active ? sc.themeColor : '#5a4c40' }}
                        className="text-[9px] font-bold tracking-wider uppercase transition-colors px-1 py-0.5 rounded"
                      >
                        {sc.active ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
