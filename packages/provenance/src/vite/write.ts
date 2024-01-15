import fs from 'node:fs';

import { generateDeclaration } from './codegen/declaration';
import { generateJSRuntime, generateTSRuntime } from './codegen/runtime';

export const writeTypes = (dir: string, filename: string) => {
	fs.writeFileSync(`${dir}/${filename}`, generateDeclaration());
};

export const writeJSRuntime = (dir: string, filename: string) => {
	fs.writeFileSync(`${dir}/${filename}`, generateJSRuntime());
};

export const writeTSRuntime = (dir: string, filename: string) => {
	fs.writeFileSync(`${dir}/${filename}`, generateTSRuntime());
};
