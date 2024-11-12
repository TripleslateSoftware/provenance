/* eslint-disable */
/**
 * This file was generated by 'vite-plugin-provenance'
 *
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */
import { redirect, type Handle, type RequestEvent } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import {
	o,
	s,
	c,
	r,
	type ChecksModule,
	type OAuthModule,
	type RoutesModule,
	type SessionModule,
	type AuthOptions,
	type Provider,
	type Context,
	type TokenRequestResult
} from '@tripleslate/provenance';

import { logStarter } from '@tripleslate/provenance/helpers';

import { dev } from '$app/environment';

/**
 * @param getDomain use event data to return a value for the session cookie's domain attributes
 * @param logging whether to log in handle routes (will use setting for \`dev\` if not provided)
 * @param options provide options to configure things like pathnames and cookie names (all fields are optional with sensible defaults)
 */
export type ProvenanceConfig = {
	getDomain?: (event: RequestEvent) => string | undefined;
	logging?: boolean;
	options?: AuthOptions;
};

function createContext<ProviderSession, AppSession extends ProviderSession>(
	event: RequestEvent,
	modules: {
		oauth: OAuthModule;
		session: SessionModule<ProviderSession>;
		routes: RoutesModule;
		checks: ChecksModule<{ referrer?: string }>;
	},
	config: {
		logging: boolean;
		getDomain?: (event: RequestEvent) => string | undefined;
	}
): Context<ProviderSession, AppSession> {
	const isRoute = (searchPathname: string) => {
		const pathName = event.url.pathname;

		return pathName.startsWith(searchPathname);
	};

	return {
		oauth: {
			processAuthResponse: (expectedState: string) => {
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
			requestToken: async (codeVerifier: string, authorizationCode: string) => {
				const fetchRequestToken = async (
					url: URL,
					params: {
						clientId: string;
						clientSecret: string;
						redirectUri: string;
					}
				): Promise<Response> => {
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
			refresh: async (refreshToken: string) => {
				const fetchRefreshedToken = async (
					url: URL,
					body: {
						client_id: string;
						client_secret: string;
						grant_type: 'refresh_token';
						refresh_token: string;
					}
				): Promise<Response> => {
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
			redirectLogin: (referrer: string | null) => {
				const origin = event.url.origin;

				if (config.logging) {
					logStarter('oauth:', 'redirectLogin');
					console.log('origin:', origin);
				}

				return redirect(303, modules.oauth.login(origin, referrer, event.cookies.set));
			},
			preLogout: async (session: ProviderSession) => {
				const fetch = async (url: URL, body?: URLSearchParams): Promise<Response> => {
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
					logStarter('oauth:', 'preLogout');
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
			create: (tokens: TokenRequestResult) => {
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
			setCookie: (session: ProviderSession) => {
				if (config.logging) {
					logStarter('session:', 'setCookie');
					console.log('session:', session);
				}

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
				}, session);
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
			get session() {
				return event.locals.session as AppSession;
			},
			set session(value) {
				event.locals.session = value as App.Session;
			}
		},
		routes: {
			redirect: (location) => {
				redirect(303, location);
			},
			redirectUri: {
				is: isRoute(modules.routes.redirectUri.pathname)
			},
			login: {
				redirect: () => {
					const loginPathname = modules.routes.login.pathname;

					const loginPath = `${loginPathname}?${new URLSearchParams({ referrer: event.url.pathname + event.url.search })}`;

					redirect(303, loginPath);
				},
				is: isRoute(modules.routes.login.pathname)
			},
			logout: {
				redirect: () => {
					const logoutPathname = modules.routes.logout.pathname;

					const logoutPath = `${logoutPathname}?${new URLSearchParams({ referrer: event.url.pathname + event.url.search })}`;

					redirect(303, logoutPath);
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

					redirect(303, homePath);
				},
				is: isRoute(modules.routes.logout.pathname)
			}
		}
	};
}

/**
 * @param provider configuration for your OAuth provider ([see](@tripleslate/provenance/providers/index.ts))
 * @param config optional extra configuration options for provenance behaviour
 * @returns an auth object with handle to be used in \`hooks.server.ts\` and \`protectRoute\` to redirect to login from \`+page.server.ts\` load functions if user is not authenticated
 */
export const provenance = <ProviderSession>(
	provider: Provider<ProviderSession>,
	config?: ProvenanceConfig
) => {
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
		logging: dev,
		...config
	};

	const checks = c();
	const routes = r(defaultedOptions);
	const oauth = o({ checks }, provider, defaultedOptions);
	const session = s(provider, defaultedOptions);

	const handles = provider.resolvers.map((resolver) => {
		const handle: Handle = async ({ event, resolve }) => {
			const context = createContext(event, { checks, oauth, session, routes }, defaultedConfig);

			return await resolver(context, async () => await resolve(event), defaultedConfig.logging);
		};
		return handle;
	});

	return {
		handle: sequence(...handles),
		options: defaultedOptions,
		createContext: (event: RequestEvent) =>
			createContext(event, { checks, oauth, session, routes }, defaultedConfig)
	};
};

declare global {
	namespace App {
		interface Session {}

		interface Locals {
			session: Session | null;
		}
	}
}

export {};
