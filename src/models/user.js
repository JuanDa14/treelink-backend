import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema, model, models } = mongoose;

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			unique: true,
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
	},
	{
		timestamps: true,
	}
);

userSchema.pre('save', function (next) {
	const user = this;

	if (!user.isModified('password')) return next();

	// generate a salt
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
