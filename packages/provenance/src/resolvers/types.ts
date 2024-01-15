import { Context } from '../types';

export type Resolver<Session> = <ContextSession extends Session>(
	context: Context<ContextSession>,
	logging: boolean
) => void | Promise<void>;
