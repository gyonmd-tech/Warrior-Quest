import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { SelfReward } from '../../src/types';

export const rewardsRouter = Router();

// GET /api/rewards - Get all self-rewards
rewardsRouter.get('/', (_req: Request, res: Response) => {
  const rewards = dbStore.getSelfRewards();
  return res.json({ success: true, count: rewards.length, data: rewards });
});

// POST /api/rewards - Create a new self-reward target
rewardsRouter.post('/', (req: Request, res: Response) => {
  const { title, description = '', targetXp, category = 'custom', icon = 'card_giftcard' } = req.body;

  if (!title || !targetXp) {
    return res.status(400).json({ success: false, message: 'Title and Target XP are required' });
  }

  const newReward: SelfReward = {
    id: `reward_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: title.trim(),
    description,
    targetXp: Number(targetXp),
    category,
    icon,
    unlocked: false,
    claimed: false,
    createdAt: new Date().toISOString(),
  };

  dbStore.addSelfReward(newReward);
  return res.status(201).json({ success: true, message: 'Self-Reward target created!', data: newReward });
});

// PATCH /api/rewards/:id/claim - Claim a reached self-reward
rewardsRouter.patch('/:id/claim', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = dbStore.getUser();
  const rewards = dbStore.getSelfRewards();
  const reward = rewards.find((r) => r.id === id);

  if (!reward) {
    return res.status(404).json({ success: false, message: 'Reward not found' });
  }

  if (reward.claimed) {
    return res.status(400).json({ success: false, message: 'Reward has already been claimed' });
  }

  if (user.currentXp < reward.targetXp) {
    return res.status(400).json({
      success: false,
      message: `Target XP not reached yet! Need ${reward.targetXp - user.currentXp} more XP.`,
    });
  }

  const updatedReward = dbStore.updateSelfReward(id, {
    claimed: true,
    claimedAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    message: `Congratulations! You claimed your self-reward: ${reward.title}!`,
    data: updatedReward,
  });
});

// DELETE /api/rewards/:id - Delete a self-reward
rewardsRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = dbStore.deleteSelfReward(id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Reward not found' });
  }

  return res.json({ success: true, message: 'Self-reward deleted' });
});
