import { Context } from '../types';

export const logout = <RequestEvent, ProviderSession, AppSession>(
	createContext: (event: RequestEvent) => Context<ProviderSession, AppSession>
) => {
	return async (event: RequestEvent) => {
		const context = createContext(event);
		context.routes.logout.redirect();
	};
};
