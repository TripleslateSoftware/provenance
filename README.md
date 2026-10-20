# provenance

Server-side OAuth/OIDC library for SvelteKit

## usage

The package's main entry point is a vite plugin. On `vite dev` and `vite build`, a `provenance` "runtime" is generated in source. This runtime contains functions that can be used to set up a `provenance` "instance" configured to your provider.

Currently, `github` and `keycloak` are the only supported OAuth providers, but with some knowledge of your provider and with [those implementations](packages/provenance/src/providers/index.ts) as examples, it would not be difficult to add more. Feel free to make a PR!

see the package [readme](packages/provenance/README.md) for specific usage instructions

## examples

[github](example) — a SvelteKit app using the `github` provider. To run it locally:

1. create a [GitHub OAuth app](https://github.com/settings/developers) with callback URL `http://localhost:5173/auth`
2. copy `example/.env.example` to `example/.env` and fill in `GH_CLIENT_ID` and `GH_CLIENT_SECRET`
3. `pnpm i && pnpm dev`

## packages

| package                                        | changelog                                     |
| ---------------------------------------------- | --------------------------------------------- |
| [@tripleslate/provenance](packages/provenance) | [changelog](packages/provenance/CHANGELOG.md) |

## contributing

see [contribubting.md](./CONTRIBUTING.md)

## license

[MIT](https://github.com/LeagueBrain/provenance/blob/main/LICENSE)

## thanks

[vite-plugin-kit-routes](https://github.com/jycouet/kitql) for good practices for a single file vite codegen plugin
