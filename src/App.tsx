import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { BottomNav, NavTabType } from './components/BottomNav';
import { CalendarAnalyticsView } from './components/CalendarAnalyticsView';
import { DesktopSidebar } from './components/DesktopSidebar';
import { DesktopTopBar } from './components/DesktopTopBar';
import { EnergyModal } from './components/EnergyModal';
import { FocusBattleModal } from './components/FocusBattleModal';
import { Header } from './components/Header';
import { HeroView } from './components/HeroView';
import { HomeView } from './components/HomeView';
import { LevelUpModal } from './components/LevelUpModal';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginView } from './components/LoginView';
import { NewQuestModal } from './components/NewQuestModal';
import { NewSelfRewardModal } from './components/NewSelfRewardModal';
import { QuestsView } from './components/QuestsView';
import { SelfRewardMilestoneAlert } from './components/SelfRewardMilestoneAlert';
import { SelfRewardView } from './components/SelfRewardView';
import { SettingsView } from './components/SettingsView';
import { TrophiesView } from './components/TrophiesView';
import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_DAILY_REWARDS,
  INITIAL_EQUIPMENT,
  INITIAL_QUESTS,
  INITIAL_RAID_BOSS,
  INITIAL_SELF_REWARDS,
  INITIAL_TROPHIES,
  INITIAL_USER_PROFILE,
  NEW_USER_STARTER_PROFILE,
  NEW_USER_STARTER_QUESTS,
} from './data/initialData';
import {
  ActivityDayRecord,
  AppSettings,
  DailyReward,
  HeroEquipment,
  Quest,
  RaidBoss,
  SelfReward,
  Trophy,
  UserProfile,
} from './types';
import { playLevelUpSound, playRewardSound, setSoundEnabled } from './utils/audio';
import { api } from './services/api';

const INITIAL_SETTINGS: AppSettings = {
  soundEnabled: true,
  theme: 'retro-pop',
  focusDurationMinutes: 25,
  breakDurationMinutes: 5,
  autoCompleteOnFocusEnd: true,
  reduceAnimations: false,
  showGridBackground: true,
  dailyReminder: true,
};

export const App: React.FC = () => {
  // Loading & Auth States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Memasuki Realm Ksatria...');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('warrior_logged_in');
    return savedAuth !== null ? JSON.parse(savedAuth) : false;
  });

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<NavTabType>('home');

  // Modals
  const [isNewQuestOpen, setIsNewQuestOpen] = useState(false);
  const [isNewSelfRewardOpen, setIsNewSelfRewardOpen] = useState(false);
  const [isEnergyOpen, setIsEnergyOpen] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
  const [activeFocusQuest, setActiveFocusQuest] = useState<Quest | null>(null);
  const [unlockedMilestoneReward, setUnlockedMilestoneReward] = useState<SelfReward | null>(null);

  // App Core State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('warrior_user_profile');
    if (!saved) return INITIAL_USER_PROFILE;
    try {
      const parsed: UserProfile = JSON.parse(saved);
      // Migrate legacy low-res avatar if present
      if (parsed.avatarUrl && (parsed.avatarUrl.includes('googleusercontent') || !parsed.avatarUrl.startsWith('http'))) {
        parsed.avatarUrl = INITIAL_USER_PROFILE.avatarUrl;
      }
      return {
        ...INITIAL_USER_PROFILE,
        ...parsed,
      };
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem('warrior_quests');
    return saved ? JSON.parse(saved) : INITIAL_QUESTS;
  });

  const [selfRewards, setSelfRewards] = useState<SelfReward[]>(() => {
    const saved = localStorage.getItem('warrior_self_rewards');
    return saved ? JSON.parse(saved) : INITIAL_SELF_REWARDS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityDayRecord[]>(() => {
    const saved = localStorage.getItem('warrior_activity_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [dailyRewards, setDailyRewards] = useState<DailyReward[]>(() => {
    const saved = localStorage.getItem('warrior_daily_rewards');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_REWARDS;
  });

  const [trophies, setTrophies] = useState<Trophy[]>(() => {
    const saved = localStorage.getItem('warrior_trophies');
    return saved ? JSON.parse(saved) : INITIAL_TROPHIES;
  });

  const [equipment, setEquipment] = useState<HeroEquipment[]>(() => {
    const saved = localStorage.getItem('warrior_equipment');
    if (!saved) return INITIAL_EQUIPMENT;
    try {
      const parsed: HeroEquipment[] = JSON.parse(saved);
      return parsed.map((item) => ({
        ...item,
        icon: item.icon === 'vest' ? 'shield_with_heart' : item.icon,
      }));
    } catch {
      return INITIAL_EQUIPMENT;
    }
  });

  const [raidBoss, setRaidBoss] = useState<RaidBoss>(() => {
    const saved = localStorage.getItem('warrior_raid_boss');
    if (!saved) return INITIAL_RAID_BOSS;
    try {
      const parsed: RaidBoss = JSON.parse(saved);
      return {
        ...INITIAL_RAID_BOSS,
        ...parsed,
        imageUrl: parsed.imageUrl || INITIAL_RAID_BOSS.imageUrl,
        rewardCoins: parsed.rewardCoins || INITIAL_RAID_BOSS.rewardCoins,
        element: parsed.element || INITIAL_RAID_BOSS.element,
      };
    } catch {
      return INITIAL_RAID_BOSS;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('warrior_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Synchronize Audio State with settings
  useEffect(() => {
    setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Background Backend API Sync on Mount
  useEffect(() => {
    async function syncWithBackend() {
      try {
        const [heroData, questsData, bossData, equipData, rewardsData, trophiesData, dailyData] =
          await Promise.allSettled([
            api.hero.getProfile(),
            api.quests.getAll(),
            api.raidBoss.getActive(),
            api.inventory.getAll(),
            api.rewards.getAll(),
            api.trophies.getAll(),
            api.daily.getAll(),
          ]);

        if (heroData.status === 'fulfilled' && heroData.value) {
          setUser((prev) => ({ ...prev, ...heroData.value }));
        }
        if (questsData.status === 'fulfilled' && Array.isArray(questsData.value) && questsData.value.length > 0) {
          setQuests(questsData.value);
        }
        if (bossData.status === 'fulfilled' && bossData.value) {
          setRaidBoss((prev) => ({ ...prev, ...bossData.value }));
        }
        if (equipData.status === 'fulfilled' && Array.isArray(equipData.value) && equipData.value.length > 0) {
          setEquipment(equipData.value);
        }
        if (rewardsData.status === 'fulfilled' && Array.isArray(rewardsData.value) && rewardsData.value.length > 0) {
          setSelfRewards(rewardsData.value);
        }
        if (trophiesData.status === 'fulfilled' && Array.isArray(trophiesData.value) && trophiesData.value.length > 0) {
          setTrophies(trophiesData.value);
        }
        if (dailyData.status === 'fulfilled' && Array.isArray(dailyData.value) && dailyData.value.length > 0) {
          setDailyRewards(dailyData.value);
        }
      } catch (err) {
        console.log('[Backend Sync] Operating with local state:', err);
      }
    }
    syncWithBackend();

    // Real-Time Daily Streak Check based on Real Calendar Dates
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = user.lastLoginDate ? user.lastLoginDate.split('T')[0] : '';

    if (lastLogin && lastLogin !== today) {
      const todayDate = new Date(today);
      const lastDate = new Date(lastLogin);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        setUser((prev) => ({
          ...prev,
          streakDays: prev.streakDays + 1,
          lastLoginDate: today,
        }));
      } else if (diffDays > 1) {
        setUser((prev) => ({
          ...prev,
          streakDays: 1,
          lastLoginDate: today,
        }));
      }
    } else if (!lastLogin) {
      setUser((prev) => ({
        ...prev,
        lastLoginDate: today,
      }));
    }
  }, []);

  // Local Storage Persistence
  useEffect(() => {
    localStorage.setItem('warrior_logged_in', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('warrior_user_profile', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('warrior_quests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('warrior_self_rewards', JSON.stringify(selfRewards));
  }, [selfRewards]);

  useEffect(() => {
    localStorage.setItem('warrior_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('warrior_daily_rewards', JSON.stringify(dailyRewards));
  }, [dailyRewards]);

  useEffect(() => {
    localStorage.setItem('warrior_trophies', JSON.stringify(trophies));
  }, [trophies]);

  useEffect(() => {
    localStorage.setItem('warrior_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('warrior_raid_boss', JSON.stringify(raidBoss));
  }, [raidBoss]);

  useEffect(() => {
    localStorage.setItem('warrior_settings', JSON.stringify(settings));
  }, [settings]);

  // Auth Handlers
  const handleLogin = (profile: Partial<UserProfile>, isRegister?: boolean) => {
    if (isRegister) {
      const freshUser: UserProfile = {
        ...NEW_USER_STARTER_PROFILE,
        ...profile,
        id: `usr_${Date.now()}`,
        name: profile.name || 'Ksatria Baru',
      };
      const freshQuests = NEW_USER_STARTER_QUESTS;
      const freshRewards: SelfReward[] = [];
      const freshLogs: ActivityDayRecord[] = [
        {
          date: new Date().toISOString().slice(0, 10),
          xpEarned: 0,
          questsCompleted: 0,
          focusMinutes: 0,
          streakCount: 1,
        },
      ];
      const freshEquipment = INITIAL_EQUIPMENT.map((e) => ({
        ...e,
        equipped: e.id === 'eq-1',
        purchased: e.levelReq === 1,
      }));

      setUser(freshUser);
      setQuests(freshQuests);
      setSelfRewards(freshRewards);
      setActivityLogs(freshLogs);
      setEquipment(freshEquipment);
      setRaidBoss(INITIAL_RAID_BOSS);

      localStorage.setItem('warrior_user_profile', JSON.stringify(freshUser));
      localStorage.setItem('warrior_quests', JSON.stringify(freshQuests));
      localStorage.setItem('warrior_self_rewards', JSON.stringify(freshRewards));
      localStorage.setItem('warrior_activity_logs', JSON.stringify(freshLogs));
      localStorage.setItem('warrior_equipment', JSON.stringify(freshEquipment));
      localStorage.setItem('warrior_raid_boss', JSON.stringify(INITIAL_RAID_BOSS));

      setLoadingMessage(`Menempa Ksatria ${freshUser.name} (Level 1)...`);
    } else {
      setUser((prev) => ({
        ...prev,
        ...profile,
      }));
      setLoadingMessage(`Mengautentikasi ${profile.name || 'Ksatria'}...`);
    }

    setIsLoading(true);
    setIsLoggedIn(true);
  };

  const handleGuestLogin = () => {
    setUser(INITIAL_USER_PROFILE);
    setQuests(INITIAL_QUESTS);
    setSelfRewards(INITIAL_SELF_REWARDS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setEquipment(INITIAL_EQUIPMENT);
    setRaidBoss(INITIAL_RAID_BOSS);

    localStorage.setItem('warrior_user_profile', JSON.stringify(INITIAL_USER_PROFILE));
    localStorage.setItem('warrior_quests', JSON.stringify(INITIAL_QUESTS));
    localStorage.setItem('warrior_self_rewards', JSON.stringify(INITIAL_SELF_REWARDS));
    localStorage.setItem('warrior_activity_logs', JSON.stringify(INITIAL_ACTIVITY_LOGS));
    localStorage.setItem('warrior_equipment', JSON.stringify(INITIAL_EQUIPMENT));
    localStorage.setItem('warrior_raid_boss', JSON.stringify(INITIAL_RAID_BOSS));

    setLoadingMessage('Memuat Mode Demo Alex (Lvl 12 Warrior)...');
    setIsLoading(true);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.setItem('warrior_logged_in', 'false');
    setLoadingMessage('Kembali ke Gerbang Sanctuary...');
    setIsLoading(true);
    setIsLoggedIn(false);
  };

  // Settings Handlers
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  const handleResetToStarter = () => {
    const freshUser = { ...NEW_USER_STARTER_PROFILE, id: `usr_${Date.now()}` };
    const freshQuests = NEW_USER_STARTER_QUESTS;
    const freshRewards: SelfReward[] = [];
    const freshLogs: ActivityDayRecord[] = [
      {
        date: new Date().toISOString().slice(0, 10),
        xpEarned: 0,
        questsCompleted: 0,
        focusMinutes: 0,
        streakCount: 1,
      },
    ];
    const freshEquipment = INITIAL_EQUIPMENT.map((e) => ({
      ...e,
      equipped: e.id === 'eq-1',
      purchased: e.levelReq === 1,
    }));

    setUser(freshUser);
    setQuests(freshQuests);
    setSelfRewards(freshRewards);
    setActivityLogs(freshLogs);
    setEquipment(freshEquipment);
    setRaidBoss(INITIAL_RAID_BOSS);

    localStorage.setItem('warrior_user_profile', JSON.stringify(freshUser));
    localStorage.setItem('warrior_quests', JSON.stringify(freshQuests));
    localStorage.setItem('warrior_self_rewards', JSON.stringify(freshRewards));
    localStorage.setItem('warrior_activity_logs', JSON.stringify(freshLogs));
    localStorage.setItem('warrior_equipment', JSON.stringify(freshEquipment));
    localStorage.setItem('warrior_raid_boss', JSON.stringify(INITIAL_RAID_BOSS));

    playRewardSound();
  };

  const handleLoadDemoData = () => {
    setUser(INITIAL_USER_PROFILE);
    setQuests(INITIAL_QUESTS);
    setSelfRewards(INITIAL_SELF_REWARDS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setEquipment(INITIAL_EQUIPMENT);
    setRaidBoss(INITIAL_RAID_BOSS);

    localStorage.setItem('warrior_user_profile', JSON.stringify(INITIAL_USER_PROFILE));
    localStorage.setItem('warrior_quests', JSON.stringify(INITIAL_QUESTS));
    localStorage.setItem('warrior_self_rewards', JSON.stringify(INITIAL_SELF_REWARDS));
    localStorage.setItem('warrior_activity_logs', JSON.stringify(INITIAL_ACTIVITY_LOGS));
    localStorage.setItem('warrior_equipment', JSON.stringify(INITIAL_EQUIPMENT));
    localStorage.setItem('warrior_raid_boss', JSON.stringify(INITIAL_RAID_BOSS));

    playRewardSound();
  };

  const handleResetAllData = () => {
    handleResetToStarter();
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#ffe086', '#39ff14', '#00ffff'],
    });
  };

  const handleImportData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.user) setUser(data.user);
      if (data.quests) setQuests(data.quests);
      if (data.selfRewards) setSelfRewards(data.selfRewards);
      if (data.activityLogs) setActivityLogs(data.activityLogs);
      if (data.dailyRewards) setDailyRewards(data.dailyRewards);
      if (data.trophies) setTrophies(data.trophies);
      if (data.equipment) setEquipment(data.equipment);
      if (data.raidBoss) setRaidBoss(data.raidBoss);
      if (data.settings) setSettings(data.settings);
      playRewardSound();
      alert('Data petualangan berhasil diimpor!');
    } catch {
      alert('Format backup JSON tidak valid.');
    }
  };

  // Record daily activity log helper
  const logActivityForToday = (xpGained: number, questCountDelta = 1, focusMins = 0) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setActivityLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.date === todayStr);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          xpEarned: updated[existingIdx].xpEarned + xpGained,
          questsCompleted: updated[existingIdx].questsCompleted + questCountDelta,
          focusMinutes: updated[existingIdx].focusMinutes + focusMins,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            date: todayStr,
            xpEarned: xpGained,
            questsCompleted: questCountDelta,
            focusMinutes: focusMins,
            streakCount: user.streakDays,
          },
        ];
      }
    });
  };

  // XP & Level-Up Engine + Self-Reward Milestone Trigger
  const grantXp = (amount: number) => {
    setUser((prev) => {
      let newXp = prev.currentXp + amount;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      let newCoins = prev.coins + Math.round(amount * 0.5);

      // Check if this XP gain unlocks any self rewards!
      selfRewards.forEach((r) => {
        if (!r.claimed && prev.currentXp < r.targetXp && newXp >= r.targetXp) {
          // Newly unlocked self reward!
          setUnlockedMilestoneReward(r);
        }
      });

      if (newXp >= newMaxXp) {
        newXp = newXp - newMaxXp;
        newLevel += 1;
        newMaxXp = Math.round(newMaxXp * 1.35);
        newCoins += 300;
        playLevelUpSound();
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#ffe086', '#39ff14', '#00ffff', '#e51152'],
        });
        setLevelUpLevel(newLevel);
      }

      return {
        ...prev,
        currentXp: newXp,
        maxXp: newMaxXp,
        level: newLevel,
        coins: newCoins,
      };
    });

    logActivityForToday(amount, 0, 0);
  };

  // Boss Raid Engine
  const handleAttackBoss = (damage: number) => {
    setRaidBoss((prev) => {
      const nextHp = Math.max(0, prev.currentHp - damage);
      if (nextHp === 0 && prev.currentHp > 0) {
        // Boss Defeated Bounty!
        playRewardSound();
        confetti({
          particleCount: 120,
          spread: 100,
          colors: ['#ffe086', '#e51152', '#39ff14'],
        });
        grantXp(prev.rewardXp);
        setUser((u) => ({
          ...u,
          gems: u.gems + prev.rewardGems,
          coins: u.coins + 500,
        }));
      }
      return {
        ...prev,
        currentHp: nextHp,
      };
    });

    setUser((prev) => ({
      ...prev,
      energy: Math.max(0, prev.energy - 10),
      totalDamageDealt: prev.totalDamageDealt + damage,
    }));
  };

  // Quest Actions
  const handleToggleQuestComplete = (id: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const nextCompleted = !q.completed;
          if (nextCompleted) {
            grantXp(q.xpReward);
            handleAttackBoss(q.bossDamage || q.xpReward);
            logActivityForToday(0, 1, q.estimatedMinutes || 15);
            
            // Calculate extra coin & gem bonuses
            const extraGold = q.goldReward || 0;
            const extraGems = q.gemReward || 0;
            const statBoost = q.statAttribute;

            setUser((u) => {
              const updatedStats = { ...u.stats };
              if (statBoost && updatedStats[statBoost] !== undefined) {
                updatedStats[statBoost] += 1;
              }

              return {
                ...u,
                coins: u.coins + extraGold,
                gems: u.gems + extraGems,
                totalQuestsCompleted: u.totalQuestsCompleted + 1,
                stats: updatedStats,
              };
            });
          }
          return {
            ...q,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return q;
      })
    );
  };

  const handleToggleSubtask = (questId: string, subtaskId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && q.subtasks) {
          const updatedSubtasks = q.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return {
            ...q,
            subtasks: updatedSubtasks,
          };
        }
        return q;
      })
    );
  };

  const handleAddQuest = (newQ: Omit<Quest, 'id' | 'createdAt' | 'completed'>) => {
    const questItem: Quest = {
      ...newQ,
      id: `quest-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setQuests((prev) => [questItem, ...prev]);
  };

  const handleDeleteQuest = (id: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
  };

  // Self-Reward Handlers
  const handleAddSelfReward = (newReward: Omit<SelfReward, 'id' | 'unlocked' | 'claimed' | 'createdAt'>) => {
    const rewardItem: SelfReward = {
      ...newReward,
      id: `reward-${Date.now()}`,
      unlocked: user.currentXp >= newReward.targetXp,
      claimed: false,
      createdAt: new Date().toISOString(),
    };
    setSelfRewards((prev) => [rewardItem, ...prev]);
  };

  const handleClaimSelfReward = (rewardId: string) => {
    setSelfRewards((prev) =>
      prev.map((r) =>
        r.id === rewardId ? { ...r, claimed: true, claimedAt: new Date().toISOString() } : r
      )
    );
  };

  const handleDeleteSelfReward = (rewardId: string) => {
    setSelfRewards((prev) => prev.filter((r) => r.id !== rewardId));
  };

  // Focus Duel Victory
  const handleBattleVictory = (questId: string, damageDealt: number) => {
    handleToggleQuestComplete(questId);
    handleAttackBoss(damageDealt);
    setActiveFocusQuest(null);
  };

  // Claim Daily Streak
  const handleClaimDailyReward = (day: number) => {
    setDailyRewards((prev) =>
      prev.map((r) => {
        if (r.day === day) {
          if (r.rewardType === 'xp') grantXp(r.amount);
          if (r.rewardType === 'gem') setUser((u) => ({ ...u, gems: u.gems + r.amount }));
          if (r.rewardType === 'coin') setUser((u) => ({ ...u, coins: u.coins + r.amount }));
          return { ...r, claimed: true, label: 'Klaim!' };
        }
        return r;
      })
    );
  };

  // Claim Trophy Gem Bounty
  const handleClaimTrophyReward = (trophyId: string, gems: number) => {
    setTrophies((prev) =>
      prev.map((t) => (t.id === trophyId ? { ...t, claimedReward: true } : t))
    );
    setUser((prev) => ({ ...prev, gems: prev.gems + gems }));
  };

  // Equipment Armory & Shop
  const handleToggleEquip = (id: string) => {
    setEquipment((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, equipped: !eq.equipped } : eq))
    );
  };

  const handleBuyEquipment = (item: HeroEquipment) => {
    setUser((prev) => ({
      ...prev,
      coins: prev.coins - (item.priceGold || 0),
      gems: prev.gems - (item.priceGems || 0),
    }));

    setEquipment((prev) =>
      prev.map((eq) => (eq.id === item.id ? { ...eq, purchased: true, equipped: true } : eq))
    );
  };

  // Attributes Training
  const handleUpdateStats = (statName: keyof UserProfile['stats']) => {
    if (user.coins < 50) {
      alert('Membutuhkan 50 Gold untuk melatih atribut!');
      return;
    }
    playRewardSound();
    setUser((prev) => ({
      ...prev,
      coins: prev.coins - 50,
      maxEnergy: statName === 'vitality' ? prev.maxEnergy + 10 : prev.maxEnergy,
      stats: {
        ...prev.stats,
        [statName]: prev.stats[statName] + 1,
      },
    }));
  };

  // Profile Details Edit
  const handleUpdateProfile = (name: string, title: string, avatarUrl?: string, characterClass?: UserProfile['characterClass']) => {
    setUser((prev) => ({
      ...prev,
      name: name || prev.name,
      title: title || prev.title,
      avatarUrl: avatarUrl || prev.avatarUrl,
      characterClass: characterClass || prev.characterClass,
    }));
  };

  // Energy Recharge
  const handleRechargeEnergy = (amount: number, costGold = 0) => {
    setUser((prev) => ({
      ...prev,
      coins: prev.coins - costGold,
      energy: Math.min(prev.maxEnergy, prev.energy + amount),
    }));
  };

  // 1. Render Loading Screen if in loading state
  if (isLoading) {
    return (
      <LoadingScreen
        message={loadingMessage}
        minDuration={1400}
        onFinish={() => setIsLoading(false)}
      />
    );
  }

  // 2. Render Login Screen if not logged in
  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;
  }

  const activeQuestsCount = quests.filter((q) => !q.completed).length;
  const claimableRewardsCount = selfRewards.filter((r) => !r.claimed && user.currentXp >= r.targetXp).length;
  const claimableTrophiesCount = trophies.filter(
    (t) => (t.unlocked || t.progress >= t.maxProgress) && !t.claimedReward
  ).length;

  return (
    <div
      className={`min-h-screen bg-[#fff8f7] pb-24 lg:pb-12 selection:bg-[#e51152] selection:text-white ${
        settings.showGridBackground ? 'game-grid-bg' : ''
      }`}
    >
      <div className="w-full max-w-[1760px] mx-auto p-3 sm:p-4 md:p-6 lg:p-6 xl:p-8">
        <div className="lg:flex lg:gap-6 xl:gap-8 lg:items-start">
          {/* Desktop Left Navigation Sidebar & Hero HUD (Hidden on Mobile) */}
          <DesktopSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            user={user}
            settings={settings}
            activeQuestsCount={activeQuestsCount}
            claimableRewardsCount={claimableRewardsCount}
            claimableTrophiesCount={claimableTrophiesCount}
            onOpenNewQuestModal={() => setIsNewQuestOpen(true)}
            onOpenEnergyModal={() => setIsEnergyOpen(true)}
            onToggleSound={(enabled) => handleUpdateSettings({ soundEnabled: enabled })}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="block lg:hidden">
              <Header
                user={user}
                settings={settings}
                onOpenHeroModal={() => setActiveTab('hero')}
                onOpenSettings={() => setActiveTab('settings')}
                onOpenTrophies={() => setActiveTab('trophies')}
                onOpenEnergyModal={() => setIsEnergyOpen(true)}
                onToggleSound={(enabled) => handleUpdateSettings({ soundEnabled: enabled })}
                onLogout={handleLogout}
                claimableTrophiesCount={claimableTrophiesCount}
              />
            </div>

            {/* Desktop Top Bar (Hidden on Mobile) */}
            <DesktopTopBar
              activeTab={activeTab}
              user={user}
              settings={settings}
              claimableTrophiesCount={claimableTrophiesCount}
              onOpenEnergyModal={() => setIsEnergyOpen(true)}
              onOpenHeroModal={() => setActiveTab('hero')}
              onOpenSettings={() => setActiveTab('settings')}
              onOpenTrophies={() => setActiveTab('trophies')}
              onToggleSound={(enabled) => handleUpdateSettings({ soundEnabled: enabled })}
            />

            {/* Dynamic Active Tab View */}
            <main>
              {activeTab === 'home' && (
                <HomeView
                  user={user}
                  quests={quests}
                  raidBoss={raidBoss}
                  dailyRewards={dailyRewards}
                  onClaimDailyReward={handleClaimDailyReward}
                  onOpenEnergyModal={() => setIsEnergyOpen(true)}
                  onAttackBoss={handleAttackBoss}
                  onNavigateToQuests={() => setActiveTab('quests')}
                  onNavigateToHero={() => setActiveTab('hero')}
                  onNavigateToTrophies={() => setActiveTab('trophies')}
                  onToggleQuestComplete={handleToggleQuestComplete}
                  onStartFocus={(quest) => setActiveFocusQuest(quest)}
                />
              )}

              {activeTab === 'quests' && (
                <QuestsView
                  quests={quests}
                  onToggleComplete={handleToggleQuestComplete}
                  onToggleSubtask={handleToggleSubtask}
                  onOpenNewQuestModal={() => setIsNewQuestOpen(true)}
                  onStartFocus={(quest) => setActiveFocusQuest(quest)}
                  onDeleteQuest={handleDeleteQuest}
                />
              )}

              {activeTab === 'calendar' && (
                <CalendarAnalyticsView
                  user={user}
                  quests={quests}
                  activityLogs={activityLogs}
                />
              )}

              {activeTab === 'rewards' && (
                <SelfRewardView
                  user={user}
                  selfRewards={selfRewards}
                  onClaimReward={handleClaimSelfReward}
                  onOpenAddRewardModal={() => setIsNewSelfRewardOpen(true)}
                  onDeleteReward={handleDeleteSelfReward}
                />
              )}

              {activeTab === 'hero' && (
                <HeroView
                  user={user}
                  equipment={equipment}
                  onToggleEquip={handleToggleEquip}
                  onBuyEquipment={handleBuyEquipment}
                  onUpdateStats={handleUpdateStats}
                  onUpdateProfile={(name, title, avatarUrl, characterClass) =>
                    handleUpdateProfile(name, title, avatarUrl, characterClass)
                  }
                  onLogout={handleLogout}
                  onNavigateToTrophies={() => setActiveTab('trophies')}
                />
              )}

              {activeTab === 'trophies' && (
                <TrophiesView
                  trophies={trophies}
                  onClaimTrophyReward={handleClaimTrophyReward}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  user={user}
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onUpdateProfile={handleUpdateProfile}
                  onResetAllData={handleResetAllData}
                  onLoadDemoData={handleLoadDemoData}
                  onResetToStarter={handleResetToStarter}
                  onImportData={handleImportData}
                  onLogout={handleLogout}
                />
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Tab Navigation (Mobile Only) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeQuestsCount={activeQuestsCount}
        claimableRewardsCount={claimableRewardsCount}
        claimableTrophiesCount={claimableTrophiesCount}
      />

      {/* Modals & Dialogs */}
      <NewQuestModal
        isOpen={isNewQuestOpen}
        onClose={() => setIsNewQuestOpen(false)}
        onAddQuest={handleAddQuest}
      />

      <NewSelfRewardModal
        isOpen={isNewSelfRewardOpen}
        onClose={() => setIsNewSelfRewardOpen(false)}
        onAddSelfReward={handleAddSelfReward}
        currentXp={user.currentXp}
      />

      <SelfRewardMilestoneAlert
        unlockedReward={unlockedMilestoneReward}
        onDismiss={() => setUnlockedMilestoneReward(null)}
        onGoToRewards={() => {
          setUnlockedMilestoneReward(null);
          setActiveTab('rewards');
        }}
      />

      <EnergyModal
        isOpen={isEnergyOpen}
        onClose={() => setIsEnergyOpen(false)}
        currentEnergy={user.energy}
        maxEnergy={user.maxEnergy}
        onRecharge={handleRechargeEnergy}
        userCoins={user.coins}
      />

      <LevelUpModal
        isOpen={levelUpLevel !== null}
        onClose={() => setLevelUpLevel(null)}
        newLevel={levelUpLevel || 1}
      />

      <FocusBattleModal
        isOpen={activeFocusQuest !== null}
        onClose={() => setActiveFocusQuest(null)}
        quest={activeFocusQuest}
        onBattleVictory={handleBattleVictory}
      />
    </div>
  );
};

export default App;

