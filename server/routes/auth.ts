import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { UserProfile } from '../../src/types';

export const authRouter = Router();

// GET /api/auth/me - Get current active user
authRouter.get('/me', (_req: Request, res: Response) => {
  const user = dbStore.getUser();
  return res.json({ success: true, data: user });
});

// POST /api/auth/login - Simple login or verify
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const existing = dbStore.getDb().users.find((u) => u.email === email);
  if (existing) {
    return res.json({
      success: true,
      message: 'Login successful',
      token: `jwt_token_${existing.id}_${Date.now()}`,
      data: existing,
    });
  }

  // Auto-register fresh Level 1 profile for new registrations
  const newUser: UserProfile = {
    id: `hero_${Date.now()}`,
    email,
    name: email.split('@')[0] || 'Ksatria Baru',
    characterClass: 'Warrior',
    title: 'Pemula Pencari Disiplin',
    level: 1,
    currentXp: 0,
    maxXp: 200,
    lifetimeXp: 0,
    totalFocusMinutes: 0,
    streakDays: 1,
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ValiantWarrior&backgroundColor=ffe2e6',
    energy: 100,
    maxEnergy: 100,
    gems: 10,
    coins: 100,
    lastLoginDate: new Date().toISOString(),
    totalQuestsCompleted: 0,
    totalDamageDealt: 0,
    stats: {
      strength: 10,
      agility: 10,
      intelligence: 10,
      vitality: 10,
    },
  };

  dbStore.addUser(newUser);
  return res.json({
    success: true,
    message: 'Ksatria Baru berhasil dibuat (Level 1)!',
    token: `jwt_token_${newUser.id}_${Date.now()}`,
    data: newUser,
  });
});

// POST /api/auth/guest-login - Instant guest player
authRouter.post('/guest-login', (_req: Request, res: Response) => {
  const user = dbStore.getUser();
  return res.json({
    success: true,
    message: 'Logged in as guest',
    token: `guest_token_${Date.now()}`,
    data: user,
  });
});
