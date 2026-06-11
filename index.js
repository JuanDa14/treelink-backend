import * as dotenv from 'dotenv';

dotenv.config();

import app from './src/app.js';
import connectDB from './src/database/config.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
	try {
		await connectDB();

		app.listen(PORT, () => {
			console.log(`Servidor corriendo en el puerto ${PORT}`);
		});
	} catch (error) {
		console.error('No se pudo iniciar el servidor:', error);
		process.exit(1);
	}
};

startServer();
