import { sequence } from '@sveltejs/kit/hooks';

import type { ChecksModule } from '../modules/checks.js';
import type { OAuthModule } from '../modules/oauth.js';
import type { SessionModule } from '../modules/session.js';
import type { RedirectFn } from '../types.js';
import { lastPathHandle, type LastPathHandleOptions } from './last-path.js';
import { localsHandle, type LocalsHandleOptions } from './locals.js';
import { loginHandle, type LoginHandleOptions } from './login.js';
import { logoutHandle, type LogoutHandleOptions } from './logout.js';
import { redirectUriHandle, type RedirectUriHandleOptions } from './redirect-uri.js';
import { refreshHandle, type RefreshHandleOptions } from './refresh.js';

export type HandlesOptions = RedirectUriHandleOptions &
	LocalsHandleOptions &
	LoginHandleOptions &
	LogoutHandleOptions &
	RefreshHandleOptions &
	LastPathHandleOptions;

export const h = <Session, SessionExtra>(
	modules: {
		checks: ChecksModule;
		oauth: OAuthModule;
		session: SessionModule<Session, SessionExtra>;
	},

	logging: boolean,
	options: HandlesOptions
) => {
	const { checks, oauth, session } = modules;

	const redirectUri = redirectUriHandle({ checks, oauth, session }, logging, {
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

	return {
		redirectUri,
		locals,
		login,
		logout,
		refresh,
		lastPath
	};
};

export type HandlesModule = {};
