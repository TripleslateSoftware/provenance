import type { Handle, redirect } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';
import type { TokenEndpointResponse } from 'oauth4webapi';

import { ChecksModule } from './checks';
import { HandlesOptions, HandlesModule } from './handles';
import { OAuthModule } from './oauth';
import { SessionModule } from './session';
import { Context } from './resolvers';

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

export type RedirectFn = typeof redirect;

export type SessionCallback<Session, SessionExtra> = (session: Session) => SessionExtra;

export type Checks = {
	state: string;
	nonce: string;
	codeChallenge: string;
};

export type Provider<Session, SessionExtra> = {
	issuer: string;
	clientId: string;
	clientSecret: string;
	openid: boolean;
	createLoginUrl(redirectUri: string, checks: Checks): URL;
	createLogoutUrl(): URL;
	createTokenUrl(): URL;
	createUserinfoUrl(): URL;
	transformTokens: (tokens: TokenEndpointResponse) => Session;
	sessionCookieAge?: (session: Session) => number;
	createHandle: (
		modules: {
			handles: HandlesModule;
			oauth: OAuthModule;
			session: SessionModule<Session, SessionExtra>;
		},
		logging: boolean,
		options: HandlesOptions
	) => { handle: Handle };
	resolvers: () => {
		logout: (context: Context<Session, SessionExtra>, logging: boolean) => {};
	};
};

export type Fetch = typeof fetch;
