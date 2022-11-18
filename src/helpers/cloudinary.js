import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const saveFile = async (req, image, collection, method) => {
	let tempFilePath;

	if (req) {
		const { tempFilePath: temp } = req.file;
		tempFilePath = temp;
	}

	try {
		if (method === 'PUT' || method === 'DELETE') {
			const nameArray = image.split('/');
			const name = nameArray[nameArray.length - 1];
			const [public_id] = name.split('.');
			await cloudinary.uploader.destroy(
				process.env.CLOUDINARY_FOLDER_NAME + '/' + collection + '/' + public_id
			);
		}

		if (method === 'DELETE') return { ok: true, message: 'Imagen eliminada correctamente' };

		const { secure_url } = await cloudinary.uploader.upload(tempFilePath, {
			folder: process.env.CLOUDINARY_FOLDER_NAME + '/' + collection,
		});

		if (secure_url) {
			return { ok: true, message: secure_url };
		} else {
			return { ok: false, message: 'No se pudo obtener la url de la imagen' };
		}
	} catch (error) {
		console.log(error);
		return { ok: false, message: 'Error interno del servidor' };
	}
};
