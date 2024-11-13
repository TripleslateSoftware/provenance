/* eslint-disable */
/**
 * This file was generated by 'vite-plugin-provenance'
 *
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { o, s, c, r } from '@tripleslate/provenance';

import { logStarter } from '@tripleslate/provenance/helpers';

import { dev } from '$app/environment';

/**
 * @template ProviderSession
 * @template {ProviderSession} AppSession
 *
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {{
		oauth: import('@tripleslate/provenance').OAuthModule;
		session: import('@tripleslate/provenance').SessionModule<ProviderSession>;
		routes: import('@tripleslate/provenance').RoutesModule;
		checks: import('@tripleslate/provenance').ChecksModule<{ referrer?: string }>;
	}} modules
 * @param {{
		logging: boolean;
		sessionCallback: (session: ProviderSession) => AppSession;
		getDomain?: (event: import('@sveltejs/kit').RequestEvent) => string | undefined;
	}} config
 * @returns {import('@tripleslate/provenance').Context<ProviderSession, AppSession>} an auth object with handle to be used in \`hooks.server.ts\` and \`protectRoute\` to redirect to login from \`+page.server.ts\` load functions if user is not authenticated
 */
function createContext(event, modules, config) {
	const isRoute = (/** @type {string} */ searchPathname) => {
		const pathName = event.url.pathname;

		return pathName.startsWith(searchPathname);
	};

	return {
		oauth: {
			processAuthResponse: (expectedState) => {
				const url = event.url;

				if (config.logging) {
					logStarter('oauth:', 'processAuthResponse');
					console.log('url:', url.href);
					console.log('expectedState:', expectedState);
				}

				const authResponse = modules.oauth.processAuthResponse(url, expectedState);

				if (config.logging) {
					console.log('authResponse:', authResponse);
				}

				return authResponse;
			},
			requestToken: async (codeVerifier, authorizationCode) => {
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
					const client_id = params.clientId;
					const client_secret = params.clientSecret;
					const redirect_uri = new URL(params.redirectUri, event.url.origin).toString();
					const grant_type = 'authorization_code';
					const code = authorizationCode;
					const code_verifier = codeVerifier;

					if (config.logging) {
						console.log('client_id:', client_id);
						console.log('client_secret:', client_secret);
						console.log('redirect_uri:', redirect_uri);
						console.log('grant_type:', grant_type);
						console.log('code:', code);
						console.log('code_verifier:', code_verifier);
					}

					return await event.fetch(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							Accept: 'application/json'
						},
						body: new URLSearchParams({
							client_id: client_id,
							client_secret: client_secret,
							redirect_uri: redirect_uri,
							grant_type: grant_type,
							code: authorizationCode,
							code_verifier: codeVerifier
						})
					});
				};

				if (config.logging) {
					logStarter('oauth:', 'requestToken');
				}

				const tokenEndpointResponse = await modules.oauth.requestToken(fetchRequestToken);

				if (config.logging) {
					console.log('tokenEndpointResponse:', tokenEndpointResponse);
				}

				return tokenEndpointResponse;
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
					if (config.logging) {
						console.log('client_id:', body.client_id);
						console.log('client_secret:', body.client_secret);
						console.log('grant_type:', body.grant_type);
						console.log('refresh_token:', body.refresh_token);
					}

					return await event.fetch(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: new URLSearchParams(body)
					});
				};

				if (config.logging) {
					logStarter('oauth:', 'refresh');
				}

				const tokenEndpointResponse = await modules.oauth.refresh(
					fetchRefreshedToken,
					refreshToken
				);

				if (config.logging) {
					console.log('tokenEndpointResponse:', tokenEndpointResponse);
				}

				return tokenEndpointResponse;
			},
			referrer: event.url.searchParams.get('referrer'),
			redirectLogin: (referrer) => {
				const origin = event.url.origin;

				if (config.logging) {
					logStarter('oauth:', 'redirectLogin');
					console.log('origin:', origin);
				}

				redirect(302, modules.oauth.login(origin, referrer, event.cookies.set));
			},
			preLogout: async (session) => {
				/**
				 * @param {URL} url
				 * @param {URLSearchParams=} body
				 * @returns {Promise<Response>}
				 */
				const fetch = async (url, body) => {
					if (config.logging) {
						console.log('url:', url);
						console.log('body:', body);
					}

					return await event.fetch(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: body
					});
				};

				if (config.logging) {
					logStarter('oauth:', 'postLogout');
				}

				return await modules.oauth.logout(fetch, session);
			}
		},
		checks: {
			state: {
				use: () => {
					const state = modules.checks.state.use(event.cookies);

					if (config.logging) {
						logStarter('checks:', 'state:', 'use');
						console.log('state:', state);
					}

					return state;
				}
			},
			pkce: {
				use: () => {
					const pkce = modules.checks.pkce.use(event.cookies);

					if (config.logging) {
						logStarter('checks:', 'pkce:', 'use');
						console.log('pkce:', pkce);
					}

					return pkce;
				}
			}
		},
		session: {
			create: (tokens) => {
				if (config.logging) {
					logStarter('session:', 'create');
				}

				const session = modules.session.create(tokens);

				if (config.logging) {
					console.log('session:', session);
				}

				return session;
			},
			getCookie: () => {
				if (config.logging) {
					logStarter('session:', 'getCookie');
				}

				const cookie = modules.session.getCookie(event.cookies.getAll);

				if (config.logging) {
					if (config.logging) console.log('cookie:', cookie);
				}

				return cookie;
			},
			setCookie: (session) => {
				if (config.logging) {
					logStarter('session:', 'setCookie');
					console.log('session:', session);
				}

				const appSession = config.sessionCallback(session);
				const domain = config.getDomain?.(event);

				modules.session.setCookie((name, value, maxAge) => {
					if (config.logging) {
						console.log('name:', name);
						console.log('value:', value);
						console.log('maxAge:', maxAge);
						console.log('domain:', domain);
					}

					return event.cookies.set(name, value, {
						path: '/',
						maxAge,
						domain
					});
				}, appSession);
			},
			deleteCookie: () => {
				if (config.logging) {
					logStarter('session:', 'deleteCookie');
				}

				const domain = config.getDomain?.(event);

				modules.session.deleteCookie(event.cookies.getAll, (name) => {
					if (config.logging) {
						console.log('name:', name);
						console.log('domain:', domain);
					}

					event.cookies.delete(name, {
						path: '/',
						domain
					});
				});
			}
		},
		locals: {
			// @ts-ignore
			get session() {
				return event.locals.session;
			},
			// @ts-ignore
			set session(value) {
				event.locals.session = value;
			}
		},
		routes: {
			redirect: (location) => {
				redirect(302, location);
			},
			redirectUri: {
				is: isRoute(modules.routes.redirectUri.pathname)
			},
			login: {
				redirect: () => {
					const loginPathname = modules.routes.login.pathname;

					const loginPath = `${loginPathname}?${new URLSearchParams({ referrer: event.url.pathname + event.url.search })}`;

					redirect(302, loginPath);
				},
				is: isRoute(modules.routes.login.pathname)
			},
			logout: {
				redirect: () => {
					const logoutPath = modules.routes.logout.pathname;
					redirect(302, logoutPath);
				},
				is: isRoute(modules.routes.logout.pathname)
			},
			home: {
				redirect: () => {
					const homePath = modules.routes.home.pathname;

					if (config.logging) {
						logStarter('routes:', 'home:', 'redirect');
						console.log('homePath:', homePath);
					}

					redirect(302, homePath);
				},
				is: isRoute(modules.routes.logout.pathname)
			}
		}
	};
}

/**
 * @template ProviderSession
 *
 * @param {import('@tripleslate/provenance').Provider<ProviderSession>} provider configuration for your OAuth provider ([see](@tripleslate/provenance/providers/index.ts))
 * @param {import('./js').ProvenanceConfig=} config optional extra configuration options for provenance behaviour
 * @returns an auth object with handle to be used in \`hooks.server.ts\` and \`protectRoute\` to redirect to login from \`+page.server.ts\` load functions if user is not authenticated
 */
export const provenance = (provider, config) => {
	const defaultedOptions = {
		redirectUriPathname: '/auth',
		sessionCookieName: 'session',
		loginPathname: '/login',
		logoutPathname: '/logout',
		refreshPathname: '/refresh',
		homePathname: '/',
		...config?.options
	};

	const defaultedConfig = {
		sessionCallback: (/** @type {ProviderSession} */ session) => session,
		logging: dev,
		...config
	};

	const checks = c();
	const routes = r(defaultedOptions);
	const oauth = o({ checks }, provider, defaultedOptions);
	const session = s(provider, defaultedOptions);

	const handles = provider.resolvers.map((resolver) => {
		/** @type import('@sveltejs/kit').Handle */
		const handle = async ({ event, resolve }) => {
			const context = createContext(event, { checks, oauth, session, routes }, defaultedConfig);

			return await resolver(context, async () => await resolve(event), defaultedConfig.logging);
		};
		return handle;
	});

	return {
		handle: sequence(...handles),
		options: defaultedOptions,
		createContext: (/** @type {import("@sveltejs/kit").RequestEvent} */ event) =>
			createContext(event, { checks, oauth, session, routes }, defaultedConfig)
	};
};
