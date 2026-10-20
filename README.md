# redline

A semantic diff viewer for prose. You write something, an editor (human or LLM)
revises it — redline shows what actually happened to the writing: sentences
moved, reworded, split, merged, cut, or added, each with the editor's likely
_why_ and its _impact_ on the piece. Not a textual diff; an editorial one.

## How it works

The analysis is done by an LLM, not by this app:

1. Paste **Draft A** (yours) and **Draft B** (edited) on the input screen.
2. **Copy prompt** — a full instruction set with both drafts embedded — and run
   it in Gemini / Claude / ChatGPT.
3. Paste the JSON it returns and **Render diff**.

The viewer shows both drafts side by side as flowing text. Every sentence is a
block colored by what happened to it:

- **blue** — moved (numbered badges carry identity; ribbons in the gutter trace
  the movement)
- **amber** — reworded / split / merged
- **green** — inserted
- **red** — deleted (struck through, left side only)
- dim — unchanged

Hover (or tab to) any sentence to trace it across drafts and see the model's
guess at _why_ the editor did it and what it does to the piece.

## Wire format

See `src/lib/types.ts`. Two segmented documents plus links; every segment
belongs to exactly one link. `parseDiff` in `src/lib/diff.ts` is lenient about
markdown fences and unclassified segments, strict about unknown/duplicate ids.

## Dev

```sh
pnpm install
pnpm dev        # http://localhost:5190
pnpm check      # fast type check: svelte-check-native + tsrs
pnpm check:slow # official svelte-check; run before calling a change done
pnpm build      # static build in build/
```

SvelteKit 3 + Vite 8. Kit options live in `sveltekit({...})` in `vite.config.ts`
(there is no `svelte.config.js`), and library code is imported via `#lib/...`
with file extensions (`#lib/diff.js`, `#lib/components/Pane.svelte`).
