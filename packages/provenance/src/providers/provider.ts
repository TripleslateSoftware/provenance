import {
	type Resolver,
	localsResolver,
	loginResolver,
	logoutResolver,
	redirectUriResolver,
	signupResolver
} from '../resolvers';

import {
	AuthServerConfiguration,
	EndpointsConfiguration,
	Provider,
	SessionConfiguration
} from './types';

const DEFAULT_SESSION_COOKIE_AGE = 60 * 10;

/**
 * create a generic provider with auth server configuration, endpoints, and session definition
 *
 * see [github](github.ts) and [keycloak](keycloak.ts) for examples
 */
export const provider = <Session extends object>(
	authServer: AuthServerConfiguration,
	endpoints: EndpointsConfiguration<Session>,
	session: Pick<SessionConfiguration<Session>, 'transformTokens'> &
		Partial<SessionConfiguration<Session>>,
	resolvers?: Resolver<Session>[]
): Provider<Session> => {
	return {
		authServer,
		endpoints,
		session: {
			transformTokens: session.transformTokens,
			validateSession: session.validateSession || ((session) => session),
			sessionCookieAge: session.sessionCookieAge || (() => DEFAULT_SESSION_COOKIE_AGE),
			fixSession: session.fixSession || ((session) => session)
		},
		resolvers: resolvers || [
			redirectUriResolver(),
			localsResolver(),
			loginResolver(),
			signupResolver(),
			logoutResolver()
		]
	};
};
