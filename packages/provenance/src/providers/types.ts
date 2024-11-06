import { TokenRequestResult } from '@oslojs/oauth2';

import { Resolver } from '../resolvers';

export type AuthServerConfiguration = {
	issuer: string;
	clientId: string;
	clientSecret: string;
	openid: boolean;
};

export type Checks = {
	state: string;
	codeChallenge: string;
};

export type EndpointsConfiguration = {
	createLoginUrl: (redirectUri: string, checks: Checks) => URL;
	createLogoutUrl: () => URL;
	createTokenUrl: () => URL;
	createUserinfoUrl: () => URL;
};

export type SessionConfiguration<Session> = {
	transformTokens: (tokens: TokenRequestResult) => Session;
	validateSession: <T extends Session>(session: T) => T;
	sessionCookieAge: (session: Session) => number;
	fixSession: (session: Session) => Session;
};

/**
 * @param sessionCookieAge optional callback to set cookie age based on session (in seconds)
 * @param fixSession optional callback to alter field(s) in the session after receiving from auth server
 */
export type ProviderCallbacks<Session> = {
	sessionCookieAge?: (session: Session) => number;
	fixSession?: (session: Session) => Session;
};

export type Provider<Session> = {
	authServer: AuthServerConfiguration;
	endpoints: EndpointsConfiguration;
	session: SessionConfiguration<Session>;
	resolvers: Resolver<Session>[];
};

/**
 * @param configuration OAuth auth server and client configuration (specific to provider)
 * @param callbacks optional callbacks to customize default provider-specific behaviors (ie. alter session values, set the length of the cookie)
 * @returns initialized provider to be passed to the generated runtime
 */
export type CreateProvider<ProviderConfiguration, Session> = (
	configuration: ProviderConfiguration,
	callbacks?: ProviderCallbacks<Session>
) => Provider<Session>;
