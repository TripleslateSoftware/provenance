import { Context } from '../types';

export type Resolver<ProviderSession> = <ContextSession extends ProviderSession>(
	context: Context<ContextSession, any>,
	logging: boolean
) => void | Promise<void>;
