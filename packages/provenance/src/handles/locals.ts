import type { Handle } from '@sveltejs/kit';

import type { SessionModule } from '../session.js';

export type LocalsHandleOptions = { sessionCookieName: string };

export const localsHandle = (modules: { session: SessionModule }, options: LocalsHandleOptions) => {
	const handle: Handle = async ({ event, resolve }) => {
		const session = await modules.session.getCookie(event.cookies, options.sessionCookieName);

		event.locals.session = session;

		return resolve(event);
	};

	return handle;
};
