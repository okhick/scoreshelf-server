import { Document } from 'mongoose';

export interface AuthorizedUser extends Document {
  username: string;
  client_id: string;
  date_added: Date;
}

export interface AuthCode extends Document {
  client_id: string;
  auth_code: string;
  code_challenge: string;
  expires_at: Date;
}

export interface AuthCodeRequest {
  client_id: string;
  code_challange: string;
}

export interface AccessToken extends Document {
  token: string;
  client_id: string;
  expires_at: Date;
}

export interface AuthTokenRequest {
  client_id: string;
  auth_code: string;
  code_verifier: string;
}
