import * as oauth from 'oauth4webapi';

import type { Provider } from '../types.js';
import type { ChecksModule } from './checks.js';

import { CookieSerializeOptions } from 'cookie';

function processTokensResponse(tokensResponse: oauth.OAuth2Error | oauth.TokenEndpointResponse) {
	if (oauth.isOAuth2Error(tokensResponse)) {
		throw `${tokensResponse.error} ${tokensResponse.error_description}`;
	}

	return tokensResponse;
}

export const o = <Session, SessionExtra>(
	modules: { checks: ChecksModule },
	provider: Provider<Session, SessionExtra>,
	options: { redirectUriPathname: string }
) => {
	const authorizationServer = {
		issuer: provider.issuer
	};
	const client = {
		client_id: provider.clientId,
		client_secret: provider.clientSecret
	};
	return {
		/**
		 * create a redirect to the auth server for the user to login
		 * @param event
		 * @param redirectUri redirect uri that the auth server will redirect to with the grant code
		 * @returns a sveltekit redirect to the generated auth server url
		 */
		async login(
			redirectUriOrigin: string,
			setCookie: (name: string, value: string, opts?: CookieSerializeOptions | undefined) => void
		) {
			// TODO: do something with state data
			const stateCheck = modules.checks.state.create({});
			const nonceCheck = modules.checks.nonce.create();
			const pkceCheck = await modules.checks.pkce.create();

			const redirectUri = new URL(options.redirectUriPathname, redirectUriOrigin).toString();

			const url = provider.endpoints.createLoginUrl(redirectUri, {
				state: stateCheck.state,
				nonce: nonceCheck.nonce,
				codeChallenge: pkceCheck.codeChallenge
			});

			setCookie(nonceCheck.cookie.name, nonceCheck.cookie.value, nonceCheck.cookie.options);
			setCookie(stateCheck.cookie.name, stateCheck.cookie.value, stateCheck.cookie.options);
			setCookie(pkceCheck.cookie.name, pkceCheck.cookie.value, pkceCheck.cookie.options);

			return url.toString();
		},
		/**
		 * post to the oauth logout endpoint to destroy the oauth session (not the session stored in the cookies)
		 * @param fetch
		 * @param idToken idToken as stored in session
		 */
		async logout(fetch: (url: URL) => Promise<Response>) {
			const url = provider.endpoints.createLogoutUrl();

			await fetch(url);
		},
		/**
		 * post to the oauth token endpoint to request a new set of tokens
		 * @param fetch
		 * @param refreshToken refreshToken as stored in session
		 * @returns fresh tokens
		 */
		async refresh(
			fetchRefreshedToken: (
				url: URL,
				body: {
					client_id: string;
					client_secret: string;

					grant_type: 'refresh_token';
					refresh_token: string;
				}
			) => Promise<Response>,
			refreshToken: string
		) {
			const url = provider.endpoints.createTokenUrl();

			const response = await fetchRefreshedToken(url, {
				client_id: provider.clientId,
				client_secret: provider.clientSecret,
				grant_type: 'refresh_token',
				refresh_token: refreshToken
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
		async requestToken(
			fetchRequestToken: (
				url: URL,
				params: {
					clientId: string;
					clientSecret: string;
					redirectUri: string;
				}
			) => Promise<Response>,
			expectedNonce: string
		) {
			const url = provider.endpoints.createTokenUrl();

			const authorizationCodeGrantResponse = await fetchRequestToken(url, {
				clientId: provider.clientId,
				clientSecret: provider.clientSecret,
				redirectUri: options.redirectUriPathname
			});

			if (provider.openid) {
				const tokensResponse = await oauth.processAuthorizationCodeOpenIDResponse(
					authorizationServer,
					client,
					authorizationCodeGrantResponse,
					expectedNonce
				);
				return processTokensResponse(tokensResponse);
			} else {
				const tokensResponse = await oauth.processAuthorizationCodeOAuth2Response(
					authorizationServer,
					client,
					authorizationCodeGrantResponse
				);
				return processTokensResponse(tokensResponse);
			}
		}
	};
};

export type OAuthModule = ReturnType<typeof o>;
