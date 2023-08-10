import type { Handle } from '@sveltejs/kit';

import type { RedirectFn } from '../types.js';
import type { OAuthModule } from '../oauth/index.js';
import type { SessionModule } from '../session/index.js';

type LoginHandleOptions = {
	logoutPathname: string;
	lastPathCookieName: string;
	sessionCookieName: string;
};

export const logout = (
	o: OAuthModule,
	s: SessionModule,
	redirect: RedirectFn,
	logging: boolean,
	options: LoginHandleOptions
) => {
	const handle: Handle = async ({ event, resolve }) => {
		const lastPath = event.cookies.get(options.lastPathCookieName);
		if (event.url.pathname.startsWith(options.logoutPathname)) {
			const session = event.locals.session;
			if (session !== null) {
				if (logging) console.log('provenance:', 'logout');

				await o.logout(event.fetch, session.idToken);
				s.deleteCookie(event.cookies, options.sessionCookieName);

				throw redirect(303, '/');
			} else {
				throw redirect(303, lastPath || '/');
			}
		}

		return resolve(event);
	};

	return handle;
};
