import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';

export const raidBossRouter = Router();

// GET /api/raid-boss/active - Get active Raid Boss status
raidBossRouter.get('/active', (_req: Request, res: Response) => {
  const boss = dbStore.getRaidBoss();
  return res.json({ success: true, data: boss });
});

// POST /api/raid-boss/attack - Attack the Raid Boss
raidBossRouter.post('/attack', (req: Request, res: Response) => {
  const user = dbStore.getUser();
  const boss = dbStore.getRaidBoss();
  const energyCost = 10;

  if (user.energy < energyCost) {
    return res.status(400).json({ success: false, message: 'Not enough Focus Energy to attack boss' });
  }

  if (boss.currentHp <= 0) {
    return res.status(400).json({ success: false, message: 'Boss has already been defeated! Claiming victory rewards.' });
  }

  // Calculate damage based on user level and STR stat
  const baseDamage = 250;
  const strBonus = (user.stats?.strength || 10) * 15;
  const totalDamage = baseDamage + strBonus;

  const newHp = Math.max(0, boss.currentHp - totalDamage);
  const updatedBoss = dbStore.updateRaidBoss({ currentHp: newHp });

  // Grant small XP per strike
  const strikeXp = 35;
  let newCurrentXp = user.currentXp + strikeXp;
  let newLevel = user.level;
  let newMaxXp = user.maxXp;
  let extraCoins = 0;
  let extraGems = 0;

  // If this strike defeats the boss, grant victory rewards!
  const isDefeated = newHp === 0 && boss.currentHp > 0;
  if (isDefeated) {
    newCurrentXp += boss.rewardXp;
    extraCoins = boss.rewardCoins || 500;
    extraGems = boss.rewardGems || 50;
  }

  while (newCurrentXp >= newMaxXp) {
    newCurrentXp -= newMaxXp;
    newLevel += 1;
    newMaxXp = Math.round(newMaxXp * 1.25);
  }

  const updatedUser = dbStore.updateUser(user.id, {
    energy: user.energy - energyCost,
    currentXp: newCurrentXp,
    level: newLevel,
    maxXp: newMaxXp,
    coins: user.coins + extraCoins,
    gems: user.gems + extraGems,
    totalDamageDealt: user.totalDamageDealt + totalDamage,
  });

  return res.json({
    success: true,
    message: isDefeated
      ? `VICTORY! Boss defeated with ${totalDamage} DMG! Claimed +${boss.rewardXp} XP & +${extraCoins} Gold!`
      : `Dealt ${totalDamage} damage to ${boss.name}!`,
    data: {
      damageDealt: totalDamage,
      isDefeated,
      raidBoss: updatedBoss,
      user: updatedUser,
    },
  });
});
