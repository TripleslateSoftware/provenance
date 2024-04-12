import { redirect } from '@sveltejs/kit';

import { o, s, c, r } from '@tripleslate/provenance';

import { dev } from '$app/environment';
import { sequence } from '@sveltejs/kit/hooks';

/**
 * @template ProviderSession
 *
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {{
		oauth: import('@tripleslate/provenance').OAuthModule;
		session: import('@tripleslate/provenance').SessionModule<ProviderSession>;
		routes: import('@tripleslate/provenance').RoutesModule;
		checks: import('@tripleslate/provenance').ChecksModule;
	}} modules
 * @param {Partial<Pick<import('./js').ProvenanceConfig<ProviderSession>, 'sessionCallback' | 'getDomain'>> | undefined} config
 * @returns {import('@tripleslate/provenance').Context<ProviderSession, App.Session>} an auth object with handle to be used in \`hooks.server.ts\` and \`protectRoute\` to redirect to login from \`+page.server.ts\` load functions if user is not authenticated
 */
function createContext(event, modules, config) {
	const isRoute = (/** @type {string} */ pathname) => event.url.pathname.startsWith(pathname);

	return {
		oauth: {
			processAuthResponse: async (expectedState) => {
				return await modules.oauth.processAuthResponse(event.url, expectedState);
			},
			requestToken: async (codeVerifier, authorizationCode, expectedNonce) => {
				/** 
					 * @param {URL} url
					 * @param {{
							clientId: string;
							clientSecret: string;
							redirectUri: string;
						}} params
					* @returns {Promise<Response>}
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
							redirect_uri: new URL(params.redirectUri, event.url.origin).toString(),
							grant_type: 'authorization_code',
							code: authorizationCode,
							code_verifier: codeVerifier
						})
					});
				};

				return await modules.oauth.requestToken(fetchRequestToken, expectedNonce);
			},
			refresh: async (refreshToken) => {
				/** 
					 * @param {URL} url
					 * @param {{
							client_id: string;
							client_secret: string;
							grant_type: 'refresh_token';
							refresh_token: string;
						}} body
					* @returns {Promise<Response>}
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
				redirect(303, await modules.oauth.login(event.url.origin, event.cookies.set));
			},
			postLogout: async (idToken) => {
				/**
				 * @param {URL} url
				 * @returns {Promise<Response>}
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
			create: (tokens) => {
				return modules.session.create(tokens);
			},
			getCookie: () => {
				return modules.session.getCookie(event.cookies.getAll);
			},
			setCookie: (session) => {
				const sessionWithExtra = {
					...session,
					...config?.sessionCallback?.(session)
				};
				modules.session.setCookie(
					(name, value, maxAge) =>
						event.cookies.set(name, value, {
							path: '/',
							maxAge: maxAge,
							domain: config?.getDomain?.(event)
						}),
					sessionWithExtra
				);
			},
			deleteCookie: () => {
				modules.session.deleteCookie(event.cookies.getAll, (name) =>
					event.cookies.delete(name, {
						path: '/'
					})
				);
			}
		},
		locals: {
			get session() {
				return event.locals.session;
			},
			set session(value) {
				event.locals.session = value;
			}
		},
		routes: {
			redirectUri: {
				is: isRoute(modules.routes.redirectUri.pathname)
			},
			login: {
				redirect: () => {
					const loginPath = modules.routes.login.pathname;
					redirect(303, loginPath);
				},
				is: isRoute(modules.routes.login.pathname)
			},
			logout: {
				redirect: () => {
					const logoutPath = modules.routes.logout.pathname;
					redirect(303, logoutPath);
				},
				is: isRoute(modules.routes.logout.pathname)
			},
			lastPath: {
				redirect: () => {
					const lastPath = modules.routes.lastPath.getCookie(event.cookies.get);
					redirect(303, lastPath || '/');
				},
				set: () => {
					modules.routes.lastPath.setCookie((name, maxAge) =>
						event.cookies.set(name, event.url.pathname, {
							path: '/',
							maxAge: maxAge
						})
					);
				}
			},
			home: {
				redirect: () => {
					redirect(303, '/');
				},
				is: isRoute('/')
			}
		}
	};
}

/**
 * @template ProviderSession
 *
 * @param {import('@tripleslate/provenance').Provider<ProviderSession>} provider configuration for your OAuth provider ([see](@tripleslate/provenance/providers/index.ts))
 * @param {Partial<import('./js').ProvenanceConfig<ProviderSession>>} config optional extra configuration options for provenance behaviour
 * @returns an auth object with handle to be used in \`hooks.server.ts\` and \`protectRoute\` to redirect to login from \`+page.server.ts\` load functions if user is not authenticated
 */
export const provenance = (provider, config) => {
	/**
	 * @type {import('@tripleslate/provenance').AuthOptions}
	 */
	const defaultedOptions = {
		redirectUriPathname: '/auth',
		sessionCookieName: 'session',
		loginPathname: '/login',
		logoutPathname: '/logout',
		lastPathCookieName: 'last-path',
		...config?.options
	};

	const defaultedLogging = config?.logging || dev;

	const checks = c();
	const routes = r(defaultedOptions);
	const oauth = o({ checks }, provider, defaultedOptions);
	const session = s(provider, defaultedOptions);

	const handles = provider.resolvers.map((resolver) => {
		/** @type import('@sveltejs/kit').Handle */
		const handle = async ({ event, resolve }) => {
			const context = createContext(event, { checks, oauth, session, routes }, config);

			await resolver(context, defaultedLogging);
			return await resolve(event);
		};
		return handle;
	});

	/**
	 * @param {import('@sveltejs/kit').RequestEvent} event
	 */
	const protectRoute = async (event) => {
		const session = event.locals.session;

		if (session === null) {
			routes.lastPath.setCookie((name, maxAge) =>
				event.cookies.set(name, event.url.pathname, {
					path: '/',
					maxAge: maxAge
				})
			);

			redirect(303, defaultedOptions.loginPathname);
		}

		return session;
	};

	return {
		handle: sequence(...handles),
		protectRoute,
		options: defaultedOptions
	};
};
