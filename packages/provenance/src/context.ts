import { TokenRequestResult } from '@oslojs/oauth2';

export type Context<ProviderSession, AppSession> = {
	oauth: {
		processAuthResponse: (expectedState: string) => {
			code: string;
			state: { referrer?: string };
		};
		requestToken: (
			codeVerifier: string,
			authorizationCode: string,
			expectedNonce: string
		) => Promise<TokenRequestResult>;
		referrer: string | null;
		redirectLogin: (referrer: string | null) => void;
		refresh: (refreshToken: string) => Promise<TokenRequestResult>;
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
		create: (tokens: TokenRequestResult) => ProviderSession;
		getCookie: () => AppSession | null;
		setCookie: (session: ProviderSession) => void;
		deleteCookie: () => void;
	};
	locals: {
		get session(): AppSession | null;
		set session(value: AppSession | null);
	};
	routes: {
		redirect: (location: string | URL) => never;
		redirectUri: {
			is: boolean;
		};
		login: {
			redirect: () => never;
			is: boolean;
		};
		logout: {
			redirect: () => never;
			is: boolean;
		};
		home: {
			redirect: () => never;
			is: boolean;
		};
	};
};
