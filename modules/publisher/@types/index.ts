import { Document } from 'mongoose';

export interface IPublisher extends Document {
  sharetribe_user_id: string;
  name: string;
  about: string;
  date_added: Date;
}

export interface NewPublisherRequest {
  sharetribe_user_id: string;
  name: string;
  about: string;
}

export interface UpdatePublisherRequest {
  _id: string;
  sharetribe_user_id: string;
  name: string;
  about: string;
  date_added: Date;
}
