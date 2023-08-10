import type { Cookies } from '@sveltejs/kit';

import type { Tokens } from '../types.js';

const expiresInToExpiresAt = (expiresIn: number) => Math.floor(Date.now() / 1000 + expiresIn);

export const s = (dev: boolean) => {
	return {
		/**
		 * create a session object from a set of tokens
		 * @param tokens
		 * @returns session to be stored in cookies
		 */
		create(tokens: Tokens): App.Session {
			// decode id_token? into user claims
			const user: App.User = {
				id: '',
				name: '',
				displayName: '',
				givenName: '',
				familyName: '',
				email: ''
			};
			const profile = {};

			return {
				user,
				profile,
				idToken: tokens.id_token,
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token,
				refreshExpiresIn: tokens.refresh_expires_in,
				expiresAt: expiresInToExpiresAt(tokens.expires_in)
			};
		},
		/**
		 * refresh a session object from a set of tokens
		 * @param session current session
		 * @param tokens new token set from refresh endpont
		 * @returns session to be stored in cookies
		 */
		refresh(session: App.Session, tokens: Tokens): App.Session {
			return {
				...session,
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token,
				refreshExpiresIn: tokens.refresh_expires_in,
				idToken: tokens.id_token,
				expiresAt: expiresInToExpiresAt(tokens.expires_in)
			};
		},
		/**
		 * set the session object in cookies, splitting into chunks if too large
		 * @param cookies cookies from request event
		 * @param sessionCookieName
		 * @param session the session object to be set in cookies
		 */
		async setCookie(cookies: Cookies, sessionCookieName: string, session: App.Session) {
			const maxCookieSize = 3500;
			const fullCookie = JSON.stringify(session);

			const chunksCount = Math.ceil(fullCookie.length / maxCookieSize);
			const chunks = [...Array(chunksCount).keys()].map((i) =>
				fullCookie.substring(i * maxCookieSize, (i + 1) * maxCookieSize)
			);

			chunks.forEach((chunk, i) => {
				cookies.set(`${sessionCookieName}-${i}`, chunk, {
					httpOnly: true,
					path: '/',
					secure: !dev,
					sameSite: 'lax',
					maxAge: session.refreshExpiresIn
				});
			});
		},
		/**
		 * get the session object from cookies
		 * @param cookies cookies from request event
		 * @param sessionCookieName
		 * @returns the session object stored in cookies or null if there is no session stored
		 */
		async getCookie(cookies: Cookies, sessionCookieName: string): Promise<App.Session | null> {
			const sessionChunkCookies = cookies
				.getAll()
				.filter((cookie) => cookie.name.startsWith(`${sessionCookieName}-`));

			if (sessionChunkCookies.length > 1) {
				const sorted = sessionChunkCookies.sort((a, b) => {
					const aIndex = parseInt(a.name.replace(`${sessionCookieName}-`, ''));
					const bIndex = parseInt(b.name.replace(`${sessionCookieName}-`, ''));

					return aIndex - bIndex;
				});

				const fullCookie = sorted.reduce((prev, current) => prev + current.value, '');

				return JSON.parse(fullCookie);
			} else {
				return null;
			}
		},
		/**
		 * expire the session object in cookies
		 * @param cookies cookies from request event
		 * @param sessionCookieName
		 */
		deleteCookie(cookies: Cookies, sessionCookieName: string) {
			const sessionChunkCookies = cookies
				.getAll()
				.filter((cookie) => cookie.name.startsWith(sessionCookieName));

			sessionChunkCookies.forEach((cookie) => {
				cookies.delete(cookie.name);
			});
		}
	};
};

export type SessionModule = ReturnType<typeof s>;
