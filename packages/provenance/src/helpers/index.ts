import { decodeBase64, encodeBase64 } from '@oslojs/encoding';

export const logStarter = (...rest: string[]) =>
	console.log('\x1b[36m%s\x1b[0m', 'provenance:', ...rest);

export const b64Encode = (data: string) => {
	const encoder = new TextEncoder();

	return encodeBase64(encoder.encode(data));
};

export const b64Decode = (data: string) => {
	const decoder = new TextDecoder();

	return decoder.decode(decodeBase64(data), {});
};
