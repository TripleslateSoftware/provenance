# provenance

Server-side OAuth/OIDC implementation for SvelteKit

## packages

| package                                        | changelog                                     |
| ---------------------------------------------- | --------------------------------------------- |
| [@tripleslate/provenance](packages/provenance) | [changelog](packages/provenance/CHANGELOG.md) |

## examples

| example           | demo                                      |
| ----------------- | ----------------------------------------- |
| [github](example) | [demo](https://provenance-phi.vercel.app) |

## license

[MIT](https://github.com/TripleslateSoftware/provenance/blob/master/LICENSE)

## release

- push with necessary changesets
- gh action will make a version PR
- create prerelease

```
pnpm changeset pre enter next
pnpm changeset version
pnpm changeset publish
```

- merge version pr and pull
- publish release

```
pnpm changeset publish
```

## thanks

[vite-plugin-kit-routes](https://github.com/jycouet/kitql) for good practices for a single file vite codegen plugin
