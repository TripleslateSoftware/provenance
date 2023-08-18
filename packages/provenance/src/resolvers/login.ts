import type { Resolver } from '../types.js';

export const loginResolver = (): Resolver<any, any> => async (context, logging) => {
	if (context.routes.logout.is) {
		const session = context.locals.session;
		if (session === null) {
			if (logging) console.log('provenance:', 'login');

			await context.oauth.redirectLogin();
		} else {
			context.routes.lastPath.redirect();
		}
	}
};
