import { buildEmailLayout } from './email-layout.js';

export const templateValidateEmail = (name, link) => {
	return buildEmailLayout({
		title: 'Verifica tu cuenta — TreeLink',
		preheader: 'Confirma tu email para activar tu cuenta de TreeLink.',
		heading: 'Confirma tu email',
		greeting: name,
		paragraphs: [
			'Gracias por registrarte en TreeLink. Estás a un paso de crear tu página de enlaces y compartir todo lo que creas desde un solo link.',
			'Si no creaste esta cuenta, puedes ignorar este mensaje. De lo contrario, confirma tu email con el botón de abajo:',
		],
		ctaLabel: 'Verificar mi cuenta',
		ctaUrl: link,
		footerNote: 'Este enlace expirará por seguridad. Si tienes problemas, copia y pega la URL en tu navegador.',
	});
};
