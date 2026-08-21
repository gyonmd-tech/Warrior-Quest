import React from 'react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { playClickSound, playCoinSound, playHoverSound, playRewardSound } from '../utils/audio';

interface EconomyTreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onNavigateToTab: (tab: 'hero' | 'trophies' | 'quests' | 'rewards') => void;
  onOpenEnergyModal: () => void;
  onBuyStreakFreeze?: () => void;
}

export const EconomyTreasuryModal: React.FC<EconomyTreasuryModalProps> = ({
  isOpen,
  onClose,
  user,
  onNavigateToTab,
  onOpenEnergyModal,
  onBuyStreakFreeze,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-none chunky-border chunky-shadow p-5 sm:p-7 relative animate-in zoom-in duration-200 text-left max-h-[90vh] overflow-y-auto no-scrollbar">
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

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-3 border-b-2 border-[#ffe2e6]">
          <div className="w-14 h-14 bg-[#ffea79] chunky-border flex items-center justify-center text-[#1b1214] shadow-[3px_3px_0px_#1b1214] shrink-0">
            <span
              className="material-symbols-outlined text-[32px] text-[#ff6b00]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              account_balance_wallet
            </span>
          </div>
          <div>
            <span className="font-pixel text-[7.5px] sm:text-[8px] bg-[#39ff14] text-[#1b1214] px-2 py-0.5 chunky-border font-bold uppercase shadow-[1px_1px_0px_#1b1214]">
              EKONOMI SANCTUARY
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-bold text-[#1b1214] mt-0.5">
              Perbendaharaan Gold & Gems
            </h3>
            <p className="font-body text-xs text-[#4a3034]">
              Pahami fungsi, cara mendapatkan, dan tempat membelanjakan mata uang petualangan Anda.
            </p>
          </div>
        </div>

        {/* Current Balances Hero Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {/* Gold Wallet */}
          <div className="bg-[#ffea79] p-4 chunky-border shadow-[3px_3px_0px_#1b1214] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white chunky-border flex items-center justify-center text-[#ff6b00]">
                <span
                  className="material-symbols-outlined text-[30px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  monetization_on
                </span>
              </div>
              <div>
                <span className="font-pixel text-[7.5px] text-[#4a3034] uppercase font-bold">
                  Saldo Gold Ksatria
                </span>
                <h4 className="font-headline text-2xl font-bold text-[#1b1214]">
                  {user.coins} <span className="text-sm font-normal">Gold</span>
                </h4>
              </div>
            </div>
            <span className="font-pixel text-[7px] bg-[#1b1214] text-[#ffd000] px-2 py-1 chunky-border font-bold">
              HARIAN
            </span>
          </div>

          {/* Gems Wallet */}
          <div className="bg-[#ffe2e6] p-4 chunky-border shadow-[3px_3px_0px_#1b1214] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white chunky-border flex items-center justify-center text-[#ff0055]">
                <span
                  className="material-symbols-outlined text-[30px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  diamond
                </span>
              </div>
              <div>
                <span className="font-pixel text-[7.5px] text-[#4a3034] uppercase font-bold">
                  Saldo Permata Langka
                </span>
                <h4 className="font-headline text-2xl font-bold text-[#ff0055]">
                  {user.gems} <span className="text-sm font-normal text-[#1b1214]">Gems</span>
                </h4>
              </div>
            </div>
            <span className="font-pixel text-[7px] bg-[#ff0055] text-white px-2 py-1 chunky-border font-bold">
              LANGKA
            </span>
          </div>
        </div>

        {/* Side-by-Side Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6">
          {/* 1. GOLD GUIDE */}
          <div className="bg-[#fff6f8] p-4 sm:p-5 chunky-border space-y-3.5">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[#ff6b00] text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                monetization_on
              </span>
              <h4 className="font-headline font-bold text-lg text-[#1b1214]">
                1. Koin Emas (Gold) 🪙
              </h4>
            </div>
            <p className="font-body text-xs text-[#4a3034] leading-relaxed">
              Mata uang reguler untuk kebutuhan operasional produktivitas harian ksatria.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white chunky-border">
                <span className="font-headline font-bold text-[#007d7a] block mb-1">
                  📥 Cara Mendapatkan Gold:
                </span>
                <ul className="space-y-1 text-[#4a3034] list-disc list-inside text-[11px]">
                  <li>Selesaikan Quest Harian & Side Quest (+25 sd +150g)</li>
                  <li>Selesaikan Sesi Duel Fokus Pomodoro (+30g)</li>
                  <li>Klaim Hadiah Login Harian (Streak (+50g sd +300g)</li>
                  <li>Bonus Naik Level Hero (+300g)</li>
                </ul>
              </div>

              <div className="p-2.5 bg-white chunky-border">
                <span className="font-headline font-bold text-[#ff6b00] block mb-1">
                  📤 Kegunaan Membelanjakan Gold:
                </span>
                <ul className="space-y-1 text-[#4a3034] list-disc list-inside text-[11px]">
                  <li><strong>Latihan Stat Hero:</strong> Upgrade STR, AGI, INT, VIT (50g / poin)</li>
                  <li><strong>Isi Ulang Energi:</strong> Ramuan Espresso (+50 Energi / 100g)</li>
                  <li><strong>Beli Perlengkapan:</strong> Senjata & Zirah Besi di Toko Merchant</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  onClose();
                  onNavigateToTab('hero');
                }}
                className="flex-1 py-2 bg-[#ffea79] hover:bg-[#ffd000] text-[#1b1214] font-pixel text-[7.5px] chunky-border arcade-btn font-bold text-center"
              >
                Latih Atribut Hero (50g)
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onClose();
                  onOpenEnergyModal();
                }}
                className="flex-1 py-2 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[7.5px] chunky-border arcade-btn font-bold text-center"
              >
                Beli Energi Fokus
              </button>
            </div>
          </div>

          {/* 2. GEMS GUIDE */}
          <div className="bg-[#fff6f8] p-4 sm:p-5 chunky-border space-y-3.5">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[#ff0055] text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                diamond
              </span>
              <h4 className="font-headline font-bold text-lg text-[#1b1214]">
                2. Permata Langka (Gems) 💎
              </h4>
            </div>
            <p className="font-body text-xs text-[#4a3034] leading-relaxed">
              Mata uang prestise langka yang didapat dari pencapaian legendaris dan pertarungan bos.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white chunky-border">
                <span className="font-headline font-bold text-[#ff0055] block mb-1">
                  📥 Cara Mendapatkan Gems:
                </span>
                <ul className="space-y-1 text-[#4a3034] list-disc list-inside text-[11px]">
                  <li>Kalahkan World Boss Raid (+10 sd +25 Gems)</li>
                  <li>Buka Prestasi Medali Trofi di Aula Kehormatan (+5 sd +20 Gems)</li>
                  <li>Selesaikan 7-Hari Streak Disiplin Penuh (+15 Gems)</li>
                  <li>Milestone Besar Level Ksatria (Level 5, 10, 15, dst.)</li>
                </ul>
              </div>

              <div className="p-2.5 bg-white chunky-border">
                <span className="font-headline font-bold text-[#b537f2] block mb-1">
                  📤 Kegunaan Membelanjakan Gems:
                </span>
                <ul className="space-y-1 text-[#4a3034] list-disc list-inside text-[11px]">
                  <li><strong>Senjata Mitik Legendaris:</strong> Excalibur Neon & Cyber Aegis</li>
                  <li><strong>Companion Pet Tempur:</strong> Hewan peliharaan pendamping quest</li>
                  <li><strong>Pelindung Streak (Streak Freeze):</strong> Amankan streak saat libur (10 Gems)</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  onClose();
                  onNavigateToTab('trophies');
                }}
                className="flex-1 py-2 bg-[#ff0055] hover:bg-[#b9003f] text-white font-pixel text-[7.5px] chunky-border arcade-btn font-bold text-center"
              >
                Klaim Trofi Gems
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onClose();
                  onNavigateToTab('hero');
                }}
                className="flex-1 py-2 bg-[#00f5ff] hover:bg-[#00c4cc] text-[#1b1214] font-pixel text-[7.5px] chunky-border arcade-btn font-bold text-center"
              >
                Toko Mistik Armory
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Action: Streak Freeze Shield */}
        <div className="p-4 bg-gradient-to-r from-[#ffe2e6] to-[#ffea79] chunky-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white chunky-border flex items-center justify-center text-[#007d7a] shrink-0">
              <span className="material-symbols-outlined text-[24px]">shield</span>
            </div>
            <div>
              <span className="font-headline font-bold text-sm text-[#1b1214] block">
                Pelindung Streak Disiplin (Streak Freeze Shield)
              </span>
              <span className="font-body text-xs text-[#4a3034]">
                Melindungi streak harian Anda agar tidak reset jika terlewat 1 hari libur/darurat.
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (user.gems < 10) {
                alert('Gems Anda tidak cukup (butuh 10 Gems). Kalahkan Boss atau klaim Trofi untuk mendapatkan Gems!');
                return;
              }
              playRewardSound();
              confetti({
                particleCount: 50,
                spread: 70,
                colors: ['#00f5ff', '#39ff14', '#ff0055'],
              });
              if (onBuyStreakFreeze) onBuyStreakFreeze();
              alert('🛡️ Pelindung Streak berhasil diaktifkan! Streak Anda terlindungi.');
              onClose();
            }}
            onMouseEnter={() => playHoverSound()}
            className="px-4 py-2.5 bg-[#ff0055] hover:bg-[#39ff14] hover:text-[#1b1214] text-white font-pixel text-[8px] chunky-border arcade-btn font-bold whitespace-nowrap cursor-pointer shrink-0 shadow-[2px_2px_0px_#1b1214]"
          >
            BELI PELINDUNG (10 💎)
          </button>
        </div>
      </div>
    </div>
  );
};
