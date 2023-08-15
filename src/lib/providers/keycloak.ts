import type { Checks, Provider } from '$lib/types.js';

export type KeycloakConfiguration = {
	base: string;
	realm: string;
	clientId: string;
	clientSecret: string;
};

export const keycloak = (configuration: KeycloakConfiguration): Provider => {
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
		}
	};
};
