import { request, response } from 'express';

import Link from '../models/link.js';
import User from '../models/user.js';

import { saveFile } from '../helpers/index.js';

export const getUserLinks = async (req, res) => {
	const { id } = req;

	try {
		const links = await Link.find({ user: id }).select('name url imageURL').lean();

		return res.status(200).json({ ok: true, links });
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

export const createUserLink = async (req = request, res = response) => {
	const { id: idUser, name: nameUser } = req;

	const { name, url } = req.body;

	try {
		const userInDB = await User.findById(idUser).lean();

		const { ok, message } = await saveFile(req.files, '', nameUser, req.method);

		if (!ok) return res.status(401).json({ ok, message });

		const link = new Link({
			name,
			url,
			imageURL: message,
			user: idUser,
		});

		await link.save();

		userInDB.links.push(link._id);

		await User.findByIdAndUpdate(idUser, userInDB);

		return res.status(201).json({ ok: true, link });
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

export const updateUserLink = async (req = request, res = response) => {
	const { id } = req.params;
	const { name: nameUser } = req;
	const { name, url } = req.body;

	try {
		const link = await Link.findById(id);

		if (req.files) {
			const { ok, message } = await saveFile(req.files, link.imageURL, nameUser, req.method);

			if (!ok) return res.status(401).json({ ok, message });

			link.imageURL = message;
		}

		if (name) link.name = name;

		if (url) link.url = url;

		await link.save();

		return res.status(200).json({ ok: true, link });
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

export const deleteUserLink = async (req = request, res = response) => {
	const { id } = req.params;

	const { name: nameUser, id: userId } = req;

	try {
		const userInDB = await User.findById(userId).lean();

		const link = await Link.findByIdAndDelete(id).lean();

		const { ok, message } = await saveFile(null, link.imageURL, nameUser, req.method);

		if (!ok) return res.status(401).json({ ok, message });

		userInDB.links = userInDB.links.filter((link) => link.toString() !== id);

		await User.findByIdAndUpdate(userId, userInDB);

		return res.status(200).json({ ok: true, message: 'Link eliminado correctamente' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};
