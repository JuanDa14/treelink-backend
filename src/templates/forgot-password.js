import { buildEmailLayout } from './email-layout.js';

export const templateForgotPassword = (name, code) => {
	return buildEmailLayout({
		title: 'Restablecer contraseña — TreeLink',
		preheader: `Tu código TreeLink para restablecer la contraseña es ${code}`,
		heading: 'Restablecer contraseña',
		greeting: name,
		paragraphs: [
			'Recibimos una solicitud para cambiar la contraseña de tu cuenta TreeLink.',
			'Ingresa este código en la app para continuar. Si no solicitaste este cambio, ignora este email — tu cuenta seguirá segura.',
		],
		codeBlock: code,
		footerNote: 'El código expira en 15 minutos.',
	});
};
