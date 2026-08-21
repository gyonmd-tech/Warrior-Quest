import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';

export const heroRouter = Router();

// GET /api/hero/profile - Get hero profile
heroRouter.get('/profile', (_req: Request, res: Response) => {
  const user = dbStore.getUser();
  return res.json({ success: true, data: user });
});

// PUT /api/hero/profile - Update hero profile details
heroRouter.put('/profile', (req: Request, res: Response) => {
  const { name, title, avatarUrl, characterClass } = req.body;
  const currentUser = dbStore.getUser();

  const updated = dbStore.updateUser(currentUser.id, {
    ...(name && { name }),
    ...(title && { title }),
    ...(avatarUrl && { avatarUrl }),
    ...(characterClass && { characterClass }),
  });

  return res.json({ success: true, message: 'Profile updated successfully', data: updated });
});

// POST /api/hero/train-stat - Train strength, agility, intelligence, or vitality
heroRouter.post('/train-stat', (req: Request, res: Response) => {
  const { statKey } = req.body; // 'strength' | 'agility' | 'intelligence' | 'vitality'
  const user = dbStore.getUser();

  if (!['strength', 'agility', 'intelligence', 'vitality'].includes(statKey)) {
    return res.status(400).json({ success: false, message: 'Invalid stat key' });
  }

  const costGold = 100;
  if (user.coins < costGold) {
    return res.status(400).json({ success: false, message: 'Insufficient Gold coins for training' });
  }

  const updatedStats = {
    ...user.stats,
    [statKey]: user.stats[statKey as keyof typeof user.stats] + 1,
  };

  const updatedUser = dbStore.updateUser(user.id, {
    coins: user.coins - costGold,
    stats: updatedStats,
  });

  return res.json({
    success: true,
    message: `Successfully trained ${statKey}!`,
    data: updatedUser,
  });
});

// POST /api/hero/recharge-energy - Buy energy with Gold or Gems
heroRouter.post('/recharge-energy', (req: Request, res: Response) => {
  const { amount = 25, costGold = 50 } = req.body;
  const user = dbStore.getUser();

  if (user.coins < costGold) {
    return res.status(400).json({ success: false, message: 'Not enough Gold to recharge energy' });
  }

  const newEnergy = Math.min(user.maxEnergy, user.energy + amount);
  const updatedUser = dbStore.updateUser(user.id, {
    coins: user.coins - costGold,
    energy: newEnergy,
  });

  return res.json({
    success: true,
    message: `Recharged ${amount} focus energy!`,
    data: updatedUser,
  });
});
