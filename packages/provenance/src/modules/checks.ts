import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64urlNoPadding } from '@oslojs/encoding';

import type { Cookie, Cookies } from '../types';
import { b64Decode, b64Encode } from '../helpers';

const STATE_MAX_AGE = 60 * 5;
const STATE_COOKIE_NAME = 'state';

const PKCE_MAX_AGE = 60 * 5;
const PKCE_COOKIE_NAME = 'pkce-code-verifier';

const generateRandomValue = (): string => {
	const randomValues = new Uint8Array(32);
	crypto.getRandomValues(randomValues);
	return encodeBase64urlNoPadding(randomValues);
};

const generateCodeVerifier = (): string => generateRandomValue();
const generateState = (): string => generateRandomValue();

const createS256CodeChallenge = (codeVerifier: string): string => {
	const codeChallengeBytes = sha256(new TextEncoder().encode(codeVerifier));
	return encodeBase64urlNoPadding(codeChallengeBytes);
};

export const c = <State extends Record<string, any>>() => {
	return {
		state: {
			create(data: State): { state: string; cookie: Cookie } {
				const value = b64Encode(JSON.stringify({ ...data, random: generateState() }));

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
					throw 'State not found in cookies';
				}
			},
			decode(state: string): State {
				const { random, ...data } = JSON.parse(b64Decode(state));
				return data;
			}
		},
		pkce: {
			create(): { codeChallenge: string; cookie: Cookie } {
				const codeVerifier = generateCodeVerifier();
				const codeChallenge = createS256CodeChallenge(codeVerifier);

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

export type ChecksModule<State extends Record<string, any>> = ReturnType<typeof c<State>>;
