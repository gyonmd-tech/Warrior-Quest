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
  { id: 'rew-1', name: '+150 Gold',      type: 'coins',        amount: 150, icon: 'monetization_on', color: '#ffea79', textColor: '#1b1214', description: '150 Koin Emas masuk ke kantong petualang!' },
  { id: 'rew-2', name: '+15 Gems',       type: 'gems',         amount: 15,  icon: 'diamond',         color: '#ffe2e6', textColor: '#ff0055', description: '15 Permata Langka berhasil didapatkan!' },
  { id: 'rew-3', name: '+40 Energi',     type: 'energy',       amount: 40,  icon: 'bolt',            color: '#39ff14', textColor: '#1b1214', description: 'Stamina fokus bertambah +40 Energi!' },
  { id: 'rew-4', name: '+350 XP',        type: 'xp',           amount: 350, icon: 'auto_stories',    color: '#00f5ff', textColor: '#1b1214', description: 'Gulungan Kuno memberikan +350 XP Instan!' },
  { id: 'rew-5', name: '+300 Gold',      type: 'coins',        amount: 300, icon: 'savings',         color: '#ffd000', textColor: '#1b1214', description: 'Peti Harta Karun besar berisi 300 Gold!' },
  { id: 'rew-6', name: '+30 Gems',       type: 'gems',         amount: 30,  icon: 'military_tech',   color: '#ff0055', textColor: '#ffffff', description: 'JACKPOT! 30 Permata Langka Berkilau!' },
  { id: 'rew-7', name: 'Pelindung Streak', type: 'streak_shield', amount: 1, icon: 'shield',         color: '#b537f2', textColor: '#ffffff', description: 'Perisai Pelindung Streak Disiplin Aktif!' },
  { id: 'rew-8', name: '+600 Boss DMG',  type: 'boss_dmg',     amount: 600, icon: 'bomb',            color: '#ff6b00', textColor: '#ffffff', description: 'Bom Mistis meledakkan -600 HP World Boss!' },
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
  // Track cumulative rotation so we always add on top
  const totalRotationRef = useRef(0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [wonReward, setWonReward] = useState<WheelReward | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const [freeSpinsUsed, setFreeSpinsUsed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('warrior_wheel_free_spin');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed.count;
      }
    } catch { /* ignore */ }
    return 0;
  });

  const hasFreeSpin = freeSpinsUsed === 0;

  if (!isOpen) return null;

  const SPIN_DURATION = 4000; // ms

  const handleSpin = (costType: 'free' | 'coins' | 'gems') => {
    if (isSpinning) return;

    // Validate and deduct cost
    if (costType === 'coins') {
      if (user.coins < 50) { alert('Koin emas Anda tidak cukup (butuh 50 Gold)!'); return; }
      playCoinSound();
      onDeductCurrency('coins', 50);
    } else if (costType === 'gems') {
      if (user.gems < 5) { alert('Permata Anda tidak cukup (butuh 5 Gems)!'); return; }
      playRewardSound();
      onDeductCurrency('gems', 5);
    } else {
      setFreeSpinsUsed(1);
      localStorage.setItem('warrior_wheel_free_spin', JSON.stringify({ date: today, count: 1 }));
    }

    setWonReward(null);
    playClickSound();

    // Pick random reward
    const randomIndex = Math.floor(Math.random() * WHEEL_REWARDS.length);
    const selectedReward = WHEEL_REWARDS[randomIndex];

    // The SVG draws segment 0 starting at angle 0 (right side) after the -rotate-90 on SVG.
    // The pointer arrow is at the top (12 o'clock). After the parent div rotation, 0 deg of parent = pointer at top.
    // Segment center in the rotating div coords (before -rotate-90 applied to SVG inside):
    // Segment idx occupies [idx*45, (idx+1)*45] degrees in the div's rotation frame.
    // We want the center of segment idx to land at 0 deg (top = pointer position) of the outer coordinate.
    // Center of segment in div-rotation frame: idx*45 + 22.5
    // To land at top (0 deg), we need to rotate the div by -(idx*45 + 22.5), i.e. subtract that angle.
    // We add 6 full rounds to make it look dramatic.
    const segmentCenter = randomIndex * 45 + 22.5;
    const neededAngle = 360 * 6 + (360 - segmentCenter);

    const newTotal = totalRotationRef.current + neededAngle;
    totalRotationRef.current = newTotal;

    // Mark spinning – this causes transition to apply on next render
    setIsSpinning(true);
    setRotationDeg(newTotal);

    // Audio ticking
    let tick = 0;
    const tickInterval = setInterval(() => {
      tick++;
      if (tick % 2 === 0) playTimerTickSound();
      if (tick >= 24) clearInterval(tickInterval);
    }, 130);

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
        particleCount: 100,
        spread: 100,
        origin: { y: 0.55 },
        colors: ['#ffd000', '#ff0055', '#39ff14', '#00f5ff', '#b537f2'],
      });
    }, SPIN_DURATION);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-none chunky-border chunky-shadow p-5 sm:p-6 relative animate-in zoom-in duration-200 text-center max-h-[95vh] overflow-y-auto no-scrollbar">

        {/* Close Button */}
        <button
          onClick={() => { if (isSpinning) return; playClickSound(); onClose(); }}
          disabled={isSpinning}
          onMouseEnter={() => playHoverSound()}
          className="absolute top-4 right-4 w-9 h-9 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] chunky-border flex items-center justify-center transition-colors cursor-pointer arcade-btn disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="mb-3">
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
            Putar roda mistis dan menangkan ratusan emas, gems, energi, atau bom serangan bos!
          </p>
        </div>

        {/* ─── WHEEL STAGE ─── */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto my-4 flex items-center justify-center select-none">

          {/* Decorative LED dots on perimeter */}
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`led-${i}`}
              className="absolute rounded-full border border-[#1b1214] z-10 pointer-events-none"
              style={{
                width: 10, height: 10,
                top: '50%', left: '50%',
                marginTop: -5, marginLeft: -5,
                transform: `rotate(${(i * 360) / 16}deg) translateY(-120px)`,
                backgroundColor: i % 2 === 0 ? '#ffea79' : '#ff0055',
                boxShadow: i % 2 === 0 ? '0 0 6px #ffd000' : '0 0 4px #ff0055',
              }}
            />
          ))}

          {/* Pointer arrow (12-o'clock) */}
          <div className={`absolute left-1/2 -translate-x-1/2 z-40 drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)] pointer-events-none ${isSpinning ? 'animate-bounce' : ''}`}
            style={{ top: -14 }}>
            <div style={{
              width: 0, height: 0,
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '26px solid #ff0055',
            }} />
            <div style={{ width: 12, height: 12, backgroundColor: '#ffea79', borderRadius: '50%', border: '2px solid #1b1214', margin: '-22px auto 0' }} />
          </div>

          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: '6px solid #1b1214', boxShadow: '0 0 28px rgba(255,234,121,0.55)' }}
          />

          {/* ── Spinning disc ── */}
          <div
            className="w-full h-full rounded-full overflow-hidden relative"
            style={{
              transform: `rotate(${rotationDeg}deg)`,
              transition: isSpinning
                ? `transform ${SPIN_DURATION}ms cubic-bezier(0.1, 0.7, 0.15, 1)`
                : 'none',
            }}
          >
            {/* Coloured segments via SVG */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full"
              style={{ transform: 'rotate(-90deg)' }}
            >
              {WHEEL_REWARDS.map((rew, idx) => {
                const r = 50;
                const cx = 50, cy = 50;
                const startDeg = idx * 45;
                const endDeg = (idx + 1) * 45;
                const toRad = (d: number) => (d * Math.PI) / 180;
                const x1 = cx + r * Math.cos(toRad(startDeg));
                const y1 = cy + r * Math.sin(toRad(startDeg));
                const x2 = cx + r * Math.cos(toRad(endDeg));
                const y2 = cy + r * Math.sin(toRad(endDeg));
                return (
                  <path
                    key={rew.id}
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={rew.color}
                    stroke="#1b1214"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>

            {/* Segment labels – each rotated to the centre of its slice */}
            {WHEEL_REWARDS.map((rew, idx) => (
              <div
                key={`lbl-${rew.id}`}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ transform: `rotate(${idx * 45 + 22.5}deg)` }}
              >
                <div
                  className="flex flex-col items-center font-pixel font-bold leading-none"
                  style={{
                    marginTop: '-96px',          // push to outer half
                    color: rew.textColor,
                    fontSize: '6.5px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  }}
                >
                  <span className="material-symbols-outlined leading-none mb-0.5" style={{ fontSize: 15 }}>
                    {rew.icon}
                  </span>
                  <span style={{ whiteSpace: 'nowrap' }}>{rew.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Centre hub */}
          <div
            className="absolute flex flex-col items-center justify-center z-30 rounded-full"
            style={{
              width: 52, height: 52,
              background: '#1b1214',
              border: '3px solid #ffd000',
              boxShadow: '0 0 14px rgba(0,0,0,0.6)',
            }}
          >
            <span className="material-symbols-outlined text-[#ffea79] animate-spin" style={{ fontSize: 20, animationDuration: '5s' }}>
              star
            </span>
            <span className="font-pixel text-white" style={{ fontSize: '5.5px' }}>SPIN</span>
          </div>
        </div>
        {/* ─── END WHEEL STAGE ─── */}

        {/* Won Reward Banner */}
        {wonReward && (
          <div className="p-3 bg-gradient-to-r from-[#ffe2e6] via-[#ffea79] to-[#ebfff4] chunky-border animate-in zoom-in duration-200 mb-3 space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-pixel text-[8.5px] text-[#ff0055] font-bold">
              <span className="material-symbols-outlined text-[18px]">celebration</span>
              SELAMAT! ANDA MENDAPATKAN:
            </div>
            <div className="font-headline font-bold text-xl text-[#1b1214]">{wonReward.name}</div>
            <p className="font-body text-xs text-[#4a3034]">{wonReward.description}</p>
          </div>
        )}

        {/* Spin Buttons */}
        <div className="space-y-2 pt-1">
          {hasFreeSpin ? (
            <button
              disabled={isSpinning}
              onClick={() => handleSpin('free')}
              onMouseEnter={() => playHoverSound()}
              className="w-full py-3.5 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[9px] sm:text-[10px] chunky-border arcade-btn font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#1b1214] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[22px]">play_circle</span>
              {isSpinning ? 'SEDANG MEMUTAR RODA…' : 'PUTAR RODA SEKARANG (1× GRATIS)'}
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                disabled={isSpinning || user.coins < 50}
                onClick={() => handleSpin('coins')}
                onMouseEnter={() => playHoverSound()}
                className="py-3 bg-[#ffea79] hover:bg-[#ffd000] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1b1214] disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ff6b00]">monetization_on</span>
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

        {/* Footer info */}
        <div className="mt-3 pt-2 border-t border-[#ffe2e6] flex items-center justify-between text-[9.5px] text-[#805b60] font-body">
          <span>🪙 {user.coins} Gold &bull; 💎 {user.gems} Gems</span>
          <span>Free Spin reset: 00:00 WIB</span>
        </div>
      </div>
    </div>
  );
};
