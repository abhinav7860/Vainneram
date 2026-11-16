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
    <div className="stall-card group relative flex flex-col rounded-xl overflow-hidden p-3.5 transition-all duration-300">
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#102019] mb-3 shadow-md">
        {track.cover_url ? (
          <img
            src={track.cover_url}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#183427] to-[#102319] text-[#719183]">
            <span className="text-3xl mb-1">{mood.icon || '🍵'}</span>
            <span className="text-xs font-malayalam tracking-wider text-[#d9822b]/80">{mood.malayalam}</span>
          </div>
        )}

        {/* Ambient overlay & play button */}
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${
          isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-[#d9822b] hover:bg-[#e69a38] text-white flex items-center justify-center shadow-lg shadow-black/40 transform transition-transform hover:scale-110 active:scale-95"
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
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-black/60 text-[#e0ded5] backdrop-blur-sm">
          {track.format || 'audio'}
        </div>

        {/* Mood badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#13281f]/85 text-[#e5b376] border border-[#d9822b]/30 backdrop-blur-sm flex items-center gap-1">
          <span>{mood.icon}</span>
          <span className="hidden sm:inline">{mood.label}</span>
        </div>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[#f7f2e8] truncate group-hover:text-[#e69a38] transition-colors" title={track.title}>
          {track.title}
        </h4>
        <p className="text-xs text-[#9bb0a5] truncate mt-0.5" title={track.artist}>
          {track.artist || 'Unknown Artist'}
        </p>
        <p className="text-[11px] text-[#6d8277] truncate mt-0.5">
          {track.album || 'Single'}
        </p>
      </div>

      {/* Footer / Meta & Actions */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1d352b] text-xs text-[#899e93]">
        <span>{formatDuration(track.duration)}</span>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(track);
            }}
            className={`p-1.5 rounded-md hover:bg-[#203a2e] transition-colors ${
              track.is_favorite ? 'text-[#c25538]' : 'text-[#7d9387] hover:text-[#f7f2e8]'
            }`}
            title={track.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${track.is_favorite ? 'fill-current' : ''}`} />
          </button>

          {/* Options Menu Toggle */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 rounded-md text-[#7d9387] hover:text-[#f7f2e8] hover:bg-[#203a2e] transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
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
                <div className="absolute right-0 bottom-full mb-1 z-30 w-44 rounded-lg bg-[#14261e] border border-[#264437] shadow-xl shadow-black/60 py-1 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(track);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#dce7e1] hover:bg-[#1d392c]"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#d9822b]" />
                    <span>Add to Queue</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToPlaylist(track);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#dce7e1] hover:bg-[#1d392c]"
                  >
                    <Music className="w-3.5 h-3.5 text-[#d9822b]" />
                    <span>Add to Playlist</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(track);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#dce7e1] hover:bg-[#1d392c]"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#a6b5ad]" />
                    <span>Edit Metadata</span>
                  </button>
                  <div className="h-px bg-[#264437] my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(track);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#e57373] hover:bg-[#2b1816]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Track</span>
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
      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
        isCurrent
          ? 'bg-[#183427] border-[#d9822b]/50 shadow-sm'
          : 'bg-[#11231b]/60 border-transparent hover:bg-[#152c22] hover:border-[#224032]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Play/Index action */}
        <div className="w-8 flex items-center justify-center flex-shrink-0">
          <button
            onClick={handlePlayClick}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isCurrent
                ? 'bg-[#d9822b] text-white shadow-md shadow-black/30'
                : 'text-[#7d9387] group-hover:bg-[#d9822b] group-hover:text-white'
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
        <div className="w-10 h-10 rounded bg-[#162e23] overflow-hidden flex-shrink-0 relative border border-[#234435]">
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
          <p className={`text-sm font-medium truncate ${isCurrent ? 'text-[#e69a38]' : 'text-[#f7f2e8] group-hover:text-[#f4ede4]'}`}>
            {track.title}
          </p>
          <p className="text-xs text-[#8ea498] truncate">
            {track.artist || 'Unknown Artist'}
          </p>
        </div>
      </div>

      {/* Album (desktop only) */}
      <div className="hidden md:block w-48 px-2 text-xs text-[#799083] truncate">
        {track.album || 'Single'}
      </div>

      {/* Mood pill */}
      <div className="hidden sm:flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#142920] text-[#deb17a] border border-[#d9822b]/20 mr-3">
        <span>{mood.icon}</span>
        <span className="ml-1 truncate max-w-[100px]">{mood.label}</span>
      </div>

      {/* Duration & Menu */}
      <div className="flex items-center gap-2 flex-shrink-0 text-xs text-[#8ea498]">
        <span className="font-mono">{formatDuration(track.duration)}</span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(track);
          }}
          className={`p-1.5 rounded-md hover:bg-[#203a2e] transition-colors ${
            track.is_favorite ? 'text-[#c25538]' : 'text-[#6c8578] hover:text-[#f7f2e8]'
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
            className="p-1.5 rounded-md text-[#6c8578] hover:text-[#f7f2e8] hover:bg-[#203a2e] transition-colors"
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
              <div className="absolute right-0 top-full mt-1 z-30 w-44 rounded-lg bg-[#14261e] border border-[#264437] shadow-xl shadow-black/60 py-1 text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(track);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#dce7e1] hover:bg-[#1d392c]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#d9822b]" />
                  <span>Add to Queue</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPlaylist(track);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#dce7e1] hover:bg-[#1d392c]"
                >
                  <Music className="w-3.5 h-3.5 text-[#d9822b]" />
                  <span>Add to Playlist</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(track);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#dce7e1] hover:bg-[#1d392c]"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#a6b5ad]" />
                  <span>Edit Details</span>
                </button>
                <div className="h-px bg-[#264437] my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(track);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#e57373] hover:bg-[#2b1816]"
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
