import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Quest, QuestCategory, QuestSubtask, StatAttribute } from '../types';
import {
  playAttackSound,
  playClickSound,
  playCoinSound,
  playHoverSound,
  playRewardSound,
} from '../utils/audio';

interface NewQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'completed'>) => void;
}

interface QuestPreset {
  title: string;
  description: string;
  category: QuestCategory;
  difficultyRating: 1 | 2 | 3 | 4 | 5;
  icon: string;
  statAttribute: StatAttribute;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  subtasks: string[];
}

const QUEST_PRESETS: QuestPreset[] = [
  {
    title: 'Sprint Coding & Selesaikan 2 Bug',
    description: 'Fokus penuh tanpa gangguan sosial media untuk menyelesaikan issue prioritas.',
    category: 'daily',
    difficultyRating: 3,
    icon: 'terminal',
    statAttribute: 'intelligence',
    estimatedMinutes: 45,
    priority: 'high',
    tags: ['Coding', 'Proyek', 'DeepWork'],
    subtasks: ['Reproduksi bug & temukan root cause', 'Tulis patch fix & run test unit', 'Commit & buat pull request'],
  },
  {
    title: 'Workout Fisik & Latihan Kardio 30m',
    description: 'Perkuat raga ksatria dengan kalistenik, pushup, dan peregangan menyeluruh.',
    category: 'daily',
    difficultyRating: 2,
    icon: 'fitness_center',
    statAttribute: 'strength',
    estimatedMinutes: 30,
    priority: 'medium',
    tags: ['Kebugaran', 'Fisik', 'Kesehatan'],
    subtasks: ['Pemanasan dinamis 5 menit', '3 Set Pushup, Squat & Plank', 'Pendinginan & hidrasi 500ml air'],
  },
  {
    title: 'Tuntaskan Bab Buku & Catat Intisari',
    description: 'Asah wawasan mental dengan membaca 20 halaman literatur bermutu.',
    category: 'daily',
    difficultyRating: 2,
    icon: 'menu_book',
    statAttribute: 'intelligence',
    estimatedMinutes: 25,
    priority: 'medium',
    tags: ['Studi', 'Membaca', 'Edukasi'],
    subtasks: ['Membaca bab fokus', 'Highlight poin-poin kunci', 'Tulis 3 rangkuman di buku catatan'],
  },
  {
    title: 'Selesaikan Laporan Bisnis & Strategi Klien',
    description: 'Misi legendaris berdampak tinggi untuk menutup kesepakatan dan hasil optimal.',
    category: 'legendary',
    difficultyRating: 5,
    icon: 'swords',
    statAttribute: 'strength',
    estimatedMinutes: 60,
    priority: 'high',
    tags: ['Bisnis', 'Proyek', 'Laporan'],
    subtasks: ['Analisis data analitik & metrik', 'Susun deck presentasi visual', 'Review proposal akhir & kirim ke klien'],
  },
  {
    title: 'Bersihkan Inbox & Tinjau Backlog Task',
    description: 'Operasi kilat untuk menata kembali jadwal dan mengosongkan antrean tugas.',
    category: 'side',
    difficultyRating: 1,
    icon: 'bolt',
    statAttribute: 'agility',
    estimatedMinutes: 15,
    priority: 'low',
    tags: ['Organisasi', 'Disiplin'],
    subtasks: ['Arsipkan email penting', 'Tolak/delegasikan task minor', 'Prioritaskan 3 misi utama esok'],
  },
  {
    title: 'Meditasi Mindfulness & Jurnal Refleksi',
    description: 'Pulihkan energi batin dan kejernihan pikiran dengan pernapasan teratur.',
    category: 'side',
    difficultyRating: 1,
    icon: 'spa',
    statAttribute: 'vitality',
    estimatedMinutes: 15,
    priority: 'low',
    tags: ['Wellness', 'Refleksi', 'Mental'],
    subtasks: ['10 Menit latihan napas diafragma', 'Tulis 3 hal yang disyukuri hari ini'],
  },
  {
    title: 'Desain Wireframe UI & Moodboard Baru',
    description: 'Eksplorasi ide kreatif dengan palet warna retro dan tipografi tajam.',
    category: 'daily',
    difficultyRating: 3,
    icon: 'palette',
    statAttribute: 'intelligence',
    estimatedMinutes: 45,
    priority: 'medium',
    tags: ['Desain', 'Kreatif', 'UI'],
    subtasks: ['Kumpulkan referensi visual', 'Sketsa layout komponen dasar', 'Uji kontras warna & hierarki'],
  },
  {
    title: 'Audit Keuangan & Alokasi Tabungan',
    description: 'Catat pengeluaran mingguan dan kelola kas pundi ksatria dengan bijak.',
    category: 'side',
    difficultyRating: 2,
    icon: 'monetization_on',
    statAttribute: 'agility',
    estimatedMinutes: 20,
    priority: 'medium',
    tags: ['Keuangan', 'Bisnis'],
    subtasks: ['Rekap mutasi transaksi', 'Update anggaran bulan berjalan', 'Sisihkan tabungan investasi'],
  },
];

const ICON_OPTIONS = [
  { id: 'swords', label: 'Tempur', icon: 'swords', color: 'text-[#ff0055]' },
  { id: 'terminal', label: 'Coding', icon: 'terminal', color: 'text-[#00f5ff]' },
  { id: 'menu_book', label: 'Studi', icon: 'menu_book', color: 'text-[#b537f2]' },
  { id: 'fitness_center', label: 'Workout', icon: 'fitness_center', color: 'text-[#ff6b00]' },
  { id: 'bolt', label: 'Sprint', icon: 'bolt', color: 'text-[#ffd000]' },
  { id: 'psychology', label: 'Pikiran', icon: 'psychology', color: 'text-[#ff0055]' },
  { id: 'track_changes', label: 'Target', icon: 'track_changes', color: 'text-[#39ff14]' },
  { id: 'shield', label: 'Disiplin', icon: 'shield', color: 'text-[#007d7a]' },
  { id: 'palette', label: 'Desain', icon: 'palette', color: 'text-[#b537f2]' },
  { id: 'science', label: 'Riset', icon: 'science', color: 'text-[#00f5ff]' },
  { id: 'monetization_on', label: 'Bisnis', icon: 'monetization_on', color: 'text-[#ffd000]' },
  { id: 'spa', label: 'Wellness', icon: 'spa', color: 'text-[#39ff14]' },
];

const QUICK_TAG_OPTIONS = [
  'Coding',
  'Workout',
  'Studi',
  'Bisnis',
  'Refleksi',
  'Proyek',
  'Kesehatan',
  'Disiplin',
  'Kreatif',
];

const DIFFICULTY_MAP: Record<number, { label: string; multiplier: number; color: string }> = {
  1: { label: 'Mudah (x1.0)', multiplier: 1.0, color: 'text-[#39ff14]' },
  2: { label: 'Sedang (x1.3)', multiplier: 1.3, color: 'text-[#00f5ff]' },
  3: { label: 'Menantang (x1.6)', multiplier: 1.6, color: 'text-[#ffd000]' },
  4: { label: 'Sangat Sulit (x2.0)', multiplier: 2.0, color: 'text-[#ff6b00]' },
  5: { label: 'Nightmare Epic (x3.0)', multiplier: 3.0, color: 'text-[#ff0055]' },
};

export const NewQuestModal: React.FC<NewQuestModalProps> = ({
  isOpen,
  onClose,
  onAddQuest,
}) => {
  const [activeFormTab, setActiveFormTab] = useState<'core' | 'subtasks' | 'rewards'>('core');
  
  // Core Quest Inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('daily');
  const [difficultyRating, setDifficultyRating] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [selectedIcon, setSelectedIcon] = useState('swords');
  const [statAttribute, setStatAttribute] = useState<StatAttribute>('intelligence');
  
  // Subtasks & Checklist
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Duration, Priority, & Tags
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Proyek']);

  // Custom Rewards Override Toggle
  const [customOverride, setCustomOverride] = useState(false);
  const [customXp, setCustomXp] = useState<number | ''>('');
  const [customGold, setCustomGold] = useState<number | ''>('');

  if (!isOpen) return null;

  // Base Rewards Calculation based on Category & Difficulty
  const baseCategoryXp = category === 'legendary' ? 400 : category === 'daily' ? 50 : 15;
  const baseCategoryGold = category === 'legendary' ? 200 : category === 'daily' ? 30 : 10;
  const diffMultiplier = DIFFICULTY_MAP[difficultyRating].multiplier;

  const calculatedXp =
    customOverride && typeof customXp === 'number' && customXp > 0
      ? customXp
      : Math.round(baseCategoryXp * diffMultiplier);

  const calculatedGold =
    customOverride && typeof customGold === 'number' && customGold > 0
      ? customGold
      : Math.round(baseCategoryGold * diffMultiplier);

  const calculatedGems = category === 'legendary' ? (difficultyRating >= 4 ? 10 : 5) : 0;
  const calculatedBossDamage = calculatedXp;

  // Handle Dadu Inspirasi (Preset Randomizer)
  const handleRollDicePreset = () => {
    playAttackSound();
    playCoinSound();
    
    // Pick random preset
    const randomPreset = QUEST_PRESETS[Math.floor(Math.random() * QUEST_PRESETS.length)];
    setTitle(randomPreset.title);
    setDescription(randomPreset.description);
    setCategory(randomPreset.category);
    setDifficultyRating(randomPreset.difficultyRating);
    setSelectedIcon(randomPreset.icon);
    setStatAttribute(randomPreset.statAttribute);
    setEstimatedMinutes(randomPreset.estimatedMinutes);
    setPriority(randomPreset.priority);
    setSelectedTags(randomPreset.tags);
    setSubtasks([...randomPreset.subtasks]);
    setCustomOverride(false);

    confetti({
      particleCount: 35,
      spread: 60,
      colors: ['#ffd000', '#ff0055', '#39ff14', '#00f5ff'],
    });
  };

  // Add Subtask
  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    playClickSound();
    setSubtasks((prev) => [...prev, newSubtaskInput.trim()]);
    setNewSubtaskInput('');
  };

  // Remove Subtask
  const handleRemoveSubtask = (index: number) => {
    playClickSound();
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle Tag
  const handleToggleTag = (tag: string) => {
    playClickSound();
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    playRewardSound();
    confetti({
      particleCount: 75,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ffd000', '#39ff14', '#00f5ff', '#ff0055'],
    });

    const formattedSubtasks: QuestSubtask[] = subtasks.map((stText, idx) => ({
      id: `st-${Date.now()}-${idx}`,
      text: stText,
      completed: false,
    }));

    onAddQuest({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      xpReward: calculatedXp,
      goldReward: calculatedGold,
      gemReward: calculatedGems > 0 ? calculatedGems : undefined,
      bossDamage: calculatedBossDamage,
      difficultyRating,
      icon: selectedIcon,
      statAttribute,
      estimatedMinutes,
      priority,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      subtasks: formattedSubtasks.length > 0 ? formattedSubtasks : undefined,
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setSubtasks([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-none chunky-border chunky-shadow p-4 sm:p-6 relative my-auto max-h-[92vh] flex flex-col justify-between overflow-y-auto animate-in zoom-in duration-200 selection:bg-[#ff0055] selection:text-white">
        
        {/* Close Button */}
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          onMouseEnter={() => playHoverSound()}
          className="absolute top-3.5 right-3.5 w-9 h-9 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] chunky-border flex items-center justify-center transition-colors cursor-pointer arcade-btn z-10"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Top Header with Random Preset Dice Roller */}
        <div className="mb-4 pr-10">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="inline-flex items-center gap-1.5 bg-[#ffea79] text-[#1b1214] px-3 py-0.5 font-pixel text-[8px] uppercase tracking-wider chunky-border font-bold shadow-[2px_2px_0px_#1b1214]">
              <span className="material-symbols-outlined text-[14px] text-[#ff0055]">
                hardware
              </span>
              ANVIL FORGE MISI v2.5
            </span>

            {/* 🎲 Dadu Inspirasi Misi Preset Roller */}
            <button
              type="button"
              onClick={handleRollDicePreset}
              onMouseEnter={() => playHoverSound()}
              title="Acak quest produktif otomatis dari database guild"
              className="px-3 py-1 bg-[#00f5ff] hover:bg-[#39ff14] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn transition-all flex items-center gap-1.5 cursor-pointer font-bold shadow-[2px_2px_0px_#1b1214]"
            >
              <span className="material-symbols-outlined text-[15px] animate-spin" style={{ animationDuration: '6s' }}>
                casino
              </span>
              🎲 DADU INSPIRASI (ACAK PRESET)
            </button>
          </div>

          <h3 className="font-headline text-2xl sm:text-3xl font-bold text-[#ff0055] leading-tight">
            Tempa Quest & Kustomisasi Hadiah
          </h3>
          <p className="font-body text-xs text-[#4a3034] mt-0.5">
            Rancang sasaran misi, pilih ikon rune, tetapkan sub-tugas, dan latih atribut ksatria Anda.
          </p>
        </div>

        {/* Live Reward Calculation HUD Bar (Interactive Anvil Altar) */}
        <div className="bg-gradient-to-r from-[#fff0f3] via-[#fff8eb] to-[#ebfff4] p-2.5 sm:p-3 chunky-border mb-3 sm:mb-4 border-[#1b1214] shadow-[2px_2px_0px_#1b1214]">
          <div className="flex items-center justify-between font-pixel text-[7.5px] sm:text-[8px] text-[#4a3034] mb-1.5 font-bold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] sm:text-[14px] text-[#ff0055]">
                analytics
              </span>
              ESTIMASI TEMPAAN:
            </span>
            <span className="text-[#ff0055]">{DIFFICULTY_MAP[difficultyRating].label}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {/* XP Box */}
            <div className="bg-[#ffea79] p-1.5 sm:p-2 chunky-border flex items-center justify-between text-[#1b1214] shadow-[1px_1px_0px_#1b1214]">
              <span className="font-pixel text-[6.5px] sm:text-[7px] font-bold uppercase flex items-center gap-0.5 sm:gap-1">
                <span className="material-symbols-outlined text-[12px] sm:text-[13px] text-[#ff0055]">swords</span>
                XP
              </span>
              <span className="font-headline font-bold text-xs sm:text-sm text-[#ff0055]">+{calculatedXp}</span>
            </div>

            {/* Gold Bounty */}
            <div className="bg-[#ffd000] p-1.5 sm:p-2 chunky-border flex items-center justify-between text-[#1b1214] shadow-[1px_1px_0px_#1b1214]">
              <span className="font-pixel text-[6.5px] sm:text-[7px] font-bold uppercase flex items-center gap-0.5 sm:gap-1">
                <span className="material-symbols-outlined text-[12px] sm:text-[13px] text-[#ff6b00]">monetization_on</span>
                Gold
              </span>
              <span className="font-headline font-bold text-xs sm:text-sm text-[#1b1214]">+{calculatedGold}g</span>
            </div>

            {/* Raid Boss DMG */}
            <div className="bg-[#fcc2ca] p-1.5 sm:p-2 chunky-border flex items-center justify-between text-[#ff0055] shadow-[1px_1px_0px_#1b1214]">
              <span className="font-pixel text-[6.5px] sm:text-[7px] font-bold uppercase flex items-center gap-0.5 sm:gap-1">
                <span className="material-symbols-outlined text-[12px] sm:text-[13px]">local_fire_department</span>
                Raid
              </span>
              <span className="font-headline font-bold text-xs sm:text-sm">{calculatedBossDamage} pts</span>
            </div>

            {/* Hero Stat Boost */}
            <div className="bg-[#39ff14] p-1.5 sm:p-2 chunky-border flex items-center justify-between text-[#1b1214] shadow-[1px_1px_0px_#1b1214]">
              <span className="font-pixel text-[6.5px] sm:text-[7px] font-bold uppercase flex items-center gap-0.5 sm:gap-1">
                <span className="material-symbols-outlined text-[12px] sm:text-[13px]">military_tech</span>
                Stat
              </span>
              <span className="font-headline font-bold text-xs sm:text-sm uppercase">+{statAttribute.slice(0, 3)}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation for Form Layout */}
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5 mb-3 sm:mb-4">
          {[
            { id: 'core' as const, label: '1. Sasaran', fullLabel: '1. Sasaran & Tingkat', icon: 'flag' },
            { id: 'subtasks' as const, label: `2. Sub-Tugas (${subtasks.length})`, fullLabel: `2. Sub-Tugas (${subtasks.length})`, icon: 'checklist' },
            { id: 'rewards' as const, label: '3. Durasi', fullLabel: '3. Durasi & Tagar', icon: 'tune' },
          ].map((tab) => {
            const isActive = activeFormTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveFormTab(tab.id);
                }}
                onMouseEnter={() => playHoverSound()}
                className={`py-1.5 sm:py-2 px-1 text-center chunky-border font-pixel text-[7px] sm:text-[8px] transition-all cursor-pointer flex items-center justify-center gap-1 font-bold ${
                  isActive
                    ? 'bg-[#ff0055] text-white shadow-[2px_2px_0px_#1b1214] -translate-y-0.5'
                    : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
                }`}
              >
                <span className="material-symbols-outlined text-[13px] sm:text-[14px]">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          
          {/* TAB 1: CORE & DIFFICULTY */}
          {activeFormTab === 'core' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Title Input & Quick Suggestions */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-pixel text-[9px] text-[#1b1214] uppercase font-bold">
                    Judul Sasaran Quest *
                  </label>
                  <span className="font-pixel text-[7px] text-[#805b60]">
                    {title.length}/60 Karakter
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Selesaikan Laporan Keuangan, Sprint Coding 45m..."
                  className="w-full px-3.5 py-2.5 bg-[#fff6f8] chunky-border font-headline font-bold text-base text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
                />

                {/* Quick Title Prefix Chips */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="font-pixel text-[7px] text-[#805b60] font-bold">Saran Prefix:</span>
                  {['[Sprint]', '[Deep Work]', '[Workout]', '[Studi]', '[Review]', '[Wellness]'].map(
                    (prefix) => (
                      <button
                        key={prefix}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          if (!title.startsWith(prefix)) {
                            setTitle(`${prefix} ${title}`.trim());
                          }
                        }}
                        className="px-2 py-0.5 bg-[#fff0f3] hover:bg-[#ffea79] chunky-border font-pixel text-[7px] text-[#1b1214] cursor-pointer"
                      >
                        {prefix}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block font-pixel text-[9px] text-[#1b1214] uppercase mb-1 font-bold">
                  Deskripsi / Syarat Kemenangan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Catat detail penting, kriteria tuntas, tautan dokumen, atau instruksi..."
                  className="w-full px-3.5 py-2 bg-[#fff6f8] chunky-border font-body text-xs text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
                />
              </div>

              {/* Category Tier Selector */}
              <div>
                <label className="block font-pixel text-[9px] text-[#1b1214] uppercase mb-1.5 font-bold">
                  Klasifikasi Kategori Quest
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      type: 'legendary' as const,
                      label: 'Legendary',
                      sub: '+400 XP Base & Raid Boss Focus',
                      color: 'bg-[#ff0055] text-white',
                    },
                    {
                      type: 'daily' as const,
                      label: 'Harian',
                      sub: '+50 XP Base & Rutinitas Disiplin',
                      color: 'bg-[#b537f2] text-white',
                    },
                    {
                      type: 'side' as const,
                      label: 'Side Quest',
                      sub: '+15 XP Base & Quick Wins Cepat',
                      color: 'bg-[#ff6b00] text-white',
                    },
                  ].map((c) => (
                    <button
                      key={c.type}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setCategory(c.type);
                      }}
                      onMouseEnter={() => playHoverSound()}
                      className={`p-2.5 font-pixel text-left chunky-border cursor-pointer transition-all ${
                        category === c.type
                          ? `${c.color} font-bold shadow-[3px_3px_0px_#1b1214] -translate-y-0.5`
                          : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
                      }`}
                    >
                      <span className="block text-[9px] uppercase font-bold">{c.label}</span>
                      <span className="block text-[6.5px] mt-0.5 opacity-90">{c.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Rating Stars (1 to 5) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-pixel text-[9px] text-[#1b1214] uppercase font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#ffd000]">
                      stars
                    </span>
                    Tingkat Kesulitan Quest (Rating Multiplier)
                  </label>
                  <span className="font-pixel text-[8px] font-bold text-[#ff0055]">
                    {DIFFICULTY_MAP[difficultyRating].label}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {([1, 2, 3, 4, 5] as const).map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setDifficultyRating(star);
                      }}
                      onMouseEnter={() => playHoverSound()}
                      className={`py-2 px-1 chunky-border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        difficultyRating === star
                          ? 'bg-[#ffea79] border-[#1b1214] shadow-[3px_3px_0px_#1b1214] -translate-y-1 font-bold'
                          : 'bg-[#fff6f8] hover:bg-[#ffe2e6]'
                      }`}
                    >
                      <div className="flex text-[#ff6b00]">
                        {Array.from({ length: star }).map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-[13px] text-[#ff0055]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <span className="font-pixel text-[7px] text-[#1b1214] mt-1 font-bold">
                        ★ {star}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Simbol Rune & Ikon Misi Selector */}
              <div>
                <label className="block font-pixel text-[9px] text-[#1b1214] uppercase mb-1.5 font-bold">
                  Pilih Simbol Rune / Ikon Misi
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const isSelected = selectedIcon === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setSelectedIcon(opt.id);
                        }}
                        onMouseEnter={() => playHoverSound()}
                        className={`p-2 chunky-border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#ffea79] border-[#1b1214] shadow-[2.5px_2.5px_0px_#1b1214] -translate-y-0.5'
                            : 'bg-[#fff6f8] hover:bg-[#ffe2e6]'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            isSelected ? 'text-[#ff0055]' : opt.color
                          }`}
                          style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {opt.icon}
                        </span>
                        <span className="font-pixel text-[6.5px] text-[#1b1214] uppercase font-bold truncate max-w-full">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBTASKS & STAT BOOST */}
          {activeFormTab === 'subtasks' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Stat Attribute Hero Training */}
              <div>
                <label className="block font-pixel text-[9px] text-[#1b1214] uppercase mb-1.5 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#007d7a]">
                    psychology
                  </span>
                  Latihan Atribut Karakter Hero (+1 Stat Reward)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'strength' as const,
                      label: 'Strength 💪',
                      desc: 'Fisik & Disiplin Keras',
                      color: 'bg-[#ff0055]',
                    },
                    {
                      id: 'agility' as const,
                      label: 'Agility ⚡',
                      desc: 'Kecepatan & Sprint',
                      color: 'bg-[#ff6b00]',
                    },
                    {
                      id: 'intelligence' as const,
                      label: 'Intelligence 🧠',
                      desc: 'Coding & Analisis',
                      color: 'bg-[#00f5ff]',
                    },
                    {
                      id: 'vitality' as const,
                      label: 'Vitality ❤️',
                      desc: 'Kebugaran & Mental',
                      color: 'bg-[#39ff14]',
                    },
                  ].map((st) => {
                    const isSelected = statAttribute === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setStatAttribute(st.id);
                        }}
                        onMouseEnter={() => playHoverSound()}
                        className={`p-2.5 chunky-border text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${st.color} ${st.id === 'intelligence' || st.id === 'vitality' ? 'text-[#1b1214]' : 'text-white'} font-bold shadow-[3px_3px_0px_#1b1214] -translate-y-0.5`
                            : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
                        }`}
                      >
                        <span className="font-headline font-bold text-xs block">{st.label}</span>
                        <span className="font-pixel text-[6.5px] block mt-0.5 opacity-90">{st.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subtasks Checklist Builder */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-pixel text-[9px] text-[#1b1214] uppercase font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#39ff14]">
                      checklist
                    </span>
                    Checklist Langkah Kemenangan (Sub-Tugas)
                  </label>
                  <span className="font-pixel text-[7px] text-[#805b60]">
                    {subtasks.length} Langkah Terdaftar
                  </span>
                </div>

                {/* Subtask Input Field */}
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    placeholder="Ketik tahapan kecil (misal: Buka IDE, Tulis draft bab 1...)"
                    className="flex-1 px-3 py-2 bg-[#fff6f8] chunky-border font-body text-xs text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    onMouseEnter={() => playHoverSound()}
                    className="px-4 py-2 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn font-bold cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    TAMBAH
                  </button>
                </div>

                {/* Subtask Items List */}
                {subtasks.length === 0 ? (
                  <div className="bg-[#fff6f8] p-3 text-center chunky-border border-dashed border-[#fcc2ca]">
                    <p className="font-body text-xs text-[#805b60] italic">
                      Belum ada sub-tugas. Pecah sasaran besar menjadi langkah-langkah kecil untuk kepuasan ekstra!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {subtasks.map((stText, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-[#fff6f8] chunky-border hover:bg-[#ffe2e6] transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="font-pixel text-[7px] text-[#ff0055] font-bold">
                            #{idx + 1}
                          </span>
                          <span className="font-body text-xs text-[#1b1214] truncate">{stText}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(idx)}
                          className="text-[#805b60] hover:text-[#ff0055] p-1 font-bold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DURATION, PRIORITY, & REWARDS OVERRIDE */}
          {activeFormTab === 'rewards' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Duration & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-pixel text-[9px] text-[#1b1214] uppercase mb-1 font-bold">
                    Estimasi Waktu Fokus
                  </label>
                  <select
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#fff6f8] chunky-border font-pixel text-[8px] text-[#1b1214] focus:outline-hidden cursor-pointer"
                  >
                    <option value={10}>10 Menit (Micro Quick Sprint)</option>
                    <option value={15}>15 Menit</option>
                    <option value={25}>25 Menit (1 Sesi Pomodoro)</option>
                    <option value={45}>45 Menit (Sprint Dalam)</option>
                    <option value={60}>60 Menit (1 Jam Fokus)</option>
                    <option value={90}>90 Menit (Deep Work Master)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-pixel text-[9px] text-[#1b1214] uppercase mb-1 font-bold">
                    Tingkat Prioritas
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#fff6f8] chunky-border font-pixel text-[8px] text-[#1b1214] focus:outline-hidden cursor-pointer"
                  >
                    <option value="high">Prioritas Tinggi ⚡ (Harus Hari Ini)</option>
                    <option value="medium">Prioritas Sedang (Normal)</option>
                    <option value="low">Prioritas Ringan (Fleksibel)</option>
                  </select>
                </div>
              </div>

              {/* Tagar Kategori Misi */}
              <div>
                <label className="block font-pixel text-[9px] text-[#1b1214] uppercase mb-1.5 font-bold">
                  Pilih Tagar Misi
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAG_OPTIONS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        onMouseEnter={() => playHoverSound()}
                        className={`px-2.5 py-1 chunky-border font-pixel text-[7.5px] cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#00f5ff] text-[#1b1214] font-bold shadow-[2px_2px_0px_#1b1214] -translate-y-0.5'
                            : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom XP/Gold Override Accordion */}
              <div className="bg-[#fff6f8] p-3 chunky-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-[8px] uppercase font-bold text-[#4a3034]">
                    ⚙️ Penyesuaian Reward Manual (Opsional)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setCustomOverride(!customOverride);
                    }}
                    className={`px-2 py-0.5 font-pixel text-[7px] chunky-border cursor-pointer font-bold ${
                      customOverride ? 'bg-[#ff0055] text-white' : 'bg-white text-[#1b1214]'
                    }`}
                  >
                    {customOverride ? 'CUSTOM AKTIF' : 'AUTO HITUNG'}
                  </button>
                </div>

                {customOverride && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#fcc2ca]">
                    <div>
                      <label className="block font-pixel text-[7px] text-[#1b1214] mb-1 font-bold">
                        Custom XP Reward
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={5000}
                        value={customXp}
                        onChange={(e) => setCustomXp(e.target.value ? Number(e.target.value) : '')}
                        placeholder={String(calculatedXp)}
                        className="w-full px-2.5 py-1.5 bg-white chunky-border font-headline font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-pixel text-[7px] text-[#1b1214] mb-1 font-bold">
                        Custom Gold Bounty
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={5000}
                        value={customGold}
                        onChange={(e) => setCustomGold(e.target.value ? Number(e.target.value) : '')}
                        placeholder={String(calculatedGold)}
                        className="w-full px-2.5 py-1.5 bg-white chunky-border font-headline font-bold text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t-2 border-[#ffe2e6]">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              onMouseEnter={() => playHoverSound()}
              className="py-3 px-5 bg-[#fcc2ca] text-[#1b1214] font-pixel text-[9px] chunky-border arcade-btn cursor-pointer font-bold"
            >
              BATAL
            </button>

            <button
              type="submit"
              onMouseEnter={() => playHoverSound()}
              className="flex-1 py-3.5 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[10px] chunky-border arcade-btn transition-all cursor-pointer font-bold flex items-center justify-center gap-2 shadow-[4px_4px_0px_#1b1214]"
            >
              <span className="material-symbols-outlined text-[20px]">hardware</span>
              FORGE QUEST (+{calculatedXp} XP & +{calculatedGold}g)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
