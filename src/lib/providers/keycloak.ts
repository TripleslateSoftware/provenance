import type { Provider } from './index.js';

export type KeycloakConfiguration = {
	base: string;
	realm: string;
	clientId: string;
	clientSecret: string;
};

export const keycloak: Provider<KeycloakConfiguration> = (configuration: KeycloakConfiguration) => {
	return {
		issuer: new URL(`/realms/${configuration.realm}`, configuration.base).toString(),
		clientId: configuration.clientId,
		clientSecret: configuration.clientSecret
	};
};
