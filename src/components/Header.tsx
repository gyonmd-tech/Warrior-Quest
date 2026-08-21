import React from 'react';
import { AppSettings, UserProfile } from '../types';
import { playClickSound, playHoverSound, setSoundEnabled } from '../utils/audio';
import { useRealTime } from '../utils/useRealTime';

interface HeaderProps {
  user: UserProfile;
  settings: AppSettings;
  onOpenHeroModal?: () => void;
  onOpenSettings?: () => void;
  onOpenTrophies?: () => void;
  onOpenEnergyModal?: () => void;
  onToggleSound?: (enabled: boolean) => void;
  onLogout?: () => void;
  claimableTrophiesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  settings,
  onOpenHeroModal,
  onOpenSettings,
  onOpenTrophies,
  onOpenEnergyModal,
  onToggleSound,
  onLogout,
  claimableTrophiesCount = 0,
}) => {
  const { timeString, shortDate, formattedResetCountdown } = useRealTime();
  const energyPercent = Math.min(100, Math.round((user.energy / user.maxEnergy) * 100));

  const handleSoundToggle = () => {
    const next = !settings.soundEnabled;
    setSoundEnabled(next);
    if (onToggleSound) onToggleSound(next);
    if (next) playClickSound();
  };

  return (
    <header className="bg-white p-3.5 sm:p-4 rounded-none chunky-border chunky-shadow mb-5 select-none relative overflow-hidden">
      {/* Decorative top accent stripes */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ff0055] via-[#ffd000] via-[#39ff14] to-[#00f5ff]" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 pt-1">
        {/* App Branding & Hero Identity */}
        <div
          onClick={() => {
            playClickSound();
            if (onOpenHeroModal) onOpenHeroModal();
          }}
          onMouseEnter={() => playHoverSound()}
          className="flex items-center gap-3 cursor-pointer group"
          title="Klik untuk membuka Profil Hero"
        >
          <div className="w-11 h-11 bg-gradient-to-br from-[#ff0055] to-[#b9003f] chunky-border flex items-center justify-center text-white shadow-[2.5px_2.5px_0px_#1b1214] group-hover:scale-105 group-hover:rotate-[-2deg] transition-all shrink-0">
            <span
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              swords
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-pixel text-[8px] tracking-wider text-[#ff0055] font-bold block leading-none">
                WARRIOR QUEST
              </span>
              <span className="font-pixel text-[7px] bg-[#39ff14] text-[#1b1214] px-1.5 py-0.5 chunky-border font-bold shadow-[1.5px_1.5px_0px_#1b1214]">
                LVL {user.level}
              </span>
              <span className="font-pixel text-[6.5px] bg-[#1b1214] text-[#39ff14] px-1.5 py-0.5 chunky-border font-bold shadow-[1px_1px_0px_#1b1214] ml-auto sm:ml-0">
                🕒 {timeString}
              </span>
            </div>
            <h1 className="font-headline font-bold text-xl sm:text-2xl text-[#1b1214] leading-tight group-hover:text-[#ff0055] transition-colors flex items-center gap-1.5">
              <span>{user.name}</span>
              <span className="text-xs font-normal text-[#805b60] hidden md:inline">
                ({user.characterClass})
              </span>
            </h1>
          </div>
        </div>

        {/* Vital Quick Resource Bar & Action Shortcuts */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Energy Pill */}
          <div
            onClick={() => {
              playClickSound();
              if (onOpenEnergyModal) onOpenEnergyModal();
            }}
            onMouseEnter={() => playHoverSound()}
            title="Focus Energy - Klik untuk Isi Ulang"
            className="flex items-center gap-1.5 bg-[#fff6f8] hover:bg-[#ffe2e6] px-2.5 py-1.5 chunky-border cursor-pointer arcade-btn text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[#007d7a] text-[17px] animate-pulse">
              bolt
            </span>
            <div className="w-14 h-3 bg-white chunky-border overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#00f5ff] to-[#39ff14]"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
            <span className="font-pixel text-[8px] text-[#1b1214]">{user.energy}</span>
          </div>

          {/* Gold Coins */}
          <div
            onMouseEnter={() => playHoverSound()}
            className="flex items-center gap-1.5 bg-[#ffea79] px-2.5 py-1.5 chunky-border font-pixel text-[8px] text-[#1b1214] font-bold shadow-[2px_2px_0px_#1b1214]"
          >
            <span
              className="material-symbols-outlined text-[#ff6b00] text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              monetization_on
            </span>
            <span>{user.coins}</span>
          </div>

          {/* Gems */}
          <div
            onMouseEnter={() => playHoverSound()}
            className="flex items-center gap-1.5 bg-[#fcc2ca] px-2.5 py-1.5 chunky-border font-pixel text-[8px] text-[#ff0055] font-bold shadow-[2px_2px_0px_#1b1214]"
          >
            <span
              className="material-symbols-outlined text-[#ff0055] text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              diamond
            </span>
            <span>{user.gems}</span>
          </div>

          {/* Audio Quick Toggle */}
          <button
            onClick={handleSoundToggle}
            onMouseEnter={() => playHoverSound()}
            title={settings.soundEnabled ? 'Matikan Suara SFX' : 'Nyalakan Suara SFX'}
            className={`w-9 h-9 chunky-border flex items-center justify-center cursor-pointer arcade-btn transition-colors ${
              settings.soundEnabled
                ? 'bg-[#39ff14] text-[#1b1214]'
                : 'bg-white text-[#805b60]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {settings.soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Trophy & Achievements Shortcut */}
          {onOpenTrophies && (
            <button
              onClick={() => {
                playClickSound();
                onOpenTrophies();
              }}
              onMouseEnter={() => playHoverSound()}
              title="Buka Ruang Trofi & Prestasi"
              className="w-9 h-9 bg-[#ffd000] hover:bg-[#ffea79] text-[#1b1214] chunky-border flex items-center justify-center cursor-pointer arcade-btn relative"
            >
              <span
                className="material-symbols-outlined text-[19px] text-[#ff0055]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                emoji_events
              </span>
              {claimableTrophiesCount > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-[#ff0055] text-white font-pixel text-[6px] w-4 h-4 rounded-none chunky-border flex items-center justify-center font-bold animate-bounce shadow-[1px_1px_0px_#1b1214]">
                  !
                </span>
              )}
            </button>
          )}

          {/* Settings Shortcut */}
          {onOpenSettings && (
            <button
              onClick={() => {
                playClickSound();
                onOpenSettings();
              }}
              onMouseEnter={() => playHoverSound()}
              title="Buka Pengaturan"
              className="w-9 h-9 bg-[#00f5ff] hover:bg-[#39ff14] text-[#1b1214] chunky-border flex items-center justify-center cursor-pointer arcade-btn"
            >
              <span className="material-symbols-outlined text-[19px]">settings</span>
            </button>
          )}

          {/* Logout Shortcut */}
          {onLogout && (
            <button
              onClick={() => {
                playClickSound();
                onLogout();
              }}
              onMouseEnter={() => playHoverSound()}
              title="Keluar / Ganti Hero"
              className="w-9 h-9 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] chunky-border flex items-center justify-center arcade-btn cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
