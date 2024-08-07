import type { CookieSerializeOptions } from 'cookie';
import type { TokenEndpointResponse } from 'oauth4webapi';
export type { TokenEndpointResponse };

export type Cookie = {
	name: string;
	value: string;
	options: CookieSerializeOptions & { path: string };
};

export type Cookies = {
	get: (name: string) => string | undefined;
	delete: (
		name: string,
		opts: CookieSerializeOptions & {
			path: string;
		}
	) => void;
};

export type AuthOptions = {
	/** defaults to `/auth` */
	redirectUriPathname?: string;
	/** defaults to `session` */
	sessionCookieName?: string;
	/** defaults to `/login` */
	loginPathname?: string;
	/** defaults to `/logout` */
	logoutPathname?: string;
	/** defaults to `/` */
	homePathname?: string;
};

export type * from './context';
export type * from './modules';
export type * from './providers';
export type * from './resolvers';
