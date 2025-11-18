import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import unusedImports from 'eslint-plugin-unused-imports';
import ts from 'typescript-eslint';

export default defineConfig(
	globalIgnores([
		'**/.DS_Store',
		'**/node_modules',
		'**/build',
		'**/.svelte-kit',
		'**/package',
		'**/dist',
		'**/.env',
		'**/.env.*',
		'!**/.env.example',
		'**/vite.config.js.*',
		'**/vite.config.ts.*',
		'**/pnpm-lock.yaml',
		'**/pnpm-workspace.yaml',
		'**/package-lock.json',
		'**/.changeset',
		'**/.vercel'
	]),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,

	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
			'@typescript-eslint/no-explicit-any': ['warn']
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		},
		rules: {
			'svelte/no-at-html-tags': ['warn'],
			'svelte/valid-compile': ['warn'],
			// TODO: the following only apply to svelte 5
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/require-store-reactive-access': 'off',
			'svelte/require-each-key': 'off',
			'svelte/prefer-svelte-reactivity': 'off',
			'svelte/no-reactive-reassign': 'off'
		}
	},
	{
		plugins: {
			'unused-imports': unusedImports
		},
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: `^_|$$`,
					args: 'after-used',
					argsIgnorePattern: `^_|$$`
				}
			]
		}
	}
);
