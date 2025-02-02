import { logStarter } from '../helpers';
import type { Resolver } from './types';

export const loginResolver =
	<Session>(): Resolver<Session> =>
	async (context, resolve, logging) => {
		if (context.routes.login.is) {
			const session = context.locals.session;
			const referrer = context.oauth.referrer;

			if (session === null) {
				if (logging) logStarter('login');

				context.oauth.redirectLogin(referrer);
			} else {
				referrer ? context.routes.redirect(referrer) : context.routes.home.redirect();
			}
		}
		return await resolve();
	};
