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
import { UploadCloud, CheckCircle2, Play, Sparkles, FolderDown, X } from 'lucide-react';

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
