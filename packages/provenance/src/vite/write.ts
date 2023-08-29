import fs from 'node:fs';
import { generateTypes } from '../codegen/types';
import { generateRuntime1 } from '../codegen/runtime';

export const writeTypes = () => {
	if (!fs.existsSync('./$provenance')) {
		fs.mkdirSync('./$provenance');
	}

	fs.writeFileSync('./$provenance/index.d.ts', generateTypes());
};

export const writeRuntime = () => {
	if (!fs.existsSync('./$provenance')) {
		fs.mkdirSync('./$provenance');
	}

	fs.writeFileSync('./$provenance/index.js', generateRuntime1());
};
