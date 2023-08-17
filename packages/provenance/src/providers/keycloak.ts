import type { Handle } from '@sveltejs/kit';
// import { sequence } from '@sveltejs/kit/hooks';

import type { ChecksModule } from '../checks';
import type { HandlesModule, HandlesOptions } from '../handles/index';
// import { lastPathHandle, type LastPathHandleOptions } from '../handles/last-path.js';
// import { localsHandle, type LocalsHandleOptions } from '../handles/locals.js';
// import { loginHandle, type LoginHandleOptions } from '../handles/login.js';
// import { logoutHandle, type LogoutHandleOptions } from '../handles/logout.js';
// import { redirectUriHandle, type RedirectUriHandleOptions } from '../handles/redirect-uri.js';
// import { refreshHandle, type RefreshHandleOptions } from '../handles/refresh.js';
import type { OAuthModule } from '../oauth';
import type { SessionModule } from '../session';
import type { Checks, Provider, RedirectFn } from '../types';

import { lastPathResolver } from '../resolvers/last-path';
import { localsResolver } from '../resolvers/locals';
import { loginResolver } from '../resolvers/login';
import { logoutResolver } from '../resolvers/logout';
import { redirectUriResolver } from '../resolvers/redirect-uri';
import { refreshResolver } from '../resolvers/refresh';

export type KeycloakConfiguration = {
	base: string;
	realm: string;
	clientId: string;
	clientSecret: string;
};

const expiresInToExpiresAt = (expiresIn: number) => Math.floor(Date.now() / 1000 + expiresIn);

type KeycloakSession = {
	accessToken: string;
	refreshToken: string;
	idToken: string;
	refreshExpiresIn: number;
	accessExpiresAt: number;
	tokenType: string;
};

export const keycloak = <SessionExtra>(
	configuration: KeycloakConfiguration
): Provider<KeycloakSession, SessionExtra> => {
	return {
		issuer: new URL(`/realms/${configuration.realm}`, configuration.base).toString(),
		clientId: configuration.clientId,
		clientSecret: configuration.clientSecret,
		openid: true,
		createLoginUrl(redirectUri: string, checks: Checks) {
			const url = new URL(
				`/realms/${configuration.realm}/protocol/openid-connect/auth`,
				configuration.base
			);
			url.searchParams.append('client_id', configuration.clientId);
			url.searchParams.append('redirect_uri', redirectUri);
			url.searchParams.append('response_type', 'code');
			url.searchParams.append('response_mode', 'query');
			url.searchParams.append('state', checks.state);
			url.searchParams.append('nonce', checks.nonce);
			url.searchParams.append('code_challenge', checks.codeChallenge);
			url.searchParams.append('code_challenge_method', 'S256');
			url.searchParams.append('scope', 'openid profile email');

			return url;
		},
		createLogoutUrl() {
			return new URL(
				`/realms/${configuration.realm}/protocol/openid-connect/logout`,
				configuration.base
			);
		},
		createTokenUrl() {
			return new URL(
				`/realms/${configuration.realm}/protocol/openid-connect/token`,
				configuration.base
			);
		},
		createUserinfoUrl() {
			return new URL(
				`/realms/${configuration.realm}/protocol/openid-connect/userinfo`,
				configuration.base
			);
		},
		transformTokens: (tokens) => {
			if (!tokens.id_token) {
				throw `tokens response does not include 'id_token'`;
			}

			if (!tokens.expires_in) {
				throw `tokens response does not include 'expires_in'`;
			}

			if (!tokens.refresh_token) {
				throw `tokens response does not include 'refresh_token'`;
			}

			if (!tokens.refresh_expires_in) {
				throw `tokens response does not include 'refresh_expires_in'`;
			}

			return {
				idToken: tokens.id_token,
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token,
				refreshExpiresIn: parseInt(tokens.refresh_expires_in.toString()),
				accessExpiresAt: expiresInToExpiresAt(tokens.expires_in),
				tokenType: tokens.token_type
			};
		},
		sessionCookieAge(session) {
			return session.refreshExpiresIn;
		},
		createHandle(
			modules: {
				handles: HandlesModule;
				checks: ChecksModule;
				oauth: OAuthModule;
				session: SessionModule<Session, SessionExtra>;
			},
			createHandle: (resolvers) => Handle,
			logging: boolean,
			options: HandlesOptions
		) {
			const { handles, checks, oauth, session } = modules;

			const redirectUri = redirectUriResolver({ checks, oauth, session }, logging, {
				redirectUriPathname: options.redirectUriPathname,
				sessionCookieName: options.sessionCookieName,
				lastPathCookieName: options.lastPathCookieName
			});

			const locals = localsResolver(
				{ session },
				{
					sessionCookieName: options.sessionCookieName
				}
			);

			const login = loginResolver({ oauth }, redirect, logging, {
				loginPathname: options.loginPathname,
				lastPathCookieName: options.lastPathCookieName,
				redirectUriPathname: options.redirectUriPathname
			});

			const logout = logoutHandle({ oauth, session }, redirect, logging, {
				logoutPathname: options.logoutPathname,
				lastPathCookieName: options.lastPathCookieName,
				sessionCookieName: options.sessionCookieName
			});

			const refresh = refreshHandle({ oauth, session }, redirect, logging, {
				loginPathname: options.loginPathname,
				sessionCookieName: options.sessionCookieName
			});

			const lastPath = lastPathHandle({
				lastPathCookieName: options.lastPathCookieName
			});

			return createHandle({ redirectUri });
		},
		resolvers() {
			return {
				logout: async (context, logging) => {
					if (context.locals.session) {
						await context.oauth.postLogout(context.locals.session.idToken);
					}
				}
			};
		}
	};
};
