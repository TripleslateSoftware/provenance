import { Context } from '../types';

export type Resolver<Session> = (
	context: Context<Session>,
	logging: boolean
) => void | Promise<void>;
