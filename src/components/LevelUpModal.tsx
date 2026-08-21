import React, { useEffect } from 'react';
import { playClickSound, playHoverSound, playLevelUpSound } from '../utils/audio';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
}) => {
  useEffect(() => {
    if (isOpen) {
      playLevelUpSound();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-none chunky-border chunky-shadow p-6 relative text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 mx-auto bg-[#ffd000] border-[4px] border-[#1b1214] shadow-[4px_4px_0px_#1b1214] flex items-center justify-center mb-4 animate-bounce">
          <span
            className="material-symbols-outlined text-[48px] text-[#ff0055]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            military_tech
          </span>
        </div>

        <div className="bg-[#ff0055] text-white font-pixel text-[9px] py-1 px-3 chunky-border inline-block mb-2 uppercase tracking-widest font-bold shadow-[2px_2px_0px_#1b1214]">
          ★ LEVEL UPGRADE! ★
        </div>

        <h3 className="font-headline text-4xl font-bold text-[#ff0055] leading-none mb-1">
          LEVEL {newLevel}!
        </h3>
        <p className="font-body text-xs text-[#4a3034] mb-4">
          Disiplin Anda membuahkan kekuatan baru. Semua atribut meningkat!
        </p>

        {/* Rewards on level up */}
        <div className="bg-[#fff6f8] p-3.5 chunky-border mb-5 space-y-2 text-left">
          <div className="flex justify-between items-center font-pixel text-[8px] text-[#ff6b00] font-bold">
            <span>+ Bonus Koin Emas</span>
            <span>+300 Gold</span>
          </div>
          <div className="flex justify-between items-center font-pixel text-[8px] text-[#ff0055] font-bold">
            <span>+ Hadiah Permata</span>
            <span>+15 Gems</span>
          </div>
          <div className="flex justify-between items-center font-pixel text-[8px] text-[#007d7a] font-bold">
            <span>+ Pemulihan Energi Fokus</span>
            <span>MAX 100% PENUH</span>
          </div>
        </div>

        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          onMouseEnter={() => playHoverSound()}
          className="w-full py-3.5 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[10px] chunky-border arcade-btn transition-all cursor-pointer font-bold"
        >
          KLAIM KEJAYAAN & LANJUTKAN
        </button>
      </div>
    </div>
  );
};
