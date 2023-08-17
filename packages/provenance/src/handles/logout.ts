import type { Handle } from '@sveltejs/kit';

import type { OAuthModule } from '../oauth.js';
import type { SessionModule } from '../session.js';
import type { RedirectFn } from '../types.js';

export type LogoutHandleOptions = {
	logoutPathname: string;
	lastPathCookieName: string;
	sessionCookieName: string;
};

export const logoutHandle = (
	modules: { oauth: OAuthModule; session: SessionModule },

	redirect: RedirectFn,
	logging: boolean,
	options: LogoutHandleOptions
) => {
	const handle: Handle = async ({ event, resolve }) => {
		if (event.url.pathname.startsWith(options.logoutPathname)) {
			const session = event.locals.session;
			if (session !== null) {
				if (logging) console.log('provenance:', 'logout');

				if (session.idToken) {
					await modules.oauth.logout(event.fetch, session.idToken);
				}
				modules.session.deleteCookie(event.cookies, options.sessionCookieName);

				throw redirect(303, '/');
			} else {
				const lastPath = event.cookies.get(options.lastPathCookieName);
				throw redirect(303, lastPath || '/');
			}
		}

		return resolve(event);
	};

	return handle;
};
