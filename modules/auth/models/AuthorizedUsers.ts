import mongoose, { Schema } from 'mongoose';
import { AuthorizedUser as IAuthorizedUser } from '../@types';

const authorizedUserSchema = new Schema({
  username: String,
  client_id: String,
  date_added: { type: Date, default: Date.now },
});

export const AuthorizedUser = mongoose.model<IAuthorizedUser>(
  'Auth_AuthorizedUser',
  authorizedUserSchema
);
