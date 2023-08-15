import { sequence } from '@sveltejs/kit/hooks';

import { redirectUriHandle, type RedirectUriHandleOptions } from './redirect-uri.js';
import { localsHandle, type LocalsHandleOptions } from './locals.js';
import { loginHandle, type LoginHandleOptions } from './login.js';
import { logoutHandle, type LogoutHandleOptions } from './logout.js';
import { refreshHandle, type RefreshHandleOptions } from './refresh.js';
import { lastPathHandle, type LastPathHandleOptions } from './last-path.js';

import type { RedirectFn } from '$lib/types.js';
import type { SessionModule } from '$lib/session.js';
import type { OAuthModule } from '$lib/oauth.js';
import type { ChecksModule } from '$lib/checks.js';

export type HandlesOptions = RedirectUriHandleOptions &
	LocalsHandleOptions &
	LoginHandleOptions &
	LogoutHandleOptions &
	RefreshHandleOptions &
	LastPathHandleOptions;

export const h = (
	modules: { checks: ChecksModule; oauth: OAuthModule; session: SessionModule },
	redirect: RedirectFn,
	logging: boolean,
	options: HandlesOptions
) => {
	const { checks, oauth, session } = modules;

	const redirectUri = redirectUriHandle({ checks, oauth, session }, redirect, logging, {
		redirectUriPathname: options.redirectUriPathname,
		sessionCookieName: options.sessionCookieName,
		lastPathCookieName: options.lastPathCookieName
	});

	const locals = localsHandle(
		{ session },
		{
			sessionCookieName: options.sessionCookieName
		}
	);

	const login = loginHandle({ oauth }, redirect, logging, {
		loginPathname: options.loginPathname,
		lastPathCookieName: options.lastPathCookieName,
		redirectUriPathname: options.redirectUriPathname
	});

	const logout = logoutHandle({ oauth, session }, redirect, logging, {
		logoutPathname: options.logoutPathname,
		lastPathCookieName: options.lastPathCookieName,
		sessionCookieName: options.sessionCookieName
	});

	const refresh = refreshHandle({ oauth, session }, redirect, logging, {
		loginPathname: options.loginPathname,
		sessionCookieName: options.sessionCookieName
	});

	const lastPath = lastPathHandle({
		lastPathCookieName: options.lastPathCookieName
	});

	return { handle: sequence(redirectUri, locals, login, logout, refresh, lastPath) };
};
