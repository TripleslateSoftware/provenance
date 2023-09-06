import dedent from 'dedent';

export const generateRuntime = () => dedent`
	import { redirect } from '@sveltejs/kit';

	import { o, s, c, r } from '@tripleslate/provenance';

	import { dev } from '$app/environment';
	import { sequence } from '@sveltejs/kit/hooks';

	function createContext(event, modules) {
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
					 * @returns {Promise<string>}
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
					* @returns {Promise<string>}
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
								path: '/',
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
								path: '/',
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

		const handles = provider.resolvers.map((resolver) => {
			/** @type {import('@sveltejs/kit').Handle} */
			const handle = async ({ event, resolve }) => {
				const context = createContext(event, { checks, oauth, session, routes });

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
				throw redirect(303, defaultedOptions.loginPathname);
			}

			return session;
		};

		return {
			handle: sequence(...handles),
			protectRoute,
			options: defaultedOptions
		};
	};
 `;
