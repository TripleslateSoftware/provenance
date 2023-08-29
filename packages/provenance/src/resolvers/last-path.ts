import { Resolver } from '../types';

export const lastPathResolver = (): Resolver<any> => (context) => {
	context.routes.lastPath.set();
};
