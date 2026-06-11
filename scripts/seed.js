import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

import User from '../src/models/user.js';
import Link from '../src/models/link.js';

const MONGO_URI = process.env.MONGO_URI;

const seedLinks = [
	{
		name: 'Instagram',
		url: 'https://instagram.com/juanmorales',
		description: 'Sígueme para contenido diario',
		icon: 'instagram',
		featured: true,
		order: 0,
	},
	{
		name: 'YouTube',
		url: 'https://youtube.com/@juanmorales',
		description: 'Tutoriales y vlogs',
		icon: 'youtube',
		featured: false,
		order: 1,
	},
	{
		name: 'Portfolio',
		url: 'https://juanmorales.dev',
		description: 'Mis proyectos de desarrollo',
		icon: 'globe',
		featured: false,
		order: 2,
	},
	{
		name: 'Contacto',
		url: 'mailto:hola@juanmorales.com',
		description: 'Escríbeme para colaboraciones',
		icon: 'mail',
		featured: false,
		order: 3,
	},
	{
		name: 'Spotify',
		url: 'https://open.spotify.com/user/juanmorales',
		description: 'Mi playlist favorita',
		icon: 'music',
		featured: false,
		order: 4,
	},
];

const seed = async () => {
	if (!MONGO_URI) {
		console.error('MONGO_URI no está definida en .env');
		process.exit(1);
	}

	await mongoose.connect(MONGO_URI);
	console.log('Conectado a MongoDB');

	const demoEmail = 'demo@treelink.com';

	await Link.deleteMany({});
	await User.deleteMany({ email: demoEmail });

	const user = await User.create({
		username: 'juan-morales',
		name: 'Juan Morales',
		email: demoEmail,
		password: 'demo1234',
		bio: 'Creador de contenido y desarrollador. Un link para todo lo que hago.',
		showBranding: true,
		verified: true,
		google: false,
	});

	const linkIds = [];

	for (const linkData of seedLinks) {
		const link = await Link.create({
			...linkData,
			imageURL: '',
			isActive: true,
			user: user._id,
		});
		linkIds.push(link._id);
	}

	user.links = linkIds;
	await user.save();

	console.log('\n✅ Seed completado\n');
	console.log('Usuario demo:');
	console.log('  Email:    demo@treelink.com');
	console.log('  Password: demo1234');
	console.log('  Username: juan-morales');
	console.log('  URL:      /user/juan-morales');
	console.log(`  Links:    ${linkIds.length} enlaces con iconos\n`);

	await mongoose.disconnect();
};

seed().catch((error) => {
	console.error('Error en seed:', error);
	process.exit(1);
});
