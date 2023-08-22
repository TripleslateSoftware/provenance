import { Resolver } from '../types.js';

export const logoutResolver = (): Resolver<any> => async (context, logging) => {
	if (context.routes.logout.is) {
		const session = context.locals.session;
		if (session !== null) {
			if (logging) console.log('provenance:', 'logout');

			context.session.deleteCookie();

			context.routes.home.redirect();
		} else {
			context.routes.lastPath.redirect();
		}
	}
};
