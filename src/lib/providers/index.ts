import type { ProviderConfiguration } from '$lib/oauth/index.js';

export type Provider<T> = (configuration: T) => ProviderConfiguration;
