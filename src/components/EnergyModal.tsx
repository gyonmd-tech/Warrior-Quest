import React, { useState, useEffect } from 'react';
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

const MAX_DAILY_FREE_RESTS = 3;

export const EnergyModal: React.FC<EnergyModalProps> = ({
  isOpen,
  onClose,
  currentEnergy,
  maxEnergy,
  onRecharge,
  userCoins,
}) => {
  const [freeRestsUsed, setFreeRestsUsed] = useState<number>(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('warrior_free_rests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          return parsed.count;
        }
      } catch {
        return 0;
      }
    }
    return 0;
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(
      'warrior_free_rests',
      JSON.stringify({ date: today, count: freeRestsUsed })
    );
  }, [freeRestsUsed]);

  if (!isOpen) return null;

  const isFull = currentEnergy >= maxEnergy;
  const missingEnergy = Math.max(0, maxEnergy - currentEnergy);
  const freeRestsLeft = Math.max(0, MAX_DAILY_FREE_RESTS - freeRestsUsed);

  const handleAction = (amount: number, costGold = 0, isFree = false) => {
    if (isFull) {
      alert('Stamina energi Anda sudah 100% penuh!');
      return;
    }

    if (costGold > userCoins) {
      alert('Koin emas di kantong Anda tidak mencukupi!');
      return;
    }

    if (isFree && freeRestsLeft <= 0) {
      alert('Batas istirahat gratis harian Anda sudah habis (3/3). Reset pukul 00:00!');
      return;
    }

    if (costGold > 0) playCoinSound();
    playRewardSound();
    confetti({
      particleCount: 45,
      spread: 65,
      colors: ['#39ff14', '#00f5ff', '#ffd000'],
    });

    if (isFree) {
      setFreeRestsUsed((prev) => prev + 1);
    }

    onRecharge(amount, costGold);
    onClose();
  };

  const energyPercent = Math.min(100, Math.round((currentEnergy / maxEnergy) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-none chunky-border chunky-shadow p-6 relative animate-in zoom-in duration-200 text-center">
        {/* Close Button */}
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

        {/* Icon & Title */}
        <div className="w-16 h-16 mx-auto bg-[#ffea79] chunky-border flex items-center justify-center border-[#1b1214] mb-3 shadow-[3px_3px_0px_#1b1214] hover:scale-105 transition-transform">
          <span
            className="material-symbols-outlined text-[36px] text-[#ff0055]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
        </div>

        <h3 className="font-headline text-2xl font-bold text-[#ff0055] mb-1">
          Sanctuary Pemulihan Stamina
        </h3>
        <p className="font-body text-xs text-[#4a3034] mb-3">
          Energi digunakan untuk duel fokus Pomodoro dan menyerang World Boss.
        </p>

        {/* Energy Bar Status */}
        <div className="p-3 bg-[#fff6f8] chunky-border mb-4 text-left">
          <div className="flex justify-between items-center font-pixel text-[8px] font-bold text-[#1b1214] mb-1.5">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#007d7a]">battery_charging_full</span>
              KAPASITAS ENERGI
            </span>
            <span className="text-[#007d7a]">
              {currentEnergy}/{maxEnergy} ({energyPercent}%)
            </span>
          </div>

          <div className="w-full h-3.5 bg-white chunky-border overflow-hidden p-0.5">
            <div
              className={`h-full transition-all duration-300 ${
                isFull
                  ? 'bg-[#39ff14]'
                  : energyPercent < 30
                  ? 'bg-[#ff0055]'
                  : 'bg-gradient-to-r from-[#ffd000] to-[#39ff14]'
              }`}
              style={{ width: `${energyPercent}%` }}
            />
          </div>

          {isFull ? (
            <div className="mt-2 py-1 px-2 bg-[#ebfff4] border border-[#39ff14] text-[#007d7a] font-pixel text-[7.5px] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-[#39ff14]">check_circle</span>
              STAMINA SUDAH 100% PENUH — TIDAK PERLU ISI ULANG!
            </div>
          ) : (
            <div className="mt-1.5 flex justify-between font-body text-[10px] text-[#805b60]">
              <span>Kekurangan: +{missingEnergy} Energi</span>
              <span>Kantong Emas: 🪙 {userCoins} Gold</span>
            </div>
          )}
        </div>

        {/* Recharge Options List */}
        <div className="space-y-2.5">
          {/* Option 1: Free Quick Rest */}
          <button
            disabled={isFull || freeRestsLeft <= 0}
            onClick={() => handleAction(20, 0, true)}
            onMouseEnter={() => playHoverSound()}
            className={`w-full p-3 chunky-border flex items-center justify-between transition-all text-left ${
              isFull || freeRestsLeft <= 0
                ? 'bg-gray-100 opacity-60 cursor-not-allowed border-gray-300'
                : 'bg-[#fff6f8] hover:bg-[#ebfff4] cursor-pointer card-hover-pop'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-sm text-[#1b1214]">
                  Istirahat Napas Dalam
                </span>
                <span className="font-pixel text-[7px] bg-[#39ff14] text-[#1b1214] px-1.5 py-0.2 chunky-border font-bold">
                  GRATIS
                </span>
              </div>
              <span className="font-body text-xs text-[#4a3034]">
                Sisa kuota hari ini: <strong className="text-[#ff0055]">{freeRestsLeft}/{MAX_DAILY_FREE_RESTS}x</strong>
              </span>
            </div>
            <span
              className={`font-pixel text-[8px] px-2 py-1 chunky-border font-bold shadow-[1px_1px_0px_#1b1214] ${
                freeRestsLeft > 0 && !isFull
                  ? 'bg-[#39ff14] text-[#1b1214]'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              +20 Energi
            </span>
          </button>

          {/* Option 2: Coffee Potion (100 Gold) */}
          <button
            disabled={isFull || userCoins < 100}
            onClick={() => handleAction(50, 100)}
            onMouseEnter={() => playHoverSound()}
            className={`w-full p-3 chunky-border flex items-center justify-between transition-all text-left ${
              isFull || userCoins < 100
                ? 'bg-gray-100 opacity-60 cursor-not-allowed border-gray-300'
                : 'bg-[#fff6f8] hover:bg-[#ffea79] cursor-pointer card-hover-pop'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-sm text-[#1b1214]">
                  Ramuan Espresso Panggang
                </span>
                {userCoins < 100 && (
                  <span className="font-pixel text-[6.5px] bg-[#ff0055] text-white px-1 py-0.2 chunky-border font-bold">
                    GOLD KURANG
                  </span>
                )}
              </div>
              <span className="font-body text-xs text-[#4a3034]">
                Pulihkan separuh stamina tempur
              </span>
            </div>
            <span
              className={`font-pixel text-[8px] px-2 py-1 chunky-border font-bold shadow-[1px_1px_0px_#1b1214] ${
                userCoins >= 100 && !isFull
                  ? 'bg-[#ffea79] text-[#1b1214]'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              +50 Energi (100g)
            </span>
          </button>

          {/* Option 3: Full Elixir (250 Gold) */}
          <button
            disabled={isFull || userCoins < 250}
            onClick={() => handleAction(maxEnergy, 250)}
            onMouseEnter={() => playHoverSound()}
            className={`w-full p-3 chunky-border flex items-center justify-between transition-all text-left ${
              isFull || userCoins < 250
                ? 'bg-gray-100 opacity-60 cursor-not-allowed border-gray-300'
                : 'bg-[#fff6f8] hover:bg-[#00f5ff] cursor-pointer card-hover-pop'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-sm text-[#1b1214]">
                  Elixir Fokus Mistis
                </span>
                {userCoins < 250 && (
                  <span className="font-pixel text-[6.5px] bg-[#ff0055] text-white px-1 py-0.2 chunky-border font-bold">
                    GOLD KURANG
                  </span>
                )}
              </div>
              <span className="font-body text-xs text-[#4a3034]">
                Pemulihan instan ke 100% penuh
              </span>
            </div>
            <span
              className={`font-pixel text-[8px] px-2 py-1 chunky-border font-bold shadow-[1px_1px_0px_#1b1214] ${
                userCoins >= 250 && !isFull
                  ? 'bg-[#00f5ff] text-[#1b1214]'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              MAX 100% (250g)
            </span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-[#ffe2e6] flex items-center justify-center gap-1.5 text-[10px] text-[#805b60]">
          <span className="material-symbols-outlined text-[14px] text-[#39ff14]">info</span>
          <span>Kuota gratis reset setiap pergantian hari pukul 00:00 WIB.</span>
        </div>
      </div>
    </div>
  );
};

