import { logStarter } from '../helpers';
import type { Resolver } from './types';

export const localsResolver =
	<ProviderSession>(): Resolver<ProviderSession> =>
	async (context, resolve, logging) => {
		if (logging) logStarter('locals');

		let session: ProviderSession | null;
		try {
			session = context.session.getCookie();
		} catch {
			context.session.deleteCookie();
			session = null;
		}

		context.locals.session = session;
		return await resolve();
	};
