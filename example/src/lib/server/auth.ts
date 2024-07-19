import { github } from '@tripleslate/provenance/providers';
import { GH_CLIENT_ID, GH_CLIENT_SECRET } from '$env/static/private';
import { provenance } from './PROVENANCE';

export const auth = provenance(
	github({
		clientId: GH_CLIENT_ID,
		clientSecret: GH_CLIENT_SECRET
	}),
	{
		sessionCallback(session) {
			return {
				...session,
				message: 'hello!'
			};
		}
	}
);
