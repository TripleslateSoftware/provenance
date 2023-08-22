// dummy GENERATED "module"
import { redirect, RequestEvent } from '@sveltejs/kit';

import { o } from '../modules/oauth';
import { s } from '../modules/session';
import { c } from '../modules/checks';
import { r } from '../modules/routes';
import { Context } from '../context';

import { dev } from '$app/environment';

/**
 * 
 * @param {RequestEvent} event 
 * @param {{
		oauth: import('@tripleslate/provenance/oauth').OAuthModule;
		checks: import('@tripleslate/provenance/checks').ChecksModule;
		session: import('@tripleslate/provenance/session').SessionModule<App.Session, App.SessionExtra>;
		routes: import('@tripleslate/provenance/routes').RoutesModule;
	}} modules 
 * @returns {Context<App.Session, App.SessionExtra>}
 */
function createContext(event, modules) {
	const isRoute = (/** @type {string} */ pathname) => event.url.pathname.startsWith(pathname);

	return {
		oauth: {
			/**
			 * @param {string} expectedState
			 * @returns {Promise<{ code: string }>}
			 */
			processAuthResponse: async (expectedState) => {
				return await modules.oauth.processAuthResponse(event.url, expectedState);
			},
			/**
			 * @param {string} codeVerifier
			 * @param {string} authorizationCode
			 * @param {string} expectedNonce
			 * @returns {string}
			 */
			requestToken: async (codeVerifier, authorizationCode, expectedNonce) => {
				/** 
				 * @param {URL} url
				 * @param {{
						clientId: string;
						clientSecret: string;
						redirectUri: string;
					}} params
				 * @returns {string}
				 */
				const fetchRequestToken = async (url, params) => {
					return await event.fetch(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							Accept: 'application/json'
						},
						body: new URLSearchParams({
							client_id: params.clientId,
							client_secret: params.clientSecret,
							redirect_uri: params.redirectUri,
							grant_type: 'authorization_code',
							code: authorizationCode,
							code_verifier: codeVerifier
						})
					});
				};

				return await modules.oauth.requestToken(fetchRequestToken, expectedNonce);
			},
			/** 
			 * @param {string} refreshToken
			 * @param {{
					clientId: string;
					clientSecret: string;
					redirectUri: string;
				}} authorizationCode
			 * @returns {string}
			 */
			refresh: async (refreshToken) => {
				/** 
				 * @param {URL} url
				 * @param {{
						client_id: string;
						client_secret: string;
						grant_type: 'refresh_token';
						refresh_token: string;
					}} body
				 * @returns {string}
				 */
				const fetchRefreshedToken = async (url, body) => {
					return await event.fetch(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: new URLSearchParams(body)
					});
				};

				return await modules.oauth.refresh(fetchRefreshedToken, refreshToken);
			},
			redirectLogin: async () => {
				throw redirect(303, await modules.oauth.login(event.url.origin, event.cookies.set));
			},
			/**
			 * @param {string} idToken
			 * @returns {string}
			 */
			postLogout: async (idToken) => {
				/**
				 * @param {URL} url
				 * @returns {string}
				 */
				const fetch = async (url) => {
					return await event.fetch(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: new URLSearchParams({
							id_token_hint: idToken
						})
					});
				};

				return await modules.oauth.logout(fetch);
			}
		},
		checks: {
			nonce: {
				use: () => modules.checks.nonce.use(event.cookies)
			},
			state: {
				use: () => modules.checks.state.use(event.cookies)
			},
			pkce: {
				use: () => modules.checks.pkce.use(event.cookies)
			}
		},
		session: {
			/**
			 * @param {import('oauth4webapi').TokenEndpointResponse} tokens
			 * @returns {string}
			 */
			create: (tokens) => {
				return modules.session.create(tokens);
			},
			getCookie: () => {
				return modules.session.getCookie(event.cookies.getAll);
			},
			setCookie: (session) => {
				modules.session.setCookie(
					(name, value, maxAge) =>
						event.cookies.set(name, value, {
							httpOnly: true,
							path: '/',
							secure: !dev,
							sameSite: 'lax',
							maxAge: maxAge
						}),
					session
				);
			},
			deleteCookie: () => {
				modules.session.deleteCookie(event.cookies.getAll, event.cookies.delete);
			}
		},
		locals: {
			session: event.locals.session
		},
		routes: {
			redirectUri: {
				is: isRoute(modules.routes.redirectUri.pathname)
			},
			login: {
				redirect: () => {
					const loginPath = modules.routes.login.pathname;
					throw redirect(303, loginPath);
				},
				is: isRoute(modules.routes.login.pathname)
			},
			logout: {
				redirect: () => {
					const logoutPath = modules.routes.logout.pathname;
					throw redirect(303, logoutPath);
				},
				is: isRoute(modules.routes.logout.pathname)
			},
			lastPath: {
				redirect: () => {
					const lastPath = modules.routes.lastPath.getCookie(event.cookies.get);
					throw redirect(303, lastPath || '/');
				},
				set: () => {
					modules.routes.lastPath.setCookie((name, maxAge) =>
						event.cookies.set(name, event.url.pathname, {
							httpOnly: true,
							path: '/',
							secure: !dev,
							sameSite: 'lax',
							maxAge: maxAge
						})
					);
				}
			},
			home: {
				redirect: () => {
					throw redirect(303, '/');
				},
				is: isRoute('/')
			}
		}
	};
}

/**
 * create an auth object that provides a handle hook and a function to protect routes
 *
 * `src/lib/auth.ts`
 * ```ts title="$lib/auth.ts"
 * import { provenance } from '$provenance';
 * import { github } from '@tripleslate/provenance/providers';
 *
 * import { GH_CLIENT_ID, GH_CLIENT_SECRET } from '$env/static/private';
 *
 * export const auth = provenance(
 * 	github({ clientId: GH_CLIENT_ID, clientSecret: GH_CLIENT_SECRET }),
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
 * @param {Provider<App.Session>} provider configuration for your OAuth provider ([see](@tripleslate/provenance/providers/index.ts))
 * @param {SessionCallback<App.Session, App.SessionExtra>} sessionCallback use session data (determined by provider) to return extra information to be stored in the session cookie
 * @param {boolean | undefined} logging whether to log in handle routes (will use setting for `dev` if not provided)
 * @param {Partial<AuthOptions> | undefined} options provide options to configure things like pathnames and cookie names (all fields are optional with sensible defaults)
 * @returns an auth object with handle to be used in `hooks.server.ts` and `protectRoute` to redirect to login from `+page.server.ts` load functions if user is not authenticated
 */
export const provenance = (provider, sessionCallback, logging, options) => {
	/**
	 * @type {AuthOptions}
	 */
	const defaultedOptions = {
		redirectUriPathname: '/auth',
		sessionCookieName: 'session',
		loginPathname: '/login',
		logoutPathname: '/logout',
		lastPathCookieName: 'last-path',
		...options
	};

	const defaultedLogging = logging || dev;

	const checks = c();
	const routes = r(defaultedOptions);
	const oauth = o({ checks }, provider, defaultedOptions);
	const session = s(provider, sessionCallback, defaultedOptions);

	/**
	 * @type {import('@sveltejs/kit').Handle}
	 */
	const handle = async ({ event, resolve }) => {
		const context = createContext(event, { checks, oauth, session, routes });

		provider.resolvers.forEach(async (resolver) => {
			resolver(context, defaultedLogging);
		});

		return await resolve(event);
	};

	/**
	 * @param {(App.Session & App.SessionExtra) | null} session
	 */
	const protectRoute = async (session) => {
		if (session === null) {
			throw redirect(303, defaultedOptions.loginPathname);
		}

		return session;
	};

	return {
		handle,
		protectRoute,
		options: defaultedOptions
	};
};
