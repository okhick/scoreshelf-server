import { Router, Request, Response } from 'express';
import { PublisherProcessing } from './middleware/publisher-processing';

import requestValidation from './middleware/publisherRequestValidation';

import { NewPublisherRequest, UpdatePublisherRequest } from './@types';

const router = Router();

router.get('/test', (_: Request, res: Response) => res.json('PUBLISHER'));

// ============================================================================
// ============================================================================

router.get(
  '/validatePublisher',
  requestValidation.validatePublisher,
  async (req: Request, res: Response) => {
    const receivedBody = req.query;
    const publisherProcessing = new PublisherProcessing();
    const requestedPublisherName = <string>receivedBody.name;

    const isValidPublisher = await publisherProcessing.publisherExists(requestedPublisherName);
    res.json(!isValidPublisher);
  }
);

router.post(
  '/addNewPublisher',
  requestValidation.addNewPublisher,
  async (req: Request, res: Response) => {
    const receivedBody: NewPublisherRequest = req.body;
    const publisherProcessing = new PublisherProcessing();

    const newPublisher = await publisherProcessing.addNewPublisher(receivedBody);

    if (newPublisher) {
      return res.json(newPublisher);
    } else {
      res.status(400).json({ message: 'USER HAS PUBLISHER' });
    }
  }
);

router.post(
  '/updatePublisher',
  requestValidation.updatePublisher,
  async (req: Request, res: Response) => {
    const receivedBody: UpdatePublisherRequest = req.body;
    const publisherProcessing = new PublisherProcessing();

    const updatedPublisher = await publisherProcessing.updatePublisher(receivedBody);

    if (updatedPublisher) {
      res.json(updatedPublisher);
    } else {
      res.status(400).json({ message: 'COULD NOT FIND PUBLISHER' });
    }
  }
);

export default router;
