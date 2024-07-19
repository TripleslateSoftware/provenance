import { Context } from '../types';

export const protectRoute = <RequestEvent, ProviderSession, AppSession>(
	createContext: (event: RequestEvent) => Context<ProviderSession, AppSession>
) => {
	return async (event: RequestEvent) => {
		const context = createContext(event);
		const session = context.locals.session;

		if (session === null) {
			context.routes.lastPath.set();
			context.routes.login.redirect();
		}

		return session;
	};
};
