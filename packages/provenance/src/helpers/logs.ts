export const logStarter = (...rest: string[]) =>
	console.log('\x1b[36m%s\x1b[0m', 'provenance:', ...rest);
