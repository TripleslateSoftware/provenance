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

See the [example project](./example/) to see the following writeup in action.

### include vite plugin

Include `provenance` in the vite plugin pipeline. It will generate a light "runtime"
that forms the bridge between your project's version of `sveltekit` and the `provenance` core logic.

#### `vite.config.ts`

```ts title="vite.config.ts"
import { defineConfig } from 'vite';

import { sveltekit } from '@sveltejs/kit/vite';
import { provenance } from '@tripleslate/provenance/vite';

export default defineConfig({
  // provenance first
  plugins: [provenance(), sveltekit()]
});
```

### add path alias

#### `svelte.config.ts`

```ts title="svelte.config.ts"
import path from 'path';

import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      // add this alias record
      $provenance: path.resolve('.', '$provenance')
    }
  }
};

export default config;
```

### add the `$provenance` dir to `.gitignore`

#### `.gitignore`

```ignore title=".gitignore"
.DS_Store
node_modules
/build
/dist
/.svelte-kit
/package
.env
.env.*
!.env.example
vite.config.js.timestamp-*
vite.config.ts.timestamp-*

$provenance
```

`$provenance/index.js` and `$provenance/index.d.ts` will be written on vite dev server start and build.

### create auth object

#### `src/lib/server/auth.ts`

##### github

```ts title="src/lib/server/auth.ts"
import { provenance } from '$provenance';
import { github } from '@tripleslate/provenance/providers';
import { GH_CLIENT_ID, GH_CLIENT_SECRET } from '$env/static/private';

export const auth = provenance(
  github({ clientId: GH_CLIENT_ID, clientSecret: GH_CLIENT_SECRET }),
  () => {
    return {};
  }
);
```

##### keycloak

```ts title="src/lib/server/auth.ts"
import { provenance } from '$provenance';
import { keycloak } from '@tripleslate/provenance/providers';
import { KC_BASE, KC_REALM, KC_CLIENT_ID, KC_CLIENT_SECRET } from '$env/static/private';

export const auth = provenance(
  keycloak({
    base: KC_BASE,
    realm: KC_REALM,
    clientId: KC_CLIENT_ID,
    clientSecret: KC_CLIENT_SECRET
  }),
  () => {
    return {};
  }
);
```

### match the `App` interfaces to your provider and session callback

Type errors will appear if the `App.Session` or `App.SessionExtra` interface(s) do not match the `provider` and `sessionCallback` passed to `$provenance.provenance` ([see "create auth object"](#create-auth-object)).

#### `src/app.d.ts`

```ts title="src/app.d.ts"
declare global {
  namespace App {
    interface Session {
      accessToken: string;
    }

    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
```

Above example applies to `github` provider. Refer to the fields in the `Session` generic parameter on other providers.
Note that `Locals` does not need to be defined, `provenance` provides a default `session` field of type `(App.Session & App.SessionExtra) | null`.
If an app defines other `Locals` fields, they can be defined here without redefining `session` on `Locals` as typescript will merge the two declarations of the interface.

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

Extend the `App.SessionExtra` interface (`provenance` defines this interface as an empty object by default).
Note that this example extends the `App.SessionExtra` type with an `App.User` field.

```ts title="src/app.d.ts"
declare global {
  namespace App {
    interface User {
      displayName: string;
    }
    interface SessionExtra {
      user: User;
    }
    ...
  }
}

export {};
```

#### `src/lib/server/auth.ts`

Include a session callback in the `auth` definition to decode the `idToken` JWT into some user information (available data depends on your provider/creativity).

```ts title="src/lib/server/auth.ts"
import * as jose from 'jose';

import { provenance } from '$provenance';
import { keycloak } from '@tripleslate/provenance/providers';
import { KC_BASE, KC_REALM, KC_CLIENT_ID, KC_CLIENT_SECRET } from '$env/static/private';

export const auth = provenance(
  keycloak({
    base: KC_BASE,
    realm: KC_REALM,
    clientId: KC_CLIENT_ID,
    clientSecret: KC_CLIENT_SECRET
  }),
  (tokens) => {
    const idToken = jose.decodeJwt(tokens.idToken);

    return {
      user: {
        displayName: idToken.name
      }
    };
  }
);
```

#### `src/routes/protected/+page.server.ts`

Access the user field on the session object.

```ts title="src/routes/protected/+page.server.ts"
import { auth } from '$lib/server/auth';

export const load = async (event) => {
  const { user } = await auth.protectRoute(event);

  return {
    user
  };
};
```
