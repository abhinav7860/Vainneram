const { db } = require('../server/db');
const fs = require('fs');

const tracks = db.prepare('SELECT id, title, artist, duration, cover_url, file_path FROM tracks').all();

const titleMap = {};
for (const t of tracks) {
  const norm = t.title
    .toLowerCase()
    .replace(/-\s*from.*/i, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[\W_]+/g, '')
    .trim();

  // If title was Malayalam script only, keep original title
  const key = norm || t.title.trim();

  if (!titleMap[key]) titleMap[key] = [];
  titleMap[key].push(t);
}

let deletedCount = 0;
for (const [k, group] of Object.entries(titleMap)) {
  if (group.length <= 1) continue;

  // Sort: prioritize valid cover art, then longest duration (full length song)
  group.sort((a, b) => {
    const aCover = Boolean(a.cover_url && a.cover_url.trim());
    const bCover = Boolean(b.cover_url && b.cover_url.trim());
    if (aCover !== bCover) return bCover ? 1 : -1;
    return (b.duration || 0) - (a.duration || 0);
  });

  // Keep the best (group[0]), delete the rest
  const toKeep = group[0];
  const toDelete = group.slice(1);

  for (const t of toDelete) {
    db.prepare('DELETE FROM playlist_tracks WHERE track_id = ?').run(t.id);
    db.prepare('DELETE FROM listening_history WHERE track_id = ?').run(t.id);
    db.prepare('DELETE FROM tracks WHERE id = ?').run(t.id);
    deletedCount++;
  }

  console.log(`Kept: "${toKeep.title}" (${toKeep.duration}s) | Pruned ${toDelete.length} duplicate(s)`);
}

const remaining = db.prepare('SELECT count(*) as count FROM tracks').get().count;
console.log(`\nPruned ${deletedCount} duplicate tracks!`);
console.log(`Library now has exactly ${remaining} unique, full-length songs.`);
