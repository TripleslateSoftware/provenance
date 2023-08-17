import type { RedirectFn } from './types.js';

type AuthorizationOptions = {
	loginPathname: string;
};

export const l = <Session>(redirect: RedirectFn, options: AuthorizationOptions) => {
	const protectRoute = async (session: Session | null) => {
		if (session === null) {
			throw redirect(303, options.loginPathname);
		}

		return session;
	};

	return {
		protectRoute
	};
};
