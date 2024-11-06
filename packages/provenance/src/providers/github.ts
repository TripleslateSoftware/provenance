import { TokenRequestResult } from '@oslojs/oauth2';

import type { CreateProvider, EndpointsConfiguration } from './types';
import { provider } from './provider';

/**
 * find configuration in github > developer settings > OAuth Apps > application
 */
export type GithubConfiguration = {
	clientId: string;
	clientSecret: string;
	scopes: string[];
};

type GithubSession = {
	accessToken: string;
};

const issuer = 'https://github.com/login/oauth/';

export const github: CreateProvider<GithubConfiguration, GithubSession> = (
	configuration,
	callbacks
) => {
	const authServer = {
		issuer: issuer,
		clientId: configuration.clientId,
		clientSecret: configuration.clientSecret,
		openid: false
	};
	const endpoints: EndpointsConfiguration = {
		createLoginUrl(redirectUri, checks) {
			const url = new URL(`authorize`, issuer);
			url.searchParams.append('client_id', configuration.clientId);
			url.searchParams.append('redirect_uri', redirectUri);
			url.searchParams.append('state', checks.state);
			url.searchParams.append('allow_signup', 'false');
			url.searchParams.append('scope', configuration.scopes.join(' '));

			return url;
		},
		createLogoutUrl() {
			return new URL(`logout`, issuer);
		},
		createTokenUrl() {
			return new URL(`access_token`, issuer);
		},
		createUserinfoUrl() {
			return new URL(`userinfo`, issuer);
		}
	};

	const session = {
		transformTokens: (tokens: TokenRequestResult) => {
			return {
				accessToken: tokens.accessToken()
			};
		},
		fixSession: callbacks?.fixSession,
		sessionCookieAge: callbacks?.sessionCookieAge
	};

	return provider(authServer, endpoints, session);
};
