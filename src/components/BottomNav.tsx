import React from 'react';
import { playClickSound, playHoverSound } from '../utils/audio';

export type NavTabType = 'home' | 'quests' | 'calendar' | 'rewards' | 'hero' | 'trophies' | 'settings';

interface BottomNavProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
  activeQuestsCount?: number;
  claimableRewardsCount?: number;
  claimableTrophiesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  activeQuestsCount = 0,
  claimableRewardsCount = 0,
}) => {
  const tabs = [
    {
      id: 'home' as const,
      label: 'Realm',
      icon: 'castle',
      badge: null,
      activeBg: 'bg-[#ffea79]',
    },
    {
      id: 'quests' as const,
      label: 'Quests',
      icon: 'swords',
      badge: activeQuestsCount > 0 ? activeQuestsCount : null,
      activeBg: 'bg-[#39ff14]',
    },
    {
      id: 'calendar' as const,
      label: 'Kalender',
      icon: 'calendar_month',
      badge: null,
      activeBg: 'bg-[#00f5ff]',
    },
    {
      id: 'rewards' as const,
      label: 'Reward',
      icon: 'card_giftcard',
      badge: claimableRewardsCount > 0 ? claimableRewardsCount : null,
      activeBg: 'bg-[#ffd000]',
    },
    {
      id: 'hero' as const,
      label: 'Hero',
      icon: 'person',
      badge: null,
      activeBg: 'bg-[#ff0055]',
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-[3.5px] border-[#1b1214] shadow-[0px_-4px_0px_0px_#fcc2ca] p-1.5 sm:p-2">
      <div className="max-w-2xl mx-auto grid grid-cols-5 gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                onTabChange(tab.id);
              }}
              onMouseEnter={() => playHoverSound()}
              className={`py-1.5 sm:py-2 px-0.5 flex flex-col items-center justify-center chunky-border transition-all cursor-pointer relative select-none arcade-btn ${
                isActive
                  ? `${tab.activeBg} ${tab.id === 'hero' ? 'text-white' : 'text-[#1b1214]'} font-bold shadow-[2px_2px_0px_#1b1214] -translate-y-0.5`
                  : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
              }`}
            >
              {tab.badge && (
                <span className="absolute -top-2 -right-1 bg-[#ff0055] text-white font-pixel text-[6.5px] sm:text-[7px] min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-0.5 rounded-none chunky-border flex items-center justify-center font-bold animate-bounce shadow-[1px_1px_0px_#1b1214]">
                  {tab.badge}
                </span>
              )}

              <span
                className="material-symbols-outlined text-[19px] sm:text-[22px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className="font-pixel text-[6.5px] sm:text-[7.5px] mt-0.5 tracking-wider truncate max-w-full font-bold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
