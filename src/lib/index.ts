import { sequence } from '@sveltejs/kit/hooks';

import type { RedirectFn } from './types.js';
import { handles } from './handles/index.js';
import { l } from './load.js';
import { o, type ProviderConfiguration } from './oauth/index.js';
import { s } from './session/index.js';

export type AuthOptions = {
	/** defaults to `/auth` */
	redirectUriPathname: string;
	/** defaults to `session` */
	sessionCookieName: string;
	/** defaults to `/login` */
	loginPathname: string;
	/** defaults to `/logout` */
	logoutPathname: string;
	/** defaults to `last-path` */
	lastPathCookieName: string;
};

/**
 * create an auth object that provides a handle hook and a function to protect routes
 *
 * `src/lib/auth.ts`
 * ```ts title="$lib/auth.ts"
 * import { redirect } from '@sveltejs/kit';
 *
 * import { provenance } from '@tripleslate/provenance';
 *
 * import { dev } from '$app/environment';
 * import { KC_REALM, KC_BASE, KC_CLIENT_ID, KC_CLIENT_SECRET } from '$env/static/private';
 *
 * export const auth = provenance(
 * 	{
 * 		issuer: new URL(`/realms/${KC_REALM}`, KC_BASE).toString(),
 * 		clientId: KC_CLIENT_ID,
 * 		clientSecret: KC_CLIENT_SECRET
 * 	},
 * 	redirect,
 * 	dev
 * );
 * ```
 *
 * `src/hooks.server.ts`
 * ```ts title="hooks.server.ts"
 * import { auth } from '$lib/auth.js';
 *
 * export const handle = auth.handle;
 * ```
 *
 * `handle` will programmatically create 3 routes:
 * - `redirectUri` to handle redirects from the auth server as part of the oauth authorization flow
 * - `login` to redirect the user to the proper oauth url when navigated
 * - `logout` to destroy the oauth and cookie session when navigated
 *
 * other handle functionality will manage session cookies, provide session in locals, refresh the access token,
 * and keep track of the last path to which the user navigated (for redirecting back to protected routes after authenticating)
 *
 * `protectRoute` can be awaited in `+page.server.ts` load functions to send the user to the login route if a session is required
 *
 * @param provider configuration for your OAuth provider
 * @param redirect provide the redirect function from `@sveltejs/kit`
 * (throwing `redirect` provided by the `@sveltejs/kit` used in this package may not be recognized and handled correctly by your version of `@sveltejs/kit`
 * [see](https://github.com/sveltejs/kit/blob/118a3a62671d7bd60365b22ebd9dfbd746d91b4f/packages/kit/src/runtime/control.js#L48))
 * @param dev provide `dev` from `$app/enviroment` to enable secure cookies (https required) outside of dev mode
 * @param logging whether to log in handle routes (will use setting for `dev` if not provided)
 * @param options provide options to configure things like pathnames and cookie names (all fields are optional with sensible defaults)
 * @returns an auth object with handle to be used in `hooks.server.ts` and `protectRoute` to redirect to login from `+page.server.ts` load functions if user is not authenticated
 */
export const provenance = (
	provider: ProviderConfiguration,
	redirect: RedirectFn,
	dev: boolean,
	logging?: boolean,
	options?: Partial<AuthOptions>
) => {
	const defaultedOptions: AuthOptions = {
		redirectUriPathname: '/auth',
		sessionCookieName: 'session',
		loginPathname: '/login',
		logoutPathname: '/logout',
		lastPathCookieName: 'last-path',
		...options
	};

	const defaultedLogging = logging || dev;

	const oauth = o(provider);
	const session = s(dev);

	const redirectUri = handles.redirectUri(oauth, session, redirect, defaultedLogging, {
		redirectUriPathname: defaultedOptions.redirectUriPathname,
		sessionCookieName: defaultedOptions.sessionCookieName,
		lastPathCookieName: defaultedOptions.lastPathCookieName
	});

	const locals = handles.locals({
		sessionCookieName: defaultedOptions.sessionCookieName
	});

	const login = handles.login(oauth, redirect, defaultedLogging, {
		loginPathname: defaultedOptions.loginPathname,
		lastPathCookieName: defaultedOptions.lastPathCookieName,
		redirectUriPathname: defaultedOptions.redirectUriPathname
	});

	const logout = handles.logout(oauth, session, redirect, defaultedLogging, {
		logoutPathname: defaultedOptions.logoutPathname,
		lastPathCookieName: defaultedOptions.lastPathCookieName,
		sessionCookieName: defaultedOptions.sessionCookieName
	});

	const refresh = handles.refresh(oauth, session, redirect, defaultedLogging, {
		loginPathname: defaultedOptions.loginPathname,
		sessionCookieName: defaultedOptions.sessionCookieName
	});

	const lastPath = handles.lastPath({
		lastPathCookieName: defaultedOptions.lastPathCookieName
	});

	const loadUtils = l(redirect, {
		loginPathname: defaultedOptions.loginPathname
	});

	return {
		handle: sequence(redirectUri, locals, login, logout, refresh, lastPath),
		protectRoute: loadUtils.protectRoute
	};
};

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace App {
		interface User {
			id: string;
			name: string;
			displayName: string;
			givenName: string;
			familyName: string;
			email: string;
		}
		interface Session {
			idToken: string;
			accessToken: string;
			refreshToken: string;
			user: User;
			profile: object;
			refreshExpiresIn: number;
			expiresAt: number;
		}

		interface Locals {
			session: Session | null;
		}
	}
}
