import { Application, Request, Response } from 'express';
import { Auth } from './controllers/auth';

module.exports = function (app: Application) {
  // app.post('/auth/newClient', async (req: Request, res: Response) => {
  //   const username = req.body.username;
  //   const auth = new Auth();

  //   const newClient = await auth.newClient(username);
  //   res.json(newClient);
  // });

  app.post('/auth/generateAuthCode', async (req: Request, res: Response) => {
    const auth = new Auth();

    const newAuthCode = await auth.newAuthCode({ ...req.body });
    res.json(newAuthCode);
  });

  app.post('/auth/generateAccessToken', async (req: Request, res: Response) => {
    const auth = new Auth();

    const newAuthToken = await auth.newAccessToken({
      client_id: req.body.client_id,
      auth_code: <string>req.headers.authorization,
      code_verifier: req.body.code_verifier,
    });

    res.json(newAuthToken);
  });
};
