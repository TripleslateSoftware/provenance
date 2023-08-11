import type { Handle } from '@sveltejs/kit';

import type { RedirectFn } from '../types.js';
import type { OAuthModule } from '../oauth/index.js';
import type { SessionModule } from '../session/index.js';

type RefreshHandleOptions = { sessionCookieName: string; loginPathname: string };

export const refresh = (
	o: OAuthModule,
	s: SessionModule,
	redirect: RedirectFn,
	logging: boolean,
	options: RefreshHandleOptions
) => {
	const handle: Handle = async ({ event, resolve }) => {
		const session = event.locals.session;
		if (session !== null) {
			if (Date.now() < session.expiresAt * 1000) {
				// if the access token has not expired yet, don't refresh
				return resolve(event);
			} else {
				if (logging) console.log('provenance:', 'refresh');
				try {
					// the access token has expired, so refresh with the refresh token
					const newTokens = await o.refresh(event.fetch, session.refreshToken);
					const newSession = s.create(newTokens);

					s.setCookie(event.cookies, options.sessionCookieName, newSession);
				} catch (error) {
					console.error(error);
					// delete the session cookie
					s.deleteCookie(event.cookies, options.sessionCookieName);
					// redirect to login
					throw redirect(303, options.loginPathname);
				}
			}
		}

		return resolve(event);
	};

	return handle;
};
