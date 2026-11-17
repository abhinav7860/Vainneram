import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { MOOD_DEFINITIONS } from '../utils/formatters';

export function EditTrackModal({ track, isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [moodTag, setMoodTag] = useState('Warm Chai');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (track) {
      setTitle(track.title || '');
      setArtist(track.artist || '');
      setAlbum(track.album || '');
      setMoodTag(track.mood_tag || 'Warm Chai');
      setError('');
    }
  }, [track]);

  if (!isOpen || !track) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await onSave(track.id, {
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
        mood_tag: moodTag
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update track');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#1c100a] border-2 border-[#422517] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#382014] bg-[#140b07]">
          <div>
            <h3 className="font-serif-vintage text-lg font-semibold text-[#fef3c7]">
              Edit Cassette Details
            </h3>
            <span className="text-xs font-malayalam text-[#f59e0b]">വിവരങ്ങൾ തിരുത്തുക</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#a88a74] hover:text-[#fef3c7] hover:bg-[#27140b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-[#3b1717] border border-[#7a2f2f] text-[#ffb4b4]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#deb17a] mb-1.5">
              Title <span className="text-[#f59e0b]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#120a06] border border-[#3d2315] text-sm text-[#fdf6e7] focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
              placeholder="Track title"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#deb17a] mb-1.5">
              Artist / Singer
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#120a06] border border-[#3d2315] text-sm text-[#fdf6e7] focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
              placeholder="Singer or Composer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#deb17a] mb-1.5">
              Album / Movie
            </label>
            <input
              type="text"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#120a06] border border-[#3d2315] text-sm text-[#fdf6e7] focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
              placeholder="Movie name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#deb17a] mb-1.5">
              Atmosphere / Mood Tag
            </label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {MOOD_DEFINITIONS.filter(m => m.id !== 'All').map(m => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMoodTag(m.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition-all ${
                    moodTag === m.id
                      ? 'bg-gradient-to-r from-[#2f180d] to-[#211008] border-[#f59e0b] text-[#fef3c7] shadow-sm'
                      : 'bg-[#120a06] border-[#382014] text-[#a88a74] hover:border-[#52301e]'
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{m.label}</p>
                    <p className="text-[10px] font-malayalam text-[#deb17a] truncate">{m.malayalam}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#382014]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#a88a74] hover:text-[#fef3c7] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#c2410c] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-950/50 transition-all disabled:opacity-50 border border-[#fed7aa]/30"
            >
              {saving ? 'Saving...' : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
