import React, { useEffect, useState } from 'react';
import { Play, Disc, CloudRain, Sparkles, Clock, ArrowRight, Heart, Search } from 'lucide-react';
import { api } from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
import { useAmbience } from '../context/AmbienceContext';
import { TrackCard } from '../components/TrackCard';
import { TurntableDeck } from '../components/TurntableDeck';
import { MOOD_DEFINITIONS, formatDuration } from '../utils/formatters';

export function Home({ onNavigate, onEditTrack, onAddToPlaylist, onToggleFavorite, onDeleteTrack }) {
  const [stats, setStats] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedMood, setSelectedMood] = useState('All');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(16);
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { isEnabled: isAmbienceEnabled, toggleAmbience, setIsAmbienceOpen } = useAmbience();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [statsRes, tracksRes] = await Promise.all([
        api.getStats().catch(() => null),
        api.getTracks().catch(() => ({ tracks: [] }))
      ]);
      setStats(statsRes);
      setTracks(tracksRes?.tracks || []);
    } catch (err) {
      console.warn('Failed to load home stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (moodId) => {
    // Toggle on click: clicking active mood resets back to 'All'
    setSelectedMood(prev => (prev === moodId ? 'All' : moodId));
  };

  const handlePlayFirst = () => {
    if (displayedTracks.length > 0) {
      playTrack(displayedTracks[0], displayedTracks, 0);
    }
  };

  // Filter tracks by both selected mood AND search query
  const displayedTracks = tracks.filter(t => {
    const matchesSearch = !search.trim() || 
      (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.artist || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.album || '').toLowerCase().includes(search.toLowerCase());
    const matchesMood = selectedMood === 'All' || t.mood_tag === selectedMood;
    return matchesSearch && matchesMood;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Vintage Kerala Vinyl Turntable Lounge */}
      <section>
        <TurntableDeck allTracks={tracks} />
      </section>

      {/* Vintage Chayakada Chalkboard Slate Hero */}
      <div className="relative rounded-2xl overflow-hidden chayakada-slate border-2 border-[#4a2b1a] p-5 sm:p-7 shadow-2xl">
        {/* Filament bulb ambient glow origin */}
        <div className="absolute -top-16 left-1/3 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-filament" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#d97706]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#27150c] border border-[#d97706]/50 text-[11px] text-[#fed7aa] font-medium mb-3 shadow-sm">
            <span className="text-sm">☕</span>
            <span className="font-malayalam font-bold text-[#f59e0b]">ഇന്നത്തെ ചായക്കട സ്പെഷ്യൽ</span>
            <span className="text-[#8c7462]">•</span>
            <span className="font-mono text-[10px] text-[#d5c3aa]">113 VINTAGE CASSETTES</span>
          </div>

          <h2 className="font-serif-vintage text-2xl sm:text-4xl font-bold text-[#fef3c7] leading-tight tracking-wide drop-shadow-md">
            ഒരു കപ്പ് കട്ടൻ ചായയും, 113 പഴയ പാട്ടുകളും
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-[#d5c3aa] leading-relaxed font-sans">
            നാട്ടിൻപുറത്തെ ചായക്കടയിലെ റേഡിയോയിൽ നിന്ന് കേൾക്കുന്ന പഴയ മലയാള ഗാനങ്ങൾ, ചാറ്റൽ മഴ, ചൂടുള്ള ഓർമ്മകൾ. കാസറ്റ് തിരിയുമ്പോൾ പഴയൊരു സന്ധ്യ പുനർജനിക്കുന്നു.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={handlePlayFirst}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#c2410c] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-950/60 transition-all hover:scale-105 active:scale-95 border border-[#fed7aa]/30"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>പാട്ടുകൾ മുഴുവൻ കേൾക്കാം ({tracks.length || 113})</span>
            </button>

            <button
              onClick={() => onNavigate('library')}
              className="px-4 py-2.5 rounded-xl bg-[#1c100a] hover:bg-[#29170e] border border-[#422517] text-[#fed7aa] text-xs sm:text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-inner"
            >
              <Disc className="w-4 h-4 text-[#f59e0b]" />
              <span>പൂർണ്ണ ഗാനശേഖരം (Cassette Library)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chayakada Mood Moments Row */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="font-serif-vintage text-lg md:text-xl font-bold text-[#f7f2e8] flex items-center gap-2">
                <span>ചായക്കട ഓർമ്മകൾ</span>
                <span className="text-xs font-mono text-[#8ca396] font-normal tracking-wider uppercase hidden sm:inline">
                  • Tea Stall Moments
                </span>
              </h3>
              <p className="text-xs text-[#7f978a] font-malayalam">
                ക്ലിക്ക് ചെയ്താൽ താഴെ പാട്ടുകൾ ഫിൽട്ടർ ചെയ്യാം (Click card to filter songs)
              </p>
            </div>
            {selectedMood !== 'All' && (
              <button
                onClick={() => setSelectedMood('All')}
                className="px-2.5 py-1 rounded-full bg-[#27150c] border border-[#d9822b]/50 text-[#deb17a] text-[10px] font-mono flex items-center gap-1 hover:bg-[#381f12] transition-colors"
                title="Reset mood filter"
              >
                <span>RESET ({selectedMood})</span>
                <span>✕</span>
              </button>
            )}
          </div>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs text-[#deb17a] hover:underline flex items-center gap-1 font-mono uppercase tracking-wider"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { id: 'Tea Stall Acoustics', label: 'കട്ടൻ ചായ', sub: 'Chai Stall', icon: '☕', desc: 'ശാന്തമായ പഴയ ചായക്കട ഗാനങ്ങൾ' },
            { id: 'Rainy Evening', label: 'മഴക്കാലം', sub: 'Rainy Twilight', icon: '🌧️', desc: 'തകര ഷീറ്റിലെ മഴയും പാട്ടും' },
            { id: 'Warm Chai', label: 'ചായപ്പീടിക', sub: 'Warm Chai', icon: '🫖', desc: 'ചൂടുള്ള ഗൃഹാതുരമായ ഈണങ്ങൾ' },
            { id: 'Mellow Twilight', label: 'സന്ധ്യാവേള', sub: 'Mellow Dusk', icon: '🌇', desc: 'സന്ധ്യാനേരത്തെ ശാന്തമായ ഈണങ്ങൾ' },
            { id: 'Folk Echoes', label: 'നാടൻ ശീലുകൾ', sub: 'Kerala Folk', icon: '🌾', desc: 'മൺമണമുള്ള നാടൻ പാട്ടുകൾ' },
          ].map((m) => {
            const count = tracks.filter(t => t.mood_tag === m.id).length;
            const isSelected = selectedMood === m.id;

            return (
              <div
                key={m.id}
                onClick={() => handleMoodSelect(m.id)}
                className={`p-3.5 rounded-2xl cursor-pointer group flex flex-col justify-between h-36 relative overflow-hidden border-2 transition-all duration-300 select-none shadow-md ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#381d10] via-[#2a150b] to-[#1c0d06] border-[#f59e0b] shadow-xl shadow-amber-950/70 ring-1 ring-[#f59e0b]/70 scale-[1.02]'
                    : 'bg-gradient-to-br from-[#22130b] via-[#1a0e07] to-[#130a05] border-[#3e2417] hover:border-[#d97706]/80 hover:bg-[#28160d] hover:-translate-y-0.5'
                }`}
                title={isSelected ? 'ക്ലിക്ക് ചെയ്താൽ ഫിൽട്ടർ മാറും (Click to reset)' : `${m.label} - ${count} പാട്ടുകൾ കാണുക`}
              >
                {/* Brass corner accent */}
                <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#d97706]/40 pointer-events-none" />

                <div className="flex items-start justify-between">
                  <span className={`text-2xl p-2 rounded-xl border transition-all shadow-inner ${
                    isSelected ? 'bg-[#452210] border-[#f59e0b]/60 text-white' : 'bg-[#180e08] border-[#382014] group-hover:scale-110 group-hover:border-[#d97706]/40'
                  }`}>
                    {m.icon}
                  </span>
                  <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white border-[#fed7aa]/50 shadow-sm font-bold'
                      : 'bg-[#150c07] text-[#fed7aa] border-[#d97706]/30'
                  }`}>
                    {count} പാട്ടുകൾ
                  </span>
                </div>

                <div>
                  <h4 className={`text-sm font-bold font-malayalam transition-colors ${
                    isSelected ? 'text-[#fef3c7]' : 'text-[#fdf6e7] group-hover:text-[#f59e0b]'
                  }`}>
                    {m.label}
                  </h4>
                  <p className="text-[10px] text-[#a88a74] line-clamp-1 mt-0.5 font-sans">
                    {isSelected ? '✓ ഫിൽട്ടർ സജീവം (Tap to reset)' : m.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Continue Listening / Recently Played */}
      {stats?.recentlyPlayed && stats.recentlyPlayed.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#d9822b]" />
              <h3 className="font-serif-vintage text-lg md:text-xl font-bold text-[#f7f2e8]">
                Continue Listening
              </h3>
            </div>
            <button
              onClick={() => onNavigate('library', { sort: 'played' })}
              className="text-xs text-[#deb17a] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {stats.recentlyPlayed.slice(0, 4).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                allTracks={stats.recentlyPlayed}
                onEdit={onEditTrack}
                onAddToPlaylist={onAddToPlaylist}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteTrack}
              />
            ))}
          </div>
        </section>
      )}

      {/* Complete Song Library Section Right on Home */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-vintage text-lg md:text-xl font-bold text-[#fef3c7]">
                പഴയ കാസറ്റുകൾ • Vintage Cassette Archive
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#27140b] border border-[#d97706]/50 text-[#fed7aa] font-bold">
                {displayedTracks.length} Cassettes
              </span>
            </div>
            <p className="text-xs text-[#baa290] font-malayalam mt-0.5">
              തട്ടിലെ കാസറ്റുകൾ ക്ലിക്ക് ചെയ്യുമ്പോൾ പാട്ട് കേൾക്കാം (Click any cassette to play)
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8a6e5a] absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${tracks.length || 113} cassettes...`}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#160d08] border border-[#382014] text-xs text-[#fdf6e7] placeholder-[#8a6e5a] focus:outline-none focus:border-[#d97706]"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="h-60 rounded-xl bg-[#1e110a] border border-[#382014] animate-pulse" />
            ))}
          </div>
        ) : displayedTracks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {displayedTracks.slice(0, visibleCount).map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  allTracks={displayedTracks}
                  onEdit={onEditTrack}
                  onAddToPlaylist={onAddToPlaylist}
                  onToggleFavorite={onToggleFavorite}
                  onDelete={onDeleteTrack}
                />
              ))}
            </div>

            {/* Show more button if more songs available */}
            {displayedTracks.length > visibleCount && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setVisibleCount(prev => prev + 24)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2a170e] to-[#1c0e07] hover:from-[#381f13] hover:to-[#26130a] border border-[#4a2b1a] text-[#fef3c7] text-xs font-semibold shadow-md transition-all hover:scale-105"
                >
                  Load More Songs ({displayedTracks.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 rounded-2xl bg-[#160d08] border border-[#382014] text-center space-y-3">
            <span className="text-4xl block">🔍</span>
            <h4 className="font-serif-vintage text-base text-[#f7f2e8]">
              No songs found matching "{search}"
            </h4>
            <p className="text-xs text-[#a88a74]">
              Try searching by movie name, singer, or another keyword.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
