const fs = require('fs');
const path = require('path');
const { db } = require('../server/db');

const dropDir = path.join(__dirname, '..', 'drop-music-here');
if (!fs.existsSync(dropDir)) {
  fs.mkdirSync(dropDir, { recursive: true });
}

// Get all tracks from DB
const tracks = db.prepare('SELECT DISTINCT title, artist, file_path FROM tracks').all();

const seen = new Set();
let copied = 0;

for (const t of tracks) {
  const key = ((t.title || '') + '---' + (t.artist || '')).toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);

  if (!t.file_path || !fs.existsSync(t.file_path)) continue;

  // Sanitize filename for Windows (remove invalid chars)
  const sanitize = (s) => (s || 'Unknown').replace(/[\\/:*?"<>|]/g, '').trim();
  const safeTitle = sanitize(t.title);
  const safeArtist = sanitize(t.artist);
  const ext = path.extname(t.file_path) || '.mp3';

  let outName = `${safeArtist} - ${safeTitle}${ext}`;
  if (outName.length > 120) {
    outName = `${safeTitle}${ext}`;
  }
  const outPath = path.join(dropDir, outName);

  if (!fs.existsSync(outPath)) {
    try {
      fs.copyFileSync(t.file_path, outPath);
      copied++;
    } catch (e) {
      console.error('Error copying:', outName, e.message);
    }
  }
}

console.log(`Successfully copied ${copied} songs into ${dropDir}!`);
