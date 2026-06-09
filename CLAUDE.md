# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@tripleslate/provenance` — a server-side OAuth/OIDC library for SvelteKit. pnpm monorepo (pnpm ≥10, node ≥22) with turbo:

- `packages/provenance` — the published library
- `example` — a SvelteKit demo app using the github provider (deployed to Vercel)

## Commands

Run from the repo root:

- `pnpm build` — build the library (tsup)
- `pnpm build:example` — build the example app (depends on library build via turbo)
- `pnpm dev` — turbo dev: `tsup --watch` on the library + `vite dev` on the example together
- `pnpm lint` — prettier check + eslint
- `pnpm format` — prettier write
- `pnpm --filter example check` — svelte-check type checking of the example

There is no test suite; the example app is the verification vehicle.

## Releases

Changesets-based (see CONTRIBUTING.md): push with a changeset, a GitHub Action opens a version PR. Prereleases use `pnpm changeset pre enter next` / `changeset version` / `changeset publish`. The package is currently on a `-next` prerelease line.

## Architecture

The core design goal is keeping the library decoupled from the consumer's SvelteKit version. This is achieved by splitting into a framework-agnostic core (bundled to `dist/` by tsup) and a **generated runtime** that is copied into the consuming app as source.

### The vite plugin / generated runtime

`src/vite/index.ts` exports the `provenance()` vite plugin. On dev server start and build it copies `src/vite/sveltekit/runtime/ts.ts` (or `js.js` + `js.d.ts` for js projects) into the consumer's project as `src/lib/server/PROVENANCE.ts` (location/filename configurable). That file is meant to be checked in — `example/src/lib/server/PROVENANCE.ts` is a generated copy; never edit it by hand.

The runtime is the only code that imports `@sveltejs/kit` (`redirect`, `sequence`, `$app/environment`) — it resolves against the *app's* sveltekit install. It exports the `provenance(provider, config?)` factory which wires the core modules together and returns `{ handle, options, createContext }`.

Important: the ts (`ts.ts`) and js (`js.js` + `js.d.ts`) runtime variants are maintained by hand in parallel. A change to one must be mirrored in the others. These files are shipped raw from `src/` (see the `./sveltekit/runtime/*` exports in package.json), not via `dist/`.

### Core layers (`packages/provenance/src`)

- **`context.ts`** — the `Context<ProviderSession, AppSession>` type: the seam between the framework-agnostic core and the framework. The generated runtime implements it on top of a SvelteKit `RequestEvent` (cookies, fetch, locals, redirects).
- **`modules/`** — pure logic units exported as `c` (checks: state/PKCE cookies), `o` (oauth: token/auth-response handling), `r` (routes: pathnames), `s` (session: cookie serialization, chunking).
- **`providers/`** — `provider()` factory plus `github` and `keycloak` implementations. A `Provider` bundles auth-server config, endpoint URL builders, session config (`transformTokens` is the only required callback), and a resolver list. New providers follow `github.ts`/`keycloak.ts` as templates.
- **`resolvers/`** — middleware that runs in the handle chain, one per concern (redirectUri, locals, login, signup, logout, refresh). Each resolver becomes a SvelteKit `Handle`; the runtime composes them with `sequence()`. A provider chooses its resolvers (e.g. refresh only makes sense for providers with refresh tokens).
- **`initiatives/`** — user-callable functions (`protectRoute`, `login`, `logout`, `refresh`, `signup`, `deleteSessionCookies`) that take `auth.createContext` and run inside the consumer's load functions or actions, since `handle` does not run during client-side navigation.

### Session model

The session lives entirely in cookies (no server store). `transformTokens` turns the token endpoint response into the `ProviderSession`; the consumer's `App.Session` interface (declaration-merged in the runtime) types `event.locals.session`. The locals resolver hydrates `locals.session` from the cookie on every server request.

### Build

tsup bundles entries `index`, `providers`, `initiatives`, `vite`, `helpers` to ESM in `dist/`. `PACKAGE_NAME`/`PACKAGE_VERSION` are injected via tsup `define`. `svelte` and `@sveltejs/kit` are externals — the library must never gain a hard dependency on them.

## Style

Prettier with tabs and single quotes (`.prettierrc`); run `pnpm lint` before committing.
