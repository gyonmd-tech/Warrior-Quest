import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';

export const syncRouter = Router();

// GET /api/sync/export - Export full JSON snapshot of user data
syncRouter.get('/export', (_req: Request, res: Response) => {
  const dbData = dbStore.getDb();
  const exportPayload = {
    ...dbData,
    exportedAt: new Date().toISOString(),
    version: '2.5.0',
    app: 'Warrior Quest Log',
  };

  return res.json({ success: true, data: exportPayload });
});

// POST /api/sync/import - Import full JSON snapshot
syncRouter.post('/import', (req: Request, res: Response) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ success: false, message: 'Invalid or empty backup data' });
  }

  try {
    const payload = typeof data === 'string' ? JSON.parse(data) : data;
    dbStore.importFullData(payload);
    return res.json({ success: true, message: 'Data imported & restored successfully!' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: 'Failed to parse JSON backup', error: err.message });
  }
});

// POST /api/sync/reset - Reset everything to default initial values
syncRouter.post('/reset', (_req: Request, res: Response) => {
  dbStore.resetAllToDefault();
  return res.json({ success: true, message: 'All quest and hero data has been reset to defaults.' });
});
