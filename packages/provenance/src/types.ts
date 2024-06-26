import type { CookieSerializeOptions } from 'cookie';
import type { TokenEndpointResponse } from 'oauth4webapi';
export type { TokenEndpointResponse };

import type { OAuthModule } from './modules';

export type Cookie = {
	name: string;
	value: string;
	options: CookieSerializeOptions & { path: string };
};

export type Cookies = {
	get: (name: string) => string | undefined;
	delete: (
		name: string,
		opts: CookieSerializeOptions & {
			path: string;
		}
	) => void;
};

export type AuthOptions = {
	/** defaults to `/auth` */
	redirectUriPathname?: string;
	/** defaults to `session` */
	sessionCookieName?: string;
	/** defaults to `/login` */
	loginPathname?: string;
	/** defaults to `/logout` */
	logoutPathname?: string;
	/** defaults to `/` */
	homePathname?: string;
	/** defaults to `last-path` */
	lastPathCookieName?: string;
};

export type Context<ProviderSession, AppSession> = {
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

export type * from './modules';
export type * from './providers';
export type * from './resolvers';
