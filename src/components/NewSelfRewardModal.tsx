import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { SelfReward } from '../types';
import {
  playClickSound,
  playHoverSound,
  playRewardSound,
} from '../utils/audio';

interface NewSelfRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSelfReward: (reward: Omit<SelfReward, 'id' | 'unlocked' | 'claimed' | 'createdAt'>) => void;
  currentXp: number;
}

const SELF_REWARD_PRESETS = [
  {
    title: 'Kopi Artisanal & Croissant Hangat',
    description: 'Beli secangkir kopi susu gula aren atau specialty espresso favorit di kafe lokal.',
    category: 'treat' as const,
    targetXp: 300,
    icon: 'coffee',
  },
  {
    title: '1 Jam Gaming RPG / Mabar Santai',
    description: 'Main game favorit tanpa gangguan dan rasa bersalah setelah kuota produktif tuntas.',
    category: 'gaming' as const,
    targetXp: 600,
    icon: 'sports_esports',
  },
  {
    title: 'Beli Buku Wishlist / Aksesoris Meja',
    description: 'Beli item idaman dari keranjang belanja online sebagai reward konsistensi kerja.',
    category: 'shopping' as const,
    targetXp: 1000,
    icon: 'shopping_bag',
  },
  {
    title: 'Marathon Film Bioskop & Popcorn',
    description: 'Pesan tiket nonton film terbaru dan nikmati waktu santai akhir pekan.',
    category: 'rest' as const,
    targetXp: 1500,
    icon: 'movie',
  },
  {
    title: 'Makan Malam All You Can Eat / Sushi',
    description: 'Rayakan pencapaian milestone besar dengan traktiran makanan lezat favorit.',
    category: 'treat' as const,
    targetXp: 2000,
    icon: 'ramen_dining',
  },
  {
    title: 'Sesi Pijat Relaksasi / Day Off Tenang',
    description: 'Manjakan tubuh dengan spa, jalan sore di taman, dan istirahat total.',
    category: 'rest' as const,
    targetXp: 2500,
    icon: 'spa',
  },
];

const REWARD_ICONS = [
  { id: 'coffee', label: 'Kopi', icon: 'coffee' },
  { id: 'sports_esports', label: 'Game', icon: 'sports_esports' },
  { id: 'shopping_bag', label: 'Belanja', icon: 'shopping_bag' },
  { id: 'movie', label: 'Nonton', icon: 'movie' },
  { id: 'ramen_dining', label: 'Kuliner', icon: 'ramen_dining' },
  { id: 'spa', label: 'Spa/Rest', icon: 'spa' },
  { id: 'celebration', label: 'Pesta', icon: 'celebration' },
  { id: 'card_giftcard', label: 'Hadiah', icon: 'card_giftcard' },
  { id: 'flight', label: 'Liburan', icon: 'flight' },
  { id: 'headphones', label: 'Musik', icon: 'headphones' },
];

export const NewSelfRewardModal: React.FC<NewSelfRewardModalProps> = ({
  isOpen,
  onClose,
  onAddSelfReward,
  currentXp,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SelfReward['category']>('treat');
  const [targetXp, setTargetXp] = useState<number>(Math.max(100, currentXp + 200));
  const [selectedIcon, setSelectedIcon] = useState('coffee');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof SELF_REWARD_PRESETS[0]) => {
    playClickSound();
    setTitle(preset.title);
    setDescription(preset.description);
    setCategory(preset.category);
    setTargetXp(preset.targetXp);
    setSelectedIcon(preset.icon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetXp <= 0) return;

    playRewardSound();
    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#39ff14', '#ffd000', '#00f5ff', '#ff0055'],
    });

    onAddSelfReward({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      targetXp,
      icon: selectedIcon,
    });

    // Reset & Close
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-none chunky-border chunky-shadow p-4 sm:p-6 relative my-auto max-h-[92vh] flex flex-col justify-between overflow-y-auto animate-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          onMouseEnter={() => playHoverSound()}
          className="absolute top-3.5 right-3.5 w-8 h-8 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] chunky-border flex items-center justify-center transition-colors cursor-pointer arcade-btn z-10"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Header */}
        <div className="mb-3 pr-8">
          <span className="inline-flex items-center gap-1 bg-[#ffea79] text-[#1b1214] px-2.5 py-0.5 font-pixel text-[7.5px] uppercase chunky-border font-bold shadow-[1px_1px_0px_#1b1214] mb-1">
            <span className="material-symbols-outlined text-[13px] text-[#ff0055]">card_giftcard</span>
            TARGET APRESIASI DIRI
          </span>
          <h3 className="font-headline text-xl sm:text-2xl font-bold text-[#ff0055] leading-tight">
            Tambah Self-Reward Baru
          </h3>
          <p className="font-body text-xs text-[#4a3034] mt-0.5">
            Tentukan hadiah yang akan Anda berikan pada diri sendiri saat mencapai target akumulasi XP tertentu.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="mb-3 bg-[#fff6f8] p-2.5 chunky-border">
          <span className="font-pixel text-[7.5px] text-[#805b60] uppercase font-bold block mb-1.5">
            💡 Inspirasi Cepat Hadiah Nyata:
          </span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {SELF_REWARD_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2 py-1 bg-white hover:bg-[#ffea79] chunky-border font-pixel text-[7px] text-[#1b1214] whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[12px] text-[#ff0055]">{p.icon}</span>
                {p.title.split(' ')[0]} ({p.targetXp} XP)
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 flex-1">
          {/* Title */}
          <div>
            <label className="block font-pixel text-[8px] text-[#1b1214] uppercase mb-1 font-bold">
              Nama Hadiah Self-Reward *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Beli Kopi Specialty & Croissant, 1 Jam Main Game..."
              className="w-full px-3 py-2 bg-[#fff6f8] chunky-border font-headline font-bold text-sm text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-pixel text-[8px] text-[#1b1214] uppercase mb-1 font-bold">
              Detail / Catatan Hadiah (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Misal: Varian latte hazelnut di kafe depan kantor, tonton film jam 7 malam..."
              className="w-full px-3 py-1.5 bg-[#fff6f8] chunky-border font-body text-xs text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
            />
          </div>

          {/* Target XP Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-pixel text-[8px] text-[#1b1214] uppercase mb-1 font-bold">
                Target XP Syarat Buka *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={10}
                  step={25}
                  value={targetXp}
                  onChange={(e) => setTargetXp(Math.max(10, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-[#ffea79] chunky-border font-pixel text-xs text-[#1b1214] font-bold focus:outline-hidden"
                />
                <span className="absolute right-2.5 top-2 font-pixel text-[8px] text-[#805b60] font-bold">
                  XP
                </span>
              </div>
              <span className="font-body text-[10px] text-[#805b60] mt-0.5 block">
                XP Anda saat ini: <strong>{currentXp} XP</strong>
              </span>
            </div>

            {/* Category */}
            <div>
              <label className="block font-pixel text-[8px] text-[#1b1214] uppercase mb-1 font-bold">
                Kategori Reward
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#fff6f8] chunky-border font-pixel text-[7.5px] text-[#1b1214] focus:outline-hidden cursor-pointer"
              >
                <option value="treat">Kuliner & Kopi ☕</option>
                <option value="gaming">Gaming & Santai 🎮</option>
                <option value="shopping">Wishlist Belanja 🛍️</option>
                <option value="rest">Istirahat & Spa 💆</option>
                <option value="custom">Hadiah Kustom 🎁</option>
              </select>
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block font-pixel text-[8px] text-[#1b1214] uppercase mb-1 font-bold">
              Pilih Ikon Simbol
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {REWARD_ICONS.map((ic) => (
                <button
                  key={ic.id}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSelectedIcon(ic.id);
                  }}
                  className={`p-2 chunky-border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    selectedIcon === ic.id
                      ? 'bg-[#ffea79] border-[#1b1214] shadow-[2px_2px_0px_#1b1214] -translate-y-0.5 font-bold'
                      : 'bg-[#fff6f8] hover:bg-[#ffe2e6]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] text-[#ff0055]">
                    {ic.icon}
                  </span>
                  <span className="font-pixel text-[6px] truncate max-w-full">{ic.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2 border-t-2 border-[#ffe2e6]">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="py-2.5 px-4 bg-[#fcc2ca] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn font-bold cursor-pointer"
            >
              BATAL
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[9px] chunky-border arcade-btn font-bold cursor-pointer shadow-[3px_3px_0px_#1b1214] flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              SIMPAN TARGET REWARD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
