export const verifiedLink = (token) => {
	const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
	const path = process.env.VERIFIED_EMAIL || '/auth/verified?token=';
	return `${base}${path}${token}`;
};

export const forgotPasswordLink = (token) =>
	process.env.FRONTEND_URL + process.env.RESET_PASSWORD + token;
