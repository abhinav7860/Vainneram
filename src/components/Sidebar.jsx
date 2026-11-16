import React from 'react';
import { Home, Library, Disc, PlusCircle, CloudRain, HardDrive, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAmbience } from '../context/AmbienceContext';

export function Sidebar({ currentTab, setCurrentTab }) {
  const { stats } = useAuth();
  const { isEnabled: isAmbienceEnabled, setIsAmbienceOpen } = useAmbience();

  const navItems = [
    { id: 'home', label: 'Home', malayalam: 'ഹോം', icon: Home },
    { id: 'library', label: 'My Library', malayalam: 'പാട്ടുകൾ', icon: Library },
    { id: 'playlists', label: 'Playlists', malayalam: 'പ്ലേലിസ്റ്റുകൾ', icon: Disc },
    { id: 'add', label: 'Add Music', malayalam: 'പാട്ട് ചേർക്കൂ', icon: PlusCircle, highlight: true }
  ];

  const storageUsed = stats?.storageUsedBytes || 0;
  const storageQuota = 500 * 1024 * 1024; // 500MB
  const storagePercent = Math.min(100, Math.round((storageUsed / storageQuota) * 100));

  return (
    <aside className="w-64 bg-[#0d1a14] border-r border-[#1c362b] flex-col justify-between hidden md:flex h-[calc(100vh-80px)] sticky top-0 p-4">
      {/* Top Branding / Logo */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d9822b] to-[#994d13] flex items-center justify-center text-white shadow-lg shadow-black/40">
            <span className="text-xl">🍵</span>
          </div>
          <div>
            <h1 className="font-serif-vintage text-base font-bold text-[#f7f2e8] tracking-wide">
              വൈകുന്നേരം
            </h1>
            <p className="text-[11px] text-[#8fa498] font-medium tracking-wider uppercase">
              Vainneram Music
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#183628] text-[#f7f2e8] border border-[#d9822b]/40 shadow-sm'
                    : item.highlight
                    ? 'bg-[#14261f] text-[#deb17a] hover:bg-[#1a3429] hover:text-[#f7f2e8] border border-[#224032]'
                    : 'text-[#8ea498] hover:bg-[#13271e] hover:text-[#f7f2e8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive || item.highlight ? 'text-[#d9822b]' : 'text-[#728d7f]'}`} />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] font-malayalam opacity-60">
                  {item.malayalam}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Atmospheric Tea Stall Feature Button */}
        <div className="pt-2">
          <button
            onClick={() => setIsAmbienceOpen(true)}
            className={`w-full p-3 rounded-xl border text-left transition-all ${
              isAmbienceEnabled
                ? 'bg-[#193729] border-[#d9822b] shadow-md shadow-amber-950/30'
                : 'bg-[#12241c] border-[#1d392c] hover:border-[#2e5241]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-2 text-xs font-semibold text-[#f7f2e8]">
                <CloudRain className={`w-4 h-4 ${isAmbienceEnabled ? 'text-[#e69a38]' : 'text-[#6e8578]'}`} />
                Atmospheric Console
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                isAmbienceEnabled ? 'bg-[#d9822b] text-white' : 'bg-[#1a3328] text-[#81998d]'
              }`}>
                {isAmbienceEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            <p className="text-[11px] text-[#81998d] font-malayalam">
              വൈകുന്നേരം അന്തരീക്ഷം & പ്രീസെറ്റുകൾ
            </p>
          </button>
        </div>
      </div>

      {/* Bottom section: Local Drop Folder & Storage */}
      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-[#12231b] border border-[#1e392c] text-xs">
          <p className="text-[11px] font-semibold text-[#deb17a] flex items-center gap-1.5">
            <span>📁</span>
            <span>No-Button Auto Import</span>
          </p>
          <p className="text-[10px] text-[#7d9689] mt-1 leading-snug">
            Drop songs anywhere on screen, press <span className="text-[#deb17a] font-mono">Ctrl+O</span>, or copy into <span className="text-[#deb17a] font-mono">drop-music-here/</span>.
          </p>
        </div>

        {/* Storage Quota Card */}
        <div className="p-3.5 rounded-xl bg-[#11231a] border border-[#1e3b2e] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-[#8fa498]">
            <HardDrive className="w-3.5 h-3.5 text-[#deb17a]" />
            Personal Storage
          </span>
          <span className="font-mono text-[11px] text-[#f7f2e8]">{storagePercent}%</span>
        </div>

        <div className="w-full bg-[#193427] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#d9822b] to-[#f59e0b] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(4, storagePercent)}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-[#718a7d] font-mono">
          <span>{(storageUsed / (1024 * 1024)).toFixed(1)} MB used</span>
          <span>500 MB quota</span>
        </div>
      </div>
    </div>
  </aside>
  );
}
