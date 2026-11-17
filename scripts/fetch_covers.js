const https = require('https');
const fs = require('fs');
const path = require('path');
const { db, coversDir } = require('../server/db');

function searchArtwork(query) {
  return new Promise((resolve) => {
    const cleanQ = encodeURIComponent(query.replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ').trim());
    const url = `https://itunes.apple.com/search?term=${cleanQ}&entity=song&limit=1`;
    
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            const art = json.results[0].artworkUrl100;
            if (art) {
              return resolve(art.replace('100x100bb', '600x600bb'));
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function searchDeezer(query) {
  return new Promise((resolve) => {
    const cleanQ = encodeURIComponent(query.replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ').trim());
    const url = `https://api.deezer.com/search?q=${cleanQ}&limit=1`;
    
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.data && json.data.length > 0) {
            const album = json.data[0].album;
            if (album && (album.cover_big || album.cover_medium)) {
              return resolve(album.cover_big || album.cover_medium);
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { timeout: 8000 }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(destPath, () => {});
        resolve(false);
      }
    }).on('error', () => {
      file.close();
      fs.unlink(destPath, () => {});
      resolve(false);
    });
  });
}

async function main() {
  const missingTracks = db.prepare('SELECT id, title, artist, album FROM tracks WHERE cover_url IS NULL OR cover_url = \'\'').all();
  console.log(`Searching artwork for remaining ${missingTracks.length} tracks...`);

  let successCount = 0;

  for (let i = 0; i < missingTracks.length; i++) {
    const t = missingTracks[i];
    const cleanTitle = t.title.replace(/-\s*From.*/i, '').replace(/\(.*\)/g, '').replace(/\[.*\]/g, '').trim();
    const cleanAlbum = (t.album || '').replace(/\(.*\)/g, '').trim();
    
    // Multiple search variations
    const queries = [
      `${cleanTitle} Malayalam`,
      `${cleanTitle} ${cleanAlbum}`,
      `${cleanTitle} ${t.artist.split(',')[0]} Malayalam`,
      cleanTitle,
      `${cleanAlbum} Malayalam`
    ].filter(Boolean);

    let artUrl = null;
    for (const q of queries) {
      artUrl = await searchArtwork(q);
      if (artUrl) break;
      artUrl = await searchDeezer(q);
      if (artUrl) break;
    }

    if (artUrl) {
      const filename = `art-${t.id.slice(0, 8)}.jpg`;
      const destPath = path.join(coversDir, filename);

      const downloaded = await downloadImage(artUrl, destPath);
      if (downloaded) {
        const coverUrl = `/api/tracks/cover/${filename}`;
        db.prepare('UPDATE tracks SET cover_url = ? WHERE id = ?').run(coverUrl, t.id);
        successCount++;
        console.log(`[${i + 1}/${missingTracks.length}] ✓ "${t.title}" -> ${filename}`);
      } else {
        console.log(`[${i + 1}/${missingTracks.length}] ✗ Download failed: "${t.title}"`);
      }
    } else {
      console.log(`[${i + 1}/${missingTracks.length}] - Not found: "${t.title}"`);
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nRound 2 Completed! Added artwork to ${successCount} tracks.`);
}

main();
