export const RESET_CODE_TTL_MS = 15 * 60 * 1000;

export const generateResetCode = () => String(Math.floor(100000 + Math.random() * 900000));

export const getResetCodeExpiry = () => new Date(Date.now() + RESET_CODE_TTL_MS);

export const validateResetCode = (user, code) => {
	if (!user?.token) {
		return 'Código inválido o expirado';
	}

	const normalizedCode = String(code || '').trim();

	if (user.token !== normalizedCode) {
		return 'El código no es correcto';
	}

	if (!user.resetCodeExpires || new Date() > new Date(user.resetCodeExpires)) {
		return 'El código ha expirado. Solicita uno nuevo';
	}

	return null;
};
