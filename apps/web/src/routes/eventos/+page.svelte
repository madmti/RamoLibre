<script lang="ts">
	import { userPreferences } from '$lib/stores/preferences';
	import { currentEvents } from '$lib/stores/events';
	import { currentSubjects } from '$lib/stores/subject';

	import CalendarView from '../../components/events/CalendarView.svelte';
	import ListView from '../../components/events/ListView.svelte';
	import KanbanView from '../../components/events/KanbanView.svelte';
	import TimelineView from '../../components/events/TimelineView.svelte';
	import EventModal from '../../components/modals/EventModal.svelte';

	// ICONS
	import CalendarIcon from '$embedded-icons/calendar.svg?component';
	import NextForwardIcon from '$embedded-icons/next-forward.svg?component';
	import WarningIcon from '$embedded-icons/warning.svg?component';
	import CheckIcon from '$embedded-icons/check.svg?component';
	import ColChartIcon from '$embedded-icons/col-chart.svg?component';
	import PlusIcon from '$embedded-icons/plus.svg?component';
	import ListIcon from '$embedded-icons/list.svg?component';
	import KanbanIcon from '$embedded-icons/kanban.svg?component';
	import TimeLineIcon from '$embedded-icons/time-line.svg?component';

	function getDateString(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function openModal(modalType: Modals, target: any = null) {
		currentModal = modalType;
		currentTarget = target;
	}

	function handleToggleComplete(eventId: string) {
		currentEvents.toggleComplete(eventId);
	}

	function handleDeleteEvent(eventId: string) {
		currentEvents.removeEvent(eventId);
	}

	function handleCreateEvent(event: any) {
		currentEvents.addEvent(event.detail);
		openModal(null);
	}

	function handleUpdateEvent(event: any) {
		const ev = { id: event.detail.id, ...event.detail.data };
		currentEvents.updateEvent(ev);
		openModal(null);
	}

	function getSubjectName(subjectId: string): string {
		const subject = $currentSubjects.find((s) => s.id === subjectId);
		return subject ? subject.name : 'Sin materia';
	}

	type Views = 'calendar' | 'list' | 'kanban' | 'timeline';
	type Filter = 'all' | 'upcoming' | 'overdue' | 'completed';
	type Modals = 'create' | 'edit' | null;

	let filter: Filter = 'all';
	let filterSubject: string = 'all';
	let currentModal: Modals = null;
	let currentView: Views = $userPreferences.eventsView || 'calendar';
	let currentTarget: any = null;
	let selectedDate: string = getDateString(new Date());

	const priorityColors: Record<string, string> = {
		low: 'bg-green-100 text-green-800',
		medium: 'bg-yellow-100 text-yellow-800',
		high: 'bg-red-100 text-red-800',
	};

	const priorityNames: Record<string, string> = {
		low: 'Baja',
		medium: 'Media',
		high: 'Alta',
	};

	const getPriorityColor = (priority: string): string =>
		priorityColors[priority] || 'bg-gray-100 text-gray-800';
	const getPriorityName = (priority: string): string => priorityNames[priority] || 'Normal';

	$: categorized = currentEvents.getCategorizedEvents(
		$currentEvents,
		selectedDate,
		filterSubject
	);
</script>

<svelte:head>
	<title>Eventos - Ramo Libre</title>
</svelte:head>

<div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
	<!-- Encabezado -->
	<div class="mb-6 sm:mb-8">
		<h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center">
			<CalendarIcon class="inline-block w-8 h-8 mr-2" />
			Eventos
		</h1>
		<p class="text-sm sm:text-base text-gray-600">
			Gestiona tus eventos académicos, exámenes y tareas
		</p>
	</div>

	<!-- Estadísticas rápidas -->
	<div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
		<div class="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-blue-600 text-xs sm:text-sm font-medium">Próximos</p>
					<p class="text-xl sm:text-2xl font-bold text-blue-800">
						{categorized.upcoming.length}
					</p>
				</div>
				<div class="text-lg sm:text-2xl">
					<NextForwardIcon class="w-8 h-8 text-blue-600" />
				</div>
			</div>
		</div>
		<div class="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-red-600 text-xs sm:text-sm font-medium">Vencidos</p>
					<p class="text-xl sm:text-2xl font-bold text-red-800">
						{categorized.overdue.length}
					</p>
				</div>
				<div class="text-lg sm:text-2xl">
					<WarningIcon class="w-8 h-8 text-red-600" />
				</div>
			</div>
		</div>
		<div class="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-green-600 text-xs sm:text-sm font-medium">Completados</p>
					<p class="text-xl sm:text-2xl font-bold text-green-800">
						{categorized.completed.length}
					</p>
				</div>
				<div class="text-lg sm:text-2xl">
					<CheckIcon class="w-8 h-8 text-green-600" />
				</div>
			</div>
		</div>
		<div class="bg-purple-50 border border-purple-200 rounded-xl p-3 sm:p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-purple-600 text-xs sm:text-sm font-medium">Total</p>
					<p class="text-xl sm:text-2xl font-bold text-purple-800">
						{categorized.all.length}
					</p>
				</div>
				<div class="text-lg sm:text-2xl">
					<ColChartIcon class="w-8 h-8 text-purple-600" />
				</div>
			</div>
		</div>
	</div>

	<!-- Controles de administración -->
	{#if categorized.all.length === 0}
		<div class="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 mb-8">
			<div class="text-center">
				<div class="text-3xl sm:text-4xl mb-4">
					<CalendarIcon class="inline-block w-12 h-12" />
				</div>
				<h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-2">
					No tienes eventos
				</h3>
				<p class="text-sm sm:text-base text-gray-600 mb-4">
					Empieza agregando tu primer evento.
				</p>
				<div class="flex justify-center">
					<button
						on:click={() => openModal('create')}
						class="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
					>
						<PlusIcon class="w-5 h-5" />
						Crear Primer Evento
					</button>
				</div>
			</div>
		</div>
	{:else}
		<div class="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-8">
			<div
				class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
			>
				<div class="flex items-center space-x-2">
					<span class="text-xs sm:text-sm font-medium text-gray-700"
						>Gestiona tus eventos:</span
					>
				</div>
				<div class="flex justify-center sm:justify-end">
					<button
						on:click={() => openModal('create')}
						class="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
					>
						<PlusIcon class="w-5 h-5" />
						Agregar Evento
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Controles de vista y filtros -->
	<div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-8">
		<!-- Layout móvil: vertical -->
		<div class="flex flex-col gap-4 sm:hidden">
			<!-- Selector de vista móvil -->
			<div class="flex flex-col space-y-3">
				<span class="text-sm font-medium text-gray-700">Vista:</span>
				<div class="grid grid-cols-2 gap-2">
					<button
						on:click={() => (currentView = 'calendar')}
						class="px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-center transition-colors {currentView ===
						'calendar'
							? 'bg-blue-500 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					>
						<CalendarIcon class="inline-block w-5 h-5 mr-1" />
						Calendario
					</button>
					<button
						on:click={() => (currentView = 'list')}
						class="px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-center transition-colors {currentView ===
						'list'
							? 'bg-blue-500 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					>
						<ListIcon class="inline-block w-5 h-5 mr-1" />
						Lista
					</button>
					<button
						on:click={() => (currentView = 'kanban')}
						class="px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-center transition-colors {currentView ===
						'kanban'
							? 'bg-blue-500 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					>
						<KanbanIcon class="inline-block w-5 h-5 mr-1" />
						Kanban
					</button>
					<button
						on:click={() => (currentView = 'timeline')}
						class="px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-center transition-colors {currentView ===
						'timeline'
							? 'bg-blue-500 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					>
						<TimeLineIcon class="inline-block w-5 h-5 mr-1" />
						Timeline
					</button>
				</div>
			</div>

			<!-- Filtros móvil -->
			<div class="flex flex-col space-y-4">
				<span class="text-sm font-medium text-gray-700">Filtros:</span>
				<div class="flex flex-col gap-3">
					<div class="flex flex-col space-y-1">
						<label for="filter-type-mobile" class="text-xs font-medium text-gray-700"
							>Estado:</label
						>
						<select
							id="filter-type-mobile"
							bind:value={filter}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="all">Todos</option>
							<option value="upcoming">Próximos</option>
							<option value="overdue">Vencidos</option>
							<option value="completed">Completados</option>
						</select>
					</div>
					<div class="flex flex-col space-y-1">
						<label for="filter-subject-mobile" class="text-xs font-medium text-gray-700"
							>Materia:</label
						>
						<select
							id="filter-subject-mobile"
							bind:value={filterSubject}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="all">Todas</option>
							{#each $currentSubjects as subject}
								<option value={subject.id}>{subject.name}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>
		</div>

		<!-- Layout desktop: horizontal compacto -->
		<div
			class="hidden sm:flex sm:flex-col xl:flex-row xl:items-center xl:justify-between gap-4"
		>
			<!-- Selector de vista desktop -->
			<div class="flex items-center space-x-2 flex-shrink-0">
				<span class="text-sm font-medium text-gray-700">Vista:</span>
				<div class="flex rounded-lg border border-gray-300 overflow-hidden">
					<button
						on:click={() => (currentView = 'calendar')}
						class="px-3 py-2 text-sm font-medium transition-colors flex items-center {currentView ===
						'calendar'
							? 'bg-blue-500 text-white'
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						<CalendarIcon class="inline-block w-5 h-5 mr-2" />
						Calendario
					</button>
					<button
						on:click={() => (currentView = 'list')}
						class="px-3 py-2 text-sm font-medium transition-colors flex items-center border-l border-gray-300 {currentView ===
						'list'
							? 'bg-blue-500 text-white'
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						<ListIcon class="inline-block w-5 h-5 mr-2" />
						Lista
					</button>
					<button
						on:click={() => (currentView = 'kanban')}
						class="px-3 py-2 text-sm font-medium transition-colors flex items-center border-l border-gray-300 {currentView ===
						'kanban'
							? 'bg-blue-500 text-white'
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						<KanbanIcon class="inline-block w-5 h-5 mr-2" />
						Kanban
					</button>
					<button
						on:click={() => (currentView = 'timeline')}
						class="px-3 py-2 text-sm font-medium transition-colors flex items-center border-l border-gray-300 {currentView ===
						'timeline'
							? 'bg-blue-500 text-white'
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						<TimeLineIcon class="inline-block w-5 h-5 mr-2" />
						Timeline
					</button>
				</div>
			</div>

			<!-- Filtros desktop -->
			<div class="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4">
				<div class="flex items-center space-x-2 w-full lg:w-auto">
					<label
						for="filter-type"
						class="text-sm font-medium text-gray-700 whitespace-nowrap flex-shrink-0"
						>Estado:</label
					>
					<select
						id="filter-type"
						bind:value={filter}
						class="flex-1 lg:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="all">Todos</option>
						<option value="upcoming">Próximos</option>
						<option value="overdue">Vencidos</option>
						<option value="completed">Completados</option>
					</select>
				</div>

				<div class="flex items-center space-x-2 w-full lg:w-auto">
					<label
						for="filter-subject"
						class="text-sm font-medium text-gray-700 whitespace-nowrap flex-shrink-0"
						>Materia:</label
					>
					<select
						id="filter-subject"
						bind:value={filterSubject}
						class="flex-1 lg:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="all">Todas</option>
						{#each $currentSubjects as subject}
							<option value={subject.id}>{subject.name}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</div>

	<!-- Vista de eventos -->
	<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
		{#if currentView === 'calendar'}
			<CalendarView
				events={categorized[filter]}
				bind:selectedDate
				{getSubjectName}
				{getPriorityColor}
				onToggleComplete={handleToggleComplete}
				onEditEvent={(event) => openModal('edit', event)}
				onDeleteEvent={handleDeleteEvent}
			/>
		{:else if currentView === 'list'}
			<ListView
				events={categorized[filter]}
				{getSubjectName}
				getEventTypeName={currentEvents.getTypeName}
				{getPriorityColor}
				{getPriorityName}
				onToggleComplete={handleToggleComplete}
				onEditEvent={(event) => openModal('edit', event)}
				onDeleteEvent={handleDeleteEvent}
			/>
		{:else if currentView === 'kanban'}
			<KanbanView
				events={categorized[filter]}
				{getSubjectName}
				{getPriorityColor}
				onToggleComplete={handleToggleComplete}
				onEditEvent={(event) => openModal('edit', event)}
				onDeleteEvent={handleDeleteEvent}
			/>
		{:else if currentView === 'timeline'}
			<TimelineView
				events={categorized[filter]}
				{getSubjectName}
				getEventTypeName={currentEvents.getTypeName}
				{getPriorityColor}
				onToggleComplete={handleToggleComplete}
				onEditEvent={(event) => openModal('edit', event)}
				onDeleteEvent={handleDeleteEvent}
			/>
		{/if}
	</div>
</div>

<!-- Modal de eventos -->
<EventModal
	subjectList={$currentSubjects}
	mode={currentModal}
	event={currentTarget}
	on:create={handleCreateEvent}
	on:save={handleUpdateEvent}
	on:delete={(e) => handleDeleteEvent(e.detail)}
	on:close={() => openModal(null)}
/>
