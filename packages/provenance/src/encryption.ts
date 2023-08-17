export type EncryptionOptions = {
	authSecret: string;
};

export const e = (options: EncryptionOptions) => {
	const ivLength = 12;
	const encoder = new TextEncoder();
	const decoder = new TextDecoder('utf-8');

	const encrypt = async <T>(data: T): Promise<string> => {
		const iv = crypto.getRandomValues(new Uint8Array(ivLength)); // get 96-bit random iv

		const alg = { name: 'AES-GCM', iv: iv }; // specify algorithm to use

		const encryptionSecretUtf8 = encoder.encode(options.authSecret); // encode password as UTF-8
		const encryptionSecretHash = await crypto.subtle.digest('SHA-256', encryptionSecretUtf8); // hash the password

		const key = await crypto.subtle.importKey('raw', encryptionSecretHash, alg, false, ['encrypt']); // generate key from pw

		const ptUint8 = encoder.encode(JSON.stringify(data)); // encode plaintext as UTF-8
		const ct = await crypto.subtle.encrypt(alg, key, ptUint8); // encrypt plaintext using key

		return Buffer.from(iv).toString('base64') + Buffer.from(ct).toString('base64');
	};

	const decrypt = async <T>(encryptedData: string): Promise<T> => {
		const encodedbuffer = Buffer.from(encryptedData, 'base64');
		const iv = encodedbuffer.subarray(0, ivLength);

		const alg = { name: 'AES-GCM', iv: iv }; // specify algorithm to use

		const encryptionSecretUtf8 = encoder.encode(options.authSecret); // encode password as UTF-8
		const encryptionSecretHash = await crypto.subtle.digest('SHA-256', encryptionSecretUtf8); // hash the password

		const key = await crypto.subtle.importKey('raw', encryptionSecretHash, alg, false, ['decrypt']); // generate key from pw

		const ct = encodedbuffer.subarray(ivLength); // decode base64 ciphertext

		try {
			const plainBuffer = await crypto.subtle.decrypt(alg, key, ct); // decrypt ciphertext using key
			const plaintext = decoder.decode(plainBuffer); // plaintext from ArrayBuffer
			return JSON.parse(plaintext); // return the plaintext
		} catch (e) {
			console.error(e);
			throw 'decrypt failed';
		}
	};

	return {
		encrypt,
		decrypt
	};
};

export type Encryption = Awaited<ReturnType<typeof e>>;
