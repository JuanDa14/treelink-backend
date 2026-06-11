export const MAX_VERIFICATION_RESENDS_PER_DAY = 5;

export const getUtcDateKey = () => new Date().toISOString().slice(0, 10);

export const getVerificationResendStatus = (user = {}) => {
	const today = getUtcDateKey();
	const count = user.verificationResendDate === today ? user.verificationResendCount || 0 : 0;
	const remaining = Math.max(0, MAX_VERIFICATION_RESENDS_PER_DAY - count);

	return {
		allowed: count < MAX_VERIFICATION_RESENDS_PER_DAY,
		count,
		remaining,
		today,
	};
};

export const nextVerificationResendUpdate = (user = {}) => {
	const today = getUtcDateKey();
	const count = user.verificationResendDate === today ? user.verificationResendCount || 0 : 0;

	return {
		verificationResendCount: count + 1,
		verificationResendDate: today,
	};
};
