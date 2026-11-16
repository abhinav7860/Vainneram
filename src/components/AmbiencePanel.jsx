import React from 'react';
import { X, CloudRain, Coffee, Radio, Volume2, Sparkles } from 'lucide-react';
import { useAmbience } from '../context/AmbienceContext';

export function AmbiencePanel() {
  const {
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
  } = useAmbience();

  if (!isAmbienceOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-[#12241c] border border-[#264436] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1d382c] bg-[#0c1813]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#183628] text-[#d9822b]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-vintage text-base font-semibold text-[#f7f2e8]">
                Kerala Tea Stall Ambience
              </h3>
              <p className="text-[11px] font-malayalam text-[#d9822b]">
                ചായപ്പീടികയിലെ മഴയും സംഗീതവും
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAmbienceOpen(false)}
            className="p-1 rounded-lg text-[#7f9689] hover:text-[#f7f2e8] hover:bg-[#183427] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ambience Controls */}
        <div className="p-5 space-y-5">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0e1d17] border border-[#213e31]">
            <div className="flex items-center gap-3">
              <span className="text-xl">🌧️</span>
              <div>
                <p className="text-xs font-semibold text-[#f7f2e8]">Ambient Background Layer</p>
                <p className="text-[10px] text-[#8aa093]">Plays alongside your music</p>
              </div>
            </div>
            <button
              onClick={toggleAmbience}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                isEnabled ? 'bg-[#d9822b]' : 'bg-[#223d30]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  isEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Layer 1: Rain on Tin Roof */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-[#dce7e1] font-medium">
                <CloudRain className="w-4 h-4 text-[#60a5fa]" />
                Rain on Tin Roof (ചാറ്റൽ മഴ)
              </span>
              <span className="text-[11px] text-[#7f9689] font-mono">
                {Math.round(rainVol * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={rainVol}
              onChange={(e) => setRainVol(parseFloat(e.target.value))}
              disabled={!isEnabled}
              className={`w-full ${!isEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Layer 2: Tea Kettle & Steam */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-[#dce7e1] font-medium">
                <Coffee className="w-4 h-4 text-[#d9822b]" />
                Kettle & Steaming Chai (ചായപ്പീടിക)
              </span>
              <span className="text-[11px] text-[#7f9689] font-mono">
                {Math.round(kettleVol * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={kettleVol}
              onChange={(e) => setKettleVol(parseFloat(e.target.value))}
              disabled={!isEnabled}
              className={`w-full ${!isEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Layer 3: Transistor Radio Warmth */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-[#dce7e1] font-medium">
                <Radio className="w-4 h-4 text-[#deb17a]" />
                Transistor Radio Warmth (പഴയ റേഡിയോ)
              </span>
              <span className="text-[11px] text-[#7f9689] font-mono">
                {Math.round(radioWarmthVol * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={radioWarmthVol}
              onChange={(e) => setRadioWarmthVol(parseFloat(e.target.value))}
              disabled={!isEnabled}
              className={`w-full ${!isEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Mood hint */}
          <div className="p-3 rounded-lg bg-[#0e1d17] border border-[#1b3428] text-[11px] text-[#869e91] leading-relaxed">
            💡 <strong className="text-[#deb17a]">Atmospheric Note:</strong> Synthesized purely in-browser using Web Audio. Adjust the levels to blend rain on a tin awning with your favorite songs.
          </div>
        </div>
      </div>
    </div>
  );
}
