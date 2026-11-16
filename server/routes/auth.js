const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, audioDir } = require('../db');
const { generateToken, authMiddleware, hashPassword, comparePassword } = require('../auth');
const { generateWavFile } = require('../sampleGenerator');
const path = require('path');

// Helper to seed starter tea-stall ambient tracks for a new user
function seedStarterTracks(userId) {
  const starterTracks = [
    {
      title: 'കട്ടൻ ചായയും ചാറ്റൽ മഴയും (Rain on the Tin Roof)',
      artist: 'വൈകുന്നേരം അക്കോസ്റ്റിക്സ് (Vainneram Acoustics)',
      album: 'ചായപ്പീടിക ഓർമ്മകൾ (Tea Stall Memories)',
      duration: 32,
      style: 'rain_ambient',
      mood: 'Rainy Evening',
      filename: `vainneram-rain-${userId.slice(0, 8)}.wav`
    },
    {
      title: 'സന്ധ്യാരാഗം (Transistor Radio Twilight)',
      artist: 'നാടൻ വീണ (Folk Chords)',
      album: 'ഗ്രാമീണ സംഗീതം (Rustic Echoes)',
      duration: 28,
      style: 'radio_nostalgia',
      mood: 'Tea Stall Acoustics',
      filename: `vainneram-radio-${userId.slice(0, 8)}.wav`
    },
    {
      title: 'പരിപ്പുവടയും ചൂടു ചായയും (Evening Strum)',
      artist: 'ശ്രീഹരി & സുഹൃത്തുക്കൾ',
      album: 'നാലുമണി കാറ്റ് (4 PM Breeze)',
      duration: 24,
      style: 'acoustic_evening',
      mood: 'Warm Chai',
      filename: `vainneram-strum-${userId.slice(0, 8)}.wav`
    },
    {
      title: 'ഓളങ്ങൾ (Backwater Twilight Flute)',
      artist: 'നിശബ്ദത (Serenity)',
      album: 'കേരള രാഗങ്ങൾ (Kerala Rhythms)',
      duration: 30,
      style: 'flute_twilight',
      mood: 'Mellow',
      filename: `vainneram-flute-${userId.slice(0, 8)}.wav`
    }
  ];

  const insertTrack = db.prepare(`
    INSERT INTO tracks (id, user_id, title, artist, album, duration, file_path, file_name, file_size, mime_type, format, mood_tag, is_favorite)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const createdTrackIds = [];

  for (let i = 0; i < starterTracks.length; i++) {
    const s = starterTracks[i];
    const trackId = uuidv4();
    const filePath = path.join(audioDir, s.filename);
    
    // Generate audio file if not present
    const gen = generateWavFile(filePath, s.duration, s.style);

    insertTrack.run(
      trackId,
      userId,
      s.title,
      s.artist,
      s.album,
      s.duration,
      filePath,
      s.filename,
      gen.sizeBytes,
      'audio/wav',
      'wav',
      s.mood,
      i === 0 ? 1 : 0
    );
    createdTrackIds.push(trackId);
  }

  // Create a default starter playlist: "കട്ടൻ ചായ ഓർമ്മകൾ" (Kattan Chaya Memories)
  const playlistId = uuidv4();
  db.prepare(`
    INSERT INTO playlists (id, user_id, name, description, mood)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    playlistId,
    userId,
    'കട്ടൻ ചായ ഓർമ്മകൾ (Evening Chai Tunes)',
    'A nostalgic selection of gentle melodies and tea stall ambience for a rainy evening.',
    'Rainy Evening'
  );

  const insertPlaylistTrack = db.prepare(`
    INSERT INTO playlist_tracks (id, playlist_id, track_id, position)
    VALUES (?, ?, ?, ?)
  `);

  createdTrackIds.forEach((tid, idx) => {
    insertPlaylistTrack.run(uuidv4(), playlistId, tid, idx);
  });
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, display_name } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(cleanUsername, cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    const userId = uuidv4();
    const passwordHash = await hashPassword(password);
    const userDisplayName = display_name?.trim() || username.trim();

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, display_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, cleanUsername, cleanEmail, passwordHash, userDisplayName);

    // Seed starter tracks for an immediate rich experience
    try {
      seedStarterTracks(userId);
    } catch (seedErr) {
      console.error('Starter track seed error:', seedErr);
    }

    const user = { id: userId, username: cleanUsername, email: cleanEmail, display_name: userDisplayName };
    const token = generateToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/email and password required' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(cleanId, cleanId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const matches = await comparePassword(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name
    };
    const token = generateToken(userInfo);

    return res.json({
      message: 'Login successful',
      token,
      user: userInfo
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Demo user quick login / setup
router.post('/demo', async (req, res) => {
  try {
    const demoUsername = 'sujith_demo';
    let user = db.prepare('SELECT * FROM users WHERE username = ?').get(demoUsername);

    if (!user) {
      const userId = 'user-demo-' + uuidv4().slice(0, 8);
      const passwordHash = await hashPassword('kattanchaya123');
      const displayName = 'Sujith (സുജിത്ത്)';
      const email = 'sujith@vainneram.local';

      db.prepare(`
        INSERT INTO users (id, username, email, password_hash, display_name)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, demoUsername, email, passwordHash, displayName);

      seedStarterTracks(userId);
      user = { id: userId, username: demoUsername, email, display_name: displayName };
    }

    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name
    };
    const token = generateToken(userInfo);

    return res.json({
      message: 'Logged in as Demo User',
      token,
      user: userInfo
    });
  } catch (err) {
    console.error('Demo login error:', err);
    return res.status(500).json({ error: 'Demo login failed' });
  }
});

// Current user profile
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, email, display_name, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get user track and playlist stats
  const stats = db.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM tracks WHERE user_id = ?) as total_tracks,
      (SELECT COALESCE(SUM(duration), 0) FROM tracks WHERE user_id = ?) as total_duration,
      (SELECT COALESCE(SUM(file_size), 0) FROM tracks WHERE user_id = ?) as storage_used,
      (SELECT COUNT(*) FROM playlists WHERE user_id = ?) as total_playlists
  `).get(user.id, user.id, user.id, user.id);

  return res.json({
    user,
    stats: {
      totalTracks: stats.total_tracks,
      totalDurationSeconds: stats.total_duration,
      storageUsedBytes: stats.storage_used,
      totalPlaylists: stats.total_playlists
    }
  });
});

module.exports = {
  router,
  seedStarterTracks
};
