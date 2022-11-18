import Link from '../models/link.js';
import User from '../models/user.js';

export const isNotExistLinkInDB = async (id) => {
	const link = await Link.findById(id);

	if (!link) {
		throw new Error('El link no existe');
	}
};

export const isExistEmailInDB = async (email) => {
	const user = await User.findOne({ email }).select('email').lean();

	if (user) {
		throw new Error('El email ya esta registrado');
	}
};

export const isNotExistEmailInDB = async (email) => {
	const user = await User.findOne({ email }).select('email').lean();

	if (!user) {
		throw new Error('El usuario no existe');
	}
};

export const isExistUserNameInDB = async (username) => {
	const user = await User.findOne({ username }).select('username').lean();

	if (user) {
		throw new Error('El nombre de usuario ya esta ocupado');
	}
};
