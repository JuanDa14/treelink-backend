import { request, response } from 'express';
import { v4 as uuid } from 'uuid';

import User from '../models/user.js';

import {
	forgotPasswordLink,
	verifiedLink,
	generateJWT,
	sendEmail,
	saveFile,
	formatUser,
} from '../helpers/index.js';

export const loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const userInDB = await User.findOne({ email }).select(
			'password verified google name email imageURL username'
		);

		const isMatch = await userInDB.comparePassword(password, userInDB.password);

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

		if (user.verified)
			return res.status(400).json({ ok: false, message: 'El usuario ya esta verificado' });

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

export const getUserRefresh = async (req, res) => {
	const { id } = req;

	try {
		const user = await User.findById(id).select('name imageURL email username').lean();

		const { accessToken, refreshToken } = await generateJWT(user._id, user.name);

		return res.status(200).json({ ok: true, accessToken, refreshToken, user });
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

export const forgotUserPassword = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email }).select('verified google name email').lean();

		if (!user.verified) return res.status(401).json({ ok: false, message: 'Verifica tu cuenta' });

		if (user.google)
			return res
				.status(401)
				.json({ ok: false, message: 'Cuenta de google, no puedes cambiar tu contraseña' });

		const token = uuid();

		await User.findByIdAndUpdate(user._id, { token });

		const forgotURL = forgotPasswordLink(token);

		await sendEmail(
			'forgot-password',
			user.name,
			forgotURL,
			user.email,
			'Restablecer contraseña'
		);

		return res
			.status(200)
			.json({ ok: true, message: 'Revise su correo electronico y restablezca su contraseña' });
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
	}
};

export const resetUserPassword = async (req = request, res = response) => {
	const { token } = req.params;
	const { password } = req.body;

	try {
		const user = await User.findOne({ token }).select('token');

		if (!user) return res.status(404).json({ ok: false, message: 'El usuario no existe' });

		if (user.token !== token)
			return res.status(401).json({
				ok: false,
				message: 'No tienes permisos para esta accion',
			});

		user.password = password;
		user.token = '';

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

	const { name, username } = req.body;

	try {
		const userInDB = await User.findById(id).select('name email imageURL google username');

		if (req.files) {
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

		if (username) userInDB.username = username;

		await userInDB.save();

		const user = formatUser(userInDB);

		return res.status(200).json({
			ok: true,
			user,
		});
	} catch (error) {
		res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

export const getPublicUserLinks = async (req = request, res = response) => {
	const { username } = req.params;

	try {
		const user = await User.findOne({ username })
			.select('imageURL links username -_id')
			.populate('links', 'name url imageURL')
			.lean();

		if (!user)
			return res.status(404).json({ ok: false, message: 'El arbol del usuario no existe' });

		return res.status(200).json({
			ok: true,
			user,
		});
	} catch (error) {
		res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};
