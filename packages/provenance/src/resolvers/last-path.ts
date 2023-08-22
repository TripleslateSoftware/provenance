import { Resolver } from '../types';

export const lastPathResolver = (): Resolver<any> => (context, logging) => {
	context.routes.lastPath.set();
};
