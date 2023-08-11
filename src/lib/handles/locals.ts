import type { Handle } from '@sveltejs/kit';
import type { SessionModule } from '../session/index.js';

type LocalsHandleOptions = { sessionCookieName: string };

export const locals = (s: SessionModule, options: LocalsHandleOptions) => {
	const handle: Handle = async ({ event, resolve }) => {
		const session = await s.getCookie(event.cookies, options.sessionCookieName);
		event.locals.session = session;

		return resolve(event);
	};

	return handle;
};
