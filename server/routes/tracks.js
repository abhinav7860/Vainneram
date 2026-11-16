const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { db, audioDir, coversDir } = require('../db');
const { authMiddleware, optionalAuth } = require('../auth');
const { seedStarterTracks } = require('./auth');

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'cover') {
      cb(null, coversDir);
    } else {
      cb(null, audioDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max per track
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      const allowedExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.webm'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext) || file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error(`Unsupported audio format (${ext}). Supported: MP3, WAV, OGG, M4A, FLAC, AAC.`));
      }
    } else if (file.fieldname === 'cover') {
      const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedImageExts.includes(ext) || file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid image format for cover art.'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Serve cover images
router.get('/cover/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(coversDir, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Cover art not found' });
  }
  return res.sendFile(filePath);
});

// Upload a single or batch audio files
router.post('/upload', authMiddleware, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.audio || req.files.audio.length === 0) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.cover ? req.files.cover[0] : null;

    let parsedMeta = null;
    let title = req.body.title?.trim();
    let artist = req.body.artist?.trim();
    let album = req.body.album?.trim();
    let moodTag = req.body.mood_tag?.trim() || 'Warm Chai';
    let duration = 0;
    let bitrate = 0;
    let coverUrl = '';

    // Inspect audio tags using music-metadata
    try {
      const { parseFile } = await import('music-metadata');
      parsedMeta = await parseFile(audioFile.path);

      if (parsedMeta) {
        if (!title && parsedMeta.common?.title) {
          title = parsedMeta.common.title;
        }
        if (!artist && parsedMeta.common?.artist) {
          artist = parsedMeta.common.artist;
        }
        if (!album && parsedMeta.common?.album) {
          album = parsedMeta.common.album;
        }
        if (parsedMeta.format?.duration) {
          duration = Math.round(parsedMeta.format.duration * 10) / 10;
        }
        if (parsedMeta.format?.bitrate) {
          bitrate = Math.round(parsedMeta.format.bitrate / 1000);
        }

        // If file contains embedded cover art and user didn't upload custom cover
        if (!coverFile && parsedMeta.common?.picture && parsedMeta.common.picture.length > 0) {
          const pic = parsedMeta.common.picture[0];
          const ext = pic.format?.includes('png') ? '.png' : '.jpg';
          const coverFilename = `embedded-${Date.now()}-${uuidv4().slice(0, 6)}${ext}`;
          const coverPath = path.join(coversDir, coverFilename);
          fs.writeFileSync(coverPath, pic.data);
          coverUrl = `/api/tracks/cover/${coverFilename}`;
        }
      }
    } catch (metaErr) {
      console.warn('Metadata parsing warning (proceeding with fallback):', metaErr.message);
    }

    // Default fallbacks from filename if not tagged
    if (!title) {
      const baseName = path.basename(audioFile.originalname, path.extname(audioFile.originalname));
      // Clean up common naming patterns like "01 - Artist - Title"
      const parts = baseName.split(' - ');
      if (parts.length >= 2) {
        if (!artist) artist = parts[0].replace(/^\d+[\s._-]+/, '').trim();
        title = parts[1].trim();
      } else {
        title = baseName.replace(/^[0-9]+[\s._-]+/, '').trim();
      }
    }

    if (!artist) artist = 'Unknown Artist';
    if (!album) album = 'Singles';

    if (coverFile) {
      coverUrl = `/api/tracks/cover/${coverFile.filename}`;
    }

    const trackId = uuidv4();
    const ext = path.extname(audioFile.originalname).replace('.', '').toLowerCase();

    db.prepare(`
      INSERT INTO tracks (
        id, user_id, title, artist, album, duration, file_path, file_name, file_size, mime_type, format, bitrate, cover_url, mood_tag
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      trackId,
      req.user.id,
      title,
      artist,
      album,
      duration,
      audioFile.path,
      audioFile.originalname,
      audioFile.size,
      audioFile.mimetype,
      ext || 'audio',
      bitrate,
      coverUrl,
      moodTag
    );

    const createdTrack = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId);

    return res.status(201).json({
      message: 'Track uploaded successfully',
      track: createdTrack
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message || 'Track upload failed' });
  }
});

// List tracks for current user with search, filter, and sorting
router.get('/', authMiddleware, (req, res) => {
  try {
    const { search, mood, sort = 'recent', favorite } = req.query;
    let query = 'SELECT * FROM tracks WHERE user_id = ?';
    const params = [req.user.id];

    if (search && search.trim()) {
      query += ' AND (title LIKE ? OR artist LIKE ? OR album LIKE ? OR mood_tag LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (mood && mood !== 'All') {
      query += ' AND mood_tag = ?';
      params.push(mood);
    }

    if (favorite === 'true' || favorite === '1') {
      query += ' AND is_favorite = 1';
    }

    switch (sort) {
      case 'title':
        query += ' ORDER BY title COLLATE NOCASE ASC';
        break;
      case 'artist':
        query += ' ORDER BY artist COLLATE NOCASE ASC, title COLLATE NOCASE ASC';
        break;
      case 'duration':
        query += ' ORDER BY duration DESC';
        break;
      case 'played':
        query += ' ORDER BY play_count DESC, last_played_at DESC';
        break;
      case 'recent':
      default:
        query += ' ORDER BY created_at DESC';
        break;
    }

    const tracks = db.prepare(query).all(...params);

    // Also get distinct moods present in user's library
    const moods = db.prepare('SELECT DISTINCT mood_tag FROM tracks WHERE user_id = ? AND mood_tag IS NOT NULL').all(req.user.id).map(r => r.mood_tag);

    return res.json({ tracks, availableMoods: moods });
  } catch (err) {
    console.error('List tracks error:', err);
    return res.status(500).json({ error: 'Failed to retrieve tracks' });
  }
});

// Single track detail
router.get('/:id', authMiddleware, (req, res) => {
  const track = db.prepare('SELECT * FROM tracks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }
  return res.json({ track });
});

// Stream audio with HTTP 206 Partial Content (range support)
router.get('/:id/stream', authMiddleware, (req, res) => {
  try {
    const track = db.prepare('SELECT * FROM tracks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found or access denied' });
    }

    const filePath = track.file_path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Audio file missing on disk' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // MIME type resolution
    let contentType = track.mime_type || 'audio/mpeg';
    if (filePath.endsWith('.wav')) contentType = 'audio/wav';
    else if (filePath.endsWith('.ogg')) contentType = 'audio/ogg';
    else if (filePath.endsWith('.m4a')) contentType = 'audio/mp4';
    else if (filePath.endsWith('.flac')) contentType = 'audio/flac';
    else if (filePath.endsWith('.mp3')) contentType = 'audio/mpeg';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send(`Requested range not satisfiable: ${start} >= ${fileSize}`);
        return;
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error('Stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Streaming error' });
    }
  }
});

// Update track metadata
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { title, artist, album, mood_tag, is_favorite } = req.body;
    const track = db.prepare('SELECT * FROM tracks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    const updatedTitle = title !== undefined ? title.trim() : track.title;
    const updatedArtist = artist !== undefined ? artist.trim() : track.artist;
    const updatedAlbum = album !== undefined ? album.trim() : track.album;
    const updatedMood = mood_tag !== undefined ? mood_tag.trim() : track.mood_tag;
    const updatedFav = is_favorite !== undefined ? (is_favorite ? 1 : 0) : track.is_favorite;

    db.prepare(`
      UPDATE tracks
      SET title = ?, artist = ?, album = ?, mood_tag = ?, is_favorite = ?
      WHERE id = ? AND user_id = ?
    `).run(updatedTitle, updatedArtist, updatedAlbum, updatedMood, updatedFav, req.params.id, req.user.id);

    const updated = db.prepare('SELECT * FROM tracks WHERE id = ?').get(req.params.id);
    return res.json({ message: 'Track updated', track: updated });
  } catch (err) {
    console.error('Update track error:', err);
    return res.status(500).json({ error: 'Failed to update track' });
  }
});

// Toggle favorite
router.post('/:id/favorite', authMiddleware, (req, res) => {
  try {
    const track = db.prepare('SELECT is_favorite FROM tracks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    const newFav = track.is_favorite ? 0 : 1;
    db.prepare('UPDATE tracks SET is_favorite = ? WHERE id = ? AND user_id = ?').run(newFav, req.params.id, req.user.id);

    return res.json({ is_favorite: newFav === 1 });
  } catch (err) {
    console.error('Favorite toggle error:', err);
    return res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// Log track play
router.post('/:id/play', authMiddleware, (req, res) => {
  try {
    const track = db.prepare('SELECT id FROM tracks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    db.prepare(`
      UPDATE tracks
      SET play_count = play_count + 1, last_played_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(req.params.id);

    db.prepare(`
      INSERT INTO listening_history (id, user_id, track_id)
      VALUES (?, ?, ?)
    `).run(uuidv4(), req.user.id, req.params.id);

    return res.json({ success: true });
  } catch (err) {
    console.error('Log play error:', err);
    return res.status(500).json({ error: 'Failed to log play' });
  }
});

// Delete track
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const track = db.prepare('SELECT * FROM tracks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Attempt to delete audio file
    if (fs.existsSync(track.file_path)) {
      try {
        fs.unlinkSync(track.file_path);
      } catch (unlinkErr) {
        console.warn('Could not delete audio file from disk:', unlinkErr.message);
      }
    }

    // Delete record (CASCADE handles playlist_tracks and history)
    db.prepare('DELETE FROM tracks WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);

    return res.json({ message: 'Track deleted successfully' });
  } catch (err) {
    console.error('Delete track error:', err);
    return res.status(500).json({ error: 'Failed to delete track' });
  }
});

// Seed sample tracks for user
router.post('/seed-samples', authMiddleware, (req, res) => {
  try {
    seedStarterTracks(req.user.id);
    const tracks = db.prepare('SELECT * FROM tracks WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    return res.json({ message: 'Sample tea-stall atmosphere pack added', tracks });
  } catch (err) {
    console.error('Seed tracks error:', err);
    return res.status(500).json({ error: 'Failed to add sample tracks' });
  }
});

module.exports = router;
