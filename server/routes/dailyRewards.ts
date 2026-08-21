import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';

export const dailyRewardsRouter = Router();

// GET /api/daily - Get daily login rewards status
dailyRewardsRouter.get('/', (_req: Request, res: Response) => {
  const dailyRewards = dbStore.getDailyRewards();
  return res.json({ success: true, data: dailyRewards });
});

// POST /api/daily/claim/:day - Claim a specific daily login reward
dailyRewardsRouter.post('/claim/:day', (req: Request, res: Response) => {
  const day = Number(req.params.day);
  const user = dbStore.getUser();
  const dailyRewards = dbStore.getDailyRewards();
  const reward = dailyRewards.find((d) => d.day === day);

  if (!reward) {
    return res.status(404).json({ success: false, message: 'Daily reward day not found' });
  }

  if (reward.claimed) {
    return res.status(400).json({ success: false, message: 'Reward already claimed for this day' });
  }

  const updatedReward = dbStore.claimDailyReward(day);

  // Grant the specific reward type
  let userUpdates: any = {};
  if (reward.rewardType === 'gem') {
    userUpdates.gems = user.gems + reward.amount;
  } else if (reward.rewardType === 'coin') {
    userUpdates.coins = user.coins + reward.amount;
  } else if (reward.rewardType === 'xp') {
    userUpdates.currentXp = user.currentXp + reward.amount;
  }

  const updatedUser = dbStore.updateUser(user.id, userUpdates);

  return res.json({
    success: true,
    message: `Claimed Day ${day} reward: +${reward.amount} ${reward.rewardType.toUpperCase()}!`,
    data: {
      reward: updatedReward,
      user: updatedUser,
    },
  });
});
