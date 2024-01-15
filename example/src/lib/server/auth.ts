import { provenance } from './PROVENANCE';
import { github } from '@tripleslate/provenance/providers';
import { GH_CLIENT_ID, GH_CLIENT_SECRET } from '$env/static/private';

export const auth = provenance(
	github({
		clientId: GH_CLIENT_ID,
		clientSecret: GH_CLIENT_SECRET
	}),
	() => {
		return { message: 'hello!' };
	}
);
