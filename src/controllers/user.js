import { request, response } from 'express';
import { v4 as uuid } from 'uuid';

import Link from '../models/link.js';
import User from '../models/user.js';

import {
	verifiedLink,
	generateJWT,
	sendEmail,
	saveFile,
	formatUser,
	slugifyUsername,
	generateResetCode,
	getResetCodeExpiry,
	validateResetCode,
} from '../helpers/index.js';
import {
	getVerificationResendStatus,
	nextVerificationResendUpdate,
	MAX_VERIFICATION_RESENDS_PER_DAY,
} from '../helpers/verification-resend.js';

export const loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const userInDB = await User.findOne({ email }).select(
			'password verified google name email imageURL username bio showBranding'
		);

		if (!userInDB) {
			return res.status(401).json({
				ok: false,
				message: 'Email o contraseña incorrectos',
			});
		}

		const isMatch = await userInDB.comparePassword(password);

		if (!isMatch)
			return res.status(401).json({
				ok: false,
				message: 'Email o contraseña incorrectos',
			});

		if (!userInDB.verified)
			return res.status(401).json({
				ok: false,
				message: 'Verifica tu cuenta',
			});

		if (userInDB.google)
			return res.status(401).json({
				ok: false,
				message: 'Cuenta de google, inicia sesión con google',
			});

		const { accessToken, refreshToken } = await generateJWT(userInDB._id, userInDB.name);

		const user = formatUser(userInDB);

		return res.status(200).json({
			ok: true,
			user,
			accessToken,
			refreshToken,
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};
//TODO: Login con google
export const loginUserGoogle = async (req = request, res) => {
	const { name, email, imageURL } = req;

	const { username } = req.body;

	try {
		const userInDB = await User.findOne({ email })
			.select('verified google name email imageURL username')
			.lean();

		if (!userInDB) {
			const token = uuid();

			const password = process.env.PASSWORD_GOOGLE;

			await User.create({
				username,
				name,
				email,
				imageURL,
				password,
				google: true,
				token,
			});

			const verifiedURL = verifiedLink(token);

			await sendEmail('validate-email', name, verifiedURL, email, 'Verifica tu cuenta');

			return res.status(200).json({
				ok: true,
				message: '¡Confirme su correo electronico!',
			});
		}

		if (!userInDB.verified)
			return res.status(401).json({ ok: false, message: 'Verifica tu correo electronico' });

		if (!userInDB.google)
			return res.status(401).json({ ok: false, message: 'El email ya esta registrado' });

		const { accessToken, refreshToken } = await generateJWT(userInDB._id, userInDB.name);

		const user = formatUser(userInDB);

		return res.status(200).json({
			ok: true,
			user,
			accessToken,
			refreshToken,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

export const registerUser = async (req, res) => {
	const { name, email } = req.body;

	const token = uuid();

	try {
		await User.create({
			...req.body,
			token,
		});

		const verifiedURL = verifiedLink(token);

		await sendEmail('validate-email', name, verifiedURL, email, 'Verifica tu cuenta');

		return res.status(200).json({
			ok: true,
			message: '¡Confirme su correo electronico!',
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

export const verifyUserEmail = async (req, res) => {
	const { token } = req.params;

	try {
		const user = await User.findOne({ token }).select('-__v -createdAt -updatedAt').lean();

		if (!user) return res.status(400).json({ ok: false, message: 'EL usuario no existe' });

		if (user.verified) {
			return res.status(200).json({
				ok: true,
				alreadyVerified: true,
				message: 'El usuario ya esta verificado',
			});
		}

		if (user.token !== token)
			return res.status(400).json({ ok: false, message: 'No tiene permisos para esta accion' });

		await User.findByIdAndUpdate(user._id, {
			verified: true,
			token: '',
		});

		return res.status(200).json({
			ok: true,
			message: 'Usuario verificado',
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Errror interno del servidor',
		});
	}
};

export const resendVerificationEmail = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email })
			.select('name email verified token verificationResendCount verificationResendDate')
			.lean();

		if (!user) {
			return res.status(200).json({
				ok: true,
				message: 'Si el correo está registrado y pendiente de verificación, recibirás un nuevo enlace.',
			});
		}

		if (user.verified) {
			return res.status(400).json({
				ok: false,
				message: 'Esta cuenta ya está verificada. Puedes iniciar sesión.',
			});
		}

		const { allowed, remaining } = getVerificationResendStatus(user);

		if (!allowed) {
			return res.status(429).json({
				ok: false,
				message: `Alcanzaste el límite de ${MAX_VERIFICATION_RESENDS_PER_DAY} reenvíos por día. Intenta mañana.`,
				remaining: 0,
			});
		}

		const token = uuid();
		const resendUpdate = nextVerificationResendUpdate(user);

		await User.findByIdAndUpdate(user._id, {
			...resendUpdate,
			token,
		});

		const verifiedURL = verifiedLink(token);
		await sendEmail('validate-email', user.name, verifiedURL, user.email, 'Verifica tu cuenta');

		return res.status(200).json({
			ok: true,
			message: 'Correo de verificación reenviado. Revisa tu bandeja de entrada.',
			remaining: remaining - 1,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			ok: false,
			message: 'No se pudo reenviar el correo de verificación',
		});
	}
};

export const getUserRefresh = async (req, res) => {
	const { id } = req;

	try {
		const user = await User.findById(id).select('name imageURL email username bio showBranding google').lean();

		const { accessToken, refreshToken } = await generateJWT(user._id, user.name);

		return res.status(200).json({ ok: true, accessToken, refreshToken, user });
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

const issuePasswordResetCode = async (user) => {
	const code = generateResetCode();

	await User.findByIdAndUpdate(user._id, {
		token: code,
		resetCodeExpires: getResetCodeExpiry(),
	});

	await sendEmail(
		'forgot-password',
		user.name,
		code,
		user.email,
		'Código para restablecer contraseña'
	);
};

const clearPasswordResetState = (user) => {
	user.token = '';
	user.resetCodeExpires = null;
};

export const forgotUserPassword = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email }).select('verified google name email').lean();

		if (!user) {
			return res.status(404).json({ ok: false, message: 'El usuario no existe' });
		}

		if (!user.verified) return res.status(401).json({ ok: false, message: 'Verifica tu cuenta' });

		if (user.google) {
			return res
				.status(401)
				.json({ ok: false, message: 'Cuenta de google, no puedes cambiar tu contraseña' });
		}

		await issuePasswordResetCode(user);

		return res.status(200).json({
			ok: true,
			message: 'Te enviamos un código de 6 dígitos a tu correo',
		});
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
	}
};

export const sendAuthenticatedPasswordResetCode = async (req, res) => {
	try {
		const user = await User.findById(req.id).select('verified google name email').lean();

		if (!user) return res.status(404).json({ ok: false, message: 'El usuario no existe' });

		if (!user.verified) return res.status(401).json({ ok: false, message: 'Verifica tu cuenta' });

		if (user.google) {
			return res
				.status(401)
				.json({ ok: false, message: 'Cuenta de google, no puedes cambiar tu contraseña' });
		}

		await issuePasswordResetCode(user);

		return res.status(200).json({
			ok: true,
			message: 'Te enviamos un código de 6 dígitos a tu correo',
		});
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
	}
};

export const resetPasswordWithCode = async (req, res) => {
	const { email, code, password } = req.body;

	try {
		const user = await User.findOne({ email }).select('token resetCodeExpires google verified');

		if (!user) return res.status(404).json({ ok: false, message: 'El usuario no existe' });

		if (!user.verified) return res.status(401).json({ ok: false, message: 'Verifica tu cuenta' });

		if (user.google) {
			return res
				.status(401)
				.json({ ok: false, message: 'Cuenta de google, no puedes cambiar tu contraseña' });
		}

		const validationError = validateResetCode(user, code);

		if (validationError) {
			return res.status(401).json({ ok: false, message: validationError });
		}

		user.password = password;
		clearPasswordResetState(user);
		await user.save();

		return res.status(200).json({ ok: true, message: 'Contraseña actualizada correctamente' });
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
	}
};

export const resetAuthenticatedPasswordWithCode = async (req, res) => {
	const { code, password } = req.body;

	try {
		const user = await User.findById(req.id).select('token resetCodeExpires google verified');

		if (!user) return res.status(404).json({ ok: false, message: 'El usuario no existe' });

		if (!user.verified) return res.status(401).json({ ok: false, message: 'Verifica tu cuenta' });

		if (user.google) {
			return res
				.status(401)
				.json({ ok: false, message: 'Cuenta de google, no puedes cambiar tu contraseña' });
		}

		const validationError = validateResetCode(user, code);

		if (validationError) {
			return res.status(401).json({ ok: false, message: validationError });
		}

		user.password = password;
		clearPasswordResetState(user);
		await user.save();

		return res.status(200).json({ ok: true, message: 'Contraseña actualizada correctamente' });
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
	}
};

export const resetUserPassword = async (req = request, res = response) => {
	const { token } = req.params;
	const { password } = req.body;

	try {
		const user = await User.findOne({ token }).select('token resetCodeExpires');

		if (!user) return res.status(404).json({ ok: false, message: 'El usuario no existe' });

		if (user.token !== token) {
			return res.status(401).json({
				ok: false,
				message: 'No tienes permisos para esta accion',
			});
		}

		user.password = password;
		clearPasswordResetState(user);
		await user.save();

		return res.status(200).json({ ok: true, message: 'Contraseña actualizada correctamente' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

export const loginUserFacebook = async (req = request, res = response) => {
	const { name, email, imageURL, username } = req.body;

	try {
		let userInDB = await User.findOne({ email })
			.select('name email imageURL google verified username')
			.lean();

		if (!userInDB) {
			const password = process.env.PASSWORD_GOOGLE;

			userInDB = await User.create({
				username,
				email,
				name,
				imageURL,
				password,
				verified: true,
			});
		}

		if (userInDB.google)
			return res.status(401).json({
				ok: false,
				message: 'Cuenta de google, inicia sesión con google',
			});

		const { accessToken, refreshToken } = await generateJWT(userInDB._id, userInDB.name);

		const user = formatUser(userInDB);

		return res.status(200).json({
			ok: true,
			user,
			accessToken,
			refreshToken,
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

export const updateProfile = async (req = request, res = response) => {
	const { id } = req;

	const { name, username, bio } = req.body;

	try {
		const userInDB = await User.findById(id).select('name email imageURL google username bio showBranding');

		userInDB.username = slugifyUsername(userInDB.username);

		if (req.files?.file) {
			const { message, ok } = await saveFile(
				req.files,
				userInDB.imageURL,
				userInDB.name,
				req.method
			);

			if (!ok) return res.status(400).json({ ok, message });
			userInDB.imageURL = message;
		}

		if (name) userInDB.name = name;
		if (username) {
			const slug = slugifyUsername(username);

			if (slug.length < 3) {
				return res.status(400).json({
					ok: false,
					message: 'El nombre de usuario debe tener al menos 3 caracteres válidos',
				});
			}

			const usernameTaken = await User.findOne({ username: slug, _id: { $ne: id } }).lean();

			if (usernameTaken) {
				return res.status(409).json({
					ok: false,
					message: 'Ese nombre de usuario ya está ocupado',
				});
			}

			userInDB.username = slug;
		}
		if (bio !== undefined) userInDB.bio = bio.trim();
		if (req.body.showBranding !== undefined) {
			userInDB.showBranding = req.body.showBranding === 'true' || req.body.showBranding === true;
		}

		await userInDB.save();

		const user = formatUser(userInDB);

		return res.status(200).json({
			ok: true,
			user,
		});
	} catch (error) {
		const message =
			error.name === 'ValidationError'
				? Object.values(error.errors)
						.map((e) => e.message)
						.join(', ')
				: 'Error interno del servidor';

		res.status(error.name === 'ValidationError' ? 400 : 500).json({
			ok: false,
			message,
		});
	}
};

export const checkUsernameAvailability = async (req = request, res = response) => {
	const slug = slugifyUsername(decodeURIComponent(req.params.username || ''));
	const current = slugifyUsername(req.query.current || '');

	try {
		if (!slug || slug.length < 3) {
			return res.status(200).json({
				ok: true,
				available: false,
				username: slug,
				reason: 'too_short',
			});
		}

		if (current && slug === current) {
			return res.status(200).json({
				ok: true,
				available: true,
				username: slug,
			});
		}

		const existing = await User.findOne({ username: slug }).select('username').lean();

		return res.status(200).json({
			ok: true,
			available: !existing,
			username: slug,
		});
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Error al verificar el nombre de usuario',
		});
	}
};

export const getPublicUserLinks = async (req = request, res = response) => {
	const rawUsername = decodeURIComponent(req.params.username || '');
	const slug = slugifyUsername(rawUsername);

	try {
		const user = await User.findOne({
			$or: [{ username: rawUsername.trim() }, { username: slug }],
		})
			.select('imageURL links username name bio showBranding')
			.lean();

		if (!user)
			return res.status(404).json({ ok: false, message: 'El arbol del usuario no existe' });

		const links = await Link.find({
			_id: { $in: user.links },
			isActive: { $ne: false },
		})
			.select('name url imageURL icon description featured order')
			.sort({ order: 1 })
			.lean();

		return res.status(200).json({
			ok: true,
			user: {
				imageURL: user.imageURL,
				username: user.username,
				name: user.name,
				bio: user.bio || '',
				showBranding: user.showBranding !== false,
				links,
			},
		});
	} catch (error) {
		res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};
