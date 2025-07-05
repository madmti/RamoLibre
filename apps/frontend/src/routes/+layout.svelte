<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { userService } from '$lib/stores/user';

	// Store para indicar si la app está inicializada
	const isInitialized = writable(false);

	// Inicializar el servicio de usuario al cargar cualquier página
	onMount(() => {		
		// Pequeño delay para asegurar que el DOM esté listo
		setTimeout(() => {
			userService.init();
			isInitialized.set(true);
		}, 100);
	});
</script>

<Navigation />
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
