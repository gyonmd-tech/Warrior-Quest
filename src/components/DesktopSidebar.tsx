import React from 'react';
import { AppSettings, UserProfile } from '../types';
import { playClickSound, playHoverSound, setSoundEnabled } from '../utils/audio';
import { NavTabType } from './BottomNav';

interface DesktopSidebarProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
  user: UserProfile;
  settings: AppSettings;
  activeQuestsCount?: number;
  claimableRewardsCount?: number;
  claimableTrophiesCount?: number;
  onOpenNewQuestModal: () => void;
  onOpenEnergyModal: () => void;
  onOpenLuckyWheel?: () => void;
  onToggleSound: (enabled: boolean) => void;
  onLogout: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  user,
  settings,
  activeQuestsCount = 0,
  claimableRewardsCount = 0,
  claimableTrophiesCount = 0,
  onOpenNewQuestModal,
  onOpenEnergyModal,
  onOpenLuckyWheel,
  onToggleSound,
  onLogout,
}) => {
  const xpPercent = Math.min(100, Math.round((user.currentXp / user.maxXp) * 100));
  const energyPercent = Math.min(100, Math.round((user.energy / user.maxEnergy) * 100));

  const navItems = [
    {
      id: 'home' as const,
      label: 'Realm Beranda',
      icon: 'castle',
      badge: null,
      badgeColor: 'bg-[#ffea79]',
      activeBg: 'bg-[#ffea79]',
      activeText: 'text-[#1b1214]',
    },
    {
      id: 'quests' as const,
      label: 'Papan Quest',
      icon: 'swords',
      badge: activeQuestsCount > 0 ? `${activeQuestsCount} Misi` : null,
      badgeColor: 'bg-[#39ff14] text-[#1b1214]',
      activeBg: 'bg-[#39ff14]',
      activeText: 'text-[#1b1214]',
    },
    {
      id: 'calendar' as const,
      label: 'Kalender & Analitik',
      icon: 'calendar_month',
      badge: null,
      badgeColor: 'bg-[#00f5ff] text-[#1b1214]',
      activeBg: 'bg-[#00f5ff]',
      activeText: 'text-[#1b1214]',
    },
    {
      id: 'rewards' as const,
      label: 'Self-Reward Vault',
      icon: 'card_giftcard',
      badge: claimableRewardsCount > 0 ? `${claimableRewardsCount} Siap!` : null,
      badgeColor: 'bg-[#ffd000] text-[#1b1214] animate-pulse',
      activeBg: 'bg-[#ffd000]',
      activeText: 'text-[#1b1214]',
    },
    {
      id: 'hero' as const,
      label: 'Hero & Armory',
      icon: 'person',
      badge: `Lvl ${user.level}`,
      badgeColor: 'bg-[#ff0055] text-white',
      activeBg: 'bg-[#ff0055]',
      activeText: 'text-white',
    },
    {
      id: 'trophies' as const,
      label: 'Ruang Trofi',
      icon: 'emoji_events',
      badge: claimableTrophiesCount > 0 ? '★ Klaim' : null,
      badgeColor: 'bg-[#ff0055] text-white animate-bounce',
      activeBg: 'bg-[#ffd0d7]',
      activeText: 'text-[#1b1214]',
    },
    {
      id: 'settings' as const,
      label: 'Pengaturan Game',
      icon: 'settings',
      badge: null,
      badgeColor: 'bg-white',
      activeBg: 'bg-[#fcc2ca]',
      activeText: 'text-[#1b1214]',
    },
  ];

  const handleSoundToggle = () => {
    const next = !settings.soundEnabled;
    setSoundEnabled(next);
    onToggleSound(next);
    if (next) playClickSound();
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-white chunky-border chunky-shadow p-4 xl:p-5 select-none shrink-0 sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto no-scrollbar justify-between">
      {/* Top Branding Section */}
      <div>
        <div className="flex items-center gap-3 pb-3.5 mb-3.5 border-b-2 border-[#1b1214]">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ff0055] to-[#b9003f] chunky-border flex items-center justify-center text-white shadow-[2.5px_2.5px_0px_#1b1214] shrink-0">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              swords
            </span>
          </div>
          <div className="min-w-0">
            <span className="font-pixel text-[8px] tracking-wider text-[#ff0055] font-bold block leading-none">
              WARRIOR QUEST LOG
            </span>
            <span className="font-headline font-bold text-xl text-[#1b1214] leading-tight block truncate mt-0.5">
              Command Center
            </span>
          </div>
        </div>

        {/* Hero Mini HUD Card */}
        <div
          onClick={() => {
            playClickSound();
            onTabChange('hero');
          }}
          onMouseEnter={() => playHoverSound()}
          title="Klik untuk membuka Profil Hero"
          className="bg-gradient-to-br from-[#ffe2e6] to-[#ffd0d7] p-3.5 chunky-border mb-3.5 cursor-pointer hover:shadow-[4px_4px_0px_#1b1214] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-[#1b1214] p-0.5 chunky-border border-[#39ff14] shrink-0 overflow-hidden group-hover:scale-105 transition-transform shadow-[2px_2px_0px_#1b1214]">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-pixel text-[7.5px] bg-[#39ff14] text-[#1b1214] px-1.5 py-0.5 chunky-border font-bold shadow-[1px_1px_0px_#1b1214]">
                  LVL {user.level}
                </span>
                <span className="font-pixel text-[7px] bg-[#ff0055] text-white px-1.5 py-0.5 chunky-border uppercase truncate font-bold shadow-[1px_1px_0px_#1b1214]">
                  {user.characterClass}
                </span>
              </div>
              <h4 className="font-headline font-bold text-base text-[#1b1214] truncate mt-1 group-hover:text-[#ff0055] transition-colors">
                {user.name}
              </h4>
            </div>
          </div>

          {/* Mini Gauges: XP & Energy */}
          <div className="mt-3 space-y-2 pt-2.5 border-t border-[#fcc2ca]">
            {/* XP Bar */}
            <div>
              <div className="flex justify-between font-pixel text-[7px] text-[#4a3034] mb-1 font-bold">
                <span>BATTLE XP</span>
                <span className="text-[#ff0055]">
                  {user.currentXp}/{user.maxXp} ({xpPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-white chunky-border overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#00f5ff] progress-stripes"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Energy Bar */}
            <div>
              <div className="flex justify-between font-pixel text-[7px] text-[#4a3034] mb-1 font-bold">
                <span className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px] text-[#007d7a]">bolt</span>
                  FOCUS ENERGY
                </span>
                <span className="text-[#007d7a]">
                  {user.energy}/{user.maxEnergy}
                </span>
              </div>
              <div className="w-full h-3 bg-white chunky-border overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#39ff14] progress-stripes"
                  style={{ width: `${energyPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gold & Gems Mini Balances */}
          <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-[#fcc2ca]">
            <div className="flex items-center gap-1.5 bg-[#ffea79] px-2 py-1 chunky-border font-pixel text-[7.5px] text-[#1b1214] font-bold justify-center shadow-[1px_1px_0px_#1b1214]">
              <span
                className="material-symbols-outlined text-[14px] text-[#ff6b00]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                monetization_on
              </span>
              <span>{user.coins}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#fcc2ca] px-2 py-1 chunky-border font-pixel text-[7.5px] text-[#ff0055] font-bold justify-center shadow-[1px_1px_0px_#1b1214]">
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                diamond
              </span>
              <span>{user.gems}</span>
            </div>
          </div>
        </div>

        {/* Quick Action Button: + Quest Baru */}
        <button
          onClick={() => {
            playClickSound();
            onOpenNewQuestModal();
          }}
          onMouseEnter={() => playHoverSound()}
          className="w-full py-3 mb-3.5 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[9.5px] chunky-border arcade-btn flex items-center justify-center gap-2 font-bold cursor-pointer shadow-[3px_3px_0px_#1b1214]"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          + QUEST BARU
        </button>

        {/* Navigation List */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playClickSound();
                  onTabChange(item.id);
                }}
                onMouseEnter={() => playHoverSound()}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between chunky-border cursor-pointer transition-all arcade-btn text-left ${
                  isActive
                    ? `${item.activeBg} ${item.activeText} font-bold shadow-[3px_3px_0px_#1b1214] -translate-y-0.5`
                    : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="material-symbols-outlined text-[22px] shrink-0"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="font-headline font-bold text-sm truncate">
                    {item.label}
                  </span>
                </div>

                {item.badge && (
                  <span
                    className={`font-pixel text-[7px] px-2 py-0.5 chunky-border font-bold shrink-0 shadow-[1px_1px_0px_#1b1214] ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sidebar Footer Actions */}
      <div className="pt-3.5 mt-3.5 border-t-2 border-[#1b1214] space-y-2.5">
        {/* Festival Lucky Wheel Shortcut */}
        {onOpenLuckyWheel && (
          <button
            onClick={() => {
              playClickSound();
              onOpenLuckyWheel();
            }}
            onMouseEnter={() => playHoverSound()}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-[#ffd000] to-[#ffea79] hover:from-[#39ff14] hover:to-[#00f5ff] text-[#1b1214] font-pixel text-[7.5px] sm:text-[8px] chunky-border arcade-btn flex items-center justify-between font-bold cursor-pointer shadow-[2px_2px_0px_#1b1214] group"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-[#ff0055] group-hover:rotate-45 transition-transform">
                casino
              </span>
              <span>EVENT FESTIVAL</span>
            </div>
            <span className="font-pixel text-[6.5px] bg-[#ff0055] text-white px-1.5 py-0.5 chunky-border animate-pulse">
              1x FREE
            </span>
          </button>
        )}

        {/* Quick Energy Recharge Shortcut */}
        <button
          onClick={() => {
            playClickSound();
            onOpenEnergyModal();
          }}
          onMouseEnter={() => playHoverSound()}
          className="w-full py-2 px-3 bg-[#00f5ff] hover:bg-[#39ff14] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn flex items-center justify-center gap-2 font-bold cursor-pointer shadow-[2px_2px_0px_#1b1214]"
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          ISI ENERGI FOKUS
        </button>

        {/* SFX Audio & Logout */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSoundToggle}
            onMouseEnter={() => playHoverSound()}
            title={settings.soundEnabled ? 'Matikan SFX' : 'Nyalakan SFX'}
            className={`py-2 px-2 chunky-border font-pixel text-[7.5px] flex items-center justify-center gap-1.5 arcade-btn cursor-pointer font-bold shadow-[2px_2px_0px_#1b1214] ${
              settings.soundEnabled
                ? 'bg-[#39ff14] text-[#1b1214]'
                : 'bg-white text-[#805b60]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {settings.soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
            <span>SFX {settings.soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onLogout();
            }}
            onMouseEnter={() => playHoverSound()}
            title="Keluar / Ganti Hero"
            className="py-2 px-2 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] chunky-border font-pixel text-[7.5px] flex items-center justify-center gap-1.5 arcade-btn cursor-pointer font-bold shadow-[2px_2px_0px_#1b1214]"
          >
            <span className="material-symbols-outlined text-[15px]">logout</span>
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
