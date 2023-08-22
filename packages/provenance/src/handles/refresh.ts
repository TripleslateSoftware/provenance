import type { Handle } from '@sveltejs/kit';

import type { OAuthModule } from '../modules/oauth.js';
import type { SessionModule } from '../modules/session.js';
import type { RedirectFn } from '../types.js';

export type RefreshHandleOptions = { sessionCookieName: string; loginPathname: string };

export const refreshHandle = (
	modules: { oauth: OAuthModule; session: SessionModule },
	redirect: RedirectFn,
	logging: boolean,
	options: RefreshHandleOptions
) => {
	const handle: Handle = async ({ event, resolve }) => {
		const session = event.locals.session;
		if (session !== null && session.accessExpiresAt && session.refreshToken) {
			if (Date.now() < session.accessExpiresAt * 1000) {
				// if the access token has not expired yet, don't refresh
				return resolve(event);
			} else {
				if (logging) console.log('provenance:', 'refresh');
				try {
					// the access token has expired, so refresh with the refresh token
					const newTokens = await modules.oauth.refresh(event.fetch, session.refreshToken);
					const newSession = modules.session.create(newTokens);

					modules.session.setCookie(event.cookies, options.sessionCookieName, newSession);
				} catch (error) {
					console.error(error);
					// delete the session cookie
					modules.session.deleteCookie(event.cookies, options.sessionCookieName);
					// redirect to login
					throw redirect(303, options.loginPathname);
				}
			}
		}

		return resolve(event);
	};

	return handle;
};
