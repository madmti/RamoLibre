import { sveltekit } from '@sveltejs/kit/vite';
import svelteSVG from 'vite-plugin-svelte-svg';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [
		svelteSVG(),
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			// Configuración específica para SSG
			strategies: 'generateSW',
			injectManifest: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
				// Configuración optimizada para archivos estáticos
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
							},
							plugins: [
								{
									cacheKeyWillBeUsed: async ({ request }) => {
										return `${request.url}?v=1`;
									},
								},
							],
						},
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'gstatic-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
						},
					},
				],
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				skipWaiting: true,
			},
			// El manifest se generará automáticamente, pero podemos sobrescribirlo
			includeAssets: ['favicon.svg', 'android/*.png', 'ios/*.png', 'windows11/*.png'],
			manifest: {
				name: 'Ramo Libre - Gestión Académica Universitaria',
				short_name: 'Ramo Libre',
				description:
					'Aplicación web ligera para gestionar horarios, calificaciones y eventos académicos universitarios',
				theme_color: '#2563eb',
				background_color: '#ffffff',
				display: 'standalone',
				orientation: 'portrait-primary',
				scope: '/',
				start_url: '/',
				lang: 'es',
				categories: ['education', 'productivity', 'utilities'],
				icons: [
					{
						src: '/favicon.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'any maskable',
					},
					{
						src: '/android/android-launchericon-192-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable',
					},
					{
						src: '/android/android-launchericon-512-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
					{
						src: '/ios/180.png',
						sizes: '180x180',
						type: 'image/png',
						purpose: 'any',
					},
				],
				shortcuts: [
					{
						name: 'Ver Horarios',
						short_name: 'Horarios',
						description: 'Acceder directamente a la gestión de horarios',
						url: '/horario',
						icons: [
							{ src: '/android/android-launchericon-192-192.png', sizes: '192x192' },
						],
					},
					{
						name: 'Ver Notas',
						short_name: 'Notas',
						description: 'Acceder directamente al seguimiento de calificaciones',
						url: '/notas',
						icons: [
							{ src: '/android/android-launchericon-192-192.png', sizes: '192x192' },
						],
					},
					{
						name: 'Ver Eventos',
						short_name: 'Eventos',
						description: 'Acceder directamente a eventos académicos',
						url: '/eventos',
						icons: [
							{ src: '/android/android-launchericon-192-192.png', sizes: '192x192' },
						],
					},
				],
			},
			// Solo habilitar en desarrollo si necesitas testear
			devOptions: {
				enabled: false, // Cambiar a true solo para testing
				type: 'module',
			},
		}),
	],
	server: {
		port: 5173,
	},
	// Configurar para leer variables de entorno desde la raíz del proyecto
	envDir: path.resolve(__dirname, '../../'),
	// Configuración específica para build estático
	build: {
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['svelte'],
				},
			},
		},
	},
});
