import { TokenEndpointResponse } from 'oauth4webapi';

import { Resolver } from '../resolvers';

export type AuthServerConfiguration = {
	issuer: string;
	clientId: string;
	clientSecret: string;
	openid: boolean;
};

export type Checks = {
	state: string;
	nonce: string;
	codeChallenge: string;
};

export type EndpointsConfiguration = {
	createLoginUrl: (redirectUri: string, checks: Checks) => URL;
	createLogoutUrl: () => URL;
	createTokenUrl: () => URL;
	createUserinfoUrl: () => URL;
};

export type SessionConfiguration<Session> = {
	transformTokens: (tokens: TokenEndpointResponse) => Session;
	sessionCookieAge: (session: Session) => number;
	fixSession: (session: Session) => Partial<Session>;
};

/**
 * @param sessionCookieAge optional callback to provide cookie age based on session (in seconds)
 * @param fixSession optional callback to alter field(s) in the session
 */
export type ProviderCallbacks<Session> = {
	sessionCookieAge?: (session: Session) => number;
	fixSession?: (session: Session) => Partial<Session>;
};

export type Provider<Session> = {
	authServer: AuthServerConfiguration;
	endpoints: EndpointsConfiguration;
	session: SessionConfiguration<Session>;
	resolvers: Resolver<Session>[];
};

/**
 * @param configuration OAuth auth server and client configuration (specific to provider)
 * @param callbacks OAuth auth server and client configuration (specific to provider)
 * @returns initialized provider to be passed to the generated runtime
 */
export type CreateProvider<ProviderConfiguration, Session> = (
	configuration: ProviderConfiguration,
	callbacks?: ProviderCallbacks<Session>
) => Provider<Session>;
