const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

export const validateFile = (req, res, next) => {
	if (!req.files?.file) {
		return res.status(400).json({
			ok: false,
			message: 'No se ha seleccionado ningún archivo',
		});
	}

	const { mimetype } = req.files.file;
	const extension = mimetype.split('/')[1];

	if (!allowedExtensions.includes(extension)) {
		return res.status(403).json({
			ok: false,
			message: `Los formatos permitidos son: ${allowedExtensions.join(', ')}`,
		});
	}

	next();
};

export const validateFileIfPresent = (req, res, next) => {
	if (!req.files?.file) return next();

	const { mimetype } = req.files.file;
	const extension = mimetype.split('/')[1];

	if (!allowedExtensions.includes(extension)) {
		return res.status(403).json({
			ok: false,
			message: `Los formatos permitidos son: ${allowedExtensions.join(', ')}`,
		});
	}

	next();
};
