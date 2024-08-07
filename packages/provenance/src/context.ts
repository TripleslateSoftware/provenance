import { TokenEndpointResponse } from 'oauth4webapi';

export type Context<ProviderSession, AppSession> = {
	oauth: {
		processAuthResponse: (expectedState: string) => Promise<{
			code: string;
			state: { referrer?: string };
		}>;
		requestToken: (
			codeVerifier: string,
			authorizationCode: string,
			expectedNonce: string
		) => Promise<TokenEndpointResponse>;
		referrer: string | null;
		redirectLogin: (referrer: string | null) => Promise<void>;
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
		create: (tokens: TokenEndpointResponse) => ProviderSession;
		getCookie: () => AppSession | null;
		setCookie: (session: ProviderSession) => void;
		deleteCookie: () => void;
	};
	locals: {
		get session(): AppSession | null;
		set session(value: AppSession | null);
	};
	routes: {
		redirect: (location: string | URL) => void;
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
		home: {
			redirect: () => void;
			is: boolean;
		};
	};
};
