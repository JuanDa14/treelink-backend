import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fileUpload from 'express-fileupload';

import linkRoutes from './routes/link.routes.js';
import userRoutes from './routes/user.routes.js';
import { apiLimiter } from './middlewares/security.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';

const app = express();

const corsOptions = {
	origin: process.env.FRONTEND_URL,
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(apiLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: '/tmp/',
		createParentPath: true,
		limits: { fileSize: 5 * 1024 * 1024 },
		abortOnLimit: true,
	})
);

app.get('/api/health', (_req, res) => {
	res.status(200).json({
		ok: true,
		message: 'TreeLink API operativa',
		timestamp: new Date().toISOString(),
	});
});

app.use('/api/link', linkRoutes);
app.use('/api/user', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
