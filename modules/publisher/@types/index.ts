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
export function isValidNewPublisherRequest(request: any) {
  return (
    typeof request.sharetribe_user_id === 'string' &&
    typeof request.name === 'string' &&
    typeof request.about === 'string'
  );
}

export interface UpdatePublisherRequest {
  _id: string;
  sharetribe_user_id: string;
  name: string;
  about: string;
  date_added: Date;
}
export function isValidUpdatePublisherRequest(request: any) {
  return (
    typeof request._id === 'string' &&
    typeof request.sharetribe_user_id === 'string' &&
    typeof request.name === 'string' &&
    typeof request.about === 'string'
  );
}
