import { Context } from '.';

// export type RefreshResolverOptions = { sessionCookieName: string; loginPathname: string };

export const refreshResolver = async <
	Session extends { accessExpiresAt: number; refreshToken: string },
	SessionExtra
>(
	context: Context<Session, SessionExtra>,
	logging: boolean
) => {
	const session = context.locals.session;
	if (session !== null) {
		if (Date.now() < session.accessExpiresAt * 1000) {
			// if the access token has not expired yet, don't refresh
			return;
		} else {
			if (logging) console.log('provenance:', 'refresh');
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
	}
};
