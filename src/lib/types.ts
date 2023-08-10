import type { CookieSerializeOptions } from 'cookie';
import type { redirect } from '@sveltejs/kit';

export type Cookie = {
	name: string;
	value: string;
	options: CookieSerializeOptions;
};

export type Tokens = {
	access_token: string;
	expires_in: number;
	refresh_expires_in: number;
	refresh_token: string;
	token_type: string;
	id_token: string;
};

export type RedirectFn = typeof redirect;
