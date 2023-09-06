import { Resolver } from './types';

export const logoutResolver =
	<Session extends object>(): Resolver<Session> =>
	async (context, logging) => {
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
