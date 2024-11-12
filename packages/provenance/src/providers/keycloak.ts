import { TokenRequestResult } from '@oslojs/oauth2';
import { JWTClaims, parseJWT } from '@oslojs/jwt';

import {
	type Resolver,
	localsResolver,
	loginResolver,
	logoutResolver,
	redirectUriResolver,
	refreshResolver
} from '../resolvers';

import { provider } from './provider';
import type { CreateProvider, EndpointsConfiguration } from './types';

export type KeycloakConfiguration = {
	/** like https://auth-server.com/ (don't include "realms", "protocol", etc.) */
	base: string;
	/** realm corresponding to users of this application (multi-tenant is currently not supported) */
	realm: string;
	/** client id corresponding to this application */
	clientId: string;
	/** client secret corresponding to this application (can be any empty string if not being used for the client) */
	clientSecret: string;
	options: {
		/**
		 * a ms adjustment to access token expiry, based upon which a server request will trigger or not trigger a token set refresh
		 *
		 * at 0 (default), refresh only access tokens that have expired
		 *
		 * at infinity, refresh on every request
		 */
		eagerRefresh?: number;
	};
	scopes: string[];
};

type KeycloakSession = {
	accessToken: string;
	refreshToken: string;
	idToken: string;
	refreshExpiresAt: number;
	accessExpiresAt: number;
	tokenType: string;
};

export const keycloak: CreateProvider<KeycloakConfiguration, KeycloakSession> = (
	configuration,
	callbacks
) => {
	const defaultedOptions = {
		eagerRefresh: 0,
		...configuration.options
	};

	const authServer = {
		issuer: new URL(`/realms/${configuration.realm}`, configuration.base).toString(),
		clientId: configuration.clientId,
		clientSecret: configuration.clientSecret,
		openid: true
	};
	const endpoints: EndpointsConfiguration<KeycloakSession> = {
		createLoginUrl(redirectUri, checks) {
			const url = new URL(
				`/realms/${configuration.realm}/protocol/openid-connect/auth`,
				configuration.base
			);
			url.searchParams.append('client_id', configuration.clientId);
			url.searchParams.append('redirect_uri', redirectUri);
			url.searchParams.append('response_type', 'code');
			url.searchParams.append('response_mode', 'query');
			url.searchParams.append('state', checks.state);
			url.searchParams.append('code_challenge', checks.codeChallenge);
			url.searchParams.append('code_challenge_method', 'S256');
			url.searchParams.append('scope', configuration.scopes.join(' '));

			return url;
		},
		createLogoutUrl: (session) => {
			const id_token_hint = session.idToken;
			return {
				url: new URL(
					`/realms/${configuration.realm}/protocol/openid-connect/logout`,
					configuration.base
				),
				body: new URLSearchParams({
					id_token_hint
				})
			};
		},
		createTokenUrl: () =>
			new URL(`/realms/${configuration.realm}/protocol/openid-connect/token`, configuration.base),
		createUserinfoUrl: () =>
			new URL(`/realms/${configuration.realm}/protocol/openid-connect/userinfo`, configuration.base)
	};

	const session = {
		transformTokens: (tokens: TokenRequestResult) => {
			const { id_token, refresh_expires_in } = tokens.body as {
				id_token: string;
				refresh_expires_in: string;
			};

			if (!id_token) {
				throw `tokens response does not include 'id_token'`;
			}

			if (!tokens.accessTokenExpiresAt()) {
				throw `tokens response does not include 'expires_in'`;
			}

			if (!tokens.refreshToken()) {
				throw `tokens response does not include 'refresh_token'`;
			}

			if (!refresh_expires_in) {
				throw `tokens response does not include 'refresh_expires_in'`;
			}

			const refreshExpiresInSeconds = parseInt(refresh_expires_in);

			return {
				idToken: id_token,
				accessToken: tokens.accessToken(),
				refreshToken: tokens.refreshToken(),
				refreshExpiresAt: Date.now() + refreshExpiresInSeconds * 1000,
				accessExpiresAt: tokens.accessTokenExpiresAt().getTime(),
				tokenType: tokens.tokenType()
			};
		},
		validateSession: <T extends KeycloakSession>(session: T) => {
			const payload = parseJWT(session.idToken)[1];

			const claims = new JWTClaims(payload);
			if (claims.issuer() !== authServer.issuer) {
				throw 'Issuer mismatch';
			}

			return session;
		},
		fixSession: callbacks?.fixSession,
		sessionCookieAge:
			callbacks?.sessionCookieAge ||
			((session) => Math.floor((session.refreshExpiresAt - Date.now()) / 1000))
	};

	const resolvers: Resolver<KeycloakSession>[] = [
		redirectUriResolver(),
		localsResolver(),
		loginResolver(),
		async (context, resolve) => {
			if (context.routes.logout.is && context.locals.session) {
				await context.oauth.preLogout(context.locals.session);
			}
			return await resolve();
		},
		logoutResolver(),
		refreshResolver({ eagerRefresh: defaultedOptions.eagerRefresh })
	];

	return provider(authServer, endpoints, session, resolvers);
};
