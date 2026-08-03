/**
 * The prompt half of the project: everything the LLM needs to turn two drafts
 * into the wire format in types.ts. Built to paste into Gemini / Claude /
 * ChatGPT as a single message.
 */

export const PROMPT_VERSION = 1;

export function buildPrompt(draftA: string, draftB: string): string {
	return `You are an expert manuscript editor analyzing how a piece of writing was revised. Compare DRAFT A (the original) with DRAFT B (the edited version) and produce a semantic diff: not a textual diff, but an account of what the editor did and why — sentences moved, reworded, split, merged, cut, or added.

Work sentence by sentence:

1. Segment each draft into sentences, in order. Keep each sentence's text EXACTLY as it appears in its draft — verbatim, including punctuation. Give ids a1, a2, a3… for draft A and b1, b2, b3… for draft B, and record each sentence's 1-based paragraph number.

2. Link the segments. Every segment of BOTH drafts must appear in exactly one link. Kinds:
   - "unchanged": same sentence, same role, essentially identical text.
   - "moved": same (or near-same) text, but relocated — different paragraph or a different position that changes the narrative order.
   - "reworded": same role and position, but the wording changed.
   - "moved+reworded": relocated AND rewritten.
   - "split": one A sentence became two or more B sentences (sources: [one id], targets: [several]).
   - "merged": several A sentences became one B sentence.
   - "deleted": in A only (targets: []).
   - "inserted": in B only (sources: []).
   Choose the dominant kind when several apply, and use the tightest matching — prefer one reworded link over a delete+insert pair when the sentence clearly survived.

3. For every link that is not "unchanged", give:
   - "why": your best guess at the editor's intent, as a specific editorial judgment ("leads with the strongest fact", "cuts the self-undermining aside") — not a restatement of the mechanics. Max ~20 words.
   - "impact": what the change does to the piece or its reader. Max ~20 words.

4. Write a 1–3 sentence "summary" of the revision's overall editorial strategy.

Return ONLY raw JSON — no markdown fences, no commentary — in exactly this shape:

{
  "meta": { "title": "<short title for this comparison>" },
  "source": {
    "label": "Draft A",
    "segments": [ { "id": "a1", "paragraph": 1, "text": "..." } ]
  },
  "target": {
    "label": "Draft B",
    "segments": [ { "id": "b1", "paragraph": 1, "text": "..." } ]
  },
  "links": [
    { "kind": "moved+reworded", "sources": ["a3"], "targets": ["b1"], "why": "...", "impact": "..." },
    { "kind": "unchanged", "sources": ["a1"], "targets": ["b2"] },
    { "kind": "deleted", "sources": ["a2"], "targets": [], "why": "...", "impact": "..." }
  ],
  "summary": "..."
}

DRAFT A:
<<<
${draftA.trim()}
>>>

DRAFT B:
<<<
${draftB.trim()}
>>>`;
}
