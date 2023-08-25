import type { TokenEndpointResponse } from 'oauth4webapi';

import type { Checks, Provider, Resolver } from '../types';
import {
	lastPathResolver,
	localsResolver,
	loginResolver,
	logoutResolver,
	redirectUriResolver
} from '../resolvers';

const DEFAULT_SESSION_COOKIE_AGE = 60 * 10;

export type ProviderConfiguration<Session, SessionExtra> = {
	issuer: string;
	clientId: string;
	clientSecret: string;
	openid: boolean;
	/** use session data (determined by provider) to return extra information to be stored in the session cookie */
	sessionCallback: (session: Session) => SessionExtra;
	endpoints: {
		createLoginUrl: (redirectUri: string, checks: Checks) => URL;
		createLogoutUrl: () => URL;
		createTokenUrl: () => URL;
		createUserinfoUrl: () => URL;
	};
	transformTokens: (tokens: TokenEndpointResponse) => Session;
	sessionCookieAge?: (session: Session) => number;
	resolvers?: Resolver<Session>[];
};

export const provider = <Session, SessionExtra>(
	configuration: ProviderConfiguration<Session, SessionExtra>
): Provider<Session, SessionExtra> => {
	return {
		issuer: configuration.issuer,
		clientId: configuration.clientId,
		clientSecret: configuration.clientSecret,
		openid: configuration.openid,
		sessionCallback: configuration.sessionCallback,
		endpoints: configuration.endpoints,
		transformTokens: configuration.transformTokens,
		sessionCookieAge: configuration.sessionCookieAge || (() => DEFAULT_SESSION_COOKIE_AGE),
		resolvers: configuration.resolvers || [
			redirectUriResolver(),
			localsResolver(),
			loginResolver(),
			logoutResolver(),
			lastPathResolver()
		]
	};
};
