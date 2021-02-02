import { Application, Request, Response, Router } from 'express';
import { Auth } from './controllers/auth';

import bearerToken from 'express-bearer-token';

const router = Router();

// app.post('/auth/newClient', async (req: Request, res: Response) => {
//   const username = req.body.username;
//   const auth = new Auth();

//   const newClient = await auth.newClient(username);
//   res.json(newClient);
// });

router.use(bearerToken());

router.get('/test', (req: Request, res: Response) => res.json('AUTH'));

router.post('/generateAuthCode', async (req: Request, res: Response) => {
  const auth = new Auth();

  const newAuthCode = await auth.newAuthCode({ ...req.body });
  res.json(newAuthCode);
});

router.post('/generateAccessToken', async (req: Request, res: Response) => {
  const auth = new Auth();

  const newAuthToken = await auth.newAccessToken({
    client_id: req.body.client_id,
    auth_code: <string>req.headers.authorization,
    code_verifier: req.body.code_verifier,
  });

  res.json(newAuthToken);
});

export default router;
