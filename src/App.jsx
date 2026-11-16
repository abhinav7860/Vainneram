import React, { useState, useEffect, useRef } from 'react';
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
import { api } from './utils/api';
import { UploadCloud, CheckCircle2, Play, Sparkles, FolderDown, X } from 'lucide-react';

function MainApp() {
  const { user, refreshUser } = useAuth();
  const { currentTrack, setCurrentTrack, playTrack } = usePlayer();

  const [currentTab, setCurrentTab] = useState('home');
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [libraryMood, setLibraryMood] = useState('All');

  // Modals state
  const [trackToEdit, setTrackToEdit] = useState(null);
  const [trackForPlaylist, setTrackForPlaylist] = useState(null);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState(null);

  // Global Drag & Drop anywhere + Direct file input
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const [uploadToast, setUploadToast] = useState(null); // { status: 'uploading' | 'success' | 'error', text: '', track: null }
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  // Auto-scan drop-music-here/ folder periodically
  useEffect(() => {
    const checkDropFolder = async () => {
      try {
        const res = await fetch('/api/tracks/scan-drop-folder', { method: 'POST' });
        const data = await res.json();
        if (data.count > 0) {
          refreshUser();
          setUploadToast({
            status: 'success',
            text: `Imported ${data.count} song(s) from local folder!`,
            track: data.added[0]
          });
          setTimeout(() => setUploadToast(null), 5000);
        }
      } catch (e) {}
    };

    const interval = setInterval(checkDropFolder, 4000);
    return () => clearInterval(interval);
  }, []);

  // Global Drag & Drop and Keyboard Shortcuts (Ctrl+O or U)
  useEffect(() => {
    const handleDragEnter = (e) => {
      e.preventDefault();
      dragCounterRef.current += 1;
      if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
        setIsWindowDragging(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        setIsWindowDragging(false);
        dragCounterRef.current = 0;
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      setIsWindowDragging(false);
      dragCounterRef.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        await handleDirectFileUpload(file);
      }
    };

    const handleKeyDown = (e) => {
      // Ignore if in input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      // Ctrl+O or U to trigger direct file picker without clicking webpage button
      if ((e.ctrlKey && e.key === 'o') || (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Upload file directly without clicking webpage button
  const handleDirectFileUpload = async (file) => {
    if (!file) return;

    const validExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.webm'];
    const name = file.name.toLowerCase();
    const hasValidExt = validExts.some(ext => name.endsWith(ext));

    if (!file.type.startsWith('audio/') && !hasValidExt) {
      setUploadToast({
        status: 'error',
        text: `"${file.name}" is not a supported audio format (MP3, WAV, M4A, OGG, FLAC, AAC).`
      });
      setTimeout(() => setUploadToast(null), 4000);
      return;
    }

    try {
      setUploadToast({
        status: 'uploading',
        text: `Adding "${file.name}" to library...`
      });

      const formData = new FormData();
      formData.append('audio', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('mood_tag', 'Tea Stall Acoustics');

      const res = await api.uploadTrackWithProgress(formData);
      refreshUser();

      setUploadToast({
        status: 'success',
        text: `Added "${res.track.title}" to library!`,
        track: res.track
      });

      setTimeout(() => setUploadToast(null), 6000);
    } catch (err) {
      setUploadToast({
        status: 'error',
        text: err.message || 'Upload failed'
      });
      setTimeout(() => setUploadToast(null), 4000);
    }
  };

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
    <div className="min-h-screen flex flex-col bg-[#0c1813] text-[#f7f2e8] pb-28 md:pb-24 relative">
      {/* Hidden file input for shortcut Ctrl+O / U */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleDirectFileUpload(e.target.files[0]);
            e.target.value = '';
          }
        }}
        className="hidden"
      />

      {/* Full-Screen Drag & Drop Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-50 bg-[#0c1813]/90 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-[#d9822b] m-4 rounded-3xl animate-in fade-in duration-200 pointer-events-none">
          <div className="w-24 h-24 rounded-3xl bg-[#183628] border border-[#d9822b] flex items-center justify-center text-4xl mb-4 shadow-2xl animate-bounce">
            🍵
          </div>
          <h2 className="font-serif-vintage text-2xl md:text-3xl font-bold text-[#f7f2e8]">
            Drop your music anywhere
          </h2>
          <p className="text-sm text-[#deb17a] mt-2 font-malayalam">
            പാട്ടുകൾ ഇവിടെ നിക്ഷേപിക്കൂ — നേരിട്ട് ലൈബ്രറിയിലേക്ക്
          </p>
          <p className="text-xs text-[#80998c] mt-1">
            Supports MP3, WAV, M4A, OGG, FLAC, AAC
          </p>
        </div>
      )}

      {/* Floating Upload Toast Notification */}
      {uploadToast && (
        <div className="fixed top-16 right-4 md:right-8 z-50 bg-[#142820] border border-[#2b5942] text-[#f7f2e8] p-3.5 rounded-2xl shadow-2xl shadow-black/60 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 max-w-sm">
          {uploadToast.status === 'uploading' && (
            <div className="w-5 h-5 border-2 border-[#d9822b] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
          {uploadToast.status === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-[#4ade80] flex-shrink-0" />
          )}
          {uploadToast.status === 'error' && (
            <span className="text-base flex-shrink-0">⚠️</span>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#f7f2e8] truncate">
              {uploadToast.text}
            </p>
            {uploadToast.track && (
              <button
                onClick={() => {
                  playTrack(uploadToast.track);
                  setUploadToast(null);
                }}
                className="text-[11px] text-[#deb17a] hover:underline font-semibold flex items-center gap-1 mt-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play Now</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setUploadToast(null)}
            className="p-1 rounded-md text-[#789385] hover:text-[#f7f2e8]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar onAddClick={() => fileInputRef.current?.click()} />

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
