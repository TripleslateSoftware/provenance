import type { Handle } from '@sveltejs/kit';

type LastPathHandleOptions = { lastPathCookieName: string };

export const lastPath = (options: LastPathHandleOptions) => {
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
