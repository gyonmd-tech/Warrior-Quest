import express, { Request, Response, NextFunction } from 'express';
import { authRouter } from './routes/auth';
import { heroRouter } from './routes/hero';
import { questsRouter } from './routes/quests';
import { focusRouter } from './routes/focus';
import { raidBossRouter } from './routes/raidBoss';
import { inventoryRouter } from './routes/inventory';
import { rewardsRouter } from './routes/rewards';
import { trophiesRouter } from './routes/trophies';
import { dailyRewardsRouter } from './routes/dailyRewards';
import { analyticsRouter } from './routes/analytics';
import { syncRouter } from './routes/sync';

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Header Setup
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request Logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Warrior Quest Log API Server',
    version: '2.5.0',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Module API Routes
app.use('/api/auth', authRouter);
app.use('/api/hero', heroRouter);
app.use('/api/quests', questsRouter);
app.use('/api/focus', focusRouter);
app.use('/api/raid-boss', raidBossRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/trophies', trophiesRouter);
app.use('/api/daily', dailyRewardsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/sync', syncRouter);

import path from 'path';
import fs from 'fs';

// Serve Static Frontend Assets (Production dist build)
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// 404 Route Catch-all for API
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API Endpoint not found' });
});

// SPA Fallback for any client-side routes
app.get('*', (_req: Request, res: Response) => {
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  res.status(404).send('Warrior Quest Log - Please run npm run build to generate frontend dist assets.');
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`⚔️  Warrior Quest Log API Server is running on http://localhost:${PORT}`);
});

export default app;
