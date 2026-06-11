import { request, response } from 'express';

import Link from '../models/link.js';
import User from '../models/user.js';

import { saveFile, parseBool } from '../helpers/index.js';

const LINK_FIELDS = 'name url imageURL description featured isActive order';

const syncLinksOrder = async (userId, links) => {
	const user = await User.findById(userId).select('links').lean();
	if (!user?.links?.length) return links;

	const orderMap = Object.fromEntries(user.links.map((linkId, index) => [linkId.toString(), index]));
	const needsSync = links.some((link) => link.order == null);

	if (!needsSync) {
		return [...links].sort((a, b) => a.order - b.order);
	}

	await Promise.all(
		links.map((link) => {
			const order = orderMap[link._id.toString()] ?? link.order ?? 0;
			return Link.findByIdAndUpdate(link._id, { order });
		})
	);

	return Link.find({ user: userId }).select(LINK_FIELDS).sort({ order: 1 }).lean();
};

export const getUserLinks = async (req, res) => {
	const { id } = req;

	try {
		const links = await Link.find({ user: id }).select(LINK_FIELDS).lean();
		const sortedLinks = await syncLinksOrder(id, links);

		return res.status(200).json({ ok: true, links: sortedLinks });
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

export const createUserLink = async (req = request, res = response) => {
	const { id: idUser, name: nameUser } = req;

	const { name, url, description = '' } = req.body;
	const featured = parseBool(req.body.featured);
	const isActive = req.body.isActive === undefined ? true : parseBool(req.body.isActive);

	try {
		const userInDB = await User.findById(idUser).lean();

		const { ok, message } = await saveFile(req.files, '', nameUser, req.method);

		if (!ok) return res.status(401).json({ ok, message });

		const order = await Link.countDocuments({ user: idUser });

		const link = new Link({
			name,
			url,
			description: description.trim(),
			imageURL: message,
			featured,
			isActive,
			order,
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
	const { name, url, description } = req.body;

	try {
		const link = await Link.findById(id);

		if (req.files) {
			const { ok, message } = await saveFile(req.files, link.imageURL, nameUser, req.method);

			if (!ok) return res.status(401).json({ ok, message });

			link.imageURL = message;
		}

		if (name) link.name = name;
		if (url) link.url = url;
		if (description !== undefined) link.description = description.trim();
		if (req.body.featured !== undefined) link.featured = parseBool(req.body.featured);
		if (req.body.isActive !== undefined) link.isActive = parseBool(req.body.isActive);

		await link.save();

		return res.status(200).json({ ok: true, link });
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

export const patchUserLink = async (req = request, res = response) => {
	const { id } = req.params;
	const { id: userId } = req;
	const { featured, isActive } = req.body;

	try {
		const link = await Link.findOne({ _id: id, user: userId });

		if (!link) {
			return res.status(404).json({ ok: false, message: 'Enlace no encontrado' });
		}

		if (featured !== undefined) link.featured = parseBool(featured);
		if (isActive !== undefined) link.isActive = parseBool(isActive);

		await link.save();

		return res.status(200).json({ ok: true, link });
	} catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};

export const reorderUserLinks = async (req = request, res = response) => {
	const { id: userId } = req;
	const { linkIds } = req.body;

	if (!Array.isArray(linkIds) || linkIds.length === 0) {
		return res.status(400).json({ ok: false, message: 'linkIds debe ser un array no vacío' });
	}

	try {
		const links = await Link.find({ user: userId, _id: { $in: linkIds } }).lean();

		if (links.length !== linkIds.length) {
			return res.status(400).json({ ok: false, message: 'Uno o más enlaces no son válidos' });
		}

		await Promise.all(
			linkIds.map((linkId, index) => Link.findByIdAndUpdate(linkId, { order: index }))
		);

		await User.findByIdAndUpdate(userId, { links: linkIds });

		const updatedLinks = await Link.find({ user: userId }).select(LINK_FIELDS).sort({ order: 1 }).lean();

		return res.status(200).json({ ok: true, links: updatedLinks });
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

		userInDB.links = userInDB.links.filter((linkId) => linkId.toString() !== id);

		await User.findByIdAndUpdate(userId, userInDB);

		const remainingLinks = await Link.find({ user: userId }).select('_id').sort({ order: 1 }).lean();

		await Promise.all(
			remainingLinks.map((remainingLink, index) =>
				Link.findByIdAndUpdate(remainingLink._id, { order: index })
			)
		);

		return res.status(200).json({ ok: true, message: 'Link eliminado correctamente' });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
		});
	}
};
