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
  Coffee,
  UtensilsCrossed,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  ChevronDown,
  Volume2,
  Clock,
  Sparkles,
  Radio,
  Sliders
} from 'lucide-react';
import { useAmbience } from '../context/AmbienceContext';
import { usePlayer } from '../context/PlayerContext';
import { api } from '../utils/api';
import { formatDuration } from '../utils/formatters';

// Organic Equalizer with glowing capsule tips
function VainneramEqualizer({ active, color = '#d9822b', barCount = 14 }) {
  const delays = ['0s', '0.2s', '0.4s', '0.12s', '0.34s', '0.5s', '0.18s', '0.44s', '0.28s', '0.08s', '0.32s', '0.16s', '0.4s', '0.24s'];
  const baseHeights = [35, 70, 48, 85, 52, 92, 42, 78, 58, 88, 38, 65, 45, 75];

  return (
    <div className="flex items-end justify-center gap-[3.5px] h-9 w-full py-1.5 overflow-hidden">
      {Array.from({ length: barCount }).map((_, i) => {
        const targetH = baseHeights[i % baseHeights.length];
        return (
          <div
            key={i}
            className="w-[3.5px] rounded-full transition-all duration-300"
            style={{
              backgroundColor: color,
              boxShadow: active ? `0 0 8px ${color}55` : 'none',
              opacity: active ? 0.95 : 0.22,
              height: active ? `${targetH}%` : '15%',
              animation: active
                ? `vainneram-eq 0.72s ease-in-out infinite alternate ${delays[i % delays.length]}`
                : 'none'
            }}
          />
        );
      })}
    </div>
  );
}

// Custom Switch with Vainneram warm copper toggle
function VainneramSwitch({ checked, onChange, labelLeft, labelRight, icon: Icon, badge }) {
  return (
    <div
      className="flex items-center gap-2.5 select-none cursor-pointer p-1.5 rounded-xl hover:bg-[#1a120c] transition-colors"
      onClick={() => onChange(!checked)}
    >
      {Icon && <Icon className={`w-3.5 h-3.5 ${checked ? 'text-[#e5a95d]' : 'text-[#7a6a5c]'}`} />}
      {labelLeft && (
        <span className={`text-[11px] font-mono font-bold tracking-wider transition-colors ${checked ? 'text-[#e5a95d]' : 'text-[#7a6a5c]'}`}>
          {labelLeft}
        </span>
      )}
      <div
        className={`w-11 h-5 rounded-full p-0.5 transition-all duration-200 ease-in-out relative ${
          checked ? 'bg-gradient-to-r from-[#d9822b] to-[#b86214] shadow-md shadow-amber-950/40' : 'bg-[#221710]'
        } border border-[#3d2a1c]`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-[#fbf6ed] shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </div>
      {labelRight && (
        <span className={`text-[11px] font-mono font-bold tracking-wider transition-colors ${!checked ? 'text-[#e5a95d]' : 'text-[#7a6a5c]'}`}>
          {labelRight}
        </span>
      )}
      {badge && (
        <span className="hidden xl:inline text-[9px] font-malayalam px-1.5 py-0.5 rounded-md bg-[#23170e] text-[#a89382] border border-[#382518]">
          {badge}
        </span>
      )}
    </div>
  );
}

export function AmbiencePanel() {
  const {
    activePreset,
    rainVol, thunderVol, cricketsVol, chattingVol, fireplaceVol, birdsVol, windVol, kettleVol, glassClinkVol,
    rainActive, thunderActive, cricketsActive, chattingActive, fireplaceActive, birdsActive, windActive, kettleActive, glassClinkActive,
    isAmbienceOpen,
    setIsAmbienceOpen,
    setRainVol, setThunderVol, setCricketsVol, setChattingVol, setFireplaceVol, setBirdsVol, setWindVol, setKettleVol, setGlassClinkVol,
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

  // Kerala tea-stall signature presets
  const presets = [
    { id: 'mazha_sandhya', label: 'മഴ സന്ധ്യ', icon: '🌧️', sub: 'Monsoon Dusk' },
    { id: 'chaya_samayam', label: 'കട്ടൻ ചായ സമയം', icon: '☕', sub: 'Chai & Gossip' },
    { id: 'padhanam', label: 'ഏകാന്ത വായന', icon: '📖', sub: 'Quiet Reading' },
    { id: 'mazhakaalam', label: 'പെരുമഴക്കാലം', icon: '⛈️', sub: 'Heavy Downpour' },
    { id: 'raatri', label: 'ഗ്രാമ രാവ്', icon: '🌙', sub: 'Midnight Village' },
    { id: 'innathethu', label: 'വൈകുന്നേരം സ്പെഷ്യൽ', icon: '✨', sub: 'Vainneram Mix' },
  ];

  // 7 Environmental cards with Kerala acoustic flavor
  const soundCards = [
    {
      id: 'rain',
      malayalam: 'ചാറ്റൽ മഴ',
      english: 'TIN ROOF RAIN',
      desc: 'മഴത്തുള്ളികളുടെ താളം',
      icon: CloudRain,
      iconColor: 'text-[#60a5fa]',
      eqColor: '#60a5fa',
      cardGlow: 'from-[#141e2e]/40',
      vol: rainVol,
      active: rainActive,
      setVol: setRainVol,
      toggle: () => toggleSound('rain'),
    },
    {
      id: 'thunder',
      malayalam: 'ഇടിമിന്നൽ',
      english: 'GHATS THUNDER',
      desc: 'മലനിരകളിൽ നിന്നുള്ള മുഴക്കം',
      icon: Zap,
      iconColor: 'text-[#facc15]',
      eqColor: '#facc15',
      cardGlow: 'from-[#2e2612]/40',
      vol: thunderVol,
      active: thunderActive,
      setVol: setThunderVol,
      toggle: () => toggleSound('thunder'),
    },
    {
      id: 'crickets',
      malayalam: 'രാപ്പാടി & ചിലവീട്',
      english: 'NIGHT CRICKETS',
      desc: 'തോപ്പുകളിലെ ശാന്തത',
      icon: Bug,
      iconColor: 'text-[#4ade80]',
      eqColor: '#4ade80',
      cardGlow: 'from-[#142e1d]/40',
      vol: cricketsVol,
      active: cricketsActive,
      setVol: setCricketsVol,
      toggle: () => toggleSound('crickets'),
    },
    {
      id: 'chatting',
      malayalam: 'പീടിക ചർച്ച',
      english: 'STALL CHATTER',
      desc: 'ചായബെഞ്ചിലെ കുശലം',
      icon: MessageSquare,
      iconColor: 'text-[#cbd5e1]',
      eqColor: '#cbd5e1',
      cardGlow: 'from-[#201d2a]/40',
      vol: chattingVol,
      active: chattingActive,
      setVol: setChattingVol,
      toggle: () => toggleSound('chatting'),
    },
    {
      id: 'fireplace',
      malayalam: 'അടുപ്പിലെ കനൽ',
      english: 'CHAI HEARTH',
      desc: 'വിറകടുപ്പിലെ പൊട്ടലുകൾ',
      icon: Flame,
      iconColor: 'text-[#fb923c]',
      eqColor: '#fb923c',
      cardGlow: 'from-[#331c10]/40',
      vol: fireplaceVol,
      active: fireplaceActive,
      setVol: setFireplaceVol,
      toggle: () => toggleSound('fireplace'),
    },
    {
      id: 'birds',
      malayalam: 'സന്ധ്യാ പക്ഷികൾ',
      english: 'DUSK BIRDS',
      desc: 'കൂടണയുന്ന പക്ഷികൾ',
      icon: Bird,
      iconColor: 'text-[#c084fc]',
      eqColor: '#c084fc',
      cardGlow: 'from-[#2a1738]/40',
      vol: birdsVol,
      active: birdsActive,
      setVol: setBirdsVol,
      toggle: () => toggleSound('birds'),
    },
    {
      id: 'wind',
      malayalam: 'ഇടവപ്പാതി കാറ്റ്',
      english: 'MONSOON BREEZE',
      desc: 'തെങ്ങിൻതോപ്പിലെ കുളിർകാറ്റ്',
      icon: Wind,
      iconColor: 'text-[#38bdf8]',
      eqColor: '#38bdf8',
      cardGlow: 'from-[#122733]/40',
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
      <div className="w-full max-w-5xl rounded-3xl bg-gradient-to-b from-[#120d09] via-[#0f0b08] to-[#0a0705] border border-[#2f2017] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Vainneram Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#241710] bg-[#140e0a] flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d9822b] to-[#994d13] p-0.5 shadow-lg shadow-black/50 flex items-center justify-center text-white">
              <span className="text-xl">🍵</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-vintage text-base font-bold text-[#f7f2e8] tracking-wide">
                  വൈകുന്നേരം അക്കോസ്റ്റിക് സ്റ്റുഡിയോ
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#29170c] border border-[#d9822b]/40 text-[#e5a95d] font-mono font-semibold">
                  CHAI LOUNGE
                </span>
              </div>
              <p className="text-[11px] text-[#8c7b6f] font-malayalam">
                നാടൻ ചായപ്പീടികയിലെ അന്തരീക്ഷ ശബ്ദങ്ങളും ഗ്രാമഫോൺ സംഗീതവും
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAmbienceOpen(false)}
            className="p-2 rounded-2xl text-[#8c7b6f] hover:text-[#f7f2e8] hover:bg-[#211610] transition-colors border border-transparent hover:border-[#38261a]"
            title="Close console"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Console Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* 1. SIGNATURE PRESETS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-[#8c7766] uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#d9822b]" />
                പ്രീസെറ്റുകൾ • ATMOSPHERE PRESETS
              </p>
              <span className="text-[10px] text-[#715d4e] font-malayalam hidden sm:inline">
                ഒരു ക്ലിക്കിൽ അന്തരീക്ഷം മാറ്റാം
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {presets.map((preset) => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-gradient-to-r from-[#2e1d11] to-[#22150c] border-[#d9822b] text-[#f7f2e8] shadow-md shadow-amber-950/40 ring-1 ring-[#d9822b]/50'
                        : 'bg-[#150f0b] border-[#291d15] text-[#9c897a] hover:text-[#f7f2e8] hover:border-[#3d2c20]'
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span className="font-malayalam text-xs font-semibold">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ACOUSTIC MODIFIERS ROW: SLEEP TIMER + VIBE + SPATIAL + STALL ACCENTS */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#140f0a] border border-[#261911] shadow-inner">
            {/* Sleep Timer Section */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#8c7766] tracking-widest font-mono flex items-center gap-1 mr-1">
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

              {sleepTimerRemaining !== null && (
                <div className="flex items-center gap-1.5 ml-1 px-2.5 py-0.5 rounded-full bg-[#2a170d] border border-[#d9822b]/40 text-[#e5a95d] text-xs font-mono">
                  <span>{formatSleepRemaining(sleepTimerRemaining)}</span>
                  <button onClick={clearSleepTimer} className="hover:text-white" title="Cancel sleep timer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Vainneram Audio Character Switches */}
            <div className="flex items-center gap-4">
              {/* Muffled (Kattan Vibe) Switch */}
              <VainneramSwitch
                checked={isMuffled}
                onChange={toggleMuffled}
                labelLeft="കട്ടൻ VIBE"
                labelRight="CLEAR"
                badge="ചായപ്പീടിക മൂഡ്"
              />

              {/* 3D Spatial Audio Switch */}
              <VainneramSwitch
                checked={isSpatialAudio}
                onChange={toggleSpatialAudio}
                labelLeft="3D SPATIAL"
                labelRight="STEREO"
                badge="റൂം ശബ്ദം"
              />
            </div>

            {/* Quick Tea Stall Accents (Kettle Steam & Glass Clink) */}
            <div className="flex items-center gap-2 border-l border-[#2e1f16] pl-3">
              <button
                onClick={() => toggleSound('kettle')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-malayalam border transition-all ${
                  kettleActive
                    ? 'bg-[#29170d] border-[#d9822b] text-[#e5a95d] shadow-sm'
                    : 'bg-[#18110b] border-[#261a12] text-[#7a685a] hover:text-[#e0cfbe]'
                }`}
                title="Steaming tea kettle hiss"
              >
                <Coffee className="w-3 h-3 text-[#d9822b]" />
                <span>കെറ്റിൽ തിളപ്പ്</span>
              </button>

              <button
                onClick={() => toggleSound('glassClink')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-malayalam border transition-all ${
                  glassClinkActive
                    ? 'bg-[#29170d] border-[#d9822b] text-[#e5a95d] shadow-sm'
                    : 'bg-[#18110b] border-[#261a12] text-[#7a685a] hover:text-[#e0cfbe]'
                }`}
                title="Tea glass clink and spoon stir"
              >
                <UtensilsCrossed className="w-3 h-3 text-[#38bdf8]" />
                <span>ഗ്ലാസ് അടി</span>
              </button>
            </div>
          </div>

          {/* Custom Sleep Timer Input Popover */}
          {isCustomTimerOpen && (
            <form onSubmit={handleCustomTimerSubmit} className="flex items-center gap-2 p-3 rounded-2xl bg-[#1c130d] border border-[#3e291b]">
              <span className="text-xs text-[#b8a798]">Enter sleep timer minutes:</span>
              <input
                type="number"
                min="1"
                max="600"
                value={customMinutesInput}
                onChange={(e) => setCustomMinutesInput(e.target.value)}
                placeholder="45"
                className="w-20 px-2.5 py-1 rounded-xl bg-[#120d09] border border-[#2e2118] text-xs text-white focus:outline-none focus:border-[#d9822b]"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-xl bg-[#d9822b] text-white text-xs font-medium hover:bg-[#e69a38]"
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

          {/* 3. EIGHT SIGNATURE VAINNERAM CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cards 1-7: Procedural Environmental Synthesizers */}
            {soundCards.map((sc) => {
              const Icon = sc.icon;
              const percent = Math.round(sc.vol * 100);

              return (
                <div
                  key={sc.id}
                  className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden bg-gradient-to-b ${sc.cardGlow} ${
                    sc.active
                      ? 'bg-[#18120c] border-[#3f2b1d] shadow-lg shadow-black/50 ring-1 ring-[#d9822b]/25'
                      : 'bg-[#120d09] border-[#221811] opacity-80 hover:opacity-100 hover:border-[#2e2118]'
                  }`}
                >
                  {/* Card Header: Icon + Malayalam Title + Subtitle */}
                  <div className="flex items-start gap-3 mb-2 z-10">
                    <div className={`p-2.5 rounded-2xl bg-[#1a130e] ${sc.iconColor} border border-[#2d1e15] shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-malayalam text-base font-bold text-[#f7f2e8] leading-tight truncate">
                        {sc.malayalam}
                      </h4>
                      <p className="text-[10px] font-mono tracking-widest text-[#8a7666] uppercase truncate">
                        {sc.english}
                      </p>
                    </div>
                  </div>

                  {/* Organic Equalizer Visualizer */}
                  <div className="my-1 z-10">
                    <VainneramEqualizer active={sc.active} color={sc.eqColor} barCount={13} />
                  </div>

                  {/* Volume Slider with glowing thumb */}
                  <div className="mt-2 mb-3 z-10">
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

                  {/* Card Footer: Percentage & Toggle */}
                  <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-[#231710] z-10">
                    <span className="text-[#8c7b6f] font-semibold">{percent}%</span>
                    <button
                      onClick={sc.toggle}
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider transition-all uppercase ${
                        sc.active
                          ? 'bg-gradient-to-r from-[#382012] to-[#25150c] border border-[#d9822b] text-[#f7f2e8] shadow-sm'
                          : 'bg-[#18110b] border border-[#261b14] text-[#6b5c50] hover:text-[#b8a798]'
                      }`}
                    >
                      {sc.active ? 'ഓൺ ON' : 'ഓഫ് OFF'}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Card 8: ഗ്രാമഫോൺ പാട്ടുകൾ / VAINNERAM JUKEBOX */}
            <div
              className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden bg-gradient-to-b from-[#2e1c0e]/40 ${
                isPlaying
                  ? 'bg-[#19130d] border-[#d9822b]/50 shadow-xl shadow-amber-950/25 ring-1 ring-[#d9822b]/40'
                  : 'bg-[#120d09] border-[#291d15]'
              }`}
            >
              {/* Card Header: Icon + Titles + Volume readout */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-2xl bg-[#24170e] text-[#d9822b] border border-[#3e2718] shadow-sm flex-shrink-0">
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-malayalam text-base font-bold text-[#f7f2e8] leading-tight truncate">
                      പീടിക ഗ്രാമഫോൺ
                    </h4>
                    <p className="text-[10px] font-mono tracking-widest text-[#8a7666] uppercase truncate">
                      VAINNERAM JUKEBOX
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right flex-shrink-0 pl-1">
                  <span className="text-xs font-mono font-bold text-[#e5a95d]">
                    {Math.round(volume * 100)}%
                  </span>
                  <span className="text-[9px] font-mono text-[#6b5c50]">VOL</span>
                </div>
              </div>

              {/* Music Visualizer */}
              <div className="my-1">
                <VainneramEqualizer active={isPlaying} color="#d9822b" barCount={13} />
              </div>

              {/* Track Title and Artist */}
              <div className="mt-1 mb-1.5 truncate">
                <p className="text-xs font-semibold text-[#f7f2e8] truncate" title={currentTrack?.title}>
                  {currentTrack ? currentTrack.title : 'ചായപ്പാട്ടുകൾ (Select song)'}
                </p>
                <p className="text-[10px] text-[#8c7b6f] truncate">
                  {currentTrack ? (currentTrack.artist || 'Malayalam🤍') : 'Vainneram Music'}
                </p>
              </div>

              {/* Seek Bar with dual timestamps */}
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

              {/* Jukebox Transport Controls */}
              <div className="flex items-center justify-between py-1 border-t border-[#231710]">
                <button
                  onClick={playPrevious}
                  disabled={!currentTrack}
                  className="p-1 rounded-lg text-[#8c7b6f] hover:text-[#f7f2e8] hover:bg-[#20150d] disabled:opacity-30 transition-colors"
                  title="Previous"
                >
                  <SkipBack className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  onClick={togglePlayPause}
                  disabled={!currentTrack && libraryTracks.length === 0}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-[#d9822b] to-[#b35a12] hover:from-[#e69a38] hover:to-[#c66718] text-white flex items-center justify-center shadow-lg shadow-black/50 transition-transform active:scale-95 disabled:opacity-40"
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
                  className="p-1 rounded-lg text-[#8c7b6f] hover:text-[#f7f2e8] hover:bg-[#20150d] disabled:opacity-30 transition-colors"
                  title="Next"
                >
                  <SkipForward className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  onClick={toggleShuffle}
                  className={`p-1 rounded-lg transition-colors ${
                    isShuffle ? 'text-[#d9822b] bg-[#29170c]' : 'text-[#6b5c50] hover:text-[#f7f2e8]'
                  }`}
                  title={isShuffle ? 'Shuffle on' : 'Shuffle off'}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Select Song Dropdown */}
              <div className="relative mt-2" ref={dropdownRef}>
                <button
                  onClick={() => setIsSongDropdownOpen(prev => !prev)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#1b130e] border border-[#2e2118] text-left text-xs text-[#d5c5b5] hover:text-white hover:border-[#423023] transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Radio className="w-3 h-3 text-[#d9822b] flex-shrink-0" />
                    <span className="truncate">
                      {currentTrack ? currentTrack.title : 'Select Song (പാട്ട് തിരഞ്ഞെടുക്കൂ)'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8c7b6f] flex-shrink-0" />
                </button>

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
