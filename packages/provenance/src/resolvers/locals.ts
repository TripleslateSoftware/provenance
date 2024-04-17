import { logStarter } from '../helpers';
import type { Resolver } from './types';

export const localsResolver =
	<ProviderSession extends object>(): Resolver<ProviderSession> =>
	(context, logging) => {
		if (logging) logStarter('locals');

		const session = context.session.getCookie();
		context.locals.session = session;
	};
