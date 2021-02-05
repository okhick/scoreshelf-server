import { Router, Request, Response } from 'express';

const router = Router();

router.get('/test', (_: Request, res: Response) => res.json('PUBLISHER'));

export default router;
