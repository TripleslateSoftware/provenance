import type { Plugin } from 'vite';
import { addGlobal } from '../codegen/global';

export function provenance(): Plugin {
	return {
		name: 'vite-plugin-provenance',
		enforce: 'pre',
		async resolveId(id) {
			// treat $env/static/[public|private] as virtual
			if (id === '$provenance') {
				return `\0${id}`;
			}
		},
		async load(id) {
			if (id === '\0$provenance') {
				return addGlobal();
			}
		},
		async transform(code, id) {
			if (id == 'src/server/auth.ts') {
				const transformed = code;
				return {
					code: code,
					map: null
				};
			}
		}
	};
}
