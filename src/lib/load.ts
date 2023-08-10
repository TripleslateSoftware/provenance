import type { RequestEvent } from '@sveltejs/kit';
import type { RedirectFn } from './types.js';

type AuthorizationOptions = {
	loginPathname: string;
};

export const l = (redirect: RedirectFn, options: AuthorizationOptions) => {
	const protectRoute = async (event: RequestEvent) => {
		const session = event.locals.session;
		if (session === null) {
			throw redirect(303, options.loginPathname);
		}

		return session;
	};

	return {
		protectRoute
	};
};
