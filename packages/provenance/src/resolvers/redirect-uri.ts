import { logStarter } from '../helpers';
import { Resolver } from './types';

export const redirectUriResolver =
	<ProviderSession extends object>(): Resolver<ProviderSession> =>
	async (context, logging) => {
		if (context.routes.redirectUri.is) {
			if (logging) logStarter('redirectUri');
			try {
				// state stored at beginning of authorization flow (right before login redirects to auth server)
				const state = context.checks.state.use();

				// nonce and code verifier stored at beginning of authorization flow (right before login redirects to auth server)
				const codeVerifier = context.checks.pkce.use();
				const nonce = context.checks.nonce.use();

				// matching state allows this route to ensure the redirect from auth server originated from this application
				// the code returned (in url params) to this redirect uri will be used to get a token set from the oauth2 token endpoint
				const { code } = await context.oauth.processAuthResponse(state);

				// make a request for tokens using the code and the matching code verifier
				// code verifier is required by the auth server to ensure the code matches the originator of the auth request
				// nonce allows this application to ensure that the tokens returned came from the same auth server that the code grant request was initiated with, similar to state
				const tokens = await context.oauth.requestToken(codeVerifier, code, nonce);

				// turn the returned tokens into the session (including user, access token, refresh token)
				const session = context.session.create(tokens);
				context.session.setCookie(session);
			} catch (e) {
				// possibly need to redirect to an auth error page
				console.error('provenance:', e);

				// if any of these checks throw and error (login timed out), we should try the whole process again
				context.routes.lastPath.redirect();
			}

			// redirect to the actual route that the user was trying to access
			context.routes.lastPath.redirect();
		}
	};
