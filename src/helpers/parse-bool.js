export const parseBool = (value) => {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') {
		return value === 'true' || value === '1';
	}
	return Boolean(value);
};
