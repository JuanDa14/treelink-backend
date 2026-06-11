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
	sendAuthenticatedPasswordResetCode,
	resetPasswordWithCode,
	resetAuthenticatedPasswordWithCode,
	resetUserPassword,
	verifyUserEmail,
	updateProfile,
	getPublicUserLinks,
	checkUsernameAvailability,
	resendVerificationEmail,
} from '../controllers/index.js';

import { isExistEmailInDB, isNotExistEmailInDB, isExistUserNameInDB } from '../helpers/index.js';

import {
	validationsReq,
	verifyToken,
	verifyRefreshToken,
	verifyWithGoogle,
} from '../middlewares/index.js';
import { authLimiter } from '../middlewares/security.js';

router.post(
	'/register',
	authLimiter,
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
	'/resend-verification',
	authLimiter,
	[
		check('email').isEmail().normalizeEmail().trim(),
		validationsReq,
	],
	resendVerificationEmail
);

router.post(
	'/login',
	authLimiter,
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
	[check('email').isEmail().normalizeEmail().trim(), validationsReq, verifyWithGoogle],
	loginUserGoogle
);

router.post(
	'/facebook',
	[
		check('username').notEmpty().isLength({ min: 3 }).trim(),
		check('name').notEmpty().isString().trim(),
		check('email').isEmail().normalizeEmail().trim(),
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
	'/reset-password-code',
	authLimiter,
	[
		check('email', 'Email no valido').isEmail().normalizeEmail().trim(),
		check('email').custom(isNotExistEmailInDB),
		check('code').isString().trim().isLength({ min: 6, max: 6 }),
		check('password').notEmpty().trim().isLength({ min: 6 }),
		validationsReq,
	],
	resetPasswordWithCode
);

router.post('/password-reset/send', authLimiter, verifyToken, sendAuthenticatedPasswordResetCode);

router.post(
	'/password-reset/confirm',
	authLimiter,
	verifyToken,
	[
		check('code').isString().trim().isLength({ min: 6, max: 6 }),
		check('password').notEmpty().trim().isLength({ min: 6 }),
		validationsReq,
	],
	resetAuthenticatedPasswordWithCode
);

router.post('/profile', verifyToken, updateProfile);

router.get(
	'/check-username/:username',
	check('username').notEmpty().isString().trim(),
	validationsReq,
	checkUsernameAvailability
);

router.get(
	'/:username',
	check('username').notEmpty().isString().trim(),
	validationsReq,
	getPublicUserLinks
);

export default router;
