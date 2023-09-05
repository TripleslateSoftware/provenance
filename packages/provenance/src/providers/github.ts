import type { Checks } from '../types';
import { provider } from './provider';

export type GithubConfiguration = {
	clientId: string;
	clientSecret: string;
};

const issuer = 'https://github.com/login/oauth/';

type GithubSession = {
	accessToken: string;
};

/**
 * @param configuration github OAuth application configuration (github > developer settings > OAuth Apps > application)
 * @param sessionCookieAge optional callback to provide cookie age based on session (in seconds)
 * @returns github provider to be passed to the generated runtime
 */
export const github = (
	configuration: GithubConfiguration,
	sessionCookieAge?: (session: GithubSession) => number
) =>
	provider<GithubSession>({
		issuer: issuer,
		clientId: configuration.clientId,
		clientSecret: configuration.clientSecret,
		openid: false,
		endpoints: {
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
		},
		transformTokens(tokens) {
			return {
				accessToken: tokens.access_token
			};
		},
		sessionCookieAge
	});
