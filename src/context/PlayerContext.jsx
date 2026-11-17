import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { initMediaAudioEffects, setMuffleEffect, setSpatialEffect, resumeAudioContext } from '../utils/audioEffects';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('vainneram_volume');
    return saved !== null ? parseFloat(saved) : 0.85;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('all'); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);

  // Muffled (Vibe) and Spatial Audio states
  const [isMuffled, setIsMuffled] = useState(false);
  const [isSpatialAudio, setIsSpatialAudio] = useState(false);

  // Sleep Timer states
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null); // seconds
  const sleepIntervalRef = useRef(null);

  // Initialize Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;
    audio.volume = volume;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoadingAudio(false);
      setPlaybackError(null);
    };

    const onWaiting = () => {
      setIsLoadingAudio(true);
    };

    const onCanPlay = () => {
      setIsLoadingAudio(false);
    };

    const onPlay = () => {
      setIsPlaying(true);
      setIsLoadingAudio(false);
      // Initialize audio effects graph on first play
      initMediaAudioEffects(audio);
      resumeAudioContext();
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onError = (e) => {
      console.error('Audio playback error:', e);
      setIsLoadingAudio(false);
      setIsPlaying(false);
      setPlaybackError('Unable to play audio. Check file format or network.');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Update Muffle & Spatial in real-time
  useEffect(() => {
    setMuffleEffect(isMuffled);
  }, [isMuffled]);

  useEffect(() => {
    setSpatialEffect(isSpatialAudio);
  }, [isSpatialAudio]);

  const toggleMuffled = () => {
    setIsMuffled(prev => {
      const next = !prev;
      if (next) {
        setIsSpatialAudio(false);
      }
      return next;
    });
  };

  const toggleSpatialAudio = () => {
    setIsSpatialAudio(prev => {
      const next = !prev;
      if (next) {
        setIsMuffled(false);
      }
      return next;
    });
  };

  // Sleep Timer logic
  const startSleepTimer = (minutes) => {
    if (sleepIntervalRef.current) {
      clearInterval(sleepIntervalRef.current);
    }

    if (!minutes || minutes <= 0) {
      setSleepTimerMinutes(null);
      setSleepTimerRemaining(null);
      return;
    }

    const totalSeconds = Math.round(minutes * 60);
    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(totalSeconds);

    sleepIntervalRef.current = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(sleepIntervalRef.current);
          // Stop playback smoothly
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearSleepTimer = () => {
    if (sleepIntervalRef.current) {
      clearInterval(sleepIntervalRef.current);
    }
    setSleepTimerMinutes(null);
    setSleepTimerRemaining(null);
  };

  // Update repeat mode ref for use in onEnded
  const repeatModeRef = useRef(repeatMode);
  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  const queueRef = useRef(queue);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const queueIndexRef = useRef(queueIndex);
  useEffect(() => {
    queueIndexRef.current = queueIndex;
  }, [queueIndex]);

  const isShuffleRef = useRef(isShuffle);
  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  // Handle track end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      const mode = repeatModeRef.current;
      if (mode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        return;
      }
      playNext(true);
    };

    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, []);

  // Set volume & mute
  const setVolume = (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    localStorage.setItem('vainneram_volume', clamped.toString());
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const nextMuted = !prev;
      if (audioRef.current) {
        audioRef.current.volume = nextMuted ? 0 : volume;
      }
      return nextMuted;
    });
  };

  // Play a specific track
  const playTrack = (track, newQueue = null, startIndex = -1) => {
    if (!track) return;

    let targetQueue = newQueue || queue;
    let targetIndex = startIndex;

    if (newQueue) {
      setQueue(newQueue);
      targetQueue = newQueue;
      if (targetIndex === -1) {
        targetIndex = newQueue.findIndex(t => t.id === track.id);
      }
    } else {
      const existingIdx = targetQueue.findIndex(t => t.id === track.id);
      if (existingIdx !== -1) {
        targetIndex = existingIdx;
      } else {
        targetQueue = [...targetQueue, track];
        targetIndex = targetQueue.length - 1;
        setQueue(targetQueue);
      }
    }

    setQueueIndex(targetIndex >= 0 ? targetIndex : 0);
    setCurrentTrack(track);
    setPlaybackError(null);
    setIsLoadingAudio(true);

    const token = localStorage.getItem('vainneram_token') || '';
    const streamUrl = `/api/tracks/${track.id}/stream?token=${encodeURIComponent(token)}`;

    if (audioRef.current) {
      audioRef.current.src = streamUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          initMediaAudioEffects(audioRef.current);
          api.logPlay(track.id).catch(console.warn);
        })
        .catch(err => {
          console.warn('Auto-play prevented or stream failed:', err.message);
          setIsPlaying(false);
          setIsLoadingAudio(false);
        });
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrack(queue[0], queue, 0);
      } else {
        // Automatically fetch and play a random track from library
        api.getTracks().then(res => {
          if (res?.tracks && res.tracks.length > 0) {
            const randomIdx = Math.floor(Math.random() * res.tracks.length);
            playTrack(res.tracks[randomIdx], res.tracks, randomIdx);
          }
        }).catch(err => console.warn('Could not auto-start track:', err));
      }
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().then(() => {
        initMediaAudioEffects(audioRef.current);
      }).catch(err => {
        console.error('Play failed:', err);
        setPlaybackError('Failed to resume playback.');
      });
    }
  };

  const seekTo = (seconds) => {
    if (!audioRef.current || isNaN(seconds)) return;
    const clamped = Math.max(0, Math.min(seconds, duration || 0));
    audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const playNext = (isAuto = false) => {
    const q = queueRef.current;
    if (q.length === 0) return;

    const currentIndex = queueIndexRef.current;
    let nextIndex = -1;

    if (isShuffleRef.current && q.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * q.length);
      } while (nextIndex === currentIndex && q.length > 1);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= q.length) {
        if (repeatModeRef.current === 'all' || !isAuto) {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
    }

    if (nextIndex >= 0 && nextIndex < q.length) {
      const nextTrack = q[nextIndex];
      setQueueIndex(nextIndex);
      playTrack(nextTrack, q, nextIndex);
    }
  };

  const playPrevious = () => {
    const q = queueRef.current;
    if (q.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      seekTo(0);
      return;
    }

    const currentIndex = queueIndexRef.current;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = q.length - 1;
    }

    if (prevIndex >= 0 && prevIndex < q.length) {
      const prevTrack = q[prevIndex];
      setQueueIndex(prevIndex);
      playTrack(prevTrack, q, prevIndex);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const addToQueue = (track) => {
    if (!track) return;
    setQueue(prev => {
      const updated = [...prev, track];
      if (prev.length === 0) {
        setTimeout(() => playTrack(track, updated, 0), 50);
      }
      return updated;
    });
  };

  const removeFromQueue = (index) => {
    setQueue(prev => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (index === queueIndex) {
        if (updated.length > 0) {
          const nextIdx = index < updated.length ? index : 0;
          setTimeout(() => playTrack(updated[nextIdx], updated, nextIdx), 50);
        } else {
          if (audioRef.current) audioRef.current.pause();
          setCurrentTrack(null);
          setQueueIndex(-1);
          setIsPlaying(false);
        }
      } else if (index < queueIndex) {
        setQueueIndex(queueIndex - 1);
      }
      return updated;
    });
  };

  const clearQueue = () => {
    if (audioRef.current) audioRef.current.pause();
    setQueue([]);
    setQueueIndex(-1);
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekTo(currentTime + 5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekTo(currentTime - 5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(volume + 0.05);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(volume - 0.05);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, volume, isPlaying, currentTrack]);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isShuffle,
      repeatMode,
      queue,
      queueIndex,
      isQueueOpen,
      isLoadingAudio,
      playbackError,
      isMuffled,
      isSpatialAudio,
      sleepTimerMinutes,
      sleepTimerRemaining,
      setIsQueueOpen,
      playTrack,
      togglePlayPause,
      seekTo,
      setVolume,
      toggleMute,
      playNext,
      playPrevious,
      toggleShuffle,
      toggleRepeat,
      addToQueue,
      removeFromQueue,
      clearQueue,
      setCurrentTrack,
      setIsMuffled,
      setIsSpatialAudio,
      toggleMuffled,
      toggleSpatialAudio,
      startSleepTimer,
      clearSleepTimer
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
