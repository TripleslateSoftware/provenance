const DEFAULT_LAST_PATH_COOKIE_AGE = 60 * 10;

export const r = (options: {
	redirectUriPathname: string;
	loginPathname: string;
	logoutPathname: string;
	lastPathCookieName: string;
}) => {
	return {
		redirectUri: {
			pathname: options.redirectUriPathname
		},
		login: {
			pathname: options.loginPathname
		},
		logout: {
			pathname: options.logoutPathname
		},
		lastPath: {
			/**
			 * get last path from a cookie
			 * @param get
			 * @returns last path if found
			 */
			getCookie(get: (name: string) => string | undefined) {
				return get(options.lastPathCookieName);
			},
			setCookie(set: (name: string, maxAge: number) => void) {
				return set(options.lastPathCookieName, DEFAULT_LAST_PATH_COOKIE_AGE);
			}
		}
	};
};

export type RoutesModule = ReturnType<typeof r>;
