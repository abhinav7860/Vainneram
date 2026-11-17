const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { db, dataDir, audioDir, coversDir } = require('./db');

const { router: authRouter } = require('./routes/auth');
const tracksRouter = require('./routes/tracks');
const playlistsRouter = require('./routes/playlists');
const statsRouter = require('./routes/stats');
const { startDropWatcher, scanDropFolder, dropDir } = require('./dropFolderWatcher');

const app = express();
const PORT = process.env.PORT || 5000;

// Start watching local drop-music-here/ folder
startDropWatcher();

// Enable CORS for local Vite dev server and general web usage
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health / Ping endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Vainneram Music Library', time: new Date().toISOString() });
});

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/tracks', tracksRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/stats', statsRouter);

// Serve ambient sounds directly
const soundsDir = path.join(__dirname, '..', 'public', 'sounds');
if (fs.existsSync(soundsDir)) {
  app.use('/sounds', express.static(soundsDir));
}

// Serve static frontend in production if built
const clientDist = path.join(__dirname, '..', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // In Express 5, fallback middleware serves index.html for SPA routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/sounds/')) return next();
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error handler:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File size exceeds maximum limit of 100MB.' });
  }
  return res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🍵 Vainneram server running on http://localhost:${PORT}`);
});
