export const getStarterBio = (name = '') => {
	const displayName = name.trim() || 'aquí';
	return `¡Hola! Soy ${displayName}. Aquí encontrarás todos mis enlaces en un solo lugar.`;
};

export const getStarterLinks = () => [
	{
		name: 'Instagram',
		url: 'https://instagram.com/',
		description: 'Sígueme en Instagram',
		icon: 'instagram',
		featured: true,
		isActive: true,
		order: 0,
	},
	{
		name: 'YouTube',
		url: 'https://youtube.com/',
		description: 'Mira mi contenido en video',
		icon: 'youtube',
		featured: false,
		isActive: true,
		order: 1,
	},
	{
		name: 'Mi sitio web',
		url: 'https://',
		description: 'Conoce más sobre mí',
		icon: 'globe',
		featured: false,
		isActive: true,
		order: 2,
	},
	{
		name: 'Contacto',
		url: 'mailto:hola@ejemplo.com',
		description: 'Escríbeme para colaboraciones',
		icon: 'mail',
		featured: false,
		isActive: true,
		order: 3,
	},
];
