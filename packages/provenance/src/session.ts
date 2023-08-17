import type { Cookies } from '@sveltejs/kit';
import type { TokenEndpointResponse } from 'oauth4webapi';

import type { SessionCallback, Provider } from './types.js';

const DEFAULT_SESSION_COOKIE_AGE = 60 * 10;

export const s = <Session, SessionExtra>(
	provider: Provider<Session, SessionExtra>,
	sessionCallback: SessionCallback<Session, SessionExtra>,
	options: { sessionCookieName: string }
) => {
	return {
		/**
		 * create a session object from a set of tokens
		 * @param tokens
		 * @returns session to be stored in cookies
		 */
		create(tokens: TokenEndpointResponse): Session & SessionExtra {
			const session = provider.transformTokens(tokens);
			return {
				...session,
				...sessionCallback(session)
			};
		},

		/**
		 * set the session object in cookies, splitting into chunks if too large
		 * @param cookies cookies from request event
		 * @param sessionCookieName
		 * @param session the session object to be set in cookies
		 */
		async setCookie(
			set: (name: string, value: string, maxAge: number) => void,
			session: Session & SessionExtra
		) {
			const maxCookieSize = 3500;
			const fullCookie = JSON.stringify(session);

			const chunksCount = Math.ceil(fullCookie.length / maxCookieSize);
			const chunks = [...Array(chunksCount).keys()].map((i) =>
				fullCookie.substring(i * maxCookieSize, (i + 1) * maxCookieSize)
			);

			const maxAge = provider.sessionCookieAge?.(session) || DEFAULT_SESSION_COOKIE_AGE;

			chunks.forEach((chunk, i) => {
				set(`${options.sessionCookieName}-${i}`, chunk, maxAge);
			});
		},
		/**
		 * get the session object from cookies
		 * @param cookies cookies from request event
		 * @param sessionCookieName
		 * @returns the session object stored in cookies or null if there is no session stored
		 */
		async getCookie(
			getAll: () => { name: string; value: string }[]
		): Promise<(Session & SessionExtra) | null> {
			const sessionChunkCookies = getAll().filter((cookie) =>
				cookie.name.startsWith(`${options.sessionCookieName}-`)
			);

			if (sessionChunkCookies.length > 0) {
				const sorted = sessionChunkCookies.sort((a, b) => {
					const aIndex = parseInt(a.name.replace(`${options.sessionCookieName}-`, ''));
					const bIndex = parseInt(b.name.replace(`${options.sessionCookieName}-`, ''));

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
		deleteCookie(getAll: () => { name: string; value: string }[], _delete: (name: string) => void) {
			const sessionChunkCookies = getAll().filter((cookie) =>
				cookie.name.startsWith(options.sessionCookieName)
			);

			sessionChunkCookies.forEach((cookie) => {
				_delete(cookie.name);
			});
		}
	};
};

export type SessionModule<Session, SessionExtra> = ReturnType<typeof s<Session, SessionExtra>>;
