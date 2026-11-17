import React, { useState, useEffect } from 'react';
import { Play, Pause, Disc, Sparkles, Volume2, Music, RotateCw, Shuffle, Headphones, Activity } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration, getMoodBadge } from '../utils/formatters';
import { api } from '../utils/api';
import { playNeedleCrackle } from '../utils/audioEffects';

export function TurntableDeck({ compact = false, allTracks = [] }) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    seekTo,
    isMuffled,
    toggleMuffled,
    isSpatialAudio,
    toggleSpatialAudio,
    queue,
    playTrack
  } = usePlayer();

  const [rpm, setRpm] = useState('33');
  const [pitch, setPitch] = useState(0);
  const [tracksPool, setTracksPool] = useState(allTracks || []);

  useEffect(() => {
    if (allTracks && allTracks.length > 0) {
      setTracksPool(allTracks);
    } else {
      api.getTracks().then(res => {
        if (res?.tracks) setTracksPool(res.tracks);
      }).catch(err => console.warn('Could not load tracks for turntable:', err));
    }
  }, [allTracks]);

  const mood = currentTrack ? getMoodBadge(currentTrack.mood_tag) : null;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Spin speed dynamically adjusts with 33 vs 45 RPM
  const spinSpeed = rpm === '45' ? '2.4s' : '3.6s';

  const playRandomRecord = async () => {
    let pool = tracksPool;
    if (!pool || pool.length === 0) {
      try {
        const res = await api.getTracks();
        pool = res?.tracks || [];
        setTracksPool(pool);
      } catch (err) {
        console.warn('Failed to load random track:', err);
      }
    }

    if (pool && pool.length > 0) {
      let randomIdx = Math.floor(Math.random() * pool.length);
      if (pool.length > 1 && currentTrack && pool[randomIdx].id === currentTrack.id) {
        randomIdx = (randomIdx + 1) % pool.length;
      }
      playTrack(pool[randomIdx], pool, randomIdx);
    }
  };

  const handleNeedleClick = async () => {
    if (!isPlaying) {
      playNeedleCrackle();
    }
    if (!currentTrack) {
      // Drop needle picks a random song itself!
      await playRandomRecord();
    } else {
      togglePlayPause();
    }
  };

  return (
    <div className={`relative rounded-3xl bg-gradient-to-b from-[#2a170d] via-[#1c100a] to-[#120a06] border-2 border-[#4a2b1a] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden select-none ${compact ? 'p-4' : 'p-5 sm:p-7'}`}>
      {/* 40W Warm Filament overhead ambient spotlight */}
      <div className="absolute -top-20 left-1/4 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-filament" />
      <div className="absolute top-1/2 right-10 w-60 h-60 bg-[#d97706]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Brass Corner Brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#d97706]/80 pointer-events-none" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#d97706]/80 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#d97706]/80 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#d97706]/80 pointer-events-none" />

      {/* Header bar of the Turntable Deck */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#382014] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d97706] to-[#78350f] flex items-center justify-center text-white shadow-md border border-[#f59e0b]/40">
            <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h3 className="font-serif-vintage text-base sm:text-lg font-bold text-[#fef3c7] tracking-wide flex items-center gap-2">
              <span>നാടൻ വിനൈൽ ടേൺടേബിൾ</span>
              <span className="text-[9px] font-mono font-normal tracking-[0.2em] uppercase text-[#deb17a] hidden sm:inline">
                • VINTAGE VINYL DECK
              </span>
            </h3>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#d97706] font-bold">
              HMV STEREO 33⅓ RPM • MODEL 1978
            </span>
          </div>
        </div>

        {/* Live Strobe Status Lamp */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#100905] border border-[#d97706]/40 shadow-inner">
          <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isPlaying ? 'bg-amber-400 animate-ping shadow-[0_0_8px_#f59e0b]' : 'bg-[#4a2e1d]'
          }`} />
          <span className="text-[10px] font-mono font-bold text-[#fed7aa]">
            {isPlaying ? 'SPINNING • LIVE' : 'MOTOR STOPPED'}
          </span>
        </div>
      </div>

      {/* Main Turntable Workstation (Platter on Left, Mechanical Arm & Controls on Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* LEFT / CENTER: THE 12-INCH ROTATING VINYL RECORD ON PLATTER */}
        <div className="md:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-84 md:h-84 flex items-center justify-center">
            
            {/* Turntable Platter Rim with Strobe Timing Dots */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#301c12] via-[#1a0e07] to-[#0a0503] border-4 border-[#52301e] shadow-[0_15px_35px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(0,0,0,0.8)] flex items-center justify-center">
              {/* Rubber Slipmat Rings */}
              <div className="w-[94%] h-[94%] rounded-full bg-[#120a06] border-2 border-[#382014] relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-4 rounded-full border border-[#2b170e]/80" />
                <div className="absolute inset-8 rounded-full border border-[#2b170e]/60" />
                <div className="absolute inset-14 rounded-full border border-[#2b170e]/40" />
              </div>
            </div>

            {/* THE ROTATING VINYL RECORD */}
            <div
              onClick={handleNeedleClick}
              className={`relative w-[90%] h-[90%] rounded-full cursor-pointer transition-transform duration-700 ease-out flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.95)] ${
                isPlaying ? 'animate-vinyl-spin' : ''
              }`}
              style={{
                animationDuration: spinSpeed,
                animationPlayState: isPlaying ? 'running' : 'paused'
              }}
              title={isPlaying ? 'Click to pause turntable' : 'Click to drop needle and spin record'}
            >
              {/* Deep Vinyl Black Grooved Base */}
              <div className="absolute inset-0 rounded-full bg-[#0d0d0d] border border-[#262626] shadow-inner overflow-hidden">
                {/* Vinyl Grooves (Micro rings) */}
                <div className="absolute inset-0 rounded-full opacity-70"
                  style={{
                    background: `repeating-radial-gradient(
                      circle at center,
                      #0f0f0f 0px,
                      #171717 1px,
                      #0a0a0a 2px,
                      #141414 3px
                    )`
                  }}
                />

                {/* Specular Light Reflections across grooves (Conic shimmer) */}
                <div className="absolute inset-0 rounded-full pointer-events-none opacity-40 mix-blend-screen"
                  style={{
                    background: `conic-gradient(
                      from 35deg,
                      rgba(255,255,255,0.22) 0deg,
                      transparent 40deg,
                      rgba(255,255,255,0.06) 80deg,
                      transparent 120deg,
                      rgba(255,255,255,0.25) 180deg,
                      transparent 220deg,
                      rgba(255,255,255,0.08) 270deg,
                      transparent 315deg,
                      rgba(255,255,255,0.22) 360deg
                    )`
                  }}
                />

                {/* Lead-in outer run-in groove */}
                <div className="absolute inset-2 rounded-full border border-[#333333]/50 pointer-events-none" />
                {/* Run-out inner lock groove */}
                <div className="absolute inset-24 sm:inset-28 rounded-full border-2 border-[#2b2b2b] pointer-events-none" />
              </div>

              {/* CENTER RECORD LABEL (Album Art + Malayalam Title) */}
              <div className="relative w-28 h-28 sm:w-34 sm:h-34 rounded-full overflow-hidden border-3 border-[#deb17a] shadow-[0_0_15px_rgba(0,0,0,0.8)] flex items-center justify-center bg-gradient-to-br from-[#381d10] to-[#120a06] z-10">
                {currentTrack?.cover_url ? (
                  <img
                    src={currentTrack.cover_url}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 bg-[#2a150b]">
                    <span className="text-2xl mb-0.5">{mood?.icon || '☕'}</span>
                    <span className="font-serif-vintage text-[9px] font-bold text-[#fef3c7] leading-tight line-clamp-1">
                      {currentTrack?.title || 'വൈകുന്നേരം'}
                    </span>
                    <span className="text-[7px] font-mono text-[#d97706] tracking-wider uppercase mt-0.5">
                      33⅓ RPM
                    </span>
                  </div>
                )}

                {/* Vintage Circular Label Ring Accent */}
                <div className="absolute inset-0 rounded-full border border-black/50 pointer-events-none" />
                <div className="absolute inset-1.5 rounded-full border border-white/20 pointer-events-none" />

                {/* Brass Center Spindle Hole */}
                <div className="absolute w-4 h-4 rounded-full bg-[#f59e0b] border-2 border-[#1c100a] shadow-md flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0a0503]" />
                </div>
              </div>
            </div>

            {/* MECHANICAL METAL TONEARM & CARTRIDGE */}
            <div
              onClick={handleNeedleClick}
              className="absolute -top-3 -right-2 sm:right-0 w-36 h-48 pointer-events-auto cursor-pointer z-20 group"
              title={isPlaying ? 'Tonearm tracking on record (Click to lift)' : 'Click tonearm to drop needle on record'}
            >
              {/* Tonearm Pivot Base and Gimbal */}
              <div className="absolute top-2 right-6 w-9 h-9 rounded-full bg-gradient-to-b from-[#78350f] via-[#451a03] to-[#1a0802] border-2 border-[#deb17a] shadow-xl flex items-center justify-center">
                {/* Silver Counterweight */}
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#94a3b8] to-[#f8fafc] border border-[#475569] shadow-inner" />
              </div>

              {/* Pivoting Tonearm Wand */}
              <div
                className={`absolute top-6 right-10 origin-top-right transition-transform duration-700 ease-in-out ${
                  isPlaying ? 'rotate-[25deg]' : 'rotate-[0deg]'
                }`}
                style={{
                  transformOrigin: '90% 10%'
                }}
              >
                {/* Metallic Chrome Tonearm Shaft */}
                <div className="w-1.5 h-36 bg-gradient-to-r from-[#cbd5e1] via-[#f8fafc] to-[#64748b] rounded-full shadow-lg relative">
                  {/* Cartridge and Stylus Head at the tip */}
                  <div className="absolute -bottom-3 -left-2 w-5 h-7 rounded-sm bg-gradient-to-b from-[#d97706] to-[#78350f] border border-[#fef3c7]/60 shadow-md transform rotate-[15deg] flex flex-col items-center justify-end pb-0.5">
                    {/* Glowing Needle Tip */}
                    <span className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-amber-300 shadow-[0_0_6px_#f59e0b]' : 'bg-stone-300'}`} />
                  </div>
                </div>
              </div>

              {/* Tonearm Rest Cradle */}
              <div className="absolute top-32 right-3 w-3 h-4 bg-[#382014] border border-[#deb17a]/50 rounded-t-sm" />
            </div>

          </div>

          {/* Prompt under platter */}
          <p className="mt-3 text-[11px] text-[#baa290] font-malayalam text-center flex items-center gap-1.5">
            <span>{isPlaying ? '🎵 സൂചി തിരിയുന്ന വിനൈലിൽ തട്ടി പാടുന്നു...' : '👆 റെക്കോർഡിലോ സൂചിയിലോ ക്ലിക്ക് ചെയ്യുക (Click record or tonearm to spin)'}</span>
          </p>
        </div>

        {/* RIGHT: TRACK METADATA & ANALOG TURNTABLE CONSOLE CONTROLS */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-4 bg-[#140b07] p-4 sm:p-5 rounded-2xl border border-[#3d2315] shadow-inner">
          
          {/* Paper Catalog Sleeve Label */}
          <div className="border-b border-[#382014] pb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#27140b] border border-[#d97706]/40 text-[9px] font-mono font-bold text-[#fed7aa] uppercase mb-1.5">
              <span>{mood?.icon || '📻'}</span>
              <span>{mood?.label || 'CHAYAKADA VINYL ARCHIVE'}</span>
            </div>

            <h4 className="font-serif-vintage text-lg sm:text-xl font-bold text-[#fef3c7] leading-snug line-clamp-2 drop-shadow">
              {currentTrack?.title || 'പാട്ട് തിരഞ്ഞെടുക്കുക'}
            </h4>
            <p className="text-xs text-[#deb17a] font-medium mt-0.5 line-clamp-1">
              {currentTrack?.artist || 'സൂചി വെയ്ക്കുമ്പോൾ റാൻഡം പാട്ട് തിരഞ്ഞെടുക്കും'}
            </p>
            <p className="text-[11px] text-[#8c7462] line-clamp-1 font-sans">
              {currentTrack?.album || 'Click Drop Needle to pick a random song from 113 cassettes'}
            </p>
          </div>

          {/* Analog Scrub Needle / Seek Timeline */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#deb17a] mb-1">
              <span>{formatDuration(currentTime)}</span>
              <span className="text-[9px] text-[#8c7462] uppercase tracking-wider">TRACK PROGRESS</span>
              <span>{formatDuration(duration)}</span>
            </div>
            <div className="relative flex items-center h-4">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                disabled={!currentTrack}
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Master Turntable Motor & Needle Drop Controls */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              {/* Start/Stop Platter Motor Button */}
              <button
                onClick={handleNeedleClick}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#c2410c] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-950/60 border border-[#fed7aa]/30 active:scale-95 transition-all"
                title={isPlaying ? 'Lift needle to pause' : currentTrack ? 'Drop needle to resume' : 'Drop needle to play a random record'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Lift Needle</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>{currentTrack ? 'Drop Needle' : 'Drop Needle (Random)'}</span>
                  </>
                )}
              </button>

              {/* Random Record Picker Button */}
              <button
                onClick={playRandomRecord}
                className="py-2.5 px-3 rounded-xl bg-[#22120a] hover:bg-[#331b0f] border border-[#d97706]/40 text-[#fed7aa] hover:text-[#fff] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                title="Spin a different random record from the 113 cassettes"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Random Record</span>
              </button>
            </div>

            {/* Acoustic Console: Muffled (Veranda) & Spatial Audio Controls */}
            <div className="grid grid-cols-2 gap-2">
              {/* Muffled Veranda Acoustic Filter Toggle */}
              <button
                onClick={toggleMuffled}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all select-none ${
                  isMuffled
                    ? 'bg-gradient-to-r from-[#331508] to-[#1c0a04] border-[#f97316] text-[#fed7aa] shadow-md shadow-orange-950/40 ring-1 ring-[#f97316]/50'
                    : 'bg-[#1e110a] border-[#382014] text-[#baa290] hover:text-[#fef3c7] hover:border-[#52301e]'
                }`}
                title="Muffled cozy tea-stall veranda acoustic filter"
              >
                <span>☕</span>
                <span className="truncate">{isMuffled ? 'Veranda: ON' : 'Veranda Tone'}</span>
              </button>

              {/* 4D Spatial Audio Toggle */}
              <button
                onClick={toggleSpatialAudio}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all select-none ${
                  isSpatialAudio
                    ? 'bg-gradient-to-r from-[#0c2430] to-[#061219] border-[#38bdf8] text-[#bae6fd] shadow-md shadow-cyan-950/40 ring-1 ring-[#38bdf8]/50'
                    : 'bg-[#1e110a] border-[#382014] text-[#baa290] hover:text-[#fef3c7] hover:border-[#52301e]'
                }`}
                title="Dynamic 4D Orbital Binaural Spatial Audio soundstage"
              >
                <span>🎧</span>
                <span className="truncate">{isSpatialAudio ? '4D Spatial: ON' : '4D Spatial'}</span>
              </button>
            </div>
          </div>

          {/* Dual Stereo Backlit Analog Needle VU Meter (L & R Channels) */}
          <div className="bg-[#100804] px-2.5 py-1.5 rounded-xl border border-[#382014] shadow-inner select-none">
            <div className="flex items-center justify-between text-[7px] font-mono text-[#8c7462] mb-1 px-1">
              <span className="text-[#deb17a] font-bold tracking-wider">ANALOG VU STEREO</span>
              <span className="tracking-widest">-20 -10 -5 0 +3 dB</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Left Channel VU Meter */}
              <div className="h-7 rounded bg-gradient-to-b from-[#1c0f08] to-[#120a05] border border-[#3e2417] relative overflow-hidden flex items-end justify-center px-2 pb-0.5 shadow-inner">
                <div className="absolute inset-x-1.5 top-1 h-[1px] bg-gradient-to-r from-[#22c55e]/60 via-[#eab308]/60 to-[#ef4444]/60" />
                <span className="absolute top-0.5 left-1 text-[7px] font-mono font-bold text-[#deb17a]">L</span>
                <div
                  className={`w-0.5 h-5 bg-gradient-to-t from-[#f59e0b] to-[#fef08a] shadow-[0_0_4px_#f59e0b] transition-transform duration-200 ${
                    isPlaying ? 'animate-vu-needle-left' : 'rotate-[-32deg]'
                  }`}
                  style={{ transformOrigin: 'bottom center' }}
                />
                <div className="absolute bottom-0 w-2 h-1 rounded-t-full bg-[#3d2315] border border-[#d97706]/40" />
              </div>

              {/* Right Channel VU Meter */}
              <div className="h-7 rounded bg-gradient-to-b from-[#1c0f08] to-[#120a05] border border-[#3e2417] relative overflow-hidden flex items-end justify-center px-2 pb-0.5 shadow-inner">
                <div className="absolute inset-x-1.5 top-1 h-[1px] bg-gradient-to-r from-[#22c55e]/60 via-[#eab308]/60 to-[#ef4444]/60" />
                <span className="absolute top-0.5 left-1 text-[7px] font-mono font-bold text-[#deb17a]">R</span>
                <div
                  className={`w-0.5 h-5 bg-gradient-to-t from-[#f59e0b] to-[#fef08a] shadow-[0_0_4px_#f59e0b] transition-transform duration-200 ${
                    isPlaying ? 'animate-vu-needle-right' : 'rotate-[-28deg]'
                  }`}
                  style={{ transformOrigin: 'bottom center' }}
                />
                <div className="absolute bottom-0 w-2 h-1 rounded-t-full bg-[#3d2315] border border-[#d97706]/40" />
              </div>
            </div>
          </div>

          {/* Speed & Pitch Deck Controls */}
          <div className="pt-2 border-t border-[#29170e] flex items-center justify-between text-[10px] font-mono text-[#a88a74]">
            {/* RPM Speed Selector Buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#deb17a]">SPEED:</span>
              <button
                onClick={() => setRpm('33')}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  rpm === '33'
                    ? 'bg-[#d97706] text-white border-[#f59e0b] font-bold shadow-sm'
                    : 'bg-[#180e08] border-[#382014] text-[#8c7462] hover:text-[#fef3c7]'
                }`}
              >
                33⅓
              </button>
              <button
                onClick={() => setRpm('45')}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  rpm === '45'
                    ? 'bg-[#d97706] text-white border-[#f59e0b] font-bold shadow-sm'
                    : 'bg-[#180e08] border-[#382014] text-[#8c7462] hover:text-[#fef3c7]'
                }`}
              >
                45
              </button>
            </div>

            {/* Platter Drive Type */}
            <span className="text-[9px] uppercase tracking-widest text-[#8c7462]">
              BELT DRIVE • HI-FI
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
