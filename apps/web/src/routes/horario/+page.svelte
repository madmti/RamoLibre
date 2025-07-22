<script lang="ts">
	import { userPreferences } from '$lib/stores/preferences';
	import { currentSchedules } from '$lib/stores/schedule';
	import { currentSubjects } from '$lib/stores/subject';

	import CardView from '$components/schedule/CardView.svelte';
	import ListView from '$components/schedule/ListView.svelte';
	import GridView from '$components/schedule/GridView.svelte';

	type Views = 'list' | 'grid' | 'cards';
	const icons = {
		list: '📋',
		grid: '🔲',
		cards: '🃏'
	};
	const names = {
		list: 'Lista',
		grid: 'Cuadrícula',
		cards: 'Tarjetas'
	};

	let currentView: Views = $userPreferences?.scheduleView || 'cards';
	$: hasData = $currentSubjects.length > 0 && $currentSchedules.length > 0;
	$: hasSubjects = $currentSubjects.length > 0;

</script>

<svelte:head>
	<title>Horario - Ramo Libre</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Encabezado -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-800 mb-2">📅 Horario</h1>
		<p class="text-gray-600">Organiza y visualiza tus clases y horarios académicos</p>
	</div>
	
	<!-- Vista actual -->
	<div class="flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50 px-4 py-3 mb-6">
		<div class="flex items-center space-x-2">
			<span class="text-lg">{icons[currentView]}</span>
			<span class="text-sm font-medium text-gray-700">Vista: {names[currentView]}</span>
		</div>
		<a 
			href="/configuracion" 
			class="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
		>
			<span>Cambiar</span>
		</a>
	</div>
	
	<!-- Horario según preferencias del usuario -->
	<div class="mb-8">
		{#if !hasData}
			{#if !hasSubjects}
				<!-- No hay materias -->
				<div class="text-center py-12">
					<div class="text-6xl mb-4">📚</div>
					<h3 class="text-xl font-semibold text-gray-800 mb-2">¡No tienes materias registradas!</h3>
					<p class="text-gray-600 mb-6">Comienza creando tus materias y agregando sus horarios para ver tu horario semanal.</p>
					<div class="space-x-4">
						<a 
							href="/gestion"
							class="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
						>
							<span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg></span>
							<span>Gestionar materias y horarios</span>
						</a>
					</div>
				</div>
			{:else}
				<!-- Hay materias pero no horarios -->
				<div class="text-center py-12 flex flex-col items-center">
					<div class="text-6xl mb-4 flex justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-plus-icon lucide-calendar-plus">
							<path d="M16 19h6"/><path d="M16 2v4"/><path d="M19 16v6"/><path d="M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8.5"/><path d="M3 10h18"/><path d="M8 2v4"/>
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-800 mb-2">¡Agrega horarios a tus materias!</h3>
					<p class="text-gray-600 mb-6">Tienes {$currentSubjects.length} materia{$currentSubjects.length > 1 ? 's' : ''} registrada{$currentSubjects.length > 1 ? 's' : ''}, pero aún no has configurado sus horarios.</p>
					<div class="space-x-4">
						<a 
							href="/gestion"
							class="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
						>
							<span>
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-plus-icon lucide-calendar-plus">
									<path d="M16 19h6"/><path d="M16 2v4"/><path d="M19 16v6"/><path d="M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8.5"/><path d="M3 10h18"/><path d="M8 2v4"/>
								</svg>
							</span>
							<span>Agregar horarios</span>
						</a>
					</div>
				</div>
			{/if}
		{:else}
			<!-- Mostrar vista según preferencias -->
			{#if currentView === 'cards'}
				<CardView />
			{:else if currentView === 'list'}
				<ListView />
			{:else if currentView === 'grid'}
				<GridView />
			{/if}
		{/if}
	</div>

	{#if hasData}
		<!-- Información adicional solo cuando hay datos -->
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
			<div class="flex items-start space-x-3">
				<span class="text-blue-500 text-xl">💡</span>
				<div>
					<h3 class="font-medium text-blue-800 mb-1">¿Necesitas hacer cambios?</h3>
					<p class="text-blue-700 text-sm">
						Puedes agregar, editar o eliminar materias y horarios desde la 
						<a href="/gestion" class="underline hover:text-blue-800">página de gestión</a>.
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
