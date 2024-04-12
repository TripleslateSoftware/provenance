import type { Resolver } from './types';

export const localsResolver =
	<ProviderSession extends object>(): Resolver<ProviderSession> =>
	(context) => {
		const session = context.session.getCookie();
		context.locals.session = session;
	};
