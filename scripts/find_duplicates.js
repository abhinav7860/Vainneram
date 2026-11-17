const { db } = require('../server/db');

const tracks = db.prepare('SELECT id, title, artist, duration, cover_url, file_path FROM tracks').all();

const titleMap = {};
for (const t of tracks) {
  // Normalize title: remove punctuation, lowercase, remove 'from ...'
  const norm = t.title
    .toLowerCase()
    .replace(/-\s*from.*/i, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[\W_]+/g, '')
    .trim();

  if (!titleMap[norm]) titleMap[norm] = [];
  titleMap[norm].push(t);
}

const dupes = Object.entries(titleMap).filter(([k, v]) => v.length > 1);
console.log(`Duplicate song groups found: ${dupes.length}`);

let totalDupeTracks = 0;
for (const [k, group] of dupes) {
  totalDupeTracks += (group.length - 1);
  console.log(`\nGroup "${k}" (${group.length} tracks):`);
  group.forEach(t => {
    console.log(`   - [ID: ${t.id.slice(0, 8)}] "${t.title}" by "${t.artist}" (${t.duration}s) | cover: ${Boolean(t.cover_url)}`);
  });
}

console.log(`\nTotal duplicate tracks to prune: ${totalDupeTracks}`);
