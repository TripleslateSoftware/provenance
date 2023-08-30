import path from 'node:path';
import fs from 'node:fs';

import type { Plugin } from 'vite';

import { writeTypes } from './write';
import { generateRuntime } from './codegen/runtime';

export function provenance(): Plugin[] {
	const dir = path.resolve('.', '$provenance');

	const plugin: Plugin = {
		name: 'vite-plugin-provenance',
		enforce: 'pre',
		async resolveId(id) {
			// treat $provenance as virtual
			if (id === '$provenance') {
				return `\0${id}`;
			}
		},
		async load(id) {
			if (id === '\0$provenance') {
				return generateRuntime();
			}
		},
		async configureServer() {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}
			writeTypes(dir);
		}
	};
	return [plugin];
}
