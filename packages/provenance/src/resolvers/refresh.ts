import { logStarter } from '../helpers';
import { Resolver } from './types';

export const refreshResolver = <
	Session extends {
		refreshToken: string;
		accessExpiresAt: number;
		refreshExpiresAt?: number;
	}
>(options: {
	eagerRefresh: number;
}): Resolver<Session> => {
	return async (context, resolve, logging) => {
		const session = context.locals.session;

		// attempt refresh if there is a session and the access token expires within the "eagerRefresh" threshold
		if (session !== null && Date.now() >= session.accessExpiresAt * 1000 - options.eagerRefresh) {
			if (logging) logStarter('refresh');

			const destroySession = () => {
				context.session.deleteCookie();
				context.locals.session = null;
			};

			// don't bother trying to refresh if your session has an expired refresh token
			// in practice, this should be true as the session cookie should expire at the same time as the refresh token
			if (session.refreshExpiresAt === undefined || Date.now() < session.refreshExpiresAt * 1000) {
				try {
					// the access token has expired, so refresh with the refresh token
					const newTokens = await context.oauth.refresh(session.refreshToken);
					const newSession = context.session.create(newTokens);

					context.session.setCookie(newSession);
					context.locals.session = newSession;
				} catch (error) {
					// destroy the session if an error occurs (likely in the oauth refresh flow)
					if (logging) console.error(error);
					destroySession();
				}
			} else {
				destroySession();
			}
		}
		return await resolve();
	};
};
