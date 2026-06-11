import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { slugifyUsername } from '../helpers/slugify-username.js';

const { Schema, model, models } = mongoose;

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 30,
			set: slugifyUsername,
			validate: {
				validator(value) {
					return /^[a-z0-9][a-z0-9_-]*[a-z0-9]$|^[a-z0-9]{3}$/.test(value);
				},
				message: 'El username solo puede tener letras minúsculas, números, guiones y guiones bajos',
			},
		},

		name: {
			type: String,
			trim: true,
			minlength: 3,
			required: true,
		},

		email: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},

		password: {
			type: String,
			trim: true,
			required: true,
			minlength: 6,
		},

		imageURL: {
			trim: true,
			type: String,
			default: 'https://res.cloudinary.com/dbvyaguam/image/upload/v1668489002/user_vvsdds.png',
		},

		bio: {
			type: String,
			trim: true,
			maxlength: 160,
			default: '',
		},

		showBranding: {
			type: Boolean,
			default: true,
		},

		state: {
			type: String,
			enum: {
				values: ['active', 'inactive'],
				message: '{VALUE} is not a valid state',
			},
			default: 'active',
		},

		links: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Link',
			},
		],

		google: {
			type: Boolean,
			default: false,
		},

		verified: {
			type: Boolean,
			default: false,
		},

		token: {
			type: String,
			default: '',
		},

		verificationResendCount: {
			type: Number,
			default: 0,
		},

		verificationResendDate: {
			type: String,
			default: '',
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre('save', function (next) {
	const user = this;

	if (!user.isModified('password')) return next();

	bcrypt.genSalt(function (err, salt) {
		if (err) return next(err);

		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) return next(err);

			user.password = hash;
			next();
		});
	});
});

userSchema.methods.comparePassword = function (password) {
	return bcrypt.compare(password, this.password);
};

const User = models.User || model('User', userSchema);

export default User;
