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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsQueueOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#102019] border-l border-[#203c30] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-[#1c352a] flex items-center justify-between bg-[#0c1813]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#183427] text-[#d9822b]">
                <ListMusic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-vintage text-base font-semibold text-[#f7f2e8]">
                  Play Queue
                </h3>
                <span className="text-xs text-[#7f9689]">
                  {queue.length} {queue.length === 1 ? 'song' : 'songs'} queued
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {queue.length > 0 && (
                <button
                  onClick={clearQueue}
                  className="px-2.5 py-1 text-xs text-[#deb17a] hover:text-[#e69a38] hover:bg-[#1a3328] rounded-md transition-colors"
                  title="Clear all queued songs"
                >
                  Clear Queue
                </button>
              )}
              <button
                onClick={() => setIsQueueOpen(false)}
                className="p-1.5 text-[#7f9689] hover:text-[#f7f2e8] hover:bg-[#1a3328] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Queue Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {queue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#758c7f]">
                <div className="w-14 h-14 rounded-full bg-[#152a20] flex items-center justify-center text-[#d9822b] mb-3">
                  <Music className="w-7 h-7" />
                </div>
                <p className="font-serif-vintage text-sm font-medium text-[#f7f2e8]">
                  Queue is empty
                </p>
                <p className="text-xs text-[#758c7f] mt-1 max-w-xs">
                  Click on any track in your library or playlist to start listening.
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
                        ? 'bg-[#183628] border-[#d9822b]/50 shadow-sm'
                        : 'bg-[#13251c] border-transparent hover:bg-[#193125] hover:border-[#224434]'
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => playTrack(track, queue, idx)}
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#0e1d17] overflow-hidden flex-shrink-0 flex items-center justify-center text-xs">
                        {track.cover_url ? (
                          <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>🍵</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold truncate ${
                          isCurrent ? 'text-[#e69a38]' : 'text-[#f7f2e8]'
                        }`}>
                          {track.title}
                        </p>
                        <p className="text-[11px] text-[#81998c] truncate">
                          {track.artist || 'Unknown Artist'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#81998c] flex-shrink-0">
                      <span className="font-mono text-[11px]">{formatDuration(track.duration)}</span>
                      <button
                        onClick={() => removeFromQueue(idx)}
                        className="p-1 rounded text-[#678073] hover:text-[#e57373] hover:bg-[#281c1c] transition-colors"
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
