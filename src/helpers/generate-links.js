export const verifiedLink = (token) =>
	process.env.FRONTEND_URL + process.env.VERIFIED_EMAIL + token;

export const forgotPasswordLink = (token) =>
	process.env.FRONTEND_URL + process.env.RESET_PASSWORD + token;
