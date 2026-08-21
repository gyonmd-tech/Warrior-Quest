import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_GUILD_LEADERBOARD } from '../data/initialData';
import { DailyReward, Quest, RaidBoss, UserProfile } from '../types';
import {
  playAttackSound,
  playBossRoarSound,
  playClickSound,
  playHoverSound,
  playQuestCompleteSound,
  playRewardSound,
} from '../utils/audio';
import { useRealTime } from '../utils/useRealTime';
import { DailyRewardsRow } from './DailyRewardsRow';
import { StatusRow } from './StatusRow';

interface HomeViewProps {
  user: UserProfile;
  quests: Quest[];
  raidBoss: RaidBoss;
  dailyRewards: DailyReward[];
  onClaimDailyReward: (day: number) => void;
  onOpenEnergyModal: () => void;
  onAttackBoss: (damage: number) => void;
  onNavigateToQuests: () => void;
  onNavigateToHero: () => void;
  onNavigateToTrophies?: () => void;
  onToggleQuestComplete?: (id: string) => void;
  onStartFocus?: (quest: Quest) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  quests,
  raidBoss,
  dailyRewards,
  onClaimDailyReward,
  onOpenEnergyModal,
  onAttackBoss,
  onNavigateToQuests,
  onNavigateToHero,
  onNavigateToTrophies,
  onToggleQuestComplete,
  onStartFocus,
}) => {
  const [isAttacking, setIsAttacking] = useState(false);
  const [lastDamage, setLastDamage] = useState<number | null>(null);
  const { greeting, greetingIcon, dateString, timeString, formattedResetCountdown } = useRealTime();

  const activeQuests = quests.filter((q) => !q.completed);
  const activeCount = activeQuests.length;
  const completedCount = quests.filter((q) => q.completed).length;
  const completionRate =
    quests.length > 0 ? Math.round((completedCount / quests.length) * 100) : 0;

  const handleBossDirectStrike = () => {
    if (user.energy < 10) {
      alert('Membutuhkan setidaknya 10 Focus Energy! Pulihkan energi Anda lewat ikon petir.');
      return;
    }
    setIsAttacking(true);
    playAttackSound();

    const dmg = 25 + Math.floor(Math.random() * 20);
    setLastDamage(dmg);
    onAttackBoss(dmg);

    setTimeout(() => {
      playBossRoarSound();
      setIsAttacking(false);
    }, 450);
  };

  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Global Status Row (XP, Energy, Streak, Wallet) */}
      <StatusRow user={user} onOpenEnergyModal={onOpenEnergyModal} />

      {/* Mobile-Only: 7-Day Login Streaks Row at top */}
      <div className="block lg:hidden">
        <DailyRewardsRow rewards={dailyRewards} onClaimReward={onClaimDailyReward} />
      </div>

      {/* Main Responsive Grid: 1 Column on Mobile, 2-Column Bento Dashboard on Desktop */}
      {/* Main Home Two-Column Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Left / Primary Column on Desktop */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 xl:space-y-8">
          {/* Hero Banner Greeting */}
          <div className="bg-gradient-to-r from-[#ffe2e6] via-[#ffd0d7] to-[#ffea79] p-5 sm:p-6 lg:p-7 xl:p-8 rounded-none chunky-border chunky-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden">
            {/* Colorful background splash */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-[#ff0055] opacity-10 rounded-full pointer-events-none" />

            <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto min-w-0">
              <div
                onClick={onNavigateToHero}
                onMouseEnter={() => playHoverSound()}
                className="w-18 h-18 sm:w-22 sm:h-22 lg:w-26 lg:h-26 bg-[#1b1214] p-1.5 chunky-border border-[#39ff14] shadow-[4px_4px_0px_#1b1214] overflow-hidden shrink-0 cursor-pointer hover:scale-105 hover:rotate-[-2deg] transition-all group"
                title="Kustomisasi Hero"
              >
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-pixel text-[8px] sm:text-[8.5px] bg-[#ff0055] text-white px-2.5 py-0.5 chunky-border font-bold uppercase shadow-[1.5px_1.5px_0px_#1b1214]">
                    {user.characterClass}
                  </span>
                  <span className="font-pixel text-[8px] sm:text-[8.5px] bg-[#ffd000] text-[#1b1214] px-2.5 py-0.5 chunky-border font-bold shadow-[1.5px_1.5px_0px_#1b1214]">
                    RANK #{user.level > 10 ? 'ELITE' : 'ROOKIE'}
                  </span>
                  <span className="font-pixel text-[7.5px] bg-white text-[#1b1214] px-2 py-0.5 chunky-border font-bold shadow-[1px_1px_0px_#1b1214] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-[#ff6b00]">
                      {greetingIcon}
                    </span>
                    {timeString}
                  </span>
                </div>
                <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-[#ff0055] mt-1.5 leading-tight break-words">
                  {greeting}, {user.name}!
                </h2>
                <p className="font-body text-xs sm:text-sm text-[#4a3034] font-medium flex items-center gap-2 mt-1 flex-wrap">
                  <span className="font-bold text-[#1b1214]">{dateString}</span>
                  <span className="text-[#805b60]">&bull;</span>
                  <span>{user.title || 'Vanguard of Daily Discipline'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onNavigateToQuests();
              }}
              onMouseEnter={() => playHoverSound()}
              className="w-full md:w-auto px-6 sm:px-7 py-3.5 bg-[#00f5ff] hover:bg-[#39ff14] text-[#1b1214] font-pixel text-[9px] sm:text-[10px] chunky-border arcade-btn transition-all cursor-pointer font-bold flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 shadow-[3px_3px_0px_#1b1214]"
            >
              <span className="material-symbols-outlined text-[22px]">swords</span>
              PAPAN QUEST ({activeCount})
            </button>
          </div>

          {/* World Boss Raid Live Encounter */}
          <div className="bg-white p-5 sm:p-6 lg:p-7 xl:p-8 rounded-none chunky-border legendary-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#ff0055] text-white font-pixel text-[8px] sm:text-[8.5px] px-3 sm:px-3.5 py-1 chunky-border border-[#b9003f] uppercase font-bold shadow-[2px_2px_0px_#1b1214] flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#39ff14] rounded-full animate-ping" />
              <span>RAID BOSS LIVE &bull; ⏳ {formattedResetCountdown}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-5 sm:mt-3">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-[#1b1214] chunky-border border-[#ff0055] overflow-hidden shrink-0 shadow-[5px_5px_0px_#ff0055] flex items-center justify-center transition-transform relative ${
                  isAttacking ? 'scale-90 rotate-6 ring-4 ring-[#ff0055]' : 'hover:scale-105'
                }`}
              >
                {/* Fallback Boss Icon if Image is loading/missing */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#2b0c16] to-[#12080a] text-[#ff0055]">
                  <span className="material-symbols-outlined text-[44px] animate-pulse">
                    pest_control
                  </span>
                  <span className="font-pixel text-[7px] text-[#ffd000] font-bold">WORLD BOSS</span>
                </div>
                
                {raidBoss.imageUrl && (
                  <img
                    src={raidBoss.imageUrl}
                    alt={raidBoss.name}
                    className="w-full h-full object-cover relative z-10"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-headline text-2xl sm:text-3xl font-bold text-[#1b1214]">
                    {raidBoss.name}
                  </h3>
                  <span className="font-pixel text-[7.5px] sm:text-[8px] bg-[#ff6b00] text-white px-2.5 py-0.5 chunky-border font-bold uppercase shadow-[1px_1px_0px_#1b1214]">
                    {raidBoss.element || 'Shadow Dark'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-1.5">
                  <span className="font-body text-xs sm:text-sm text-[#4a3034] font-medium">{raidBoss.title}</span>
                  <span className="text-[#805b60]">&bull;</span>
                  <span className="font-body text-xs sm:text-sm text-[#4a3034] font-medium">Kelemahan:</span>
                  <span className="inline-flex items-center gap-1.5 bg-[#fff0f3] border-2 border-[#ff0055] text-[#ff0055] px-2.5 py-1 font-pixel text-[7.5px] sm:text-[8px] font-bold shadow-[1.5px_1.5px_0px_#1b1214]">
                    <span className="material-symbols-outlined text-[14px]">swords</span>
                    {raidBoss.weakness}
                  </span>
                </div>

                {/* Boss HP Bar */}
                <div className="mt-3.5">
                  <div className="flex justify-between font-pixel text-[8px] sm:text-[8.5px] text-[#4a3034] mb-1.5 font-bold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#ff0055]">favorite</span>
                      BOSS HEALTH
                    </span>
                    <span className="text-[#ff0055]">
                      {raidBoss.currentHp} / {raidBoss.maxHp} HP ({Math.max(0, Math.round((raidBoss.currentHp / raidBoss.maxHp) * 100))}%)
                    </span>
                  </div>
                  <div className="w-full h-5 sm:h-6 bg-[#fcc2ca] chunky-border overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff0055] via-[#ff6b00] to-[#ffd000] progress-stripes transition-all duration-300"
                      style={{
                        width: `${Math.max(0, Math.min(100, (raidBoss.currentHp / raidBoss.maxHp) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Raid Action Bar */}
            <div className="mt-5 pt-4 border-t-2 border-[#ffd0d7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="font-pixel text-[8px] sm:text-[8.5px] text-[#1b1214] flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="font-bold">Hadiah Kemenangan:</span>
                <span className="bg-[#ffea79] text-[#1b1214] px-2.5 py-1 chunky-border font-bold shadow-[1px_1px_0px_#1b1214] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#ff0055]">military_tech</span>
                  +{raidBoss.rewardXp} XP
                </span>
                <span className="bg-[#00f5ff] text-[#1b1214] px-2.5 py-1 chunky-border font-bold shadow-[1px_1px_0px_#1b1214] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#ff6b00]">monetization_on</span>
                  +{raidBoss.rewardCoins ?? 500} Gold
                </span>
                <span className="bg-[#fcc2ca] text-[#ff0055] px-2.5 py-1 chunky-border font-bold shadow-[1px_1px_0px_#1b1214] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">diamond</span>
                  +{raidBoss.rewardGems} Gems
                </span>
              </div>

              <button
                onClick={handleBossDirectStrike}
                onMouseEnter={() => playHoverSound()}
                disabled={raidBoss.currentHp <= 0 || isAttacking}
                className={`w-full sm:w-auto px-6 py-3 font-pixel text-[9px] sm:text-[10px] chunky-border arcade-btn transition-all cursor-pointer font-bold flex items-center justify-center gap-2 whitespace-nowrap shadow-[2.5px_2.5px_0px_#1b1214] ${
                  raidBoss.currentHp <= 0
                    ? 'bg-[#39ff14] text-[#1b1214]'
                    : 'bg-[#ff0055] hover:bg-[#ff2d6c] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">colorize</span>
                {raidBoss.currentHp <= 0
                  ? 'BOS DIKALAHKAN! 👑'
                  : isAttacking
                  ? 'MENYERANG! ⚔️'
                  : 'SERANG BOS (-10 Energi)'}
              </button>
            </div>
          </div>

          {/* Desktop-Enhanced: Priority Active Quests Quick Preview on Dashboard */}
          <div className="hidden lg:block bg-white p-6 xl:p-7 chunky-border chunky-shadow space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#1b1214]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ff0055] text-[26px]">
                  flag
                </span>
                <h3 className="font-headline text-xl font-bold text-[#1b1214]">
                  Misi Aktif Hari Ini ({activeCount})
                </h3>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  onNavigateToQuests();
                }}
                onMouseEnter={() => playHoverSound()}
                className="font-pixel text-[8.5px] text-[#ff0055] hover:text-[#b9003f] font-bold underline flex items-center gap-1 cursor-pointer"
              >
                Buka Papan Quest Lengkap &rarr;
              </button>
            </div>

            {activeQuests.length === 0 ? (
              <div className="py-8 text-center text-[#805b60] font-body text-sm">
                Semua misi telah terselesaikan dengan gagah berani! 🎉
              </div>
            ) : (
              <div className="space-y-3">
                {activeQuests.slice(0, 3).map((quest) => (
                  <div
                    key={quest.id}
                    className="p-3.5 sm:p-4 bg-[#fff6f8] hover:bg-[#ffe2e6] chunky-border flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {onToggleQuestComplete && (
                        <button
                          onClick={() => {
                            playQuestCompleteSound();
                            onToggleQuestComplete(quest.id);
                          }}
                          onMouseEnter={() => playHoverSound()}
                          title="Tandai Selesai"
                          className="w-7 h-7 bg-white chunky-border flex items-center justify-center text-[#39ff14] hover:bg-[#39ff14] hover:text-[#1b1214] transition-colors cursor-pointer shrink-0 font-bold text-sm"
                        >
                          ✓
                        </button>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-bold text-base text-[#1b1214] truncate">
                            {quest.title}
                          </span>
                          <span
                            className={`font-pixel text-[7px] px-2 py-0.5 chunky-border font-bold uppercase ${
                              quest.category === 'legendary'
                                ? 'bg-[#ff0055] text-white'
                                : quest.category === 'daily'
                                ? 'bg-[#b537f2] text-white'
                                : 'bg-[#ff6b00] text-white'
                            }`}
                          >
                            {quest.category}
                          </span>
                        </div>
                        <p className="font-body text-xs text-[#805b60] truncate mt-0.5">
                          +{quest.xpReward} XP &bull; +{quest.goldReward} Gold &bull; {quest.estimatedMinutes}m
                        </p>
                      </div>
                    </div>

                    {onStartFocus && (
                      <button
                        onClick={() => {
                          playClickSound();
                          onStartFocus(quest);
                        }}
                        onMouseEnter={() => playHoverSound()}
                        className="px-3.5 py-2 bg-[#00f5ff] hover:bg-[#39ff14] text-[#1b1214] font-pixel text-[8px] chunky-border arcade-btn font-bold shrink-0 cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[15px]">timer</span>
                        FOKUS
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right / Secondary Column on Desktop (Streak, Bento Highlights, Guild Standings) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 xl:space-y-8">
          {/* Desktop-Only: 7-Day Login Streaks placed neatly in sidebar column */}
          <div className="hidden lg:block">
            <DailyRewardsRow rewards={dailyRewards} onClaimReward={onClaimDailyReward} />
          </div>

          {/* Streak & Weekly Discipline Card */}
          <div
            onMouseEnter={() => playHoverSound()}
            className="bg-white p-5 xl:p-6 chunky-border chunky-shadow card-hover-pop flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#007d7a] mb-3">
              <span className="font-pixel text-[8.5px] uppercase font-bold">Streak 7 Hari</span>
              <span className="material-symbols-outlined text-[28px] text-[#ff6b00] flame-burn">
                local_fire_department
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 my-2.5">
              {daysOfWeek.map((day, i) => {
                const isChecked = i < (user.streakDays % 7 || (user.streakDays > 0 ? 7 : 0));
                return (
                  <div key={day} className="text-center">
                    <div
                      className={`h-10 chunky-border flex items-center justify-center font-pixel text-[8px] transition-transform hover:scale-110 ${
                        isChecked
                          ? 'bg-[#39ff14] text-[#1b1214] font-bold shadow-[2px_2px_0px_#1b1214]'
                          : 'bg-[#fff0f3] text-[#805b60]'
                      }`}
                    >
                      {isChecked ? '✓' : ''}
                    </div>
                    <span className="font-pixel text-[6.5px] text-[#805b60] mt-1.5 block font-bold">
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>

            <span className="font-body text-xs sm:text-sm text-[#007d7a] font-bold flex items-center gap-1.5 mt-2">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              {user.streakDays} hari kemenangan beruntun!
            </span>
          </div>

          {/* Career Quests Summary */}
          <div
            onMouseEnter={() => playHoverSound()}
            className="bg-white p-5 xl:p-6 chunky-border chunky-shadow card-hover-pop flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#ff0055] mb-2.5">
              <span className="font-pixel text-[8.5px] uppercase font-bold">Statistik Karir</span>
              <span className="material-symbols-outlined text-[28px] text-[#ff0055]">
                military_tech
              </span>
            </div>

            <div className="space-y-2.5 my-2.5">
              <div className="flex justify-between font-headline text-base font-bold">
                <span>Quest Selesai</span>
                <span className="text-[#ff0055] font-pixel text-[11px]">
                  {user.totalQuestsCompleted} misi
                </span>
              </div>
              <div className="flex justify-between font-headline text-base font-bold">
                <span>Total DMG Raid</span>
                <span className="text-[#007d7a] font-pixel text-[11px]">
                  {user.totalDamageDealt} pts
                </span>
              </div>
              <div className="flex justify-between font-headline text-base font-bold">
                <span>Rasio Tuntas</span>
                <span className="text-[#ff6b00] font-pixel text-[11px]">{completionRate}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#ffe2e6]">
              <span className="font-body text-xs text-[#4a3034] font-medium">
                {completedCount} selesai / {quests.length} misi
              </span>
              {onNavigateToTrophies && (
                <button
                  onClick={() => {
                    playClickSound();
                    onNavigateToTrophies();
                  }}
                  className="font-pixel text-[7.5px] text-[#ff0055] hover:text-[#b9003f] font-bold flex items-center gap-1 cursor-pointer underline"
                >
                  Lihat Trofi &rarr;
                </button>
              )}
            </div>
          </div>

          {/* Guild Standings */}
          <div
            onMouseEnter={() => playHoverSound()}
            className="bg-white p-5 xl:p-6 chunky-border chunky-shadow card-hover-pop flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#ff6b00] mb-2.5">
              <span className="font-pixel text-[8.5px] uppercase font-bold">Peringkat Guild</span>
              <span className="material-symbols-outlined text-[28px] text-[#ffd000]">
                groups
              </span>
            </div>

            <div className="space-y-2 my-2">
              {INITIAL_GUILD_LEADERBOARD.slice(0, 3).map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between text-xs sm:text-sm py-1.5 px-2.5 bg-[#fff6f8] chunky-border font-body hover:bg-[#ffe2e6] transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-pixel text-[7.5px] text-[#ff0055] font-bold">
                      #{item.rank}
                    </span>
                    <span className="font-bold text-[#1b1214] truncate">{item.name}</span>
                  </div>
                  <span className="font-pixel text-[7.5px] text-[#007d7a] font-bold">
                    {item.weeklyXp.toLocaleString()} XP
                  </span>
                </div>
              ))}
            </div>

            <span className="font-body text-xs sm:text-sm text-[#007d7a] font-bold flex items-center gap-1.5 mt-2">
              <span className="material-symbols-outlined text-[16px]">stars</span>
              Peringkat #{user.level >= 15 ? '1' : '2'} di Guild Ksatria
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
