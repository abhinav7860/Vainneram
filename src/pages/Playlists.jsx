import React, { useEffect, useState } from 'react';
import { Plus, Disc, Play, Music, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { api } from '../utils/api';
import { formatDuration, getMoodBadge } from '../utils/formatters';

export function Playlists({ onOpenPlaylist, onCreatePlaylist, onEditPlaylist, onDeletePlaylist }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const res = await api.getPlaylists();
      setPlaylists(res.playlists || []);
    } catch (err) {
      console.warn('Failed to load playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1c362b] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-vintage text-2xl md:text-3xl font-bold text-[#f7f2e8]">
              Playlists
            </h2>
            <span className="text-xs font-malayalam text-[#deb17a] px-2 py-0.5 rounded-full bg-[#183628] border border-[#d9822b]/30">
              പ്ലേലിസ്റ്റുകൾ
            </span>
          </div>
          <p className="text-xs text-[#8da497] mt-1">
            Organize your evening tracks into custom mood collections.
          </p>
        </div>

        <button
          onClick={onCreatePlaylist}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#d9822b] hover:bg-[#e69a38] text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-black/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Playlist Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-56 rounded-2xl bg-[#12241c] animate-pulse" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#102119] border border-[#203c2f] text-center max-w-md mx-auto space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#183628] border border-[#28503d] mx-auto flex items-center justify-center text-3xl">
            📻
          </div>
          <div>
            <h3 className="font-serif-vintage text-xl font-bold text-[#f7f2e8]">
              No playlists yet
            </h3>
            <p className="text-xs text-[#80998c] mt-1.5 leading-relaxed">
              Create collections like "Rainy Evening Chai", "Acoustic Afternoons", or "Slow Twilight".
            </p>
          </div>
          <button
            onClick={onCreatePlaylist}
            className="px-4 py-2.5 rounded-xl bg-[#d9822b] hover:bg-[#e69a38] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-black/30"
          >
            <Plus className="w-4 h-4" />
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.map((pl) => {
            const mood = getMoodBadge(pl.mood);
            return (
              <div
                key={pl.id}
                onClick={() => onOpenPlaylist(pl.id)}
                className="stall-card group p-3.5 rounded-2xl cursor-pointer flex flex-col justify-between transition-all"
              >
                {/* Artwork / Icon container */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#0e1d17] mb-3 flex items-center justify-center border border-[#1e3b2e]">
                  {pl.preview_cover ? (
                    <img
                      src={pl.preview_cover}
                      alt={pl.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#d9822b]">
                      <span className="text-4xl mb-1">{mood.icon || '☕'}</span>
                      <span className="text-[11px] font-malayalam text-[#deb17a]/70">{mood.malayalam}</span>
                    </div>
                  )}

                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-11 h-11 rounded-full bg-[#d9822b] text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Mood pill */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#102319]/80 text-[#deb17a] border border-[#d9822b]/30 backdrop-blur-sm">
                    {mood.label}
                  </div>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif-vintage text-sm font-semibold text-[#f7f2e8] truncate group-hover:text-[#e69a38] transition-colors">
                    {pl.name}
                  </h4>
                  <p className="text-[11px] text-[#81998c] line-clamp-1 mt-0.5">
                    {pl.description || `${pl.track_count || 0} songs`}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1d352b] text-[11px] text-[#718c7e]">
                  <span>{pl.track_count || 0} songs</span>
                  <span className="font-mono">{formatDuration(pl.total_duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
