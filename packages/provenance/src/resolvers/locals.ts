import type { Resolver } from '../types';

export const localsResolver = (): Resolver<any> => (context) => {
	const session = context.session.getCookie();
	context.locals.session = session;
};
