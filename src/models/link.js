import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const linkSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
		},

		url: {
			type: String,
			required: true,
			trim: true,
		},

		description: {
			type: String,
			trim: true,
			maxlength: 120,
			default: '',
		},

		imageURL: {
			type: String,
			trim: true,
			default: '',
		},

		featured: {
			type: Boolean,
			default: false,
		},

		isActive: {
			type: Boolean,
			default: true,
		},

		order: {
			type: Number,
			default: 0,
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
