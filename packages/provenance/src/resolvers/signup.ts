import { logStarter } from '../helpers';
import type { Resolver } from './types';

export const signupResolver =
	<Session>(): Resolver<Session> =>
	async (context, resolve, logging) => {
		if (context.routes.signup.is) {
			const session = context.locals.session;
			const referrer = context.oauth.referrer;

			if (session === null) {
				if (logging) logStarter('signup');

				context.oauth.redirectSignup(referrer);
			} else {
				referrer ? context.routes.redirect(referrer) : context.routes.home.redirect();
			}
		}
		return await resolve();
	};
