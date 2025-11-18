import path from 'node:path';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';

import { spawn } from 'child_process';

import type { Plugin } from 'vite';

import { copyTypes, copyJSRuntime, copyTSRuntime } from './write';

const frameworks = ['sveltekit'] as const;
type Framework = (typeof frameworks)[number];

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
	framework: Framework;
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
			framework: 'sveltekit',
			runtime: 'ts'
		};
		return options;
	} else {
		const options: JSOptions = {
			postUpdateRun: o?.postUpdateRun,
			dir: o?.dir ?? 'src/lib/server',
			filename: o?.filename ?? 'PROVENANCE',
			framework: 'sveltekit',
			generateTypes: o?.generateTypes ?? true,
			runtime: 'js'
		};
		return options;
	}
};

const findModule = async (pkg: string, currentLocation: string) => {
	const pathEndingBy = ['node_modules', pkg];

	// Build the first possible location
	let locationFound = path.join(currentLocation, ...pathEndingBy);

	// previousLocation is nothing
	let previousLocation = '';
	const backFolder: string[] = [];

	// if previousLocation !== locationFound that mean that we can go upper
	// if the directory doesn't exist, let's go upper.
	while (previousLocation !== locationFound && !(await fsPromises.stat(locationFound))) {
		// save the previous path
		previousLocation = locationFound;

		// add a back folder
		backFolder.push('../');

		// set the new location
		locationFound = path.join(currentLocation, ...backFolder, ...pathEndingBy);
	}

	if (previousLocation === locationFound) {
		throw 'Could not find any node_modules/@tripleslate/provenance folder';
	}

	return locationFound;
};

const runtimePaths = async (
	framework: Framework
): Promise<{ js: string; declaration: string; ts: string }> => {
	const packageName = '@tripleslate/provenance';
	try {
		const rootPath = process.cwd();

		// check if we are in a PnP environment
		if (process.versions.pnp) {
			// retrieve the PnP API (Yarn injects the `findPnpApi` into `node:module` builtin module in runtime)
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const { findPnpApi } = require('node:module');

			// this will traverse the file system to find the closest `.pnp.cjs` file and return the PnP API based on it
			// normally it will reside at the same level as the cwd, so it is unlikely that traversing the whole file system will happen
			const pnp = findPnpApi(rootPath);

			// this directly returns the ESM export of the corresponding module, thanks to the PnP API
			// it will throw if the module isn't found in the project's dependencies
			const js = path.dirname(
				pnp.resolveRequest(`${packageName}/${framework}/runtime/js`, rootPath, {
					conditions: new Set(['import'])
				})
			);
			const declaration = path.dirname(
				pnp.resolveRequest(`${packageName}/${framework}/runtime/js`, rootPath, {
					conditions: new Set(['types'])
				})
			);
			const ts = path.dirname(
				pnp.resolveRequest(`${packageName}/${framework}/runtime/ts`, rootPath, {
					conditions: new Set(['default'])
				})
			);

			return {
				js,
				declaration,
				ts
			};
		}

		// otherwise we have to hunt the module down relative to the current path
		const packageDirectory = await findModule(packageName, rootPath);

		// load up the package json
		const packageJsonSrc = await fsPromises.readFile(
			path.join(packageDirectory, 'package.json'),
			'utf-8'
		);
		if (!packageJsonSrc) {
			throw 'skip';
		}
		const packageJson = JSON.parse(packageJsonSrc);

		// the esm target to import is defined at exports['.'].import
		if (
			!packageJson.exports?.[`./${framework}/runtime/js`]?.import ||
			!packageJson.exports?.[`./${framework}/runtime/js`]?.types ||
			!packageJson.exports?.[`./${framework}/runtime/ts`]?.default
		) {
			throw 'Exports not found in package.json';
		}

		const js = path.dirname(
			path.join(packageDirectory, packageJson.exports[`./${framework}/runtime/js`].import)
		);
		const declaration = path.dirname(
			path.join(packageDirectory, packageJson.exports[`./${framework}/runtime/js`].types)
		);
		const ts = path.dirname(
			path.join(packageDirectory, packageJson.exports[`./${framework}/runtime/ts`].default)
		);

		return {
			js,
			declaration,
			ts
		};
	} catch (e) {
		console.error(e);

		const err = `Could not find ${packageName}. Are you sure its installed? If so, please open a ticket on GitHub.`;

		throw err;
	}
};

const run = async (o?: Partial<TSOptions | JSOptions>, generateTypes?: boolean) => {
	const options = getDefaultOptions(o);

	const outDir = path.resolve('.', options.dir);

	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir);
	}

	const { ts, js, declaration } = await runtimePaths(options.framework);

	if (options.runtime == 'ts') {
		await copyTSRuntime(ts, outDir, `${options.filename}.${options.runtime}`);
	} else {
		await copyJSRuntime(js, outDir, `${options.filename}.${options.runtime}`);

		if (generateTypes !== false && options.generateTypes) {
			copyTypes(declaration, outDir, `${options.filename}.d.ts`);
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
 *		github({ clientId: GH_CLIENT_ID, clientSecret: GH_CLIENT_SECRET })
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
