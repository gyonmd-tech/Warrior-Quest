import React, { useState } from 'react';
import { Quest } from '../types';
import { playClickSound, playHoverSound } from '../utils/audio';
import { QuestCard } from './QuestCard';

interface QuestsViewProps {
  quests: Quest[];
  onToggleComplete: (id: string) => void;
  onToggleSubtask?: (questId: string, subtaskId: string) => void;
  onOpenNewQuestModal: () => void;
  onStartFocus: (quest: Quest) => void;
  onDeleteQuest: (id: string) => void;
}

export const QuestsView: React.FC<QuestsViewProps> = ({
  quests,
  onToggleComplete,
  onToggleSubtask,
  onOpenNewQuestModal,
  onStartFocus,
  onDeleteQuest,
}) => {
  const [filter, setFilter] = useState<'all' | 'legendary' | 'daily' | 'side' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'xp' | 'time'>('default');

  const filteredQuests = quests
    .filter((q) => {
      // Search text match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = q.title.toLowerCase().includes(query);
        const matchDesc = q.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      if (filter === 'legendary') return q.category === 'legendary';
      if (filter === 'daily') return q.category === 'daily';
      if (filter === 'side') return q.category === 'side';
      if (filter === 'active') return !q.completed;
      if (filter === 'completed') return q.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'xp') return b.xpReward - a.xpReward;
      if (sortBy === 'time') return (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0);
      return 0;
    });

  const activeCount = quests.filter((q) => !q.completed).length;
  const completedCount = quests.filter((q) => q.completed).length;
  const legendaryCount = quests.filter((q) => q.category === 'legendary').length;
  const dailyCount = quests.filter((q) => q.category === 'daily').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner and Action */}
      <div className="bg-gradient-to-r from-[#ffe2e6] via-[#ffd0d7] to-[#ffea79] p-5 sm:p-6 rounded-none chunky-border chunky-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff0055] opacity-10 rounded-bl-full pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="bg-[#ff0055] text-white font-pixel text-[8px] px-2 py-0.5 chunky-border font-bold uppercase shadow-[1.5px_1.5px_0px_#1b1214]">
              PAPAN MISI
            </span>
            <span className="font-pixel text-[8px] bg-[#00f5ff] text-[#1b1214] px-2 py-0.5 chunky-border font-bold shadow-[1.5px_1.5px_0px_#1b1214]">
              {activeCount} AKTIF
            </span>
            <span className="font-pixel text-[8px] bg-[#39ff14] text-[#1b1214] px-2 py-0.5 chunky-border font-bold shadow-[1.5px_1.5px_0px_#1b1214]">
              {completedCount} SELESAI
            </span>
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#ff0055]">
            Papan Quest & Misi Tempur
          </h2>
          <p className="font-body text-xs text-[#4a3034] mt-0.5">
            Selesaikan misi harian & tantangan epik, raih battle XP, dan naikkan level karakter ksatria Anda.
          </p>
        </div>

        <button
          onClick={() => {
            playClickSound();
            onOpenNewQuestModal();
          }}
          onMouseEnter={() => playHoverSound()}
          className="w-full sm:w-auto px-6 py-3.5 bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214] font-pixel text-[9px] chunky-border arcade-btn transition-all cursor-pointer font-bold flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          + QUEST BARU
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4.5 chunky-border chunky-shadow space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#805b60] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari misi berdasarkan judul atau deskripsi..."
              className="w-full pl-10 pr-10 py-2 bg-[#fff6f8] chunky-border font-body text-sm text-[#1b1214] focus:outline-hidden focus:ring-2 focus:ring-[#ff0055]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#805b60] hover:text-[#ff0055] font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[8px] text-[#4a3034] shrink-0 font-bold">URUTKAN:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#fff6f8] px-3 py-2 chunky-border font-pixel text-[8px] text-[#1b1214] focus:outline-hidden cursor-pointer"
            >
              <option value="default">Urutan Standar</option>
              <option value="xp">XP Tertinggi</option>
              <option value="time">Durasi Terlama</option>
            </select>
          </div>
        </div>

        {/* Filter Pills with Strong Colors */}
        <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-[#ffe2e6]">
          {[
            { key: 'all', label: `SEMUA (${quests.length})`, bg: 'bg-[#ffea79]', text: 'text-[#1b1214]' },
            { key: 'active', label: `AKTIF (${activeCount})`, bg: 'bg-[#00f5ff]', text: 'text-[#1b1214]' },
            { key: 'legendary', label: `LEGENDARY (${legendaryCount})`, bg: 'bg-[#ff0055]', text: 'text-white' },
            { key: 'daily', label: `HARIAN (${dailyCount})`, bg: 'bg-[#b537f2]', text: 'text-white' },
            { key: 'side', label: 'SIDE QUEST', bg: 'bg-[#ff6b00]', text: 'text-white' },
            { key: 'completed', label: `SELESAI (${completedCount})`, bg: 'bg-[#39ff14]', text: 'text-[#1b1214]' },
          ].map((tab) => {
            const isSelected = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  playClickSound();
                  setFilter(tab.key as any);
                }}
                onMouseEnter={() => playHoverSound()}
                className={`px-3 py-1.5 font-pixel text-[8px] chunky-border cursor-pointer transition-all ${
                  isSelected
                    ? `${tab.bg} ${tab.text} font-bold shadow-[2.5px_2.5px_0px_#1b1214] -translate-y-0.5`
                    : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quests Responsive Grid: 1 column on mobile, 2 columns on desktop */}
      {filteredQuests.length === 0 ? (
        <div className="bg-white p-10 chunky-border text-center space-y-3.5 shadow-[4px_4px_0px_#1b1214]">
          <span className="material-symbols-outlined text-[52px] text-[#fcc2ca]">
            military_tech
          </span>
          <h3 className="font-headline text-xl font-bold text-[#1b1214]">
            Tidak Ada Misi di Kategori Ini
          </h3>
          <p className="font-body text-xs text-[#805b60] max-w-md mx-auto">
            {searchQuery
              ? 'Tidak ada misi yang cocok dengan pencarian kata kunci Anda.'
              : 'Buat quest baru Anda untuk mulai mengumpulkan XP, koin emas, dan menaikkan level!'}
          </p>
          <button
            onClick={() => {
              playClickSound();
              onOpenNewQuestModal();
            }}
            onMouseEnter={() => playHoverSound()}
            className="px-5 py-2.5 bg-[#39ff14] text-[#1b1214] font-pixel text-[9px] chunky-border arcade-btn font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            BUAT QUEST SEKARANG
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onToggleComplete={onToggleComplete}
              onToggleSubtask={onToggleSubtask}
              onStartFocus={onStartFocus}
              onDelete={onDeleteQuest}
            />
          ))}
        </div>
      )}
    </div>
  );
};
