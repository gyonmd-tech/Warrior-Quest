import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy } from '../types';
import { playClickSound, playCoinSound, playHoverSound, playRewardSound } from '../utils/audio';

interface TrophiesViewProps {
  trophies: Trophy[];
  onClaimTrophyReward: (trophyId: string, gems: number) => void;
}

export const TrophiesView: React.FC<TrophiesViewProps> = ({ trophies, onClaimTrophyReward }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'claimable'>('all');

  const unlockedCount = trophies.filter((t) => t.unlocked || t.progress >= t.maxProgress).length;
  const claimableCount = trophies.filter(
    (t) => (t.unlocked || t.progress >= t.maxProgress) && !t.claimedReward
  ).length;

  const totalGemsAvailable = trophies
    .filter((t) => (t.unlocked || t.progress >= t.maxProgress) && !t.claimedReward)
    .reduce((acc, curr) => acc + curr.rewardGems, 0);

  const handleClaim = (trophy: Trophy) => {
    playCoinSound();
    playRewardSound();
    confetti({
      particleCount: 65,
      spread: 80,
      colors: ['#ffd000', '#39ff14', '#00f5ff', '#ff0055', '#b537f2'],
    });
    onClaimTrophyReward(trophy.id, trophy.rewardGems);
  };

  const filteredTrophies = trophies.filter((t) => {
    const isUnlocked = t.unlocked || t.progress >= t.maxProgress;
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    if (filter === 'claimable') return isUnlocked && !t.claimedReward;
    return true;
  });

  const progressPercentage = Math.round((unlockedCount / trophies.length) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Trophy Banner with Strong Visuals */}
      <div className="bg-gradient-to-r from-[#ffe2e6] via-[#ffd0d7] to-[#ffea79] p-5 sm:p-6 rounded-none chunky-border chunky-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="bg-[#ffd000] text-[#1b1214] font-pixel text-[8px] px-2 py-0.5 chunky-border font-bold shadow-[1.5px_1.5px_0px_#1b1214]">
              PRESTIGE VAULT
            </span>
            <span className="font-pixel text-[8px] bg-[#39ff14] text-[#1b1214] px-2 py-0.5 chunky-border font-bold shadow-[1.5px_1.5px_0px_#1b1214]">
              {unlockedCount}/{trophies.length} TERCAPAI ({progressPercentage}%)
            </span>
            {claimableCount > 0 && (
              <span className="font-pixel text-[8px] bg-[#ff0055] text-white px-2 py-0.5 chunky-border font-bold animate-bounce shadow-[1.5px_1.5px_0px_#1b1214]">
                ★ {claimableCount} SIAP KLAIM (+{totalGemsAvailable} Gems)!
              </span>
            )}
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#ff0055]">
            Ruang Trofi & Prestasi
          </h2>
          <p className="font-body text-xs text-[#4a3034] mt-0.5 max-w-xl">
            Koleksi lencana kehormatan, buka pencapaian disiplin legendaris, dan klaim hadiah permata berharga.
          </p>

          {/* Trophy Completion Bar */}
          <div className="w-full max-w-md h-3 bg-white chunky-border overflow-hidden p-0.5 mt-3 shadow-[1.5px_1.5px_0px_#1b1214]">
            <div
              className="h-full bg-gradient-to-r from-[#ffd000] via-[#39ff14] to-[#00f5ff] progress-stripes"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="w-16 h-16 bg-[#ffd000] chunky-border flex items-center justify-center shrink-0 border-[#1b1214] shadow-[4px_4px_0px_#1b1214] hover:rotate-6 hover:scale-105 transition-transform">
          <span
            className="material-symbols-outlined text-[#ff0055] text-[36px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            emoji_events
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: `SEMUA (${trophies.length})`, bg: 'bg-[#ffea79]', text: 'text-[#1b1214]' },
          { key: 'claimable', label: `SIAP KLAIM (${claimableCount})`, bg: 'bg-[#39ff14]', text: 'text-[#1b1214]' },
          { key: 'unlocked', label: `TERBUKA (${unlockedCount})`, bg: 'bg-[#00f5ff]', text: 'text-[#1b1214]' },
          { key: 'locked', label: `TERKUNCI (${trophies.length - unlockedCount})`, bg: 'bg-[#fcc2ca]', text: 'text-[#ff0055]' },
        ].map((tab) => {
          const isSelected = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                playClickSound();
                setFilter(tab.key as any);
              }}
              onMouseEnter={() => playHoverSound()}
              className={`px-3.5 py-1.5 font-pixel text-[8px] chunky-border cursor-pointer transition-all ${
                isSelected
                  ? `${tab.bg} ${tab.text} font-bold shadow-[2.5px_2.5px_0px_#1b1214] -translate-y-0.5`
                  : 'bg-white text-[#4a3034] hover:bg-[#ffe2e6]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Trophy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrophies.map((trophy) => {
          const isUnlocked = trophy.unlocked || trophy.progress >= trophy.maxProgress;
          const isClaimable = isUnlocked && !trophy.claimedReward;
          const percent = Math.min(100, Math.round((trophy.progress / trophy.maxProgress) * 100));

          return (
            <div
              key={trophy.id}
              onMouseEnter={() => playHoverSound()}
              className={`p-4.5 chunky-border transition-all select-none flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white chunky-shadow card-hover-pop'
                  : 'bg-[#fff6f8] opacity-75'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-14 h-14 rounded-none chunky-border flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1b1214] ${
                    isUnlocked
                      ? 'bg-[#ffea79] text-[#ff0055]'
                      : 'bg-[#fcc2ca] text-[#805b60]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[32px]"
                    style={{ fontVariationSettings: isUnlocked ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {trophy.icon}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-headline font-bold text-base text-[#1b1214] truncate">
                      {trophy.title}
                    </h3>
                    <span
                      className={`font-pixel text-[7px] px-1.5 py-0.5 chunky-border uppercase shrink-0 font-bold shadow-[1px_1px_0px_#1b1214] ${
                        trophy.rarity === 'legendary'
                          ? 'bg-[#ff0055] text-white border-[#b9003f]'
                          : trophy.rarity === 'epic'
                          ? 'bg-[#b537f2] text-white'
                          : trophy.rarity === 'rare'
                          ? 'bg-[#00f5ff] text-[#1b1214]'
                          : 'bg-[#ffd000] text-[#1b1214]'
                      }`}
                    >
                      {trophy.rarity}
                    </span>
                  </div>

                  <p className="font-body text-xs text-[#4a3034] mt-0.5">
                    {trophy.description}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-2.5">
                    <div className="flex justify-between font-pixel text-[7px] text-[#4a3034] mb-1">
                      <span>PROGRESS</span>
                      <span className="font-bold">
                        {Math.min(trophy.progress, trophy.maxProgress)} / {trophy.maxProgress}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#ffe2e6] chunky-border overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#ffd000] to-[#39ff14]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reward & Claim Actions */}
              <div className="mt-3.5 pt-2.5 border-t-2 border-[#ffe2e6] flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-pixel text-[8px] text-[#ff0055] font-bold">
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    diamond
                  </span>
                  <span>+{trophy.rewardGems} GEMS</span>
                </div>

                {isClaimable ? (
                  <button
                    onClick={() => handleClaim(trophy)}
                    onMouseEnter={() => playHoverSound()}
                    className="px-3.5 py-1.5 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn transition-all cursor-pointer font-bold animate-pulse"
                  >
                    KLAIM HADIAH!
                  </button>
                ) : trophy.claimedReward ? (
                  <span className="font-pixel text-[7px] text-[#007d7a] font-bold bg-[#ffe2e6] px-2 py-0.5 chunky-border">
                    ✓ DIKLAIM
                  </span>
                ) : (
                  <span className="font-pixel text-[7px] text-[#805b60]">
                    TERKUNCI
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
