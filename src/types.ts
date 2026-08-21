export type QuestCategory = 'legendary' | 'daily' | 'side';
export type StatAttribute = 'strength' | 'agility' | 'intelligence' | 'vitality';

export interface QuestSubtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  category: QuestCategory;
  xpReward: number;
  goldReward?: number;
  gemReward?: number;
  bossDamage?: number;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  description?: string;
  estimatedMinutes?: number;
  priority?: 'high' | 'medium' | 'low';
  icon?: string;
  statAttribute?: StatAttribute;
  difficultyRating?: 1 | 2 | 3 | 4 | 5;
  subtasks?: QuestSubtask[];
  tags?: string[];
  recurring?: 'none' | 'daily' | 'weekly';
}

export interface DailyReward {
  day: number;
  rewardType: 'xp' | 'gem' | 'badge' | 'coin';
  amount: number;
  label: string;
  icon: string;
  claimed: boolean;
}

export interface SelfReward {
  id: string;
  title: string;
  description?: string;
  targetXp: number;
  icon: string;
  category: 'treat' | 'gaming' | 'shopping' | 'rest' | 'custom';
  unlocked: boolean;
  claimed: boolean;
  claimedAt?: string;
  createdAt: string;
}

export interface ActivityDayRecord {
  date: string; // YYYY-MM-DD
  xpEarned: number;
  questsCompleted: number;
  focusMinutes: number;
  streakCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  characterClass: 'Warrior' | 'Mage' | 'Rogue' | 'Paladin';
  title: string;
  level: number;
  currentXp: number;
  maxXp: number;
  lifetimeXp?: number;
  totalFocusMinutes?: number;
  streakDays: number;
  avatarUrl: string;
  energy: number;
  maxEnergy: number;
  gems: number;
  coins: number;
  lastLoginDate: string;
  totalQuestsCompleted: number;
  totalDamageDealt: number;
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
  };
}

export interface Trophy {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  rewardGems: number;
  claimedReward?: boolean;
}

export interface HeroEquipment {
  id: string;
  name: string;
  type: 'weapon' | 'shield' | 'armor' | 'pet' | 'potion';
  icon: string;
  stats: string;
  equipped: boolean;
  levelReq: number;
  priceGold?: number;
  priceGems?: number;
  purchased?: boolean;
  description: string;
}

export interface RaidBoss {
  id: string;
  name: string;
  title: string;
  currentHp: number;
  maxHp: number;
  avatarIcon: string;
  imageUrl?: string;
  rewardXp: number;
  rewardCoins?: number;
  rewardGems: number;
  timeRemainingHours: number;
  weakness: string;
  element?: string;
}

export interface GuildMember {
  rank: number;
  name: string;
  characterClass: string;
  level: number;
  weeklyXp: number;
  avatarUrl: string;
  isCurrentUser?: boolean;
}

export interface AppSettings {
  soundEnabled: boolean;
  theme: 'retro-pop' | 'dark-dungeon' | 'clean-light';
  focusDurationMinutes: number;
  breakDurationMinutes: number;
  autoCompleteOnFocusEnd: boolean;
  reduceAnimations: boolean;
  showGridBackground: boolean;
  dailyReminder: boolean;
}

