import fs from 'node:fs';

import { generateTypes } from './codegen/types';
import { generateRuntime } from './codegen/runtime';

export const writeTypes = (dir: string) => {
	fs.writeFileSync(`${dir}/index.d.ts`, generateTypes());
};

export const writeRuntime = (dir: string) => {
	fs.writeFileSync(`${dir}/index.js`, generateRuntime());
};
