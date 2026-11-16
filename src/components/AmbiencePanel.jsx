import React from 'react';
import {
  X,
  CloudRain,
  Coffee,
  Radio,
  Zap,
  UtensilsCrossed,
  Flame,
  Bug,
  Sparkles,
  Power,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAmbience } from '../context/AmbienceContext';

export function AmbiencePanel() {
  const {
    isEnabled,
    activePreset,
    rainVol, thunderVol, kettleVol, glassClinkVol, sizzleVol, radioWarmthVol, cricketsVol,
    rainActive, thunderActive, kettleActive, glassClinkActive, sizzleActive, radioWarmthActive, cricketsActive,
    isAmbienceOpen,
    setIsAmbienceOpen,
    setRainVol, setThunderVol, setKettleVol, setGlassClinkVol, setSizzleVol, setRadioWarmthVol, setCricketsVol,
    toggleAmbience,
    toggleSound,
    applyPreset
  } = useAmbience();

  if (!isAmbienceOpen) return null;

  const presets = [
    { id: 'heavy_rain', label: 'Monsoon Rain', malayalam: 'കനത്ത മഴ', icon: '🌧️' },
    { id: 'busy_stall', label: 'Tea Stall Rush', malayalam: 'ചായപ്പീടിക', icon: '☕' },
    { id: 'quiet_night', label: 'Quiet Dusk', malayalam: 'ശാന്ത സന്ധ്യ', icon: '🦗' },
    { id: 'retro_radio', label: 'Vintage Radio', malayalam: 'പഴയ റേഡിയോ', icon: '📻' }
  ];

  const soundControls = [
    {
      id: 'rain',
      label: 'Rain on Tin Roof',
      malayalam: 'ചാറ്റൽ മഴ',
      icon: CloudRain,
      iconColor: 'text-[#60a5fa]',
      val: rainVol,
      active: rainActive,
      set: setRainVol
    },
    {
      id: 'thunder',
      label: 'Distant Thunder',
      malayalam: 'ഇടിമിന്നൽ',
      icon: Zap,
      iconColor: 'text-[#facc15]',
      val: thunderVol,
      active: thunderActive,
      set: setThunderVol
    },
    {
      id: 'kettle',
      label: 'Kettle & Steaming Chai',
      malayalam: 'ചായപ്പീടിക',
      icon: Coffee,
      iconColor: 'text-[#d9822b]',
      val: kettleVol,
      active: kettleActive,
      set: setKettleVol
    },
    {
      id: 'glassClink',
      label: 'Tea Glass Clink & Stir',
      malayalam: 'ചായ ഗ്ലാസ് അടി',
      icon: UtensilsCrossed,
      iconColor: 'text-[#38bdf8]',
      val: glassClinkVol,
      active: glassClinkActive,
      set: setGlassClinkVol
    },
    {
      id: 'sizzle',
      label: 'Parippuvada Sizzle',
      malayalam: 'എണ്ണക്കടി വറുക്കൽ',
      icon: Flame,
      iconColor: 'text-[#f97316]',
      val: sizzleVol,
      active: sizzleActive,
      set: setSizzleVol
    },
    {
      id: 'radio',
      label: 'Transistor Radio Warmth',
      malayalam: 'പഴയ റേഡിയോ',
      icon: Radio,
      iconColor: 'text-[#deb17a]',
      val: radioWarmthVol,
      active: radioWarmthActive,
      set: setRadioWarmthVol
    },
    {
      id: 'crickets',
      label: 'Night Crickets & Breeze',
      malayalam: 'രാപ്പാടി & കാറ്റ്',
      icon: Bug,
      iconColor: 'text-[#4ade80]',
      val: cricketsVol,
      active: cricketsActive,
      set: setCricketsVol
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-[#12241c] border border-[#264436] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1d382c] bg-[#0c1813] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#183628] text-[#d9822b] shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-vintage text-base font-semibold text-[#f7f2e8]">
                Tea Stall Atmosphere & Sound Effects
              </h3>
              <p className="text-[11px] font-malayalam text-[#d9822b]">
                ശബ്ദങ്ങൾ ഓരോന്നായി ഓൺ / ഓഫ് ചെയ്യാം
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAmbienceOpen(false)}
            className="p-1.5 rounded-xl text-[#7f9689] hover:text-[#f7f2e8] hover:bg-[#183427] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0e1d17] border border-[#213e31] shadow-inner">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌧️</span>
              <div>
                <p className="text-xs font-bold text-[#f7f2e8]">Master Atmosphere</p>
                <p className="text-[11px] text-[#8aa093]">Turn all environmental soundscapes on or off</p>
              </div>
            </div>
            <button
              onClick={toggleAmbience}
              className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                isEnabled ? 'bg-[#d9822b]' : 'bg-[#223d30]'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  isEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Quick Atmosphere Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#deb17a]">
                Quick Atmosphere Presets
              </label>
              <span className="text-[10px] text-[#718d7f]">Select mood combination</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => {
                const isActive = isEnabled && activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-[#1b382b] border-[#d9822b] text-[#f7f2e8] shadow-md'
                        : 'bg-[#0e1d17] border-[#1d362a] text-[#8ea498] hover:border-[#2f5542] hover:text-[#f7f2e8]'
                    }`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{p.label}</p>
                      <p className="text-[10px] font-malayalam text-[#deb17a]">{p.malayalam}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Individual Sound Controls with ON/OFF Switches */}
          <div className="space-y-3 pt-2 border-t border-[#1d382c]">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#deb17a]">
                Individual Sound Controls
              </label>
              <span className="text-[10px] text-[#8aa093]">Toggle each effect ON or OFF</span>
            </div>

            <div className="space-y-2.5">
              {soundControls.map((item) => {
                const Icon = item.icon;
                const isItemOn = isEnabled && item.active;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isItemOn
                        ? 'bg-[#0f2119] border-[#224434]'
                        : 'bg-[#0a1510] border-[#16271e] opacity-75'
                    }`}
                  >
                    {/* Top row: Icon, Label, Malayalam, and ON/OFF Toggle Switch */}
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer select-none"
                        onClick={() => toggleSound(item.id)}
                      >
                        <div className={`p-1.5 rounded-lg transition-colors ${
                          isItemOn ? 'bg-[#183628]' : 'bg-[#111f18]'
                        }`}>
                          <Icon className={`w-4 h-4 ${isItemOn ? item.iconColor : 'text-[#50665a]'}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-semibold truncate ${
                              isItemOn ? 'text-[#f7f2e8]' : 'text-[#6b8577]'
                            }`}>
                              {item.label}
                            </span>
                            <span className="text-[10px] font-malayalam text-[#deb17a]/80 hidden sm:inline">
                              ({item.malayalam})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Individual ON/OFF Switch Button */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-mono font-medium ${
                          isItemOn ? 'text-[#deb17a]' : 'text-[#4e6357]'
                        }`}>
                          {isItemOn ? `${Math.round(item.val * 100)}%` : 'OFF'}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleSound(item.id)}
                          className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                            isItemOn ? 'bg-[#d9822b]' : 'bg-[#1a3025]'
                          }`}
                          title={`Turn ${item.label} ${isItemOn ? 'OFF' : 'ON'}`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                              isItemOn ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Bottom row: Volume Slider */}
                    <div className="pt-0.5">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.02"
                        value={item.val}
                        onChange={(e) => item.set(parseFloat(e.target.value))}
                        disabled={!isItemOn}
                        className={`w-full transition-opacity ${
                          !isItemOn ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
