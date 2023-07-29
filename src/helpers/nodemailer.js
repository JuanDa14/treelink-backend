import nodemailer from 'nodemailer';

import { templateForgotPassword, templateValidateEmail } from '../templates/index.js';

export const transporter = () => {
	const transport = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		tls: {
			rejectUnauthorized: false,
		},
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASSWORD,
		},
	});
	return transport;
};

export const sendEmail = async (template, username, link, email, subject) => {
	const transport = transporter();

	const html = () => {
		switch (template) {
			case 'forgot-password':
				return templateForgotPassword(username, link);

			case 'validate-email':
				return templateValidateEmail(username, link);

			default:
				'No template';
		}
	};

	await transport.sendMail({
		from: process.env.MAIL_USER,
		to: email,
		subject,
		html: html(),
	});
};
