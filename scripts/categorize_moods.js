const { db } = require('../server/db');

const tracks = db.prepare('SELECT id, title, artist FROM tracks').all();

const rainKeywords = ['mazha', 'rain', 'eeran', 'eeranmegham', 'nilamazhayil', 'karmukilin', 'shishira', 'karimizhi', 'kadavathu', 'theerame'];
const folkKeywords = ['chingamaasam', 'thumbi', 'mundiri', 'doore', 'naadan', 'appangal', 'bheeshma', 'minnal', 'shankar'];
const warmKeywords = ['aaraadhike', 'aaromal', 'khalbi', 'madhu', 'cherathukal', 'darshana', 'jeevamshamayi', 'neerolam', 'malik', 'kadha'];
const mellowKeywords = ['vanil', 'chandrika', 'ore nila', 'en karalil', 'kaathilola', 'chilluraanthal', 'mounam', 'mel mel', 'azhalinte', 'shyamambaram'];

const moods = ['Warm Chai', 'Rainy Evening', 'Tea Stall Acoustics', 'Mellow Twilight', 'Folk Echoes'];

let updated = 0;
for (let i = 0; i < tracks.length; i++) {
  const t = tracks[i];
  const text = ((t.title || '') + ' ' + (t.artist || '')).toLowerCase();
  
  let mood = '';
  if (rainKeywords.some(k => text.includes(k))) {
    mood = 'Rainy Evening';
  } else if (folkKeywords.some(k => text.includes(k))) {
    mood = 'Folk Echoes';
  } else if (warmKeywords.some(k => text.includes(k))) {
    mood = 'Warm Chai';
  } else if (mellowKeywords.some(k => text.includes(k))) {
    mood = 'Mellow Twilight';
  } else {
    // Round-robin balance the rest
    mood = moods[i % moods.length];
  }

  db.prepare('UPDATE tracks SET mood_tag = ? WHERE id = ?').run(mood, t.id);
  updated++;
}

console.log(`Updated ${updated} tracks with balanced tea stall moods!`);
const breakdown = db.prepare('SELECT mood_tag, count(*) as count FROM tracks GROUP BY mood_tag').all();
console.log(breakdown);
