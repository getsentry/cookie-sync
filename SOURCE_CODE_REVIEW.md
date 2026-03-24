# Firefox Reviewer Rebuild

Reviewers can rebuild the Firefox package from source with:

```sh
pnpm install --frozen-lockfile
pnpm run zip:firefox
```

The command writes the Firefox extension zip and the Firefox sources zip to `.output/`.
