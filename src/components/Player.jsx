import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  CloudRain,
  Maximize2,
  Minimize2,
  AlertCircle,
  Disc
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAmbience } from '../context/AmbienceContext';
import { formatDuration, getMoodBadge } from '../utils/formatters';
import { TurntableDeck } from './TurntableDeck';

export function Player() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    queue,
    isQueueOpen,
    isLoadingAudio,
    playbackError,
    isMuffled,
    isSpatialAudio,
    setIsQueueOpen,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    toggleMuffled,
    toggleSpatialAudio
  } = usePlayer();

  const { isEnabled: isAmbienceEnabled, setIsAmbienceOpen } = useAmbience();
  const [isExpanded, setIsExpanded] = useState(false);

  const mood = currentTrack ? getMoodBadge(currentTrack.mood_tag) : null;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value);
    seekTo(val);
  };

  return (
    <>
      {/* Playback error banner if any */}
      {playbackError && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 bg-[#3d1919] border border-[#7a2f2f] text-[#ffb4b4] px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xl backdrop-blur-md">
          <AlertCircle className="w-4 h-4 text-[#e57373]" />
          <span>{playbackError}</span>
        </div>
      )}

      {/* Persistent Bottom Bar: Mobile = Docked above bottom nav | Desktop = Fixed to viewport bottom */}
      <footer className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[#160d08] via-[#1c100a] to-[#160d08] border-t-2 border-[#3d2315] shadow-[0_-12px_40px_rgba(0,0,0,0.95)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#d97706]/40 before:to-transparent select-none">
        
        {/* Sleek Top Track Progress Bar (Always visible on mobile & desktop) */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#29150c] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#d97706] to-[#f59e0b] transition-all duration-300"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* A. MOBILE SLEEK MINI-PLAYER (Zero Clutter, Tap to Open Turntable) */}
        {/* ────────────────────────────────────────────────────────── */}
        <div className="md:hidden flex items-center justify-between px-3 py-2 h-14">
          {/* Left: Tap anywhere to open Full Turntable Deck */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer pr-2 select-none"
          >
            {/* Rotating Mini Vinyl Record */}
            <div
              className={`w-10 h-10 rounded-full border border-[#382014] shadow-md shrink-0 relative overflow-hidden flex items-center justify-center ${
                isPlaying ? 'animate-vinyl-spin' : ''
              }`}
              style={{
                background: 'repeating-radial-gradient(circle at center, #0d0d0d 0px, #1a1a1a 1px, #080808 2px, #141414 3px)'
              }}
            >
              <div className="w-[45%] h-[45%] rounded-full overflow-hidden border border-[#fed7aa] relative z-10 flex items-center justify-center bg-[#29150c]">
                {currentTrack?.cover_url ? (
                  <img src={currentTrack.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[7px]">🍵</span>
                )}
                <div className="absolute w-1 h-1 rounded-full bg-black border border-white/60" />
              </div>
            </div>

            {/* Song Title, Artist & Active Acoustic Filter Chips */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#fef3c7] truncate font-serif-vintage tracking-wide">
                {currentTrack?.title || 'വൈകുന്നേരം ചായക്കട'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[10px] text-[#a88a74] truncate">
                  {currentTrack?.artist || 'പാട്ടുകൾ തിരഞ്ഞെടുക്കുക'}
                </p>
                {/* Clean non-intrusive acoustic chips */}
                {isMuffled && (
                  <span className="px-1.5 py-0.2 rounded bg-[#331508] border border-[#f97316]/50 text-[#fed7aa] text-[8px] font-mono shrink-0 font-bold">
                    ☕ Veranda
                  </span>
                )}
                {isSpatialAudio && (
                  <span className="px-1.5 py-0.2 rounded bg-[#0c2430] border border-[#38bdf8]/50 text-[#bae6fd] text-[8px] font-mono shrink-0 font-bold">
                    🎧 4D
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Touch-Friendly Playback Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={playPrevious}
              disabled={!currentTrack}
              className="p-1.5 text-[#deb17a] hover:text-[#fef3c7] active:scale-95 disabled:opacity-30"
              title="Previous song"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d97706] to-[#b45309] text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoadingAudio ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => playNext(false)}
              disabled={!currentTrack}
              className="p-1.5 text-[#deb17a] hover:text-[#fef3c7] active:scale-95 disabled:opacity-30"
              title="Next song"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => setIsExpanded(true)}
              className="p-1.5 text-[#8c7462] hover:text-[#fed7aa] active:scale-95"
              title="Open full turntable deck"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* B. DESKTOP FULL-FEATURED 3-COLUMN PLAYER BAR (MD & ABOVE) */}
        {/* ────────────────────────────────────────────────────────── */}
        <div className="hidden md:flex max-w-[1800px] mx-auto items-center justify-between gap-3 lg:gap-6 px-4 sm:px-6 py-2.5 md:py-3">
          {/* Left: Track Information with Rotating Vinyl Disc */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-[180px] sm:w-[220px] xl:w-[260px] shrink-0 min-w-0">
            {currentTrack ? (
              <>
                {/* Mini Rotating Vinyl Record Platter */}
                <div
                  onClick={() => setIsExpanded(true)}
                  className={`w-11 h-11 md:w-12 md:h-12 rounded-full border-2 border-[#2b2b2b] shadow-xl flex-shrink-0 relative overflow-hidden flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 group ${
                    isPlaying ? 'animate-vinyl-spin' : ''
                  }`}
                  style={{
                    background: 'repeating-radial-gradient(circle at center, #0d0d0d 0px, #1a1a1a 1px, #080808 2px, #141414 3px)'
                  }}
                  title="Click to open Full Vinyl Turntable Deck"
                >
                  {/* Conic specular groove sheen */}
                  <div
                    className="absolute inset-0 rounded-full opacity-45 mix-blend-screen pointer-events-none"
                    style={{
                      background: 'conic-gradient(from 45deg, rgba(255,255,255,0.3) 0deg, transparent 45deg, rgba(255,255,255,0.1) 90deg, transparent 135deg, rgba(255,255,255,0.3) 180deg, transparent 225deg, rgba(255,255,255,0.1) 270deg, transparent 315deg, rgba(255,255,255,0.3) 360deg)'
                    }}
                  />

                  {/* Center album art label with spindle */}
                  <div className="w-[45%] h-[45%] rounded-full overflow-hidden border border-[#fed7aa] relative z-10 flex items-center justify-center bg-[#29150c] shadow-inner">
                    {currentTrack.cover_url ? (
                      <img
                        src={currentTrack.cover_url}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[8px]">🍵</span>
                    )}
                    {/* Spindle hole */}
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-black border border-white/60" />
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full z-20">
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p
                      className="text-xs md:text-sm font-bold text-[#f7f2e8] truncate cursor-pointer hover:text-[#d97706] transition-colors font-serif-vintage tracking-wide"
                      onClick={() => setIsExpanded(true)}
                      title={currentTrack.title}
                    >
                      {currentTrack.title}
                    </p>

                    {/* Spinning Indicator Badge */}
                    <span
                      onClick={() => setIsExpanded(true)}
                      className={`hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-mono font-bold tracking-widest uppercase cursor-pointer select-none ${
                        isPlaying
                          ? 'bg-[#2a170e] border-[#d97706]/60 text-[#fed7aa]'
                          : 'bg-[#180e08] border-[#382014] text-[#8c7462]'
                      }`}
                      title={isPlaying ? 'Vinyl spinning at 33⅓ RPM' : 'Turntable stopped'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-amber-400 animate-ping' : 'bg-[#4a2e1d]'}`} />
                      <span>{isPlaying ? '33 RPM' : 'IDLE'}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a88a74] truncate" title={currentTrack.artist}>
                    {currentTrack.artist || 'Unknown Artist'}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5 text-xs text-[#a88a74]">
                <div className="w-10 h-10 rounded-full bg-[#160d08] border border-[#382014] flex items-center justify-center text-base shadow-inner">
                  🍵
                </div>
                <div className="hidden sm:block">
                  <p className="font-serif-vintage text-xs text-[#deb17a]">Vainneram</p>
                  <p className="text-[10px] text-[#8c7462] font-malayalam">പാട്ടുകൾ തിരഞ്ഞെടുക്കുക</p>
                </div>
              </div>
            )}
          </div>

          {/* Center: Playback Controls & Progress Bar */}
          <div className="flex flex-col items-center flex-1 max-w-[560px] min-w-0 px-1 sm:px-2">
            {/* Buttons row */}
            <div className="flex items-center gap-3 sm:gap-5 mb-1">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-md transition-colors hidden sm:block ${
                  isShuffle ? 'text-[#f59e0b]' : 'text-[#8c7462] hover:text-[#fef3c7]'
                }`}
                title={isShuffle ? 'Shuffle on' : 'Shuffle off'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Prev */}
              <button
                onClick={playPrevious}
                disabled={!currentTrack}
                className="p-1.5 rounded-full text-[#deb17a] hover:text-[#fef3c7] hover:bg-[#27140b] transition-colors disabled:opacity-30"
                title="Previous track"
              >
                <SkipBack className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              </button>

              {/* Play / Pause with glowing amber gradient */}
              <button
                onClick={togglePlayPause}
                disabled={!currentTrack && queue.length === 0}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#c2410c] text-white flex items-center justify-center shadow-lg shadow-amber-950/70 border border-[#fed7aa]/30 transition-transform active:scale-95 disabled:opacity-40"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isLoadingAudio ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={() => playNext(false)}
                disabled={!currentTrack}
                className="p-1.5 rounded-full text-[#deb17a] hover:text-[#fef3c7] hover:bg-[#27140b] transition-colors disabled:opacity-30"
                title="Next track"
              >
                <SkipForward className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded-md transition-colors hidden sm:block ${
                  repeatMode !== 'off' ? 'text-[#f59e0b]' : 'text-[#8c7462] hover:text-[#fef3c7]'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Seek Bar & Timers with fixed widths */}
            <div className="w-full flex items-center gap-2 sm:gap-2.5 text-[11px] font-mono text-[#a88a74]">
              <span className="w-9 text-right font-mono text-[10px] sm:text-[11px] text-[#a88a74] shrink-0 select-none">
                {formatDuration(currentTime)}
              </span>
              <div className="relative flex-1 flex items-center h-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeekChange}
                  disabled={!currentTrack}
                  className="w-full cursor-pointer disabled:opacity-40"
                />
              </div>
              <span className="w-9 text-left font-mono text-[10px] sm:text-[11px] text-[#a88a74] shrink-0 select-none">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Right: Ambience, Queue & Volume */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            {/* Muffled Quick Toggle with Tactile Slide Switch & Visible Label */}
            <button
              onClick={toggleMuffled}
              className={`px-2 sm:px-2.5 py-1.5 rounded-xl border text-[10px] font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 select-none ${
                isMuffled
                  ? 'bg-gradient-to-r from-[#2c1307] to-[#1c0d05] border-[#f97316] text-[#fed7aa] shadow-md shadow-orange-950/40 ring-1 ring-[#f97316]/50'
                  : 'bg-[#180e08] border-[#382014] text-[#a88a74] hover:text-[#fdf6e7] hover:border-[#52301e]'
              }`}
              title="Muffled cozy tea-stall veranda acoustic filter"
            >
              <span className="flex items-center gap-1">
                <span className="text-xs">☕</span>
                <span className="font-mono font-bold tracking-wider text-[9px] sm:text-[10px] text-[#fed7aa]">
                  MUFFLED
                </span>
              </span>
              <span
                className={`w-6 h-3 rounded-full p-0.5 flex items-center transition-colors duration-200 ${
                  isMuffled ? 'bg-[#ea580c] justify-end' : 'bg-[#22130b] justify-start'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
              </span>
            </button>

            {/* 4D Spatial Audio Quick Toggle with Tactile Slide Switch & Visible Label */}
            <button
              onClick={toggleSpatialAudio}
              className={`px-2 sm:px-2.5 py-1.5 rounded-xl border text-[10px] font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 select-none ${
                isSpatialAudio
                  ? 'bg-gradient-to-r from-[#08202d] to-[#04131b] border-[#38bdf8] text-[#bae6fd] shadow-md shadow-cyan-950/40 ring-1 ring-[#38bdf8]/50'
                  : 'bg-[#180e08] border-[#382014] text-[#a88a74] hover:text-[#fdf6e7] hover:border-[#52301e]'
              }`}
              title="4D Spatial Audio dynamic orbital binaural soundstage"
            >
              <span className="flex items-center gap-1">
                <span className="text-xs">🎧</span>
                <span className="font-mono font-bold tracking-wider text-[9px] sm:text-[10px] text-[#38bdf8]">
                  4D SPATIAL
                </span>
              </span>
              <span
                className={`w-6 h-3 rounded-full p-0.5 flex items-center transition-colors duration-200 ${
                  isSpatialAudio ? 'bg-[#0284c7] justify-end' : 'bg-[#22130b] justify-start'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
              </span>
            </button>

            {/* Kerala Ambience Button */}
            <button
              onClick={() => setIsAmbienceOpen(prev => !prev)}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                isAmbienceEnabled
                  ? 'bg-[#2a170e] border-[#d97706] text-[#f59e0b] shadow-md shadow-amber-950/40'
                  : 'bg-[#180e08] border-[#382014] text-[#a88a74] hover:text-[#fdf6e7] hover:border-[#52301e]'
              }`}
              title="Atmospheric Tea Stall Console"
            >
              <CloudRain className="w-4 h-4 text-[#d97706]" />
              <span className="text-[11px] font-malayalam hidden 2xl:inline">അന്തരീക്ഷം</span>
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-2 rounded-xl border relative transition-all ${
                isQueueOpen
                  ? 'bg-[#2a170e] border-[#d97706] text-[#f59e0b]'
                  : 'bg-[#180e08] border-[#382014] text-[#a88a74] hover:text-[#fdf6e7] hover:border-[#52301e]'
              }`}
              title="Play Queue"
            >
              <ListMusic className="w-4 h-4" />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d97706] text-white text-[9px] font-bold flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </button>

            {/* Volume Control (desktop) */}
            <div className="hidden sm:flex items-center gap-1.5 pl-1.5 border-l border-[#382014]">
              <button
                onClick={toggleMute}
                className="p-1.5 text-[#a88a74] hover:text-[#fdf6e7] transition-colors"
                title={isMuted ? 'Unmute' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-[#e57373]" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-14 lg:w-20 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Full-Screen Immersive / Expanded Player Modal featuring the Turntable Deck */}
      {isExpanded && currentTrack && (
        <div className="fixed inset-0 z-50 bg-[#100804]/98 backdrop-blur-2xl flex flex-col p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full pt-1 mb-3">
            <div className="flex items-center gap-2 text-xs text-[#a88a74]">
              <span className="font-serif-vintage text-[#deb17a]">ചായക്കട ഗ്രാമഫോൺ ലൗഞ്ച്</span>
              <span>•</span>
              <span className="font-mono text-[#f59e0b] font-bold">12" VINYL TURNTABLE DECK</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#1f120a] border border-[#3e2417] text-[#baa290] hover:text-[#fdf6e7] flex items-center gap-1.5 text-xs font-mono shadow-md"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Close Deck</span>
            </button>
          </div>

          <div className="max-w-4xl mx-auto w-full flex-1 flex items-center justify-center py-2">
            <TurntableDeck compact={false} />
          </div>
        </div>
      )}
    </>
  );
}
