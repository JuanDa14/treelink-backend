import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_ID_CLIENT);

const verify = async (token) => {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.GOOGLE_ID_CLIENT,
	});

	const { name, picture, email } = ticket.getPayload();

	return { name, picture, email };
};

export const verifyWithGoogle = async (req, res, next) => {
	const authHeader = req.header('Authorization');
	const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

	if (!token) return res.status(401).json({ ok: false, message: 'Token no proporcionado' });

	try {
		const { name, picture, email } = await verify(token);

		if (!name) return res.status(401).json({ ok: false, message: 'Error al obtener sus datos' });

		req.name = name;
		req.email = email;
		req.imageURL = picture;

		next();
	} catch (error) {
		return res.status(400).json({ ok: false, message: 'Error interno del servidor' });
	}
};
