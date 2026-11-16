const fs = require('fs');
const path = require('path');

// Generates a proper RIFF 16-bit 44.1kHz PCM WAV file with procedural melodies & atmospheric ambiance
function generateWavFile(filePath, durationSeconds, style = 'rain_ambient') {
  const sampleRate = 44100;
  const numChannels = 2;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const totalSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = totalSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;

  // Pentatonic notes frequencies (Hz) for soothing evening Kerala tea stall mood:
  // D minor / Dorian: D3 (146.83), F3 (174.61), G3 (196.0), A3 (220.0), C4 (261.63), D4 (293.66), E4 (329.63), F4 (349.23), A4 (440.0)
  const notes = [146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 329.63, 349.23, 440.0];
  const chordRoots = [146.83, 174.61, 196.0, 220.0];

  // Procedural generation parameters
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let left = 0;
    let right = 0;

    if (style === 'rain_ambient') {
      // Gentle rain noise + warm analog drone
      const rainNoise = (Math.random() * 2 - 1) * 0.08;
      // Soft gentle filtering simulation
      const drone1 = Math.sin(2 * Math.PI * 110 * t) * 0.12;
      const drone2 = Math.sin(2 * Math.PI * 164.81 * t) * 0.08;
      const sub = Math.sin(2 * Math.PI * 55 * t) * 0.15;
      
      // Slow warm chord progression every 4 seconds
      const chordIndex = Math.floor(t / 4) % chordRoots.length;
      const root = chordRoots[chordIndex];
      const melody = Math.sin(2 * Math.PI * (root * 2) * t) * 0.09 * (1 + 0.3 * Math.sin(2 * Math.PI * 0.5 * t));

      left = (rainNoise * 0.7 + drone1 + sub * 0.8 + melody) * 0.6;
      right = (rainNoise * 0.7 + drone2 + sub * 0.8 + melody * 0.9) * 0.6;

    } else if (style === 'acoustic_evening') {
      // Plucked acoustic guitar note simulation
      const noteDuration = 0.8;
      const noteIndex = Math.floor(t / noteDuration) % notes.length;
      const noteFreq = notes[noteIndex];
      const noteTime = t % noteDuration;
      // Exponential decay envelope
      const env = Math.exp(-noteTime * 4.5);
      const tone = (
        Math.sin(2 * Math.PI * noteFreq * noteTime) * 0.6 +
        Math.sin(2 * Math.PI * noteFreq * 2 * noteTime) * 0.3 +
        Math.sin(2 * Math.PI * noteFreq * 3 * noteTime) * 0.1
      ) * env * 0.35;

      const baseDrone = Math.sin(2 * Math.PI * 73.42 * t) * 0.07;
      left = tone + baseDrone;
      right = tone * 0.95 + baseDrone;

    } else if (style === 'radio_nostalgia') {
      // Warm 1970s transistor radio aesthetic with gentle flutter
      const flutter = 1 + 0.015 * Math.sin(2 * Math.PI * 4.2 * t);
      const noteFreq = notes[Math.floor(t * 1.5) % notes.length] * flutter;
      const tone = Math.sin(2 * Math.PI * noteFreq * t) * 0.18;
      const hiss = (Math.random() * 2 - 1) * 0.02;
      const warmth = Math.sin(2 * Math.PI * 110 * t) * 0.1;
      left = tone + hiss + warmth;
      right = tone * 0.98 + hiss + warmth;

    } else {
      // Mellow twilight flute / ambient melody
      const freq1 = notes[Math.floor(t * 0.75) % notes.length];
      const vibrato = 1 + 0.01 * Math.sin(2 * Math.PI * 5 * t);
      const flute = Math.sin(2 * Math.PI * freq1 * vibrato * t) * 0.22;
      const pad = Math.sin(2 * Math.PI * 146.83 * t) * 0.08 + Math.sin(2 * Math.PI * 220 * t) * 0.06;
      left = flute + pad;
      right = flute * 0.9 + pad;
    }

    // Master volume clamp and soft limiter
    left = Math.max(-0.95, Math.min(0.95, left));
    right = Math.max(-0.95, Math.min(0.95, right));

    const s16Left = Math.floor(left * 32767);
    const s16Right = Math.floor(right * 32767);

    buffer.writeInt16LE(s16Left, offset);
    buffer.writeInt16LE(s16Right, offset + 2);
    offset += 4;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  return {
    filePath,
    durationSeconds,
    sizeBytes: buffer.length
  };
}

module.exports = {
  generateWavFile
};
