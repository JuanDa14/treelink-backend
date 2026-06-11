export const notFoundHandler = (req, res) => {
	res.status(404).json({
		ok: false,
		message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
	});
};

export const errorHandler = (err, req, res, _next) => {
	console.error('[Error]', err);

	const statusCode = err.statusCode || 500;
	const message =
		process.env.NODE_ENV === 'production' && statusCode === 500
			? 'Error interno del servidor'
			: err.message || 'Error interno del servidor';

	res.status(statusCode).json({
		ok: false,
		message,
	});
};
