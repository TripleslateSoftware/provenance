import type { TokenEndpointResponse } from 'oauth4webapi';

import type { OAuthModule } from '../oauth';
import type { SessionModule } from '../session';
import type { ChecksModule } from '../checks';
import type { RoutesModule } from '../routes';

export type Context<Session, SessionExtra> = {
	oauth: {
		processAuthResponse: (expectedState: string) => ReturnType<OAuthModule['processAuthResponse']>;
		requestToken: (
			codeVerifier: string,
			authorizationCode: string,
			expectedNonce: string
		) => ReturnType<OAuthModule['requestToken']>;
		refresh: (refreshToken: string) => ReturnType<OAuthModule['refresh']>;
		postLogout: (idToken: string) => ReturnType<OAuthModule['logout']>;
	};
	checks: {
		nonce: {
			use: () => string;
		};
		state: {
			use: () => string;
		};
		pkce: {
			use: () => string;
		};
	};
	session: {
		create: (tokens: TokenEndpointResponse) => Session & SessionExtra;
		setCookie: (session: Session & SessionExtra) => void;
		deleteCookie: () => void;
	};
	locals: {
		session: (Session & SessionExtra) | null;
	};
	routes: {
		redirectUri: {
			is: boolean;
		};
		login: {
			redirect: () => void;
			is: boolean;
		};
		logout: {
			redirect: () => void;
			is: boolean;
		};
		lastPath: {
			redirect: () => void;
		};
		home: {
			redirect: () => void;
			is: boolean;
		};
	};
};

// GENERATED "module"
import { redirect, RequestEvent } from '@sveltejs/kit';

const dev: boolean = true;

function createContext(
	event: RequestEvent,
	modules: {
		oauth: OAuthModule;
		checks: ChecksModule;
		session: SessionModule<App.Session, App.SessionExtra>;

		routes: RoutesModule;
	}
): Context<App.Session, App.SessionExtra> {
	const isRoute = (pathname: string) => event.url.pathname.startsWith(pathname);

	return {
		oauth: {
			processAuthResponse: async (expectedState: string): Promise<{ code: string }> => {
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
				) => {
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
			refresh: async (refreshToken: string) => {
				const fetchRefreshedToken = async (
					url: URL,
					body: {
						client_id: string;
						client_secret: string;

						grant_type: 'refresh_token';
						refresh_token: string;
					}
				) => {
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
			postLogout: async (idToken: string) => {
				const fetch = async (url: URL) => {
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
