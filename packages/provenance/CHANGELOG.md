# @tripleslate/provenance

## 0.14.0-next.2
### Minor Changes

- e4f4e63: export `modules` in package

## 0.14.0-next.1
### Minor Changes

- a71aa7d: add signup initiative and resolver with github and keycloak support

### Patch Changes

- a71aa7d: properly export login/logout initiatives

## 0.14.0-next.0
### Minor Changes

- 6dda59e: support `vite` 6

## 0.13.0
### Minor Changes

- b689d9a: rename `Context['postlogout']` to `preLogout` and change signature
- 72783ba: throw errors as strings
- 72783ba: record expiry in ms
- b874a11: use 302 redirect instead of 303
- b874a11: always use `{sessionCookieName}-` pattern when parsing cookies

### Patch Changes

- 02018ac: move `vite/runtime` into `vite/sveltekit/runtime` to allow installation to depend on framework
- 2c9024e: improve provider session validation

## 0.13.0-next.2
### Patch Changes

- 2c9024e: improve provider session validation

## 0.13.0-next.1
### Minor Changes

- b874a11: use 302 redirect instead of 303
- b874a11: always use `{sessionCookieName}-` pattern when parsing cookies

## 0.13.0-next.0
### Minor Changes

- b689d9a: rename `Context['postlogout']` to `preLogout` and change signature
- 72783ba: throw errors as strings
- 72783ba: record expiry in ms

### Patch Changes

- 02018ac: move `vite/runtime` into `vite/sveltekit/runtime` to allow installation to depend on framework

## 0.12.0
### Minor Changes

- 2a7f79c: delete session cookies more aggressively and add initiative for doing so

## 0.11.0
### Minor Changes

- 254b958: remove untrustworthy `sessionCallback` from config/session resolution

## 0.10.0
### Minor Changes

- b2e318a: add scopes to provider configurations

### Patch Changes

- b2e318a: use `oslojs` instead of `oauth4webapi`

## 0.9.1
### Patch Changes

- 4a868d8: remove last traces of last path cookie

## 0.9.0
### Minor Changes

- 510c2d1: add login and logout initiatives
- 2488952: use oauth state to store referring url instead of last path cookie
- df979a3: remove keycloak provider session field `refreshExpiresIn` in favor of `refreshExpiresAt`

### Patch Changes

- df979a3: kill session in refresh resolver also if refresh token in cookie is expired
- 2488952: handle search params in referring page

## 0.8.4
### Patch Changes

- 1e831b4: set new session in locals in refresh resolver

## 0.8.3
### Patch Changes

- 4ebcb95: destroy broken cookie(s) if context `getCookie` throws
- 6968b48: unset session in locals when deleting the session cookie(s) (refresh failure, logout)

## 0.8.2
### Patch Changes

- 10734d5: post keycloak session logout before deleting session cookie and redirecting

## 0.8.1
### Patch Changes

- 0a91016: dont use global `Buffer` for state encode if not available

## 0.8.0
### Minor Changes

- 60bd535: add initiatives concept
- 60bd535: add `eagerRefresh` option to keycloak provider/refresh resolver

## 0.7.2

### Patch Changes

- cdd8de9: add a lot more logging and straighten up config types

## 0.7.1

### Patch Changes

- 84dd9c8: allow `getDomain` to return undefined

## 0.7.0

### Minor Changes

- 31b61c2: copy the runtime from src instead of writing a string to a file and add `getDomain` to runtime `provenance` config parameter

## 0.6.0

### Minor Changes

- 2b71a5e: remove `SessionExtra`/required `sessionCallback` and refactor for cleaner generics

## 0.5.3

### Patch Changes

- fe8d66b: bump deps

## 0.5.2

### Patch Changes

- add `postUpdateRun` option for formatting, etc.

## 0.5.1

### Patch Changes

- fix types agreement on context generic for SessionExtra stuff

## 0.5.0

### Minor Changes

- 352e38c: refactor: generate ts runtime inside lib with options

### Patch Changes

- 06d8824: fix: handle cookie checks failure with redirect (retry)

## 0.4.1

### Patch Changes

- fix vite config wrong `Plugin` type

## 0.4.0

### Minor Changes

- 2e38ebe: support SvelteKit v2

## 0.3.0

### Minor Changes

- 9dd6a99: remove last path resolver and save last path to cookies in `protectRoute`

### Patch Changes

- b9076fe: feat: add dedent to better format generated code

## 0.2.0

### Minor Changes

- 3ebc8e5: compress the `Provider` type and clean up type exports
- 3ebc8e5: change create provider (`github`, `keycloak`) signature and add type

### Patch Changes

- 3ebc8e5: add `fixSession` callback to providers

## 0.2.0-next.0

### Minor Changes

- 3ebc8e5: compress the `Provider` type and clean up type exports
- 3ebc8e5: change create provider (`github`, `keycloak`) signature and add type

### Patch Changes

- 3ebc8e5: add `fixSession` callback to providers

## 0.1.2

### Patch Changes

- 3f218da: add build to prepublish (to build the new version of the package.. disregard `0.1.1`` release)

## 0.1.1

### Patch Changes

- a7cc56e: add optional `sessionCookieAge` callback to user facing provider functions

## 0.1.0

### Minor Changes

- 7cd9720: initial release
