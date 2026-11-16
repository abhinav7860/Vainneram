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
  AlertCircle
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAmbience } from '../context/AmbienceContext';
import { formatDuration, getMoodBadge } from '../utils/formatters';

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
    setIsQueueOpen,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat
  } = usePlayer();

  const { isEnabled: isAmbienceEnabled, setIsAmbienceOpen } = useAmbience();
  const [isExpanded, setIsExpanded] = useState(false);

  // If no track selected and no queue, keep a calm placeholder bar
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

      {/* Persistent Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 stall-glass-nav border-t border-[#1e392d] px-4 py-2.5 md:py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Track Information */}
          <div className="flex items-center gap-3 w-1/4 min-w-[140px] md:min-w-[220px]">
            {currentTrack ? (
              <>
                <div
                  onClick={() => setIsExpanded(true)}
                  className="w-11 h-11 md:w-12 md:h-12 rounded-lg bg-[#14261e] border border-[#234234] overflow-hidden flex-shrink-0 cursor-pointer relative group shadow-md"
                >
                  {currentTrack.cover_url ? (
                    <img
                      src={currentTrack.cover_url}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#183427] to-[#102319] text-base">
                      {mood?.icon || '🍵'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs md:text-sm font-semibold text-[#f7f2e8] truncate cursor-pointer hover:text-[#d9822b] transition-colors"
                    onClick={() => setIsExpanded(true)}
                    title={currentTrack.title}
                  >
                    {currentTrack.title}
                  </p>
                  <p className="text-[11px] md:text-xs text-[#8ea498] truncate" title={currentTrack.artist}>
                    {currentTrack.artist || 'Unknown Artist'}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5 text-xs text-[#6e8578]">
                <div className="w-10 h-10 rounded-lg bg-[#11231a] border border-[#1b3629] flex items-center justify-center text-base">
                  🍵
                </div>
                <div className="hidden sm:block">
                  <p className="font-serif-vintage text-xs text-[#a4b8ad]">Vainneram</p>
                  <p className="text-[10px] text-[#6e8578] font-malayalam">പാട്ടുകൾ തിരഞ്ഞെടുക്കുക</p>
                </div>
              </div>
            )}
          </div>

          {/* Center: Playback Controls & Progress Bar */}
          <div className="flex flex-col items-center flex-1 max-w-xl">
            {/* Buttons row */}
            <div className="flex items-center gap-3 md:gap-5 mb-1.5">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-md transition-colors hidden sm:block ${
                  isShuffle ? 'text-[#d9822b]' : 'text-[#6e8578] hover:text-[#f7f2e8]'
                }`}
                title={isShuffle ? 'Shuffle on' : 'Shuffle off'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Prev */}
              <button
                onClick={playPrevious}
                disabled={!currentTrack}
                className="p-1.5 rounded-full text-[#a4b8ad] hover:text-[#f7f2e8] hover:bg-[#1a3529] transition-colors disabled:opacity-30"
                title="Previous track"
              >
                <SkipBack className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlayPause}
                disabled={!currentTrack && queue.length === 0}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#d9822b] hover:bg-[#e69a38] text-white flex items-center justify-center shadow-lg shadow-black/40 transition-transform active:scale-95 disabled:opacity-40"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isLoadingAudio ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={() => playNext(false)}
                disabled={!currentTrack}
                className="p-1.5 rounded-full text-[#a4b8ad] hover:text-[#f7f2e8] hover:bg-[#1a3529] transition-colors disabled:opacity-30"
                title="Next track"
              >
                <SkipForward className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded-md transition-colors hidden sm:block ${
                  repeatMode !== 'off' ? 'text-[#d9822b]' : 'text-[#6e8578] hover:text-[#f7f2e8]'
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

            {/* Seek Bar & Timers */}
            <div className="w-full flex items-center gap-2 md:gap-3 text-[11px] font-mono text-[#7d9487]">
              <span className="w-9 text-right">{formatDuration(currentTime)}</span>
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
              <span className="w-9 text-left">{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Right: Ambience, Queue & Volume */}
          <div className="flex items-center justify-end gap-2 md:gap-3 w-1/4 min-w-[120px] md:min-w-[200px]">
            {/* Kerala Ambience Button */}
            <button
              onClick={() => setIsAmbienceOpen(true)}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                isAmbienceEnabled
                  ? 'bg-[#183628] border-[#d9822b] text-[#e69a38] shadow-md shadow-amber-950/20'
                  : 'bg-[#102019] border-[#1d382c] text-[#7d9487] hover:text-[#f7f2e8] hover:border-[#2b4f3f]'
              }`}
              title="Kerala Tea Stall Ambience"
            >
              <CloudRain className="w-4 h-4" />
              <span className="text-[11px] font-malayalam hidden lg:inline">മഴ</span>
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-2 rounded-xl border relative transition-all ${
                isQueueOpen
                  ? 'bg-[#183628] border-[#d9822b] text-[#e69a38]'
                  : 'bg-[#102019] border-[#1d382c] text-[#7d9487] hover:text-[#f7f2e8]'
              }`}
              title="Play Queue"
            >
              <ListMusic className="w-4 h-4" />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d9822b] text-white text-[9px] font-bold flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </button>

            {/* Volume Control (desktop) */}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1.5 text-[#7d9487] hover:text-[#f7f2e8] transition-colors"
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
                className="w-16 lg:w-20 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Full-Screen Immersive / Expanded Player Modal for Desktop & Mobile */}
      {isExpanded && currentTrack && (
        <div className="fixed inset-0 z-50 bg-[#0c1813]/95 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between max-w-lg mx-auto w-full pt-2">
            <div className="flex items-center gap-2 text-xs text-[#8ea498]">
              <span className="font-serif-vintage">Now Playing</span>
              <span>•</span>
              <span className="font-malayalam text-[#d9822b]">{mood?.malayalam}</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 rounded-xl bg-[#142920] border border-[#213f32] text-[#8ea498] hover:text-[#f7f2e8]"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full py-6">
            {/* Big Artwork */}
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl bg-[#142820] border border-[#234435] shadow-2xl overflow-hidden mb-6 relative">
              {currentTrack.cover_url ? (
                <img
                  src={currentTrack.cover_url}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a382b] to-[#0f2118]">
                  <span className="text-6xl mb-2">{mood?.icon || '🍵'}</span>
                  <span className="font-malayalam text-sm text-[#deb17a]">{mood?.malayalam}</span>
                </div>
              )}
            </div>

            {/* Title & Artist */}
            <div className="text-center w-full mb-6">
              <h2 className="font-serif-vintage text-xl font-bold text-[#f7f2e8] truncate">
                {currentTrack.title}
              </h2>
              <p className="text-sm text-[#8ea498] truncate mt-1">
                {currentTrack.artist || 'Unknown Artist'}
              </p>
              <p className="text-xs text-[#5e7569] truncate mt-0.5">
                {currentTrack.album || 'Single'}
              </p>
            </div>

            {/* Seek Bar */}
            <div className="w-full space-y-1 mb-6">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs font-mono text-[#7d9487]">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Expanded Controls */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-lg ${isShuffle ? 'text-[#d9822b]' : 'text-[#6e8578]'}`}
              >
                <Shuffle className="w-5 h-5" />
              </button>
              <button
                onClick={playPrevious}
                className="p-3 rounded-full bg-[#142920] text-[#f7f2e8] hover:bg-[#1a382b]"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>
              <button
                onClick={togglePlayPause}
                className="w-16 h-16 rounded-full bg-[#d9822b] hover:bg-[#e69a38] text-white flex items-center justify-center shadow-xl shadow-black/50"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>
              <button
                onClick={() => playNext(false)}
                className="p-3 rounded-full bg-[#142920] text-[#f7f2e8] hover:bg-[#1a382b]"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-lg ${repeatMode !== 'off' ? 'text-[#d9822b]' : 'text-[#6e8578]'}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
