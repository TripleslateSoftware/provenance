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
