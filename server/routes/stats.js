const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authMiddleware } = require('../auth');

// Get user library stats & highlights
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    // Aggregate numbers
    const aggregate = db.prepare(`
      SELECT 
        COUNT(*) as total_tracks,
        COALESCE(SUM(duration), 0) as total_duration,
        COALESCE(SUM(file_size), 0) as storage_bytes,
        SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as favorite_count
      FROM tracks
      WHERE user_id = ?
    `).get(userId);

    const playlistCount = db.prepare('SELECT COUNT(*) as count FROM playlists WHERE user_id = ?').get(userId).count;

    // Mood distribution
    const moods = db.prepare(`
      SELECT mood_tag, COUNT(*) as count
      FROM tracks
      WHERE user_id = ?
      GROUP BY mood_tag
      ORDER BY count DESC
    `).all(userId);

    // Recently added (up to 8)
    const recentlyAdded = db.prepare(`
      SELECT id, title, artist, album, duration, cover_url, mood_tag, is_favorite, created_at
      FROM tracks
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 8
    `).all(userId);

    // Recently played (up to 8)
    const recentlyPlayed = db.prepare(`
      SELECT id, title, artist, album, duration, cover_url, mood_tag, is_favorite, play_count, last_played_at
      FROM tracks
      WHERE user_id = ? AND play_count > 0
      ORDER BY last_played_at DESC
      LIMIT 8
    `).all(userId);

    // Nominally 500MB personal quota for visualization
    const nominalQuotaBytes = 500 * 1024 * 1024;
    const storageUsedBytes = aggregate.storage_bytes || 0;
    const storagePercent = Math.min(100, Math.round((storageUsedBytes / nominalQuotaBytes) * 1000) / 10);

    return res.json({
      totalTracks: aggregate.total_tracks || 0,
      totalDurationSeconds: aggregate.total_duration || 0,
      totalPlaylists: playlistCount,
      favoriteCount: aggregate.favorite_count || 0,
      storage: {
        usedBytes: storageUsedBytes,
        quotaBytes: nominalQuotaBytes,
        usedFormatted: (storageUsedBytes / (1024 * 1024)).toFixed(1) + ' MB',
        quotaFormatted: '500 MB',
        percent: storagePercent
      },
      moods,
      recentlyAdded,
      recentlyPlayed
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

module.exports = router;
