import { Resolver } from '../types';

export const lastPathResolver = (): Resolver<any, any> => (context, logging) => {
	context.routes.lastPath.set();
};
