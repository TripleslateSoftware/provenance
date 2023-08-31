import { Resolver } from '../types';

export const lastPathResolver = (): Resolver<object> => (context) => {
	context.routes.lastPath.set();
};
