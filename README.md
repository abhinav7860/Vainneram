# വൈകുന്നേരം — Vainneram
### Personal Music Library & Kerala Tea-Stall Atmosphere

> *"കട്ടൻ ചായയും ചാറ്റൽ മഴയും ഓർമ്മകളും"* — Steaming black tea, drizzle on a corrugated tin roof, and nostalgic tunes.

**Vainneram (വൈകുന്നേരം)** is a personal music sanctuary where you can store, organize, and listen to your own audio collection. Visually inspired by the warm, nostalgic atmosphere of an evening at a Kerala roadside tea stall (കട്ടൻ ചായക്കട), the app combines deep monsoon greens, warm brass/amber tones, vintage paper textures, and restrained Malayalam typography accents with a persistent audio player and a Web Audio tea-stall ambience generator.

---

## 🍵 Features & User Journeys

### 1. Add Music (Your Own Audio)
- **Drag & Drop Upload**: Supports **MP3, WAV, M4A, OGG, FLAC, and AAC** (up to 100MB per track).
- **Metadata Tag Detection**: Server-side audio inspection via `music-metadata` automatically detects title, artist, album, duration, bitrate, and extracts embedded album artwork.
- **Customization & Review**: Customize track metadata, choose an atmospheric mood tag (*Rainy Evening*, *Tea Stall Acoustics*, *Warm Chai*, *Mellow Twilight*, *Folk Echoes*), and upload custom cover art before saving.
- **Instant Starter Pack**: One-click action to load a curated tea-stall atmospheric audio pack with synthesized acoustic melodies and rain on tin roofs.
- **Upload Progress & Validation**: Real-time progress bar, clear error states, and storage quota checks.

### 2. Find & Browse Music
- **Instant Search**: Search instantly across song titles, artists, albums, and mood tags.
- **Mood Filter Pills**: One-click filtering by Kerala tea-stall moods (*മഴക്കാലം*, *ചായപ്പീടിക*, *കട്ടൻ ചായ*, *സന്ധ്യാവേള*, *നാടൻ ഈണം*).
- **Sort Options**: Sort by *Recently Added*, *Title (A-Z)*, *Artist (A-Z)*, *Duration*, and *Most Played*.
- **Favorites Filter**: Filter your library down to your liked tracks with a single click.
- **View Modes**: Switch seamlessly between visual cards and compact table rows.

### 3. Listen (Shared Persistent Player)
- **Persistent Bottom Player**: Remains active and uninterrupted across all screens and navigations.
- **HTTP 206 Partial Content (Byte Range Streaming)**: Seeking anywhere in a track is instantaneous and fluid in all modern browsers.
- **Full Playback Controls**: Play, pause, seek slider with elapsed/total duration, volume slider with mute toggle, previous/next, shuffle, and 3-way repeat (*Off*, *Repeat All*, *Repeat One*).
- **Keyboard Shortcuts**:
  - `Space`: Play / Pause
  - `Arrow Right` / `Arrow Left`: Seek forward / backward 5 seconds
  - `Arrow Up` / `Arrow Down`: Volume up / down
  - `M`: Mute / Unmute
- **Play Queue Drawer**: View currently queued tracks, jump to any track, remove tracks, or clear the queue.
- **Immersive / Full-Screen Mode**: Expand the player into a distraction-free evening listening view on desktop and mobile.

### 4. Kerala Tea Stall Ambience Mixer
- Procedural audio generator synthesized directly in-browser using the Web Audio API:
  - **🌧️ Rain on Tin Roof (ചാറ്റൽ മഴ)**: Realistic rain filtered through bandpass resonance.
  - **🫖 Kettle & Steaming Chai (ചായപ്പീടിക)**: Gentle boiling resonance and steam hiss.
  - **📻 Transistor Radio Warmth (പഴയ റേഡിയോ)**: 1970s analog radio warmth and flutter.
- Individual volume sliders and a master toggle so rain and tea-stall sounds can play alongside your music.

### 5. Playlists & Organization
- **Create & Manage Playlists**: Custom names, descriptions, and mood themes.
- **Playlist Details**: Dedicated playlist screen showing track list, total runtime, *Play All*, and *Shuffle All*.
- **Add / Remove Tracks**: Add any song directly to existing playlists or create a new playlist on the fly.
- **Listening History & Activity**: Automatically tracks play counts and provides *Recently Played* / *Continue Listening* rows on the Home screen.

### 6. Personal Privacy & Multi-User Isolation
- **Strict Privacy**: Each user's uploads, library, playlists, and listening history are isolated to their account.
- **Secured Endpoints**: Audio streaming and track operations verify user ownership before granting access (one user cannot access or stream another user's audio).
- **Demo Mode**: Includes an instant one-click demo login (*Sujith | സുജിത്ത്*) for immediate exploration without having to create an account.

---

## 🛠️ Stack & Storage Approach

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Fast, responsive UI with client-side state |
| **Styling** | Tailwind CSS v4 | Deep forest greens (`#0c1813`, `#13261f`), warm amber/brass (`#d9822b`), chai brown, and cream (`#f7f2e8`) |
| **Icons & Typography** | Lucide React + Google Fonts | *Lora* (serif), *Plus Jakarta Sans*, and *Gayathri* / *Manjari* (Malayalam) |
| **Ambience Synthesis** | Web Audio API | Procedural white/pink noise, biquad filters, and oscillators |
| **Backend** | Node.js + Express 5 | REST API + HTTP 206 Partial Content byte range streaming |
| **Database** | SQLite via `better-sqlite3` | ACID transactions, foreign keys, WAL mode (`data/vainneram.db`) |
| **Metadata Parsing** | `music-metadata` | Extracts title, artist, album, duration, bitrate, and embedded cover art |
| **File Storage** | Local Persistent Disk | Stored in `data/uploads/audio/` and `data/uploads/covers/` |
| **Auth & Security** | JWT + `bcryptjs` | Multi-user support with hashed passwords & token authentication |

---

## 🚀 Running the Application

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone or navigate to the project directory
cd Vainneram

# Dependencies are already installed, but if setting up fresh:
npm install
```

### Starting the Server (Production Mode)
```bash
# Build the Vite frontend into dist/
npm run build

# Start the unified server on port 5000
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

### Development Mode (Hot Reloading)
```bash
# Runs backend server (port 5000) and Vite dev server (port 5173) concurrently
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📦 Storage Limits & Persistence
- **Storage Location**: Audio tracks are saved to `data/uploads/audio/` and covers to `data/uploads/covers/`.
- **Nominal Quota**: Displays 500 MB per personal library with live byte tracking.
- **Single File Limit**: 100 MB per track.
- **Supported Formats**: MP3, WAV, M4A, OGG, FLAC, AAC.
