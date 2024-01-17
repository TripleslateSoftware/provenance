import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'child_process';

import type { Plugin } from 'vite';

import { writeTypes, writeJSRuntime, writeTSRuntime } from './write';

type BaseOptions = {
	/**
	 * run any command after an update of some routes.
	 *
	 * @example
	 * ```ts
	 * 'npm exec prettier ./src/lib/server/PROVENANCE.ts -- -w'
	 * ```
	 */
	postUpdateRun: string | undefined;
	dir: string;
	filename: string;
};

export type TSOptions = BaseOptions & {
	runtime: 'ts';
};

export type JSOptions = BaseOptions & {
	generateTypes: boolean;
	runtime: 'js';
};

const getDefaultOptions = (o?: Partial<TSOptions | JSOptions>): TSOptions | JSOptions => {
	if (o?.runtime != 'js') {
		const options: TSOptions = {
			postUpdateRun: o?.postUpdateRun,
			dir: o?.dir ?? 'src/lib/server',
			filename: o?.filename ?? 'PROVENANCE',
			runtime: 'ts'
		};
		return options;
	} else {
		const options: JSOptions = {
			postUpdateRun: o?.postUpdateRun,
			dir: o?.dir ?? 'src/lib/server',
			filename: o?.filename ?? 'PROVENANCE',
			generateTypes: o?.generateTypes ?? true,
			runtime: 'js'
		};
		return options;
	}
};

const run = async (o?: Partial<TSOptions | JSOptions>, generateTypes?: boolean) => {
	const options = getDefaultOptions(o);

	const dir = path.resolve('.', options.dir);

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	if (options.runtime == 'ts') {
		writeTSRuntime(dir, `${options.filename}.${options.runtime}`);
	} else {
		writeJSRuntime(dir, `${options.filename}.${options.runtime}`);

		if (generateTypes !== false && options.generateTypes) {
			writeTypes(dir, `${options.filename}.d.ts`);
		}
	}

	if (options.postUpdateRun) {
		const child = spawn(options.postUpdateRun, { shell: true });

		const exitPromise = new Promise<void>((resolve) => {
			child.on('close', () => resolve());
		});

		await exitPromise;
	}
};

/**
 * ### register this plugin in vite config
 *
 * `vite.config.[ts|js]`
 * ```ts title="vite.config.[ts|js]"
 *	import { sveltekit } from '@sveltejs/kit/vite';
 *	import { provenance } from '@tripleslate/provenance/vite';
 *	import { defineConfig } from 'vite';

 *	export default defineConfig({
 *		plugins: [provenance(), sveltekit()]
 *	});
 * ```
 * 
 * ### create an auth object that provides a handle hook and a function to protect routes
 *
 * `src/lib/server/auth.ts`
 * ```ts title="src/lib/server/auth.ts"
 *	import { provenance } from './PROVENANCE';
 *	import { github } from '@tripleslate/provenance/providers';
 *
 *	import { GH_CLIENT_ID, GH_CLIENT_SECRET } from '$env/static/private';
 *
 *	export const auth = provenance(
 *		github({ clientId: GH_CLIENT_ID, clientSecret: GH_CLIENT_SECRET }),
 *		() => {
 *			return {}
 *		}
 *	);
 * ```
 * 
 * ### register the handle provided by the auth object
 * 
 * `src/hooks.server.ts`
 * ```ts title="hooks.server.ts"
 *	import { auth } from '$lib/server/auth';
 *
 *	export const handle = auth.handle;
 * ```
 *
 * `handle` will programmatically create 3 routes:
 * - `redirectUri` to handle redirects from the auth server as part of the oauth authorization flow
 * - `login` to redirect the user to the proper oauth url when navigated
 * - `logout` to destroy the oauth and cookie session when navigated
 *
 * other handle functionality will manage session cookies, provide session in locals, refresh an access token,
 * and keep track of the last path to which the user navigated (for redirecting back to protected routes after authenticating)
 *
 * ### protect server routes in load functions
 * 
 * `src/routes/protected/+page.server.ts`
 * ```ts title="src/routes/protected/+page.server.ts"
 *	import { auth } from '$lib/server/auth';
 *	import { PageServerLoad } from './types'
 *
 *	export const load: PageServerLoad = async (event) => {
 *		const session = await auth.protectRoute(event);
 *	};
 * ```
 * 
 * `auth.protectRoute` can be awaited in `+page.server.ts` load functions to send the user to the login route if a session is required
 */
export function provenance(o?: Partial<TSOptions | JSOptions>): Plugin[] {
	return [
		{
			name: 'vite-plugin-provenance',
			enforce: 'pre',
			async buildStart() {
				run(o, false);
			},
			// types are only necessary (and not dynamic) for dev mode
			async configureServer() {
				run(o);
			}
		}
	];
}
