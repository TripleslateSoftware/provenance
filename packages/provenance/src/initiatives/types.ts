import { Context } from '../context';

export type Initiative<ProviderSession, AppSession> = <Return>(
	context: Context<ProviderSession, AppSession>
) => Promise<Return>;
