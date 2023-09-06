import { lastPathResolver } from './last-path';
import { localsResolver } from './locals';
import { loginResolver } from './login';
import { logoutResolver } from './logout';
import { redirectUriResolver } from './redirect-uri';
import { refreshResolver } from './refresh';

export {
	lastPathResolver,
	localsResolver,
	loginResolver,
	logoutResolver,
	redirectUriResolver,
	refreshResolver
};

export type { Resolver } from './types';
