const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = path.join(__dirname, '..', 'ffmpeg.exe');
const soundDir = path.join(__dirname, '..', 'public', 'sounds');

const sounds = [
  { name: 'rain', file: 'rain.ogg', boost: '+14dB' },
  { name: 'thunder', file: 'thunder.ogg', boost: '+8dB' },
  { name: 'crickets', file: 'crickets.ogg', boost: '+14dB' },
  { name: 'chatting', file: 'chatting.ogg', boost: '+3dB' },
  { name: 'fireplace', file: 'fireplace.ogg', boost: '+16dB' },
  { name: 'birds', file: 'birds.ogg', boost: '+10dB' },
  { name: 'wind', file: 'wind.mp3', boost: '+12dB' },
  { name: 'kettle', file: 'kettle.ogg', boost: '+12dB' }
];

for (const s of sounds) {
  const inPath = path.join(soundDir, s.file);
  const outPath = path.join(soundDir, `${s.name}.mp3`);
  const tempPath = path.join(soundDir, `temp_${s.name}.mp3`);

  console.log(`Processing ${s.name} from ${s.file}...`);

  // If wind is 3s, loop it 8 times to make a 24s seamless ambient loop
  let filter = `volume=${s.boost}`;
  let extraArgs = [];

  if (s.name === 'wind') {
    extraArgs = ['-stream_loop', '8'];
    filter = `aloop=loop=-1:size=2e+09,volume=${s.boost}`;
  }

  // Use ffmpeg to map audio stream ONLY, resample to 44100Hz stereo/mono, normalize volume, save as standard MP3
  const args = [
    '-y',
    '-i', inPath,
    '-map', '0:a:0',
    '-af', `volume=${s.boost},silenceremove=start_periods=1:start_duration=0.1:start_threshold=-55dB`,
    '-ar', '44100',
    '-ac', '2',
    '-b:a', '192k',
    tempPath
  ];

  if (s.name === 'wind') {
    // Loop wind 10 times with crossfade
    args.splice(1, 0, '-stream_loop', '8');
  }

  const res = spawnSync(ffmpeg, args, { encoding: 'utf8' });
  if (res.status === 0 && fs.existsSync(tempPath)) {
    fs.renameSync(tempPath, outPath);
    console.log(`✓ Successfully created ${s.name}.mp3`);
  } else {
    console.error(`✗ Failed for ${s.name}:`, res.stderr);
  }
}

console.log('All sounds converted to standard browser-compatible MP3!');
