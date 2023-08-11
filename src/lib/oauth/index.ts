import type { RequestEvent } from '@sveltejs/kit';
import * as oauth from 'oauth4webapi';

import type { Tokens } from '../types.js';
import { provider } from './provider.js';

type Fetch = typeof fetch;
type TokenRequestParams = { codeVerifier: string; authorizationCode: string; redirectUri: string };

export type ProviderConfiguration = {
	issuer: string;
	clientId: string;
	clientSecret: string;
};

function processTokensResponse(
	tokensResponse: oauth.OAuth2Error | oauth.TokenEndpointResponse
): Tokens {
	if (oauth.isOAuth2Error(tokensResponse)) {
		throw `${tokensResponse.error} ${tokensResponse.error_description}`;
	}

	if (!tokensResponse.id_token) {
		throw `tokens response does not include 'id_token'`;
	}

	if (!tokensResponse.expires_in) {
		throw `tokens response does not include 'expires_in'`;
	}

	if (!tokensResponse.refresh_token) {
		throw `tokens response does not include 'refresh_token'`;
	}

	const refreshExpiresIn = tokensResponse.refresh_expires_in
		? parseInt(tokensResponse.refresh_expires_in.toString())
		: undefined;

	if (!refreshExpiresIn) {
		throw `tokens response does not include 'refresh_expires_in'`;
	}

	return {
		access_token: tokensResponse.access_token,
		expires_in: tokensResponse.expires_in,
		refresh_expires_in: refreshExpiresIn,
		id_token: tokensResponse.id_token,
		refresh_token: tokensResponse.refresh_token,
		token_type: tokensResponse.token_type
	};
}

export const o = (configuration: ProviderConfiguration) => {
	const authorizationServer = {
		issuer: configuration.issuer
	};
	const client = {
		client_id: configuration.clientId,
		client_secret: configuration.clientSecret
	};
	return {
		/**
		 * create a redirect to the auth server for the user to login
		 * @param event
		 * @param redirectUri redirect uri that the auth server will redirect to with the grant code
		 * @returns a sveltekit redirect to the generated auth server url
		 */
		async login(event: RequestEvent, redirectUri: string) {
			const { url, cookies } = await provider.createLoginUrl(configuration, redirectUri, {});

			event.cookies.set(cookies.nonce.name, cookies.nonce.value, cookies.nonce.options);
			event.cookies.set(cookies.state.name, cookies.state.value, cookies.state.options);
			event.cookies.set(cookies.pkce.name, cookies.pkce.value, cookies.pkce.options);

			return url.toString();
		},
		/**
		 * post to the oauth logout endpoint to destroy the oauth session (not the session stored in the cookies)
		 * @param fetch
		 * @param idToken idToken as stored in session
		 */
		async logout(fetch: Fetch, idToken: string) {
			const url = provider.createLogoutUrl(configuration);

			await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					id_token_hint: idToken
				})
			});
		},
		/**
		 * post to the oauth token endpoint to request a new set of tokens
		 * @param fetch
		 * @param refreshToken refreshToken as stored in session
		 * @returns fresh tokens
		 */
		async refresh(fetch: Fetch, refreshToken: string): Promise<Tokens> {
			const url = provider.createTokenUrl(configuration);

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					client_id: configuration.clientId,
					client_secret: configuration.clientSecret,
					grant_type: 'refresh_token',
					refresh_token: refreshToken
				})
			});

			const tokensResponse = await oauth.processRefreshTokenResponse(
				authorizationServer,
				client,
				response
			);

			return processTokensResponse(tokensResponse);
		},
		/**
		 * process the redirect from the oauth auth endpoint with a one time authorization code in url params
		 * @param url the url (with params such code) that the auth server redirects to after user logs in (get from the request event on redirectUri)
		 * @param expectedState state stored in a cookie by this client at the start of the auth flow
		 * @returns one time authorization code to be used with the token endpoint
		 */
		async processAuthResponse(url: URL, expectedState: string) {
			// ensure that the url params on the keycloak redirect-to-redirect_uri step of the flow are valid
			const params = oauth.validateAuthResponse(authorizationServer, client, url, expectedState);

			if (oauth.isOAuth2Error(params)) {
				throw `${params.error} ${params.error_description}`;
			}

			const code = params.get('code');

			if (!code) {
				throw `code not found in search params`;
			}

			return {
				code
			};
		},
		/**
		 * request a set of tokens from the oauth token endpoint using a one time authorization code
		 * @param fetch
		 * @param params required params to send along that the token endpoint will use to verify the grant
		 * @param expectedNone nonce stored in a cookie by this client at the start of the auth flow
		 * @returns brand new tokens
		 */
		async requestToken(fetch: Fetch, params: TokenRequestParams, expectedNonce: string) {
			const url = provider.createTokenUrl(configuration);

			const authorizationCodeGrantResponse = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					client_id: configuration.clientId,
					redirect_uri: params.redirectUri,
					grant_type: 'authorization_code',
					code: params.authorizationCode,
					code_verifier: params.codeVerifier
				})
			});

			const tokensResponse = await oauth.processAuthorizationCodeOpenIDResponse(
				authorizationServer,
				client,
				authorizationCodeGrantResponse,
				expectedNonce
			);

			return processTokensResponse(tokensResponse);
		},
		async requestUserinfo(fetch: Fetch, idToken: string) {
			const url = provider.createTokenUrl(configuration);

			return await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${idToken}`
				}
			});
		}
	};
};

export type OAuthModule = ReturnType<typeof o>;
