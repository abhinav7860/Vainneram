import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { AmbienceProvider, useAmbience } from './context/AmbienceContext';
import { Navbar, MobileNav } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { QueueDrawer } from './components/QueueDrawer';
import { AtmosphericSplitConsole } from './components/AtmosphericSplitConsole';
import { EditTrackModal } from './components/EditTrackModal';
import { AddToPlaylistModal, CreatePlaylistModal } from './components/AddToPlaylistModal';

// Pages
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Playlists } from './pages/Playlists';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { api } from './utils/api';
import { UploadCloud, CheckCircle2, Play, Sparkles, FolderDown, X, ExternalLink } from 'lucide-react';

function MainApp() {
  const { user, refreshUser } = useAuth();
  const { currentTrack, setCurrentTrack, playTrack } = usePlayer();
  const { rainActive } = useAmbience();

  const [currentTab, setCurrentTab] = useState('home');
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [libraryMood, setLibraryMood] = useState('All');
  const [mobileViewPane, setMobileViewPane] = useState('songs'); // 'songs' | 'atmosphere'

  // Modals state
  const [trackToEdit, setTrackToEdit] = useState(null);
  const [trackForPlaylist, setTrackForPlaylist] = useState(null);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState(null);

  const handleNavigate = (tab, params = {}) => {
    if (tab === 'atmosphere') {
      setMobileViewPane('atmosphere');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setMobileViewPane('songs');
    if (params.mood) {
      setLibraryMood(params.mood);
    }
    if (params.playlistId) {
      setActivePlaylistId(params.playlistId);
    }
    if (tab === 'add') {
      setCurrentTab('library');
    } else {
      setCurrentTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditTrackSave = async (trackId, updatedData) => {
    await api.updateTrack(trackId, updatedData);
    if (currentTrack && currentTrack.id === trackId) {
      setCurrentTrack(prev => ({ ...prev, ...updatedData }));
    }
    refreshUser();
  };

  const handleToggleFavorite = async (track) => {
    try {
      const res = await api.toggleFavorite(track.id);
      track.is_favorite = res.is_favorite ? 1 : 0;
      if (currentTrack && currentTrack.id === track.id) {
        setCurrentTrack(prev => ({ ...prev, is_favorite: res.is_favorite ? 1 : 0 }));
      }
      refreshUser();
    } catch (err) {
      console.warn('Favorite toggle error:', err);
    }
  };

  const handleDeleteTrack = async (track) => {
    if (!window.confirm(`Are you sure you want to delete "${track.title}" from your library?`)) {
      return;
    }
    try {
      await api.deleteTrack(track.id);
      if (currentTrack && currentTrack.id === track.id) {
        setCurrentTrack(null);
      }
      refreshUser();
      if (currentTab === 'library') {
        setCurrentTab('library');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete track');
    }
  };

  const handleDeletePlaylist = async (playlist) => {
    if (!window.confirm(`Are you sure you want to delete playlist "${playlist.name}"?`)) {
      return;
    }
    try {
      await api.deletePlaylist(playlist.id);
      refreshUser();
      if (currentTab === 'playlist-detail') {
        setCurrentTab('playlists');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete playlist');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#100905] text-[#fdf6e7] pb-36 md:pb-24 relative">
      {/* Gentle Rainy Window Backdrop (Active when Rain Ambience is playing) */}
      {rainActive && (
        <div className="fixed inset-0 pointer-events-none z-10 opacity-30 mix-blend-screen overflow-hidden">
          <div className="rain-window-backdrop absolute inset-0 scale-125" />
        </div>
      )}

      {/* Top Navbar with Navigation Tabs */}
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />

      {/* Tablet/Medium Screen View Switcher (Only visible between sm and lg; mobile uses bottom nav) */}
      <div className="hidden sm:flex lg:hidden items-center justify-center p-2.5 bg-[#140b07] border-b border-[#382014]">
        <div className="flex items-center gap-1 p-1 bg-[#0d0704] rounded-xl border border-[#382014] w-full max-w-sm shadow-inner">
          <button
            onClick={() => setMobileViewPane('songs')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileViewPane === 'songs'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-md border border-[#f59e0b]/40'
                : 'text-[#baa290] hover:text-[#fdf6e7]'
            }`}
          >
            <span>📼</span>
            <span>കാസറ്റുകൾ (Cassettes)</span>
          </button>
          <button
            onClick={() => setMobileViewPane('atmosphere')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileViewPane === 'atmosphere'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-md border border-[#f59e0b]/40'
                : 'text-[#baa290] hover:text-[#fdf6e7]'
            }`}
          >
            <span>🍵</span>
            <span>അന്തരീക്ഷം (Ambience Console)</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Desktop = Side-by-Side 50/50 | Mobile = Smart Tabbed Responsive View */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1850px] mx-auto min-h-0">
        {/* Left Side: Vintage Tea Stall Radio Shelf */}
        <section className={`w-full lg:w-[410px] xl:w-[450px] 2xl:w-[470px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#3a2013] bg-[#140b07] p-4 md:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#382014] ${
          mobileViewPane === 'atmosphere' ? 'flex flex-col' : 'hidden lg:flex flex-col'
        }`}>
          <AtmosphericSplitConsole />
        </section>

        {/* Right Side: Chayakada Music Lounge & Cassette Archive */}
        <main className={`flex-1 min-w-0 p-4 md:p-6 lg:p-8 overflow-y-auto bg-[#0e0704] ${
          mobileViewPane === 'songs' ? 'block' : 'hidden lg:block'
        }`}>
          {currentTab === 'home' && (
            <Home
              onNavigate={handleNavigate}
              onEditTrack={(t) => setTrackToEdit(t)}
              onAddToPlaylist={(t) => setTrackForPlaylist(t)}
              onToggleFavorite={handleToggleFavorite}
              onDeleteTrack={handleDeleteTrack}
            />
          )}

          {currentTab === 'library' && (
            <Library
              initialMood={libraryMood}
              onNavigate={handleNavigate}
              onEditTrack={(t) => setTrackToEdit(t)}
              onAddToPlaylist={(t) => setTrackForPlaylist(t)}
              onToggleFavorite={handleToggleFavorite}
              onDeleteTrack={handleDeleteTrack}
            />
          )}

          {currentTab === 'playlists' && (
            <Playlists
              onOpenPlaylist={(id) => handleNavigate('playlist-detail', { playlistId: id })}
              onCreatePlaylist={() => { setPlaylistToEdit(null); setIsCreatePlaylistOpen(true); }}
              onEditPlaylist={(p) => { setPlaylistToEdit(p); setIsCreatePlaylistOpen(true); }}
              onDeletePlaylist={handleDeletePlaylist}
            />
          )}

          {currentTab === 'playlist-detail' && activePlaylistId && (
            <PlaylistDetail
              playlistId={activePlaylistId}
              onBack={() => setCurrentTab('playlists')}
              onNavigate={handleNavigate}
              onEditTrack={(t) => setTrackToEdit(t)}
              onAddToPlaylist={(t) => setTrackForPlaylist(t)}
              onToggleFavorite={handleToggleFavorite}
              onDeleteTrack={handleDeleteTrack}
              onEditPlaylist={(p) => { setPlaylistToEdit(p); setIsCreatePlaylistOpen(true); }}
              onDeletePlaylist={handleDeletePlaylist}
            />
          )}

          {/* Nostalgic Kerala Chayakada Footer */}
          <footer className="mt-14 pt-6 pb-2 border-t border-[#382014]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8c7462]">
            <div className="flex items-center gap-2">
              <span className="text-base">🍵</span>
              <div>
                <span className="font-serif-vintage text-xs font-bold text-[#fed7aa] block leading-tight">
                  വൈകുന്നേരം — Vainneram
                </span>
                <span className="text-[10px] text-[#8a6e5a] font-malayalam">
                  നാടൻ ചായക്കട സംഗീതം • 113 Classic Cassettes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px]">
                Created by <strong className="text-[#fdf6e7] font-semibold">Abhinav Sabu</strong>
              </span>
              <span className="text-[#5c3c28]">•</span>
              <a
                href="https://github.com/abhinav7860/Vainneram"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e1009] hover:bg-[#2e180d] border border-[#d97706]/40 hover:border-[#f59e0b] text-[#fed7aa] hover:text-white transition-all shadow-sm group select-none"
                title="View Vainneram source code on GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current text-[#d97706] group-hover:text-[#f59e0b]" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span className="font-mono text-[11px] font-bold">GitHub</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
              </a>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Navigation bar */}
      <MobileNav currentTab={currentTab} mobileViewPane={mobileViewPane} onNavigate={handleNavigate} />

      {/* Persistent Bottom Audio Player */}
      <Player />

      {/* Global Modals */}
      <EditTrackModal
        track={trackToEdit}
        isOpen={Boolean(trackToEdit)}
        onClose={() => setTrackToEdit(null)}
        onSave={handleEditTrackSave}
      />

      <AddToPlaylistModal
        track={trackForPlaylist}
        isOpen={Boolean(trackForPlaylist)}
        onClose={() => setTrackForPlaylist(null)}
        onCreatedOrAdded={() => { refreshUser(); }}
      />

      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => { setIsCreatePlaylistOpen(false); setPlaylistToEdit(null); }}
        onCreated={() => { refreshUser(); }}
        playlistToEdit={playlistToEdit}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AmbienceProvider>
        <PlayerProvider>
          <MainApp />
        </PlayerProvider>
      </AmbienceProvider>
    </AuthProvider>
  );
}
