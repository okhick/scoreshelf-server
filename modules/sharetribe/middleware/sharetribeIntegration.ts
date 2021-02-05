const sharetribeIntegration = require('sharetribe-flex-integration-sdk');
import { AxiosResponse } from 'axios';
import { SharetribeSdk, SharetribeRes, User } from 'sharetribe-flex-integration-sdk';
// import { SharetribeSdk } from 'sharetribe-flex-integration-sdk';
// import { User } from 'sharetribe-flex-integration-sdk';

export class SharetribeIntegration {
  SHARETRIBE: SharetribeSdk;

  constructor() {
    this.SHARETRIBE = sharetribeIntegration.createInstance({
      clientId: process.env.SHARETRIBE_CLIENT_ID,
      clientSecret: process.env.SHARETRIBE_CLIENT_SECRET,
    });
  }

  async getAllUsers(): Promise<User[]> {
    const allUsersRes: AxiosResponse<SharetribeRes<User[]>> = await this.SHARETRIBE.users.query();
    return allUsersRes.data.data;
  }
}
