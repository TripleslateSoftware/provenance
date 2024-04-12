import path from 'node:path';
import fs from 'node:fs/promises';

export const copyTypes = async (runtimeDir: string, dir: string, filename: string) => {
	await fs.copyFile(path.join(runtimeDir, 'js.d.ts'), path.join(dir, filename));
};

export const copyJSRuntime = async (runtimeDir: string, dir: string, filename: string) => {
	await fs.copyFile(path.join(runtimeDir, 'js.js'), path.join(dir, filename));
};

export const copyTSRuntime = async (runtimeDir: string, dir: string, filename: string) => {
	await fs.copyFile(path.join(runtimeDir, 'ts.ts'), path.join(dir, filename));
};
