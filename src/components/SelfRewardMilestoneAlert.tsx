import React from 'react';
import confetti from 'canvas-confetti';
import { SelfReward } from '../types';
import { playClickSound, playRewardSound } from '../utils/audio';

interface SelfRewardMilestoneAlertProps {
  unlockedReward: SelfReward | null;
  onDismiss: () => void;
  onGoToRewards: () => void;
}

export const SelfRewardMilestoneAlert: React.FC<SelfRewardMilestoneAlertProps> = ({
  unlockedReward,
  onDismiss,
  onGoToRewards,
}) => {
  if (!unlockedReward) return null;

  const handleCelebrate = () => {
    playRewardSound();
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#39ff14', '#ffd000', '#00f5ff', '#ff0055'],
    });
    onGoToRewards();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md chunky-border chunky-shadow p-5 sm:p-6 text-center relative animate-in zoom-in duration-200 border-[#ff0055]">
        {/* Animated Celebration Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ffea79] chunky-border mx-auto flex items-center justify-center text-[#ff0055] shadow-[3px_3px_0px_#1b1214] mb-3 animate-bounce">
          <span className="material-symbols-outlined text-[36px] sm:text-[44px]">
            {unlockedReward.icon || 'card_giftcard'}
          </span>
        </div>

        <span className="inline-block bg-[#39ff14] text-[#1b1214] font-pixel text-[8px] sm:text-[9px] px-3 py-1 chunky-border font-bold uppercase shadow-[2px_2px_0px_#1b1214] mb-2">
          🎉 TARGET EXP TERCAPAI!
        </span>

        <h3 className="font-headline text-2xl sm:text-3xl font-bold text-[#ff0055] leading-tight">
          Self-Reward Siap Dinikmati!
        </h3>

        <div className="bg-[#fff6f8] p-3 chunky-border my-3 text-left">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[8px] bg-[#ffd000] px-1.5 py-0.5 chunky-border font-bold">
              Target {unlockedReward.targetXp} XP
            </span>
            <span className="font-pixel text-[7.5px] text-[#007d7a] font-bold">
              ★ Terbuka Hari Ini
            </span>
          </div>
          <h4 className="font-headline font-bold text-base text-[#1b1214] mt-1.5">
            {unlockedReward.title}
          </h4>
          {unlockedReward.description && (
            <p className="font-body text-xs text-[#4a3034] mt-0.5">
              {unlockedReward.description}
            </p>
          )}
        </div>

        <p className="font-body text-xs text-[#4a3034] mb-4">
          Kerja keras dan disiplin Anda telah membuahkan hasil. Ambil waktu sejenak untuk mengapresiasi diri Anda!
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              playClickSound();
              onDismiss();
            }}
            className="py-2.5 px-4 bg-[#fcc2ca] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn font-bold cursor-pointer"
          >
            NANTI SAJA
          </button>
          <button
            onClick={handleCelebrate}
            className="flex-1 py-3 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[9px] chunky-border arcade-btn font-bold cursor-pointer shadow-[3px_3px_0px_#1b1214] flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">celebration</span>
            BUKA TAB REWARD & KLAIM!
          </button>
        </div>
      </div>
    </div>
  );
};
