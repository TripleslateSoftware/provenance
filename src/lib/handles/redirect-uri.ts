import type { Handle } from '@sveltejs/kit';

import type { RedirectFn } from '../types.js';
import type { SessionModule } from '../session/index.js';

import type { OAuthModule } from '../oauth/index.js';
import { checks } from '../oauth/checks.js';

type RedirectUriOptions = {
	redirectUriPathname: string;
	sessionCookieName: string;
	lastPathCookieName: string;
};

export const redirectUri = (
	o: OAuthModule,
	s: SessionModule,
	redirect: RedirectFn,
	logging: boolean,
	options: RedirectUriOptions
) => {
	const handle: Handle = async ({ event, resolve }) => {
		if (event.url.pathname.startsWith(options.redirectUriPathname)) {
			if (logging) console.log('provenance:', 'redirectUri');
			// state stored at beginning of authorization flow (right before login redirects to auth server)
			const state = checks.state.use(event.cookies);

			// nonce and code verifier stored at beginning of authorization flow (right before login redirects to auth server)
			const codeVerifier = checks.pkce.use(event.cookies);
			const nonce = checks.nonce.use(event.cookies);

			try {
				// matching state allows this route to ensure the redirect from auth server originated from this application
				// the code returned (in url params) to this redirect uri will be used to get a token set from the oauth2 token endpoint
				const { code } = await o.processAuthResponse(event.url, state);

				// make a request for tokens using the code and the matching code verifier
				// code verifier is required by the auth server to ensure the code matches the originator of the auth request
				// nonce allows this application to ensure that the tokens returned came from the same auth server that the code grant request was initiated with, similar to state
				const tokens = await o.requestToken(
					event.fetch,
					{
						codeVerifier: codeVerifier,
						authorizationCode: code,
						redirectUri: new URL(options.redirectUriPathname, event.url.origin).toString()
					},
					nonce
				);

				// turn the returned tokens into the session (including user, access token, refresh token)
				const session = s.create(tokens);
				s.setCookie(event.cookies, options.sessionCookieName, session);
			} catch (e) {
				// possibly need to redirect to an auth error page
				console.error(e);
			}

			// redirect to the actual route that the user was trying to access
			const lastPath = event.cookies.get(options.lastPathCookieName);
			throw redirect(303, lastPath || '/');
		}

		return resolve(event);
	};

	return handle;
};
