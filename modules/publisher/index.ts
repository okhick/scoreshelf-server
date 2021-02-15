import { Router, Request, Response } from 'express';
import { PublisherProcessing } from 'publisher/middleware/publisher-processing';
import { PublisherDB } from 'publisher/controllers/publisher-db';

import { verifyToken } from 'auth/middleware/verifyToken';
import requestValidation from 'publisher/middleware/publisherRequestValidation';

import { NewPublisherRequest, UpdatePublisherRequest } from 'publisher/@types';
import ApiError from 'error/ApiError';

const router = Router();

router.get('/test', (_: Request, res: Response) => res.json('PUBLISHER'));

// ============================================================================
// ============================================================================

router.get(
  '/validatePublisher',
  [verifyToken, requestValidation.validatePublisher],
  async (req: Request, res: Response) => {
    const receivedBody = req.query;
    const publisherProcessing = new PublisherProcessing();
    const requestedPublisherName = <string>receivedBody.name;
    const sharetribeUserId = <string | undefined>receivedBody.sharetribe_user_id;

    const isValidPublisher = await publisherProcessing.publisherExists(
      requestedPublisherName,
      sharetribeUserId
    );
    res.json(!isValidPublisher);
  }
);

router.get(
  '/getPublisherData',
  [verifyToken, requestValidation.getPublisherData],
  async (req: Request, res: Response) => {
    const publisherDb = new PublisherDB();
    const id = <string>req.query.id;
    const publisher = await publisherDb.findPublisher(id);
    res.json(publisher);
  }
);

router.post(
  '/addNewPublisher',
  [verifyToken, requestValidation.addNewPublisher],
  async (req: Request, res: Response) => {
    const receivedBody: NewPublisherRequest = req.body;
    const publisherProcessing = new PublisherProcessing();

    const newPublisher = await publisherProcessing.addNewPublisher(receivedBody);

    if (newPublisher instanceof ApiError) {
      res.status(newPublisher.code).json({ message: newPublisher.message });
      return;
    }

    res.json(newPublisher);
  }
);

router.post(
  '/updatePublisher',
  [verifyToken, requestValidation.updatePublisher],
  async (req: Request, res: Response) => {
    const receivedBody: UpdatePublisherRequest = req.body;
    const publisherProcessing = new PublisherProcessing();

    const updatedPublisher = await publisherProcessing.updatePublisher(receivedBody);

    if (updatedPublisher instanceof ApiError) {
      res.status(updatedPublisher.code).json({ message: updatedPublisher.message });
      return;
    }

    res.json(updatedPublisher);
  }
);

export default router;
