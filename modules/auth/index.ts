import { Application, Request, Response } from 'express';
import { Auth } from './controllers/auth';

module.exports = function (app: Application) {
  app.post('/auth/new-client', async (req: Request, res: Response) => {
    const username = req.body.username;
    const auth = new Auth();

    const newClient = await auth.newClient(username);
    res.json(newClient);
  });

  app.post('/auth/generateAuthCode', async (req: Request, res: Response) => {
    const auth = new Auth();

    const newAuthCode = await auth.newAuthCode({ ...req.body });
    res.json(newAuthCode);
  });

  app.post('/auth/generateAccessToken', async (req: Request, res: Response) => {
    const auth = new Auth();

    const newAuthToken = await auth.newAccessToken({
      client_id: 'dejVup8OM~9TnHo--ZPquBwq',
      auth_code:
        'StqBm96E1O5.7XvVamth1ysuQExoS2Im3zftDBfVT2YG43ufV242tkAl3VzVAy7O-Ap8JsVY~hpWxcefU73iOrhUct-y3leQ0oeoIAKhqh768ZVFlY6Bh6uwvDLzMXvHJXoQX2CrSbWkt5KisiGbNf-b-PwYDMC_0g2dldbgO5uQ~-iEqyGwniF~yYvzuwpdUpxvebwT6_nrdBbda24Xm9f0GkvhnB94Y7Gx8NESxouD0X6n8ltHzh7EYS28id~F',
      code_verifier: 'fdsafadsfasdfasdfasdfsadfasdf',
    });
  });
};
