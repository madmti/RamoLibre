<script lang="ts">
	import '../app.css';
	import 'katex/dist/katex.min.css';
	import Navigation from '$components/Navigation.svelte';
	import Breadcrumbs from '$components/Breadcrumbs.svelte';
	import { onMount } from 'svelte';
	import { DefaultStore } from '$lib/stores/default';
	import { writable } from 'svelte/store';
	import { page } from '$app/stores';

    // Speed Insights Metrics
    // Esto NO recopila datos personales de los usuarios, son solo metricas de velocidad de carga
    import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
    injectSpeedInsights();

	let isInitialized = writable(false);

	onMount(() => {
		let interval: NodeJS.Timeout;
		interval = setInterval(() => {
			if (DefaultStore.allInitialized()) {
				isInitialized.set(true);
				clearInterval(interval);
			}
		}, 100);
		
	});

	// Función para construir la URL canónica
	$: canonicalUrl = `https://ramolibre.vercel.app${$page.url.pathname}`;

	// Metadescripciones por defecto para cada ruta
	const defaultMetaDescriptions: Record<string, string> = {
		'/': 'Aplicación web gratuita y ligera para estudiantes universitarios. Gestiona horarios, calificaciones y eventos académicos. Funciona offline con datos seguros.',
		'/horario': 'Organiza y visualiza tu horario universitario de forma intuitiva. Agrega materias, horarios y ubicaciones. Sincronización offline disponible.',
		'/notas': 'Gestiona tus calificaciones universitarias y calcula tu promedio académico. Organiza por materias y categorías. Datos privados y seguros.',
		'/eventos': 'Organiza eventos académicos, tareas y fechas importantes. Vista de calendario, Kanban y timeline. Nunca olvides una entrega.',
		'/gestion': 'Panel de gestión académica completo. Administra materias, categorías de notas y configuraciones del semestre universitario.',
		'/configuracion': 'Personaliza tu experiencia académica. Configuración de perfil, preferencias y sincronización de datos universitarios.'
	};

	// Función para obtener la metadescripción según la ruta
	$: currentMetaDescription = defaultMetaDescriptions[$page.url.pathname] || defaultMetaDescriptions['/'];

</script>

<svelte:head>
	<link rel="canonical" href={canonicalUrl} />
	<meta name="description" content={currentMetaDescription} />
	<meta property="og:description" content={currentMetaDescription} />
	<meta name="twitter:description" content={currentMetaDescription} />
</svelte:head>

<Navigation/>
<Breadcrumbs />

<main class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
	{#if $isInitialized}
		<slot />
	{:else}
		<!-- Indicador de carga -->
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p class="text-gray-600">Cargando...</p>
			</div>
		</div>
	{/if}
</main>
