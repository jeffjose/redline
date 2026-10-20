<script lang="ts">
	import { cn } from '#lib/utils.js';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'default' | 'outline' | 'ghost';
		children?: Snippet;
	}

	let { variant = 'default', class: className, children, ...rest }: Props = $props();

	const variants = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		outline: 'border bg-transparent hover:bg-accent hover:text-accent-foreground',
		ghost: 'hover:bg-accent hover:text-accent-foreground'
	};
</script>

<!-- h-8 rather than shadcn's h-10 — the whole app runs at dense scale. -->
<button
	class={cn(
		'inline-flex h-8 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0',
		variants[variant],
		className
	)}
	{...rest}
>
	{@render children?.()}
</button>
