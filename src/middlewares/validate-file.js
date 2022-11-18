const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

export const validateFile = (req, res, next) => {
	const { mimetype } = req.files.file;

	const extension = mimetype.split('/')[1];

	if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
		return res.status(404).json({
			ok: false,
			message: 'No se ha seleccionado ningún archivo',
		});
	}

	if (!allowedExtensions.includes(extension)) {
		return res.status(403).json({
			ok: false,
			message: `Los formatos permitidos son: ${allowedExtensions.join(',')}`,
		});
	}

	next();
};
