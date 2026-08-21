import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';

export const analyticsRouter = Router();

// GET /api/analytics/activity-logs - Get all daily activity logs for charts & calendar
analyticsRouter.get('/activity-logs', (_req: Request, res: Response) => {
  const logs = dbStore.getActivityLogs();
  return res.json({ success: true, count: logs.length, data: logs });
});

// GET /api/analytics/summary - Get career productivity summary
analyticsRouter.get('/summary', (_req: Request, res: Response) => {
  const user = dbStore.getUser();
  const quests = dbStore.getQuests();
  const logs = dbStore.getActivityLogs();

  const totalQuests = quests.length;
  const completedQuests = quests.filter((q) => q.completed).length;
  const totalFocusMinutes = logs.reduce((acc, curr) => acc + curr.focusMinutes, 0);
  const totalXpEarned = logs.reduce((acc, curr) => acc + curr.xpEarned, 0);

  return res.json({
    success: true,
    data: {
      level: user.level,
      streakDays: user.streakDays,
      totalQuests,
      completedQuests,
      completionRate: totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0,
      totalFocusMinutes,
      totalXpEarned,
      totalDamageDealt: user.totalDamageDealt,
    },
  });
});
