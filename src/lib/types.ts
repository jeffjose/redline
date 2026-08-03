/**
 * The wire format — what the LLM is asked to produce.
 *
 * A diff is two segmented documents plus a set of semantic links. Every
 * segment on both sides belongs to exactly one link; a link with no targets
 * is a deletion, one with no sources is an insertion. `why` is the model's
 * best guess at the editor's intent, `impact` its effect on the piece.
 */

export type LinkKind =
	| 'unchanged'
	| 'moved'
	| 'reworded'
	| 'moved+reworded'
	| 'split'
	| 'merged'
	| 'deleted'
	| 'inserted';

export interface Segment {
	/** Stable id: a1, a2… for draft A; b1, b2… for draft B. */
	id: string;
	/** 1-based paragraph number within its draft. */
	paragraph: number;
	/** Exact verbatim sentence text from the draft. */
	text: string;
}

export interface DiffDoc {
	label?: string;
	segments: Segment[];
}

export interface SemanticLink {
	id?: string;
	kind: LinkKind;
	/** Segment ids in draft A ([] for inserted). */
	sources: string[];
	/** Segment ids in draft B ([] for deleted). */
	targets: string[];
	/** The editor's most likely intent, per the model. */
	why?: string;
	/** What the change does to the piece / the reader. */
	impact?: string;
}

export interface SemanticDiff {
	meta?: {
		title?: string;
		model?: string;
		generatedAt?: string;
	};
	source: DiffDoc;
	target: DiffDoc;
	links: SemanticLink[];
	/** One-paragraph editorial summary of what the edit did overall. */
	summary?: string;
}
