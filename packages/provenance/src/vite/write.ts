import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { format as formatPath } from 'path';
import { addGlobal } from '../codegen/global';

export const writeGlobal = (dir: string) => {
	// if (!existsSync('./$provenance')) {
	// 	mkdirSync('./$provenance');
	// }
	// if (!existsSync('./$provenance/types')) {
	// 	mkdirSync('./$provenance/types');
	// }

	writeFileSync(formatPath({ dir: './src', base: 'provenance.d.ts' }), addGlobal());
};
