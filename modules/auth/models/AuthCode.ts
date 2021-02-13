import mongoose, { Schema } from 'mongoose';
import { AuthCode as IAuthCode } from 'auth/@types';

const AuthCodeSchema = new Schema({
  client_id: String,
  auth_code: String,
  code_challenge: String,
  expires_at: Date,
});

export const AuthCode = mongoose.model<IAuthCode>('Auth_AuthCode', AuthCodeSchema);
