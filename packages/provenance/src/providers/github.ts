import type { Checks, Provider } from '../types';
import { provider } from './provider';

export type GithubConfiguration = {
	clientId: string;
	clientSecret: string;
};

const issuer = 'https://github.com/login/oauth/';

type GithubSession = {
	accessToken: string;
};

export const github = <SessionExtra>(
	configuration: GithubConfiguration,
	sessionCallback: (session: GithubSession) => SessionExtra
) =>
	provider<GithubSession, SessionExtra>({
		issuer: issuer,
		clientId: configuration.clientId,
		clientSecret: configuration.clientSecret,
		openid: false,
		sessionCallback,
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
		}
	});
