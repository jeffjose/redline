<script lang="ts">
	import { onMount } from 'svelte';
	import { app, editInputs, loadSample, restore } from '$lib/state.svelte';
	import { buildView } from '$lib/diff';
	import { SAMPLES } from '$lib/samples';
	import { cn } from '$lib/utils';
	import DiffViewer from '$lib/components/DiffViewer.svelte';
	import InputPanel from '$lib/components/InputPanel.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PenLine from '@lucide/svelte/icons/pen-line';

	onMount(() => {
		restore();
		// Deep link: /?sample, /?sample=light|medium|heavy opens a sample directly.
		const wanted = new URLSearchParams(location.search).get('sample');
		if (wanted !== null) loadSample(wanted);
	});

	const diffView = $derived(app.diff ? buildView(app.diff) : null);
</script>

<svelte:head>
	<title>redline — semantic diff for prose</title>
	<meta
		name="description"
		content="See what an editor (or an LLM) actually did to your writing: moves, rewords, cuts, and why."
	/>
</svelte:head>

<div class="flex h-svh flex-col">
	<header class="flex h-12 shrink-0 items-center justify-between border-b px-4">
		<div class="flex items-baseline gap-3">
			<span class="select-none text-sm font-semibold tracking-tight">
				<span style:color="var(--diff-deleted-text)">red</span>line
			</span>
			<span class="hidden text-xs text-muted-foreground/60 sm:inline">
				semantic diff for prose
			</span>
		</div>
		<div class="flex items-center gap-1.5">
			{#if app.view === 'viewer' && app.diff?.meta?.title}
				<span class="mr-2 hidden text-xs text-muted-foreground/60 md:inline">
					{app.diff.meta.title}
				</span>
			{/if}
			<span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
				samples
			</span>
			{#each SAMPLES as s (s.id)}
				<Button
					variant="ghost"
					class={cn('h-7 px-2 text-xs', app.sampleId === s.id && 'bg-accent')}
					title={s.blurb}
					onclick={() => loadSample(s.id)}
				>
					{s.name}
				</Button>
			{/each}
			{#if app.view === 'viewer'}
				<div class="mx-1 h-4 w-px bg-border"></div>
				<Button variant="ghost" onclick={editInputs}><PenLine /> Edit drafts</Button>
			{/if}
		</div>
	</header>

	<main class="min-h-0 flex-1 overflow-y-auto">
		{#if app.view === 'viewer' && diffView}
			<DiffViewer view={diffView} />
		{:else}
			<InputPanel />
		{/if}
	</main>
</div>
