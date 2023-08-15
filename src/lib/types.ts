import type { CookieSerializeOptions } from 'cookie';
import type { redirect } from '@sveltejs/kit';

export type Cookie = {
	name: string;
	value: string;
	options: CookieSerializeOptions;
};

export type Tokens = {
	access_token: string;
	expires_in?: number;
	refresh_expires_in?: number;
	refresh_token?: string;
	token_type: string;
	id_token?: string;
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

export type SessionCallback = (tokens: {
	idToken?: string;
	accessToken: string;
	refreshToken?: string;
}) => App.SessionExtra;

export type Checks = {
	state: string;
	nonce: string;
	codeChallenge: string;
};

export type Provider = {
	issuer: string;
	clientId: string;
	clientSecret: string;
	openid: boolean;
	createLoginUrl(redirectUri: string, checks: Checks): URL;
	createLogoutUrl(): URL;
	createTokenUrl(): URL;
	createUserinfoUrl(): URL;
};
