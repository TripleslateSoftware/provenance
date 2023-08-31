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

export type ProviderConfiguration<Session> = {
	issuer: string;
	clientId: string;
	clientSecret: string;
	openid: boolean;

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

export const provider = <Session extends object>(
	configuration: ProviderConfiguration<Session>
): Provider<Session> => {
	return {
		issuer: configuration.issuer,
		clientId: configuration.clientId,
		clientSecret: configuration.clientSecret,
		openid: configuration.openid,
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
