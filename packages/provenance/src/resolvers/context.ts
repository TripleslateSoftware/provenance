import type { TokenEndpointResponse } from 'oauth4webapi';

import type { OAuthModule } from '../oauth';

export type Context<Session> = {
	oauth: {
		processAuthResponse: (expectedState: string) => Promise<{
			code: string;
		}>;
		requestToken: (
			codeVerifier: string,
			authorizationCode: string,
			expectedNonce: string
		) => ReturnType<OAuthModule['requestToken']>;
		redirectLogin: () => Promise<void>;
		refresh: (refreshToken: string) => Promise<TokenEndpointResponse>;
		postLogout: (idToken: string) => Promise<void>;
	};
	checks: {
		nonce: {
			use: () => string;
		};
		state: {
			use: () => string;
		};
		pkce: {
			use: () => string;
		};
	};
	session: {
		create: (tokens: TokenEndpointResponse) => Session;
		getCookie: () => Session;
		setCookie: (session: Session) => void;
		deleteCookie: () => void;
	};
	locals: {
		session: Session | null;
	};
	routes: {
		redirectUri: {
			is: boolean;
		};
		login: {
			redirect: () => void;
			is: boolean;
		};
		logout: {
			redirect: () => void;
			is: boolean;
		};
		lastPath: {
			redirect: () => void;
			set: () => void;
		};
		home: {
			redirect: () => void;
			is: boolean;
		};
	};
};
