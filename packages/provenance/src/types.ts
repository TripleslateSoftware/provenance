import type { redirect } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';
import type { TokenEndpointResponse } from 'oauth4webapi';

import { Context } from './resolvers/context';

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

export type SessionCallback<Session, SessionExtra> = (session: Session) => SessionExtra;

export type Checks = {
	state: string;
	nonce: string;
	codeChallenge: string;
};

export type Resolver<Session> = (
	context: Context<Session>,
	logging: boolean
) => void | Promise<void>;

export type Provider<Session> = {
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
	resolvers: Resolver<Session>[];
};

export type Fetch = typeof fetch;
