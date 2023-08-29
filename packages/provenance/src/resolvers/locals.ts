import type { Resolver } from '../types.js';

export const localsResolver = (): Resolver<any> => (context) => {
	const session = context.session.getCookie();
	context.locals.session = session;
};
