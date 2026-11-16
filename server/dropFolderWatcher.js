const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { db, audioDir, coversDir } = require('./db');

const dropDir = path.join(__dirname, '..', 'drop-music-here');

// Ensure drop-music-here directory exists
if (!fs.existsSync(dropDir)) {
  fs.mkdirSync(dropDir, { recursive: true });
}

// Write a helpful instructions file inside drop-music-here
const readmePath = path.join(dropDir, 'DROP_SONGS_HERE.txt');
if (!fs.existsSync(readmePath)) {
  fs.writeFileSync(readmePath, `🍵 Vainneram Music Library - Local Drop Folder
======================================================
You can drop or copy any audio files (MP3, WAV, M4A, OGG, FLAC, AAC) into this folder!
They will be automatically scanned, imported, and added directly to your music library
without having to click any buttons on the webpage!
`);
}

async function scanDropFolder() {
  try {
    if (!fs.existsSync(dropDir)) return [];

    const files = fs.readdirSync(dropDir);
    const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.webm'];
    const addedTracks = [];

    const { parseFile } = await import('music-metadata');

    for (const file of files) {
      if (file === 'DROP_SONGS_HERE.txt') continue;
      const ext = path.extname(file).toLowerCase();
      if (!audioExts.includes(ext)) continue;

      const sourcePath = path.join(dropDir, file);
      const stat = fs.statSync(sourcePath);
      if (stat.isDirectory()) continue;

      // Generate destination in data/uploads/audio/
      const newFilename = `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`;
      const destPath = path.join(audioDir, newFilename);

      // Copy file to uploads
      fs.copyFileSync(sourcePath, destPath);

      // Parse metadata
      let title = '';
      let artist = 'Unknown Artist';
      let album = 'Single';
      let duration = 0;
      let bitrate = 0;
      let coverUrl = '';

      try {
        const meta = await parseFile(destPath);
        if (meta) {
          if (meta.common?.title) title = meta.common.title;
          if (meta.common?.artist) artist = meta.common.artist;
          if (meta.common?.album) album = meta.common.album;
          if (meta.format?.duration) duration = Math.round(meta.format.duration * 10) / 10;
          if (meta.format?.bitrate) bitrate = Math.round(meta.format.bitrate / 1000);

          if (meta.common?.picture && meta.common.picture.length > 0) {
            const pic = meta.common.picture[0];
            const pExt = pic.format?.includes('png') ? '.png' : '.jpg';
            const coverFilename = `drop-${Date.now()}-${uuidv4().slice(0, 6)}${pExt}`;
            const coverPath = path.join(coversDir, coverFilename);
            fs.writeFileSync(coverPath, pic.data);
            coverUrl = `/api/tracks/cover/${coverFilename}`;
          }
        }
      } catch (err) {
        console.warn('Metadata parse warning for drop file:', file, err.message);
      }

      if (!title) {
        const baseName = path.basename(file, ext);
        const parts = baseName.split(' - ');
        if (parts.length >= 2) {
          artist = parts[0].replace(/^\d+[\s._-]+/, '').trim();
          title = parts[1].trim();
        } else {
          title = baseName.replace(/^[0-9]+[\s._-]+/, '').trim();
        }
      }

      const trackId = uuidv4();
      const sharedUserId = 'shared_library_user';

      db.prepare(`
        INSERT INTO tracks (
          id, user_id, title, artist, album, duration, file_path, file_name, file_size, mime_type, format, bitrate, cover_url, mood_tag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        trackId,
        sharedUserId,
        title,
        artist,
        album,
        duration,
        destPath,
        file,
        stat.size,
        'audio/' + ext.replace('.', ''),
        ext.replace('.', ''),
        bitrate,
        coverUrl,
        'Tea Stall Acoustics'
      );

      // Remove from drop folder so it doesn't re-import
      try {
        fs.unlinkSync(sourcePath);
      } catch (e) {}

      console.log(`🍵 Auto-imported "${title}" by ${artist} from drop-music-here/`);
      addedTracks.push({ id: trackId, title, artist });
    }

    return addedTracks;
  } catch (err) {
    console.error('Drop folder scan error:', err.message);
    return [];
  }
}

// Set up periodic folder scan
function startDropWatcher() {
  scanDropFolder();
  setInterval(() => {
    scanDropFolder();
  }, 4000);
}

module.exports = {
  dropDir,
  scanDropFolder,
  startDropWatcher
};
