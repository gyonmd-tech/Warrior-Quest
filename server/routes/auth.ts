import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { UserProfile } from '../../src/types';

export const authRouter = Router();

// GET /api/auth/me - Get current active user
authRouter.get('/me', (_req: Request, res: Response) => {
  const user = dbStore.getUser();
  return res.json({ success: true, data: user });
});

// POST /api/auth/login - Simple login or verify
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const existing = dbStore.getDb().users.find((u) => u.email === email);
  if (existing) {
    return res.json({
      success: true,
      message: 'Login successful',
      token: `jwt_token_${existing.id}_${Date.now()}`,
      data: existing,
    });
  }

  // Auto-register default profile for demonstration/development
  const newUser: UserProfile = {
    ...dbStore.getUser(),
    id: `hero_${Date.now()}`,
    email,
    name: email.split('@')[0] || 'Ksatria Quest',
  };

  dbStore.addUser(newUser);
  return res.json({
    success: true,
    message: 'User created & logged in',
    token: `jwt_token_${newUser.id}_${Date.now()}`,
    data: newUser,
  });
});

// POST /api/auth/guest-login - Instant guest player
authRouter.post('/guest-login', (_req: Request, res: Response) => {
  const user = dbStore.getUser();
  return res.json({
    success: true,
    message: 'Logged in as guest',
    token: `guest_token_${Date.now()}`,
    data: user,
  });
});
