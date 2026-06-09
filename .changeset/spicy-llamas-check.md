---
'@tripleslate/provenance': minor
---

Security and bug fixes:

- **Fix open redirect**: `referrer` values (from the `?referrer=` query param or oauth state) are now only honored when they are same-origin relative paths; absolute, protocol-relative, and backslash variants are ignored
- Fix keycloak `validateSession` validating `accessExpiresAt` twice and never validating `refreshExpiresAt`
- Fix `routes.home.is` checking the logout pathname instead of the home pathname (both runtimes)
- Add missing `signupPathname` and `refreshPathname` to the `AuthOptions` type
- The `refresh` initiative now updates `locals.session` after refreshing (and clears it on failure), matching the refresh resolver
- Vite plugin: fix the `node_modules` walk-up search (it previously threw on the first missing candidate), await runtime generation in `buildStart`/`configureServer`, and create the output directory recursively
- Reconcile drift between the hand-maintained ts and js runtimes: removed the leftover `sessionCallback` config from the js runtime (dropped from the ts runtime and the published types long ago), the js runtime's logout redirect now carries the `referrer` param like the ts runtime, and log labels/returns now match
- Only cookies with a numeric chunk suffix (e.g. `session-0`) are treated as session chunks, so unrelated cookies sharing the prefix no longer corrupt or get deleted with the session
- Throw `Error` objects instead of strings throughout, preserving stack traces in logged errors
