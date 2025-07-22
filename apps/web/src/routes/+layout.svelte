<script>
	import '../app.css';
	import 'katex/dist/katex.min.css';
	import Navigation from '$components/Navigation.svelte';
	import Breadcrumbs from '$components/Breadcrumbs.svelte';
	import { onMount } from 'svelte';
	import { DefaultStore } from '$lib/stores/default';
	import { writable } from 'svelte/store';

	let isInitialized = writable(false);

	onMount(() => {
		let interval;
		interval = setInterval(() => {
			if (DefaultStore.allInitialized()) {
				isInitialized.set(true);
				clearInterval(interval);
			}
		}, 100);
		
	});

</script>

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
