import { Context } from '../types';

export const deleteSessionCookies = <RequestEvent, ProviderSession, AppSession>(
	createContext: (event: RequestEvent) => Context<ProviderSession, AppSession>
) => {
	return async (event: RequestEvent) => {
		const context = createContext(event);

		context.session.deleteCookie();
	};
};
