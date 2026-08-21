import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';

export const focusRouter = Router();

// POST /api/focus/session - Record a completed focus session
focusRouter.post('/session', (req: Request, res: Response) => {
  const { questId, durationMinutes = 25, xpBonus = 50 } = req.body;
  const user = dbStore.getUser();

  const minutes = Number(durationMinutes) || 25;
  const bonusXp = Number(xpBonus) || 50;

  // Add focus XP & deduct stamina / energy slightly
  let newCurrentXp = user.currentXp + bonusXp;
  let newLevel = user.level;
  let newMaxXp = user.maxXp;

  while (newCurrentXp >= newMaxXp) {
    newCurrentXp -= newMaxXp;
    newLevel += 1;
    newMaxXp = Math.round(newMaxXp * 1.25);
  }

  const updatedUser = dbStore.updateUser(user.id, {
    level: newLevel,
    currentXp: newCurrentXp,
    maxXp: newMaxXp,
    totalFocusMinutes: (user.totalFocusMinutes || 0) + minutes,
  });

  // Record into daily analytics log
  const today = new Date().toISOString().slice(0, 10);
  dbStore.recordActivity(today, bonusXp, 0, minutes);

  return res.json({
    success: true,
    message: `Focus session of ${minutes}m recorded! +${bonusXp} XP granted.`,
    data: {
      user: updatedUser,
      focusMinutes: minutes,
      xpEarned: bonusXp,
    },
  });
});
