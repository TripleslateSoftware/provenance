import type { Resolver } from '../types';

export const loginResolver = (): Resolver<object> => async (context, logging) => {
	if (context.routes.login.is) {
		const session = context.locals.session;

		if (session === null) {
			if (logging) console.log('provenance:', 'login');

			await context.oauth.redirectLogin();
		} else {
			context.routes.lastPath.redirect();
		}
	}
};
