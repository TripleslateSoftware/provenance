import { logStarter } from '../helpers';
import type { Resolver } from './types';

export const loginResolver =
	<ProviderSession>(): Resolver<ProviderSession> =>
	async (context, resolve, logging) => {
		if (context.routes.login.is) {
			const session = context.locals.session;

			if (session === null) {
				if (logging) logStarter('login');

				await context.oauth.redirectLogin();
			} else {
				context.routes.lastPath.redirect();
			}
		}
		return await resolve();
	};
