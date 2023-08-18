// import { c } from './checks.js';
// import { HandlesModule, h } from './handles/index.js';
// import { l } from './load.js';
// import { o } from './oauth.js';
// import { s } from './session.js';
// import type { RedirectFn, SessionCallback, Provider, AuthOptions } from './types.js';

// export const provenance = <Session, SessionExtra>(
// 	provider: Provider<Session, SessionExtra>,
// 	createHandles: typeof h,
// 	dev: boolean,
// 	sessionCallback: SessionCallback<Session, SessionExtra>,
// 	logging?: boolean,
// 	options?: Partial<AuthOptions>
// ) => {
// 	const defaultedOptions: AuthOptions = {
// 		redirectUriPathname: '/auth',
// 		sessionCookieName: 'session',
// 		loginPathname: '/login',
// 		logoutPathname: '/logout',
// 		lastPathCookieName: 'last-path',
// 		...options
// 	};

// 	const defaultedLogging = logging || dev;

// 	const checks = c();
// 	const oauth = o({ checks }, provider, defaultedOptions);
// 	const session = s(provider, sessionCallback, defaultedOptions);
// 	const handles = createHandles({ checks, oauth, session }, defaultedLogging, defaultedOptions);

// 	const { handle } = provider.createHandle(
// 		{ handles, oauth, session },
// 		defaultedLogging,
// 		defaultedOptions
// 	);

// 	const loadUtils = l(redirect, {
// 		loginPathname: defaultedOptions.loginPathname
// 	});

// 	return {
// 		handle,
// 		protectRoute: loadUtils.protectRoute,
// 		options: defaultedOptions
// 	};
// };

// // declare global {
// // 	namespace App {
// // 		interface SessionExtra {}
// // 		interface DefaultSession {
// // 			idToken?: string;
// // 			accessToken: string;
// // 			refreshToken?: string;
// // 			refreshExpiresIn?: number;
// // 			accessExpiresAt?: number;
// // 		}
// // 		interface Session {}

// // 		interface Locals {
// // 			session: (Session & DefaultSession & SessionExtra) | null;
// // 		}
// // 	}
// // }
