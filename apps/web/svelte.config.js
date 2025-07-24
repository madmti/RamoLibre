import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter({
            // Configuración del adaptador para generar archivos estáticos
            fallback: 'index.html', // Archivo de fallback para SPA
            pages: 'public', // Directorio de salida para las páginas generadas
            assets: 'public' // Directorio de salida para los activos estáticos
        }),
        files: {
            routes: 'src/routes'
        },
        alias: {
            $lib: 'src/lib',
            '$lib/*': 'src/lib/*',
	    $components: 'src/components',
	    '$components/*': 'src/components/*'
        },
        // Configuración de prerenderizado corregida
        prerender: {
            entries: ['*'], // Prerenderizar todas las rutas
            crawl: true, // Habilitar rastreo de enlaces para prerenderizado
            handleHttpError: 'warn' // Manejar errores HTTP durante el prerenderizado
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
                'connect-src': ['self', 'https://zoquyhsbryempqxxgtet.supabase.co', process.env.VITE_PUBLIC_API_URL || 'http://localhost:3000'],
                'img-src': ['self', 'data:', 'blob:', 'https://lh3.googleusercontent.com'],
                'object-src': ['none'],
                'base-uri': ['self']
            }
        }
    }
};

export default config;
