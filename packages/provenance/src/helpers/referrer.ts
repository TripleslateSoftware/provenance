/**
 * only allow same-origin relative paths as redirect targets, guarding against
 * open redirects like `/login?referrer=https://evil.com` (or protocol-relative
 * `//evil.com` and backslash `/\evil.com` variants)
 * @param referrer untrusted referrer (from url search params or oauth state)
 * @returns the referrer if it is a safe relative path, otherwise null
 */
export const sanitizeReferrer = (referrer: string | null | undefined): string | null => {
	if (!referrer) {
		return null;
	}

	if (!referrer.startsWith('/') || referrer.startsWith('//') || referrer.startsWith('/\\')) {
		return null;
	}

	return referrer;
};
