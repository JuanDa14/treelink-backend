import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 200,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		ok: false,
		message: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.',
	},
});

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		ok: false,
		message: 'Demasiados intentos de autenticación. Intenta más tarde.',
	},
});
