const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { authMiddleware } = require('../auth');

// List all playlists for current user
router.get('/', authMiddleware, (req, res) => {
  try {
    const playlists = db.prepare(`
      SELECT 
        p.*,
        COUNT(pt.id) as track_count,
        COALESCE(SUM(t.duration), 0) as total_duration,
        (
          SELECT t2.cover_url 
          FROM playlist_tracks pt2 
          JOIN tracks t2 ON pt2.track_id = t2.id 
          WHERE pt2.playlist_id = p.id AND t2.cover_url != '' 
          LIMIT 1
        ) as preview_cover
      FROM playlists p
      LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
      LEFT JOIN tracks t ON pt.track_id = t.id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `).all(req.user.id);

    return res.json({ playlists });
  } catch (err) {
    console.error('List playlists error:', err);
    return res.status(500).json({ error: 'Failed to list playlists' });
  }
});

// Create new playlist
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, description = '', mood = 'General' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const playlistId = uuidv4();
    db.prepare(`
      INSERT INTO playlists (id, user_id, name, description, mood)
      VALUES (?, ?, ?, ?, ?)
    `).run(playlistId, req.user.id, name.trim(), description.trim(), mood.trim());

    const created = db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlistId);
    return res.status(201).json({ message: 'Playlist created', playlist: created });
  } catch (err) {
    console.error('Create playlist error:', err);
    return res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Get playlist details with tracks
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const tracks = db.prepare(`
      SELECT 
        t.*,
        pt.position,
        pt.id as playlist_track_id,
        pt.added_at as added_to_playlist_at
      FROM playlist_tracks pt
      JOIN tracks t ON pt.track_id = t.id
      WHERE pt.playlist_id = ?
      ORDER BY pt.position ASC, pt.added_at ASC
    `).all(req.params.id);

    const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);

    return res.json({
      playlist: {
        ...playlist,
        track_count: tracks.length,
        total_duration: totalDuration
      },
      tracks
    });
  } catch (err) {
    console.error('Get playlist error:', err);
    return res.status(500).json({ error: 'Failed to retrieve playlist' });
  }
});

// Update playlist name/description/mood
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { name, description, mood } = req.body;
    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const updatedName = name !== undefined ? name.trim() : playlist.name;
    const updatedDesc = description !== undefined ? description.trim() : playlist.description;
    const updatedMood = mood !== undefined ? mood.trim() : playlist.mood;

    db.prepare(`
      UPDATE playlists
      SET name = ?, description = ?, mood = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(updatedName, updatedDesc, updatedMood, req.params.id, req.user.id);

    const updated = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
    return res.json({ message: 'Playlist updated', playlist: updated });
  } catch (err) {
    console.error('Update playlist error:', err);
    return res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// Delete playlist
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const playlist = db.prepare('SELECT id FROM playlists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    db.prepare('DELETE FROM playlists WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    return res.json({ message: 'Playlist deleted successfully' });
  } catch (err) {
    console.error('Delete playlist error:', err);
    return res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// Add track to playlist
router.post('/:id/tracks', authMiddleware, (req, res) => {
  try {
    const { track_id } = req.body;
    if (!track_id) {
      return res.status(400).json({ error: 'track_id is required' });
    }

    // Verify playlist belongs to user
    const playlist = db.prepare('SELECT id FROM playlists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Verify track belongs to user
    const track = db.prepare('SELECT id FROM tracks WHERE id = ? AND user_id = ?').get(track_id, req.user.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found in your library' });
    }

    // Check if already in playlist
    const existing = db.prepare('SELECT id FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?').get(req.params.id, track_id);
    if (existing) {
      return res.status(400).json({ error: 'Track already exists in this playlist' });
    }

    // Get max position
    const posRow = db.prepare('SELECT COALESCE(MAX(position), -1) as max_pos FROM playlist_tracks WHERE playlist_id = ?').get(req.params.id);
    const nextPos = posRow.max_pos + 1;

    db.prepare(`
      INSERT INTO playlist_tracks (id, playlist_id, track_id, position)
      VALUES (?, ?, ?, ?)
    `).run(uuidv4(), req.params.id, track_id, nextPos);

    db.prepare('UPDATE playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);

    return res.status(201).json({ message: 'Track added to playlist' });
  } catch (err) {
    console.error('Add to playlist error:', err);
    return res.status(500).json({ error: 'Failed to add track to playlist' });
  }
});

// Remove track from playlist
router.delete('/:id/tracks/:trackId', authMiddleware, (req, res) => {
  try {
    const playlist = db.prepare('SELECT id FROM playlists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    db.prepare('DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?').run(req.params.id, req.params.trackId);
    db.prepare('UPDATE playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);

    return res.json({ message: 'Track removed from playlist' });
  } catch (err) {
    console.error('Remove from playlist error:', err);
    return res.status(500).json({ error: 'Failed to remove track from playlist' });
  }
});

// Reorder playlist tracks
router.put('/:id/tracks/reorder', authMiddleware, (req, res) => {
  try {
    const { track_ids } = req.body; // array of track IDs in new order
    if (!Array.isArray(track_ids)) {
      return res.status(400).json({ error: 'track_ids array required' });
    }

    const playlist = db.prepare('SELECT id FROM playlists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const updateStmt = db.prepare('UPDATE playlist_tracks SET position = ? WHERE playlist_id = ? AND track_id = ?');
    const updateMany = db.transaction((ids) => {
      ids.forEach((tid, idx) => {
        updateStmt.run(idx, req.params.id, tid);
      });
    });

    updateMany(track_ids);
    db.prepare('UPDATE playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);

    return res.json({ message: 'Playlist tracks reordered' });
  } catch (err) {
    console.error('Reorder error:', err);
    return res.status(500).json({ error: 'Failed to reorder tracks' });
  }
});

module.exports = router;
