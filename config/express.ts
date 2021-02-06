// ===================================
// Basic middlewear
// ===================================

import { Router } from 'express';

import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';

const router = Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(fileUpload());
router.use(cors());

export default router;
