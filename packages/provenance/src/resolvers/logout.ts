import { logStarter } from '../helpers';
import { Resolver } from './types';

export const logoutResolver =
	<ProviderSession>(): Resolver<ProviderSession> =>
	async (context, resolve, logging) => {
		if (context.routes.logout.is) {
			const session = context.locals.session;
			if (session !== null) {
				if (logging) logStarter('logout');

				context.session.deleteCookie();
				context.locals.session = null;

				context.routes.home.redirect();
			} else {
				context.routes.lastPath.redirect();
			}
		}
		return await resolve();
	};
