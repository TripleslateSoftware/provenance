import { sveltekit } from '@sveltejs/kit/vite';
import { provenance } from '@tripleslate/provenance/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		provenance({ postUpdateRun: 'npm exec prettier ./src/lib/server/PROVENANCE.ts -- -w' }),
		sveltekit()
	]
});
