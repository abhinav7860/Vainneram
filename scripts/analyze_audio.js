const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = path.join(__dirname, '..', 'ffmpeg.exe');
const soundDir = path.join(__dirname, '..', 'public', 'sounds');

const files = fs.readdirSync(soundDir);
for (const f of files) {
  const p = path.join(soundDir, f);
  const res = spawnSync(ffmpeg, ['-i', p, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
  const output = (res.stderr || '') + (res.stdout || '');
  const maxVol = output.match(/max_volume: ([-\d.]+) dB/);
  const meanVol = output.match(/mean_volume: ([-\d.]+) dB/);
  const dur = output.match(/Duration: ([\d:.]+)/);
  const streams = output.match(/Stream #0:0[^\n]+/);
  console.log(f, '=>', {
    duration: dur ? dur[1] : 'unknown',
    maxVol: maxVol ? maxVol[1] + ' dB' : 'unknown',
    meanVol: meanVol ? meanVol[1] + ' dB' : 'unknown',
    codec: streams ? streams[0].trim() : 'unknown'
  });
}
