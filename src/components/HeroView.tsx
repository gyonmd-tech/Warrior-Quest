import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { AVATAR_OPTIONS } from '../data/initialData';
import { HeroEquipment, UserProfile } from '../types';
import {
  playClickSound,
  playCoinSound,
  playEquipSound,
  playHoverSound,
  playRewardSound,
} from '../utils/audio';

interface HeroViewProps {
  user: UserProfile;
  equipment: HeroEquipment[];
  onToggleEquip: (id: string) => void;
  onBuyEquipment: (item: HeroEquipment) => void;
  onUpdateStats: (statName: keyof UserProfile['stats']) => void;
  onUpdateProfile: (
    name: string,
    title: string,
    avatarUrl?: string,
    characterClass?: UserProfile['characterClass']
  ) => void;
  onLogout: () => void;
  onNavigateToTrophies?: () => void;
  onOpenEconomyModal?: () => void;
}

// Icon helper ensuring valid material symbol ligatures
const getEquipmentIcon = (icon: string) => {
  if (!icon || icon === 'vest') return 'shield_with_heart';
  return icon;
};

export const HeroView: React.FC<HeroViewProps> = ({
  user,
  equipment,
  onToggleEquip,
  onBuyEquipment,
  onUpdateStats,
  onUpdateProfile,
  onLogout,
  onNavigateToTrophies,
}) => {
  const [activeTab, setActiveTab] = useState<'gear' | 'shop' | 'stats' | 'profile'>('gear');
  const [editName, setEditName] = useState(user.name);
  const [editTitle, setEditTitle] = useState(user.title || 'Vanguard of Daily Discipline');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl);
  const [selectedClass, setSelectedClass] = useState<UserProfile['characterClass']>(user.characterClass);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    playRewardSound();
    onUpdateProfile(editName, editTitle, selectedAvatar, selectedClass);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleEquipClick = (id: string) => {
    playEquipSound();
    onToggleEquip(id);
  };

  const handleBuy = (item: HeroEquipment) => {
    if (
      (item.priceGold && user.coins < item.priceGold) ||
      (item.priceGems && user.gems < item.priceGems)
    ) {
      alert('Koin atau Gems Anda tidak mencukupi untuk membeli perlengkapan ini!');
      return;
    }
    playCoinSound();
    playRewardSound();
    confetti({
      particleCount: 55,
      spread: 70,
      colors: ['#ffd000', '#39ff14', '#00f5ff', '#ff0055'],
    });
    onBuyEquipment(item);
  };

  const equippedCount = equipment.filter((e) => e.equipped).length;

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* Hero Header Card with Strong Visuals */}
      <div className="bg-gradient-to-r from-[#ffe2e6] via-[#ffd0d7] to-[#ffea79] p-4 sm:p-5 lg:p-6 rounded-none chunky-border chunky-shadow relative overflow-hidden">
        {/* Background splash effect */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#ff0055] opacity-10 rounded-full pointer-events-none" />

        {/* Hero Profile Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 text-center sm:text-left relative z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-none chunky-border bg-[#1b1214] p-1 border-[#39ff14] shrink-0 shadow-[4px_4px_0px_#1b1214] hover:scale-105 hover:rotate-[-2deg] transition-all overflow-hidden">
            <img
              src={user.avatarUrl}
              alt="Hero Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
              <span className="font-pixel text-[7.5px] sm:text-[8px] bg-[#ff0055] text-white px-2 py-0.5 chunky-border font-bold uppercase shadow-[1px_1px_0px_#1b1214]">
                LVL {user.level}
              </span>
              <span className="font-pixel text-[7.5px] sm:text-[8px] bg-[#00f5ff] text-[#1b1214] px-2 py-0.5 chunky-border font-bold shadow-[1px_1px_0px_#1b1214]">
                {user.characterClass.toUpperCase()}
              </span>
              <span className="font-pixel text-[7.5px] sm:text-[8px] bg-[#39ff14] text-[#1b1214] px-2 py-0.5 chunky-border font-bold shadow-[1px_1px_0px_#1b1214]">
                WARRIORS GUILD
              </span>
            </div>

            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#ff0055] mt-1 leading-tight break-words">
              {user.name}
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#4a3034] mt-0.5 flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
              <span>Gelar: <strong>{user.title || 'Vanguard of Daily Discipline'}</strong></span>
              <span>&bull;</span>
              <span>
                Energi: <strong className="text-[#007d7a]">{user.energy}/{user.maxEnergy}</strong>
              </span>
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-2.5 flex-wrap">
              <div
                onClick={() => {
                  playClickSound();
                  if (onOpenEconomyModal) onOpenEconomyModal();
                }}
                onMouseEnter={() => playHoverSound()}
                title="Koin Emas - Klik untuk Info & Toko"
                className="flex items-center gap-1.5 font-pixel text-[8px] sm:text-[8.5px] text-[#1b1214] bg-[#ffea79] hover:bg-[#ffd000] px-3 py-1 chunky-border font-bold shadow-[2px_2px_0px_#1b1214] cursor-pointer arcade-btn"
              >
                <span
                  className="material-symbols-outlined text-[16px] text-[#ff6b00]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  monetization_on
                </span>
                <span>{user.coins} Gold</span>
              </div>
              <div
                onClick={() => {
                  playClickSound();
                  if (onOpenEconomyModal) onOpenEconomyModal();
                }}
                onMouseEnter={() => playHoverSound()}
                title="Permata Langka - Klik untuk Info & Toko"
                className="flex items-center gap-1.5 font-pixel text-[8px] sm:text-[8.5px] text-[#ff0055] bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white px-3 py-1 chunky-border font-bold shadow-[2px_2px_0px_#1b1214] cursor-pointer arcade-btn"
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  diamond
                </span>
                <span>{user.gems} Gems</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher - Responsive Full-Width Grid (Never overflows or cuts off) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full mt-4 pt-3.5 border-t-2 border-[#1b1214]/15 relative z-10">
          {[
            { id: 'gear', label: 'Armory Gear', icon: 'shield', bg: 'bg-[#00f5ff]' },
            { id: 'shop', label: 'Toko Merchant', icon: 'storefront', bg: 'bg-[#ffd000]' },
            { id: 'stats', label: 'Atribut Stats', icon: 'fitness_center', bg: 'bg-[#39ff14]' },
            { id: 'profile', label: 'Profil Hero', icon: 'badge', bg: 'bg-[#ff0055]' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  setActiveTab(tab.id as any);
                }}
                onMouseEnter={() => playHoverSound()}
                className={`w-full py-2.5 px-2 font-pixel text-[7.5px] sm:text-[8.5px] chunky-border cursor-pointer transition-all flex items-center justify-center gap-1.5 text-center arcade-btn font-bold ${
                  isActive
                    ? `${tab.bg} ${tab.id === 'profile' ? 'text-white' : 'text-[#1b1214]'} shadow-[3px_3px_0px_#1b1214] -translate-y-0.5`
                    : 'bg-white text-[#4a3034] hover:bg-[#ffe2e6]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="space-y-4">
        {/* Tab 1: Armory Loadout */}
        {activeTab === 'gear' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg sm:text-xl font-bold text-[#ff0055] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ff0055]">shield_with_heart</span>
                Inventaris & Perlengkapan Tempur
              </h3>
              <span className="font-pixel text-[7.5px] sm:text-[8px] bg-[#39ff14] text-[#1b1214] px-2.5 py-1 chunky-border font-bold">
                {equippedCount} Terpasang
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-5">
              {equipment
                .filter((item) => item.purchased !== false)
                .map((item) => (
                  <div
                    key={item.id}
                    onMouseEnter={() => playHoverSound()}
                    className={`p-4 sm:p-5 chunky-border chunky-shadow flex items-center justify-between gap-3.5 card-hover-pop transition-all overflow-hidden ${
                      item.equipped
                        ? 'bg-white border-[#39ff14] ring-2 ring-[#39ff14]'
                        : 'bg-[#fff6f8]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-13 h-13 rounded-none chunky-border flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1b1214] overflow-hidden select-none ${
                          item.equipped
                            ? 'bg-[#39ff14] text-[#1b1214]'
                            : 'bg-[#fcc2ca] text-[#805b60]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[26px] leading-none select-none">
                          {getEquipmentIcon(item.icon)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-headline font-bold text-base text-[#1b1214] truncate">
                          {item.name}
                        </h4>
                        <p className="font-pixel text-[8px] sm:text-[8.5px] text-[#007d7a] mt-0.5 font-bold truncate">
                          {item.stats}
                        </p>
                        <span className="font-body text-xs text-[#805b60] uppercase block truncate mt-0.5">
                          Tipe: {item.type} (Lvl {item.levelReq})
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEquipClick(item.id)}
                      onMouseEnter={() => playHoverSound()}
                      className={`px-4 py-2.5 font-pixel text-[8px] sm:text-[8.5px] chunky-border arcade-btn cursor-pointer transition-all shrink-0 font-bold shadow-[2px_2px_0px_#1b1214] ${
                        item.equipped
                          ? 'bg-[#ffea79] text-[#1b1214]'
                          : 'bg-[#00f5ff] hover:bg-[#39ff14] text-[#1b1214]'
                      }`}
                    >
                      {item.equipped ? 'LEPAS' : 'PASANG'}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 2: Merchant Shop */}
        {activeTab === 'shop' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#fff6f8] p-3.5 sm:p-4 chunky-border">
              <div>
                <h3 className="font-headline text-xl sm:text-2xl font-bold text-[#ff6b00] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ff6b00]">storefront</span>
                  Pandai Besi & Toko Merchant
                </h3>
                <p className="font-body text-xs text-[#4a3034] mt-0.5">
                  Tukarkan koin emas 🪙 atau permata 💎 hasil petualangan dengan gear tempur!
                </p>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  if (onOpenEconomyModal) onOpenEconomyModal();
                }}
                onMouseEnter={() => playHoverSound()}
                className="px-3.5 py-2 bg-[#ffea79] hover:bg-[#ffd000] text-[#1b1214] font-pixel text-[7.5px] sm:text-[8px] chunky-border arcade-btn font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-[2px_2px_0px_#1b1214]"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ff0055]">help</span>
                PANDUAN GOLD VS GEMS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-5">
              {equipment
                .filter((item) => item.purchased === false)
                .map((item) => (
                  <div
                    key={item.id}
                    onMouseEnter={() => playHoverSound()}
                    className="bg-white p-5 chunky-border chunky-shadow card-hover-pop flex flex-col justify-between gap-4 overflow-hidden"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-14 h-14 rounded-none bg-[#ffea79] text-[#1b1214] chunky-border flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1b1214] overflow-hidden select-none">
                        <span className="material-symbols-outlined text-[28px] leading-none select-none">
                          {getEquipmentIcon(item.icon)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-headline font-bold text-lg text-[#1b1214] truncate">
                          {item.name}
                        </h4>
                        <p className="font-body text-xs sm:text-sm text-[#4a3034] mt-0.5 line-clamp-2">{item.description}</p>
                        <div className="font-pixel text-[8px] sm:text-[8.5px] text-[#007d7a] mt-1.5 font-bold truncate">
                          Bonus: {item.stats}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t-2 border-[#ffe2e6] flex items-center justify-between">
                      <div className="flex items-center gap-2 font-pixel text-[8px] sm:text-[8.5px] font-bold">
                        {item.priceGold && (
                          <span className="text-[#ff6b00] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">
                              monetization_on
                            </span>
                            {item.priceGold} Gold
                          </span>
                        )}
                        {item.priceGems && (
                          <span className="text-[#ff0055] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">diamond</span>
                            +{item.priceGems} Gems
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleBuy(item)}
                        onMouseEnter={() => playHoverSound()}
                        className="px-4 py-2.5 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[8px] sm:text-[8.5px] chunky-border arcade-btn transition-all cursor-pointer font-bold shrink-0 shadow-[2px_2px_0px_#1b1214]"
                      >
                        BELI ITEM
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 3: Attribute Stats Matrix */}
        {activeTab === 'stats' && (
          <div className="bg-white p-5 sm:p-6 chunky-border chunky-shadow space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-2xl font-bold text-[#ff0055]">
                Matriks Atribut Hero
              </h3>
              <span className="font-pixel text-[8px] bg-[#39ff14] text-[#1b1214] px-2 py-0.5 chunky-border font-bold">
                BISA DILATIH
              </span>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: 'strength' as const,
                  label: 'Strength (Damage Serangan Quest)',
                  tier: 'Tier III',
                  val: user.stats.strength,
                  barColor: 'bg-[#ff0055]',
                },
                {
                  key: 'vitality' as const,
                  label: 'Vitality (Kapasitas Maksimal Energi)',
                  tier: 'Tier IV',
                  val: user.stats.vitality,
                  barColor: 'bg-[#00f5ff]',
                },
                {
                  key: 'agility' as const,
                  label: 'Agility (Kecepatan Fokus Pomodoro)',
                  tier: 'Tier II',
                  val: user.stats.agility,
                  barColor: 'bg-[#39ff14]',
                },
                {
                  key: 'intelligence' as const,
                  label: 'Intelligence (Bonus Rasio Multiplier XP)',
                  tier: 'Tier III',
                  val: user.stats.intelligence,
                  barColor: 'bg-[#ffd000]',
                },
              ].map((stat) => (
                <div
                  key={stat.key}
                  onMouseEnter={() => playHoverSound()}
                  className="bg-[#fff6f8] p-4 chunky-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-hover-pop"
                >
                  <div className="flex-1 w-full">
                    <div className="flex justify-between font-headline font-bold text-sm text-[#1b1214] mb-1.5">
                      <span>
                        {stat.label}: <strong>{stat.val}</strong>
                      </span>
                      <span className="text-[#ff0055] font-pixel text-[8px]">{stat.tier}</span>
                    </div>
                    <div className="w-full h-3.5 bg-white chunky-border overflow-hidden p-0.5">
                      <div
                        className={`h-full ${stat.barColor}`}
                        style={{ width: `${Math.min(100, stat.val * 2)}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playCoinSound();
                      onUpdateStats(stat.key);
                    }}
                    onMouseEnter={() => playHoverSound()}
                    className="w-full sm:w-auto px-3.5 py-2 bg-[#ffea79] hover:bg-[#39ff14] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn cursor-pointer whitespace-nowrap font-bold"
                  >
                    +1 UP (50 Gold)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Profil Ksatria */}
        {activeTab === 'profile' && (
          <div className="bg-white p-5 sm:p-6 chunky-border chunky-shadow space-y-5">
            <h3 className="font-headline text-2xl font-bold text-[#ff0055]">
              Profil Karakter Ksatria
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Picker */}
              <div>
                <label className="block font-pixel text-[8px] sm:text-[9px] text-[#1b1214] uppercase mb-2 font-bold">
                  Pilih Avatar Ksatria:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {AVATAR_OPTIONS.map((av) => {
                    const isSelected = selectedAvatar === av.url;
                    return (
                      <div
                        key={av.id}
                        onClick={() => {
                          playClickSound();
                          setSelectedAvatar(av.url);
                          setSelectedClass(av.class as any);
                        }}
                        onMouseEnter={() => playHoverSound()}
                        className={`p-2 chunky-border cursor-pointer transition-all flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#ffea79] border-[#1b1214] shadow-[2px_2px_0px_#1b1214] -translate-y-0.5'
                            : 'bg-[#fff6f8] hover:bg-[#ffe2e6]'
                        }`}
                      >
                        <div className="w-14 h-14 bg-[#1b1214] chunky-border overflow-hidden p-0.5">
                          <img
                            src={av.url}
                            alt={av.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="font-headline font-bold text-xs text-[#1b1214] text-center truncate w-full">
                          {av.name}
                        </span>
                        <span className="font-pixel text-[6.5px] text-[#ff0055] font-bold">
                          {av.class}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Class Selector */}
              <div>
                <label className="block font-pixel text-[8px] sm:text-[9px] text-[#1b1214] uppercase mb-1.5 font-bold">
                  Kelas Karakter
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['Warrior', 'Mage', 'Rogue', 'Paladin'] as const).map((cls) => {
                    const isSelected = selectedClass === cls;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setSelectedClass(cls);
                        }}
                        onMouseEnter={() => playHoverSound()}
                        className={`py-1.5 px-2 font-pixel text-[7.5px] sm:text-[8px] chunky-border cursor-pointer transition-all font-bold ${
                          isSelected
                            ? 'bg-[#ff0055] text-white shadow-[2px_2px_0px_#1b1214]'
                            : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-pixel text-[8px] sm:text-[9px] text-[#1b1214] uppercase mb-1 font-bold">
                  Nama Hero
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fff6f8] chunky-border font-headline font-bold text-base text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
                />
              </div>

              <div>
                <label className="block font-pixel text-[8px] sm:text-[9px] text-[#1b1214] uppercase mb-1 font-bold">
                  Gelar Kehormatan
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fff6f8] chunky-border font-body text-sm text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  onMouseEnter={() => playHoverSound()}
                  className="px-6 py-3 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[9px] chunky-border arcade-btn transition-all cursor-pointer font-bold"
                >
                  SIMPAN PROFIL
                </button>

                {isSaved && (
                  <span className="font-pixel text-[8px] text-[#007d7a] animate-bounce font-bold">
                    ✓ Profil berhasil diperbarui!
                  </span>
                )}
              </div>
            </form>

            <div className="pt-6 border-t-2 border-[#ffe2e6] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-headline font-bold text-sm text-[#1b1214]">
                  Ganti Karakter / Keluar
                </div>
                <p className="font-body text-xs text-[#4a3034]">
                  Keluar dari sesi quest log dan kembali ke layar pemilihan ksatria.
                </p>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  onLogout();
                }}
                onMouseEnter={() => playHoverSound()}
                className="px-5 py-2.5 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] font-pixel text-[9px] chunky-border arcade-btn cursor-pointer whitespace-nowrap font-bold"
              >
                LOGOUT / GANTI HERO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
