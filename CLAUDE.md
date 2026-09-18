# SRS-Game

## Typechecking — do not run `tsc -b`

This repo is a TypeScript project-references setup: the root `tsconfig.json` has no
files of its own, only references to `common/`, `client/` and `colyseus-server/`.

None of those projects set an `outDir`, and they emit declarations and source maps.
So a build writes its output **next to every source file** — `.d.mts`, `.d.mts.map`,
`.mjs`, `.mjs.map` in `common/`, and `.d.ts`, `.d.ts.map`, `.js`, `.js.map` in
`client/` — plus a `tsconfig.tsbuildinfo` per project. None of that is gitignored, so
a single build drops ~200 untracked files into the working tree and dirties the
tracked `client/tsconfig.tsbuildinfo`.

`tsc -b` is a build, not a check. To verify types, emit nothing:

```
npx tsc -b --dry            # what would build, no output written
npx tsc -p common --noEmit  # typecheck one project
```

Run the app with the scripts in the root `package.json` (`npm run test:local`,
`npm run server`) rather than invoking `tsc` directly.

If build output does get created, delete only untracked files matching the emitted
extensions above, and restore `client/tsconfig.tsbuildinfo` with `git checkout --`.
Do not blanket-delete by extension: `client/index.js` and `client/vite.config.js` are
tracked sources, and `common/HelpSidebar.ts` is an untracked work-in-progress source.

## Player identity

`playerNum` (`-1 | 0 | 1`) in `common/Board.mts` is the type for a player's seat:
two players plus the spectator. Use it for anything identifying a player — never a
bare `number`, which is indistinguishable from a coordinate or an ichor cost. Raw
numbers are narrowed to `playerNum` only at the two entry points where a seat enters
the system: the server's player assignment, and the client's `playerAssignment`
message handler.
