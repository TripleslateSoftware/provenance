export const li = (options: { loginPathname: string }) => {
	return {
		pathname: options.loginPathname
	};
};

export type LoginModule = ReturnType<typeof li>;
