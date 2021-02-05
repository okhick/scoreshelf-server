import { Router, Request, Response } from 'express';
import { type } from 'os';
import { PublisherProcessing } from './middleware/publisher-processing';
import { PublisherDB } from './controllers/publisher-db';

import {
  NewPublisherRequest,
  isValidNewPublisherRequest,
  UpdatePublisherRequest,
  isValidUpdatePublisherRequest,
} from './@types';

const router = Router();

router.get('/test', (_: Request, res: Response) => res.json('PUBLISHER'));

// ============================================================================
// ============================================================================

router.get('/validatePublisher', async (req: Request, res: Response) => {
  const receivedBody = req.query;
  const publisherProcessing = new PublisherProcessing();
  const requestedPublisherName = receivedBody.name;

  if (typeof requestedPublisherName === 'string') {
    const isValidPublisher = await publisherProcessing.publisherExists(requestedPublisherName);
    res.json(!isValidPublisher);
  } else {
    res.status(400).json('INVALID NAME FORMAT. PLEASE USE STRING');
  }
});

router.post('/addNewPublisher', async (req: Request, res: Response) => {
  const receivedBody: NewPublisherRequest = req.body;
  const publisherProcessing = new PublisherProcessing();

  if (isValidNewPublisherRequest(receivedBody)) {
    const newPublisher = await publisherProcessing.addNewPublisher(receivedBody);

    if (newPublisher) {
      return res.json(newPublisher);
    } else {
      res.status(400).json({ message: 'USER_HAS_PUBLISHER' });
    }
  } else {
    res.status(400).json({ message: 'MALFORMED_REQUEST' });
  }
});

router.post('/updatePublisher', async (req: Request, res: Response) => {
  const receivedBody: UpdatePublisherRequest = req.body;
  const publisherProcessing = new PublisherProcessing();

  if (isValidUpdatePublisherRequest(receivedBody)) {
    const updatedPublisher = await publisherProcessing.updatePublisher(receivedBody);

    if (updatedPublisher) {
      res.json(updatedPublisher);
    } else {
      res.status(400).json({ message: 'NOTHING_TO_UPDATE' });
    }
  } else {
    res.status(400).json({ message: 'MALFORMED_REQUEST' });
  }
});

export default router;
