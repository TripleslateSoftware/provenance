import type { Plugin } from 'vite';
import { generateRuntime } from '../codegen/runtime';
import { writeGlobal } from './write';

const dir = './$provenance/types';

export function provenance(): Plugin {
	return {
		name: 'vite-plugin-provenance',
		enforce: 'pre',
		// async resolveId(id) {
		// 	// treat $provenance as virtual
		// 	if (id === '$provenance') {
		// 		return `\0${id}`;
		// 	}
		// },
		// async load(id) {
		// 	if (id === '\0$provenance') {
		// 		return generateRuntime();
		// 	}
		// },
		async transform(code, id) {
			if (id === '$provenance') {
				writeGlobal(dir);
			}
		}
	};
}
