import type { Checks, Provider } from '../types';

import {
	lastPathResolver,
	localsResolver,
	loginResolver,
	logoutResolver,
	redirectUriResolver,
	refreshResolver
} from '../resolvers';
import { provider } from './provider';

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
	configuration: KeycloakConfiguration,
	sessionCallback: (session: KeycloakSession) => SessionExtra
): Provider<KeycloakSession, SessionExtra> =>
	provider({
		issuer: new URL(`/realms/${configuration.realm}`, configuration.base).toString(),
		clientId: configuration.clientId,
		clientSecret: configuration.clientSecret,
		openid: true,
		sessionCallback,
		endpoints: {
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
			createLogoutUrl: () =>
				new URL(
					`/realms/${configuration.realm}/protocol/openid-connect/logout`,
					configuration.base
				),
			createTokenUrl: () =>
				new URL(`/realms/${configuration.realm}/protocol/openid-connect/token`, configuration.base),
			createUserinfoUrl: () =>
				new URL(
					`/realms/${configuration.realm}/protocol/openid-connect/userinfo`,
					configuration.base
				)
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
		resolvers: [
			redirectUriResolver(),
			localsResolver(),
			loginResolver(),
			logoutResolver(),
			async (context, logging) => {
				if (context.routes.logout.is && context.locals.session) {
					await context.oauth.postLogout(context.locals.session.idToken);
				}
			},
			refreshResolver(),
			lastPathResolver()
		]
	});
