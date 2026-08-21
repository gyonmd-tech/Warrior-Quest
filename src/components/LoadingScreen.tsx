import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
  onFinish?: () => void;
  minDuration?: number;
}

const TIPS = [
  'Mengasah pedang disiplin untuk membasmi Monster Prokrastinasi...',
  'Meracik ramuan konsentrasi tinggi dan espresso segar...',
  'Menghitung bonus XP pertempuran untuk streak harian legendaris...',
  'Menghubungkan sinyal ksatria ke Markas Guild Petualang...',
  'Memasang zirah bertuah pada ksatria pendamping...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Memasuki Realm Petualangan...',
  onFinish,
  minDuration = 1600,
}) => {
  const [progress, setProgress] = useState(15);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 1200);

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDuration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(progressInterval);
        clearInterval(tipInterval);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 150);
      }
    }, 50);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, [minDuration, onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-[#fff6f8] game-grid-bg flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-none chunky-border chunky-shadow p-8 text-center relative overflow-hidden">
        {/* Top Decorative Banner */}
        <div className="bg-[#ff0055] text-white font-pixel text-[9px] py-1.5 px-4 chunky-border inline-block mb-6 shadow-[3px_3px_0px_#1b1214] uppercase tracking-widest font-bold animate-pulse">
          WARRIOR QUEST LOG v2.5
        </div>

        {/* Central Spinning Pixel Icon / Crest */}
        <div className="w-24 h-24 mx-auto mb-6 bg-[#ffea79] border-[4px] border-[#1b1214] shadow-[6px_6px_0px_#1b1214] flex items-center justify-center relative group">
          <span
            className="material-symbols-outlined text-[52px] text-[#ff0055] animate-spin"
            style={{ animationDuration: '4s', fontVariationSettings: "'FILL' 1" }}
          >
            swords
          </span>
          <span className="material-symbols-outlined text-[#39ff14] absolute -top-2 -right-2 text-[24px] sparkle">
            temp_preferences_custom
          </span>
        </div>

        {/* Title */}
        <h2 className="font-headline text-3xl font-bold text-[#1b1214] mb-2">
          {message}
        </h2>

        {/* Loading Progress Bar */}
        <div className="w-full h-8 rounded-none chunky-border bg-[#ffe2e6] overflow-hidden my-4 relative p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#ffd000] via-[#00f5ff] to-[#39ff14] progress-stripes border-r-[3px] border-[#1b1214] transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center font-pixel text-[10px] text-[#1b1214] font-bold tracking-wider">
            {progress}% LOADED
          </span>
        </div>

        {/* Dynamic Tip Text */}
        <div className="bg-[#fff6f8] p-3.5 chunky-border mt-4 text-left flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#ff0055] text-[20px] shrink-0 mt-0.5">
            tips_and_updates
          </span>
          <p className="font-body text-xs text-[#4a3034] italic leading-relaxed font-medium">
            "{TIPS[tipIndex]}"
          </p>
        </div>
      </div>
    </div>
  );
};
