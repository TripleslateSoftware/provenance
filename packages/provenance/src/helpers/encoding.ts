import { decodeBase64, encodeBase64 } from '@oslojs/encoding';

export const b64Encode = (data: string) => {
	const encoder = new TextEncoder();

	return encodeBase64(encoder.encode(data));
};

export const b64Decode = (data: string) => {
	const decoder = new TextDecoder();

	return decoder.decode(decodeBase64(data), {});
};
