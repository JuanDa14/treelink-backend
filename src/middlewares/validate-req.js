import { validationResult } from 'express-validator';

export const validationsReq = (req, res, next) => {
	const errors = validationResult(req).array();

	const formatedErrors = errors.map((error) => {
		return {
			field: error.param,
			message: error.msg,
		};
	});

	if (errors.length > 0) {
		return res.status(400).json({
			ok: false,
			errors: formatedErrors,
		});
	}

	next();
};
