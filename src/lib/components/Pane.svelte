<script lang="ts">
	import { cn } from '$lib/utils';
	import type { KindGroup, PaneView } from '$lib/diff';

	// Literal class names, not `seg-${group}` — Tailwind purges @layer classes
	// whose full name never appears in the source text.
	const GROUP_CLASS: Record<KindGroup, string> = {
		unchanged: 'seg-unchanged',
		moved: 'seg-moved',
		reworded: 'seg-reworded',
		inserted: 'seg-inserted',
		deleted: 'seg-deleted'
	};

	interface Props {
		pane: PaneView;
		side: 'left' | 'right';
		hovered: string | null;
		onhover: (linkId: string | null) => void;
		register: (node: HTMLElement, key: string) => { destroy: () => void };
	}

	let { pane, side, hovered, onhover, register }: Props = $props();
</script>

<section class="min-w-0">
	<header class="mb-4 flex items-baseline justify-between">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
			{pane.label}
		</h2>
		<span class="text-[11px] tabular-nums text-muted-foreground/60">
			{pane.paragraphs.reduce((n, p) => n + p.length, 0)} sentences
		</span>
	</header>
	<div class="space-y-4 text-sm leading-7">
		{#each pane.paragraphs as para (para[0]?.seg.id)}
			<p>
				{#each para as sv, i (sv.seg.id)}{#if i > 0}{' '}{/if}<!--
				deliberate: segments are focusable so keyboard users can trace links
				--><!-- svelte-ignore a11y_no_noninteractive_tabindex --><span
						class={cn(
							'seg',
							GROUP_CLASS[sv.link.group],
							hovered === sv.link.id && 'is-active',
							hovered !== null && hovered !== sv.link.id && 'is-dim'
						)}
						use:register={`${side}:${sv.seg.id}`}
						role="mark"
						tabindex="0"
						onmouseenter={() => onhover(sv.link.id)}
						onmouseleave={() => onhover(null)}
						onfocus={() => onhover(sv.link.id)}
						onblur={() => onhover(null)}
						>{#if sv.link.badge}<sup class="seg-badge">{sv.link.badge}</sup>{/if}{sv.seg
							.text}</span
					>{/each}
			</p>
		{/each}
	</div>
</section>
