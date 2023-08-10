# provenance

server-side oidc implementation for sveltekit

## installation

`npm i --save-dev @tripleslate/provenance`

## usage

`src/lib/auth.ts`

```ts title="$lib/auth.ts"
import { redirect } from '@sveltejs/kit';

import { provenance } from '@tripleslate/provenance';

import { dev } from '$app/environment';
import { KC_REALM, KC_BASE, KC_CLIENT_ID, KC_CLIENT_SECRET } from '$env/static/private';

export const auth = provenance(
	{
		issuer: new URL(`/realms/${KC_REALM}`, KC_BASE).toString(),
		clientId: KC_CLIENT_ID,
		clientSecret: KC_CLIENT_SECRET
	},
	redirect,
	dev
);
```

`src/hooks.server.ts`

```ts title="hooks.server.ts"
import { auth } from '$lib/auth.js';

export const handle = auth.handle;
```
