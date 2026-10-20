import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),
			// SPA fallback so client-side deep links (/?sample=…) work on any static host.
			adapter: adapter({ fallback: 'index.html' })
		})
	],
	server: {
		// Fail loudly rather than silently drifting to another port.
		port: 5190,
		strictPort: true
	},
	build: { target: 'esnext' }
});
