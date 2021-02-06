import mongoose, { Schema } from 'mongoose';
import { IPublisher } from '../@types';

const PublisherSchema = new Schema({
  sharetribe_user_id: String,
  name: String,
  about: String,
  date_added: { type: Date, default: Date.now },
});

export const PublisherModel = mongoose.model<IPublisher>('Publisher_Publisher', PublisherSchema);
