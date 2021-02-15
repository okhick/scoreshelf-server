import { Request, Response, Router } from 'express';
import { Auth } from 'auth/controllers/auth';
import requestValidation from 'auth/middleware/authRequestValidation';

import ApiError from 'error/ApiError';

const router = Router();

// app.post('/auth/newClient', async (req: Request, res: Response) => {
//   const username = req.body.username;
//   const auth = new Auth();

//   const newClient = await auth.newClient(username);
//   res.json(newClient);
// });

router.get('/test', (req: Request, res: Response) => res.json('AUTH'));

router.post(
  '/generateAuthCode',
  requestValidation.generateAuthCode,
  async (req: Request, res: Response) => {
    const auth = new Auth();

    const newAuthCode = await auth.newAuthCode(req.body);

    if (newAuthCode instanceof ApiError) {
      res.status(newAuthCode.code).json({ message: newAuthCode.message });
      return;
    }

    res.json(newAuthCode);
  }
);

router.post(
  '/generateAccessToken',
  requestValidation.generateAccessToken,
  async (req: Request, res: Response) => {
    const auth = new Auth();

    const newAuthToken = await auth.newAccessToken({
      client_id: req.body.client_id,
      auth_code: <string>req.headers.authorization,
      code_verifier: req.body.code_verifier,
    });

    res.json(newAuthToken);
  }
);

export default router;
