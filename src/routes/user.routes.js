import { Router } from 'express';
import { check } from 'express-validator';

const router = Router();

import {
	loginUser,
	registerUser,
	getUserRefresh,
	loginUserGoogle,
	loginUserFacebook,
	forgotUserPassword,
	resetUserPassword,
	verifyUserEmail,
	updateProfile,
	getPublicUserLinks,
} from '../controllers/index.js';

import { isExistEmailInDB, isNotExistEmailInDB, isExistUserNameInDB } from '../helpers/index.js';

import {
	validationsReq,
	verifyToken,
	verifyRefreshToken,
	verifyWithGoogle,
} from '../middlewares/index.js';

router.post(
	'/register',
	[
		check('username').notEmpty().isLength({ min: 3 }).trim(),
		check('name').notEmpty().trim(),
		check('email').isEmail().normalizeEmail().trim(),
		check('password').notEmpty().isLength({ min: 6 }).trim(),
		check('email').custom(isExistEmailInDB),
		check('username').custom(isExistUserNameInDB),
		validationsReq,
	],
	registerUser
);

router.get('/verified/:token', [check('token').notEmpty().trim(), validationsReq], verifyUserEmail);

router.post(
	'/login',
	[
		check('email').isEmail().normalizeEmail().trim(),
		check('password').notEmpty().isLength({ min: 6 }).trim(),
		check('email').custom(isNotExistEmailInDB),
		validationsReq,
	],
	loginUser
);

router.get('/refresh', verifyRefreshToken, getUserRefresh);

// router.get('/google', verifyWithGoogle, loginUserGoogle);
router.post(
	'/google',
	[
		check('username').notEmpty().isLength({ min: 3 }).trim(),
		check('name').notEmpty().isString().trim(),
		check('email').isEmail().normalizeEmail().trim(),
		check('imageURL').notEmpty().isString().trim(),
		check('email').custom(isExistEmailInDB),
		check('username').custom(isExistUserNameInDB),
	],
	loginUserGoogle
);

router.post(
	'/facebook',
	[
		check('username').notEmpty().isLength({ min: 3 }).trim(),
		check('name').notEmpty().isString().trim(),
		check('email').isEmail().normalizeEmail().trim(),
		check('email').custom(isExistEmailInDB),
		check('username').custom(isExistUserNameInDB),
		validationsReq,
	],

	loginUserFacebook
);

router.post(
	'/forgot-password',
	[
		check('email', 'Email no valido').isEmail().normalizeEmail().trim(),
		check('email').custom(isNotExistEmailInDB),
		validationsReq,
	],
	forgotUserPassword
);

router.post(
	'/reset-password/:token',
	[
		check('token').isString().trim().notEmpty(),
		check('password').notEmpty().trim().isLength({ min: 6 }),
		validationsReq,
	],
	resetUserPassword
);

router.post(
	'/profile',
	[check('username').custom(isExistUserNameInDB), verifyToken],
	updateProfile
);

router.get(
	'/:username',
	check('username').notEmpty().isString().trim(),
	validationsReq,
	getPublicUserLinks
);

export default router;
