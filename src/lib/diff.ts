import type { DiffDoc, LinkKind, Segment, SemanticDiff, SemanticLink } from './types';

/** Display family: the five visual treatments (split/merged render as reworded). */
export type KindGroup = 'unchanged' | 'moved' | 'reworded' | 'inserted' | 'deleted';

const KINDS: LinkKind[] = [
	'unchanged',
	'moved',
	'reworded',
	'moved+reworded',
	'split',
	'merged',
	'deleted',
	'inserted'
];

export function groupOf(kind: LinkKind): KindGroup {
	switch (kind) {
		case 'moved':
		case 'moved+reworded':
			return 'moved';
		case 'reworded':
		case 'split':
		case 'merged':
			return 'reworded';
		case 'deleted':
			return 'deleted';
		case 'inserted':
			return 'inserted';
		default:
			return 'unchanged';
	}
}

export const KIND_LABEL: Record<LinkKind, string> = {
	unchanged: 'Unchanged',
	moved: 'Moved',
	reworded: 'Reworded',
	'moved+reworded': 'Moved & reworded',
	split: 'Split',
	merged: 'Merged',
	deleted: 'Deleted',
	inserted: 'Inserted'
};

export interface LinkView {
	id: string;
	kind: LinkKind;
	group: KindGroup;
	sources: string[];
	targets: string[];
	why?: string;
	impact?: string;
	/** 1-based identity number for moved links (shown as a badge on both sides). */
	badge?: number;
	/** Human description of the displacement, e.g. "¶2 → ¶1". */
	movement?: string;
}

export interface SegmentView {
	seg: Segment;
	link: LinkView;
}

export interface PaneView {
	label: string;
	/** Segments grouped into paragraphs, in document order. */
	paragraphs: SegmentView[][];
}

export interface DiffView {
	left: PaneView;
	right: PaneView;
	links: LinkView[];
	counts: Record<KindGroup, number>;
	summary?: string;
}

/**
 * Parse and validate LLM output. Throws with a message specific enough to
 * debug the prompt run. Lenient where leniency is safe: markdown fences are
 * stripped, missing link ids are assigned, and segments the model forgot to
 * classify get an auto link (unchanged when the exact text appears on the
 * other side, deleted/inserted otherwise).
 */
export function parseDiff(raw: string): SemanticDiff {
	let text = raw.trim();
	// Models love to wrap JSON in ```json fences despite instructions.
	const fenced = text.match(/^```(?:json)?\s*\n([\s\S]*?)\n```\s*$/);
	if (fenced) text = fenced[1];

	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch (e) {
		throw new Error(`Not valid JSON: ${e instanceof Error ? e.message : e}`);
	}
	const d = data as Partial<SemanticDiff>;
	const source = parseDoc(d.source, 'source');
	const target = parseDoc(d.target, 'target');
	if (!Array.isArray(d.links)) throw new Error('Missing "links" array.');

	const sourceIds = new Set(source.segments.map((s) => s.id));
	const targetIds = new Set(target.segments.map((s) => s.id));
	const usedSources = new Set<string>();
	const usedTargets = new Set<string>();

	const links: SemanticLink[] = d.links.map((l, i) => {
		const raw = l as Partial<SemanticLink>;
		let kind = raw.kind as LinkKind;
		if (!KINDS.includes(kind)) throw new Error(`Link ${i + 1}: unknown kind "${raw.kind}".`);
		const sources = toIdList(raw.sources, `link ${i + 1} sources`);
		const targets = toIdList(raw.targets, `link ${i + 1} targets`);
		for (const id of sources) {
			if (!sourceIds.has(id))
				throw new Error(`Link ${i + 1} references unknown source id "${id}".`);
			if (usedSources.has(id)) throw new Error(`Source segment "${id}" appears in two links.`);
			usedSources.add(id);
		}
		for (const id of targets) {
			if (!targetIds.has(id))
				throw new Error(`Link ${i + 1} references unknown target id "${id}".`);
			if (usedTargets.has(id)) throw new Error(`Target segment "${id}" appears in two links.`);
			usedTargets.add(id);
		}
		// Coerce the obvious mislabels rather than failing the whole render.
		if (targets.length === 0 && kind !== 'deleted') kind = 'deleted';
		if (sources.length === 0 && kind !== 'inserted') kind = 'inserted';
		if (sources.length === 0 && targets.length === 0)
			throw new Error(`Link ${i + 1} has neither sources nor targets.`);
		return { id: raw.id ?? `l${i + 1}`, kind, sources, targets, why: raw.why, impact: raw.impact };
	});

	// Auto-cover anything the model left out so the panes always render whole.
	const targetTexts = new Map(target.segments.map((s) => [normalize(s.text), s.id]));
	for (const seg of source.segments) {
		if (usedSources.has(seg.id)) continue;
		const twin = targetTexts.get(normalize(seg.text));
		if (twin && !usedTargets.has(twin)) {
			links.push({ id: `auto-${seg.id}`, kind: 'unchanged', sources: [seg.id], targets: [twin] });
			usedTargets.add(twin);
		} else {
			links.push({
				id: `auto-${seg.id}`,
				kind: 'deleted',
				sources: [seg.id],
				targets: [],
				why: 'Not classified by the model.'
			});
		}
	}
	for (const seg of target.segments) {
		if (usedTargets.has(seg.id) || links.some((l) => l.targets.includes(seg.id))) continue;
		links.push({
			id: `auto-${seg.id}`,
			kind: 'inserted',
			sources: [],
			targets: [seg.id],
			why: 'Not classified by the model.'
		});
	}

	return { meta: d.meta, source, target, links, summary: d.summary };
}

function parseDoc(doc: unknown, name: string): DiffDoc {
	const d = doc as Partial<DiffDoc> | undefined;
	if (!d || !Array.isArray(d.segments) || d.segments.length === 0)
		throw new Error(`Missing "${name}.segments".`);
	const seen = new Set<string>();
	const segments = d.segments.map((s, i) => {
		const seg = s as Partial<Segment>;
		if (typeof seg.id !== 'string' || !seg.id)
			throw new Error(`${name} segment ${i + 1} is missing an id.`);
		if (seen.has(seg.id)) throw new Error(`${name} has duplicate segment id "${seg.id}".`);
		seen.add(seg.id);
		if (typeof seg.text !== 'string' || !seg.text.trim())
			throw new Error(`${name} segment "${seg.id}" has no text.`);
		const paragraph = typeof seg.paragraph === 'number' && seg.paragraph > 0 ? seg.paragraph : 1;
		return { id: seg.id, paragraph, text: seg.text };
	});
	return { label: typeof d.label === 'string' ? d.label : undefined, segments };
}

function toIdList(v: unknown, where: string): string[] {
	if (v == null) return [];
	if (!Array.isArray(v) || v.some((x) => typeof x !== 'string'))
		throw new Error(`Expected ${where} to be an array of segment ids.`);
	return v as string[];
}

function normalize(s: string): string {
	return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Everything the viewer needs, precomputed once per diff. */
export function buildView(diff: SemanticDiff): DiffView {
	const srcOrder = new Map(diff.source.segments.map((s, i) => [s.id, i]));
	const srcById = new Map(diff.source.segments.map((s) => [s.id, s]));
	const tgtById = new Map(diff.target.segments.map((s) => [s.id, s]));

	const links: LinkView[] = diff.links.map((l, i) => ({
		id: l.id ?? `l${i + 1}`,
		kind: l.kind,
		group: groupOf(l.kind),
		sources: l.sources,
		targets: l.targets,
		why: l.why,
		impact: l.impact
	}));

	// Badges: identity numbers for moved links, in order of source appearance.
	const moved = links
		.filter((l) => l.group === 'moved' && l.sources.length && l.targets.length)
		.sort((a, b) => (srcOrder.get(a.sources[0]) ?? 0) - (srcOrder.get(b.sources[0]) ?? 0));
	moved.forEach((l, i) => {
		l.badge = i + 1;
		const from = srcById.get(l.sources[0]);
		const to = tgtById.get(l.targets[0]);
		if (from && to) {
			l.movement =
				from.paragraph === to.paragraph
					? `reordered within ¶${from.paragraph}`
					: `¶${from.paragraph} → ¶${to.paragraph}`;
		}
	});

	const linkBySource = new Map<string, LinkView>();
	const linkByTarget = new Map<string, LinkView>();
	for (const l of links) {
		for (const id of l.sources) linkBySource.set(id, l);
		for (const id of l.targets) linkByTarget.set(id, l);
	}

	const counts: Record<KindGroup, number> = {
		unchanged: 0,
		moved: 0,
		reworded: 0,
		inserted: 0,
		deleted: 0
	};
	for (const l of links) counts[l.group]++;

	return {
		left: paneView(diff.source, 'Original', linkBySource),
		right: paneView(diff.target, 'Edited', linkByTarget),
		links,
		counts,
		summary: diff.summary
	};
}

function paneView(doc: DiffDoc, fallbackLabel: string, linkOf: Map<string, LinkView>): PaneView {
	const paragraphs: SegmentView[][] = [];
	let current: SegmentView[] | null = null;
	let currentPara: number | null = null;
	for (const seg of doc.segments) {
		const link = linkOf.get(seg.id);
		if (!link) continue; // parseDiff guarantees coverage; belt and suspenders
		if (seg.paragraph !== currentPara) {
			current = [];
			currentPara = seg.paragraph;
			paragraphs.push(current);
		}
		current!.push({ seg, link });
	}
	return { label: doc.label ?? fallbackLabel, paragraphs };
}
