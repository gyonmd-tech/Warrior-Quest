import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';

export const trophiesRouter = Router();

// GET /api/trophies - Get all trophies and achievements
trophiesRouter.get('/', (_req: Request, res: Response) => {
  const trophies = dbStore.getTrophies();
  return res.json({ success: true, count: trophies.length, data: trophies });
});

// POST /api/trophies/:id/claim - Claim gem rewards from unlocked trophy
trophiesRouter.post('/:id/claim', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = dbStore.getUser();
  const trophies = dbStore.getTrophies();
  const trophy = trophies.find((t) => t.id === id);

  if (!trophy) {
    return res.status(404).json({ success: false, message: 'Trophy not found' });
  }

  const isUnlocked = trophy.unlocked || trophy.progress >= trophy.maxProgress;
  if (!isUnlocked) {
    return res.status(400).json({ success: false, message: 'Trophy is still locked' });
  }

  if (trophy.claimedReward) {
    return res.status(400).json({ success: false, message: 'Trophy reward has already been claimed' });
  }

  const updatedTrophy = dbStore.updateTrophy(id, { claimedReward: true });
  const updatedUser = dbStore.updateUser(user.id, { gems: user.gems + trophy.rewardGems });

  return res.json({
    success: true,
    message: `Claimed +${trophy.rewardGems} Gems from trophy: ${trophy.title}!`,
    data: {
      trophy: updatedTrophy,
      user: updatedUser,
    },
  });
});
