import { AxiosResponse } from 'axios';
import { Router, Request, Response } from 'express';

import { SharetribeIntegration } from './middleware/sharetribeIntegration';
import { User } from 'sharetribe-flex-integration-sdk';

const router = Router();

router.get('/test', (_: Request, res: Response) => res.json('SHARETRIBE'));

// ============================================================================
// ============================================================================

router.get('/getUsers', async (req: Request, res: Response) => {
  const { SHARETRIBE } = new SharetribeIntegration();
  const users: AxiosResponse<User[]> = await SHARETRIBE.users.query();
  res.json(users);
});

export default router;
