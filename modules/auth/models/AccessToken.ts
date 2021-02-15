import mongoose, { Schema } from 'mongoose';
import { AccessToken as IAccessToken } from 'auth/@types';

const accessTokenSchema = new Schema({
  token: String,
  client_id: String,
  expires_at: Date,
});

export const AccessToken = mongoose.model<IAccessToken>('Auth_AccessToken', accessTokenSchema);
