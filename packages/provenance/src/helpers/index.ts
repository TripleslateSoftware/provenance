export const logStarter = (...rest: string[]) =>
	console.log('\x1b[36m%s\x1b[0m', 'provenance:', ...rest);

export const b64Encode = (data: string) => {
	if (globalThis.Buffer) {
		return Buffer.from(data, 'utf-8').toString('base64');
	}

	return btoa(data);
};

export const b64Decode = (data: string) => {
	if (globalThis.Buffer) {
		return Buffer.from(data, 'base64').toString('utf8');
	}

	return atob(data);
};
