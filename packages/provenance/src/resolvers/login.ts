import { RequestEvent } from '@sveltejs/kit';
import type { OAuthModule } from '../oauth.js';
import type { RedirectFn } from '../types.js';

export type LoginResolverOptions = {
	loginPathname: string;
	lastPathCookieName: string;
	redirectUriPathname: string;
};

export const loginResolver = <Session>(
	modules: { oauth: OAuthModule },
	redirect: RedirectFn,
	logging: boolean,
	options: LoginResolverOptions
) => {
	const resolve = async (event: RequestEvent, session: Session | null, lastPath: string) => {
		if (session === null) {
			if (logging) console.log('provenance:', 'login');

			throw redirect(
				303,
				await modules.oauth.login(
					event,
					new URL(options.redirectUriPathname, event.url.origin).toString()
				)
			);
		} else {
			throw redirect(303, lastPath || '/');
		}
	};

	return resolve;
};
