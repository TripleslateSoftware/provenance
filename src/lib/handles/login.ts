import type { Handle } from '@sveltejs/kit';

import type { RedirectFn } from '../types.js';
import type { OAuthModule } from '../oauth/index.js';

type LoginHandleOptions = {
	loginPathname: string;
	lastPathCookieName: string;
	redirectUriPathname: string;
};

export const login = (
	o: OAuthModule,
	redirect: RedirectFn,
	logging: boolean,
	options: LoginHandleOptions
) => {
	const handle: Handle = async ({ event, resolve }) => {
		if (event.url.pathname.startsWith(options.loginPathname)) {
			const session = event.locals.session;
			if (session === null) {
				if (logging) console.log('provenance:', 'login');

				throw redirect(
					303,
					await o.login(event, new URL(options.redirectUriPathname, event.url.origin).toString())
				);
			} else {
				const lastPath = event.cookies.get(options.lastPathCookieName);
				throw redirect(303, lastPath || '/');
			}
		}

		return resolve(event);
	};

	return handle;
};
