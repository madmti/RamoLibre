<script lang="ts">
	import { onMount } from 'svelte';
	import { eventService, events } from '$lib/stores/events';
	import { subjects } from '$lib/stores/schedule';
	import { currentUser, userPreferences } from '$lib/stores/user';
	import CalendarView from '$lib/components/events/CalendarView.svelte';
	import ListView from '$lib/components/events/ListView.svelte';
	import KanbanView from '$lib/components/events/KanbanView.svelte';
	import TimelineView from '$lib/components/events/TimelineView.svelte';
	import EventModal from '$lib/components/modals/EventModal.svelte';
	import type { Event, Subject, User, UserPreferences } from '@ramo-libre/shared';
	
	let user: User | null = null;
	let preferences: UserPreferences;
	let eventList: Event[] = [];
	let subjectList: Subject[] = [];
	let currentView: 'calendar' | 'list' | 'kanban' | 'timeline' = 'calendar';
	let selectedDate: string = (() => {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, '0');
		const day = String(today.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	})();
	let filterType: 'all' | 'upcoming' | 'overdue' | 'completed' = 'all';
	let filterSubject: string = 'all';

	// Modal state
	let isModalOpen = false;
	let modalMode: 'create' | 'edit' = 'create';
	let editingEvent: Event | null = null;

	// Estadísticas calculadas
	$: upcomingEvents = eventList.filter(e => {
		const today = new Date();
		const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
		return e.date >= todayString && !e.completed;
	});

	$: overdueEvents = eventList.filter(e => {
		const today = new Date();
		const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
		return e.date < todayString && !e.completed;
	});

	$: completedEvents = eventList.filter(e => e.completed);

	// Eventos filtrados según la selección actual
	$: filteredEvents = (() => {
		let filtered = eventList;

		// Filtrar por tipo
		switch (filterType) {
			case 'upcoming':
				filtered = upcomingEvents;
				break;
			case 'overdue':
				filtered = overdueEvents;
				break;
			case 'completed':
				filtered = completedEvents;
				break;
		}

		// Filtrar por materia
		if (filterSubject !== 'all') {
			filtered = filtered.filter(e => e.subjectId === filterSubject);
		}

		return filtered;
	})();

	onMount(() => {
		// Inicializar servicios
		eventService.initialize();

		// Cargar eventos existentes desde localStorage
		eventService.loadEvents();

		const unsubscribeUser = currentUser.subscribe(value => {
			user = value;
		});

		const unsubscribePreferences = userPreferences.subscribe(value => {
			preferences = value;
			// Aplicar vista preferida del usuario
			if (value?.eventsView) {
				currentView = value.eventsView;
			}
		});

		const unsubscribeEvents = events.subscribe(value => {
			eventList = value;
		});

		const unsubscribeSubjects = subjects.subscribe(value => {
			subjectList = value;
		});

		return () => {
			unsubscribeUser();
			unsubscribePreferences();
			unsubscribeEvents();
			unsubscribeSubjects();
		};
	});

	function getSubjectName(subjectId: string): string {
		const subject = subjectList.find(s => s.id === subjectId);
		return subject ? subject.name : 'Sin materia';
	}

	function getEventTypeIcon(type: string): string {
		switch (type) {
			case 'exam': return '📝';
			case 'assignment': return '📋';
			case 'project': return '💼';
			case 'deadline': return '⏰';
			case 'class': return '👨‍🏫';
			case 'meeting': return '🤝';
			default: return '📅';
		}
	}

	function getEventTypeName(type: string): string {
		switch (type) {
			case 'exam': return 'Examen';
			case 'assignment': return 'Tarea';
			case 'project': return 'Proyecto';
			case 'deadline': return 'Fecha límite';
			case 'class': return 'Clase';
			case 'meeting': return 'Reunión';
			default: return 'Evento';
		}
	}

	function getPriorityColor(priority: string): string {
		switch (priority) {
			case 'high': return 'text-red-600 bg-red-100';
			case 'medium': return 'text-yellow-600 bg-yellow-100';
			case 'low': return 'text-green-600 bg-green-100';
			default: return 'text-gray-600 bg-gray-100';
		}
	}

	function getPriorityName(priority: string): string {
		switch (priority) {
			case 'high': return 'Alta';
			case 'medium': return 'Media';
			case 'low': return 'Baja';
			default: return 'Normal';
		}
	}

	// Funciones para manejar eventos
	function handleAddEvent() {
		modalMode = 'create';
		editingEvent = null;
		isModalOpen = true;
	}

	function handleEditEvent(event: Event) {
		modalMode = 'edit';
		editingEvent = event;
		isModalOpen = true;
	}

	function handleCreateEvent(eventData: any) {
		eventService.addEvent(eventData.detail, user?.id);
	}

	function handleUpdateEvent(eventData: any) {
		const { id, data } = eventData.detail;
		eventService.updateEvent(id, data);
	}

	function handleDeleteEvent(eventId: string) {
		eventService.deleteEvent(eventId);
	}

	function handleToggleComplete(eventId: string) {
		eventService.toggleEventCompleted(eventId);
	}

	function handleModalClose() {
		isModalOpen = false;
		editingEvent = null;
	}
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
					<p class="text-2xl font-bold text-blue-800">{upcomingEvents.length}</p>
				</div>
				<div class="text-2xl">📋</div>
			</div>
		</div>
		<div class="bg-red-50 border border-red-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-red-600 text-sm font-medium">Vencidos</p>
					<p class="text-2xl font-bold text-red-800">{overdueEvents.length}</p>
				</div>
				<div class="text-2xl">⚠️</div>
			</div>
		</div>
		<div class="bg-green-50 border border-green-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-green-600 text-sm font-medium">Completados</p>
					<p class="text-2xl font-bold text-green-800">{completedEvents.length}</p>
				</div>
				<div class="text-2xl">✅</div>
			</div>
		</div>
		<div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-purple-600 text-sm font-medium">Total</p>
					<p class="text-2xl font-bold text-purple-800">{eventList.length}</p>
				</div>
				<div class="text-2xl">📊</div>
			</div>
		</div>
	</div>

	<!-- Controles de administración -->
	{#if eventList.length === 0}
		<div class="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
			<div class="text-center">
				<div class="text-4xl mb-4">📅</div>
				<h3 class="text-lg font-semibold text-gray-800 mb-2">No tienes eventos</h3>
				<p class="text-gray-600 mb-4">Empieza agregando tu primer evento.</p>
				<div class="flex justify-center">
					<button 
						on:click={handleAddEvent}
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
						on:click={handleAddEvent}
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
						bind:value={filterType}
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
						{#each subjectList as subject}
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
				events={filteredEvents}
				{subjectList}
				bind:selectedDate
				{getSubjectName}
				{getEventTypeIcon}
				{getPriorityColor}
				onToggleComplete={handleToggleComplete}
				onEditEvent={handleEditEvent}
				onDeleteEvent={handleDeleteEvent}
			/>
		{:else if currentView === 'list'}
			<ListView 
				events={filteredEvents}
				{subjectList}
				{getSubjectName}
				{getEventTypeIcon}
				{getEventTypeName}
				{getPriorityColor}
				{getPriorityName}
				onToggleComplete={handleToggleComplete}
				onEditEvent={handleEditEvent}
				onDeleteEvent={handleDeleteEvent}
			/>
		{:else if currentView === 'kanban'}
			<KanbanView 
				events={filteredEvents}
				{subjectList}
				{getSubjectName}
				{getEventTypeIcon}
				{getPriorityColor}
				onToggleComplete={handleToggleComplete}
				onEditEvent={handleEditEvent}
				onDeleteEvent={handleDeleteEvent}
			/>
		{:else if currentView === 'timeline'}
			<TimelineView 
				events={filteredEvents}
				{subjectList}
				{getSubjectName}
				{getEventTypeIcon}
				{getEventTypeName}
				{getPriorityColor}
				onToggleComplete={handleToggleComplete}
				onEditEvent={handleEditEvent}
				onDeleteEvent={handleDeleteEvent}
			/>
		{/if}
	</div>
</div>

<!-- Modal de eventos -->
<EventModal
	bind:isOpen={isModalOpen}
	{subjectList}
	mode={modalMode}
	event={editingEvent}
	on:create={handleCreateEvent}
	on:save={handleUpdateEvent}
	on:delete={(e) => handleDeleteEvent(e.detail)}
	on:close={handleModalClose}
/>
