import type { TokenRequestResult } from '@oslojs/oauth2';

import type { Provider } from '../providers/types';
import { chunkSessionCookies, dechunkSessionCookies } from '../helpers/cookies';

export const s = <Session>(provider: Provider<Session>, options: { sessionCookieName: string }) => {
	return {
		/**
		 * create a session object from a set of tokens
		 * @param tokens
		 * @returns session to be stored in cookies
		 */
		create(tokens: TokenRequestResult): Session {
			const session = provider.session.transformTokens(tokens);

			return provider.session.fixSession(session);
		},

		/**
		 * set the session object in cookies, splitting into chunks if too large
		 * @param cookies cookies from request event
		 * @param sessionCookieName
		 * @param session the session object to be set in cookies
		 */
		setCookie(set: (name: string, value: string, maxAge: number) => void, session: Session) {
			const validatedSession = provider.session.validateSession(session);

			const chunks = chunkSessionCookies(validatedSession);

			const maxAge = provider.session.sessionCookieAge(validatedSession);

			chunks.forEach((chunk, i) => {
				set(`${options.sessionCookieName}-${i}`, chunk, maxAge);
			});
		},
		/**
		 * get the session object from cookies
		 * @param getAll call back for retrieving cookies
		 * @returns the session object stored in cookies or null if there is no session stored
		 */
		getCookie(getAll: () => { name: string; value: string }[]): Session | null {
			const session = dechunkSessionCookies(getAll(), {
				sessionCookieName: options.sessionCookieName
			});
			if (session) {
				const validatedSession = provider.session.validateSession(JSON.parse(session));
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
				cookie.name.startsWith(`${options.sessionCookieName}-`)
			);

			sessionChunkCookies.forEach((cookie) => {
				_delete(cookie.name);
			});
		}
	};
};

export type SessionModule<Session> = ReturnType<typeof s<Session>>;
