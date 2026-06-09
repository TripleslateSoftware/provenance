import { Context } from '../types';

export const refresh = <RequestEvent, ProviderSession, AppSession extends { refreshToken: string }>(
	createContext: (event: RequestEvent) => Context<ProviderSession, AppSession>
) => {
	return async (event: RequestEvent) => {
		const context = createContext(event);
		const session = context.locals.session;

		if (session?.refreshToken) {
			try {
				// the access token has expired, so refresh with the refresh token
				const newTokens = await context.oauth.refresh(session.refreshToken);
				const newSession = context.session.create(newTokens);

				context.session.deleteCookie();
				context.session.setCookie(newSession);
				// the runtime stores the provider session in locals (AppSession is its typed view)
				context.locals.session = newSession as unknown as AppSession;
			} catch (e) {
				console.error('provenance:', e);
				// delete the session cookie
				context.session.deleteCookie();
				context.locals.session = null;
				// redirect to login
				context.routes.login.redirect();
			}
		}
	};
};
