import React from 'react';
import confetti from 'canvas-confetti';
import { DailyReward } from '../types';
import { playCoinSound, playHoverSound, playRewardSound } from '../utils/audio';

interface DailyRewardsRowProps {
  rewards: DailyReward[];
  onClaimReward: (day: number) => void;
}

export const DailyRewardsRow: React.FC<DailyRewardsRowProps> = ({
  rewards,
  onClaimReward,
}) => {
  const handleClaim = (reward: DailyReward) => {
    if (reward.claimed || reward.label.startsWith('Day')) return;
    playCoinSound();
    playRewardSound();
    confetti({
      particleCount: 55,
      spread: 75,
      colors: ['#ffd000', '#39ff14', '#00f5ff', '#ff0055'],
    });
    onClaimReward(reward.day);
  };

  return (
    <div className="mb-6 select-none">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-pixel text-[9px] uppercase tracking-wider text-[#4a3034] flex items-center gap-1.5 font-bold">
          <span className="material-symbols-outlined text-[16px] text-[#ff0055]">
            calendar_month
          </span>
          Streak Login & Hadiah Harian
        </h3>
        <span className="font-pixel text-[8px] bg-[#39ff14] text-[#1b1214] px-2 py-0.5 chunky-border font-bold shadow-[1px_1px_0px_#1b1214]">
          HARI KE-2 AKTIF
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {rewards.map((reward) => {
          const isClaimable = !reward.claimed && reward.label === 'Claim!';

          return (
            <div
              key={reward.day}
              onClick={() => handleClaim(reward)}
              onMouseEnter={() => playHoverSound()}
              className={`p-2 rounded-none chunky-border flex flex-col items-center justify-between text-center transition-all ${
                reward.claimed
                  ? 'bg-[#ffe2e6] border-[#fcc2ca] opacity-75'
                  : isClaimable
                  ? 'bg-[#ffea79] border-[#1b1214] shadow-[3px_3px_0px_#1b1214] cursor-pointer animate-pulse hover:-translate-y-1'
                  : 'bg-white border-[#1b1214] opacity-90'
              }`}
            >
              <span className="font-pixel text-[7px] text-[#4a3034] font-bold">H{reward.day}</span>

              <div className="my-1 text-[#1b1214]">
                {reward.claimed ? (
                  <span className="material-symbols-outlined text-[20px] text-[#39ff14]">
                    check_circle
                  </span>
                ) : isClaimable ? (
                  <span
                    className="material-symbols-outlined text-[22px] text-[#ff0055] animate-bounce"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    diamond
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[18px] text-[#805b60]">lock</span>
                )}
              </div>

              <span
                className={`font-pixel text-[6px] md:text-[7px] uppercase truncate max-w-full font-bold ${
                  isClaimable ? 'text-[#ff0055]' : 'text-[#4a3034]'
                }`}
              >
                {reward.label === 'Claim!' ? 'KLAIM!' : reward.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
