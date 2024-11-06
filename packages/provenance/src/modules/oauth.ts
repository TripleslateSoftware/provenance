import { TokenRequestResult } from '@oslojs/oauth2';

import { CookieSerializeOptions } from 'cookie';

import type { Provider } from '../providers/types';
import type { ChecksModule } from './checks';

async function processTokensResponse(tokensResponse: Response) {
	const data = await tokensResponse.json();
	if (typeof data !== 'object' || data === null) {
		throw new Error('Unexpected response');
	}
	const result = new TokenRequestResult(data);
	if (result.hasErrorCode()) {
		const error = result.errorCode();
		const errorDescription = result.errorDescription();
		throw new Error(`${error}: ${errorDescription}`);
	}

	return result;
}

export const o = <Session>(
	modules: { checks: ChecksModule<{ referrer?: string }> },
	provider: Provider<Session>,
	options: { redirectUriPathname: string }
) => {
	return {
		/**
		 * create a redirect to the auth server for the user to login
		 * @param redirectUriOrigin origin for redirect uri.. typically the origin of the website that is logging in
		 * @param referrer the path that initiated the login
		 * @param setCookie a callback that will be used to set oauth check values in cookies to be consumed by the redirect uri handler
		 * @returns a sveltekit redirect to the generated auth server url
		 */
		login(
			redirectUriOrigin: string,
			referrer: string | null,
			setCookie: (
				name: string,
				value: string,
				opts: CookieSerializeOptions & { path: string }
			) => void
		) {
			const stateCheck = modules.checks.state.create(referrer ? { referrer } : {});
			const pkceCheck = modules.checks.pkce.create();

			const redirectUri = new URL(options.redirectUriPathname, redirectUriOrigin);

			const url = provider.endpoints.createLoginUrl(redirectUri.toString(), {
				state: stateCheck.state,
				codeChallenge: pkceCheck.codeChallenge
			});

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
				client_id: provider.authServer.clientId,
				client_secret: provider.authServer.clientSecret,
				grant_type: 'refresh_token',
				refresh_token: refreshToken
			});

			return processTokensResponse(response);
		},
		/**
		 * process the redirect from the oauth auth endpoint with a one time authorization code in url params
		 * @param url the url (with params such as code) that the auth server redirects to after user logs in (get from the request event on redirectUri)
		 * @param expectedState state stored in a cookie by this client at the start of the auth flow
		 * @returns one time authorization code to be used with the token endpoint
		 */
		processAuthResponse(url: URL, expectedState: string) {
			// ensure that the url params on the keycloak redirect-to-redirect_uri step of the flow are valid
			const code = url.searchParams.get('code');
			const state = url.searchParams.get('state');

			if (!code) {
				throw `auth response code not found in search params`;
			}

			if (!state) {
				throw `auth response state not found in search params`;
			}

			if (state !== expectedState) {
				throw `auth response state did not match stored expected state`;
			}

			return {
				code,
				state: modules.checks.state.decode(state)
			};
		},
		/**
		 * request a set of tokens from the oauth token endpoint using a one time authorization code
		 * @param fetchRequestToken callback that contains the fetch call
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
			) => Promise<Response>
		) {
			const url = provider.endpoints.createTokenUrl();

			const authorizationCodeGrantResponse = await fetchRequestToken(url, {
				clientId: provider.authServer.clientId,
				clientSecret: provider.authServer.clientSecret,
				redirectUri: options.redirectUriPathname
			});

			return processTokensResponse(authorizationCodeGrantResponse);
		}
	};
};

export type OAuthModule = ReturnType<typeof o>;
