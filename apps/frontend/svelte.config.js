import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		files: {
			routes: 'src/routes'
		},
		alias: {
			$lib: 'src/lib',
			'$lib/*': 'src/lib/*'
		},
		// CSP headers para seguridad mejorada
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'unsafe-inline', 'unsafe-eval', 'blob:', 'https://fonts.googleapis.com'],
				'worker-src': ['self', 'blob:'],
				'child-src': ['self', 'blob:'],
				'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'font-src': ['self', 'https://fonts.gstatic.com', 'data:', 'blob:'],
				'connect-src': ['self'],
				'img-src': ['self', 'data:', 'blob:'],
				'object-src': ['none'],
				'base-uri': ['self']
			}
		}
	}
};

export default config;
