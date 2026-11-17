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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#382014] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-vintage text-2xl md:text-3xl font-bold text-[#fef3c7]">
              കാസറ്റ് ശേഖരം • Cassette Library
            </h2>
            <span className="text-xs font-malayalam font-bold text-[#fed7aa] px-2.5 py-0.5 rounded-full bg-[#27140b] border border-[#d97706]/40 shadow-inner">
              113 കാസറ്റുകൾ
            </span>
          </div>
          <p className="text-xs text-[#baa290] mt-1 font-sans">
            {tracks.length} {tracks.length === 1 ? 'cassette' : 'cassettes'} • {formatDuration(totalDuration)} total duration
          </p>
        </div>

        {/* Play All Action */}
        {tracks.length > 0 && (
          <button
            onClick={() => {
              const { playTrack } = usePlayer ? { playTrack: null } : {};
            }}
            className="hidden"
          >
          </button>
        )}
      </div>

      {/* Search, Filters, and Sorting Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8a6e5a] absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, artist, film, mood..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#160d08] border border-[#382014] text-xs text-[#fdf6e7] placeholder-[#8a6e5a] focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[#8a6e5a] hover:text-[#fdf6e7]"
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
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 ${
              onlyFavorites
                ? 'bg-[#331109] border-[#c2410c] text-[#ff8c73]'
                : 'bg-[#160d08] border-[#382014] text-[#baa290] hover:text-[#fdf6e7]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
            <span>Liked Only</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#160d08] border border-[#382014] text-xs text-[#baa290] flex-shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#d97706]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-[#fdf6e7] focus:outline-none cursor-pointer pr-1"
            >
              <option value="recent" className="bg-[#160d08]">Recently Added</option>
              <option value="title" className="bg-[#160d08]">Title (A-Z)</option>
              <option value="artist" className="bg-[#160d08]">Artist (A-Z)</option>
              <option value="duration" className="bg-[#160d08]">Duration</option>
              <option value="played" className="bg-[#160d08]">Most Played</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#160d08] border border-[#382014] rounded-xl p-0.5 flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#27140b] text-[#f59e0b]' : 'text-[#8a6e5a] hover:text-[#fdf6e7]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#27140b] text-[#f59e0b]' : 'text-[#8a6e5a] hover:text-[#fdf6e7]'
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 border ${
                isActive
                  ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-md border-[#f59e0b]/40'
                  : 'bg-[#160d08] hover:bg-[#22130c] border-[#382014] text-[#baa290] hover:text-[#fdf6e7]'
              }`}
            >
              {m.icon && <span>{m.icon}</span>}
              <span>{m.label}</span>
              <span className={`text-[10px] font-malayalam ${isActive ? 'text-white/80' : 'text-[#fed7aa]/80'}`}>
                {m.malayalam}
              </span>
            </button>
          );
        })}
      </div>

      {/* Track Listing */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#a88a74]">
          <Loader2 className="w-8 h-8 animate-spin text-[#d97706] mb-3" />
          <p className="text-xs">Brewing nostalgic cassette collection...</p>
        </div>
      ) : tracks.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-[#1a0f09] border border-[#3d2315] text-center max-w-lg mx-auto space-y-4 my-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#27140b] border border-[#4a2b1a] mx-auto flex items-center justify-center text-3xl shadow-inner">
            ☕
          </div>
          <div>
            <h3 className="font-serif-vintage text-xl font-bold text-[#fef3c7]">
              {search ? 'No matching songs found' : 'Your library is empty'}
            </h3>
            <p className="text-xs text-[#a88a74] mt-1.5 leading-relaxed">
              {search
                ? `No songs matched "${search}". Try searching another title, artist, or mood.`
                : 'All songs are loaded from your database.'}
            </p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5">
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
