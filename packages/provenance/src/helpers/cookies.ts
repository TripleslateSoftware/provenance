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
	const sessionCookie = cookies.find((c) => c.name === options.sessionCookieName);
	if (sessionCookie) {
		return sessionCookie.value;
	}

	const sessionChunkCookies = cookies.filter((cookie) =>
		cookie.name.startsWith(`${options.sessionCookieName}-`)
	);

	if (sessionChunkCookies.length > 0) {
		const sorted = sessionChunkCookies.sort((a, b) => {
			const aIndex = parseInt(a.name.replace(`${options.sessionCookieName}-`, ''));
			const bIndex = parseInt(b.name.replace(`${options.sessionCookieName}-`, ''));

			return aIndex - bIndex;
		});

		const fullCookie = sorted.reduce((prev, current) => prev + current.value, '');

		return fullCookie;
	} else {
		return null;
	}
};
