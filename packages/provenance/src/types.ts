import type { CookieSerializeOptions } from 'cookie';
import type { TokenEndpointResponse } from 'oauth4webapi';

import type { OAuthModule } from './modules';

export type Cookie = {
	name: string;
	value: string;
	options: CookieSerializeOptions;
};

export type AuthOptions = {
	/** defaults to `/auth` */
	redirectUriPathname: string;
	/** defaults to `session` */
	sessionCookieName: string;
	/** defaults to `/login` */
	loginPathname: string;
	/** defaults to `/logout` */
	logoutPathname: string;
	/** defaults to `last-path` */
	lastPathCookieName: string;
};

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
		get session(): Session;
		set session(value: Session);
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
