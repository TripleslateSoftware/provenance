## release

releases are published from CI (`.github/workflows/release.yml`) with npm trusted publishing. nothing is published locally.

- add a changeset with your change (`pnpm changeset`) and push to `main`
- the gh action opens (or updates) a version PR
- merge the version PR; the action builds and publishes to npm and pushes the git tag

### prerelease

enter prerelease mode to publish under the `next` dist tag instead of `latest`:

```
pnpm changeset pre enter next
```

commit and push `.changeset/pre.json`. version PRs will then produce `-next.N` versions.

to promote to a stable release, exit prerelease mode, commit and push, then merge the version PR:

```
pnpm changeset pre exit
```
