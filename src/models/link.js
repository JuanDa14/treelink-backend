import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const linkSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			unique: true,
		},

		url: {
			type: String,
			required: true,
			trim: true,
		},

		imageURL: {
			type: String,
			trim: true,
			default: '',
		},

		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Link = models.Link || model('Link', linkSchema);

export default Link;
