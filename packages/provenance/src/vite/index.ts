import path from 'node:path';
import fs from 'node:fs';

import type { Plugin } from 'vite';

import { writeTypes, writeRuntime } from './write';

export function provenance(): Plugin[] {
	const dir = path.resolve('.', '$provenance');

	const plugin: Plugin = {
		name: 'vite-plugin-provenance',
		enforce: 'pre',
		async buildStart() {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}
			writeRuntime(dir);
		},
		// types are only necessary (and not dynamic) for dev mode
		async configureServer() {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}
			writeTypes(dir);
		}
	};
	return [plugin];
}
