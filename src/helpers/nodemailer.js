import nodemailer from 'nodemailer';
import nodemailerSendgrid from 'nodemailer-sendgrid';

import { templateForgotPassword, templateValidateEmail } from '../templates/index.js';

export const transporter = () => {
	const transport = nodemailer.createTransport(
		nodemailerSendgrid({
			apiKey: process.env.SENDGRID_API_KEY,
		})
	);
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
		from: process.env.DEFAULT_EMAIL,
		to: `${email}`,
		subject,
		html: html(),
	});
};
