import { logStarter } from '../helpers';
import type { Resolver } from './types';

export const localsResolver =
	<ProviderSession>(): Resolver<ProviderSession> =>
	async (context, resolve, logging) => {
		if (logging) logStarter('locals');

		const session = context.session.getCookie();
		context.locals.session = session;
		return await resolve();
	};
