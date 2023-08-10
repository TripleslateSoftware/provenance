import type { ProviderConfiguration } from './index.js';
import { checks } from './checks.js';

export const provider = {
	async createLoginUrl(provider: ProviderConfiguration, redirectUri: string, stateData: object) {
		const stateCheck = checks.state.create(stateData);
		const nonceCheck = checks.nonce.create();
		const pkceCheck = await checks.pkce.create();

		const url = new URL(`/protocol/openid-connect/auth`, provider.issuer);
		url.searchParams.append('client_id', provider.clientId);
		url.searchParams.append('redirect_uri', redirectUri);
		url.searchParams.append('response_type', 'code');
		url.searchParams.append('response_mode', 'query');
		url.searchParams.append('state', stateCheck.state);
		url.searchParams.append('nonce', nonceCheck.nonce);
		url.searchParams.append('code_challenge', pkceCheck.codeChallenge);
		url.searchParams.append('code_challenge_method', 'S256');
		url.searchParams.append('scope', 'openid profile email');

		return {
			url,
			cookies: {
				state: stateCheck.cookie,
				nonce: nonceCheck.cookie,
				pkce: pkceCheck.cookie
			}
		};
	},
	createLogoutUrl(kc: ProviderConfiguration) {
		return new URL(`/protocol/openid-connect/logout`, kc.issuer);
	},
	createTokenUrl(kc: ProviderConfiguration) {
		return new URL(`/protocol/openid-connect/token`, kc.issuer);
	},
	createUserinfoUrl(kc: ProviderConfiguration) {
		return new URL(`/protocol/openid-connect/userinfo`, kc.issuer);
	}
};
