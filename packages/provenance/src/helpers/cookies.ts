const chunkIndex = (cookieName: string, sessionCookieName: string): number | null => {
	const prefix = `${sessionCookieName}-`;
	if (!cookieName.startsWith(prefix)) {
		return null;
	}

	const suffix = cookieName.slice(prefix.length);
	if (!/^\d+$/.test(suffix)) {
		return null;
	}

	return parseInt(suffix);
};

export const isSessionChunkCookie = (cookieName: string, sessionCookieName: string): boolean =>
	chunkIndex(cookieName, sessionCookieName) !== null;

export const chunkSessionCookies = (session: any) => {
	const maxCookieSize = 3500;
	const fullCookie = JSON.stringify(session);

	const chunksCount = Math.ceil(fullCookie.length / maxCookieSize);
	const chunks = [...Array(chunksCount).keys()].map((i) =>
		fullCookie.substring(i * maxCookieSize, (i + 1) * maxCookieSize)
	);

	return chunks;
};

export const dechunkSessionCookies = (
	cookies: { name: string; value: string }[],
	options: { sessionCookieName: string }
) => {
	const sessionChunkCookies = cookies.flatMap((cookie) => {
		const index = chunkIndex(cookie.name, options.sessionCookieName);
		return index !== null ? [{ value: cookie.value, index }] : [];
	});

	if (sessionChunkCookies.length > 0) {
		const sorted = sessionChunkCookies.sort((a, b) => a.index - b.index);

		const fullCookie = sorted.reduce((prev, current) => prev + current.value, '');

		return fullCookie;
	} else {
		return null;
	}
};
