import React, { useState } from 'react';
import { Home, Library, Disc } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAmbience } from '../context/AmbienceContext';
import { usePlayer } from '../context/PlayerContext';

export function Navbar({ currentTab, onNavigate }) {
  const { user, logout } = useAuth();
  const { isEnabled: isAmbienceEnabled, setIsAmbienceOpen } = useAmbience();
  const { currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const [showCalendarQuote, setShowCalendarQuote] = useState(false);

  // Malayalam evening greeting based on current time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return { text: 'സുപ്രഭാതം', sub: 'Good Morning' };
    if (hours < 17) return { text: 'നമസ്കാരം', sub: 'Good Afternoon' };
    if (hours < 21) return { text: 'ശുഭ സായാഹ്നം', sub: 'Warm Evening' };
    return { text: 'ശുഭ രാത്രി', sub: 'Peaceful Night' };
  };

  const greeting = getGreeting();

  return (
    <header className="sticky top-0 z-30 bg-[#160d08]/95 backdrop-blur-md border-b-2 border-[#3d2315] px-4 md:px-8 py-2.5 flex items-center justify-between shadow-2xl relative before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#d97706]/40 before:to-transparent">
      {/* Branding - Vintage Tea Stall Signboard */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate && onNavigate('home')}>
          {/* Steaming Kattan Chaya Glass with Hanging Filament Lamp accent */}
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#d97706] via-[#92400e] to-[#451a03] flex items-center justify-center text-white shadow-lg shadow-amber-950/60 border-2 border-[#f59e0b]/40">
            {/* Animated rising steam wisps */}
            <span className="absolute -top-2.5 left-2 text-[11px] text-[#fef3c7] animate-steam-rise pointer-events-none">~</span>
            <span className="absolute -top-3.5 left-5 text-[13px] text-[#fde68a] animate-steam-rise pointer-events-none" style={{ animationDelay: '0.9s' }}>~</span>
            <span className="text-lg group-hover:scale-110 transition-transform">🍵</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-vintage text-base sm:text-lg font-bold text-[#fef3c7] tracking-wider drop-shadow">
                വൈകുന്നേരം
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#2a160d] border border-[#d97706]/60 text-[#fed7aa] uppercase tracking-widest shadow-inner">
                നാടൻ ചായക്കട
              </span>
            </div>
            <p className="text-[10px] text-[#c4aa95] font-malayalam tracking-wider leading-tight hidden xs:block">
              തട്ടിലെ പഴയ റേഡിയോ • ചാറ്റൽ മഴ • കട്ടൻ ചായ
            </p>
          </div>
        </div>

        {/* Vintage Malayalam Daily Tear Calendar snippet */}
        <div
          onClick={() => setShowCalendarQuote(prev => !prev)}
          className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-[#3a2013] cursor-pointer group select-none relative"
          title="Click to tear off today's Malayalam tea-stall proverb"
        >
          <div className="w-8 h-8 rounded-lg bg-[#27140b] border border-[#d97706]/40 flex flex-col items-center justify-center text-center shadow-inner group-hover:border-[#f59e0b] transition-colors">
            <span className="text-[7px] font-mono uppercase text-[#d97706] font-bold leading-none">DAY</span>
            <span className="text-xs font-bold text-[#fdf6e7] leading-none mt-0.5">17</span>
          </div>
          <div>
            <span className="font-malayalam text-xs font-bold text-[#fed7aa] block leading-tight group-hover:text-white transition-colors">
              {greeting.text} — ചായക്കടയിലേക്ക് സ്വാഗതം
            </span>
            <span className="text-[10px] font-sans text-[#a8907e]">113 Malayalam Cassettes • Vintage Vault</span>
          </div>

          {/* Interactive Tear-off Proverb Popover */}
          {showCalendarQuote && (
            <div className="absolute top-11 left-4 z-50 w-72 p-3 rounded-xl bg-[#201109] border border-[#d97706]/60 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between text-[8px] font-mono text-[#d97706] uppercase tracking-wider mb-1">
                <span>ഇന്നത്തെ പഴഞ്ചൊല്ല് (DAILY PROVERB)</span>
                <span>✕</span>
              </div>
              <p className="font-malayalam text-xs text-[#fef3c7] leading-relaxed">
                "ചായ ചൂടോടെ കുടിക്കണം, പാട്ട് മനസ്സോടെ കേൾക്കണം; പഴയ ഓർമ്മകൾ എന്നും പുതുമഴ പോലെയാണ്."
              </p>
              <span className="text-[9px] text-[#a88a74] block mt-1 font-mono">
                — ചായക്കട സന്ധ്യാ വർത്തമാനം
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs (Center) - Styled like vintage wooden plaque toggles */}
      {onNavigate && (
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-[#120a06] rounded-xl border border-[#382014] shadow-inner">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentTab === 'home'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-md shadow-amber-950/50 border border-[#f59e0b]/30'
                : 'text-[#baa290] hover:text-[#fdf6e7] hover:bg-[#1f120a]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onNavigate('library')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentTab === 'library'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-md shadow-amber-950/50 border border-[#f59e0b]/30'
                : 'text-[#baa290] hover:text-[#fdf6e7] hover:bg-[#1f120a]'
            }`}
          >
            <Library className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Cassettes (113)</span>
          </button>

          <button
            onClick={() => onNavigate('playlists')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentTab === 'playlists' || currentTab === 'playlist-detail'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-md shadow-amber-950/50 border border-[#f59e0b]/30'
                : 'text-[#baa290] hover:text-[#fdf6e7] hover:bg-[#1f120a]'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Playlists</span>
          </button>
        </div>
      )}
    </header>
  );
}

export function MobileNav({ currentTab, mobileViewPane, onNavigate }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠', malayalam: 'ഹോം' },
    { id: 'library', label: 'Songs', icon: '🎵', malayalam: 'പാട്ടുകൾ' },
    { id: 'atmosphere', label: 'Ambience', icon: '🍵', malayalam: 'അന്തരീക്ഷം' },
    { id: 'playlists', label: 'Playlists', icon: '📜', malayalam: 'ലിസ്റ്റ്' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-14 bg-[#140b07] border-t-2 border-[#3d2315] px-2 flex justify-around items-center shadow-[0_-8px_25px_rgba(0,0,0,0.95)]">
      {tabs.map((tab) => {
        const isActive = tab.id === 'atmosphere'
          ? mobileViewPane === 'atmosphere'
          : mobileViewPane === 'songs' && (currentTab === tab.id || (tab.id === 'home' && currentTab === 'home'));

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
              isActive
                ? 'text-[#fef3c7] font-bold bg-[#29150c] border border-[#d97706]/50 shadow-inner'
                : 'text-[#8c7462] hover:text-[#deb17a]'
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span className="text-[10px] font-malayalam mt-0.5 leading-none font-bold">{tab.malayalam}</span>
          </button>
        );
      })}
    </nav>
  );
}
