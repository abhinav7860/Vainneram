import os
import sqlite3
import re
import urllib.request
from ytmusicapi import YTMusic

db_path = r'c:\Users\abhin\Desktop\Vainneram\data\vainneram.db'
covers_dir = r'c:\Users\abhin\Desktop\Vainneram\data\uploads\covers'
os.makedirs(covers_dir, exist_ok=True)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Find tracks without cover art
cursor.execute("SELECT id, title, artist, album FROM tracks WHERE cover_url IS NULL OR cover_url = ''")
missing = cursor.fetchall()

print(f"Found {len(missing)} tracks without cover art. Fetching from YouTube Music...")

yt = YTMusic()
success = 0

for i, (track_id, title, artist, album) in enumerate(missing):
    # Clean query
    clean_title = re.sub(r'\(.*?\)|\[.*?\]', '', title).replace('-', ' ').strip()
    clean_artist = artist.split(',')[0].strip() if artist else ''
    query = f"{clean_title} {clean_artist} Malayalam"

    try:
        results = yt.search(query, filter='songs')
        if not results:
            results = yt.search(f"{clean_title} Malayalam", filter='songs')

        if results and 'thumbnails' in results[0] and results[0]['thumbnails']:
            thumb_url = results[0]['thumbnails'][-1]['url']
            # Upgrade to 544x544 resolution
            high_res_url = re.sub(r'=w\d+-h\d+', '=w544-h544', thumb_url)

            filename = f"ytm-{track_id[:8]}.jpg"
            dest_path = os.path.join(covers_dir, filename)

            req = urllib.request.Request(high_res_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=8) as resp, open(dest_path, 'wb') as f:
                f.write(resp.read())

            cover_url = f"/api/tracks/cover/{filename}"
            cursor.execute("UPDATE tracks SET cover_url = ? WHERE id = ?", (cover_url, track_id))
            conn.commit()
            success += 1
            print(f"[{i+1}/{len(missing)}] ✓ {title} -> {filename}")
        else:
            print(f"[{i+1}/{len(missing)}] - Not found: {title}")
    except Exception as e:
        print(f"[{i+1}/{len(missing)}] ✗ Error for {title}: {e}")

print(f"\nFinished! Added cover art to {success} out of {len(missing)} songs.")
conn.close()
