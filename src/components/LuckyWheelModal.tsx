import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import {
  playAttackSound,
  playClickSound,
  playCoinSound,
  playHoverSound,
  playLevelUpSound,
  playRewardSound,
  playTimerTickSound,
} from '../utils/audio';

export interface WheelReward {
  id: string;
  name: string;
  type: 'coins' | 'gems' | 'energy' | 'xp' | 'boss_dmg' | 'streak_shield';
  amount: number;
  icon: string;
  color: string;
  textColor: string;
  description: string;
}

export const WHEEL_REWARDS: WheelReward[] = [
  {
    id: 'rew-1',
    name: '+150 Gold',
    type: 'coins',
    amount: 150,
    icon: 'monetization_on',
    color: '#ffea79',
    textColor: '#1b1214',
    description: '150 Koin Emas masuk ke kantong petualang!',
  },
  {
    id: 'rew-2',
    name: '+15 Gems',
    type: 'gems',
    amount: 15,
    icon: 'diamond',
    color: '#ffe2e6',
    textColor: '#ff0055',
    description: '15 Permata Langka berhasil didapatkan!',
  },
  {
    id: 'rew-3',
    name: '+40 Energi',
    type: 'energy',
    amount: 40,
    icon: 'bolt',
    color: '#39ff14',
    textColor: '#1b1214',
    description: 'Stamina fokus bertambah +40 Energi!',
  },
  {
    id: 'rew-4',
    name: '+350 XP',
    type: 'xp',
    amount: 350,
    icon: 'auto_stories',
    color: '#00f5ff',
    textColor: '#1b1214',
    description: 'Gulungan Kuno memberikan +350 XP Instan!',
  },
  {
    id: 'rew-5',
    name: '+300 Gold',
    type: 'coins',
    amount: 300,
    icon: 'savings',
    color: '#ffd000',
    textColor: '#1b1214',
    description: 'Peti Harta Karun besar berisi 300 Gold!',
  },
  {
    id: 'rew-6',
    name: '+30 Gems',
    type: 'gems',
    amount: 30,
    icon: 'military_tech',
    color: '#ff0055',
    textColor: '#ffffff',
    description: 'JACKPOT! 30 Permata Langka Berkilau!',
  },
  {
    id: 'rew-7',
    name: 'Pelindung Streak',
    type: 'streak_shield',
    amount: 1,
    icon: 'shield',
    color: '#b537f2',
    textColor: '#ffffff',
    description: 'Perisai Pelindung Streak Disiplin Aktif!',
  },
  {
    id: 'rew-8',
    name: '+600 Boss DMG',
    type: 'boss_dmg',
    amount: 600,
    icon: 'bomb',
    color: '#ff6b00',
    textColor: '#ffffff',
    description: 'Bom Mistis meledakkan -600 HP World Boss!',
  },
];

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onClaimReward: (reward: WheelReward) => void;
  onDeductCurrency: (type: 'coins' | 'gems', amount: number) => void;
}

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  isOpen,
  onClose,
  user,
  onClaimReward,
  onDeductCurrency,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<WheelReward | null>(null);

  // Daily Free Spin State (Stored by Date)
  const today = new Date().toISOString().split('T')[0];
  const [freeSpinsUsed, setFreeSpinsUsed] = useState<number>(() => {
    const saved = localStorage.getItem('warrior_wheel_free_spin');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed.count;
      } catch {
        return 0;
      }
    }
    return 0;
  });

  const hasFreeSpin = freeSpinsUsed === 0;

  if (!isOpen) return null;

  const handleSpin = (costType: 'free' | 'coins' | 'gems') => {
    if (isSpinning) return;

    if (costType === 'coins') {
      if (user.coins < 50) {
        alert('Koin emas Anda tidak cukup (butuh 50 Gold)!');
        return;
      }
      playCoinSound();
      onDeductCurrency('coins', 50);
    } else if (costType === 'gems') {
      if (user.gems < 5) {
        alert('Permata Anda tidak cukup (butuh 5 Gems)!');
        return;
      }
      playRewardSound();
      onDeductCurrency('gems', 5);
    } else {
      // Free spin
      setFreeSpinsUsed(1);
      localStorage.setItem('warrior_wheel_free_spin', JSON.stringify({ date: today, count: 1 }));
    }

    setIsSpinning(true);
    setWonReward(null);
    playClickSound();

    // Random selection
    const randomIndex = Math.floor(Math.random() * WHEEL_REWARDS.length);
    const selectedReward = WHEEL_REWARDS[randomIndex];

    // Calculate rotation angle
    // Each segment is 360 / 8 = 45 deg
    // Arrow is at the top (270 deg or 0 deg depending on orientation)
    const segmentAngle = 360 / WHEEL_REWARDS.length;
    const targetSegmentOffset = (WHEEL_REWARDS.length - randomIndex) * segmentAngle - segmentAngle / 2;
    const extraRotations = 360 * 5; // 5 full rounds
    const nextRotation = rotation + extraRotations + (targetSegmentOffset - (rotation % 360));

    setRotation(nextRotation);

    // Audio ticking simulation
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      if (tickCount % 2 === 0) playTimerTickSound();
      if (tickCount >= 18) clearInterval(tickInterval);
    }, 150);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWonReward(selectedReward);
      onClaimReward(selectedReward);

      if (selectedReward.type === 'gems' || selectedReward.type === 'streak_shield') {
        playLevelUpSound();
      } else if (selectedReward.type === 'boss_dmg') {
        playAttackSound();
      } else {
        playRewardSound();
      }

      confetti({
        particleCount: 85,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#ffd000', '#ff0055', '#39ff14', '#00f5ff', '#b537f2'],
      });
    }, 3800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-none chunky-border chunky-shadow p-5 sm:p-6 relative animate-in zoom-in duration-200 text-center max-h-[95vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={() => {
            if (isSpinning) return;
            playClickSound();
            onClose();
          }}
          disabled={isSpinning}
          onMouseEnter={() => playHoverSound()}
          className="absolute top-4 right-4 w-9 h-9 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] chunky-border flex items-center justify-center transition-colors cursor-pointer arcade-btn disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Event Header */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-1.5 flex-wrap mb-1">
            <span className="font-pixel text-[7.5px] sm:text-[8px] bg-[#ff0055] text-white px-2.5 py-0.5 chunky-border font-bold uppercase shadow-[1.5px_1.5px_0px_#1b1214] animate-pulse">
              🎪 EVENT FESTIVAL LIVE
            </span>
            <span className="font-pixel text-[7.5px] sm:text-[8px] bg-[#39ff14] text-[#1b1214] px-2 py-0.5 chunky-border font-bold shadow-[1.5px_1.5px_0px_#1b1214]">
              {hasFreeSpin ? '✨ 1x PUTARAN GRATIS' : '🔥 PUTARAN EKSTRA'}
            </span>
          </div>

          <h3 className="font-headline text-2xl sm:text-3xl font-bold text-[#1b1214]">
            Roda Keberuntungan Ksatria
          </h3>
          <p className="font-body text-xs text-[#4a3034]">
            Putar roda mistis setiap hari dan menangkan bonus emas, gems, energi, dan bom serangan bos!
          </p>
        </div>

        {/* The Wheel Container */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto my-3 flex items-center justify-center select-none">
          {/* Outer Ring Shadow & Glow */}
          <div className="absolute inset-0 rounded-full border-[6px] border-[#1b1214] shadow-[0_0_20px_rgba(255,234,121,0.5)] bg-[#1b1214] pointer-events-none" />

          {/* Wheel Pointer Arrow */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-[#ff0055]" />
            <div className="w-2.5 h-2.5 bg-[#ffea79] rounded-full mx-auto -mt-5 border border-[#1b1214]" />
          </div>

          {/* Rotating Wheel Disc */}
          <div
            className="w-full h-full rounded-full overflow-hidden relative shadow-inner transition-transform duration-[3800ms] cubic-bezier(0.15, 0.9, 0.25, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* SVG Segments */}
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {WHEEL_REWARDS.map((rew, idx) => {
                const startAngle = idx * 45;
                const endAngle = (idx + 1) * 45;
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={rew.id}>
                    <path d={pathData} fill={rew.color} stroke="#1b1214" strokeWidth="1.2" />
                  </g>
                );
              })}
            </svg>

            {/* Labels overlay placed on top of segments */}
            {WHEEL_REWARDS.map((rew, idx) => {
              const angle = idx * 45 + 22.5; // Center of segment
              return (
                <div
                  key={`label-${rew.id}`}
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <div
                    className="flex flex-col items-center -translate-y-20 sm:-translate-y-23 font-pixel text-[6.5px] sm:text-[7px] font-bold"
                    style={{ color: rew.textColor }}
                  >
                    <span className="material-symbols-outlined text-[15px] sm:text-[17px] leading-none mb-0.5">
                      {rew.icon}
                    </span>
                    <span className="whitespace-nowrap">{rew.name}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Hub Badge */}
          <div className="absolute w-14 h-14 bg-[#1b1214] text-[#ffea79] rounded-full chunky-border border-[#ffd000] flex flex-col items-center justify-center z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <span className="material-symbols-outlined text-[20px] animate-spin" style={{ animationDuration: '6s' }}>
              star
            </span>
            <span className="font-pixel text-[5px] text-white">SPIN</span>
          </div>
        </div>

        {/* Won Reward Banner Announcement */}
        {wonReward && (
          <div className="p-3 bg-gradient-to-r from-[#ffe2e6] via-[#ffea79] to-[#ebfff4] chunky-border animate-in zoom-in duration-200 mb-3 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-pixel text-[8.5px] text-[#ff0055] font-bold">
              <span className="material-symbols-outlined text-[18px]">celebration</span>
              SELAMAT! ANDA MENDAPATKAN:
            </div>
            <div className="font-headline font-bold text-xl text-[#1b1214]">
              {wonReward.name}
            </div>
            <p className="font-body text-xs text-[#4a3034]">{wonReward.description}</p>
          </div>
        )}

        {/* Spin Actions Buttons */}
        <div className="space-y-2 pt-2">
          {hasFreeSpin ? (
            <button
              disabled={isSpinning}
              onClick={() => handleSpin('free')}
              onMouseEnter={() => playHoverSound()}
              className="w-full py-3.5 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[9.5px] chunky-border arcade-btn font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#1b1214] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              {isSpinning ? 'SEDANG MEMUTAR...' : 'PUTAR RODA SEKARANG (1x GRATIS)'}
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                disabled={isSpinning || user.coins < 50}
                onClick={() => handleSpin('coins')}
                onMouseEnter={() => playHoverSound()}
                className="py-3 bg-[#ffea79] hover:bg-[#ffd000] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1b1214] disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ff6b00]">
                  monetization_on
                </span>
                Putar Lagi (50 Gold)
              </button>

              <button
                disabled={isSpinning || user.gems < 5}
                onClick={() => handleSpin('gems')}
                onMouseEnter={() => playHoverSound()}
                className="py-3 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] font-pixel text-[8px] chunky-border arcade-btn font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1b1214] disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">diamond</span>
                Putar Lucky (5 Gems)
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-3.5 pt-2 border-t border-[#ffe2e6] flex items-center justify-between text-[9.5px] text-[#805b60] font-body">
          <span>Kantong: 🪙 {user.coins} Gold &bull; 💎 {user.gems} Gems</span>
          <span>Reset Gratis: Pukul 00:00 WIB</span>
        </div>
      </div>
    </div>
  );
};
