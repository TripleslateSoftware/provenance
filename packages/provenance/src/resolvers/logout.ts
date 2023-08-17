import { Context } from './index.js';

export const logoutResolver = async <
	Session extends { idToken?: string; refreshToken: string },
	SessionExtra
>(
	context: Context<Session, SessionExtra>,
	logging: boolean
) => {
	if (context.routes.logout.is) {
		const session = context.locals.session;
		if (session !== null) {
			if (logging) console.log('provenance:', 'logout');

			provider.resolvers.logout(context, logging);

			context.session.deleteCookie();

			context.routes.home.redirect();
		} else {
			context.routes.lastPath.redirect();
		}
	}
};
