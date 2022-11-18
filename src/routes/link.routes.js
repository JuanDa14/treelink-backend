import { Router } from 'express';
import { check } from 'express-validator';

const router = Router();

import {
	getUserLinks,
	createUserLink,
	updateUserLink,
	deleteUserLink,
} from '../controllers/index.js';

import { isNotExistLinkInDB } from '../helpers/index.js';

import { verifyToken, validationsReq, validateFile } from '../middlewares/index.js';

router.get('/', verifyToken, getUserLinks);

router.post(
	'/',
	[
		verifyToken,
		check('name').isString().trim().notEmpty(),
		check('url').isString().trim().notEmpty(),
		validateFile,
		validationsReq,
	],
	createUserLink
);

router.put(
	'/:id',

	[verifyToken, check('id').isMongoId(), check('id').custom(isNotExistLinkInDB), validationsReq],
	updateUserLink
);

router.delete(
	'/:id',
	[verifyToken, check('id').isMongoId(), check('id').custom(isNotExistLinkInDB), validationsReq],
	deleteUserLink
);

export default router;
