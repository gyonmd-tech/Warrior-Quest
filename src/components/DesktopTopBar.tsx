import React from 'react';
import { AppSettings, UserProfile } from '../types';
import { playClickSound, playHoverSound, setSoundEnabled } from '../utils/audio';
import { useRealTime } from '../utils/useRealTime';
import { NavTabType } from './BottomNav';

interface DesktopTopBarProps {
  activeTab: NavTabType;
  user: UserProfile;
  settings: AppSettings;
  claimableTrophiesCount?: number;
  onOpenEnergyModal: () => void;
  onOpenHeroModal: () => void;
  onOpenSettings: () => void;
  onOpenTrophies: () => void;
  onOpenEconomyModal?: () => void;
  onToggleSound: (enabled: boolean) => void;
}

const TAB_TITLES: Record<NavTabType, { title: string; subtitle: string; icon: string }> = {
  home: {
    title: 'Sanctuary Realm & Markas Ksatria',
    subtitle: 'Pantau status raid boss, streak harian, dan ringkasan produktivitas hero.',
    icon: 'castle',
  },
  quests: {
    title: 'Papan Quest & Misi Tempur',
    subtitle: 'Kalahkan kemalasan melalui duel fokus dan kumpulkan battle XP.',
    icon: 'swords',
  },
  calendar: {
    title: 'Kalender & Matriks Analitik',
    subtitle: 'Evaluasi kurva pertumbuhan XP harian dan grafik distribusi atribut.',
    icon: 'calendar_month',
  },
  rewards: {
    title: 'Vault Hadiah Apresiasi Diri (Self-Reward)',
    subtitle: 'Tukarkan pencapaian XP dengan hadiah dunia nyata tanpa rasa bersalah.',
    icon: 'card_giftcard',
  },
  hero: {
    title: 'Karakter Hero & Armory Perlengkapan',
    subtitle: 'Kustomisasi avatar, upgrade stat matrix, dan belanja senjata di toko pandai besi.',
    icon: 'shield_person',
  },
  trophies: {
    title: 'Aula Kehormatan & Prestise Trofi',
    subtitle: 'Koleksi medali keberhasilan dan klaim hadiah permata langka.',
    icon: 'military_tech',
  },
  settings: {
    title: 'Pusat Konfigurasi & Soundboard',
    subtitle: 'Kustomisasi audio 8-bit, timer duel fokus, dan ekspor/impor cadangan.',
    icon: 'settings',
  },
};

export const DesktopTopBar: React.FC<DesktopTopBarProps> = ({
  activeTab,
  user,
  settings,
  claimableTrophiesCount = 0,
  onOpenEnergyModal,
  onOpenHeroModal,
  onOpenSettings,
  onOpenTrophies,
  onToggleSound,
}) => {
  const tabInfo = TAB_TITLES[activeTab] || TAB_TITLES.home;
  const { timeString, dateString, formattedResetCountdown } = useRealTime();
  const energyPercent = Math.min(100, Math.round((user.energy / user.maxEnergy) * 100));

  const handleSoundToggle = () => {
    const next = !settings.soundEnabled;
    setSoundEnabled(next);
    onToggleSound(next);
    if (next) playClickSound();
  };

  return (
    <header className="hidden lg:flex flex-wrap items-center justify-between gap-4 bg-white p-4.5 xl:p-5 chunky-border chunky-shadow mb-6 select-none relative overflow-hidden">
      {/* Decorative top accent stripes */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ff0055] via-[#ffd000] via-[#39ff14] to-[#00f5ff]" />

      {/* Left: Active Screen Title & Subtitle */}
      <div className="flex items-center gap-4 pt-1 min-w-0">
        <div className="w-12 h-12 bg-[#ffea79] chunky-border flex items-center justify-center text-[#1b1214] shadow-[3px_3px_0px_#1b1214] shrink-0">
          <span
            className="material-symbols-outlined text-[26px] text-[#ff0055]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {tabInfo.icon}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-headline font-bold text-2xl text-[#1b1214] leading-tight truncate">
              {tabInfo.title}
            </h2>
            <span className="font-pixel text-[7.5px] bg-[#39ff14] text-[#1b1214] px-2 py-0.5 chunky-border font-bold shrink-0 shadow-[1px_1px_0px_#1b1214]">
              AKTIF
            </span>
          </div>
          <p className="font-body text-xs sm:text-sm text-[#805b60] mt-0.5 truncate flex items-center gap-2">
            <span>{tabInfo.subtitle}</span>
          </p>
        </div>
      </div>

      {/* Right: Quick Resources & Header Shortcuts */}
      <div className="flex items-center gap-2.5 pt-1 flex-wrap">
        {/* Real-time Clock Pill */}
        <div
          title="Waktu Real-Time Sinkron"
          className="flex items-center gap-1.5 bg-[#1b1214] text-[#39ff14] px-3 py-2 chunky-border font-pixel text-[8.5px] font-bold shadow-[2px_2px_0px_#1b1214]"
        >
          <span className="material-symbols-outlined text-[16px] text-[#ffea79] animate-pulse">
            schedule
          </span>
          <span>{timeString}</span>
          <span className="text-[#805b60] hidden xl:inline">&bull;</span>
          <span className="text-white hidden xl:inline">{dateString}</span>
        </div>

        {/* Daily Reset Countdown */}
        <div
          title="Hitung Mundur Reset Quest Harian (00:00:00)"
          className="flex items-center gap-1.5 bg-[#fff6f8] px-3 py-2 chunky-border font-pixel text-[8px] text-[#1b1214] font-bold shadow-[2px_2px_0px_#1b1214]"
        >
          <span className="material-symbols-outlined text-[16px] text-[#00f5ff]">
            hourglass_top
          </span>
          <span className="text-[#805b60] hidden xl:inline">RESET:</span>
          <span className="text-[#ff0055]">{formattedResetCountdown}</span>
        </div>

        {/* Streak Indicator */}
        <div
          onMouseEnter={() => playHoverSound()}
          title="Streak Disiplin Ksatria"
          className="flex items-center gap-1.5 bg-[#fff6f8] px-3 py-2 chunky-border font-pixel text-[8.5px] text-[#1b1214] font-bold shadow-[2px_2px_0px_#1b1214]"
        >
          <span
            className="material-symbols-outlined text-[#ff6b00] text-[18px] flame-burn"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_fire_department
          </span>
          <span>{user.streakDays} HARI</span>
        </div>

        {/* Energy Pill */}
        <div
          onClick={() => {
            playClickSound();
            onOpenEnergyModal();
          }}
          onMouseEnter={() => playHoverSound()}
          title="Focus Energy - Klik untuk Isi Ulang"
          className="flex items-center gap-2 bg-[#fff6f8] hover:bg-[#ffe2e6] px-3 py-2 chunky-border cursor-pointer arcade-btn text-xs font-bold shadow-[2px_2px_0px_#1b1214]"
        >
          <span className="material-symbols-outlined text-[#007d7a] text-[18px] animate-pulse">
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
          onClick={() => {
            playClickSound();
            if (onOpenEconomyModal) onOpenEconomyModal();
          }}
          onMouseEnter={() => playHoverSound()}
          title="Koin Emas - Klik untuk Panduan & Toko"
          className="flex items-center gap-1.5 bg-[#ffea79] hover:bg-[#ffd000] px-3 py-2 chunky-border font-pixel text-[8.5px] text-[#1b1214] font-bold shadow-[2px_2px_0px_#1b1214] cursor-pointer arcade-btn"
        >
          <span
            className="material-symbols-outlined text-[#ff6b00] text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            monetization_on
          </span>
          <span>{user.coins}</span>
        </div>

        {/* Gems */}
        <div
          onClick={() => {
            playClickSound();
            if (onOpenEconomyModal) onOpenEconomyModal();
          }}
          onMouseEnter={() => playHoverSound()}
          title="Permata Langka - Klik untuk Panduan & Toko"
          className="flex items-center gap-1.5 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white px-3 py-2 chunky-border font-pixel text-[8.5px] text-[#ff0055] font-bold shadow-[2px_2px_0px_#1b1214] cursor-pointer arcade-btn"
        >
          <span
            className="material-symbols-outlined text-[18px]"
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
          className={`w-10 h-10 chunky-border flex items-center justify-center cursor-pointer arcade-btn transition-colors shadow-[2px_2px_0px_#1b1214] ${
            settings.soundEnabled
              ? 'bg-[#39ff14] text-[#1b1214]'
              : 'bg-white text-[#805b60]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {settings.soundEnabled ? 'volume_up' : 'volume_off'}
          </span>
        </button>

        {/* Trophy & Achievements Shortcut */}
        <button
          onClick={() => {
            playClickSound();
            onOpenTrophies();
          }}
          onMouseEnter={() => playHoverSound()}
          title="Buka Ruang Trofi"
          className="w-10 h-10 bg-[#ffd000] hover:bg-[#ffea79] text-[#1b1214] chunky-border flex items-center justify-center cursor-pointer arcade-btn relative shadow-[2px_2px_0px_#1b1214]"
        >
          <span
            className="material-symbols-outlined text-[20px] text-[#ff0055]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            emoji_events
          </span>
          {claimableTrophiesCount > 0 && (
            <span className="absolute -top-1.5 -right-1 bg-[#ff0055] text-white font-pixel text-[6.5px] w-4.5 h-4.5 chunky-border flex items-center justify-center font-bold animate-bounce shadow-[1px_1px_0px_#1b1214]">
              !
            </span>
          )}
        </button>

        {/* Settings Shortcut */}
        <button
          onClick={() => {
            playClickSound();
            onOpenSettings();
          }}
          onMouseEnter={() => playHoverSound()}
          title="Buka Pengaturan"
          className="w-10 h-10 bg-[#00f5ff] hover:bg-[#39ff14] text-[#1b1214] chunky-border flex items-center justify-center cursor-pointer arcade-btn shadow-[2px_2px_0px_#1b1214]"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>

        {/* Hero Avatar Quick Action */}
        <div
          onClick={() => {
            playClickSound();
            onOpenHeroModal();
          }}
          onMouseEnter={() => playHoverSound()}
          title="Buka Profil Hero"
          className="w-10 h-10 bg-[#1b1214] p-0.5 chunky-border border-[#39ff14] shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform ml-1 shadow-[2px_2px_0px_#1b1214]"
        >
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
};
