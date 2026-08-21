import React, { useRef, useState } from 'react';
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
  emoji: string;
  color: string;
  textColor: string;
  description: string;
}

export const WHEEL_REWARDS: WheelReward[] = [
  { id: 'rew-1', name: '+150 Gold',        type: 'coins',         amount: 150, emoji: '🪙', color: '#ffd000', textColor: '#1b1214', description: '150 Koin Emas masuk ke kantong petualang!' },
  { id: 'rew-2', name: '+15 Gems',         type: 'gems',          amount: 15,  emoji: '💎', color: '#fcc2ca', textColor: '#cc003a', description: '15 Permata Langka berhasil didapatkan!' },
  { id: 'rew-3', name: '+40 Energi',       type: 'energy',        amount: 40,  emoji: '⚡', color: '#39ff14', textColor: '#0d5200', description: 'Stamina fokus bertambah +40 Energi!' },
  { id: 'rew-4', name: '+350 XP',          type: 'xp',            amount: 350, emoji: '📜', color: '#00f5ff', textColor: '#005f66', description: 'Gulungan Kuno memberikan +350 XP Instan!' },
  { id: 'rew-5', name: '+300 Gold',        type: 'coins',         amount: 300, emoji: '💰', color: '#ffea79', textColor: '#1b1214', description: 'Peti Harta Karun besar berisi 300 Gold!' },
  { id: 'rew-6', name: 'JACKPOT 30💎',    type: 'gems',          amount: 30,  emoji: '👑', color: '#ff0055', textColor: '#ffffff', description: 'JACKPOT! 30 Permata Langka Berkilau!' },
  { id: 'rew-7', name: 'Streak Shield',   type: 'streak_shield', amount: 1,   emoji: '🛡️', color: '#b537f2', textColor: '#ffffff', description: 'Perisai Pelindung Streak Disiplin Aktif!' },
  { id: 'rew-8', name: '+600 Boss DMG',   type: 'boss_dmg',      amount: 600, emoji: '💣', color: '#ff6b00', textColor: '#ffffff', description: 'Bom Mistis meledakkan -600 HP World Boss!' },
];

const N = WHEEL_REWARDS.length; // 8
const SEG_DEG = 360 / N;        // 45

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
  const totalDegRef = useRef(0);
  const [rotateDeg, setRotateDeg] = useState(0);
  const [wonReward, setWonReward] = useState<WheelReward | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const [freeUsed, setFreeUsed] = useState<number>(() => {
    try {
      const s = localStorage.getItem('warrior_wheel_free');
      if (s) { const p = JSON.parse(s); if (p.date === today) return p.count; }
    } catch { /* ignore */ }
    return 0;
  });

  if (!isOpen) return null;

  const hasFreeSpin = freeUsed === 0;
  const SPIN_MS = 4200;

  const doSpin = (costType: 'free' | 'coins' | 'gems') => {
    if (isSpinning) return;
    if (costType === 'coins') {
      if (user.coins < 50) { alert('Koin emas tidak cukup (butuh 50 Gold)!'); return; }
      playCoinSound(); onDeductCurrency('coins', 50);
    } else if (costType === 'gems') {
      if (user.gems < 5) { alert('Permata tidak cukup (butuh 5 Gems)!'); return; }
      playRewardSound(); onDeductCurrency('gems', 5);
    } else {
      setFreeUsed(1);
      localStorage.setItem('warrior_wheel_free', JSON.stringify({ date: today, count: 1 }));
    }

    setWonReward(null);
    playClickSound();

    const idx = Math.floor(Math.random() * N);
    const reward = WHEEL_REWARDS[idx];

    // Pointer sits at top (angle=0 from Y-axis, or 270° from X-axis in SVG coords).
    // Segment idx spans [idx*45, (idx+1)*45]° in the rotation frame where 0° = top.
    // To bring the CENTRE of segment idx under the pointer, we rotate wheel by:
    //   -(idx * 45 + 22.5)  degrees
    // Plus extra full spins for drama.
    const targetOffset = -(idx * SEG_DEG + SEG_DEG / 2);
    const newTotal = totalDegRef.current - (totalDegRef.current % 360) + 360 * 7 + targetOffset;
    totalDegRef.current = newTotal;

    setIsSpinning(true);
    setRotateDeg(newTotal);

    let tick = 0;
    const t = setInterval(() => { if (++tick % 2 === 0) playTimerTickSound(); if (tick >= 26) clearInterval(t); }, 120);

    setTimeout(() => {
      clearInterval(t);
      setIsSpinning(false);
      setWonReward(reward);
      onClaimReward(reward);
      if (reward.type === 'gems' || reward.type === 'streak_shield') playLevelUpSound();
      else if (reward.type === 'boss_dmg') playAttackSound();
      else playRewardSound();
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.55 },
        colors: ['#ffd000','#ff0055','#39ff14','#00f5ff','#b537f2'] });
    }, SPIN_MS);
  };

  /* ── SVG wheel helpers ── */
  const R = 48;       // radius of segments (in SVG units 0-100)
  const CX = 50, CY = 50;

  function segPath(i: number) {
    const a1 = ((i * SEG_DEG - 90) * Math.PI) / 180;
    const a2 = (((i + 1) * SEG_DEG - 90) * Math.PI) / 180;
    const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
    const x2 = CX + R * Math.cos(a2), y2 = CY + R * Math.sin(a2);
    return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
  }

  function labelPos(i: number, rLabel = 31) {
    const angle = ((i * SEG_DEG + SEG_DEG / 2 - 90) * Math.PI) / 180;
    return { x: CX + rLabel * Math.cos(angle), y: CY + rLabel * Math.sin(angle) };
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-none chunky-border chunky-shadow p-5 relative text-center max-h-[95vh] overflow-y-auto no-scrollbar">

        {/* Close */}
        <button
          onClick={() => { if (!isSpinning) { playClickSound(); onClose(); } }}
          disabled={isSpinning}
          onMouseEnter={() => playHoverSound()}
          className="absolute top-3 right-3 w-9 h-9 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] chunky-border flex items-center justify-center cursor-pointer arcade-btn disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Title */}
        <div className="mb-3 pr-8">
          <div className="flex items-center justify-center gap-1.5 flex-wrap mb-1">
            <span className="font-pixel text-[7px] bg-[#ff0055] text-white px-2 py-0.5 chunky-border font-bold animate-pulse">🎪 EVENT FESTIVAL</span>
            <span className="font-pixel text-[7px] bg-[#39ff14] text-[#1b1214] px-2 py-0.5 chunky-border font-bold">
              {hasFreeSpin ? '✨ FREE SPIN' : '🔥 EXTRA SPIN'}
            </span>
          </div>
          <h3 className="font-headline text-2xl font-bold text-[#1b1214]">Roda Keberuntungan</h3>
          <p className="font-body text-xs text-[#4a3034]">Putar roda dan menangkan hadiah mistis ksatria!</p>
        </div>

        {/* ── Wheel ── */}
        <div className="relative mx-auto my-3" style={{ width: 280, height: 280 }}>

          {/* Pointer */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none ${isSpinning ? 'animate-bounce' : ''}`}
            style={{ top: -18 }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28">
              <polygon points="14,2 24,26 14,20 4,26" fill="#ff0055" stroke="#1b1214" strokeWidth="1.5" />
              <circle cx="14" cy="21" r="4" fill="#ffea79" stroke="#1b1214" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Outer decorative ring */}
          <div className="absolute inset-0 rounded-full pointer-events-none z-10"
            style={{ border: '6px solid #1b1214', boxShadow: '0 0 0 2px #ffd000, 0 0 22px rgba(255,208,0,0.5)' }} />

          {/* LED dots */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = ((i * 30 - 90) * Math.PI) / 180;
            const d = 131; // half of 280 - 9
            return (
              <div key={i} className="absolute rounded-full z-20 pointer-events-none"
                style={{
                  width: 9, height: 9,
                  top: '50%', left: '50%',
                  marginTop: -4.5, marginLeft: -4.5,
                  transform: `translate(${d * Math.cos(angle)}px, ${d * Math.sin(angle)}px)`,
                  backgroundColor: i % 2 === 0 ? '#ffea79' : '#ff0055',
                  boxShadow: i % 2 === 0 ? '0 0 5px #ffd000' : '0 0 5px #ff0055',
                  border: '1px solid #1b1214',
                }}
              />
            );
          })}

          {/* Spinning disc */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              transform: `rotate(${rotateDeg}deg)`,
              transition: isSpinning
                ? `transform ${SPIN_MS}ms cubic-bezier(0.08, 0.82, 0.17, 1)`
                : 'none',
            }}
          >
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              {/* Segment fills */}
              {WHEEL_REWARDS.map((r, i) => (
                <path key={r.id} d={segPath(i)} fill={r.color} stroke="#1b1214" strokeWidth="1.2" />
              ))}

              {/* Divider lines */}
              {WHEEL_REWARDS.map((_, i) => {
                const a = ((i * SEG_DEG - 90) * Math.PI) / 180;
                return (
                  <line key={`div-${i}`}
                    x1={CX} y1={CY}
                    x2={CX + R * Math.cos(a)} y2={CY + R * Math.sin(a)}
                    stroke="#1b1214" strokeWidth="1.4"
                  />
                );
              })}

              {/* Emoji labels */}
              {WHEEL_REWARDS.map((r, i) => {
                const pos = labelPos(i, 32);
                const posText = labelPos(i, 22);
                return (
                  <g key={`lbl-${r.id}`}>
                    <text
                      x={pos.x} y={pos.y}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize="9" style={{ userSelect: 'none' }}
                    >
                      {r.emoji}
                    </text>
                    <text
                      x={posText.x} y={posText.y}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize="3.8"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={r.textColor}
                      style={{ userSelect: 'none' }}
                    >
                      {r.name}
                    </text>
                  </g>
                );
              })}

              {/* Centre hub */}
              <circle cx={CX} cy={CY} r="10" fill="#1b1214" stroke="#ffd000" strokeWidth="1.5" />
              <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="5" fill="#ffea79" fontFamily="monospace" fontWeight="bold"
                style={{ userSelect: 'none' }}>SPIN</text>
            </svg>
          </div>
        </div>
        {/* ── End Wheel ── */}

        {/* Won Banner */}
        {wonReward && (
          <div className="p-3 bg-gradient-to-r from-[#ffe2e6] via-[#ffea79] to-[#ebfff4] chunky-border animate-in zoom-in duration-200 mb-3 space-y-0.5">
            <div className="font-pixel text-[8px] text-[#ff0055] font-bold">🎉 SELAMAT! ANDA MENDAPATKAN:</div>
            <div className="font-headline font-bold text-xl text-[#1b1214]">{wonReward.emoji} {wonReward.name}</div>
            <p className="font-body text-xs text-[#4a3034]">{wonReward.description}</p>
          </div>
        )}

        {/* Spin Buttons */}
        <div className="space-y-2">
          {hasFreeSpin ? (
            <button
              disabled={isSpinning}
              onClick={() => doSpin('free')}
              onMouseEnter={() => playHoverSound()}
              className="w-full py-3.5 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[9px] chunky-border arcade-btn font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#1b1214] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              {isSpinning ? 'SEDANG MEMUTAR…' : 'PUTAR GRATIS SEKARANG!'}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isSpinning || user.coins < 50}
                onClick={() => doSpin('coins')}
                onMouseEnter={() => playHoverSound()}
                className="py-2.5 bg-[#ffea79] hover:bg-[#ffd000] text-[#1b1214] font-pixel text-[7.5px] chunky-border arcade-btn font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1b1214] disabled:opacity-50"
              >
                🪙 Putar (50 Gold)
              </button>
              <button
                disabled={isSpinning || user.gems < 5}
                onClick={() => doSpin('gems')}
                onMouseEnter={() => playHoverSound()}
                className="py-2.5 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] font-pixel text-[7.5px] chunky-border arcade-btn font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1b1214] disabled:opacity-50"
              >
                💎 Lucky (5 Gems)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-[#ffe2e6] flex items-center justify-between text-[9px] text-[#805b60] font-body">
          <span>🪙 {user.coins} Gold &bull; 💎 {user.gems} Gems</span>
          <span>Reset gratis: 00:00 WIB</span>
        </div>
      </div>
    </div>
  );
};
