const bytesToBinary = (bytes: Uint8Array) => {
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return binary;
};

const binaryToBytes = (binary: string) => {
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
};

export const encodeBase64 = (bytes: Uint8Array) => btoa(bytesToBinary(bytes));

export const decodeBase64 = (data: string) => binaryToBytes(atob(data));

export const encodeBase64urlNoPadding = (bytes: Uint8Array) =>
	encodeBase64(bytes).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');

export const decodeBase64urlIgnorePadding = (data: string) => {
	const base64 = data.replaceAll('-', '+').replaceAll('_', '/').replace(/=+$/, '');
	return decodeBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
};

export const b64Encode = (data: string) => {
	const encoder = new TextEncoder();

	return encodeBase64(encoder.encode(data));
};

export const b64Decode = (data: string) => {
	const decoder = new TextDecoder();

	return decoder.decode(decodeBase64(data), {});
};
