import type { TokenRequestResult } from '@oslojs/oauth2';

import type { Provider } from '../providers/types';

export const s = <ProviderSession, AppSession extends ProviderSession>(
	provider: Provider<ProviderSession>,
	options: { sessionCookieName: string }
) => {
	return {
		/**
		 * create a session object from a set of tokens
		 * @param tokens
		 * @returns session to be stored in cookies
		 */
		create(tokens: TokenRequestResult): ProviderSession {
			const session = provider.session.transformTokens(tokens);

			return provider.session.fixSession(session);
		},

		/**
		 * set the session object in cookies, splitting into chunks if too large
		 * @param cookies cookies from request event
		 * @param sessionCookieName
		 * @param session the session object to be set in cookies
		 */
		setCookie(set: (name: string, value: string, maxAge: number) => void, session: AppSession) {
			const validatedSession = provider.session.validateSession(session);

			const maxCookieSize = 3500;
			const fullCookie = JSON.stringify(validatedSession);

			const chunksCount = Math.ceil(fullCookie.length / maxCookieSize);
			const chunks = [...Array(chunksCount).keys()].map((i) =>
				fullCookie.substring(i * maxCookieSize, (i + 1) * maxCookieSize)
			);

			const maxAge = provider.session.sessionCookieAge(validatedSession);

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
		getCookie(getAll: () => { name: string; value: string }[]): AppSession | null {
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

				const session = JSON.parse(fullCookie);

				const validatedSession = provider.session.validateSession(session);

				return validatedSession;
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

export type SessionModule<ProviderSession, AppSession extends ProviderSession> = ReturnType<
	typeof s<ProviderSession, AppSession>
>;
