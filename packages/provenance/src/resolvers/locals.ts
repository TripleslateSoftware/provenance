import type { Resolver } from '../types.js';

export const localsResolver = (): Resolver<any, any> => (context, logging) => {
	const session = context.session.getCookie();
	context.locals.session = session;
};
