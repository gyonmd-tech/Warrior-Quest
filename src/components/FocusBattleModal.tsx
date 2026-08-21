import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Quest } from '../types';
import {
  playAttackSound,
  playClickSound,
  playHoverSound,
  playQuestCompleteSound,
  playRewardSound,
  playTimerTickSound,
} from '../utils/audio';

interface FocusBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  quest: Quest | null;
  onBattleVictory: (questId: string, damageDealt: number) => void;
  defaultDurationMinutes?: number;
  autoCompleteOnFocusEnd?: boolean;
}

export const FocusBattleModal: React.FC<FocusBattleModalProps> = ({
  isOpen,
  onClose,
  quest,
  onBattleVictory,
  defaultDurationMinutes = 25,
  autoCompleteOnFocusEnd = true,
}) => {
  const [selectedDuration, setSelectedDuration] = useState(defaultDurationMinutes);
  const [secondsRemaining, setSecondsRemaining] = useState(defaultDurationMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (defaultDurationMinutes) {
      setSelectedDuration(defaultDurationMinutes);
      setSecondsRemaining(defaultDurationMinutes * 60);
    }
  }, [defaultDurationMinutes, isOpen]);

  useEffect(() => {
    setSecondsRemaining(selectedDuration * 60);
    setIsActive(false);
  }, [selectedDuration, quest, isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 6 && prev > 1) {
            playTimerTickSound();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      setIsActive(false);
      playAttackSound();
      playQuestCompleteSound();
      confetti({
        particleCount: 90,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#39ff14', '#00f5ff', '#ff0055', '#ffd000', '#b537f2'],
      });
      if (quest) {
        onBattleVictory(quest.id, 250);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining, quest, onBattleVictory]);

  if (!isOpen || !quest) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSeconds = selectedDuration * 60;
  const progressPercent = Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100);

  const handleToggleTimer = () => {
    playClickSound();
    setIsActive(!isActive);
  };

  const handleInstantVictory = () => {
    playAttackSound();
    playRewardSound();
    confetti({
      particleCount: 75,
      spread: 75,
      colors: ['#39ff14', '#00f5ff', '#ff0055'],
    });
    onBattleVictory(quest.id, quest.xpReward);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-none chunky-border chunky-shadow p-6 relative text-center animate-in zoom-in duration-200">
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

        {/* Title and Quest Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#ff0055] text-white px-3 py-1 font-pixel text-[8px] uppercase tracking-wider mb-2.5 chunky-border font-bold shadow-[2px_2px_0px_#1b1214]">
          <span className="material-symbols-outlined text-[14px]">timer</span>
          FOCUS BATTLE DUEL
        </div>

        <h3 className="font-headline text-2xl font-bold text-[#1b1214] leading-tight mb-1">
          {quest.title}
        </h3>
        <p className="font-body text-xs text-[#4a3034] mb-4">
          Fokus tanpa gangguan untuk melancarkan serangan dahsyat dan raih bonus XP!
        </p>

        {/* Duration Select */}
        <div className="flex justify-center gap-2 mb-4">
          {[10, 25, 45].map((d) => (
            <button
              key={d}
              onClick={() => {
                playClickSound();
                setSelectedDuration(d);
              }}
              onMouseEnter={() => playHoverSound()}
              disabled={isActive}
              className={`px-3 py-1.5 font-pixel text-[8px] chunky-border transition-all cursor-pointer ${
                selectedDuration === d
                  ? 'bg-[#00f5ff] text-[#1b1214] font-bold shadow-[2px_2px_0px_#1b1214]'
                  : 'bg-[#fff6f8] text-[#4a3034] hover:bg-[#ffe2e6]'
              }`}
            >
              {d} MENIT
            </button>
          ))}
        </div>

        {/* Big Retro Digital Display */}
        <div className="bg-[#fff6f8] p-5 chunky-border mb-5 relative overflow-hidden shadow-[inset_2px_2px_0px_#1b1214]">
          <div className="font-pixel text-4xl sm:text-5xl text-[#ff0055] tracking-widest my-2 select-none">
            {timeFormatted}
          </div>

          <div className="w-full h-4 bg-white chunky-border overflow-hidden mt-3 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#ffd000] via-[#00f5ff] to-[#39ff14] progress-stripes transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={handleToggleTimer}
            onMouseEnter={() => playHoverSound()}
            className={`flex-1 py-3 font-pixel text-[9px] chunky-border arcade-btn transition-all cursor-pointer font-bold flex items-center justify-center gap-2 ${
              isActive
                ? 'bg-[#ffd000] text-[#1b1214]'
                : 'bg-[#39ff14] hover:bg-[#2fe00c] text-[#1b1214]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isActive ? 'pause' : 'play_arrow'}
            </span>
            {isActive ? 'JEDA FOKUS' : 'MULAI DUEL FOKUS'}
          </button>

          <button
            onClick={handleInstantVictory}
            onMouseEnter={() => playHoverSound()}
            title="Selesaikan & Menang Langsung"
            className="px-4 py-3 bg-[#fcc2ca] hover:bg-[#ffea79] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap font-bold"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span>
            INSTANT WIN
          </button>
        </div>
      </div>
    </div>
  );
};
