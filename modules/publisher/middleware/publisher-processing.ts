import { PublisherDB } from 'publisher/controllers/publisher-db';
import { IPublisher, NewPublisherRequest, UpdatePublisherRequest } from 'publisher/@types';
import ApiError from 'error/ApiError';

export class PublisherProcessing {
  async publisherExists(
    publisherName: string,
    sharetribeUserId: string | undefined
  ): Promise<boolean> {
    const publisherDb = new PublisherDB();
    const queryPublishersByName = await publisherDb.findPublisherByName(publisherName.trim());

    // if this user's currently saved publisher is this, good
    if (queryPublishersByName?.sharetribe_user_id === sharetribeUserId) {
      return false; // false because we're still going flip then before sending the res. Stupid but works.
    } else {
      return queryPublishersByName !== null ? true : false;
    }
  }

  async updatePublisher(newPublisher: UpdatePublisherRequest): Promise<IPublisher | ApiError> {
    const publisherDb = new PublisherDB();
    const oldPublisher = await publisherDb.findPublisher(newPublisher._id);
    if (oldPublisher) {
      return await publisherDb.updatePublisher(newPublisher, oldPublisher);
    } else {
      return ApiError.publisherError('COULD NOT FIND PUBLISHER');
    }
  }

  async addNewPublisher(newPublisher: NewPublisherRequest): Promise<IPublisher | ApiError> {
    const publisherDb = new PublisherDB();
    // check if user already has publisher
    const userHasPublisher = await publisherDb.findPublisherByUserId(
      newPublisher.sharetribe_user_id
    );

    if (userHasPublisher === null) {
      return await publisherDb.addNewPublisher(newPublisher);
    } else {
      return ApiError.publisherError('USER HAS PUBLISHER');
    }
  }
}
