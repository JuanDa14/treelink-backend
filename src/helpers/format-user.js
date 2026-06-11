export const formatUser = (user) => {
	return {
		id: user._id,
		imageURL: user.imageURL,
		name: user.name,
		email: user.email,
		username: user.username,
		bio: user.bio || '',
		showBranding: user.showBranding !== false,
		google: Boolean(user.google),
	};
};
