// Format seconds to mm:ss or hh:mm:ss
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const total = Math.round(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Format bytes into readable string (MB, KB, GB)
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Format date to friendly string
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Malayalam accents for moods & collections
export const MOOD_DEFINITIONS = [
  { id: 'All', label: 'All Songs', malayalam: 'എല്ലാം', color: 'from-amber-600/30 to-amber-900/30' },
  { id: 'Rainy Evening', label: 'Rainy Evening', malayalam: 'മഴക്കാലം', icon: '🌧️', desc: 'Gentle raindrops & contemplative rhythms' },
  { id: 'Tea Stall Acoustics', label: 'Tea Stall Acoustics', malayalam: 'ചായപ്പീടിക', icon: '☕', desc: 'Warm acoustic guitars, flutes & rustic chords' },
  { id: 'Warm Chai', label: 'Warm Chai', malayalam: 'കട്ടൻ ചായ', icon: '🫖', desc: 'Cozy, grounded, comforting melodies' },
  { id: 'Mellow', label: 'Mellow Twilight', malayalam: 'സന്ധ്യാവേള', icon: '🌇', desc: 'Slow, relaxed evening unwinding' },
  { id: 'Folk Echoes', label: 'Folk Echoes', malayalam: 'നാടൻ ഈണം', icon: '🪕', desc: 'Traditional rustic sounds and warmth' }
];

export function getMoodBadge(mood) {
  const match = MOOD_DEFINITIONS.find(m => m.id.toLowerCase() === (mood || '').toLowerCase());
  return match || { id: mood || 'Warm Chai', label: mood || 'Warm Chai', malayalam: 'പാട്ട്', icon: '🎵' };
}
