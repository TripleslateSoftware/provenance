export const logStarter = (...rest: string[]) =>
	console.log('\x1b[36m%s\x1b[0m', 'provenance:', ...rest);

export const b64Encode = (data: string) => {
	if (globalThis.Buffer) {
		return Buffer.from(data).toString('base64');
	}

	return btoa(data);
};
