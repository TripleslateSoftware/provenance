import type { Plugin } from 'vite';
import { writeGlobal } from './write';

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
				await writeGlobal(id);
			}
		}
	};
}
