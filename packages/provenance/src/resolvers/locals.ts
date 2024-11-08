import { logStarter } from '../helpers';
import type { Resolver } from './types';

export const localsResolver =
	<Session>(): Resolver<Session> =>
	async (context, resolve, logging) => {
		if (logging) logStarter('locals');

		let session: Session | null;
		try {
			session = context.session.getCookie();
		} catch {
			context.session.deleteCookie();
			session = null;
		}

		context.locals.session = session;
		return await resolve();
	};
