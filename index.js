import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import * as dotenv from 'dotenv';
dotenv.config();

import db from './src/database/config.js';
import linkRoutes from './src/routes/link.routes.js';
import userRoutes from './src/routes/user.routes.js';

const options = {
	origin: process.env.FRONTEND_URL,
};

const app = express();

//Base de datos
db();

//Middleware
app.use(cors(options));
//? Parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//?File Upload
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: '/tmp/',
		createParentPath: true,
	})
);

//Rutas
app.use('/api/link', linkRoutes);
app.use('/api/user', userRoutes);

app.listen(process.env.PORT, () => {
	console.log(`Corriendo en el puerto ${process.env.PORT}`);
});
