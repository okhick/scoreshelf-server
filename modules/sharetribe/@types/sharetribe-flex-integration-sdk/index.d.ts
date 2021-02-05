declare module 'sharetribe-flex-integration-sdk';

import { AxiosResponse } from 'axois';

interface SharetribeSdk {
  marketplace: any;
  users: Users;
  listings: any;
  transactions: any;
  images: any;
  availabilityExceptions: any;
  events: any;
  revoke: any;
  authInfo: any;
}

interface Users {
  show: any;
  query: UsersFunc;
  updateProfile: any;
}

interface UsersFunc {
  (createdAtStart?: string, createdAtEnd?: string): AxiosResponse<User[]>;
  // (createdAtStart?: string, createdAtEnd?: string): string;
}

interface User {
  id: { uuid: string };
  type: string;
  attributes: UserAttributes;
}

interface UserAttributes {
  banned: boolean;
  createdAt: Date;
  deleted: false;
  email: string;
  emailVeified: boolean;
  profile: UserAttributesProfile;
  // sort these out when the time comes...
  stripeChargesEnabled: boolean;
  stripeConnected: boolean;
  stripePayoutsEnabled: boolean;
}

interface UserAttributesProfile {
  abbreviatedName: string;
  bio: string | null;
  displayName: string;
  firstName: string;
  lastName: string;
  // sort these out when the time comes...
  metadata: any;
  privateData: any;
  protectedData: any;
  publicData: {
    profilePicture: string | undefined;
    publisher: {
      name: string;
      about: string;
    };
  };
}

// SharetribeSdk {
//   marketplace: { show: [Function (anonymous)] },
//   users: {
//     show: [Function (anonymous)],
//     query: [Function (anonymous)],
//     updateProfile: [Function (anonymous)]
//   },
//   listings: {
//     show: [Function (anonymous)],
//     query: [Function (anonymous)],
//     update: [Function (anonymous)],
//     approve: [Function (anonymous)],
//     open: [Function (anonymous)],
//     close: [Function (anonymous)]
//   },
//   transactions: {
//     query: [Function (anonymous)],
//     show: [Function (anonymous)],
//     transition: [Function (anonymous)],
//     transitionSpeculative: [Function (anonymous)],
//     updateMetadata: [Function (anonymous)]
//   },
//   images: { upload: [Function (anonymous)] },
//   availabilityExceptions: {
//     query: [Function (anonymous)],
//     create: [Function (anonymous)],
//     delete: [Function (anonymous)]
//   },
//   events: { query: [Function (anonymous)] },
//   revoke: [Function (anonymous)],
//   authInfo: [Function (anonymous)]
// }
