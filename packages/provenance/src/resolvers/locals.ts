import type { Resolver } from './types';

export const localsResolver =
	<Session extends object>(): Resolver<Session> =>
	(context) => {
		const session = context.session.getCookie();
		context.locals.session = session;
	};
