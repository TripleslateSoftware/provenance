import { Resolver } from './types';

export const logoutResolver =
	<ProviderSession extends object>(): Resolver<ProviderSession> =>
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
