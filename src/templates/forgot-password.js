import { buildEmailLayout } from './email-layout.js';

export const templateForgotPassword = (name, link) => {
	return buildEmailLayout({
		title: 'Restablecer contraseña — TreeLink',
		preheader: 'Solicitud para restablecer la contraseña de tu cuenta TreeLink.',
		heading: '¿Olvidaste tu contraseña?',
		greeting: name,
		paragraphs: [
			'Recibimos una solicitud para restablecer la contraseña de tu cuenta TreeLink.',
			'Si fuiste tú, usa el botón de abajo para crear una nueva contraseña. Si no solicitaste este cambio, ignora este email — tu cuenta seguirá segura.',
		],
		ctaLabel: 'Restablecer contraseña',
		ctaUrl: link,
		footerNote: 'Por seguridad, este enlace solo es válido por tiempo limitado.',
	});
};
