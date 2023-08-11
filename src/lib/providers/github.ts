import type { Provider } from './index.js';

export type GithubConfiguration = {
	clientId: string;
	clientSecret: string;
};

export const github: Provider<GithubConfiguration> = (configuration: GithubConfiguration) => {
	return {
		issuer: new URL('https://github.com/login/oauth').toString(),
		scope: 'read:user',
		clientId: configuration.clientId,
		clientSecret: configuration.clientSecret,
		allow_signup: false
	};
};
