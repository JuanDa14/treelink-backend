import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		console.log('Connecting to MongoDB...');

		const conn = await mongoose.connect(process.env.MONGO_URI);

		console.log('MongoDB connected' + conn.connection.host);
	} catch (error) {
		console.error(error);
		throw new Error('Error connecting to MongoDB: ' + error);
	}
};

export default connectDB;
