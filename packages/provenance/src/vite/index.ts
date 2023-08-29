import type { Plugin } from 'vite';

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
		async transform(_code, id) {
			if (id === '$provenance') {
				// this.emitFile({
				// 	type: 'prebuilt-chunk',
				// 	fileName: './src/provenance.d.ts',
				// 	code: globalOutput
				// });
			}
		}
	};
}
