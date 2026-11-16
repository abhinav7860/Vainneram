import React from 'react';
import { LogOut, User, Plus, CloudRain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAmbience } from '../context/AmbienceContext';

export function Navbar({ onAddClick }) {
  const { user, logout } = useAuth();
  const { isEnabled: isAmbienceEnabled, setIsAmbienceOpen } = useAmbience();

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
    <header className="sticky top-0 z-30 stall-glass border-b border-[#1c362b] px-4 md:px-8 py-3 flex items-center justify-between">
      {/* Mobile Branding */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <span className="text-xl">🍵</span>
          <span className="font-serif-vintage text-base font-bold text-[#f7f2e8]">വൈകുന്നേരം</span>
        </div>

        {/* Desktop Greeting */}
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <span className="font-malayalam text-base font-semibold text-[#deb17a]">
              {greeting.text}, {user?.display_name || user?.username}
            </span>
            <span className="text-xs text-[#718c7e] font-serif-vintage">({greeting.sub})</span>
          </div>
          <p className="text-[11px] text-[#789485]">
            A cup of warm kattan chaya and your favorite tunes.
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Ambience quick pill */}
        <button
          onClick={() => setIsAmbienceOpen(true)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
            isAmbienceEnabled
              ? 'bg-[#183628] border-[#d9822b] text-[#e69a38]'
              : 'bg-[#11231b] border-[#1f3a2f] text-[#8ea498] hover:text-[#f7f2e8]'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5 text-[#60a5fa]" />
          <span className="hidden sm:inline">Rain Sound</span>
          <span className="font-malayalam text-[10px] text-[#deb17a] hidden lg:inline">മഴ</span>
        </button>

        {/* Quick Add Music Button */}
        <button
          onClick={onAddClick}
          className="px-3 py-1.5 rounded-xl bg-[#d9822b] hover:bg-[#e69a38] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-black/30 transition-transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Music</span>
        </button>

        {/* User profile & Logout */}
        <div className="flex items-center gap-1 pl-2 border-l border-[#203c30]">
          <div className="w-8 h-8 rounded-full bg-[#162e24] border border-[#234536] flex items-center justify-center text-xs text-[#deb17a] font-semibold">
            {user?.display_name ? user.display_name.slice(0, 1).toUpperCase() : 'U'}
          </div>
          <button
            onClick={logout}
            className="p-2 text-[#7f978a] hover:text-[#e57373] hover:bg-[#1f1616] rounded-lg transition-colors"
            title="Sign out of personal library"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function MobileNav({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠', malayalam: 'ഹോം' },
    { id: 'library', label: 'Library', icon: '🎵', malayalam: 'പാട്ടുകൾ' },
    { id: 'playlists', label: 'Playlists', icon: '📻', malayalam: 'ലിസ്റ്റ്' },
    { id: 'add', label: 'Add', icon: '➕', malayalam: 'ചേർക്കുക' }
  ];

  return (
    <nav className="md:hidden fixed bottom-[65px] left-0 right-0 z-30 stall-glass-nav border-t border-[#1d372c] px-3 py-1.5 flex justify-around">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-center transition-all ${
              isActive ? 'text-[#e69a38]' : 'text-[#7d9487] hover:text-[#f7f2e8]'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="text-[10px] font-medium mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
