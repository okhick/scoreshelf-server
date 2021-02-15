import { PublisherModel } from '../models/Publisher';
import { IPublisher, NewPublisherRequest } from '../@types';

export class PublisherDB {
  async findPublisherByName(name: string) {
    return await PublisherModel.findOne({
      name: { $regex: new RegExp(`^${name}$`), $options: 'i' },
    });
  }

  async findPublisher(id: string): Promise<IPublisher | undefined> {
    return await PublisherModel.findById(id);
  }

  async findPublisherByUserId(userId: string): Promise<IPublisher | null> {
    return await PublisherModel.findOne({ sharetribe_user_id: userId });
  }

  async addNewPublisher(publisherData: NewPublisherRequest) {
    const newPublisher = new PublisherModel({ ...publisherData });
    const newPublisherDoc = newPublisher.save();

    return newPublisherDoc;
  }

  async updatePublisher(
    publisherUpdate: NewPublisherRequest,
    publisher: IPublisher
  ): Promise<IPublisher> {
    publisher.name = publisherUpdate.name;
    publisher.about = publisherUpdate.about;
    return await publisher.save();
  }

  async deletePublisher(id: string) {
    return await PublisherModel.findByIdAndDelete(id);
  }
}
