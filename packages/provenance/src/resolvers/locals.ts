import { logStarter } from '../helpers';
import type { Resolver } from './types';

export const localsResolver =
	<Session>(): Resolver<Session> =>
	async (context, resolve, logging) => {
		if (logging) logStarter('locals');

		let session: Session | null;
		try {
			session = context.session.getCookie();
		} catch (e) {
			// possibly need to redirect to an auth error page
			console.error('provenance:', e);

			context.session.deleteCookie();
			session = null;
		}

		context.locals.session = session;
		return await resolve();
	};
