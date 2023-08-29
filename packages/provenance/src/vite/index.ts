import type { Plugin } from 'vite';
// import { generateRuntime1 } from '../codegen/runtime';
import { writeTypes, writeRuntime } from './write';

export function provenance(): Plugin[] {
	const plugin: Plugin = {
		name: 'vite-plugin-provenance',
		enforce: 'pre',
		// config() {
		// 	return {
		// 		resolve: {
		// 			alias: [{ find: '$provenance', replacement: `$provenance` }]
		// 		}
		// 	};
		// },
		// async resolveId(id) {
		// 	// treat $provenance as virtual
		// 	if (id === '$provenance') {
		// 		return `\0${id}`;
		// 	}
		// },
		// async load(id) {
		// 	if (id === '\0$provenance') {
		// 		return generateRuntime1();
		// 	}
		// },
		async configureServer() {
			writeTypes();
			writeRuntime();
		}
		// async transform(_code, id) {
		// 	if (id === '$provenance') {
		// 		// this.emitFile({
		// 		// 	type: 'prebuilt-chunk',
		// 		// 	fileName: './src/provenance.d.ts',
		// 		// 	code: globalOutput
		// 		// });
		// 		writeTypes(id);
		// 		writeRuntime(id);
		// 	}
		// }
	};
	return [plugin];
}
