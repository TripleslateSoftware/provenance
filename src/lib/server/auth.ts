import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

import { provenance } from '$lib/index.js';
import { github } from '$lib/providers/github.js';
import { GH_CLIENT_ID, GH_CLIENT_SECRET } from '$env/static/private';

export const auth = provenance(
	github({ clientId: GH_CLIENT_ID, clientSecret: GH_CLIENT_SECRET }),
	redirect,
	dev,
	() => {
		return {};
	}
);
