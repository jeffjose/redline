<script lang="ts">
	import { app, loadSample, renderDiff, saveInputs } from '#lib/state.svelte.js';
	import { SAMPLES } from '#lib/samples.js';
	import { buildPrompt } from '#lib/prompt.js';
	import Button from './ui/Button.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import Sparkles from '@lucide/svelte/icons/sparkles';

	let copied = $state(false);

	const canCopy = $derived(app.draftA.trim().length > 0 && app.draftB.trim().length > 0);

	async function copyPrompt() {
		await navigator.clipboard.writeText(buildPrompt(app.draftA, app.draftB));
		copied = true;
		setTimeout(() => (copied = false), 1600);
	}

	const textareaClass =
		'w-full resize-none rounded-lg border bg-transparent p-3 text-sm leading-6 ' +
		'placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';
</script>

<div class="mx-auto flex h-full w-full max-w-6xl flex-col gap-5 px-6 py-6">
	<div class="grid min-h-0 flex-1 grid-cols-2 gap-4">
		<label class="flex min-h-0 flex-col gap-2">
			<span class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
				Step 1 · Draft A — what you wrote
			</span>
			<textarea
				class="{textareaClass} min-h-0 flex-1"
				placeholder="Paste your original text…"
				bind:value={app.draftA}
				onchange={saveInputs}
			></textarea>
		</label>
		<label class="flex min-h-0 flex-col gap-2">
			<span class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
				Draft B — what came back
			</span>
			<textarea
				class="{textareaClass} min-h-0 flex-1"
				placeholder="Paste the edited version…"
				bind:value={app.draftB}
				onchange={saveInputs}
			></textarea>
		</label>
	</div>

	<div class="flex items-center gap-3">
		<span class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
			Step 2
		</span>
		<Button variant="outline" disabled={!canCopy} onclick={copyPrompt}>
			{#if copied}<Check /> Copied{:else}<Copy /> Copy prompt{/if}
		</Button>
		<span class="text-xs text-muted-foreground/70">
			Run it in Gemini, Claude, or ChatGPT — it asks for a JSON semantic diff of the two drafts.
		</span>
	</div>

	<label class="flex flex-col gap-2">
		<span class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
			Step 3 · Paste the JSON it returns
		</span>
		<textarea
			class="{textareaClass} h-36 font-mono text-xs leading-5"
			placeholder={'{ "source": { … }, "target": { … }, "links": [ … ] }'}
			bind:value={app.json}
			onchange={saveInputs}
			onkeydown={(e) => {
				if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') renderDiff();
			}}
		></textarea>
	</label>

	<div class="flex items-center gap-3 pb-1">
		<Button disabled={!app.json.trim()} onclick={renderDiff}>
			<ArrowRight /> Render diff
		</Button>
		<span class="flex items-center gap-1 text-xs text-muted-foreground/70">
			<Sparkles class="size-3.5" /> or load a sample:
		</span>
		{#each SAMPLES as s (s.id)}
			<Button variant="ghost" class="h-7 px-2 text-xs" title={s.blurb} onclick={() => loadSample(s.id)}>
				{s.name}
			</Button>
		{/each}
		{#if app.error}
			<p class="min-w-0 truncate text-sm" style:color="var(--diff-deleted-text)" title={app.error}>
				{app.error}
			</p>
		{/if}
	</div>
</div>
