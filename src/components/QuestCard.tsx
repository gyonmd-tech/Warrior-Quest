import React, { useState } from 'react';
import { Quest } from '../types';
import {
  playClickSound,
  playDeleteSound,
  playHoverSound,
  playQuestCompleteSound,
} from '../utils/audio';

interface QuestCardProps {
  quest: Quest;
  onToggleComplete: (id: string) => void;
  onToggleSubtask?: (questId: string, subtaskId: string) => void;
  onStartFocus?: (quest: Quest) => void;
  onDelete?: (id: string) => void;
}

const STAT_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  strength: { label: '+1 STR', bg: 'bg-[#ff0055]', text: 'text-white' },
  agility: { label: '+1 AGI', bg: 'bg-[#ff6b00]', text: 'text-white' },
  intelligence: { label: '+1 INT', bg: 'bg-[#00f5ff]', text: 'text-[#1b1214]' },
  vitality: { label: '+1 VIT', bg: 'bg-[#39ff14]', text: 'text-[#1b1214]' },
};

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onToggleComplete,
  onToggleSubtask,
  onStartFocus,
  onDelete,
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(true);

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!quest.completed) {
      setIsCompleting(true);
      playQuestCompleteSound();
      setTimeout(() => {
        onToggleComplete(quest.id);
        setIsCompleting(false);
      }, 250);
    } else {
      playClickSound();
      onToggleComplete(quest.id);
    }
  };

  const handleSubtaskClick = (e: React.MouseEvent, subtaskId: string) => {
    e.stopPropagation();
    playClickSound();
    if (onToggleSubtask) {
      onToggleSubtask(quest.id, subtaskId);
    }
  };

  const completedSubtasksCount = quest.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasksCount = quest.subtasks?.length || 0;
  const subtasksProgress =
    totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  const isLegendary = quest.category === 'legendary';
  const statBadge = quest.statAttribute ? STAT_LABELS[quest.statAttribute] : null;

  return (
    <article
      onMouseEnter={() => playHoverSound()}
      className={`bg-white rounded-none p-4 md:p-5 chunky-border relative overflow-hidden transition-all group ${
        isLegendary ? 'legendary-glow' : ''
      } ${
        quest.completed
          ? 'opacity-65 bg-[#fff6f8]'
          : 'card-hover-pop'
      } ${isCompleting ? 'scale-[0.98] ring-4 ring-[#39ff14]' : ''}`}
      style={{
        borderColor: isLegendary ? '#ff0055' : '#1b1214',
      }}
    >
      {/* Decorative Sparkles for active legendary quests */}
      {isLegendary && !quest.completed && (
        <>
          <span className="material-symbols-outlined text-[#ffd000] absolute top-2 right-2 sparkle text-[18px] pointer-events-none select-none">
            temp_preferences_custom
          </span>
          <span
            className="material-symbols-outlined text-[#ffd000] absolute bottom-3 left-4 sparkle text-[20px] pointer-events-none select-none"
            style={{ animationDelay: '0.6s' }}
          >
            temp_preferences_custom
          </span>
        </>
      )}

      <div className="flex justify-between items-start gap-3 relative z-10">
        <div className="flex gap-3 sm:gap-4 items-start flex-1 min-w-0">
          
          {/* Main Quest Checkbox Button */}
          <button
            onClick={handleCheck}
            onMouseEnter={() => playHoverSound()}
            title={quest.completed ? 'Tandai belum selesai' : `Selesaikan Quest (+${quest.xpReward} XP)`}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-none border-[3.5px] mt-0.5 shrink-0 bg-white hover:bg-[#39ff14] transition-all flex items-center justify-center cursor-pointer group/btn shadow-[2px_2px_0px_#1b1214] ${
              isLegendary ? 'border-[#ff0055]' : 'border-[#1b1214]'
            } ${quest.completed ? 'bg-[#39ff14] !border-[#1b1214]' : ''}`}
          >
            <span
              className={`material-symbols-outlined text-[28px] font-bold transition-all ${
                quest.completed
                  ? 'text-[#1b1214] scale-100'
                  : 'text-transparent group-hover/btn:text-[#1b1214] scale-50 group-hover/btn:scale-100'
              }`}
            >
              done
            </span>
          </button>

          {/* Quest Content & Badges */}
          <div className="flex flex-col gap-1.5 min-w-0 pr-1 flex-1">
            
            {/* Top Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Category Pill */}
              <span
                className={`font-pixel text-[7.5px] sm:text-[8px] px-2 py-0.5 chunky-border font-bold uppercase shadow-[1px_1px_0px_#1b1214] ${
                  isLegendary
                    ? 'bg-[#ff0055] text-white border-[#b9003f]'
                    : quest.category === 'daily'
                    ? 'bg-[#b537f2] text-white'
                    : 'bg-[#ff6b00] text-white'
                }`}
              >
                {isLegendary ? 'LEGENDARY' : quest.category === 'daily' ? 'HARIAN' : 'SIDE QUEST'}
              </span>

              {/* XP Reward */}
              <span className="font-pixel text-[8px] bg-[#ffea79] text-[#1b1214] px-2 py-0.5 chunky-border font-bold shadow-[1px_1px_0px_#1b1214] flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-[13px] text-[#ff0055]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  swords
                </span>
                +{quest.xpReward} XP
              </span>

              {/* Gold Coin Bounty */}
              {quest.goldReward && (
                <span className="font-pixel text-[7.5px] bg-[#ffd000] text-[#1b1214] px-1.5 py-0.5 chunky-border font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px] text-[#ff6b00]">
                    monetization_on
                  </span>
                  +{quest.goldReward}g
                </span>
              )}

              {/* Gem Drop Bounty */}
              {quest.gemReward && (
                <span className="font-pixel text-[7.5px] bg-[#fcc2ca] text-[#ff0055] px-1.5 py-0.5 chunky-border font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">diamond</span>
                  +{quest.gemReward} Gems
                </span>
              )}

              {/* Hero Stat Boost Badge */}
              {statBadge && (
                <span
                  className={`font-pixel text-[7.5px] ${statBadge.bg} ${statBadge.text} px-1.5 py-0.5 chunky-border font-bold flex items-center gap-0.5 shadow-[1px_1px_0px_#1b1214]`}
                >
                  <span className="material-symbols-outlined text-[11px]">military_tech</span>
                  {statBadge.label}
                </span>
              )}

              {/* Difficulty Stars */}
              {quest.difficultyRating && (
                <span className="font-pixel text-[7px] bg-[#fff6f8] text-[#ff6b00] px-1.5 py-0.5 chunky-border font-bold flex items-center gap-0.5">
                  {'★'.repeat(quest.difficultyRating)}
                </span>
              )}

              {/* Duration Pill */}
              {quest.estimatedMinutes && (
                <span className="font-pixel text-[7px] bg-[#00f5ff] text-[#1b1214] px-1.5 py-0.5 chunky-border font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[11px]">schedule</span>
                  {quest.estimatedMinutes}m
                </span>
              )}
            </div>

            {/* Title & Custom Icon */}
            <div className="flex items-start gap-2 mt-0.5">
              {quest.icon && (
                <div className="w-6 h-6 bg-[#ffea79] chunky-border shrink-0 flex items-center justify-center text-[#ff0055] mt-0.5 shadow-[1px_1px_0px_#1b1214]">
                  <span className="material-symbols-outlined text-[16px]">{quest.icon}</span>
                </div>
              )}
              <h3
                className={`font-headline text-lg sm:text-xl md:text-2xl text-[#1b1214] font-bold leading-snug break-words ${
                  quest.completed ? 'line-through text-[#805b60]' : ''
                }`}
              >
                {quest.title}
              </h3>
            </div>

            {/* Description */}
            {quest.description && (
              <p className="font-body text-xs md:text-sm text-[#4a3034] mt-0.5 leading-relaxed">
                {quest.description}
              </p>
            )}

            {/* Tags Row */}
            {quest.tags && quest.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                {quest.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-pixel text-[6.5px] bg-[#fff0f3] text-[#805b60] px-1.5 py-0.5 chunky-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Sub-tasks Section */}
            {quest.subtasks && quest.subtasks.length > 0 && (
              <div className="mt-2.5 pt-2 border-t-2 border-[#ffe2e6]">
                <div
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="flex items-center justify-between cursor-pointer select-none mb-1.5"
                >
                  <span className="font-pixel text-[7.5px] uppercase font-bold text-[#4a3034] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-[#39ff14]">
                      checklist
                    </span>
                    Langkah Kemenangan ({completedSubtasksCount}/{totalSubtasksCount})
                  </span>

                  <span className="font-pixel text-[7px] text-[#007d7a] font-bold flex items-center gap-1">
                    <span>{subtasksProgress}%</span>
                    <span className="material-symbols-outlined text-[14px]">
                      {showSubtasks ? 'expand_less' : 'expand_more'}
                    </span>
                  </span>
                </div>

                {/* Subtask Progress Mini-Bar */}
                <div className="w-full h-2 bg-[#ffe2e6] chunky-border overflow-hidden mb-2 p-0.5">
                  <div
                    className="h-full bg-[#39ff14] transition-all duration-200"
                    style={{ width: `${subtasksProgress}%` }}
                  />
                </div>

                {/* Subtask Checkboxes */}
                {showSubtasks && (
                  <div className="space-y-1.5">
                    {quest.subtasks.map((st) => (
                      <div
                        key={st.id}
                        onClick={(e) => handleSubtaskClick(e, st.id)}
                        className={`flex items-center gap-2 p-1.5 chunky-border transition-colors cursor-pointer text-left ${
                          st.completed ? 'bg-[#ebfff4] border-[#39ff14]' : 'bg-[#fff6f8] hover:bg-[#ffe2e6]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 chunky-border flex items-center justify-center shrink-0 ${
                            st.completed ? 'bg-[#39ff14]' : 'bg-white'
                          }`}
                        >
                          {st.completed && (
                            <span className="material-symbols-outlined text-[12px] font-bold text-[#1b1214]">
                              check
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-body text-xs ${
                            st.completed ? 'line-through text-[#805b60]' : 'text-[#1b1214]'
                          }`}
                        >
                          {st.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Quick Action Side Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0">
          {onStartFocus && !quest.completed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playClickSound();
                onStartFocus(quest);
              }}
              onMouseEnter={() => playHoverSound()}
              title="Mulai Duel Timer Fokus"
              className="w-9 h-9 bg-[#ffea79] hover:bg-[#39ff14] text-[#1b1214] chunky-border flex items-center justify-center arcade-btn cursor-pointer shadow-[2px_2px_0px_#1b1214]"
            >
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playDeleteSound();
                onDelete(quest.id);
              }}
              onMouseEnter={() => playHoverSound()}
              title="Hapus Quest"
              className="w-9 h-9 bg-[#fcc2ca] hover:bg-[#ff0055] hover:text-white text-[#ff0055] chunky-border flex items-center justify-center arcade-btn cursor-pointer shadow-[2px_2px_0px_#1b1214]"
            >
              <span className="material-symbols-outlined text-[17px]">delete</span>
            </button>
          )}
        </div>

      </div>
    </article>
  );
};
