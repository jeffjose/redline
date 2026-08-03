import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// Fail loudly rather than silently drifting to another port.
		port: 5190,
		strictPort: true
	},
	build: { target: 'esnext' }
});
