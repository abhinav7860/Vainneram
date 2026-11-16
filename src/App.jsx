import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { AmbienceProvider } from './context/AmbienceContext';
import { Navbar, MobileNav } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { QueueDrawer } from './components/QueueDrawer';
import { AmbiencePanel } from './components/AmbiencePanel';
import { EditTrackModal } from './components/EditTrackModal';
import { AddToPlaylistModal, CreatePlaylistModal } from './components/AddToPlaylistModal';

// Pages
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Playlists } from './pages/Playlists';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { AddMusic } from './pages/AddMusic';
import { AuthPage } from './pages/AuthPage';
import { api } from './utils/api';

function MainApp() {
  const { user, loading, refreshUser } = useAuth();
  const { currentTrack, setCurrentTrack } = usePlayer();

  const [currentTab, setCurrentTab] = useState('home');
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [libraryMood, setLibraryMood] = useState('All');

  // Modals state
  const [trackToEdit, setTrackToEdit] = useState(null);
  const [trackForPlaylist, setTrackForPlaylist] = useState(null);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c1813] flex flex-col items-center justify-center text-[#deb17a]">
        <div className="w-12 h-12 rounded-2xl bg-[#142820] border border-[#244837] flex items-center justify-center text-2xl shadow-xl animate-pulse mb-3">
          🍵
        </div>
        <p className="font-serif-vintage text-sm font-semibold tracking-wide text-[#f7f2e8]">
          വൈകുന്നേരം — Vainneram
        </p>
        <p className="text-xs text-[#7e978a] font-malayalam mt-1">
          തയ്യാറാകുന്നു... (Loading library)
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleNavigate = (tab, params = {}) => {
    if (params.mood) {
      setLibraryMood(params.mood);
    }
    if (params.playlistId) {
      setActivePlaylistId(params.playlistId);
    }
    setCurrentTab(tab);
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
      // Reload current view
      if (currentTab === 'library') {
        setCurrentTab('library');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete track');
    }
  };

  const handleDeletePlaylist = async (playlist) => {
    if (!window.confirm(`Are you sure you want to delete playlist "${playlist.name}"? (Songs in library will not be deleted)`)) {
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
    <div className="min-h-screen flex flex-col bg-[#0c1813] text-[#f7f2e8] pb-28 md:pb-24">
      {/* Top Navbar */}
      <Navbar onAddClick={() => handleNavigate('add')} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar currentTab={currentTab} setCurrentTab={(tab) => handleNavigate(tab)} />

        <main className="flex-1 min-w-0 p-4 md:p-8">
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

          {currentTab === 'add' && (
            <AddMusic
              onTrackAdded={() => { refreshUser(); }}
              onNavigate={handleNavigate}
            />
          )}
        </main>
      </div>

      {/* Mobile Navigation bar */}
      <MobileNav currentTab={currentTab} setCurrentTab={(tab) => handleNavigate(tab)} />

      {/* Persistent Bottom Audio Player */}
      <Player />

      {/* Queue Drawer */}
      <QueueDrawer />

      {/* Ambience Mixer Panel */}
      <AmbiencePanel />

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
