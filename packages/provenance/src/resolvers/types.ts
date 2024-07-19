import { Context } from '../context';

export type Resolver<ProviderSession> = (
	context: Context<ProviderSession, ProviderSession>,
	resolve: () => Response | Promise<Response>,
	logging: boolean
) => Response | Promise<Response>;
