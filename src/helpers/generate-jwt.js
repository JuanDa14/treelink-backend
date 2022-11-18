import jwt from 'jsonwebtoken';

export const generateToken = (id, name, time = '1d') => {
	return new Promise((resolve, reject) => {
		const payload = { id, name };
		jwt.sign(
			payload,
			process.env.SECRET_TOKEN,
			{
				expiresIn: time,
			},
			(error, token) => {
				if (!error) {
					resolve(token);
				} else {
					reject(error);
				}
			}
		);
	});
};

export const generateRefreshToken = (id, time = '2d') => {
	return new Promise((resolve, reject) => {
		const payload = { id };
		jwt.sign(
			payload,
			process.env.SECRET_REFRESH_TOKEN,
			{
				expiresIn: time,
			},
			(error, token) => {
				if (!error) {
					resolve(token);
				} else {
					reject(error);
				}
			}
		);
	});
};

export const generateJWT = async (id, name) => {
	const accessToken = await generateToken(id, name);
	const refreshToken = await generateRefreshToken(id);

	return { accessToken, refreshToken };
};
