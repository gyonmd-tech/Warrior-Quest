import React from 'react';
import { UserProfile } from '../types';
import { playClickSound, playHoverSound } from '../utils/audio';

interface StatusRowProps {
  user: UserProfile;
  onOpenEnergyModal: () => void;
}

export const StatusRow: React.FC<StatusRowProps> = ({ user, onOpenEnergyModal }) => {
  const xpPercent = Math.min(100, Math.round((user.currentXp / user.maxXp) * 100));
  const energyPercent = Math.min(100, Math.round((user.energy / user.maxEnergy) * 100));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 select-none">
      {/* Level & XP Gauge */}
      <div
        onMouseEnter={() => playHoverSound()}
        className="bg-white p-3.5 sm:p-4 lg:p-5 chunky-border chunky-shadow flex flex-col justify-between card-hover-pop min-h-[110px]"
      >
        <div className="flex justify-between items-center text-[#ff0055] font-bold">
          <span className="font-pixel text-[8px] sm:text-[9px] uppercase">Level {user.level}</span>
          <span className="font-pixel text-[8px] sm:text-[9px]">{xpPercent}%</span>
        </div>
        <div className="w-full h-4 sm:h-5 bg-[#ffe2e6] chunky-border overflow-hidden my-1.5 p-0.5">
          <div
            className="h-full bg-[#00f5ff] progress-stripes transition-all duration-300"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        <div className="flex justify-between font-pixel text-[7px] sm:text-[7.5px] text-[#4a3034] font-bold">
          <span>BATTLE XP</span>
          <span>
            {user.currentXp} / {user.maxXp}
          </span>
        </div>
      </div>

      {/* Energy / Stamina */}
      <div
        onClick={() => {
          playClickSound();
          onOpenEnergyModal();
        }}
        onMouseEnter={() => playHoverSound()}
        className="bg-white p-3.5 sm:p-4 lg:p-5 chunky-border chunky-shadow flex flex-col justify-between cursor-pointer card-hover-pop transition-all min-h-[110px]"
      >
        <div className="flex justify-between items-center text-[#007d7a] font-bold">
          <span className="font-pixel text-[8px] sm:text-[9px] uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">bolt</span>
            Energi Fokus
          </span>
          <span className="font-pixel text-[8px] sm:text-[9px]">{energyPercent}%</span>
        </div>
        <div className="w-full h-4 sm:h-5 bg-[#ffe2e6] chunky-border overflow-hidden my-1.5 p-0.5">
          <div
            className="h-full bg-[#39ff14] progress-stripes transition-all duration-300"
            style={{ width: `${energyPercent}%` }}
          />
        </div>
        <div className="flex justify-between font-pixel text-[7px] sm:text-[7.5px] text-[#4a3034] font-bold">
          <span className="underline decoration-dotted text-[#ff0055]">+ Isi Ulang</span>
          <span>
            {user.energy} / {user.maxEnergy}
          </span>
        </div>
      </div>

      {/* Daily Habit Streak */}
      <div
        onMouseEnter={() => playHoverSound()}
        className="bg-white p-3.5 sm:p-4 lg:p-5 chunky-border chunky-shadow flex items-center justify-between card-hover-pop min-h-[110px]"
      >
        <div>
          <span className="font-pixel text-[8px] sm:text-[8.5px] text-[#ff6b00] uppercase block font-bold">
            Streak Harian
          </span>
          <span className="font-headline font-bold text-2xl sm:text-3xl text-[#1b1214] leading-none mt-1 block">
            {user.streakDays} Hari
          </span>
          <span className="font-pixel text-[7px] sm:text-[7.5px] text-[#007d7a] mt-1 block font-bold">
            🔥 Multiplier 1.5x
          </span>
        </div>
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ffea79] chunky-border flex items-center justify-center text-[#ff0055] shadow-[2.5px_2.5px_0px_#1b1214] shrink-0">
          <span
            className="material-symbols-outlined text-[28px] sm:text-[32px] flame-burn"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_fire_department
          </span>
        </div>
      </div>

      {/* Gold & Gems Wallet */}
      <div
        onMouseEnter={() => playHoverSound()}
        className="bg-white p-3.5 sm:p-4 lg:p-5 chunky-border chunky-shadow flex flex-col justify-center gap-2 card-hover-pop min-h-[110px]"
      >
        <div className="flex items-center justify-between font-pixel text-[8px] sm:text-[8.5px] bg-[#ffea79] px-3 py-1.5 chunky-border text-[#1b1214] font-bold shadow-[1.5px_1.5px_0px_#1b1214]">
          <span className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-[16px] text-[#ff6b00]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              monetization_on
            </span>
            Koin Gold
          </span>
          <span>{user.coins}</span>
        </div>
        <div className="flex items-center justify-between font-pixel text-[8px] sm:text-[8.5px] bg-[#fcc2ca] px-3 py-1.5 chunky-border text-[#ff0055] font-bold shadow-[1.5px_1.5px_0px_#1b1214]">
          <span className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              diamond
            </span>
            Permata
          </span>
          <span>{user.gems}</span>
        </div>
      </div>
    </div>
  );
};
