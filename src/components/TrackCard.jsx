import React, { useState } from 'react';
import { Play, Pause, MoreVertical, Heart, Plus, Edit2, Trash2, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration, getMoodBadge } from '../utils/formatters';

export function TrackCard({ track, onEdit, onAddToPlaylist, onToggleFavorite, onDelete, allTracks = [] }) {
  const { currentTrack, isPlaying, playTrack, togglePlayPause, addToQueue } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);

  const isCurrent = currentTrack && currentTrack.id === track.id;
  const mood = getMoodBadge(track.mood_tag);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track, allTracks.length > 0 ? allTracks : [track]);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className="cassette-card group relative flex flex-col p-3 transition-all duration-300 cursor-pointer select-none"
    >
      {/* Cassette Case Top Header Spine */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#382014] text-[9px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] shadow-[0_0_5px_#f59e0b]" />
          <span className="font-bold text-[#fed7aa] tracking-widest uppercase">CASSETTE • SIDE A</span>
        </div>
        <span className="tracking-wider uppercase font-bold text-[#8c7462] text-[8px]">
          {mood.malayalam || mood.label}
        </span>
      </div>

      {/* Artwork container with Sliding & Rotating Vinyl Record */}
      <div className="relative aspect-square w-full mb-2.5">
        
        {/* ROTATING VINYL RECORD DISC SLIDING OUT FROM SLEEVE */}
        <div
          className={`absolute top-0 right-0 bottom-0 aspect-square rounded-full border border-[#2d2d2d] shadow-2xl transition-all duration-500 ease-out flex items-center justify-center overflow-hidden pointer-events-none z-0 ${
            isCurrent && isPlaying
              ? 'translate-x-[36%] animate-vinyl-spin'
              : 'translate-x-0 group-hover:translate-x-[24%]'
          }`}
          style={{
            background: 'repeating-radial-gradient(circle at center, #0f0f0f 0px, #1a1a1a 1px, #080808 2px, #141414 3px)'
          }}
        >
          {/* Specular light shimmer across grooves */}
          <div
            className="absolute inset-0 rounded-full opacity-40 mix-blend-screen"
            style={{
              background: 'conic-gradient(from 45deg, rgba(255,255,255,0.28) 0deg, transparent 45deg, rgba(255,255,255,0.1) 90deg, transparent 135deg, rgba(255,255,255,0.28) 180deg, transparent 225deg, rgba(255,255,255,0.1) 270deg, transparent 315deg, rgba(255,255,255,0.28) 360deg)'
            }}
          />
          {/* Mini Center Label */}
          <div className="w-[34%] h-[34%] rounded-full bg-[#d97706] border-2 border-[#fef3c7] flex items-center justify-center text-[7px] text-white font-bold relative z-10 overflow-hidden shadow-inner">
            {track.cover_url ? (
              <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>☕</span>
            )}
            <div className="absolute w-2.5 h-2.5 rounded-full bg-black border border-white/60" />
          </div>
        </div>

        {/* Card Sleeve Front */}
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-[#120a06] border border-[#3d2215] shadow-md z-10">
          {track.cover_url ? (
            <img
              src={track.cover_url}
              alt={track.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#24150d] to-[#120a06] text-[#baa290]">
              <span className="text-3xl mb-1">{mood.icon || '🍵'}</span>
              <span className="text-xs font-malayalam tracking-wider text-[#d97706]/90">{mood.malayalam}</span>
            </div>
          )}

          {/* Ambient overlay & play button */}
          <div className={`absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <button
              onClick={handlePlayClick}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d97706] to-[#92400e] hover:from-[#f59e0b] hover:to-[#b45309] text-white flex items-center justify-center shadow-xl shadow-black/60 border border-[#fed7aa]/30 transform transition-transform hover:scale-110 active:scale-95"
              title={isCurrent && isPlaying ? 'Pause' : 'Play'}
            >
              {isCurrent && isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>
          </div>

          {/* Audio format badge */}
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-black/75 text-[#fed7aa] border border-[#d97706]/40 backdrop-blur-sm">
            {track.format || 'MP3'}
          </div>

          {/* Mood icon pill */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1a0f09]/90 text-[#fed7aa] border border-[#d97706]/40 backdrop-blur-sm flex items-center gap-1">
            <span>{mood.icon}</span>
          </div>
        </div>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-[#fef3c7] truncate group-hover:text-[#f59e0b] transition-colors font-serif-vintage tracking-wide" title={track.title}>
          {track.title}
        </h4>
        <p className="text-xs text-[#baa290] truncate mt-0.5 font-sans" title={track.artist}>
          {track.artist || 'Unknown Artist'}
        </p>
        <p className="text-[10px] text-[#7d6655] truncate mt-0.5 font-mono">
          {track.album || 'Film Classic'}
        </p>
      </div>

      {/* Footer / Meta & Actions */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#331c10] text-xs text-[#a8907e]">
        <span className="font-mono text-[10px] font-bold text-[#d97706]">{formatDuration(track.duration)}</span>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(track);
            }}
            className={`p-1.5 rounded-md hover:bg-[#2b170e] transition-colors ${
              track.is_favorite ? 'text-[#c2410c]' : 'text-[#8c7462] hover:text-[#fef3c7]'
            }`}
            title={track.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-3.5 h-3.5 ${track.is_favorite ? 'fill-current' : ''}`} />
          </button>

          {/* Options Menu Toggle */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 rounded-md text-[#8c7462] hover:text-[#fef3c7] hover:bg-[#2b170e] transition-colors"
              title="More options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div className="absolute right-0 bottom-full mb-1 z-30 w-44 rounded-xl bg-[#1c100a] border-2 border-[#422517] shadow-2xl py-1 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(track);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#fed7aa] hover:bg-[#27140b]"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>Add to Queue</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToPlaylist(track);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#fed7aa] hover:bg-[#27140b]"
                  >
                    <Music className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>Add to Playlist</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(track);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#fed7aa] hover:bg-[#27140b]"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#deb17a]" />
                    <span>Edit Metadata</span>
                  </button>
                  <div className="h-px bg-[#382014] my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(track);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#e57373] hover:bg-[#33110e]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Cassette</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrackRow({ track, index, onEdit, onAddToPlaylist, onToggleFavorite, onDelete, allTracks = [] }) {
  const { currentTrack, isPlaying, playTrack, togglePlayPause, addToQueue } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);

  const isCurrent = currentTrack && currentTrack.id === track.id;
  const mood = getMoodBadge(track.mood_tag);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track, allTracks.length > 0 ? allTracks : [track], index);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
        isCurrent
          ? 'bg-gradient-to-r from-[#2f180d] to-[#1e0f08] border-[#f59e0b] shadow-md ring-1 ring-[#f59e0b]/40'
          : 'bg-[#180e08]/90 border-[#382014] hover:bg-[#22130b] hover:border-[#4a2b1a]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Play/Index action */}
        <div className="w-8 flex items-center justify-center flex-shrink-0">
          <button
            onClick={handlePlayClick}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isCurrent
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-md'
                : 'text-[#8c7462] group-hover:bg-[#d97706] group-hover:text-white'
            }`}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : isCurrent ? (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            ) : (
              <span className="text-xs font-mono group-hover:hidden">{index !== undefined ? index + 1 : '•'}</span>
            )}
            {!isCurrent && <Play className="w-3.5 h-3.5 fill-current ml-0.5 hidden group-hover:block" />}
          </button>
        </div>

        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg bg-[#120a06] overflow-hidden flex-shrink-0 relative border border-[#382014]">
          {track.cover_url ? (
            <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm">
              {mood.icon || '🍵'}
            </div>
          )}
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium truncate ${isCurrent ? 'text-[#f59e0b]' : 'text-[#fef3c7] group-hover:text-white'}`}>
            {track.title}
          </p>
          <p className="text-xs text-[#a88a74] truncate">
            {track.artist || 'Unknown Artist'}
          </p>
        </div>
      </div>

      {/* Album (desktop only) */}
      <div className="hidden md:block w-48 px-2 text-xs text-[#8c7462] truncate">
        {track.album || 'Single'}
      </div>

      {/* Mood pill */}
      <div className="hidden sm:flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#1e110a] text-[#fed7aa] border border-[#d97706]/30 mr-3">
        <span>{mood.icon}</span>
        <span className="ml-1 truncate max-w-[100px]">{mood.label}</span>
      </div>

      {/* Duration & Menu */}
      <div className="flex items-center gap-2 flex-shrink-0 text-xs text-[#a88a74]">
        <span className="font-mono">{formatDuration(track.duration)}</span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(track);
          }}
          className={`p-1.5 rounded-md hover:bg-[#27140b] transition-colors ${
            track.is_favorite ? 'text-[#e57373]' : 'text-[#8c7462] hover:text-[#fef3c7]'
          }`}
          title="Favorite"
        >
          <Heart className={`w-3.5 h-3.5 ${track.is_favorite ? 'fill-current' : ''}`} />
        </button>

        {/* Options Menu Toggle */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 rounded-md text-[#8c7462] hover:text-[#fef3c7] hover:bg-[#27140b] transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-full mt-1 z-30 w-44 rounded-xl bg-[#1c100a] border-2 border-[#422517] shadow-2xl py-1 text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(track);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#fed7aa] hover:bg-[#27140b]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Add to Queue</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPlaylist(track);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#fed7aa] hover:bg-[#27140b]"
                >
                  <Music className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Add to Playlist</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(track);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#fed7aa] hover:bg-[#27140b]"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#deb17a]" />
                  <span>Edit Details</span>
                </button>
                <div className="h-px bg-[#382014] my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(track);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#e57373] hover:bg-[#33110e]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
