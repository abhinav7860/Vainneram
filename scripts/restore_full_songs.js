const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { db, coversDir } = require('../server/db');

async function main() {
  const { parseFile } = await import('music-metadata');
  const dropDir = path.join(__dirname, '..', 'drop-music-here');
  const uploadDir = path.join(__dirname, '..', 'data', 'uploads', 'audio');

  console.log('=== Step A: Purge procedural WAV and any track under 130s ===');
  // Delete from DB any track where duration < 130 OR file_path has .wav
  const wavOrShort = db.prepare("SELECT id, title, duration FROM tracks WHERE file_path LIKE '%.wav' OR duration < 130").all();
  for (const t of wavOrShort) {
    db.prepare('DELETE FROM playlist_tracks WHERE track_id = ?').run(t.id);
    db.prepare('DELETE FROM listening_history WHERE track_id = ?').run(t.id);
    db.prepare('DELETE FROM tracks WHERE id = ?').run(t.id);
    console.log(`Deleted short/wav track (${t.duration}s): "${t.title}"`);
  }

  console.log('\n=== Step B: Index full original songs from drop-music-here ===');
  const dropFiles = fs.readdirSync(dropDir).filter(f => f.endsWith('.mp3'));
  for (const file of dropFiles) {
    const filePath = path.join(dropDir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.size < 1.5 * 1024 * 1024) continue;

      const meta = await parseFile(filePath);
      const duration = Math.round((meta.format.duration || 0) * 10) / 10;
      if (duration < 130) continue; // Full songs only!

      let title = meta.common.title || '';
      let artist = meta.common.artist || 'Unknown Artist';
      let album = meta.common.album || 'Single';
      const bitrate = Math.round((meta.format.bitrate || 0) / 1000);

      if (!title) {
        const base = path.basename(file, '.mp3');
        const parts = base.split(' - ');
        if (parts.length >= 2) {
          artist = parts[0].replace(/^\d+[\s._-]+/, '').trim();
          title = parts.slice(1).join(' - ').trim();
        } else {
          title = base;
        }
      }

      // Check if cover art is embedded in ID3 tag
      let coverUrl = '';
      if (meta.common.picture && meta.common.picture.length > 0) {
        const pic = meta.common.picture[0];
        const pExt = pic.format?.includes('png') ? '.png' : '.jpg';
        const coverFilename = `drop-${Date.now()}-${uuidv4().slice(0, 8)}${pExt}`;
        const coverPath = path.join(coversDir, coverFilename);
        fs.writeFileSync(coverPath, pic.data);
        coverUrl = `/api/tracks/cover/${coverFilename}`;
      }

      // Check if already in DB
      const existing = db.prepare('SELECT id, file_path, duration, cover_url FROM tracks WHERE file_name = ? OR file_path = ?').get(file, filePath);
      if (existing) {
        if (!existing.cover_url && coverUrl) {
          db.prepare('UPDATE tracks SET cover_url = ? WHERE id = ?').run(coverUrl, existing.id);
        }
        continue;
      }

      // Insert new full song
      const id = uuidv4();
      db.prepare(`
        INSERT INTO tracks (id, user_id, title, artist, album, duration, bitrate, file_path, file_name, file_size, mime_type, format, cover_url, mood_tag, play_count, is_favorite, created_at)
        VALUES (?, 'shared_library_user', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, datetime('now'))
      `).run(
        id,
        title,
        artist,
        album,
        duration,
        bitrate,
        filePath,
        file,
        stat.size,
        'audio/mpeg',
        'mp3',
        coverUrl,
        'Mellow Twilight'
      );
      console.log(`Added full song: "${title}" by ${artist} (${duration}s, cover: ${Boolean(coverUrl)})`);
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }

  console.log('\n=== Step C: Deduplicate to keep single best full-length version ===');
  const allTracks = db.prepare('SELECT id, title, artist, duration, cover_url, file_path, file_size FROM tracks').all();
  const groupMap = {};

  for (const t of allTracks) {
    const norm = t.title
      .toLowerCase()
      .replace(/-\s*from.*/i, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/[\W_]+/g, '')
      .trim();
    const key = norm || t.title.trim();

    if (!groupMap[key]) groupMap[key] = [];
    groupMap[key].push(t);
  }

  let prunedCount = 0;
  for (const [key, group] of Object.entries(groupMap)) {
    if (group.length <= 1) continue;

    group.sort((a, b) => {
      const aCover = Boolean(a.cover_url && a.cover_url.trim());
      const bCover = Boolean(b.cover_url && b.cover_url.trim());
      if (Math.abs((b.duration || 0) - (a.duration || 0)) > 15) {
        return (b.duration || 0) - (a.duration || 0);
      }
      if (aCover !== bCover) return bCover ? 1 : -1;
      return (b.file_size || 0) - (a.file_size || 0);
    });

    const best = group[0];
    const toRemove = group.slice(1);

    for (const rem of toRemove) {
      if ((!best.cover_url || !best.cover_url.trim()) && rem.cover_url && rem.cover_url.trim()) {
        db.prepare('UPDATE tracks SET cover_url = ? WHERE id = ?').run(rem.cover_url, best.id);
        best.cover_url = rem.cover_url;
      }

      db.prepare('DELETE FROM playlist_tracks WHERE track_id = ?').run(rem.id);
      db.prepare('DELETE FROM listening_history WHERE track_id = ?').run(rem.id);
      db.prepare('DELETE FROM tracks WHERE id = ?').run(rem.id);
      prunedCount++;
    }
    console.log(`Kept: "${best.title}" (${best.duration}s) | Pruned ${toRemove.length} duplicate(s)`);
  }

  const finalTracks = db.prepare('SELECT count(*) as count FROM tracks').get().count;
  const missingCover = db.prepare("SELECT count(*) as count FROM tracks WHERE cover_url IS NULL OR cover_url = ''").get().count;
  const stats = db.prepare('SELECT min(duration) as min_dur, max(duration) as max_dur, avg(duration) as avg_dur FROM tracks').get();

  console.log('\n=============================================');
  console.log(`Pruned ${prunedCount} duplicate songs.`);
  console.log(`Total full-length songs in library: ${finalTracks}`);
  console.log(`Shortest song: ${stats.min_dur}s (${Math.round(stats.min_dur/60)}m), Longest: ${stats.max_dur}s (${Math.round(stats.max_dur/60)}m), Avg: ${Math.round(stats.avg_dur)}s`);
  console.log(`Tracks missing cover art: ${missingCover}`);
  console.log('=============================================');
}

main().catch(console.error);
