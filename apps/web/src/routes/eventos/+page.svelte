<script lang="ts">
	import { userPreferences } from '$lib/stores/preferences';
	import { currentEvents } from '$lib/stores/events';
	import { currentSubjects } from '$lib/stores/subject';
	
	import CalendarView from '../../components/events/CalendarView.svelte';
	import ListView from '../../components/events/ListView.svelte';
	import KanbanView from '../../components/events/KanbanView.svelte';
	import TimelineView from '../../components/events/TimelineView.svelte';
	import EventModal from '../../components/modals/EventModal.svelte';

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
		const ev = { id:event.detail.id, ...event.detail.data };
		currentEvents.updateEvent(ev);
		openModal(null);
	}

	function getSubjectName(subjectId: string): string {
		const subject = $currentSubjects.find(s => s.id === subjectId);
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

	const priorityColors = {
		low: 'bg-green-100 text-green-800',
		medium: 'bg-yellow-100 text-yellow-800',
		high: 'bg-red-100 text-red-800'
	};

	const priorityNames = {
		low: 'Baja',
		medium: 'Media',
		high: 'Alta'
	};

	const getPriorityColor = (priority: string): string => priorityColors[priority] || 'bg-gray-100 text-gray-800';
	const getPriorityName = (priority: string): string => priorityNames[priority] || 'Normal';

	$: categorized = currentEvents.getCategorizedEvents($currentEvents, selectedDate, filterSubject);

</script>

<svelte:head>
	<title>Eventos - Ramo Libre</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Encabezado -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-800 mb-2">📅 Eventos</h1>
		<p class="text-gray-600">Gestiona tus eventos académicos, exámenes y tareas</p>
	</div>

	<!-- Estadísticas rápidas -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
		<div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-blue-600 text-sm font-medium">Próximos</p>
					<p class="text-2xl font-bold text-blue-800">{categorized.upcoming.length}</p>
				</div>
				<div class="text-2xl">📋</div>
			</div>
		</div>
		<div class="bg-red-50 border border-red-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-red-600 text-sm font-medium">Vencidos</p>
					<p class="text-2xl font-bold text-red-800">{categorized.overdue.length}</p>
				</div>
				<div class="text-2xl">⚠️</div>
			</div>
		</div>
		<div class="bg-green-50 border border-green-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-green-600 text-sm font-medium">Completados</p>
					<p class="text-2xl font-bold text-green-800">{categorized.completed.length}</p>
				</div>
				<div class="text-2xl">✅</div>
			</div>
		</div>
		<div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-purple-600 text-sm font-medium">Total</p>
					<p class="text-2xl font-bold text-purple-800">{categorized.all.length}</p>
				</div>
				<div class="text-2xl">📊</div>
			</div>
		</div>
	</div>

	<!-- Controles de administración -->
	{#if categorized.all.length === 0}
		<div class="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
			<div class="text-center">
				<div class="text-4xl mb-4">📅</div>
				<h3 class="text-lg font-semibold text-gray-800 mb-2">No tienes eventos</h3>
				<p class="text-gray-600 mb-4">Empieza agregando tu primer evento.</p>
				<div class="flex justify-center">
					<button 
						on:click={() => openModal('create')}
						class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
						Crear Primer Evento
					</button>
				</div>
			</div>
		</div>
	{:else}
		<div class="bg-white border border-gray-200 rounded-xl p-4 mb-8">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div class="flex items-center space-x-2">
					<span class="text-sm font-medium text-gray-700">Gestiona tus eventos:</span>
				</div>
				<div class="flex justify-center">
					<button 
						on:click={() => openModal('create')}
						class="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
						Agregar Evento
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Controles de vista y filtros -->
	<div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
		<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
			<!-- Selector de vista -->
			<div class="flex items-center space-x-2">
				<span class="text-sm font-medium text-gray-700">Vista:</span>
				<div class="flex rounded-lg border border-gray-300 overflow-hidden">
					<button 
						on:click={() => currentView = 'calendar'}
						class="px-3 py-2 text-sm font-medium transition-colors {currentView === 'calendar' 
							? 'bg-blue-500 text-white' 
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						📅 Calendario
					</button>
					<button 
						on:click={() => currentView = 'list'}
						class="px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 {currentView === 'list' 
							? 'bg-blue-500 text-white' 
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						📋 Lista
					</button>
					<button 
						on:click={() => currentView = 'kanban'}
						class="px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 {currentView === 'kanban' 
							? 'bg-blue-500 text-white' 
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						📊 Kanban
					</button>
					<button 
						on:click={() => currentView = 'timeline'}
						class="px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 {currentView === 'timeline' 
							? 'bg-blue-500 text-white' 
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						📈 Timeline
					</button>
				</div>
			</div>

			<!-- Filtros -->
			<div class="flex flex-col sm:flex-row gap-4">
				<!-- Filtro por tipo -->
				<div class="flex items-center space-x-2">
					<label for="filter-type" class="text-sm font-medium text-gray-700">Estado:</label>
					<select 
						id="filter-type"
						bind:value={filter}
						class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="all">Todos</option>
						<option value="upcoming">Próximos</option>
						<option value="overdue">Vencidos</option>
						<option value="completed">Completados</option>
					</select>
				</div>

				<!-- Filtro por materia -->
				<div class="flex items-center space-x-2">
					<label for="filter-subject" class="text-sm font-medium text-gray-700">Materia:</label>
					<select 
						id="filter-subject"
						bind:value={filterSubject}
						class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
				bind:selectedDate={selectedDate}
				{getSubjectName}
				getEventTypeIcon={currentEvents.getTypeIcon}
				{getPriorityColor}
				onToggleComplete={handleToggleComplete}
				onEditEvent={(event) => openModal('edit', event)}
				onDeleteEvent={handleDeleteEvent}
			/>
		{:else if currentView === 'list'}
		<ListView 
				events={categorized[filter]}
				{getSubjectName}
				getEventTypeIcon={currentEvents.getTypeIcon}
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
				getEventTypeIcon={currentEvents.getTypeIcon}
				{getPriorityColor}
				onToggleComplete={handleToggleComplete}
				onEditEvent={(event) => openModal('edit', event)}
				onDeleteEvent={handleDeleteEvent}
			/>
		{:else if currentView === 'timeline'}
			<TimelineView 
				events={categorized[filter]}
				{getSubjectName}
				getEventTypeIcon={currentEvents.getTypeIcon}
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
