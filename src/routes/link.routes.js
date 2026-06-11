import { Router } from 'express';
import { check } from 'express-validator';

const router = Router();

import {
	getUserLinks,
	createUserLink,
	updateUserLink,
	patchUserLink,
	reorderUserLinks,
	deleteUserLink,
} from '../controllers/index.js';

import { isNotExistLinkInDB } from '../helpers/index.js';

import { verifyToken, validationsReq, validateFileIfPresent } from '../middlewares/index.js';

router.use(verifyToken);

router.get('/', getUserLinks);

router.put(
	'/reorder',
	[check('linkIds').isArray({ min: 1 }), check('linkIds.*').isMongoId(), validationsReq],
	reorderUserLinks
);

router.post(
	'/',
	[
		check('name').isString().trim().notEmpty(),
		check('url').isString().trim().notEmpty(),
		check('description').optional().isString().trim().isLength({ max: 120 }),
		check('icon').optional().isString().trim(),
		validateFileIfPresent,
		validationsReq,
	],
	createUserLink
);

router.patch(
	'/:id',
	[check('id').isMongoId(), check('id').custom(isNotExistLinkInDB), validationsReq],
	patchUserLink
);

router.put(
	'/:id',
	[
		check('id').isMongoId(),
		check('id').custom(isNotExistLinkInDB),
		check('icon').optional().isString().trim(),
		validateFileIfPresent,
		validationsReq,
	],
	updateUserLink
);

router.delete(
	'/:id',
	[check('id').isMongoId(), check('id').custom(isNotExistLinkInDB), validationsReq],
	deleteUserLink
);

export default router;
