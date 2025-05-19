import { Context } from '../types';

export const signup = <RequestEvent, ProviderSession, AppSession>(
	createContext: (event: RequestEvent) => Context<ProviderSession, AppSession>
) => {
	return async (event: RequestEvent) => {
		const context = createContext(event);
		context.routes.signup.redirect();
	};
};
