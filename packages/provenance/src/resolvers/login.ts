import { logStarter } from '../helpers';
import type { Resolver } from './types';

export const loginResolver =
	<ProviderSession extends object>(): Resolver<ProviderSession> =>
	async (context, logging) => {
		if (context.routes.login.is) {
			const session = context.locals.session;

			if (session === null) {
				if (logging) logStarter('login');

				await context.oauth.redirectLogin();
			} else {
				context.routes.lastPath.redirect();
			}
		}
	};
