import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { AVATAR_OPTIONS } from '../data/initialData';
import { AppSettings, UserProfile } from '../types';
import {
  playAttackSound,
  playBossRoarSound,
  playClickSound,
  playCoinSound,
  playDeleteSound,
  playEquipSound,
  playHoverSound,
  playLevelUpSound,
  playQuestCompleteSound,
  playRewardSound,
  setSoundEnabled,
} from '../utils/audio';

interface SettingsViewProps {
  user: UserProfile;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onUpdateProfile: (
    name: string,
    title: string,
    avatarUrl: string,
    characterClass: UserProfile['characterClass']
  ) => void;
  onResetAllData: () => void;
  onLoadDemoData?: () => void;
  onResetToStarter?: () => void;
  onImportData: (importedJson: string) => boolean;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  settings,
  onUpdateSettings,
  onUpdateProfile,
  onResetAllData,
  onLoadDemoData,
  onResetToStarter,
  onImportData,
  onLogout,
}) => {
  const [activeSection, setActiveSection] = useState<
    'audio' | 'appearance' | 'focus' | 'profile' | 'data' | 'about'
  >('audio');

  // Profile editing local state
  const [editName, setEditName] = useState(user.name);
  const [editTitle, setEditTitle] = useState(user.title || 'Vanguard of Daily Discipline');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl);
  const [selectedClass, setSelectedClass] = useState(user.characterClass);
  const [profileSaved, setProfileSaved] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    playRewardSound();
    onUpdateProfile(editName, editTitle, selectedAvatar, selectedClass);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleToggleSound = (enabled: boolean) => {
    onUpdateSettings({ soundEnabled: enabled });
    setSoundEnabled(enabled);
    if (enabled) {
      setTimeout(() => playRewardSound(), 50);
    }
  };

  const handleExportJson = () => {
    playCoinSound();
    const exportData = {
      user,
      settings,
      exportDate: new Date().toISOString(),
      version: '2.5.0',
    };
    const jsonStr = JSON.stringify(exportData, null, 2);

    // Create download link
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warrior-quest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    navigator.clipboard?.writeText(jsonStr).then(() => {
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2000);
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportData(content);
        if (success) {
          setImportStatus('Data berhasil diimpor!');
          playRewardSound();
          confetti({ particleCount: 50, spread: 60 });
        } else {
          setImportStatus('Format data tidak valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleManualImport = () => {
    if (!importText.trim()) return;
    const success = onImportData(importText.trim());
    if (success) {
      setImportStatus('Data berhasil dipulihkan!');
      playRewardSound();
      confetti({ particleCount: 50, spread: 60 });
      setImportText('');
    } else {
      setImportStatus('Format JSON tidak sesuai format Warrior Quest.');
    }
  };

  const sections = [
    { id: 'audio' as const, label: 'Audio & SFX', icon: 'volume_up', bg: 'bg-[#ff0055]' },
    { id: 'appearance' as const, label: 'Tampilan', icon: 'palette', bg: 'bg-[#b537f2]' },
    { id: 'focus' as const, label: 'Timer Fokus', icon: 'timer', bg: 'bg-[#ff6b00]' },
    { id: 'profile' as const, label: 'Profil Hero', icon: 'badge', bg: 'bg-[#00f5ff]' },
    { id: 'data' as const, label: 'Data & Backup', icon: 'database', bg: 'bg-[#ffd000]' },
    { id: 'about' as const, label: 'Panduan & Info', icon: 'info', bg: 'bg-[#39ff14]' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Settings Header Banner */}
      <div className="bg-gradient-to-r from-[#ffe2e6] via-[#ffd0d7] to-[#ffea79] p-5 sm:p-6 rounded-none chunky-border chunky-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="bg-[#1b1214] text-white font-pixel text-[8px] px-2 py-0.5 chunky-border font-bold shadow-[1.5px_1.5px_0px_#1b1214]">
              KONTROL REALM
            </span>
            <span className="font-pixel text-[8px] bg-[#00f5ff] text-[#1b1214] px-2 py-0.5 chunky-border font-bold shadow-[1.5px_1.5px_0px_#1b1214]">
              PENGATURAN SISTEM
            </span>
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#ff0055]">
            Pengaturan & Preferensi
          </h2>
          <p className="font-body text-xs text-[#4a3034] mt-0.5 max-w-xl">
            Sesuaikan audio 8-bit, tema visual arcade, durasi fokus pertempuran, dan kelola data karakter.
          </p>
        </div>

        <div className="w-14 h-14 bg-white text-[#1b1214] chunky-border flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#1b1214] hover:rotate-12 transition-transform">
          <span className="material-symbols-outlined text-[32px] text-[#ff0055]">settings</span>
        </div>
      </div>

      {/* Navigation Pills with Strong Colors */}
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                playClickSound();
                setActiveSection(s.id);
              }}
              onMouseEnter={() => playHoverSound()}
              className={`px-3.5 py-2 font-pixel text-[8px] chunky-border flex items-center gap-1.5 cursor-pointer transition-all ${
                isActive
                  ? `${s.bg} ${s.id === 'audio' || s.id === 'appearance' ? 'text-white' : 'text-[#1b1214]'} font-bold shadow-[3px_3px_0px_#1b1214] -translate-y-0.5`
                  : 'bg-white text-[#4a3034] hover:bg-[#ffe2e6]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* 1. AUDIO & SFX */}
      {activeSection === 'audio' && (
        <div className="bg-white p-5 md:p-6 chunky-border chunky-shadow space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-[#ffe2e6] pb-3.5">
            <div>
              <h3 className="font-headline text-xl font-bold text-[#1b1214]">
                Audio & Efek Suara 8-Bit Retro
              </h3>
              <p className="font-body text-xs text-[#4a3034]">
                Audio sintetis arcade bawaan Web Audio API tanpa beban kuota/file eksternal.
              </p>
            </div>
            <button
              onClick={() => handleToggleSound(!settings.soundEnabled)}
              onMouseEnter={() => playHoverSound()}
              className={`px-4 py-2.5 font-pixel text-[9px] chunky-border arcade-btn cursor-pointer transition-all font-bold flex items-center gap-2 whitespace-nowrap ${
                settings.soundEnabled
                  ? 'bg-[#39ff14] text-[#1b1214]'
                  : 'bg-[#fcc2ca] text-[#ff0055]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {settings.soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
              {settings.soundEnabled ? 'SUARA AKTIF 🔊' : 'SUARA MATI 🔇'}
            </button>
          </div>

          <div>
            <h4 className="font-pixel text-[8px] uppercase tracking-wider text-[#4a3034] mb-3 font-bold">
              Uji Coba Sound Board (10 Efek Suara Retro)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { name: 'Klik UI', icon: 'touch_app', fn: playClickSound, color: 'hover:bg-[#ffea79]' },
                { name: 'Hover Blip', icon: 'mouse', fn: playHoverSound, color: 'hover:bg-[#00f5ff]' },
                { name: 'Koin Emas', icon: 'monetization_on', fn: playCoinSound, color: 'hover:bg-[#ffd000]' },
                { name: 'Quest Selesai', icon: 'task_alt', fn: playQuestCompleteSound, color: 'hover:bg-[#39ff14]' },
                { name: 'Tebasan Pedang', icon: 'swords', fn: playAttackSound, color: 'hover:bg-[#ff0055] hover:text-white' },
                { name: 'Raungan Bos', icon: 'warning', fn: playBossRoarSound, color: 'hover:bg-[#ff6b00] hover:text-white' },
                { name: 'Pasang Gear', icon: 'shield', fn: playEquipSound, color: 'hover:bg-[#b537f2] hover:text-white' },
                { name: 'Klaim Hadiah', icon: 'diamond', fn: playRewardSound, color: 'hover:bg-[#00f5ff]' },
                { name: 'Level Up!', icon: 'military_tech', fn: playLevelUpSound, color: 'hover:bg-[#ffd000]' },
                { name: 'Laser Zap', icon: 'bolt', fn: playDeleteSound, color: 'hover:bg-[#fcc2ca]' },
              ].map((sfx) => (
                <button
                  key={sfx.name}
                  onClick={() => sfx.fn()}
                  onMouseEnter={() => playHoverSound()}
                  disabled={!settings.soundEnabled}
                  className={`p-3 bg-[#fff6f8] ${sfx.color} text-[#1b1214] chunky-border flex flex-col items-center gap-1.5 cursor-pointer font-pixel text-[8px] disabled:opacity-50 arcade-btn font-bold`}
                >
                  <span className="material-symbols-outlined text-[24px]">{sfx.icon}</span>
                  {sfx.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. TAMPILAN & TEMA */}
      {activeSection === 'appearance' && (
        <div className="bg-white p-5 md:p-6 chunky-border chunky-shadow space-y-6">
          <div className="border-b-2 border-[#ffe2e6] pb-3">
            <h3 className="font-headline text-xl font-bold text-[#1b1214]">
              Tema & Gaya Tampilan
            </h3>
            <p className="font-body text-xs text-[#4a3034]">
              Atur nuansa visual dan kejelasan tata letak aplikasi.
            </p>
          </div>

          {/* Theme Palette Cards */}
          <div>
            <label className="block font-pixel text-[8px] uppercase text-[#4a3034] mb-3 font-bold">
              Pilihan Nuansa Visual
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Retro Pop Art */}
              <div
                onClick={() => {
                  playClickSound();
                  onUpdateSettings({ theme: 'retro-pop' });
                }}
                onMouseEnter={() => playHoverSound()}
                className={`p-4 chunky-border cursor-pointer transition-all card-hover-pop ${
                  settings.theme === 'retro-pop'
                    ? 'bg-[#ffe2e6] border-[#ff0055] shadow-[4px_4px_0px_#1b1214]'
                    : 'bg-[#fff6f8] hover:bg-[#ffe2e6]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-headline font-bold text-sm text-[#ff0055]">Retro Pop Art</span>
                  {settings.theme === 'retro-pop' && (
                    <span className="material-symbols-outlined text-[#ff0055] text-[18px]">
                      check_circle
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 mb-2">
                  <span className="w-5 h-5 bg-[#ff0055] inline-block chunky-border" />
                  <span className="w-5 h-5 bg-[#39ff14] inline-block chunky-border" />
                  <span className="w-5 h-5 bg-[#00f5ff] inline-block chunky-border" />
                  <span className="w-5 h-5 bg-[#ffd000] inline-block chunky-border" />
                </div>
                <p className="font-body text-xs text-[#4a3034]">
                  Gaya pop-art arcade dengan aksen neon tebal & border kontras tinggi.
                </p>
              </div>

              {/* Dark Dungeon */}
              <div
                onClick={() => {
                  playClickSound();
                  onUpdateSettings({ theme: 'dark-dungeon' });
                }}
                onMouseEnter={() => playHoverSound()}
                className={`p-4 chunky-border cursor-pointer transition-all card-hover-pop ${
                  settings.theme === 'dark-dungeon'
                    ? 'bg-[#1b1214] text-white border-[#39ff14] shadow-[4px_4px_0px_#ff0055]'
                    : 'bg-[#fff6f8] hover:bg-[#ffe2e6]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-headline font-bold text-sm ${
                      settings.theme === 'dark-dungeon' ? 'text-[#39ff14]' : 'text-[#1b1214]'
                    }`}
                  >
                    Dark Dungeon
                  </span>
                  {settings.theme === 'dark-dungeon' && (
                    <span className="material-symbols-outlined text-[#39ff14] text-[18px]">
                      check_circle
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 mb-2">
                  <span className="w-5 h-5 bg-[#1b1214] inline-block border border-white" />
                  <span className="w-5 h-5 bg-[#39ff14] inline-block border border-white" />
                  <span className="w-5 h-5 bg-[#ff0055] inline-block border border-white" />
                </div>
                <p
                  className={`font-body text-xs ${
                    settings.theme === 'dark-dungeon' ? 'text-gray-300' : 'text-[#4a3034]'
                  }`}
                >
                  Latar dungeon dengan rune neon hemat daya dan nyaman di mata.
                </p>
              </div>

              {/* Clean Light */}
              <div
                onClick={() => {
                  playClickSound();
                  onUpdateSettings({ theme: 'clean-light' });
                }}
                onMouseEnter={() => playHoverSound()}
                className={`p-4 chunky-border cursor-pointer transition-all card-hover-pop ${
                  settings.theme === 'clean-light'
                    ? 'bg-white border-[#007d7a] shadow-[4px_4px_0px_#1b1214]'
                    : 'bg-[#fff6f8] hover:bg-[#ffe2e6]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-headline font-bold text-sm text-[#007d7a]">Clean Crisp</span>
                  {settings.theme === 'clean-light' && (
                    <span className="material-symbols-outlined text-[#007d7a] text-[18px]">
                      check_circle
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 mb-2">
                  <span className="w-5 h-5 bg-white inline-block chunky-border" />
                  <span className="w-5 h-5 bg-[#007d7a] inline-block chunky-border" />
                  <span className="w-5 h-5 bg-[#ffe2e6] inline-block chunky-border" />
                </div>
                <p className="font-body text-xs text-[#4a3034]">
                  Tampilan lebih tenang, rapi, dan bersih dengan visual teratur.
                </p>
              </div>
            </div>
          </div>

          {/* Display Toggles */}
          <div className="space-y-3 pt-3 border-t-2 border-[#ffe2e6]">
            <div className="flex items-center justify-between p-3.5 bg-[#fff6f8] chunky-border">
              <div>
                <span className="font-headline font-bold text-sm text-[#1b1214] block">
                  Kurangi Animasi Berlebih (Reduce Motion)
                </span>
                <span className="font-body text-xs text-[#4a3034]">
                  Meredam efek bounce dan pulse agar tampilan terasa lebih tenang.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.reduceAnimations}
                onChange={(e) => {
                  playClickSound();
                  onUpdateSettings({ reduceAnimations: e.target.checked });
                }}
                className="w-5 h-5 accent-[#ff0055] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#fff6f8] chunky-border">
              <div>
                <span className="font-headline font-bold text-sm text-[#1b1214] block">
                  Pola Titik Latar Belakang Retro (Dot Grid)
                </span>
                <span className="font-body text-xs text-[#4a3034]">
                  Tampilkan pola titik-titik kertas grafik RPG pada latar halaman.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showGridBackground}
                onChange={(e) => {
                  playClickSound();
                  onUpdateSettings({ showGridBackground: e.target.checked });
                }}
                className="w-5 h-5 accent-[#ff0055] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. TIMER FOKUS & POMODORO */}
      {activeSection === 'focus' && (
        <div className="bg-white p-5 md:p-6 chunky-border chunky-shadow space-y-6">
          <div className="border-b-2 border-[#ffe2e6] pb-3">
            <h3 className="font-headline text-xl font-bold text-[#1b1214]">
              Timer Fokus & Duel Produktivitas
            </h3>
            <p className="font-body text-xs text-[#4a3034]">
              Atur panjang sesi duel fokus Pomodoro untuk mengalahkan monster prokrastinasi.
            </p>
          </div>

          <div>
            <label className="block font-pixel text-[8px] uppercase text-[#4a3034] mb-2 font-bold">
              Durasi Sesi Fokus Pertempuran
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    playClickSound();
                    onUpdateSettings({ focusDurationMinutes: mins });
                  }}
                  onMouseEnter={() => playHoverSound()}
                  className={`py-3 px-2 font-pixel text-[9px] chunky-border arcade-btn cursor-pointer transition-all ${
                    settings.focusDurationMinutes === mins
                      ? 'bg-[#39ff14] text-[#1b1214] font-bold shadow-[2px_2px_0px_#1b1214]'
                      : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
                  }`}
                >
                  {mins} MENIT
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-pixel text-[8px] uppercase text-[#4a3034] mb-2 font-bold">
              Durasi Istirahat Pemulihan (Break Time)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    playClickSound();
                    onUpdateSettings({ breakDurationMinutes: mins });
                  }}
                  onMouseEnter={() => playHoverSound()}
                  className={`py-2.5 px-2 font-pixel text-[8px] chunky-border arcade-btn cursor-pointer transition-all ${
                    settings.breakDurationMinutes === mins
                      ? 'bg-[#00f5ff] text-[#1b1214] font-bold shadow-[2px_2px_0px_#1b1214]'
                      : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
                  }`}
                >
                  {mins} MENIT
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t-2 border-[#ffe2e6]">
            <div className="flex items-center justify-between p-3.5 bg-[#fff6f8] chunky-border">
              <div>
                <span className="font-headline font-bold text-sm text-[#1b1214] block">
                  Otomatis Selesaikan Quest
                </span>
                <span className="font-body text-xs text-[#4a3034]">
                  Tandai quest sebagai selesai dan berikan bonus XP saat timer fokus duel berakhir.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoCompleteOnFocusEnd}
                onChange={(e) => {
                  playClickSound();
                  onUpdateSettings({ autoCompleteOnFocusEnd: e.target.checked });
                }}
                className="w-5 h-5 accent-[#ff0055] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. PROFIL HERO & KARAKTER */}
      {activeSection === 'profile' && (
        <div className="bg-white p-5 md:p-6 chunky-border chunky-shadow space-y-6">
          <div className="border-b-2 border-[#ffe2e6] pb-3">
            <h3 className="font-headline text-xl font-bold text-[#1b1214]">
              Kustomisasi Hero & Avatar
            </h3>
            <p className="font-body text-xs text-[#4a3034]">
              Ubah nama petualang, gelar kehormatan, dan pilih avatar kelas petarung.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar Selector */}
            <div>
              <label className="block font-pixel text-[8px] uppercase text-[#4a3034] mb-2 font-bold">
                Pilih Karakter & Kelas
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.url;
                  return (
                    <div
                      key={avatar.id}
                      onClick={() => {
                        playClickSound();
                        setSelectedAvatar(avatar.url);
                        setSelectedClass(avatar.class as any);
                      }}
                      onMouseEnter={() => playHoverSound()}
                      className={`p-3 chunky-border flex flex-col items-center text-center cursor-pointer transition-all card-hover-pop ${
                        isSelected
                          ? 'bg-[#ffea79] border-[#1b1214] shadow-[3px_3px_0px_#1b1214] -translate-y-1'
                          : 'bg-[#fff6f8] hover:bg-[#ffe2e6]'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-none chunky-border bg-[#1b1214] p-0.5 mb-2 overflow-hidden">
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="font-headline font-bold text-xs text-[#1b1214] block leading-tight">
                        {avatar.name}
                      </span>
                      <span className="font-pixel text-[7px] text-[#ff0055] mt-0.5 font-bold">
                        {avatar.class}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block font-pixel text-[8px] uppercase text-[#1b1214] mb-1 font-bold">
                Nama Pahlawan (Hero Name)
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#fff6f8] chunky-border font-headline font-bold text-base text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
              />
            </div>

            {/* Title Input */}
            <div>
              <label className="block font-pixel text-[8px] uppercase text-[#1b1214] mb-1 font-bold">
                Gelar Kehormatan (Honorific Title)
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
                SIMPAN PROFIL HERO
              </button>

              {profileSaved && (
                <span className="font-pixel text-[8px] text-[#007d7a] animate-bounce font-bold">
                  ✓ Profil Berhasil Diperbarui!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* 5. MANAJEMEN DATA & BACKUP */}
      {activeSection === 'data' && (
        <div className="bg-white p-5 md:p-6 chunky-border chunky-shadow space-y-6">
          <div className="border-b-2 border-[#ffe2e6] pb-3">
            <h3 className="font-headline text-xl font-bold text-[#1b1214]">
              Cadangan & Manajemen Data
            </h3>
            <p className="font-body text-xs text-[#4a3034]">
              Simpan progres quest, level, emas, dan trofi ke file JSON lokal atau pulihkan cadangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Card */}
            <div className="p-4 bg-[#fff6f8] chunky-border space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#007d7a] mb-1">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  <h4 className="font-headline font-bold text-base text-[#1b1214]">
                    Ekspor Data Quest (JSON)
                  </h4>
                </div>
                <p className="font-body text-xs text-[#4a3034]">
                  Unduh seluruh riwayat quest, statistik ksatria, dan inventori ke file cadangan.
                </p>
              </div>

              <button
                onClick={handleExportJson}
                onMouseEnter={() => playHoverSound()}
                className="w-full py-2.5 bg-[#ffea79] hover:bg-[#39ff14] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn cursor-pointer transition-all font-bold flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                {copiedExport ? '✓ TERSALIN KE CLIPBOARD' : 'DOWNLOAD JSON BACKUP'}
              </button>
            </div>

            {/* Import Card */}
            <div className="p-4 bg-[#fff6f8] chunky-border space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#ff0055] mb-1">
                  <span className="material-symbols-outlined text-[20px]">upload_file</span>
                  <h4 className="font-headline font-bold text-base text-[#1b1214]">
                    Impor Cadangan Data
                  </h4>
                </div>
                <p className="font-body text-xs text-[#4a3034]">
                  Pilih file JSON hasil ekspor sebelumnya untuk memulihkan kemajuan game.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={() => playHoverSound()}
                  className="w-full py-2.5 bg-[#00f5ff] hover:bg-[#39ff14] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn cursor-pointer transition-all font-bold flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">folder_open</span>
                  PILIH FILE JSON CADANGAN
                </button>
              </div>
            </div>
          </div>

          {/* Paste JSON text area fallback */}
          <div className="p-4 bg-[#fff6f8] chunky-border space-y-2">
            <label className="block font-pixel text-[8px] uppercase text-[#1b1214] font-bold">
              Atau Tempel (Paste) String JSON Cadangan:
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Tempelkan isi file JSON di sini (contoh: { "user": ... })...'
              className="w-full h-20 p-2.5 bg-white chunky-border font-mono text-xs text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
            />
            <div className="flex justify-end">
              <button
                onClick={handleManualImport}
                onMouseEnter={() => playHoverSound()}
                className="px-4 py-2 bg-[#ffd000] hover:bg-[#39ff14] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn font-bold cursor-pointer"
              >
                PULIHKAN DARI TEKS JSON
              </button>
            </div>
            {importStatus && (
              <p className="font-pixel text-[8px] text-[#ff0055] font-bold mt-1">
                {importStatus}
              </p>
            )}
          </div>

          {/* Presets & Reset Zone */}
          <div className="p-4 border-2 border-dashed border-[#ff0055] bg-[#ffe2e6] space-y-4">
            <div className="flex items-center gap-2 text-[#ff0055]">
              <span className="material-symbols-outlined text-[22px]">tune</span>
              <h4 className="font-headline font-bold text-base text-[#1b1214]">
                Manajemen Akun & Reset Status
              </h4>
            </div>
            <p className="font-body text-xs text-[#4a3034]">
              Pilih apakah Anda ingin memulai dari awal (Level 1 Kosong) atau memuat ulang dataset demo.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {onResetToStarter && (
                <button
                  onClick={() => {
                    playDeleteSound();
                    onResetToStarter();
                    alert('Akun berhasil di-reset ke Level 1 dengan quest starter bersih!');
                  }}
                  onMouseEnter={() => playHoverSound()}
                  className="px-3.5 py-2 bg-white hover:bg-[#ff0055] hover:text-white text-[#ff0055] font-pixel text-[8px] chunky-border arcade-btn cursor-pointer font-bold flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                  RESET KE LEVEL 1 (AWAL BARU)
                </button>
              )}

              {onLoadDemoData && (
                <button
                  onClick={() => {
                    playRewardSound();
                    onLoadDemoData();
                    alert('Data demo Alex (Level 12 Warrior) berhasil dimuat!');
                  }}
                  onMouseEnter={() => playHoverSound()}
                  className="px-3.5 py-2 bg-[#ffea79] hover:bg-[#39ff14] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn cursor-pointer font-bold flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">sports_esports</span>
                  MUAT ULANG DATA DEMO (LVL 12)
                </button>
              )}

              <button
                onClick={onLogout}
                onMouseEnter={() => playHoverSound()}
                className="px-3.5 py-2 bg-[#1b1214] hover:bg-[#4a3034] text-white font-pixel text-[8px] chunky-border arcade-btn cursor-pointer font-bold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">logout</span>
                KELUAR DARI AKUN (LOGOUT)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PANDUAN & INFO */}
      {activeSection === 'about' && (
        <div className="bg-white p-5 md:p-6 chunky-border chunky-shadow space-y-6">
          <div className="border-b-2 border-[#ffe2e6] pb-3">
            <h3 className="font-headline text-xl font-bold text-[#1b1214]">
              Panduan Mekanik & Glosarium RPG
            </h3>
            <p className="font-body text-xs text-[#4a3034]">
              Pelajari formula perolehan XP, bonus stats, dan cara mengalahkan World Boss Raid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#fff6f8] chunky-border space-y-2">
              <h4 className="font-headline font-bold text-base text-[#ff0055] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                Focus Energy & Pomodoro
              </h4>
              <p className="font-body text-xs text-[#4a3034] leading-relaxed">
                Setiap duel fokus pomodoro mengonsumsi 5-10 energi. Menyelesaikan sesi fokus memberikan bonus battle XP 2x lipat dan memulihkan stamina ksatria.
              </p>
            </div>

            <div className="p-4 bg-[#fff6f8] chunky-border space-y-2">
              <h4 className="font-headline font-bold text-base text-[#ff6b00] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                Streak Api Disiplin
              </h4>
              <p className="font-body text-xs text-[#4a3034] leading-relaxed">
                Menyelesaikan setidaknya 1 misi setiap hari akan menjaga streak api tetap membara. Semakin panjang streak, semakin besar multiplier gold & gems yang Anda peroleh!
              </p>
            </div>

            <div className="p-4 bg-[#fff6f8] chunky-border space-y-2">
              <h4 className="font-headline font-bold text-base text-[#007d7a] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">swords</span>
                Raid Boss Encounter
              </h4>
              <p className="font-body text-xs text-[#4a3034] leading-relaxed">
                Setiap kali Anda menuntaskan quest, ksatria Anda melancarkan damage setara reward XP quest ke World Boss Raid. Kalahkan bos sebelum batas waktu habis untuk panen ratusan gems!
              </p>
            </div>

            <div className="p-4 bg-[#fff6f8] chunky-border space-y-2">
              <h4 className="font-headline font-bold text-base text-[#b537f2] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">shield</span>
                Armory & Atribut
              </h4>
              <p className="font-body text-xs text-[#4a3034] leading-relaxed">
                Tingkatkan atribut Strength, Vitality, Agility, dan Intelligence di toko merchant untuk mempercepat pengumpulan level dan memperbesar kapasitas energi maksimal.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-[#ffe2e6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#805b60] font-body">
            <span>Warrior Quest v2.5.0 &bull; Retro 8-bit RPG Habit Tracker</span>
            <button
              onClick={() => {
                playClickSound();
                onLogout();
              }}
              onMouseEnter={() => playHoverSound()}
              className="px-4 py-2 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] font-pixel text-[8px] chunky-border arcade-btn cursor-pointer whitespace-nowrap font-bold"
            >
              LOGOUT / GANTI HERO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
