import type { Checks, Provider } from '$lib/types.js';

export type GithubConfiguration = {
	clientId: string;
	clientSecret: string;
};

const issuer = 'https://github.com/login/oauth/';

export const github = (configuration: GithubConfiguration): Provider => {
	return {
		issuer: issuer,
		clientId: configuration.clientId,
		clientSecret: configuration.clientSecret,
		openid: false,
		createLoginUrl(redirectUri: string, checks: Checks) {
			const url = new URL(`authorize`, issuer);
			url.searchParams.append('client_id', configuration.clientId);
			url.searchParams.append('redirect_uri', redirectUri);
			url.searchParams.append('state', checks.state);
			url.searchParams.append('allow_signup', 'false');
			url.searchParams.append('scope', 'read:user');

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
};
