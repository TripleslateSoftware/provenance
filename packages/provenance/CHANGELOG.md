# @tripleslate/provenance

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
