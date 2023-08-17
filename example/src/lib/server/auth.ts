import { provenance } from '$provenance';
import { github, keycloak } from '$lib/providers/index.js';
import { GH_CLIENT_ID, GH_CLIENT_SECRET } from '$env/static/private';

export const auth = provenance(
	// github({ clientId: GH_CLIENT_ID, clientSecret: GH_CLIENT_SECRET }),
	keycloak({
		clientId: GH_CLIENT_ID,
		clientSecret: GH_CLIENT_SECRET,
		base: '',
		realm: ''
	}),
	() => {
		return {};
	}
);
