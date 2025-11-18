import { logStarter } from '../helpers';
import { Resolver } from './types';

export const logoutResolver =
	<Session>(): Resolver<Session> =>
	async (context, resolve, logging) => {
		if (context.routes.logout.is) {
			const session = context.locals.session;
			const referrer = context.oauth.referrer;

			if (session !== null) {
				if (logging) logStarter('logout');

				context.session.deleteCookie();
				context.locals.session = null;
			}

			return referrer ? context.routes.redirect(referrer) : context.routes.home.redirect();
		}
		return await resolve();
	};
