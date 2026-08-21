import {
  UserProfile,
  Quest,
  SelfReward,
  ActivityDayRecord,
  DailyReward,
  Trophy,
  HeroEquipment,
  RaidBoss,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (error: any) {
    console.warn(`[API Client Error] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // --- Auth API ---
  auth: {
    getMe: () => request<UserProfile>('/auth/me'),
    login: (email: string, password?: string) =>
      request<UserProfile>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    guestLogin: () =>
      request<UserProfile>('/auth/guest-login', {
        method: 'POST',
      }),
  },

  // --- Hero API ---
  hero: {
    getProfile: () => request<UserProfile>('/hero/profile'),
    updateProfile: (data: Partial<UserProfile>) =>
      request<UserProfile>('/hero/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    trainStat: (statKey: 'strength' | 'agility' | 'intelligence' | 'vitality') =>
      request<UserProfile>('/hero/train-stat', {
        method: 'POST',
        body: JSON.stringify({ statKey }),
      }),
    rechargeEnergy: (amount = 25, costGold = 50) =>
      request<UserProfile>('/hero/recharge-energy', {
        method: 'POST',
        body: JSON.stringify({ amount, costGold }),
      }),
  },

  // --- Quests API ---
  quests: {
    getAll: (params?: { category?: string; completed?: boolean; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.completed !== undefined) searchParams.set('completed', String(params.completed));
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return request<Quest[]>(`/quests${query}`);
    },
    create: (quest: Partial<Quest>) =>
      request<Quest>('/quests', {
        method: 'POST',
        body: JSON.stringify(quest),
      }),
    update: (id: string, updates: Partial<Quest>) =>
      request<Quest>(`/quests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    toggle: (id: string) =>
      request<{ quest: Quest; user: UserProfile; raidBoss: RaidBoss }>(`/quests/${id}/toggle`, {
        method: 'PATCH',
      }),
    toggleSubtask: (questId: string, subtaskId: string) =>
      request<Quest>(`/quests/${questId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/quests/${id}`, {
        method: 'DELETE',
      }),
  },

  // --- Focus Duel API ---
  focus: {
    recordSession: (durationMinutes: number, xpBonus = 50, questId?: string) =>
      request<{ user: UserProfile; focusMinutes: number; xpEarned: number }>('/focus/session', {
        method: 'POST',
        body: JSON.stringify({ durationMinutes, xpBonus, questId }),
      }),
  },

  // --- Raid Boss API ---
  raidBoss: {
    getActive: () => request<RaidBoss>('/raid-boss/active'),
    attack: () =>
      request<{
        damageDealt: number;
        isDefeated: boolean;
        raidBoss: RaidBoss;
        user: UserProfile;
      }>('/raid-boss/attack', {
        method: 'POST',
      }),
  },

  // --- Inventory & Shop API ---
  inventory: {
    getAll: () => request<HeroEquipment[]>('/inventory'),
    equip: (id: string) =>
      request<{ item: HeroEquipment; equipment: HeroEquipment[] }>(`/inventory/equip/${id}`, {
        method: 'POST',
      }),
    buy: (id: string) =>
      request<{ item: HeroEquipment; user: UserProfile; equipment: HeroEquipment[] }>(
        `/inventory/buy/${id}`,
        { method: 'POST' }
      ),
  },

  // --- Self Rewards API ---
  rewards: {
    getAll: () => request<SelfReward[]>('/rewards'),
    create: (reward: Partial<SelfReward>) =>
      request<SelfReward>('/rewards', {
        method: 'POST',
        body: JSON.stringify(reward),
      }),
    claim: (id: string) =>
      request<SelfReward>(`/rewards/${id}/claim`, {
        method: 'PATCH',
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/rewards/${id}`, {
        method: 'DELETE',
      }),
  },

  // --- Trophies API ---
  trophies: {
    getAll: () => request<Trophy[]>('/trophies'),
    claim: (id: string) =>
      request<{ trophy: Trophy; user: UserProfile }>(`/trophies/${id}/claim`, {
        method: 'POST',
      }),
  },

  // --- Daily Login Streak API ---
  daily: {
    getAll: () => request<DailyReward[]>('/daily'),
    claim: (day: number) =>
      request<{ reward: DailyReward; user: UserProfile }>(`/daily/claim/${day}`, {
        method: 'POST',
      }),
  },

  // --- Analytics API ---
  analytics: {
    getActivityLogs: () => request<ActivityDayRecord[]>('/analytics/activity-logs'),
    getSummary: () => request<any>('/analytics/summary'),
  },

  // --- Sync API ---
  sync: {
    exportData: () => request<any>('/sync/export'),
    importData: (data: any) =>
      request<{ success: boolean; message: string }>('/sync/import', {
        method: 'POST',
        body: JSON.stringify({ data }),
      }),
    resetData: () =>
      request<{ success: boolean; message: string }>('/sync/reset', {
        method: 'POST',
      }),
  },
};
