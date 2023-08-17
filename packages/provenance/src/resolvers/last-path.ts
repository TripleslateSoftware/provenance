import { RequestEvent } from '@sveltejs/kit';
import { OAuthModule } from '../oauth';
import { RedirectFn } from '../types';
import { LoginResolverOptions } from './login';

export const source = `
	import type { Handle } from '@sveltejs/kit';

	export type LastPathHandleOptions = { lastPathCookieName: string };

	export const lastPathHandle = (options: LastPathHandleOptions) => {
		const handle: Handle = async ({ event, resolve }) => {
			event.cookies.set(options.lastPathCookieName, event.url.pathname, {
				httpOnly: true,
				path: '/',
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 10
			});

			return resolve(event);
		};

		return handle;
	};
`;

export const lastPathResolver = (
	modules: { oauth: OAuthModule },
	redirect: RedirectFn,
	logging: boolean,
	options: LoginResolverOptions
) => {
	const resolve = async (event: RequestEvent) => {
		event.cookies.set(options.lastPathCookieName, event.url.pathname, {
			httpOnly: true,
			path: '/',
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 10
		});
	};

	return resolve;
};
