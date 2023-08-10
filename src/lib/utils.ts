import type { Cookie } from './types.js';

export function signCookie(cookie: Cookie, maxAge: number): Cookie {
	return {
		name: cookie.name,
		value: cookie.value,
		options: cookie.options
	};
}
