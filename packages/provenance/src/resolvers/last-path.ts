import { Resolver } from './types';

export const lastPathResolver =
	<Session extends object>(): Resolver<Session> =>
	(context) => {
		context.routes.lastPath.set();
	};
