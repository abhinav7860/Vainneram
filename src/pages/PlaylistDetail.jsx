import React, { useEffect, useState } from 'react';
import { Play, Shuffle, ArrowLeft, MoreVertical, Edit2, Trash2, Plus, Clock, Music } from 'lucide-react';
import { api } from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from '../components/TrackCard';
import { formatDuration, getMoodBadge } from '../utils/formatters';

export function PlaylistDetail({ playlistId, onBack, onNavigate, onEditTrack, onAddToPlaylist, onToggleFavorite, onDeleteTrack, onEditPlaylist, onDeletePlaylist }) {
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { playTrack, toggleShuffle } = usePlayer();

  useEffect(() => {
    loadPlaylist();
  }, [playlistId]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const res = await api.getPlaylist(playlistId);
      setPlaylist(res.playlist);
      setTracks(res.tracks || []);
    } catch (err) {
      alert(err.message || 'Failed to load playlist');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks, 0);
    }
  };

  const handleShuffleAll = () => {
    if (tracks.length > 0) {
      toggleShuffle();
      const randomIdx = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIdx], tracks, randomIdx);
    }
  };

  const handleRemoveTrack = async (trackId) => {
    try {
      await api.removeTrackFromPlaylist(playlistId, trackId);
      setTracks(prev => prev.filter(t => t.id !== trackId));
    } catch (err) {
      alert(err.message || 'Failed to remove track');
    }
  };

  if (loading || !playlist) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#7e9689]">
        <div className="w-8 h-8 border-2 border-[#d9822b] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Loading playlist...</p>
      </div>
    );
  }

  const mood = getMoodBadge(playlist.mood);

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#8ea498] hover:text-[#f7f2e8] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Playlists</span>
      </button>

      {/* Playlist Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border border-[#234234] bg-gradient-to-r from-[#142820] via-[#10221a] to-[#162d22] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-6 shadow-xl">
        {/* Cover Art / Icon */}
        <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-[#0e1d17] border border-[#234536] overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xl relative">
          {tracks.find(t => t.cover_url)?.cover_url ? (
            <img
              src={tracks.find(t => t.cover_url).cover_url}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <span className="text-5xl mb-2">{mood.icon || '☕'}</span>
              <span className="font-malayalam text-xs text-[#d9822b]">{mood.malayalam}</span>
            </div>
          )}
        </div>

        {/* Details & Actions */}
        <div className="flex-1 min-w-0 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#1b372b] border border-[#d9822b]/30 text-[11px] text-[#deb17a] font-medium mb-2">
            <span>{mood.icon}</span>
            <span>{mood.label}</span>
          </div>

          <h2 className="font-serif-vintage text-2xl md:text-4xl font-bold text-[#f7f2e8] break-words">
            {playlist.name}
          </h2>

          {playlist.description && (
            <p className="text-xs md:text-sm text-[#8ea498] mt-2 max-w-xl leading-relaxed">
              {playlist.description}
            </p>
          )}

          <div className="flex items-center justify-center md:justify-start gap-3 mt-3 text-xs text-[#718c7e] font-mono">
            <span>{tracks.length} songs</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(playlist.total_duration)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="px-5 py-2.5 rounded-xl bg-[#d9822b] hover:bg-[#e69a38] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-black/40 transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Play All</span>
            </button>

            <button
              onClick={handleShuffleAll}
              disabled={tracks.length === 0}
              className="px-4 py-2.5 rounded-xl bg-[#183628] hover:bg-[#204533] border border-[#2b5440] text-[#deb17a] text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-40"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>

            {/* Menu for edit/delete playlist */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 rounded-xl bg-[#12241c] hover:bg-[#1a3328] border border-[#203c2f] text-[#8ea498] hover:text-[#f7f2e8] transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute left-0 md:left-auto md:right-0 bottom-full mb-1 z-30 w-44 rounded-xl bg-[#14261e] border border-[#264437] shadow-xl py-1 text-xs">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEditPlaylist(playlist);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#dce7e1] hover:bg-[#1d392c]"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#a6b5ad]" />
                      <span>Edit Playlist</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDeletePlaylist(playlist);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-[#e57373] hover:bg-[#2b1816]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Playlist</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-serif-vintage text-base font-semibold text-[#f7f2e8]">
            Songs in Playlist
          </h3>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs text-[#deb17a] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add from Library</span>
          </button>
        </div>

        {tracks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#102119] border border-[#1f3d2f] text-center space-y-3">
            <span className="text-3xl block">🎵</span>
            <p className="text-xs text-[#80998c]">
              No songs in this playlist yet. Add your favorite tracks from your library!
            </p>
            <button
              onClick={() => onNavigate('library')}
              className="px-4 py-2 rounded-xl bg-[#d9822b] hover:bg-[#e69a38] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              Browse Library
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {tracks.map((track, idx) => (
              <div key={track.id} className="relative group">
                <TrackRow
                  track={track}
                  index={idx}
                  allTracks={tracks}
                  onEdit={onEditTrack}
                  onAddToPlaylist={onAddToPlaylist}
                  onToggleFavorite={onToggleFavorite}
                  onDelete={() => handleRemoveTrack(track.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
