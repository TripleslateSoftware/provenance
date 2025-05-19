export const r = (options: {
	redirectUriPathname: string;
	loginPathname: string;
	signupPathname: string;
	logoutPathname: string;
	refreshPathname: string;
	homePathname: string;
}) => {
	return {
		redirectUri: {
			pathname: options.redirectUriPathname
		},
		login: {
			pathname: options.loginPathname
		},
		signup: {
			pathname: options.signupPathname
		},
		logout: {
			pathname: options.logoutPathname
		},
		refresh: {
			pathname: options.refreshPathname
		},
		home: {
			pathname: options.homePathname
		}
	};
};

export type RoutesModule = ReturnType<typeof r>;
