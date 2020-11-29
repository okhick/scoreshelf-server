import cryptoRandomString from 'crypto-random-string';
import { DateTime } from 'luxon';
import forge from 'node-forge';

import { AuthorizedUser } from '../models/AuthorizedUsers';
import { AuthCode } from '../models/AuthCode';
import { AccessToken } from '../models/AccessToken';
import {
  AuthorizedUser as IAuthorizedUser,
  AccessToken as IAccessToken,
  AuthCodeRequest,
  AuthCodeResponse,
  AccessTokenRequest,
  AccessTokenResponse,
} from '../@types';

/* 
This impliments the Authorizaiton with PKCE OAuth 2 flow, basically, I think.

1. Client requests an auth code. At the same time they submit a code_challenge that will be verified later
2. After recieving the auth code, they then request an access token. This requests takes the code_verifier,
  hashes it, and matches it against the code_challenge in from step one. If a match a token is issued 

This all doesn't seem THAT secure, but also neither are JS apps. The 2 step process seems to at least
not make it easy to hack...lol
*/

export class Auth {
  REASONS = {
    noClient: 'NO_CLIENT_FOUND',
    noAuthCode: 'NO_AUTH_CODE_FOUND',
    expiredAuthCode: 'AUTH_CODE_EXPIRED',
    pkceFailed: 'CHALLENGE_CODE_AND_VERIFIER_CODE_MISMATCH',
  };

  async newClient(username: string): Promise<IAuthorizedUser> {
    const client_id = cryptoRandomString({ length: 24, type: 'url-safe' });
    const newClient = await AuthorizedUser.create({
      username: username,
      client_id: client_id,
      date_added: new Date(),
    });
    return newClient;
  }

  async newAuthCode(authCodeRequest: AuthCodeRequest): Promise<AuthCodeResponse> {
    // check if authorized client
    const isValidClient = await this.verifyClientId(authCodeRequest.client_id);
    if (!isValidClient) return { status: false, reason: this.REASONS.noClient };

    const authCode = cryptoRandomString({ length: 256, type: 'url-safe' });
    const expiration = DateTime.local().plus({ minutes: 1 }).toISO();

    const newAuthCode = await AuthCode.create({
      client_id: authCodeRequest.client_id,
      auth_code: authCode,
      code_challenge: authCodeRequest.code_challenge,
      expires_at: expiration,
    });

    return { status: true, auth_code: newAuthCode };
  }

  async newAccessToken(accessTokenRequest: AccessTokenRequest): Promise<AccessTokenResponse> {
    // get the data for that auth code
    const authCode = await AuthCode.findOneAndDelete({
      auth_code: accessTokenRequest.auth_code,
      client_id: accessTokenRequest.client_id,
    });
    if (!authCode) return { status: false, reason: this.REASONS.noClient };

    // check that it hasn't expired
    const authCodeIsNotExpired = DateTime.local() < DateTime.fromJSDate(authCode.expires_at);
    if (!authCodeIsNotExpired) return { status: false, reason: this.REASONS.expiredAuthCode };

    // do the PKCE OAuth2 check
    const codeVerifierMatch = this.verifyCodeVerifier(
      accessTokenRequest.code_verifier,
      authCode.code_challenge
    );
    if (!codeVerifierMatch) return { status: false, reason: this.REASONS.pkceFailed };

    // if we're still here we can make an access token
    const newAccessToken = await this.generateNewAccessToken(accessTokenRequest.client_id);
    return { status: true, token: newAccessToken };
  }

  // ========== Helpers ==========

  async verifyClientId(client_id: string): Promise<Boolean> {
    const authorizedUser = await AuthorizedUser.findOne({ client_id: client_id });
    return authorizedUser ? true : false;
  }

  verifyCodeVerifier(code_verifier: string, code_challange: string): boolean {
    const md = forge.md.sha256.create();
    md.update(code_verifier);
    const verifierHash = md.digest().toHex();
    return code_challange === verifierHash;
  }

  async generateNewAccessToken(client_id: string): Promise<IAccessToken> {
    const accessToken = cryptoRandomString({ length: 256, type: 'url-safe' });
    const expiration = DateTime.local().plus({ hours: 4 }).toISO();

    const newAccessToken = await AccessToken.create({
      client_id: client_id,
      token: accessToken,
      expires_at: expiration,
    });

    return newAccessToken;
  }
}
