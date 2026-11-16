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
      setSuccessMsg('Track added to playlist!');
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
      setSuccessMsg(`Created "${created.playlist.name}" and added track!`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#13261f] border border-[#234234] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f3a2e] bg-[#0f1f19]">
          <div>
            <h3 className="font-serif-vintage text-lg font-semibold text-[#f7f2e8]">
              Add to Playlist
            </h3>
            <span className="text-xs text-[#8ea498] truncate block max-w-xs">
              "{track.title}"
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8ba094] hover:text-[#f7f2e8] hover:bg-[#1a3327] transition-colors"
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
            <div className="p-3 mb-4 text-xs rounded-lg bg-[#1a3d2e] border border-[#307054] text-[#86efac] flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4ade80]" />
              {successMsg}
            </div>
          )}

          {/* Quick Create option */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full mb-4 py-2.5 px-3.5 rounded-xl border border-dashed border-[#2f5544] hover:border-[#d9822b] bg-[#0e1d17] hover:bg-[#162e24] text-xs font-medium text-[#deb17a] flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreateAndAdd} className="mb-4 p-3 rounded-xl bg-[#0f1f18] border border-[#234435]">
              <label className="block text-xs font-medium text-[#9eb2a7] mb-1.5">
                New Playlist Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. മഴപ്പാട്ടുകൾ (Rain Songs)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#0a1611] border border-[#264839] text-xs text-[#f7f2e8] focus:outline-none focus:border-[#d9822b]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-[#d9822b] hover:bg-[#e69a38] text-white text-xs font-semibold disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-2 py-1.5 text-xs text-[#7d9487] hover:text-[#f7f2e8]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Playlist list */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-xs text-center py-6 text-[#7d9387]">Loading playlists...</p>
            ) : playlists.length === 0 ? (
              <p className="text-xs text-center py-6 text-[#7d9387]">No playlists created yet. Create one above!</p>
            ) : (
              playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleAdd(pl.id)}
                  disabled={addingToId === pl.id}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0e1d17] hover:bg-[#183327] border border-[#1e392d] text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#162f23] flex items-center justify-center text-[#d9822b] group-hover:bg-[#d9822b] group-hover:text-white transition-colors">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#f7f2e8] truncate">{pl.name}</p>
                      <p className="text-[10px] text-[#7d9387]">{pl.track_count || 0} tracks</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-[#deb17a] opacity-0 group-hover:opacity-100 transition-opacity">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#13261f] border border-[#234234] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f3a2e] bg-[#0f1f19]">
          <div>
            <h3 className="font-serif-vintage text-lg font-semibold text-[#f7f2e8]">
              {playlistToEdit ? 'Edit Playlist' : 'New Playlist'}
            </h3>
            <span className="text-xs font-malayalam text-[#d9822b]">പുതിയ പ്ലേലിസ്റ്റ്</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8ba094] hover:text-[#f7f2e8] hover:bg-[#1a3327] transition-colors"
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
            <label className="block text-xs font-medium text-[#9eb2a7] mb-1.5">
              Playlist Name <span className="text-[#d9822b]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0d1c15] border border-[#244537] text-sm text-[#f7f2e8] focus:outline-none focus:border-[#d9822b]"
              placeholder="e.g. മഴയോർമ്മകൾ (Rain Nostalgia)"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9eb2a7] mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0d1c15] border border-[#244537] text-xs text-[#f7f2e8] focus:outline-none focus:border-[#d9822b]"
              placeholder="A few words on what this collection feels like..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9eb2a7] mb-1.5">
              Collection Mood
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0d1c15] border border-[#244537] text-xs text-[#f7f2e8] focus:outline-none focus:border-[#d9822b]"
            >
              <option value="Rainy Evening">🌧️ Rainy Evening (മഴക്കാലം)</option>
              <option value="Tea Stall Acoustics">☕ Tea Stall Acoustics (ചായപ്പീടിക)</option>
              <option value="Warm Chai">🫖 Warm Chai (കട്ടൻ ചായ)</option>
              <option value="Mellow">🌇 Mellow Twilight (സന്ധ്യാവേള)</option>
              <option value="Folk Echoes">🪕 Folk Echoes (നാടൻ ഈണം)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1f3a2e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#9eb2a7] hover:text-[#f7f2e8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[#d9822b] hover:bg-[#e69a38] text-white text-xs font-semibold shadow-md shadow-black/30 disabled:opacity-50"
            >
              {loading ? 'Saving...' : playlistToEdit ? 'Save Changes' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
