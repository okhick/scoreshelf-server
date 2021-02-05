const sharetribeIntegration = require('sharetribe-flex-integration-sdk');
import { SharetribeSdk } from 'sharetribe-flex-integration-sdk';
// import { SharetribeSdk } from 'sharetribe-flex-integration-sdk';

export class SharetribeIntegration {
  SHARETRIBE: SharetribeSdk;

  constructor() {
    this.SHARETRIBE = sharetribeIntegration.createInstance({
      clientId: process.env.SHARETRIBE_CLIENT_ID,
      clientSecret: process.env.SHARETRIBE_CLIENT_SECRET,
    });
  }
}
