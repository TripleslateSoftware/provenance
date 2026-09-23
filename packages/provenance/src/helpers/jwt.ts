import { decodeBase64urlIgnorePadding } from './encoding';

/**
 * decode the payload of a JWT without verifying its signature
 * @param jwt compact serialized JWT (`header.payload.signature`)
 * @returns the JWT payload claims
 */
export const decodeJWTPayload = (jwt: string): Record<string, unknown> => {
	const parts = jwt.split('.');
	if (parts.length !== 3) {
		throw new Error('Invalid JWT');
	}

	let payload: unknown;
	try {
		payload = JSON.parse(new TextDecoder().decode(decodeBase64urlIgnorePadding(parts[1])));
	} catch {
		throw new Error('Invalid JWT: invalid payload encoding');
	}

	if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
		throw new Error('Invalid JWT: payload is not an object');
	}

	return payload as Record<string, unknown>;
};
