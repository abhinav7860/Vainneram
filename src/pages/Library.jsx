import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Heart,
  Plus,
  Music,
  Sparkles,
  Loader2
} from 'lucide-react';
import { api } from '../utils/api';
import { TrackCard, TrackRow } from '../components/TrackCard';
import { MOOD_DEFINITIONS, formatDuration } from '../utils/formatters';

export function Library({ initialMood = 'All', onNavigate, onEditTrack, onAddToPlaylist, onToggleFavorite, onDeleteTrack }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMood, setSelectedMood] = useState(initialMood);
  const [sortBy, setSortBy] = useState('recent');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [seedingSamples, setSeedingSamples] = useState(false);

  useEffect(() => {
    setSelectedMood(initialMood || 'All');
  }, [initialMood]);

  useEffect(() => {
    loadTracks();
  }, [selectedMood, sortBy, onlyFavorites]);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const res = await api.getTracks({
        search: search.trim() || undefined,
        mood: selectedMood !== 'All' ? selectedMood : undefined,
        sort: sortBy,
        favorite: onlyFavorites
      });
      setTracks(res.tracks || []);
    } catch (err) {
      console.warn('Failed to load tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTracks();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Seed sample starter pack if library is empty
  const handleSeedSamples = async () => {
    try {
      setSeedingSamples(true);
      await api.seedSampleTracks();
      await loadTracks();
    } catch (err) {
      alert(err.message || 'Failed to add sample tracks');
    } finally {
      setSeedingSamples(false);
    }
  };

  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1c362b] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-vintage text-2xl md:text-3xl font-bold text-[#f7f2e8]">
              My Library
            </h2>
            <span className="text-xs font-malayalam text-[#deb17a] px-2 py-0.5 rounded-full bg-[#183628] border border-[#d9822b]/30">
              എന്റെ പാട്ടുകൾ
            </span>
          </div>
          <p className="text-xs text-[#8da497] mt-1">
            {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} • {formatDuration(totalDuration)} total duration
          </p>
        </div>

        {/* Add Music Action */}
        <button
          onClick={() => onNavigate('add')}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-[#d9822b] hover:bg-[#e69a38] text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-black/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Music</span>
        </button>
      </div>

      {/* Search, Filters, and Sorting Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#708b7e] absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, artist, album, mood..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#12241c] border border-[#234233] text-xs text-[#f7f2e8] placeholder-[#708b7e] focus:outline-none focus:border-[#d9822b] focus:ring-1 focus:ring-[#d9822b]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[#708b7e] hover:text-[#f7f2e8]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort, Favorites & Layout toggles */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {/* Favorites filter toggle */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all flex-shrink-0 ${
              onlyFavorites
                ? 'bg-[#2e1717] border-[#c25538] text-[#ff8c73]'
                : 'bg-[#12241c] border-[#234233] text-[#8da497] hover:text-[#f7f2e8]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
            <span>Liked Only</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#12241c] border border-[#234233] text-xs text-[#8da497] flex-shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#deb17a]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-[#f7f2e8] focus:outline-none cursor-pointer pr-1"
            >
              <option value="recent" className="bg-[#12241c]">Recently Added</option>
              <option value="title" className="bg-[#12241c]">Title (A-Z)</option>
              <option value="artist" className="bg-[#12241c]">Artist (A-Z)</option>
              <option value="duration" className="bg-[#12241c]">Duration</option>
              <option value="played" className="bg-[#12241c]">Most Played</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#12241c] border border-[#234233] rounded-xl p-0.5 flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#1c382b] text-[#deb17a]' : 'text-[#708b7e] hover:text-[#f7f2e8]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#1c382b] text-[#deb17a]' : 'text-[#708b7e] hover:text-[#f7f2e8]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mood filter pill tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {MOOD_DEFINITIONS.map((m) => {
          const isActive = selectedMood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMood(m.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
                isActive
                  ? 'bg-[#d9822b] text-white shadow-md shadow-amber-950/40'
                  : 'bg-[#12241c] hover:bg-[#183427] border border-[#234233] text-[#8ea498] hover:text-[#f7f2e8]'
              }`}
            >
              {m.icon && <span>{m.icon}</span>}
              <span>{m.label}</span>
              <span className={`text-[10px] font-malayalam ${isActive ? 'text-white/80' : 'text-[#deb17a]/70'}`}>
                {m.malayalam}
              </span>
            </button>
          );
        })}
      </div>

      {/* Track Listing */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#7e9689]">
          <Loader2 className="w-8 h-8 animate-spin text-[#d9822b] mb-3" />
          <p className="text-xs">Brewing library collection...</p>
        </div>
      ) : tracks.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-[#102119] border border-[#203c2f] text-center max-w-lg mx-auto space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#183628] border border-[#28503d] mx-auto flex items-center justify-center text-3xl shadow-lg">
            ☕
          </div>
          <div>
            <h3 className="font-serif-vintage text-xl font-bold text-[#f7f2e8]">
              {search ? 'No matching songs found' : 'Your library is empty'}
            </h3>
            <p className="text-xs text-[#80998c] mt-1.5 leading-relaxed">
              {search
                ? `No songs matched "${search}". Try searching another title, artist, or mood.`
                : 'Upload music you own in MP3, WAV, M4A, or OGG, or load the Kerala tea stall starter pack for instant listening.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('add')}
              className="px-4 py-2.5 rounded-xl bg-[#d9822b] hover:bg-[#e69a38] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-black/30"
            >
              <Plus className="w-4 h-4" />
              Upload Audio File
            </button>

            <button
              onClick={handleSeedSamples}
              disabled={seedingSamples}
              className="px-4 py-2.5 rounded-xl bg-[#183628] hover:bg-[#204533] border border-[#2d5c46] text-[#deb17a] text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#d9822b]" />
              {seedingSamples ? 'Loading pack...' : 'Load Tea Stall Atmosphere Pack'}
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              allTracks={tracks}
              onEdit={onEditTrack}
              onAddToPlaylist={onAddToPlaylist}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDeleteTrack}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {tracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              allTracks={tracks}
              onEdit={onEditTrack}
              onAddToPlaylist={onAddToPlaylist}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDeleteTrack}
            />
          ))}
        </div>
      )}
    </div>
  );
}
