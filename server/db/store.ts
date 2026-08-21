import fs from 'fs';
import path from 'path';
import {
  UserProfile,
  Quest,
  SelfReward,
  ActivityDayRecord,
  DailyReward,
  Trophy,
  HeroEquipment,
  RaidBoss,
  AppSettings,
} from '../../src/types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_QUESTS,
  INITIAL_SELF_REWARDS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_DAILY_REWARDS,
  INITIAL_TROPHIES,
  INITIAL_EQUIPMENT,
  INITIAL_RAID_BOSS,
  INITIAL_SETTINGS,
} from '../../src/data/initialData';

export interface DatabaseSchema {
  users: (UserProfile & { passwordHash?: string; isGuest?: boolean })[];
  quests: Quest[];
  selfRewards: SelfReward[];
  activityLogs: ActivityDayRecord[];
  dailyRewards: DailyReward[];
  trophies: Trophy[];
  equipment: HeroEquipment[];
  raidBoss: RaidBoss;
  settings: AppSettings;
}

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class DatabaseStore {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadInitialData();
  }

  private loadInitialData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [INITIAL_USER_PROFILE],
          quests: parsed.quests || INITIAL_QUESTS,
          selfRewards: parsed.selfRewards || INITIAL_SELF_REWARDS,
          activityLogs: parsed.activityLogs || INITIAL_ACTIVITY_LOGS,
          dailyRewards: parsed.dailyRewards || INITIAL_DAILY_REWARDS,
          trophies: parsed.trophies || INITIAL_TROPHIES,
          equipment: parsed.equipment || INITIAL_EQUIPMENT,
          raidBoss: parsed.raidBoss || INITIAL_RAID_BOSS,
          settings: parsed.settings || INITIAL_SETTINGS,
        };
      }
    } catch (err) {
      console.warn('[Database] Failed to read db.json, initializing with default dataset:', err);
    }

    const defaultDb: DatabaseSchema = {
      users: [{ ...INITIAL_USER_PROFILE, isGuest: true }],
      quests: INITIAL_QUESTS,
      selfRewards: INITIAL_SELF_REWARDS,
      activityLogs: INITIAL_ACTIVITY_LOGS,
      dailyRewards: INITIAL_DAILY_REWARDS,
      trophies: INITIAL_TROPHIES,
      equipment: INITIAL_EQUIPMENT,
      raidBoss: INITIAL_RAID_BOSS,
      settings: INITIAL_SETTINGS,
    };

    this.persistSync(defaultDb);
    return defaultDb;
  }

  public getDb(): DatabaseSchema {
    return this.data;
  }

  public saveDebounced(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistSync(this.data);
    }, 200);
  }

  public persistSync(dataToSave: DatabaseSchema = this.data): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to persist data to disk:', err);
    }
  }

  // --- Users & Hero Operations ---
  public getUser(userId?: string) {
    if (!userId) return this.data.users[0] || INITIAL_USER_PROFILE;
    return this.data.users.find((u) => u.id === userId) || this.data.users[0];
  }

  public updateUser(userId: string, updates: Partial<UserProfile>) {
    const index = this.data.users.findIndex((u) => u.id === userId);
    if (index >= 0) {
      this.data.users[index] = { ...this.data.users[index], ...updates };
      this.saveDebounced();
      return this.data.users[index];
    } else if (this.data.users.length > 0) {
      this.data.users[0] = { ...this.data.users[0], ...updates };
      this.saveDebounced();
      return this.data.users[0];
    }
    return null;
  }

  public addUser(user: UserProfile & { passwordHash?: string; isGuest?: boolean }) {
    this.data.users.push(user);
    this.saveDebounced();
    return user;
  }

  // --- Quests Operations ---
  public getQuests() {
    return this.data.quests;
  }

  public addQuest(quest: Quest) {
    this.data.quests.unshift(quest);
    this.saveDebounced();
    return quest;
  }

  public updateQuest(id: string, updates: Partial<Quest>) {
    const index = this.data.quests.findIndex((q) => q.id === id);
    if (index >= 0) {
      this.data.quests[index] = { ...this.data.quests[index], ...updates };
      this.saveDebounced();
      return this.data.quests[index];
    }
    return null;
  }

  public deleteQuest(id: string) {
    const initialLen = this.data.quests.length;
    this.data.quests = this.data.quests.filter((q) => q.id !== id);
    if (this.data.quests.length !== initialLen) {
      this.saveDebounced();
      return true;
    }
    return false;
  }

  // --- Raid Boss Operations ---
  public getRaidBoss() {
    return this.data.raidBoss;
  }

  public updateRaidBoss(updates: Partial<RaidBoss>) {
    this.data.raidBoss = { ...this.data.raidBoss, ...updates };
    this.saveDebounced();
    return this.data.raidBoss;
  }

  // --- Inventory & Shop Operations ---
  public getEquipment() {
    return this.data.equipment;
  }

  public updateEquipmentItem(id: string, updates: Partial<HeroEquipment>) {
    const index = this.data.equipment.findIndex((e) => e.id === id);
    if (index >= 0) {
      this.data.equipment[index] = { ...this.data.equipment[index], ...updates };
      this.saveDebounced();
      return this.data.equipment[index];
    }
    return null;
  }

  // --- Self-Rewards Operations ---
  public getSelfRewards() {
    return this.data.selfRewards;
  }

  public addSelfReward(reward: SelfReward) {
    this.data.selfRewards.unshift(reward);
    this.saveDebounced();
    return reward;
  }

  public updateSelfReward(id: string, updates: Partial<SelfReward>) {
    const index = this.data.selfRewards.findIndex((r) => r.id === id);
    if (index >= 0) {
      this.data.selfRewards[index] = { ...this.data.selfRewards[index], ...updates };
      this.saveDebounced();
      return this.data.selfRewards[index];
    }
    return null;
  }

  public deleteSelfReward(id: string) {
    const initialLen = this.data.selfRewards.length;
    this.data.selfRewards = this.data.selfRewards.filter((r) => r.id !== id);
    if (this.data.selfRewards.length !== initialLen) {
      this.saveDebounced();
      return true;
    }
    return false;
  }

  // --- Trophies Operations ---
  public getTrophies() {
    return this.data.trophies;
  }

  public updateTrophy(id: string, updates: Partial<Trophy>) {
    const index = this.data.trophies.findIndex((t) => t.id === id);
    if (index >= 0) {
      this.data.trophies[index] = { ...this.data.trophies[index], ...updates };
      this.saveDebounced();
      return this.data.trophies[index];
    }
    return null;
  }

  // --- Daily Rewards Operations ---
  public getDailyRewards() {
    return this.data.dailyRewards;
  }

  public claimDailyReward(day: number) {
    const index = this.data.dailyRewards.findIndex((d) => d.day === day);
    if (index >= 0) {
      this.data.dailyRewards[index].claimed = true;
      this.saveDebounced();
      return this.data.dailyRewards[index];
    }
    return null;
  }

  // --- Activity Logs Operations ---
  public getActivityLogs() {
    return this.data.activityLogs;
  }

  public recordActivity(date: string, deltaXp: number, deltaQuests: number, deltaFocus: number) {
    const existing = this.data.activityLogs.find((l) => l.date === date);
    if (existing) {
      existing.xpEarned += deltaXp;
      existing.questsCompleted += deltaQuests;
      existing.focusMinutes += deltaFocus;
    } else {
      this.data.activityLogs.push({
        date,
        xpEarned: Math.max(0, deltaXp),
        questsCompleted: Math.max(0, deltaQuests),
        focusMinutes: Math.max(0, deltaFocus),
        streakCount: this.getUser().streakDays,
      });
    }
    this.saveDebounced();
  }

  // --- Settings Operations ---
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<AppSettings>) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveDebounced();
    return this.data.settings;
  }

  // --- Full Import / Reset ---
  public importFullData(imported: Partial<DatabaseSchema>) {
    if (imported.users) this.data.users = imported.users;
    if (imported.quests) this.data.quests = imported.quests;
    if (imported.selfRewards) this.data.selfRewards = imported.selfRewards;
    if (imported.activityLogs) this.data.activityLogs = imported.activityLogs;
    if (imported.dailyRewards) this.data.dailyRewards = imported.dailyRewards;
    if (imported.trophies) this.data.trophies = imported.trophies;
    if (imported.equipment) this.data.equipment = imported.equipment;
    if (imported.raidBoss) this.data.raidBoss = imported.raidBoss;
    if (imported.settings) this.data.settings = imported.settings;
    this.persistSync();
    return true;
  }

  public resetAllToDefault() {
    this.data = {
      users: [{ ...INITIAL_USER_PROFILE, isGuest: true }],
      quests: INITIAL_QUESTS,
      selfRewards: INITIAL_SELF_REWARDS,
      activityLogs: INITIAL_ACTIVITY_LOGS,
      dailyRewards: INITIAL_DAILY_REWARDS,
      trophies: INITIAL_TROPHIES,
      equipment: INITIAL_EQUIPMENT,
      raidBoss: INITIAL_RAID_BOSS,
      settings: INITIAL_SETTINGS,
    };
    this.persistSync();
    return true;
  }
}

export const dbStore = new DatabaseStore();
