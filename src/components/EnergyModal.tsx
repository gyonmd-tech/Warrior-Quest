import React from 'react';
import confetti from 'canvas-confetti';
import { playClickSound, playCoinSound, playHoverSound, playRewardSound } from '../utils/audio';

interface EnergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEnergy: number;
  maxEnergy: number;
  onRecharge: (amount: number, costGold?: number) => void;
  userCoins: number;
}

export const EnergyModal: React.FC<EnergyModalProps> = ({
  isOpen,
  onClose,
  currentEnergy,
  maxEnergy,
  onRecharge,
  userCoins,
}) => {
  if (!isOpen) return null;

  const handleAction = (amount: number, costGold = 0) => {
    if (costGold > userCoins) {
      alert('Koin emas di kantong Anda tidak mencukupi!');
      return;
    }
    if (costGold > 0) playCoinSound();
    playRewardSound();
    confetti({
      particleCount: 45,
      spread: 65,
      colors: ['#39ff14', '#00f5ff', '#ffd000'],
    });
    onRecharge(amount, costGold);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-none chunky-border chunky-shadow p-6 relative animate-in zoom-in duration-200 text-center">
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          onMouseEnter={() => playHoverSound()}
          className="absolute top-4 right-4 w-9 h-9 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] chunky-border flex items-center justify-center transition-colors cursor-pointer arcade-btn"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="w-16 h-16 mx-auto bg-[#ffea79] chunky-border flex items-center justify-center border-[#1b1214] mb-3 shadow-[3px_3px_0px_#1b1214] hover:scale-105 transition-transform">
          <span
            className="material-symbols-outlined text-[36px] text-[#ff0055]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
        </div>

        <h3 className="font-headline text-2xl font-bold text-[#ff0055] mb-1">
          Sanctuary Energi Fokus
        </h3>
        <p className="font-body text-xs text-[#4a3034] mb-4">
          Energi digunakan untuk duel fokus dan serangan Boss Raid. Saat ini:{' '}
          <strong className="text-[#007d7a]">
            {currentEnergy}/{maxEnergy}
          </strong>
        </p>

        <div className="space-y-3">
          {/* Quick Rest */}
          <button
            onClick={() => handleAction(20, 0)}
            onMouseEnter={() => playHoverSound()}
            className="w-full p-3.5 bg-[#fff6f8] hover:bg-[#ffe2e6] chunky-border flex items-center justify-between transition-all cursor-pointer group text-left card-hover-pop"
          >
            <div>
              <span className="font-headline font-bold text-sm text-[#1b1214] block">
                Istirahat Napas Dalam
              </span>
              <span className="font-body text-xs text-[#4a3034]">Reset mental 5 menit</span>
            </div>
            <span className="font-pixel text-[8px] bg-[#39ff14] text-[#1b1214] px-2.5 py-1 chunky-border font-bold shadow-[1px_1px_0px_#1b1214]">
              +20 Energi (GRATIS)
            </span>
          </button>

          {/* Coffee Potion */}
          <button
            onClick={() => handleAction(50, 100)}
            onMouseEnter={() => playHoverSound()}
            className="w-full p-3.5 bg-[#fff6f8] hover:bg-[#ffea79] chunky-border flex items-center justify-between transition-all cursor-pointer group text-left card-hover-pop"
          >
            <div>
              <span className="font-headline font-bold text-sm text-[#1b1214] block">
                Ramuan Espresso Panggang
              </span>
              <span className="font-body text-xs text-[#4a3034]">Mendongkrak kewaspadaan instan</span>
            </div>
            <span className="font-pixel text-[8px] bg-[#ffea79] text-[#1b1214] px-2.5 py-1 chunky-border font-bold shadow-[1px_1px_0px_#1b1214]">
              +50 Energi (100g)
            </span>
          </button>

          {/* Full Elixir */}
          <button
            onClick={() => handleAction(maxEnergy, 250)}
            onMouseEnter={() => playHoverSound()}
            className="w-full p-3.5 bg-[#fff6f8] hover:bg-[#00f5ff] chunky-border flex items-center justify-between transition-all cursor-pointer group text-left card-hover-pop"
          >
            <div>
              <span className="font-headline font-bold text-sm text-[#1b1214] block">
                Elixir Fokus Mistis
              </span>
              <span className="font-body text-xs text-[#4a3034]">Pemulihan stamina penuh 100%</span>
            </div>
            <span className="font-pixel text-[8px] bg-[#00f5ff] text-[#1b1214] px-2.5 py-1 chunky-border font-bold shadow-[1px_1px_0px_#1b1214]">
              MAX 100% (250g)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
