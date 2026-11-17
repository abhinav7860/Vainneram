import React, { useState, useEffect } from 'react';
import { X, Plus, Music, Check } from 'lucide-react';
import { api } from '../utils/api';

export function AddToPlaylistModal({ track, isOpen, onClose, onCreatedOrAdded }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToId, setAddingToId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
      setShowCreateForm(false);
      setNewPlaylistName('');
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const res = await api.getPlaylists();
      setPlaylists(res.playlists || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !track) return null;

  const handleAdd = async (playlistId) => {
    try {
      setAddingToId(playlistId);
      setErrorMsg('');
      await api.addTrackToPlaylist(playlistId, track.id);
      setSuccessMsg('Cassette added to playlist!');
      if (onCreatedOrAdded) onCreatedOrAdded();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add track to playlist');
    } finally {
      setAddingToId(null);
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const created = await api.createPlaylist(newPlaylistName.trim(), 'Custom playlist');
      await api.addTrackToPlaylist(created.playlist.id, track.id);
      setSuccessMsg(`Created "${created.playlist.name}" and added cassette!`);
      if (onCreatedOrAdded) onCreatedOrAdded();
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#1c100a] border-2 border-[#422517] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#382014] bg-[#140b07]">
          <div>
            <h3 className="font-serif-vintage text-lg font-semibold text-[#fef3c7]">
              Add to Playlist
            </h3>
            <span className="text-xs text-[#deb17a] truncate block max-w-xs">
              "{track.title}"
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#a88a74] hover:text-[#fef3c7] hover:bg-[#27140b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="p-3 mb-4 text-xs rounded-lg bg-[#3b1717] border border-[#7a2f2f] text-[#ffb4b4]">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 text-xs rounded-lg bg-[#27150c] border border-[#d97706]/60 text-[#fed7aa] flex items-center gap-2">
              <Check className="w-4 h-4 text-[#f59e0b]" />
              {successMsg}
            </div>
          )}

          {/* Quick Create option */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full mb-4 py-2.5 px-3.5 rounded-xl border border-dashed border-[#52301e] hover:border-[#d97706] bg-[#140b07] hover:bg-[#24140c] text-xs font-medium text-[#fed7aa] flex items-center justify-center gap-2 transition-all shadow-inner"
            >
              <Plus className="w-4 h-4 text-[#f59e0b]" />
              <span>Create New Playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreateAndAdd} className="mb-4 p-3 rounded-xl bg-[#140b07] border border-[#382014]">
              <label className="block text-xs font-medium text-[#deb17a] mb-1.5">
                New Playlist Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. മഴപ്പാട്ടുകൾ (Rain Songs)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#0e0704] border border-[#382014] text-xs text-[#fdf6e7] focus:outline-none focus:border-[#d97706]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#d97706] to-[#b45309] text-white text-xs font-semibold disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-2 py-1.5 text-xs text-[#a88a74] hover:text-[#fef3c7]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Playlist list */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-xs text-center py-6 text-[#a88a74]">Loading playlists...</p>
            ) : playlists.length === 0 ? (
              <p className="text-xs text-center py-6 text-[#a88a74]">No playlists created yet. Create one above!</p>
            ) : (
              playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleAdd(pl.id)}
                  disabled={addingToId === pl.id}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#140b07] hover:bg-[#25150d] border border-[#382014] hover:border-[#d97706]/60 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#27140b] border border-[#3d2315] flex items-center justify-center text-[#d97706] group-hover:bg-[#d97706] group-hover:text-white transition-colors">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#fdf6e7] truncate">{pl.name}</p>
                      <p className="text-[10px] text-[#a88a74]">{pl.track_count || 0} cassettes</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-[#fed7aa] opacity-0 group-hover:opacity-100 transition-opacity">
                    Add +
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreatePlaylistModal({ isOpen, onClose, onCreated, playlistToEdit = null }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState('Rainy Evening');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (playlistToEdit) {
      setName(playlistToEdit.name || '');
      setDescription(playlistToEdit.description || '');
      setMood(playlistToEdit.mood || 'Rainy Evening');
    } else {
      setName('');
      setDescription('');
      setMood('Rainy Evening');
    }
    setError('');
  }, [playlistToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Playlist name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (playlistToEdit) {
        await api.updatePlaylist(playlistToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          mood
        });
      } else {
        await api.createPlaylist(name.trim(), description.trim(), mood);
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#1c100a] border-2 border-[#422517] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#382014] bg-[#140b07]">
          <div>
            <h3 className="font-serif-vintage text-lg font-semibold text-[#fef3c7]">
              {playlistToEdit ? 'Edit Playlist' : 'New Playlist'}
            </h3>
            <span className="text-xs font-malayalam text-[#f59e0b]">പുതിയ പ്ലേലിസ്റ്റ്</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#a88a74] hover:text-[#fef3c7] hover:bg-[#27140b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-[#3b1717] border border-[#7a2f2f] text-[#ffb4b4]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#deb17a] mb-1.5">
              Playlist Name <span className="text-[#f59e0b]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#120a06] border border-[#382014] text-sm text-[#fdf6e7] focus:outline-none focus:border-[#d97706]"
              placeholder="e.g. മഴയോർമ്മകൾ (Rain Nostalgia)"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#deb17a] mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 rounded-lg bg-[#120a06] border border-[#382014] text-xs text-[#fdf6e7] focus:outline-none focus:border-[#d97706]"
              placeholder="A few words on what this nostalgic collection feels like..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#deb17a] mb-1.5">
              Collection Mood
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#120a06] border border-[#382014] text-xs text-[#fdf6e7] focus:outline-none focus:border-[#d97706]"
            >
              <option value="Rainy Evening">🌧️ Rainy Evening (മഴക്കാലം)</option>
              <option value="Tea Stall Acoustics">☕ Tea Stall Acoustics (ചായപ്പീടിക)</option>
              <option value="Warm Chai">🫖 Warm Chai (കട്ടൻ ചായ)</option>
              <option value="Mellow Twilight">🌇 Mellow Twilight (സന്ധ്യാവേള)</option>
              <option value="Folk Echoes">🌾 Folk Echoes (നാടൻ ഈണം)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#382014]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#a88a74] hover:text-[#fef3c7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#c2410c] text-white text-xs font-semibold shadow-md shadow-amber-950/50 disabled:opacity-50 border border-[#fed7aa]/30"
            >
              {loading ? 'Saving...' : playlistToEdit ? 'Save Changes' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
