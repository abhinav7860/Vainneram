import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Music, Image as ImageIcon, Sparkles, FileAudio, X } from 'lucide-react';
import { api } from '../utils/api';
import { MOOD_DEFINITIONS, formatBytes } from '../utils/formatters';

export function AddMusic({ onTrackAdded, onNavigate }) {
  const [dragActive, setDragActive] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [moodTag, setMoodTag] = useState('Rainy Evening');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [seedingSamples, setSeedingSamples] = useState(false);

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;

    // Check audio extension or mimetype
    const validExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.webm'];
    const name = file.name.toLowerCase();
    const hasValidExt = validExts.some(ext => name.endsWith(ext));

    if (!file.type.startsWith('audio/') && !hasValidExt) {
      setError(`Unsupported format (${file.name}). Please upload MP3, WAV, M4A, OGG, FLAC, or AAC.`);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File exceeds 100MB maximum size limit.');
      return;
    }

    setError('');
    setSuccess('');
    setAudioFile(file);

    // Auto-detect title and artist from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const parts = cleanName.split(' - ');
    if (parts.length >= 2) {
      setArtist(parts[0].replace(/^\d+[\s._-]+/, '').trim());
      setTitle(parts[1].trim());
    } else {
      setTitle(cleanName.replace(/^\d+[\s._-]+/, '').trim());
      if (!artist) setArtist('Unknown Artist');
    }

    if (!album) setAlbum('Personal Library');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAudioSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleCoverSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      setError('Please select an audio file to upload.');
      return;
    }

    try {
      setUploading(true);
      setProgress(10);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('audio', audioFile);
      if (coverFile) {
        formData.append('cover', coverFile);
      }
      formData.append('title', title.trim() || audioFile.name);
      formData.append('artist', artist.trim() || 'Unknown Artist');
      formData.append('album', album.trim() || 'Singles');
      formData.append('mood_tag', moodTag);

      const res = await api.uploadTrackWithProgress(formData, (percent) => {
        setProgress(percent);
      });

      setSuccess(`"${res.track.title}" added to your personal library!`);
      // Reset form
      setAudioFile(null);
      setCoverFile(null);
      setCoverPreview('');
      setTitle('');
      setArtist('');
      setAlbum('');

      if (onTrackAdded) onTrackAdded(res.track);
    } catch (err) {
      setError(err.message || 'Upload failed. Please check file format.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSamples = async () => {
    try {
      setSeedingSamples(true);
      setError('');
      await api.seedSampleTracks();
      setSuccess('Kerala Tea-Stall Atmosphere Pack added to your library!');
      if (onTrackAdded) onTrackAdded();
    } catch (err) {
      setError(err.message || 'Failed to load sample tracks.');
    } finally {
      setSeedingSamples(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#1c362b] pb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-serif-vintage text-2xl md:text-3xl font-bold text-[#f7f2e8]">
            Add Music
          </h2>
          <span className="text-xs font-malayalam text-[#deb17a] px-2.5 py-0.5 rounded-full bg-[#183628] border border-[#d9822b]/30">
            പാട്ട് ചേർക്കുക
          </span>
        </div>
        <p className="text-xs text-[#8da497] mt-1">
          Store audio files you own in your private personal library. All tracks are stored securely and remain exclusively accessible to you.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-[#381818] border border-[#7a2f2f] text-[#ffb4b4] text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#f87171] flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-[#143827] border border-[#2b6649] text-[#86efac] text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#4ade80] flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs font-semibold text-[#f7f2e8] underline ml-2"
          >
            Go to Library →
          </button>
        </div>
      )}

      {/* Drop Zone */}
      {!audioFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => audioInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#d9822b] bg-[#1a382b]'
              : 'border-[#264839] hover:border-[#d9822b] bg-[#10221a] hover:bg-[#13281f]'
          }`}
        >
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
            onChange={handleAudioSelect}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-[#183628] border border-[#28503d] mx-auto flex items-center justify-center text-[#d9822b] mb-4 shadow-lg group-hover:scale-105 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="font-serif-vintage text-base md:text-lg font-bold text-[#f7f2e8]">
            Drag & drop your audio file here
          </h3>
          <p className="text-xs text-[#829c8e] mt-1.5">
            or click to browse from your computer
          </p>

          {/* Formats badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {['MP3', 'WAV', 'M4A', 'OGG', 'FLAC', 'AAC'].map(fmt => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#162e23] border border-[#234536] text-[#deb17a]"
              >
                {fmt}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-[#6b8577] mt-3">
            Up to 100 MB per track • ID3 tags detected automatically
          </p>
        </div>
      ) : (
        /* Review & Customize Form before uploading */
        <form onSubmit={handleUpload} className="p-6 rounded-2xl bg-[#11241c] border border-[#234435] space-y-5 shadow-xl">
          {/* Selected File Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0c1a13] border border-[#1d3a2c]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-lg bg-[#183628] text-[#d9822b] flex-shrink-0">
                <FileAudio className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#f7f2e8] truncate">{audioFile.name}</p>
                <p className="text-[11px] font-mono text-[#789385]">{formatBytes(audioFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAudioFile(null);
                setCoverFile(null);
                setCoverPreview('');
              }}
              className="p-1.5 rounded-lg text-[#789385] hover:text-[#f87171] hover:bg-[#261717] transition-colors"
              title="Choose different file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left: Cover Art Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#9eb2a7]">
                Cover Art (Optional)
              </label>
              <div
                onClick={() => coverInputRef.current?.click()}
                className="relative aspect-square rounded-xl bg-[#0c1a13] border border-dashed border-[#234435] hover:border-[#d9822b] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors"
              >
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverSelect}
                  className="hidden"
                />
                {coverPreview ? (
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-3 text-[#789385]">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 text-[#4f6b5c]" />
                    <span className="text-[11px]">Upload image or leave empty for mood art</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Metadata Inputs */}
            <div className="md:col-span-2 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#9eb2a7] mb-1">
                  Song Title <span className="text-[#d9822b]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Song Title"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0c1a13] border border-[#234435] text-xs text-[#f7f2e8] focus:outline-none focus:border-[#d9822b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9eb2a7] mb-1">
                    Artist / Singer
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Artist name"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c1a13] border border-[#234435] text-xs text-[#f7f2e8] focus:outline-none focus:border-[#d9822b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9eb2a7] mb-1">
                    Album / Collection
                  </label>
                  <input
                    type="text"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    placeholder="Album name"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c1a13] border border-[#234435] text-xs text-[#f7f2e8] focus:outline-none focus:border-[#d9822b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9eb2a7] mb-1.5">
                  Atmospheric Mood Tag
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MOOD_DEFINITIONS.filter(m => m.id !== 'All').map(m => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMoodTag(m.id)}
                      className={`flex items-center gap-1.5 p-2 rounded-lg border text-left text-xs transition-all ${
                        moodTag === m.id
                          ? 'bg-[#1b382b] border-[#d9822b] text-[#f7f2e8]'
                          : 'bg-[#0c1a13] border-[#1d3a2c] text-[#80998c] hover:border-[#2f5542]'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span className="truncate">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upload Progress Bar if active */}
          {uploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-[#80998c] font-mono">
                <span>Saving to personal storage...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-[#183628] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#d9822b] to-[#f59e0b] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1d3a2c]">
            <button
              type="button"
              onClick={() => {
                setAudioFile(null);
                setCoverFile(null);
                setCoverPreview('');
              }}
              className="px-4 py-2 text-xs font-medium text-[#80998c] hover:text-[#f7f2e8]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-[#d9822b] hover:bg-[#e69a38] text-white text-xs font-semibold shadow-md shadow-black/40 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {uploading ? 'Uploading...' : 'Save & Add to Library'}
            </button>
          </div>
        </form>
      )}

      {/* Quick Option: Load Curated Kerala Tea-Stall Sample Pack */}
      <div className="p-5 rounded-2xl bg-[#0f2017] border border-[#1d3b2e] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#183628] text-[#d9822b]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif-vintage text-sm font-semibold text-[#f7f2e8]">
              Want to test playback right now?
            </h4>
            <p className="text-xs text-[#80998c] mt-0.5">
              Add our procedural tea-stall atmospheric starter pack with rain on tin roofs and acoustic melodies.
            </p>
          </div>
        </div>

        <button
          onClick={handleLoadSamples}
          disabled={seedingSamples}
          className="whitespace-nowrap px-4 py-2 rounded-xl bg-[#183628] hover:bg-[#204533] border border-[#2b543f] text-[#deb17a] text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {seedingSamples ? 'Brewing pack...' : 'Load Atmosphere Pack'}
        </button>
      </div>
    </div>
  );
}
