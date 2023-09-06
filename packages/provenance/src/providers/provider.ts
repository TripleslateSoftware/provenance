import { TokenEndpointResponse } from 'oauth4webapi';

import {
	type Resolver,
	lastPathResolver,
	localsResolver,
	loginResolver,
	logoutResolver,
	redirectUriResolver
} from '../resolvers';

import { AuthServerConfiguration, EndpointsConfiguration, Provider } from './types';

const DEFAULT_SESSION_COOKIE_AGE = 60 * 10;

/**
 * create a generic provider with auth server configuration, endpoints, and session definition
 *
 * see [github](github.ts) and [keycloak](keycloak.ts) for examples
 */
export const provider = <Session extends object>(
	authServer: AuthServerConfiguration,
	endpoints: EndpointsConfiguration,
	session: {
		transformTokens: (tokens: TokenEndpointResponse) => Session;
		sessionCookieAge?: (session: Session) => number;
		fixSession?: (session: Session) => Partial<Session>;
	},
	resolvers?: Resolver<Session>[]
): Provider<Session> => {
	return {
		authServer,
		endpoints,
		session: {
			transformTokens: session.transformTokens,
			sessionCookieAge: session.sessionCookieAge || (() => DEFAULT_SESSION_COOKIE_AGE),
			fixSession:
				session.fixSession ||
				(() => {
					return {};
				})
		},
		resolvers: resolvers || [
			redirectUriResolver(),
			localsResolver(),
			loginResolver(),
			logoutResolver(),
			lastPathResolver()
		]
	};
};
