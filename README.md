# provenance

Server-side oauth implementation for SvelteKit

## features

- Create a `handle` for programmatically defining auth functionality in server hooks
  - handle requests to redirectUri, login, and logout routes
  - refresh access tokens (if refresh tokens used by the provider)
  - add a session object to `event.locals`
  - track the last path for redirect after login
- Provide a `protectRoute` function for redirecting user without session to login
- Expose a callback to include extra information in the stored cookie session given tokens data

## installation

`npm i --save-dev @tripleslate/provenance`

## usage

### create auth object

#### `src/lib/server/auth.ts`

##### github

```ts title="src/lib/server/auth.ts"
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

import { provenance } from '@tripleslate/provenance';
import { github } from '@tripleslate/provenance/providers';
import { GH_CLIENT_ID, GH_CLIENT_SECRET } from '$env/static/private';

export const auth = provenance(
	github({ clientId: GH_CLIENT_ID, clientSecret: GH_CLIENT_SECRET }),
	redirect,
	dev,
	() => {
		return {};
	}
);
```

##### keycloak

```ts title="src/lib/server/auth.ts"
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

import { provenance } from '@tripleslate/provenance';
import { keycloak } from '@tripleslate/provenance/providers';
import { KC_BASE, KC_REALM, KC_CLIENT_ID, KC_CLIENT_SECRET } from '$env/static/private';

export const auth = provenance(
	keycloak({
		base: KC_BASE,
		realm: KC_REALM,
		clientId: KC_CLIENT_ID,
		clientSecret: KC_CLIENT_SECRET
	}),
	redirect,
	dev,
	() => {
		return {};
	}
);
```

### intialize handle hook

#### `src/hooks.server.ts`

```ts title="hooks.server.ts"
import { auth } from '$lib/server/auth';

export const handle = auth.handle;
```

### protect a route

#### `src/routes/protected/+page.server.ts`

```ts title="src/routes/protected/+page.server.ts"
import { auth } from '$lib/server/auth';

export const load = async (event) => {
	const session = await auth.protectRoute(event);

	return {
		session
	};
};
```

Note that `handle` in `hooks.server.ts` is not invoked during client side routing (typically, navigating to a page without a `+page.server.ts` after first load). This means that protecting a route with `auth.protectRoute` and accessing (up to date) session information must be done in a `+page.server.ts` load, not a `+page.ts` load.

### add extra information to session

#### `src/app.d.ts`

```ts title="src/app.d.ts"
declare global {
	namespace App {
		interface User {
			displayName: string;
		}
		interface SessionExtra {
			user?: User;
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
```

Extend the `App.SessionExtra` interface (`provenance` defines this interface as an empty object by default).
Note that this syntax extends the `App.SessionExtra` type with an `App.User` field.

#### `src/lib/server/auth.ts`

```ts title="src/lib/server/auth.ts"
import * as jose from "jose";

import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

import { provenance } from '@tripleslate/provenance';
import { keycloak } from '@tripleslate/provenance/providers';
import { KC_BASE, KC_REALM, KC_CLIENT_ID, KC_CLIENT_SECRET } from '$env/static/private';

export const auth = provenance(
	keycloak({
		base: KC_BASE,
		realm: KC_REALM,
		clientId: KC_CLIENT_ID,
		clientSecret: KC_CLIENT_SECRET
	}),
	redirect,
	dev,
	(tokens) => {
		if (tokens.idToken) {
			const idToken = jose.decodeJwt(tokens.idToken);

			return {
				user {
					displayName: idToken.name
				}
			}
		} else {
			// should be unreachable with a keycloak provider
			return {}
		}
	}
);
```

Include a session callback in the `auth` definition to decode the `idToken` JWT into some user information (available data depends on your provider/creativity).

#### `src/routes/protected/+page.server.ts`

```ts title="src/routes/protected/+page.server.ts"
import { auth } from '$lib/server/auth';

export const load = async (event) => {
	const { user } = await auth.protectRoute(event);

	return {
		user
	};
};
```

Access the user field on the session object.
