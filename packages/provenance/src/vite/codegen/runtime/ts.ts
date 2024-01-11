import dedent from 'dedent';

export const generateTSRuntime = () => dedent`
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
		type SessionCallback,
		type Context,
		type TokenEndpointResponse
	} from '@tripleslate/provenance';

	import { dev } from '$app/environment';

	function createContext(
		event: RequestEvent,
		modules: {
			oauth: OAuthModule;
			session: SessionModule<App.Session, App.SessionExtra>;
			routes: RoutesModule;
			checks: ChecksModule;
		}
	): Context<App.Session> {
		const isRoute = (pathname: string) => event.url.pathname.startsWith(pathname);

		return {
			oauth: {
				processAuthResponse: async (expectedState: string) => {
					return await modules.oauth.processAuthResponse(event.url, expectedState);
				},
				requestToken: async (
					codeVerifier: string,
					authorizationCode: string,
					expectedNonce: string
				) => {
					const fetchRequestToken = async (
						url: URL,
						params: {
							clientId: string;
							clientSecret: string;
							redirectUri: string;
						}
					): Promise<Response> => {
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
				postLogout: async (idToken: string) => {
					const fetch = async (url: URL): Promise<Response> => {
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
				create: (tokens: TokenEndpointResponse) => {
					return modules.session.create(tokens);
				},
				getCookie: () => {
					return modules.session.getCookie(event.cookies.getAll);
				},
				setCookie: (session: App.Session & App.SessionExtra) => {
					modules.session.setCookie(
						(name, value, maxAge) =>
							event.cookies.set(name, value, {
								path: '/',
								maxAge: maxAge
							}),
						session
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
	 * @param {Provider<App.Session>} provider configuration for your OAuth provider ([see](@tripleslate/provenance/providers/index.ts))
	 * @param {SessionCallback<App.Session, App.SessionExtra>} sessionCallback use session data (determined by provider) to return extra information to be stored in the session cookie
	 * @param {boolean | undefined} logging whether to log in handle routes (will use setting for \`dev\` if not provided)
	 * @param {Partial<AuthOptions> | undefined} options provide options to configure things like pathnames and cookie names (all fields are optional with sensible defaults)
	 * @returns an auth object with handle to be used in \`hooks.server.ts\` and \`protectRoute\` to redirect to login from \`+page.server.ts\` load functions if user is not authenticated
	 */
	export const provenance = (
		provider: Provider<App.Session>,
		sessionCallback: SessionCallback<App.Session, App.SessionExtra>,
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
		const routes = r(defaultedOptions);
		const oauth = o({ checks }, provider, defaultedOptions);
		const session = s(provider, sessionCallback, defaultedOptions);

		const handles = provider.resolvers.map((resolver) => {
			const handle: Handle = async ({ event, resolve }) => {
				const context = createContext(event, { checks, oauth, session, routes });

				await resolver(context, defaultedLogging);
				return await resolve(event);
			};
			return handle;
		});

		const protectRoute = async (event: RequestEvent) => {
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

	declare global {
		namespace App {
			interface SessionExtra {}
			interface Session {}

			interface Locals {
				session: (Session & SessionExtra) | null;
			}
		}
	}

	export {};
 `;
