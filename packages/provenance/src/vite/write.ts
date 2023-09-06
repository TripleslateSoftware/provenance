import fs from 'node:fs';

import { generateDeclaration } from './codegen/declaration';
import { generateRuntime } from './codegen/runtime';

export const writeTypes = (dir: string) => {
	fs.writeFileSync(`${dir}/index.d.ts`, generateDeclaration());
};

export const writeRuntime = (dir: string) => {
	fs.writeFileSync(`${dir}/index.js`, generateRuntime());
};
