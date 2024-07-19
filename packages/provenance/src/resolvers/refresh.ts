import { logStarter } from '../helpers';
import { Resolver } from './types';

export const refreshResolver = <
	ProviderSession extends {
		refreshToken: string;
		accessExpiresAt: number;
	}
>(options: {
	eagerRefresh: number;
}): Resolver<ProviderSession> => {
	return async (context, resolve, logging) => {
		const session = context.locals.session;

		// condition path that results in refresh attempt
		// - there is a session
		// and any of the following are true:
		// - the refresh "endpoint" is explicitly being invoked
		// - access token expires within the "eagerRefresh" threshold
		if (session !== null && Date.now() > session.accessExpiresAt * 1000 - options.eagerRefresh) {
			if (logging) logStarter('refresh');
			try {
				// the access token has expired, so refresh with the refresh token
				const newTokens = await context.oauth.refresh(session.refreshToken);
				const newSession = context.session.create(newTokens);

				context.session.setCookie(newSession);
			} catch (error) {
				console.error(error);
				// delete the session cookie
				context.session.deleteCookie();
				// redirect to login
				context.routes.login.redirect();
			}
		}
		return await resolve();
	};
};
