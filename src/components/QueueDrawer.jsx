import React from 'react';
import { X, Play, Trash2, ListMusic, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/formatters';

export function QueueDrawer() {
  const {
    isQueueOpen,
    setIsQueueOpen,
    queue,
    queueIndex,
    currentTrack,
    playTrack,
    removeFromQueue,
    clearQueue
  } = usePlayer();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsQueueOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#160d08] border-l-2 border-[#3d2315] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-[#382014] flex items-center justify-between bg-[#120a06]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#27140b] text-[#f59e0b] border border-[#d97706]/30">
                <ListMusic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-vintage text-base font-semibold text-[#fef3c7]">
                  Play Queue • വരിയിലെ പാട്ടുകൾ
                </h3>
                <span className="text-xs text-[#a88a74]">
                  {queue.length} {queue.length === 1 ? 'cassette' : 'cassettes'} queued
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {queue.length > 0 && (
                <button
                  onClick={clearQueue}
                  className="px-2.5 py-1 text-xs text-[#fed7aa] hover:text-white hover:bg-[#27140b] rounded-md transition-colors border border-[#d97706]/30"
                  title="Clear all queued songs"
                >
                  Clear Queue
                </button>
              )}
              <button
                onClick={() => setIsQueueOpen(false)}
                className="p-1.5 text-[#a88a74] hover:text-[#fef3c7] hover:bg-[#27140b] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Queue Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {queue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#a88a74]">
                <div className="w-14 h-14 rounded-full bg-[#22130b] border border-[#382014] flex items-center justify-center text-[#d97706] mb-3">
                  <Music className="w-7 h-7" />
                </div>
                <p className="font-serif-vintage text-sm font-medium text-[#fef3c7]">
                  Queue is empty
                </p>
                <p className="text-xs text-[#a88a74] mt-1 max-w-xs">
                  Click on any cassette in your library or playlist to start listening.
                </p>
              </div>
            ) : (
              queue.map((track, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#2e180d] to-[#1e0f08] border-[#f59e0b] shadow-md ring-1 ring-[#f59e0b]/40'
                        : 'bg-[#1a0e08] border-[#382014] hover:bg-[#22130b] hover:border-[#4a2b1a]'
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => playTrack(track, queue, idx)}
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#120a06] border border-[#382014] overflow-hidden flex-shrink-0 flex items-center justify-center text-xs">
                        {track.cover_url ? (
                          <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>🍵</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold truncate ${
                          isCurrent ? 'text-[#f59e0b]' : 'text-[#fef3c7]'
                        }`}>
                          {track.title}
                        </p>
                        <p className="text-[11px] text-[#a88a74] truncate">
                          {track.artist || 'Unknown Artist'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#a88a74] flex-shrink-0">
                      <span className="font-mono text-[11px]">{formatDuration(track.duration)}</span>
                      <button
                        onClick={() => removeFromQueue(idx)}
                        className="p-1 rounded text-[#8c7462] hover:text-[#e57373] hover:bg-[#2d120f] transition-colors"
                        title="Remove from queue"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
