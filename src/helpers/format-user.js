export const formatUser = (user) => {
	const data = {
		id: user._id,
		imageURL: user.imageURL,
		name: user.name,
		email: user.email,
	};

	return data;
};
