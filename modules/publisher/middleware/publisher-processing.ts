import { PublisherDB } from '../controllers/publisher-db';
import { IPublisher, NewPublisherRequest, UpdatePublisherRequest } from '../@types';

export class PublisherProcessing {
  async publisherExists(publisherName: string): Promise<boolean> {
    const publisherDb = new PublisherDB();
    const queryPublishersByName = await publisherDb.findPublisherByName(publisherName.trim());
    return queryPublishersByName !== null ? true : false;
  }

  async updatePublisher(newPublisher: UpdatePublisherRequest): Promise<IPublisher | null> {
    const publisherDb = new PublisherDB();
    const oldPublisher = await publisherDb.findPublisher(newPublisher._id);
    if (oldPublisher) {
      return await publisherDb.updatePublisher(newPublisher, oldPublisher);
    } else {
      return null;
    }
  }

  async addNewPublisher(newPublisher: NewPublisherRequest): Promise<IPublisher | null> {
    const publisherDb = new PublisherDB();
    // check if user already has publisher
    const userHasPublisher = await publisherDb.findPublisherByUserId(
      newPublisher.sharetribe_user_id
    );

    if (userHasPublisher === null) {
      return await publisherDb.addNewPublisher(newPublisher);
    } else {
      return null;
    }
  }
}
