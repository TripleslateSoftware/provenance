import fs from 'node:fs';

import { generateTypes } from './codegen/types';

export const writeTypes = (dir: string) => {
	fs.writeFileSync(`${dir}/ambient.d.ts`, generateTypes());
};
