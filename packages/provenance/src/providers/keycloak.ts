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

import { TokenEndpointResponse } from 'oauth4webapi';

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
};

type KeycloakSession = {
	accessToken: string;
	refreshToken: string;
	idToken: string;
	refreshExpiresAt: number;
	accessExpiresAt: number;
	tokenType: string;
};

const expiresInToExpiresAt = (expiresIn: number) => Math.floor(Date.now() / 1000 + expiresIn);
const expiresAtToExpiresIn = (expiresAt: number) => Math.floor(expiresAt - Date.now() / 1000);

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
	const endpoints: EndpointsConfiguration = {
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
			url.searchParams.append('nonce', checks.nonce);
			url.searchParams.append('code_challenge', checks.codeChallenge);
			url.searchParams.append('code_challenge_method', 'S256');
			url.searchParams.append('scope', 'openid profile email');

			return url;
		},
		createLogoutUrl: () =>
			new URL(`/realms/${configuration.realm}/protocol/openid-connect/logout`, configuration.base),
		createTokenUrl: () =>
			new URL(`/realms/${configuration.realm}/protocol/openid-connect/token`, configuration.base),
		createUserinfoUrl: () =>
			new URL(`/realms/${configuration.realm}/protocol/openid-connect/userinfo`, configuration.base)
	};

	const session = {
		transformTokens: (tokens: TokenEndpointResponse) => {
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

			const refreshExpiresIn = parseInt(tokens.refresh_expires_in.toString());

			return {
				idToken: tokens.id_token,
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token,
				refreshExpiresAt: expiresInToExpiresAt(refreshExpiresIn),
				accessExpiresAt: expiresInToExpiresAt(tokens.expires_in),
				tokenType: tokens.token_type
			};
		},

		fixSession: callbacks?.fixSession,
		sessionCookieAge:
			callbacks?.sessionCookieAge || ((session) => expiresAtToExpiresIn(session.refreshExpiresAt))
	};

	const resolvers: Resolver<KeycloakSession>[] = [
		redirectUriResolver(),
		localsResolver(),
		loginResolver(),
		async (context, resolve) => {
			if (context.routes.logout.is && context.locals.session) {
				await context.oauth.postLogout(context.locals.session.idToken);
			}
			return await resolve();
		},
		logoutResolver(),
		refreshResolver({ eagerRefresh: defaultedOptions.eagerRefresh })
	];

	return provider(authServer, endpoints, session, resolvers);
};
