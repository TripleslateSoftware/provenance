import * as oauth from 'oauth4webapi';

import type { Cookie, Cookies } from '../types';

const NONCE_MAX_AGE = 60 * 5;
const NONCE_COOKIE_NAME = 'nonce';

const STATE_MAX_AGE = 60 * 5;
const STATE_COOKIE_NAME = 'state';

const PKCE_MAX_AGE = 60 * 5;
const PKCE_COOKIE_NAME = 'pkce-code-verifier';

export const c = () => {
	return {
		nonce: {
			create(): { nonce: string; cookie: Cookie } {
				const nonce = oauth.generateRandomNonce();

				const cookie: Cookie = {
					name: NONCE_COOKIE_NAME,
					value: nonce,
					options: {
						path: '/',
						maxAge: NONCE_MAX_AGE
					}
				};

				return { nonce, cookie };
			},
			use(cookies: Cookies): string {
				const nonce = cookies.get(NONCE_COOKIE_NAME);
				cookies.delete(NONCE_COOKIE_NAME, { path: '/' });

				if (nonce !== undefined) {
					return nonce;
				} else {
					throw 'nonce not found in cookies';
				}
			}
		},
		state: {
			create(data: object): { state: string; cookie: Cookie } {
				const buf = Buffer.from(JSON.stringify({ ...data, random: oauth.generateRandomState() }));
				const value = buf.toString('base64');

				const cookie = {
					name: STATE_COOKIE_NAME,
					value: value,
					options: {
						path: '/',
						maxAge: STATE_MAX_AGE
					}
				};

				return { state: value, cookie };
			},
			use(cookies: Cookies): string {
				const state = cookies.get(STATE_COOKIE_NAME);
				cookies.delete(STATE_COOKIE_NAME, { path: '/' });

				if (state !== undefined) {
					return state;
				} else {
					throw 'state not found in cookies';
				}
			}
		},
		pkce: {
			async create(): Promise<{ codeChallenge: string; cookie: Cookie }> {
				const codeVerifier = oauth.generateRandomCodeVerifier();
				const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);

				const cookie = {
					name: PKCE_COOKIE_NAME,
					value: codeVerifier,
					options: {
						path: '/',
						maxAge: PKCE_MAX_AGE
					}
				};

				return { codeChallenge, cookie };
			},
			use(cookies: Cookies): string {
				const codeVerifier = cookies.get(PKCE_COOKIE_NAME);
				cookies.delete(PKCE_COOKIE_NAME, { path: '/' });

				if (codeVerifier !== undefined) {
					return codeVerifier;
				} else {
					throw 'code_verifier not found in cookies';
				}
			}
		}
	};
};

export type ChecksModule = ReturnType<typeof c>;
