import React, { useState } from 'react';
import { AVATAR_OPTIONS } from '../data/initialData';
import { UserProfile } from '../types';
import { playClickSound, playHoverSound, playRewardSound } from '../utils/audio';

interface LoginViewProps {
  onLogin: (profile: Partial<UserProfile>, isRegister?: boolean) => void;
  onGuestLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGuestLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [heroName, setHeroName] = useState('Ksatria Petualang');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const selectedClass = AVATAR_OPTIONS[selectedClassIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playRewardSound();
    onLogin(
      {
        name: heroName.trim() || (isRegister ? 'Ksatria Baru' : 'Valiant Alex'),
        email: email.trim() || (isRegister ? 'adventurer@questlog.game' : 'warrior@questlog.game'),
        characterClass: selectedClass.class as UserProfile['characterClass'],
        avatarUrl: selectedClass.url,
      },
      isRegister
    );
  };

  const handleQuickDemoLogin = () => {
    playRewardSound();
    onGuestLogin();
  };

  return (
    <div className="min-h-screen bg-[#fff6f8] game-grid-bg flex items-center justify-center p-4 md:p-8 selection:bg-[#ff0055] selection:text-white animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-none chunky-border chunky-shadow p-6 md:p-8 relative">
        {/* Top Decorative Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#ffea79] text-[#1b1214] px-3.5 py-1 chunky-border font-pixel text-[9px] uppercase tracking-wider mb-3 shadow-[2px_2px_0px_#1b1214] font-bold">
            <span
              className="material-symbols-outlined text-[16px] text-[#ff0055]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              swords
            </span>
            Warrior Quest Log
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-[#ff0055] tracking-tight">
            {isRegister ? 'Tempa Karakter Ksatria' : 'Autentikasi Hero Petualang'}
          </h1>
          <p className="font-body text-xs md:text-sm text-[#4a3034] mt-1">
            {isRegister
              ? 'Pilih arketipe kelas Anda, klaim pedang pertama, dan mulai petualangan produktivitas.'
              : 'Masukkan kredensial guild untuk membuka akses quest aktif, inventori, dan trofi.'}
          </p>
        </div>

        {/* Tab switcher: Login vs Register */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setIsRegister(false);
            }}
            onMouseEnter={() => playHoverSound()}
            className={`py-2.5 font-pixel text-[9px] chunky-border arcade-btn transition-all cursor-pointer font-bold ${
              !isRegister
                ? 'bg-[#00f5ff] text-[#1b1214] shadow-[3px_3px_0px_#1b1214] -translate-y-0.5'
                : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
            }`}
          >
            Ksatria Terdaftar
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setIsRegister(true);
            }}
            onMouseEnter={() => playHoverSound()}
            className={`py-2.5 font-pixel text-[9px] chunky-border arcade-btn transition-all cursor-pointer font-bold ${
              isRegister
                ? 'bg-[#39ff14] text-[#1b1214] shadow-[3px_3px_0px_#1b1214] -translate-y-0.5'
                : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
            }`}
          >
            Petualang Baru
          </button>
        </div>

        {/* Class Selection Carousel */}
        <div className="mb-6">
          <label className="block font-pixel text-[9px] text-[#1b1214] uppercase mb-2 font-bold">
            Pilih Arketipe Kelas Hero:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {AVATAR_OPTIONS.map((opt, idx) => {
              const isSelected = selectedClassIndex === idx;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSelectedClassIndex(idx);
                  }}
                  onMouseEnter={() => playHoverSound()}
                  className={`p-2.5 chunky-border flex flex-col items-center gap-2 transition-all cursor-pointer text-center relative card-hover-pop ${
                    isSelected
                      ? 'bg-[#ffea79] border-[#1b1214] shadow-[4px_4px_0px_#1b1214] -translate-y-1'
                      : 'bg-white hover:bg-[#ffe2e6]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-1 bg-[#39ff14] text-[#1b1214] font-pixel text-[6px] px-1.5 py-0.5 chunky-border z-10 font-bold shadow-[1px_1px_0px_#1b1214]">
                      PILIHAN
                    </div>
                  )}
                  <div className="w-14 h-14 rounded-none chunky-border overflow-hidden bg-[#1b1214] p-0.5">
                    <img
                      src={opt.url}
                      alt={opt.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="font-headline font-bold text-sm text-[#1b1214] block">
                      {opt.class}
                    </span>
                    <span className="font-pixel text-[7px] text-[#ff0055] block mt-0.5 font-bold">
                      {opt.name.split(' ')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="font-body text-xs text-[#007d7a] mt-2 italic bg-[#ffe2e6] p-2 chunky-border font-medium">
            &bull; Bonus Pasif {selectedClass.class}: {selectedClass.description}
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-pixel text-[9px] text-[#1b1214] uppercase mb-1 font-bold">
              Nama Hero Ksatria
            </label>
            <input
              type="text"
              required
              value={heroName}
              onChange={(e) => setHeroName(e.target.value)}
              placeholder="Contoh: Valiant Alex"
              className="w-full px-3.5 py-2.5 bg-[#fff6f8] chunky-border font-headline font-bold text-base text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
            />
          </div>

          <div>
            <label className="block font-pixel text-[9px] text-[#1b1214] uppercase mb-1 font-bold">
              Alamat Email Guild
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hero@guild.org"
              className="w-full px-3.5 py-2.5 bg-[#fff6f8] chunky-border font-body text-sm text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
            />
          </div>

          <div>
            <label className="block font-pixel text-[9px] text-[#1b1214] uppercase mb-1 font-bold">
              Kunci Rahasia Rune (Password)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fff6f8] chunky-border font-body text-sm text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              onMouseEnter={() => playHoverSound()}
              className="flex-1 py-3 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[9.5px] chunky-border arcade-btn transition-all font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#1b1214]"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isRegister ? 'add_circle' : 'login'}
              </span>
              {isRegister ? 'TEMPA HERO & MULAI (LVL 1)' : 'MASUK DENGAN AKUN INI'}
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              onMouseEnter={() => playHoverSound()}
              className="py-3 px-4 bg-[#ffea79] hover:bg-[#ffd000] text-[#1b1214] font-pixel text-[8.5px] chunky-border arcade-btn transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap font-bold shadow-[2px_2px_0px_#1b1214]"
            >
              <span className="material-symbols-outlined text-[18px]">sports_esports</span>
              Coba Mode Demo (Lvl 12)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
