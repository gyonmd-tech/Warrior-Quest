import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { Quest } from '../../src/types';

export const questsRouter = Router();

// GET /api/quests - Get all quests with optional filters
questsRouter.get('/', (req: Request, res: Response) => {
  const { category, completed, search } = req.query;
  let quests = dbStore.getQuests();

  if (category && typeof category === 'string') {
    quests = quests.filter((q) => q.category === category);
  }

  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    quests = quests.filter((q) => q.completed === isCompleted);
  }

  if (search && typeof search === 'string') {
    const query = search.toLowerCase();
    quests = quests.filter(
      (q) => q.title.toLowerCase().includes(query) || q.description?.toLowerCase().includes(query)
    );
  }

  return res.json({ success: true, count: quests.length, data: quests });
});

// POST /api/quests - Create a new quest
questsRouter.post('/', (req: Request, res: Response) => {
  const {
    title,
    category = 'daily',
    xpReward = 100,
    goldReward = 50,
    gemReward = 0,
    bossDamage = 100,
    estimatedMinutes = 25,
    priority = 'medium',
    description = '',
    statAttribute,
    dueDate,
    subtasks = [],
  } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ success: false, message: 'Quest title is required' });
  }

  const newQuest: Quest = {
    id: `quest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: title.trim(),
    category,
    xpReward: Number(xpReward) || 100,
    goldReward: Number(goldReward) || 50,
    gemReward: Number(gemReward) || 0,
    bossDamage: Number(bossDamage) || 100,
    estimatedMinutes: Number(estimatedMinutes) || 25,
    priority,
    description,
    statAttribute,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: Array.isArray(subtasks)
      ? subtasks.map((st: any, i: number) => ({
          id: `st_${Date.now()}_${i}`,
          text: typeof st === 'string' ? st : st.text || '',
          completed: false,
        }))
      : [],
  };

  dbStore.addQuest(newQuest);
  return res.status(201).json({ success: true, message: 'Quest created successfully', data: newQuest });
});

// PUT /api/quests/:id - Update existing quest
questsRouter.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = dbStore.updateQuest(id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Quest not found' });
  }

  return res.json({ success: true, message: 'Quest updated successfully', data: updated });
});

// PATCH /api/quests/:id/toggle - Toggle quest complete/incomplete & compute progression
questsRouter.patch('/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const quests = dbStore.getQuests();
  const quest = quests.find((q) => q.id === id);

  if (!quest) {
    return res.status(404).json({ success: false, message: 'Quest not found' });
  }

  const newCompleted = !quest.completed;
  const completedAt = newCompleted ? new Date().toISOString() : undefined;
  const updatedQuest = dbStore.updateQuest(id, { completed: newCompleted, completedAt });

  // If newly completed, award XP, Gold, Gems, Boss Damage & Activity Log
  const user = dbStore.getUser();
  if (newCompleted) {
    const earnedXp = quest.xpReward;
    const earnedGold = quest.goldReward || 0;
    const earnedGems = quest.gemReward || 0;
    const bossDmg = quest.bossDamage || 100;

    let newCurrentXp = user.currentXp + earnedXp;
    let newLevel = user.level;
    let newMaxXp = user.maxXp;

    // Handle level up curve
    while (newCurrentXp >= newMaxXp) {
      newCurrentXp -= newMaxXp;
      newLevel += 1;
      newMaxXp = Math.round(newMaxXp * 1.25);
    }

    dbStore.updateUser(user.id, {
      level: newLevel,
      currentXp: newCurrentXp,
      maxXp: newMaxXp,
      coins: user.coins + earnedGold,
      gems: user.gems + earnedGems,
      totalQuestsCompleted: user.totalQuestsCompleted + 1,
      totalDamageDealt: user.totalDamageDealt + bossDmg,
    });

    // Reduce Raid Boss HP
    const boss = dbStore.getRaidBoss();
    if (boss.currentHp > 0) {
      dbStore.updateRaidBoss({
        currentHp: Math.max(0, boss.currentHp - bossDmg),
      });
    }

    // Record daily activity log
    const today = new Date().toISOString().slice(0, 10);
    dbStore.recordActivity(today, earnedXp, 1, quest.estimatedMinutes || 25);
  }

  return res.json({
    success: true,
    message: newCompleted ? 'Quest completed! Rewards granted.' : 'Quest marked as incomplete.',
    data: {
      quest: updatedQuest,
      user: dbStore.getUser(),
      raidBoss: dbStore.getRaidBoss(),
    },
  });
});

// PATCH /api/quests/:id/subtasks/:subtaskId - Toggle subtask completion
questsRouter.patch('/:id/subtasks/:subtaskId', (req: Request, res: Response) => {
  const { id, subtaskId } = req.params;
  const quests = dbStore.getQuests();
  const quest = quests.find((q) => q.id === id);

  if (!quest || !quest.subtasks) {
    return res.status(404).json({ success: false, message: 'Quest or subtasks not found' });
  }

  const subtasks = quest.subtasks.map((st) =>
    st.id === subtaskId ? { ...st, completed: !st.completed } : st
  );

  const updatedQuest = dbStore.updateQuest(id, { subtasks });
  return res.json({ success: true, message: 'Subtask toggled', data: updatedQuest });
});

// DELETE /api/quests/:id - Delete quest
questsRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = dbStore.deleteQuest(id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Quest not found' });
  }

  return res.json({ success: true, message: 'Quest deleted successfully' });
});
