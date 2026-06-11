export const slugifyUsername = (value = '') => {
	return value
		.toString()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 30);
};

export const isValidUsername = (value = '') => {
	const slug = slugifyUsername(value);
	return slug.length >= 3 && /^[a-z0-9][a-z0-9_-]*[a-z0-9]$|^[a-z0-9]{3}$/.test(slug);
};
