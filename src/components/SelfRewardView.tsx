import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { SelfReward, UserProfile } from '../types';
import {
  playClickSound,
  playCoinSound,
  playHoverSound,
  playRewardSound,
} from '../utils/audio';

interface SelfRewardViewProps {
  user: UserProfile;
  selfRewards: SelfReward[];
  onClaimReward: (rewardId: string) => void;
  onOpenAddRewardModal: () => void;
  onDeleteReward: (rewardId: string) => void;
}

const CATEGORY_STYLES: Record<
  string,
  { label: string; bg: string; text: string; icon: string }
> = {
  treat: { label: 'Kuliner & Kopi', bg: 'bg-[#ffea79]', text: 'text-[#1b1214]', icon: 'restaurant' },
  gaming: { label: 'Gaming & Santai', bg: 'bg-[#00f5ff]', text: 'text-[#1b1214]', icon: 'sports_esports' },
  shopping: { label: 'Wishlist Belanja', bg: 'bg-[#fcc2ca]', text: 'text-[#ff0055]', icon: 'shopping_bag' },
  rest: { label: 'Istirahat & Liburan', bg: 'bg-[#39ff14]', text: 'text-[#1b1214]', icon: 'spa' },
  custom: { label: 'Hadiah Kustom', bg: 'bg-[#ffd000]', text: 'text-[#1b1214]', icon: 'card_giftcard' },
};

export const SelfRewardView: React.FC<SelfRewardViewProps> = ({
  user,
  selfRewards,
  onClaimReward,
  onOpenAddRewardModal,
  onDeleteReward,
}) => {
  const [filter, setFilter] = useState<'all' | 'ready' | 'locked' | 'claimed'>('all');

  const totalRewardsCount = selfRewards.length;
  const readyToClaimCount = selfRewards.filter((r) => !r.claimed && user.currentXp >= r.targetXp).length;
  const claimedCount = selfRewards.filter((r) => r.claimed).length;

  const filteredRewards = selfRewards.filter((r) => {
    const isUnlocked = user.currentXp >= r.targetXp;
    if (filter === 'ready') return !r.claimed && isUnlocked;
    if (filter === 'locked') return !r.claimed && !isUnlocked;
    if (filter === 'claimed') return r.claimed;
    return true;
  });

  const handleClaim = (reward: SelfReward) => {
    if (user.currentXp < reward.targetXp || reward.claimed) return;
    playRewardSound();
    playCoinSound();
    confetti({
      particleCount: 85,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#ffd000', '#ff0055', '#39ff14', '#00f5ff'],
    });
    onClaimReward(reward.id);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#ffe2e6] via-[#ffd0d7] to-[#ffea79] p-4 sm:p-5 chunky-border chunky-shadow relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-pixel text-[8px] bg-[#ff0055] text-white px-2 py-0.5 chunky-border font-bold uppercase shadow-[1px_1px_0px_#1b1214]">
                SELF-REWARD VAULT
              </span>
              {readyToClaimCount > 0 && (
                <span className="font-pixel text-[8px] bg-[#39ff14] text-[#1b1214] px-2 py-0.5 chunky-border font-bold animate-bounce shadow-[1px_1px_0px_#1b1214]">
                  🎉 {readyToClaimCount} SIAP KLAIM!
                </span>
              )}
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#1b1214] mt-1">
              Hadiah Apresiasi Diri
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#4a3034] mt-0.5 max-w-xl">
              Tetapkan reward impian di dunia nyata. Saat target XP quest tercapai, berikan hadiah pantas untuk diri Anda tanpa rasa bersalah!
            </p>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onOpenAddRewardModal();
            }}
            onMouseEnter={() => playHoverSound()}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[8.5px] sm:text-[9px] chunky-border arcade-btn flex items-center justify-center gap-1.5 font-bold shadow-[3px_3px_0px_#1b1214] shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            TAMBAH SELF-REWARD
          </button>
        </div>

        {/* Current XP Progress to next goal */}
        <div className="mt-4 pt-3 border-t-2 border-[#1b1214]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[8px] text-[#805b60] uppercase font-bold">XP Saat Ini:</span>
            <span className="font-pixel text-[9px] bg-[#ffea79] px-2 py-0.5 chunky-border text-[#1b1214] font-bold">
              {user.currentXp} / {user.maxXp} XP (Level {user.level})
            </span>
          </div>
          <div className="font-body text-xs text-[#4a3034]">
            Total Reward: <strong>{totalRewardsCount}</strong> &bull; Terklaim: <strong>{claimedCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all' as const, label: `Semua (${totalRewardsCount})`, icon: 'apps' },
          { id: 'ready' as const, label: `Siap Klaim (${readyToClaimCount})`, icon: 'lock_open', highlight: readyToClaimCount > 0 },
          { id: 'locked' as const, label: 'Belum Terbuka', icon: 'lock' },
          { id: 'claimed' as const, label: `Sudah Diklaim (${claimedCount})`, icon: 'check_circle' },
        ].map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setFilter(tab.id);
              }}
              onMouseEnter={() => playHoverSound()}
              className={`px-3 py-1.5 font-pixel text-[7.5px] sm:text-[8px] chunky-border cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap shrink-0 font-bold ${
                isActive
                  ? 'bg-[#ff0055] text-white shadow-[2px_2px_0px_#1b1214] -translate-y-0.5'
                  : tab.highlight
                  ? 'bg-[#39ff14] text-[#1b1214] animate-pulse'
                  : 'bg-white text-[#4a3034] hover:bg-[#ffe2e6]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Rewards Grid */}
      {filteredRewards.length === 0 ? (
        <div className="bg-white p-8 chunky-border chunky-shadow text-center space-y-3">
          <div className="w-16 h-16 bg-[#ffea79] chunky-border mx-auto flex items-center justify-center text-[#ff0055] shadow-[2px_2px_0px_#1b1214]">
            <span className="material-symbols-outlined text-[32px]">card_giftcard</span>
          </div>
          <h3 className="font-headline text-lg sm:text-xl font-bold text-[#1b1214]">
            Belum Ada Hadiah di Kategori Ini
          </h3>
          <p className="font-body text-xs text-[#4a3034] max-w-md mx-auto">
            Tambahkan wishlist hadiah kesukaan Anda dan tentukan target XP quest yang dibutuhkan untuk membukanya!
          </p>
          <button
            onClick={() => {
              playClickSound();
              onOpenAddRewardModal();
            }}
            className="px-4 py-2 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[8.5px] chunky-border arcade-btn font-bold cursor-pointer"
          >
            + BUAT TARGET SELF-REWARD
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRewards.map((reward) => {
            const isUnlocked = user.currentXp >= reward.targetXp;
            const progressPercent = Math.min(100, Math.round((user.currentXp / reward.targetXp) * 100));
            const categoryMeta = CATEGORY_STYLES[reward.category] || CATEGORY_STYLES.custom;

            return (
              <div
                key={reward.id}
                onMouseEnter={() => playHoverSound()}
                className={`bg-white p-4 sm:p-4.5 chunky-border relative overflow-hidden transition-all card-hover-pop flex flex-col justify-between gap-3 ${
                  reward.claimed
                    ? 'opacity-70 bg-[#fff6f8]'
                    : isUnlocked
                    ? 'ring-3 ring-[#39ff14] border-[#39ff14]'
                    : 'chunky-shadow'
                }`}
              >
                {/* Top Badge & Delete Button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`font-pixel text-[7px] sm:text-[7.5px] px-2 py-0.5 chunky-border font-bold flex items-center gap-1 shadow-[1px_1px_0px_#1b1214] ${categoryMeta.bg} ${categoryMeta.text}`}
                    >
                      <span className="material-symbols-outlined text-[12px]">{categoryMeta.icon}</span>
                      {categoryMeta.label}
                    </span>

                    {reward.claimed ? (
                      <span className="font-pixel text-[7px] bg-[#ebfff4] text-[#007d7a] px-1.5 py-0.5 chunky-border font-bold border-[#007d7a]">
                        ✓ TERCAPAI & DIKLAIM
                      </span>
                    ) : isUnlocked ? (
                      <span className="font-pixel text-[7px] bg-[#39ff14] text-[#1b1214] px-1.5 py-0.5 chunky-border font-bold animate-pulse">
                        ★ TARGET TERCAPAI!
                      </span>
                    ) : (
                      <span className="font-pixel text-[7px] bg-[#fff0f3] text-[#805b60] px-1.5 py-0.5 chunky-border font-bold">
                        🔒 KURANG {reward.targetXp - user.currentXp} XP
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playClickSound();
                      onDeleteReward(reward.id);
                    }}
                    title="Hapus reward ini"
                    className="text-[#805b60] hover:text-[#ff0055] p-1 cursor-pointer font-bold"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                {/* Content */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-none chunky-border flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1b1214] ${
                      reward.claimed
                        ? 'bg-[#ffe2e6] text-[#805b60]'
                        : isUnlocked
                        ? 'bg-[#39ff14] text-[#1b1214]'
                        : 'bg-[#ffea79] text-[#ff0055]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px] sm:text-[26px]">
                      {reward.icon || 'card_giftcard'}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-headline font-bold text-base sm:text-lg text-[#1b1214] leading-snug">
                      {reward.title}
                    </h4>
                    {reward.description && (
                      <p className="font-body text-xs text-[#4a3034] mt-0.5 leading-relaxed">
                        {reward.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress Bar towards Target XP */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between font-pixel text-[7.5px] text-[#4a3034] font-bold">
                    <span>PROGRESS XP</span>
                    <span>
                      {user.currentXp} / {reward.targetXp} XP ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#fff0f3] chunky-border overflow-hidden p-0.5">
                    <div
                      className={`h-full transition-all duration-300 ${
                        reward.claimed
                          ? 'bg-[#007d7a]'
                          : isUnlocked
                          ? 'bg-[#39ff14] progress-stripes'
                          : 'bg-[#ff0055]'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-2 border-t-2 border-[#ffe2e6] flex items-center justify-between gap-2">
                  <span className="font-pixel text-[7px] text-[#805b60]">
                    Target Syarat: <strong>{reward.targetXp} XP</strong>
                  </span>

                  {reward.claimed ? (
                    <span className="font-pixel text-[7.5px] text-[#007d7a] font-bold">
                      ✓ Sudah dinikmati
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleClaim(reward)}
                      onMouseEnter={() => playHoverSound()}
                      className="px-4 py-2 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[8px] sm:text-[8.5px] chunky-border arcade-btn cursor-pointer font-bold flex items-center gap-1 shadow-[2px_2px_0px_#1b1214]"
                    >
                      <span className="material-symbols-outlined text-[16px]">celebration</span>
                      KLAIM & NIKMATI REWARD!
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-1.5 bg-[#fcc2ca] text-[#805b60] font-pixel text-[7.5px] chunky-border cursor-not-allowed opacity-80"
                    >
                      🔒 TERKUNCI (BUTUH {reward.targetXp - user.currentXp} XP)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
