import { c } from './checks.js';
import { HandlesModule, h } from './handles/index.js';
import { l } from './load.js';
import { o } from './oauth.js';
import { s } from './session.js';
import type { RedirectFn, SessionCallback, Provider, AuthOptions } from './types.js';

/**
 * create an auth object that provides a handle hook and a function to protect routes
 *
 * `src/lib/auth.ts`
 * ```ts title="$lib/auth.ts"
 * import { redirect } from '@sveltejs/kit';
 * import { dev } from '$app/environment';
 *
 * import { provenance } from '@tripleslate/provenance';
 * import { github } from '@tripleslate/provenance/providers';
 *
 * import { GH_CLIENT_ID, GH_CLIENT_SECRET } from '$env/static/private';
 *
 * export const auth = provenance(
 * 	github({ clientId: GH_CLIENT_ID, clientSecret: GH_CLIENT_SECRET }),
 * 	redirect,
 * 	dev,
 * 	() => {
 *    return {}
 *	}
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
 * @param provider configuration for your OAuth provider ([see](providers/index.ts))
 * @param redirect provide the redirect function from `@sveltejs/kit`
 * (throwing `redirect` provided by the `@sveltejs/kit` used in this package may not be recognized and handled correctly by your version of `@sveltejs/kit`
 * [see](https://github.com/sveltejs/kit/blob/118a3a62671d7bd60365b22ebd9dfbd746d91b4f/packages/kit/src/runtime/control.js#L48))
 * @param dev provide `dev` from `$app/enviroment` to enable secure cookies (https required) outside of dev mode
 * @param sessionCallback use tokens data to get more user information to store in the session cookie
 * @param logging whether to log in handle routes (will use setting for `dev` if not provided)
 * @param options provide options to configure things like pathnames and cookie names (all fields are optional with sensible defaults)
 * @returns an auth object with handle to be used in `hooks.server.ts` and `protectRoute` to redirect to login from `+page.server.ts` load functions if user is not authenticated
 */
export const provenance = <Session, SessionExtra>(
	provider: Provider<Session, SessionExtra>,
	createHandles: typeof h,
	dev: boolean,
	sessionCallback: SessionCallback<Session, SessionExtra>,
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

	const checks = c();
	const oauth = o({ checks }, provider);
	const session = s(provider, dev, sessionCallback);
	const handles = createHandles({ checks, oauth, session }, defaultedLogging, defaultedOptions);

	const { handle } = provider.createHandle(
		{ handles, oauth, session },
		defaultedLogging,
		defaultedOptions
	);

	const loadUtils = l(redirect, {
		loginPathname: defaultedOptions.loginPathname
	});

	return {
		handle,
		protectRoute: loadUtils.protectRoute,
		options: defaultedOptions
	};
};

// declare global {
// 	namespace App {
// 		interface SessionExtra {}
// 		interface DefaultSession {
// 			idToken?: string;
// 			accessToken: string;
// 			refreshToken?: string;
// 			refreshExpiresIn?: number;
// 			accessExpiresAt?: number;
// 		}
// 		interface Session {}

// 		interface Locals {
// 			session: (Session & DefaultSession & SessionExtra) | null;
// 		}
// 	}
// }
