// ===================================
// Basic middlewear
// ===================================

import { Router } from 'express';

import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import bearerToken from 'express-bearer-token';

const router = Router();

router.use(cors());
router.use(bearerToken());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(fileUpload());

export default router;
