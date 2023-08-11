import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

import { provenance } from '$lib/index.js';
import { github } from '$lib/providers/github.js';
import { GH_CLIENT_ID } from '$env/static/private';

const auth = provenance(
	github({ clientId: GH_CLIENT_ID, clientSecret: '' }),
	redirect,
	dev,
	(tokens) => {
		return {};
	}
);

export const handle = auth.handle;
