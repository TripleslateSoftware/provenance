import { provenance } from '$provenance';
import { github } from '@tripleslate/provenance/providers';
import { GH_CLIENT_ID, GH_CLIENT_SECRET } from '$env/static/private';
import type { Provider } from '@tripleslate/provenance';

export const auth = provenance(
	github(
		{
			clientId: GH_CLIENT_ID,
			clientSecret: GH_CLIENT_SECRET
		},
		() => {
			return {};
		}
	)
);

type GetSession<S> = S extends Provider<infer T, any> ? T : never;
type Session = GetSession<typeof auth>;
