import React, { useEffect, useState } from 'react';
import { Play, Plus, CloudRain, Sparkles, Disc, Clock, ArrowRight, Heart } from 'lucide-react';
import { api } from '../utils/api';
import { usePlayer } from '../context/PlayerContext';
import { useAmbience } from '../context/AmbienceContext';
import { TrackCard } from '../components/TrackCard';
import { MOOD_DEFINITIONS, formatDuration } from '../utils/formatters';

export function Home({ onNavigate, onEditTrack, onAddToPlaylist, onToggleFavorite, onDeleteTrack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { isEnabled: isAmbienceEnabled, toggleAmbience, setIsAmbienceOpen } = useAmbience();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const res = await api.getStats();
      setStats(res);
    } catch (err) {
      console.warn('Failed to load home stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (moodId) => {
    onNavigate('library', { mood: moodId });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Kerala Tea Stall Atmosphere Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#264436] bg-gradient-to-r from-[#142820] via-[#10221a] to-[#172e24] p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d9822b]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#1e4636]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b382c]/80 border border-[#d9822b]/30 text-xs text-[#deb17a] font-medium mb-4 backdrop-blur-sm">
            <span className="text-sm">🌧️</span>
            <span className="font-malayalam">കട്ടൻ ചായയും ചാറ്റൽ മഴയും</span>
            <span>•</span>
            <span>A Kerala Tea-Stall Evening</span>
          </div>

          <h2 className="font-serif-vintage text-2xl md:text-4xl font-bold text-[#f7f2e8] leading-tight">
            Your Personal Sanctuary for Evening Tunes & Nostalgia
          </h2>

          <p className="mt-3 text-xs md:text-sm text-[#9db2a6] leading-relaxed">
            Welcome to <strong className="text-[#deb17a]">വൈകുന്നേരം (Vainneram)</strong> — your private audio library inspired by quiet evenings at a roadside tea stall. Store your songs, brew a cup of black tea, and listen to the rain.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('add')}
              className="px-5 py-2.5 rounded-xl bg-[#d9822b] hover:bg-[#e69a38] text-white text-xs md:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-black/40 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Music to Library</span>
            </button>

            <button
              onClick={() => {
                if (!isAmbienceEnabled) toggleAmbience();
                setIsAmbienceOpen(true);
              }}
              className={`px-4 py-2.5 rounded-xl border text-xs md:text-sm font-medium flex items-center gap-2 transition-all ${
                isAmbienceEnabled
                  ? 'bg-[#183628] border-[#d9822b] text-[#e69a38]'
                  : 'bg-[#12241c] border-[#224434] text-[#8ea498] hover:text-[#f7f2e8] hover:bg-[#183428]'
              }`}
            >
              <CloudRain className="w-4 h-4 text-[#60a5fa]" />
              <span>{isAmbienceEnabled ? 'Tea Stall Ambience ON' : 'Turn On Rain Sounds'}</span>
            </button>

            <button
              onClick={() => onNavigate('library')}
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-[#162f23] text-xs md:text-sm text-[#8ea498] hover:text-[#f7f2e8] flex items-center gap-1.5 transition-colors"
            >
              <span>Browse Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Effortless Ways to Add Music Banner (No button click needed) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#11231a] border border-[#203c2f] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#183628] flex items-center justify-center text-xl flex-shrink-0">
            🖱️
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#f7f2e8]">Drop Songs Anywhere</h4>
            <p className="text-[11px] text-[#7d9689] mt-0.5">Drag any audio file directly into this browser window to add it instantly.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#11231a] border border-[#203c2f] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#183628] flex items-center justify-center text-xs font-mono font-bold text-[#deb17a] flex-shrink-0">
            Ctrl+O
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#f7f2e8]">Quick Keyboard Key</h4>
            <p className="text-[11px] text-[#7d9689] mt-0.5">Press <kbd className="px-1.5 py-0.5 bg-[#0c1813] border border-[#234434] rounded text-[10px] text-[#deb17a]">Ctrl+O</kbd> or <kbd className="px-1.5 py-0.5 bg-[#0c1813] border border-[#234434] rounded text-[10px] text-[#deb17a]">U</kbd> anywhere to open your file picker.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#11231a] border border-[#203c2f] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#183628] flex items-center justify-center text-xl flex-shrink-0">
            📁
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#f7f2e8]">Drop Folder on Disk</h4>
            <p className="text-[11px] text-[#7d9689] mt-0.5">Copy files directly into the <code className="text-[#deb17a] text-[10px]">drop-music-here/</code> folder on your computer.</p>
          </div>
        </div>
      </div>

      {/* Mood Collections Row */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-vintage text-lg md:text-xl font-bold text-[#f7f2e8]">
              Mood Collections
            </h3>
            <p className="text-xs text-[#7f978a] font-malayalam">
              വികാരങ്ങൾക്കനുസരിച്ച് തിരഞ്ഞെടുത്തത്
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {MOOD_DEFINITIONS.filter(m => m.id !== 'All').slice(0, 4).map((m) => (
            <div
              key={m.id}
              onClick={() => handleMoodSelect(m.id)}
              className="stall-card p-4 rounded-2xl cursor-pointer group flex flex-col justify-between h-36 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl p-2 rounded-xl bg-[#183427] border border-[#234536] group-hover:scale-110 transition-transform">
                  {m.icon}
                </span>
                <span className="text-[11px] font-malayalam text-[#d9822b]">
                  {m.malayalam}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#f7f2e8] group-hover:text-[#e69a38] transition-colors">
                  {m.label}
                </h4>
                <p className="text-[11px] text-[#789385] line-clamp-1 mt-0.5">
                  {m.desc}
                </p>
              </div>
            </div>
          ))}
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

      {/* Recent Additions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-vintage text-lg md:text-xl font-bold text-[#f7f2e8]">
              Recent Additions
            </h3>
            <p className="text-xs text-[#7f978a] font-malayalam">
              അടുത്തിടെ ചേർത്ത പാട്ടുകൾ
            </p>
          </div>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs text-[#deb17a] hover:underline flex items-center gap-1"
          >
            <span>See entire library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-60 rounded-xl bg-[#13271f] animate-pulse" />
            ))}
          </div>
        ) : stats?.recentlyAdded && stats.recentlyAdded.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {stats.recentlyAdded.slice(0, 8).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                allTracks={stats.recentlyAdded}
                onEdit={onEditTrack}
                onAddToPlaylist={onAddToPlaylist}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteTrack}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#11231a] border border-[#1f3d2f] text-center space-y-3">
            <span className="text-4xl block">📻</span>
            <h4 className="font-serif-vintage text-base text-[#f7f2e8]">
              Your library is quiet right now
            </h4>
            <p className="text-xs text-[#7e978a] max-w-sm mx-auto">
              Add your own MP3, WAV, M4A, or OGG files to fill this tea-stall with melodies.
            </p>
            <button
              onClick={() => onNavigate('add')}
              className="px-4 py-2 rounded-xl bg-[#d9822b] hover:bg-[#e69a38] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add First Song
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
