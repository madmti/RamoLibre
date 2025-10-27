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
				globIgnores: ['screenshots/**'],
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
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
			includeAssets: [
				'favicon.svg',
				'android/*.png',
				'ios/*.png',
				'windows11/*.png',
				'screenshots/*.png',
			],
			manifest: {
				id: 'ramo-libre-pwa',
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
						src: '/android/android-launchericon-192-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: '/android/android-launchericon-512-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: '/android/android-launchericon-192-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable',
					},
					{
						src: '/android/android-launchericon-512-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
				screenshots: [
					{
						src: '/screenshots/desktop-home.png',
						sizes: '2560x1600',
						type: 'image/png',
						form_factor: 'wide',
						label: 'Pantalla principal de Ramo Libre en desktop',
					},
					{
						src: '/screenshots/mobile-home.png',
						sizes: '780x1688',
						type: 'image/png',
						form_factor: 'narrow',
						label: 'Pantalla principal de Ramo Libre en móvil',
					},
					{
						src: '/screenshots/desktop-horario.png',
						sizes: '2560x1600',
						type: 'image/png',
						form_factor: 'wide',
						label: 'Gestión de horarios académicos',
					},
					{
						src: '/screenshots/mobile-horario.png',
						sizes: '780x1688',
						type: 'image/png',
						form_factor: 'narrow',
						label: 'Vista de horarios en móvil',
					},
				],
				shortcuts: [
					{
						name: 'Ver Horarios',
						short_name: 'Horarios',
						description: 'Acceder directamente a la gestión de horarios',
						url: '/horario',
						icons: [
							{
								src: '/android/android-launchericon-192-192.png',
								sizes: '192x192',
								type: 'image/png',
							},
						],
					},
					{
						name: 'Ver Notas',
						short_name: 'Notas',
						description: 'Acceder directamente al seguimiento de calificaciones',
						url: '/notas',
						icons: [
							{
								src: '/android/android-launchericon-192-192.png',
								sizes: '192x192',
								type: 'image/png',
							},
						],
					},
					{
						name: 'Ver Eventos',
						short_name: 'Eventos',
						description: 'Acceder directamente a eventos académicos',
						url: '/eventos',
						icons: [
							{
								src: '/android/android-launchericon-192-192.png',
								sizes: '192x192',
								type: 'image/png',
							},
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
