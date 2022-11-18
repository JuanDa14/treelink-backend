import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
	const token = req.header('Authorization').split(' ')[1];

	if (!token) return res.status(400).json({ ok: false, message: 'Falta algo en el header' });

	try {
		const { id, name } = jwt.verify(token, process.env.SECRET_TOKEN);

		if (!id) return res.status(401).json({ ok: false, message: 'El token ha caducido' });

		req.id = id;
		req.name = name;

		next();
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Hay un problema con su acceso' });
	}
};

export const verifyRefreshToken = (req, res, next) => {
	const token = req.header('Authorization').split(' ')[1];

	if (!token) return res.status(400).json({ ok: false, message: 'Falta algo en el header' });

	try {
		const { id } = jwt.verify(token, process.env.SECRET_REFRESH_TOKEN);

		if (!id) return res.status(401).json({ ok: false, message: 'El token ha caducado' });

		req.id = id;

		next();
	} catch (error) {
		return res.status(500).json({ ok: false, message: 'Hay un problema con su acceso' });
	}
};
