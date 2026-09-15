import { createHash } from 'crypto';
import { Resend } from 'resend';

import { templateForgotPassword, templateValidateEmail } from '../templates/index.js';

const getResendClient = () => {
	const apiKey = process.env.RESEND_API_KEY?.trim();
	if (!apiKey) {
		throw new Error('RESEND_API_KEY no está configurada');
	}
	return new Resend(apiKey);
};

const resolveFromAddress = () =>
	process.env.RESEND_FROM?.trim() || 'TreeLink <noreply@juanmorales.dev>';

const buildHtml = (template, username, link) => {
	switch (template) {
		case 'forgot-password':
			return templateForgotPassword(username, link);
		case 'validate-email':
			return templateValidateEmail(username, link);
		default:
			throw new Error(`Template de email desconocido: ${template}`);
	}
};

const buildIdempotencyKey = (template, email, link) => {
	const digest = createHash('sha256').update(String(link)).digest('hex').slice(0, 24);
	return `${template}/${email.toLowerCase()}/${digest}`.slice(0, 256);
};

export const sendEmail = async (template, username, link, email, subject) => {
	const resend = getResendClient();
	const html = buildHtml(template, username, link);

	const { data, error } = await resend.emails.send(
		{
			from: resolveFromAddress(),
			to: [email],
			subject,
			html,
		},
		{
			idempotencyKey: buildIdempotencyKey(template, email, link),
		}
	);

	if (error) {
		throw new Error(error.message || 'Error al enviar email con Resend');
	}

	return data;
};
