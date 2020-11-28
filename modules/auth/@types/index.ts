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
export interface AuthCodeResponse {
  status: boolean;
  reason?: string;
  auth_code?: AuthCode;
}

export interface AccessToken extends Document {
  token: string;
  client_id: string;
  expires_at: Date;
}
export interface AccessTokenRequest {
  client_id: string;
  auth_code: string;
  code_verifier: string;
}
export interface AccessTokenResponse {
  status: boolean;
  reason?: string;
  token?: AccessToken;
}
