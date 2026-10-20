<script lang="ts">
	import Pane from './Pane.svelte';
	import { KIND_LABEL, type DiffView, type KindGroup, type LinkView } from '#lib/diff.js';

	let { view }: { view: DiffView } = $props();

	let hovered = $state<string | null>(null);
	let wrapper = $state<HTMLElement | null>(null);
	let leftEl = $state<HTMLElement | null>(null);
	let rightEl = $state<HTMLElement | null>(null);
	let tip = $state({ x: 0, y: 0 });
	let geomTick = $state(0);

	const segEls = new Map<string, HTMLElement>();

	function register(node: HTMLElement, key: string) {
		segEls.set(key, node);
		geomTick++;
		return {
			destroy() {
				segEls.delete(key);
			}
		};
	}

	const hoveredLink = $derived(view.links.find((l) => l.id === hovered) ?? null);

	const movedLinks = $derived(
		view.links.filter((l) => l.group === 'moved' && l.sources.length > 0 && l.targets.length > 0)
	);

	interface Ribbon {
		link: LinkView;
		d: string;
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	}
	let ribbons = $state<Ribbon[]>([]);

	/* Connectors live in the center gutter only: x is pinned to the pane edges,
	 * y tracks each segment's vertical center. Both panes scroll with the same
	 * container, so wrapper-relative coordinates stay valid during scroll —
	 * only resize and content changes require a re-measure. */
	function measure() {
		if (!wrapper || !leftEl || !rightEl) {
			ribbons = [];
			return;
		}
		const wr = wrapper.getBoundingClientRect();
		const x1 = leftEl.getBoundingClientRect().right - wr.left + 8;
		const x2 = rightEl.getBoundingClientRect().left - wr.left - 8;
		const mx = (x1 + x2) / 2;
		const next: Ribbon[] = [];
		for (const link of movedLinks) {
			const s = segEls.get(`left:${link.sources[0]}`);
			const t = segEls.get(`right:${link.targets[0]}`);
			if (!s || !t) continue;
			const sr = s.getBoundingClientRect();
			const tr = t.getBoundingClientRect();
			const y1 = sr.top + sr.height / 2 - wr.top;
			const y2 = tr.top + tr.height / 2 - wr.top;
			next.push({
				link,
				x1,
				y1,
				x2,
				y2,
				d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
			});
		}
		ribbons = next;
	}

	$effect(() => {
		void geomTick;
		void view;
		measure();
		const el = wrapper;
		if (!el) return;
		const ro = new ResizeObserver(() => measure());
		ro.observe(el);
		// Geist swaps in after first paint and reflows every line box.
		document.fonts?.ready.then(() => measure());
		return () => ro.disconnect();
	});

	const GROUP_COLOR: Record<KindGroup, string> = {
		moved: 'var(--diff-moved)',
		reworded: 'var(--diff-reworded)',
		inserted: 'var(--diff-inserted)',
		deleted: 'var(--diff-deleted)',
		unchanged: 'hsl(var(--muted-foreground) / 0.5)'
	};
	const GROUP_TEXT: Record<KindGroup, string> = {
		moved: 'var(--diff-moved-text)',
		reworded: 'var(--diff-reworded-text)',
		inserted: 'var(--diff-inserted-text)',
		deleted: 'var(--diff-deleted-text)',
		unchanged: 'hsl(var(--muted-foreground))'
	};
	const LEGEND: { group: KindGroup; label: string }[] = [
		{ group: 'moved', label: 'moved' },
		{ group: 'reworded', label: 'reworded' },
		{ group: 'inserted', label: 'inserted' },
		{ group: 'deleted', label: 'deleted' },
		{ group: 'unchanged', label: 'unchanged' }
	];

	function onhover(id: string | null) {
		hovered = id;
	}
</script>

<div class="mx-auto w-full max-w-6xl px-6 py-6">
	{#if view.summary}
		<div class="mb-6 rounded-lg border p-4">
			<p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
				Editor’s summary
			</p>
			<p class="text-sm leading-6 text-muted-foreground">{view.summary}</p>
		</div>
	{/if}

	<div class="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
		{#each LEGEND as item (item.group)}
			{#if view.counts[item.group] > 0}
				<span class="flex items-center gap-1.5 text-xs text-muted-foreground">
					<span class="size-2 rounded-[3px]" style:background={GROUP_COLOR[item.group]}></span>
					{item.label}
					<span class="tabular-nums text-muted-foreground/60">{view.counts[item.group]}</span>
				</span>
			{/if}
		{/each}
		<span class="ml-auto text-[11px] text-muted-foreground/50">
			hover a sentence to trace it across drafts
		</span>
	</div>

	<div class="relative" bind:this={wrapper} onmousemove={(e) => (tip = { x: e.clientX, y: e.clientY })} role="presentation">
		<div class="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)]">
			<div bind:this={leftEl}>
				<Pane pane={view.left} side="left" {hovered} {onhover} {register} />
			</div>
			<div></div>
			<div bind:this={rightEl}>
				<Pane pane={view.right} side="right" {hovered} {onhover} {register} />
			</div>
		</div>

		<svg class="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
			{#each ribbons as r (r.link.id)}
				{@const active = hovered === r.link.id}
				{@const faded = hovered !== null && !active}
				<g
					stroke="var(--diff-moved)"
					fill="none"
					opacity={active ? 1 : faded ? 0.1 : 0.35}
					style="transition: opacity 150ms ease"
				>
					<path d={r.d} stroke-width={active ? 2 : 1.25} />
					<circle cx={r.x1} cy={r.y1} r="2.5" fill="var(--diff-moved)" stroke="none" />
					<circle cx={r.x2} cy={r.y2} r="2.5" fill="var(--diff-moved)" stroke="none" />
				</g>
			{/each}
		</svg>
	</div>
</div>

{#if hoveredLink && hoveredLink.group !== 'unchanged'}
	<div
		class="pointer-events-none fixed z-50 w-72 rounded-lg border bg-popover/95 p-3 shadow-lg backdrop-blur"
		style:left="{Math.min(tip.x + 14, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 300)}px"
		style:top="{Math.min(tip.y + 18, (typeof window !== 'undefined' ? window.innerHeight : 800) - 170)}px"
	>
		<div class="mb-1.5 flex items-center gap-1.5">
			<span class="size-2 rounded-[3px]" style:background={GROUP_COLOR[hoveredLink.group]}></span>
			<span
				class="text-[10px] font-semibold uppercase tracking-wider"
				style:color={GROUP_TEXT[hoveredLink.group]}
			>
				{KIND_LABEL[hoveredLink.kind]}{#if hoveredLink.badge}&nbsp;·&nbsp;{hoveredLink.badge}{/if}
			</span>
			{#if hoveredLink.movement}
				<span class="text-[11px] tabular-nums text-muted-foreground">{hoveredLink.movement}</span>
			{/if}
		</div>
		{#if hoveredLink.why}
			<p class="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
				Why
			</p>
			<p class="mb-2 text-sm leading-snug">{hoveredLink.why}</p>
		{/if}
		{#if hoveredLink.impact}
			<p class="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
				Impact
			</p>
			<p class="text-sm leading-snug text-muted-foreground">{hoveredLink.impact}</p>
		{/if}
	</div>
{/if}
