import React, { useState } from 'react';
import {
  Home,
  Library,
  Disc,
  CloudRain,
  Zap,
  Bug,
  MessageSquare,
  Flame,
  Bird,
  Wind,
  Coffee,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Volume2,
  X,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAmbience } from '../context/AmbienceContext';
import { usePlayer } from '../context/PlayerContext';

export function Sidebar({ currentTab, setCurrentTab }) {
  const { stats } = useAuth();
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

  const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);

  const navItems = [
    { id: 'home', label: 'Home', malayalam: 'ഹോം', icon: Home },
    { id: 'library', label: 'Songs Library', malayalam: '113 പാട്ടുകൾ', icon: Library, highlight: true },
    { id: 'playlists', label: 'Playlists', malayalam: 'പ്ലേലിസ്റ്റുകൾ', icon: Disc }
  ];

  const presets = [
    { id: 'mazha_sandhya', label: 'മഴ സന്ധ്യ', icon: '🌧️' },
    { id: 'chaya_samayam', label: 'ചായ സമയം', icon: '☕' },
    { id: 'padhanam', label: 'പഠനം', icon: '📖' },
    { id: 'mazhakaalam', label: 'മഴക്കാലം', icon: '🌧️' },
    { id: 'raatri', label: 'രാത്രി', icon: '🌙' },
    { id: 'innathethu', label: 'ഇന്നത്തേത്', icon: '✨' },
  ];

  const soundList = [
    {
      id: 'rain',
      malayalam: 'മഴ',
      english: 'Rain',
      icon: CloudRain,
      color: '#38bdf8',
      vol: rainVol,
      active: rainActive,
      setVol: setRainVol,
      toggle: () => toggleSound('rain'),
    },
    {
      id: 'thunder',
      malayalam: 'ഇടി',
      english: 'Thunder',
      icon: Zap,
      color: '#a855f7',
      vol: thunderVol,
      active: thunderActive,
      setVol: setThunderVol,
      toggle: () => toggleSound('thunder'),
    },
    {
      id: 'crickets',
      malayalam: 'ചീവീട്',
      english: 'Crickets',
      icon: Bug,
      color: '#22c55e',
      vol: cricketsVol,
      active: cricketsActive,
      setVol: setCricketsVol,
      toggle: () => toggleSound('crickets'),
    },
    {
      id: 'chatting',
      malayalam: 'സംസാരം',
      english: 'Tea Stall Chatting',
      icon: MessageSquare,
      color: '#d97706',
      vol: chattingVol,
      active: chattingActive,
      setVol: setChattingVol,
      toggle: () => toggleSound('chatting'),
    },
    {
      id: 'fireplace',
      malayalam: 'അടുപ്പ്',
      english: 'Fireplace',
      icon: Flame,
      color: '#ea580c',
      vol: fireplaceVol,
      active: fireplaceActive,
      setVol: setFireplaceVol,
      toggle: () => toggleSound('fireplace'),
    },
    {
      id: 'birds',
      malayalam: 'പക്ഷികൾ',
      english: 'Birds',
      icon: Bird,
      color: '#4ade80',
      vol: birdsVol,
      active: birdsActive,
      setVol: setBirdsVol,
      toggle: () => toggleSound('birds'),
    },
    {
      id: 'wind',
      malayalam: 'കാറ്റ്',
      english: 'Wind',
      icon: Wind,
      color: '#0ea5e9',
      vol: windVol,
      active: windActive,
      setVol: setWindVol,
      toggle: () => toggleSound('wind'),
    },
    {
      id: 'kettle',
      malayalam: 'കെറ്റിൽ',
      english: 'Kettle & Chai',
      icon: Coffee,
      color: '#e5a95d',
      vol: kettleVol,
      active: kettleActive,
      setVol: setKettleVol,
      toggle: () => toggleSound('kettle'),
    },
  ];

  const activeSoundsCount = soundList.filter(s => s.active).length;

  const formatSleepRemaining = (sec) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <aside className="w-72 lg:w-80 bg-[#0d1a14] border-r border-[#1c362b] flex-col justify-between hidden md:flex h-[calc(100vh-80px)] sticky top-0 p-3.5 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1f3f31]">
      <div className="space-y-4">
        {/* Top Branding / Logo */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d9822b] to-[#994d13] flex items-center justify-center text-white shadow-lg shadow-black/40">
            <span className="text-xl">🍵</span>
          </div>
          <div>
            <h1 className="font-serif-vintage text-base font-bold text-[#f7f2e8] tracking-wide">
              വൈകുന്നേരം
            </h1>
            <p className="text-[11px] text-[#8fa498] font-medium tracking-wider uppercase">
              Vainneram Music
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#183628] text-[#f7f2e8] border border-[#d9822b]/40 shadow-sm'
                    : item.highlight
                    ? 'bg-[#14261f] text-[#deb17a] hover:bg-[#1a3429] hover:text-[#f7f2e8] border border-[#224032]'
                    : 'text-[#8ea498] hover:bg-[#13271e] hover:text-[#f7f2e8]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive || item.highlight ? 'text-[#d9822b]' : 'text-[#728d7f]'}`} />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] font-malayalam opacity-60">
                  {item.malayalam}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ========================================================= */}
        {/* ATMOSPHERIC SOUNDSCAPE CONSOLE (EMBEDDED IN SIDEBAR) */}
        {/* ========================================================= */}
        <div className="pt-1">
          <div className="rounded-2xl bg-[#0f1d17] border border-[#224032] overflow-hidden shadow-lg shadow-black/30">
            {/* Console Header Toggle */}
            <div
              onClick={() => setIsConsoleExpanded(prev => !prev)}
              className="p-3 bg-gradient-to-r from-[#142920] to-[#12231b] flex items-center justify-between cursor-pointer select-none hover:bg-[#1a3529] transition-colors border-b border-[#1f3a2d]"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#193d2c] text-[#deb17a]">
                  <CloudRain className="w-4 h-4 text-[#e69a38]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#f7f2e8] tracking-wide">
                      Atmospheric Console
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      activeSoundsCount > 0 ? 'bg-[#d9822b] text-white' : 'bg-[#1a3328] text-[#81998d]'
                    }`}>
                      {activeSoundsCount > 0 ? `${activeSoundsCount} ON` : 'OFF'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#81998d] font-malayalam">
                    വൈകുന്നേരം അന്തരീക്ഷം & പ്രീസെറ്റുകൾ
                  </p>
                </div>
              </div>

              <div className="text-[#81998d]">
                {isConsoleExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {/* Expandable Console Controls */}
            {isConsoleExpanded && (
              <div className="p-3 space-y-3.5 bg-[#0a1510]/80">
                {/* 1. ACOUSTIC ENGINE TOGGLES: 3D SPATIAL & VIBE */}
                <div className="grid grid-cols-2 gap-2">
                  {/* 3D Spatial Audio Switch */}
                  <button
                    onClick={toggleSpatialAudio}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      isSpatialAudio
                        ? 'bg-[#261d12] border-[#d9822b] shadow-md shadow-amber-950/40'
                        : 'bg-[#11231a] border-[#1e3b2e] hover:border-[#2b5441]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#deb17a]">
                        3D SPATIAL
                      </span>
                      <span className={`text-[8px] font-mono px-1 rounded ${
                        isSpatialAudio ? 'bg-[#d9822b] text-white font-bold' : 'text-[#6e8578]'
                      }`}>
                        {isSpatialAudio ? 'ON' : 'STEREO'}
                      </span>
                    </div>
                    <p className="text-[9px] text-[#7d9689] leading-tight">
                      {isSpatialAudio ? 'Binaural 3D Stage' : 'Standard Stereo'}
                    </p>
                  </button>

                  {/* Vibe / Veranda Muffle Switch */}
                  <button
                    onClick={toggleMuffled}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      isMuffled
                        ? 'bg-[#261d12] border-[#d9822b] shadow-md shadow-amber-950/40'
                        : 'bg-[#11231a] border-[#1e3b2e] hover:border-[#2b5441]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#deb17a]">
                        VIBE
                      </span>
                      <span className={`text-[8px] font-mono px-1 rounded ${
                        isMuffled ? 'bg-[#d9822b] text-white font-bold' : 'text-[#6e8578]'
                      }`}>
                        {isMuffled ? 'VERANDA' : 'CLEAR'}
                      </span>
                    </div>
                    <p className="text-[9px] text-[#7d9689] leading-tight">
                      {isMuffled ? 'Muffled Acoustic' : 'Clear Audio'}
                    </p>
                  </button>
                </div>

                {/* 2. PRESETS PILLS */}
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#6a8779] uppercase tracking-wider block mb-1.5">
                    PRESETS പ്രീസെറ്റുകൾ
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {presets.map((preset) => {
                      const isActive = activePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border flex items-center gap-1 flex-shrink-0 ${
                            isActive
                              ? 'bg-[#d9822b] border-[#e69a38] text-white shadow-sm'
                              : 'bg-[#12231b] border-[#1c382b] text-[#8ea498] hover:text-[#f7f2e8] hover:border-[#2d5743]'
                          }`}
                        >
                          <span className="text-xs">{preset.icon}</span>
                          <span className="font-malayalam text-[10px]">{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. 8 ATMOSPHERIC SOUND CONTROLS */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono font-bold text-[#6a8779] uppercase tracking-wider">
                      SOUND EFFECTS ശബ്ദങ്ങൾ
                    </span>
                    <span className="text-[9px] font-mono text-[#deb17a]">
                      {activeSoundsCount}/8 Active
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {soundList.map((sc) => {
                      const Icon = sc.icon;
                      const percent = Math.round(sc.vol * 100);

                      return (
                        <div
                          key={sc.id}
                          onClick={() => sc.toggle()}
                          className={`p-2 rounded-xl border transition-all cursor-pointer select-none ${
                            sc.active
                              ? 'bg-[#152a20] border-[#2c5741] shadow-sm'
                              : 'bg-[#0f1d17] border-[#1b3427] opacity-75 hover:opacity-100 hover:border-[#224433]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon
                                className="w-3.5 h-3.5 flex-shrink-0"
                                style={{ color: sc.active ? sc.color : '#657e71' }}
                              />
                              <span className="font-malayalam text-xs font-bold text-[#f7f2e8] truncate">
                                {sc.malayalam}
                              </span>
                              <span className="text-[9px] text-[#718c7e] font-sans truncate">
                                {sc.english}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span
                                className="text-[10px] font-mono font-semibold"
                                style={{ color: sc.active ? sc.color : '#657e71' }}
                              >
                                {percent}%
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sc.toggle();
                                }}
                                className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                                  sc.active
                                    ? 'bg-[#d9822b] text-white'
                                    : 'bg-[#15271f] text-[#657e71] hover:text-[#f7f2e8]'
                                }`}
                              >
                                {sc.active ? 'ON' : 'OFF'}
                              </button>
                            </div>
                          </div>

                          {/* Volume Slider */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-0.5"
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
                                  ? `linear-gradient(to right, ${sc.color} 0%, ${sc.color} ${percent}%, #1b382b ${percent}%, #1b382b 100%)`
                                  : '#193327'
                              }}
                              className="w-full cursor-pointer h-1 rounded-full outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. SLEEP TIMER QUICK ROW */}
                <div className="pt-1 border-t border-[#1a3327]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-bold text-[#6a8779] uppercase tracking-wider">
                      SLEEP TIMER
                    </span>
                    {sleepTimerRemaining !== null && (
                      <span className="text-[10px] font-mono text-[#deb17a] font-bold">
                        {formatSleepRemaining(sleepTimerRemaining)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[30, 60, 90].map((mins) => {
                      const isCurrent = sleepTimerMinutes === mins;
                      return (
                        <button
                          key={mins}
                          onClick={() => isCurrent ? clearSleepTimer() : startSleepTimer(mins)}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all border ${
                            isCurrent
                              ? 'bg-[#d9822b] border-[#e69a38] text-white'
                              : 'bg-[#12231b] border-[#1c382b] text-[#8ea498] hover:text-[#f7f2e8]'
                          }`}
                        >
                          {mins}m
                        </button>
                      );
                    })}
                    {sleepTimerRemaining !== null && (
                      <button
                        onClick={clearSleepTimer}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono bg-[#24130d] text-[#deb17a] border border-[#d9822b]/40 hover:text-white"
                        title="Cancel timer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section: Tea Stall Note */}
      <div className="p-3 rounded-xl bg-[#11231a] border border-[#1e3b2e] space-y-1 mt-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#deb17a]">
          <span>☕</span>
          <span className="font-serif-vintage">വൈകുന്നേരം സംഗീതം</span>
        </div>
        <p className="text-[11px] text-[#7d9689] leading-relaxed">
          113 curated Malayalam classics & acoustic evening tracks.
        </p>
      </div>
    </aside>
  );
}
