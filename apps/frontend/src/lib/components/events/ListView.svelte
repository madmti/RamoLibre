<script lang="ts">
	import type { Event, Subject } from '@ramo-libre/shared';

	export let events: Event[] = [];
	export const subjectList: Subject[] = [];
	export let getSubjectName: (id: string) => string;
	export let getEventTypeIcon: (type: string) => string;
	export let getEventTypeName: (type: string) => string;
	export let getPriorityColor: (priority: string) => string;
	export let getPriorityName: (priority: string) => string;
	export let onToggleComplete: ((eventId: string) => void) | undefined = undefined;
	export let onEditEvent: ((event: Event) => void) | undefined = undefined;
	export let onDeleteEvent: ((eventId: string) => void) | undefined = undefined;

	let sortBy: 'date' | 'priority' | 'type' | 'subject' = 'date';
	let sortOrder: 'asc' | 'desc' = 'asc';

	// Eventos ordenados
	$: sortedEvents = [...events].sort((a, b) => {
		let comparison = 0;
		
		switch (sortBy) {
			case 'date':
				comparison = a.date.localeCompare(b.date);
				if (comparison === 0 && a.time && b.time) {
					comparison = a.time.localeCompare(b.time);
				}
				break;
			case 'priority':
				const priorityOrder = { high: 3, medium: 2, low: 1 };
				comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
				break;
			case 'type':
				comparison = a.type.localeCompare(b.type);
				break;
			case 'subject':
				const subjectA = getSubjectName(a.subjectId || '');
				const subjectB = getSubjectName(b.subjectId || '');
				comparison = subjectA.localeCompare(subjectB);
				break;
		}
		
		return sortOrder === 'asc' ? comparison : -comparison;
	});

	function toggleSort(field: typeof sortBy) {
		if (sortBy === field) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = field;
			sortOrder = 'asc';
		}
	}

	function formatDate(dateString: string): string {
		// Crear fecha local sin interpretación UTC
		const [year, month, day] = dateString.split('-').map(Number);
		const date = new Date(year, month - 1, day);
		return date.toLocaleDateString('es-ES', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getDateStatus(dateString: string): 'today' | 'upcoming' | 'overdue' {
		const today = new Date();
		const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

		if (dateString === todayString) return 'today';
		if (dateString > todayString) return 'upcoming';
		return 'overdue';
	}

	function getDateStatusColor(status: string): string {
		switch (status) {
			case 'today': return 'text-blue-600 bg-blue-100';
			case 'upcoming': return 'text-green-600 bg-green-100';
			case 'overdue': return 'text-red-600 bg-red-100';
			default: return 'text-gray-600 bg-gray-100';
		}
	}
</script>

<div class="p-6">
	<!-- Header con controles de ordenamiento -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
		<h2 class="text-xl font-bold text-gray-800">
			Lista de Eventos ({events.length})
		</h2>
		
		<div class="flex items-center space-x-2">
			<span class="text-sm text-gray-600">Ordenar por:</span>
			<div class="flex rounded-lg border border-gray-300 overflow-hidden">
				<button 
					on:click={() => toggleSort('date')}
					class="px-3 py-2 text-sm transition-colors {sortBy === 'date' 
						? 'bg-blue-500 text-white' 
						: 'bg-white text-gray-700 hover:bg-gray-50'}"
				>
					📅 Fecha {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
				</button>
				<button 
					on:click={() => toggleSort('priority')}
					class="px-3 py-2 text-sm transition-colors border-l border-gray-300 {sortBy === 'priority' 
						? 'bg-blue-500 text-white' 
						: 'bg-white text-gray-700 hover:bg-gray-50'}"
				>
					⚡ Prioridad {sortBy === 'priority' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
				</button>
				<button 
					on:click={() => toggleSort('type')}
					class="px-3 py-2 text-sm transition-colors border-l border-gray-300 {sortBy === 'type' 
						? 'bg-blue-500 text-white' 
						: 'bg-white text-gray-700 hover:bg-gray-50'}"
				>
					🏷️ Tipo {sortBy === 'type' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
				</button>
				<button 
					on:click={() => toggleSort('subject')}
					class="px-3 py-2 text-sm transition-colors border-l border-gray-300 {sortBy === 'subject' 
						? 'bg-blue-500 text-white' 
						: 'bg-white text-gray-700 hover:bg-gray-50'}"
				>
					📚 Materia {sortBy === 'subject' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
				</button>
			</div>
		</div>
	</div>

	<!-- Lista de eventos -->
	{#if sortedEvents.length === 0}
		<div class="text-center py-12">
			<div class="text-6xl mb-4">📋</div>
			<h3 class="text-xl font-semibold text-gray-800 mb-2">No hay eventos</h3>
			<p class="text-gray-600">No se encontraron eventos con los filtros aplicados.</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each sortedEvents as event}
				{@const dateStatus = getDateStatus(event.date)}
				<div class="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
					<div class="flex items-start justify-between">
						<!-- Información principal -->
						<div class="flex-1">
							<div class="flex items-center space-x-3 mb-2">
								<span class="text-xl">{getEventTypeIcon(event.type)}</span>
								<div class="flex-1">
									<h3 class="font-semibold text-gray-800 {event.completed ? 'line-through text-gray-500' : ''}">
										{event.title}
									</h3>
									<div class="flex items-center space-x-3 mt-1">
										<span class="text-xs px-2 py-1 rounded {getDateStatusColor(dateStatus)}">
											{formatDate(event.date)}
										</span>
										{#if event.time}
											<span class="text-xs text-gray-600">
												🕐 {event.time}
												{#if event.endTime}
													- {event.endTime}
												{/if}
											</span>
										{/if}
										<span class="text-xs px-2 py-1 rounded {getPriorityColor(event.priority)}">
											{getPriorityName(event.priority)}
										</span>
									</div>
								</div>
							</div>

							<!-- Información adicional -->
							<div class="ml-8 space-y-1">
								{#if event.description}
									<p class="text-sm text-gray-600">{event.description}</p>
								{/if}
								
								<div class="flex flex-wrap items-center gap-4 text-xs text-gray-500">
									<span class="flex items-center space-x-1">
										<span>🏷️</span>
										<span>{getEventTypeName(event.type)}</span>
									</span>
									
									{#if event.subjectId}
										<span class="flex items-center space-x-1">
											<span>📚</span>
											<span>{getSubjectName(event.subjectId)}</span>
										</span>
									{/if}
									
									{#if event.location}
										<span class="flex items-center space-x-1">
											<span>📍</span>
											<span>{event.location}</span>
										</span>
									{/if}
									
									{#if event.reminder}
										<span class="flex items-center space-x-1">
											<span>🔔</span>
											<span>{event.reminder} min antes</span>
										</span>
									{/if}
								</div>
							</div>
						</div>

						<!-- Estado y acciones -->
						<div class="flex flex-col items-end space-y-2 ml-4">
							{#if event.completed}
								<div class="flex items-center space-x-1">
									<span class="text-green-600">✅</span>
									<span class="text-xs text-green-600 font-medium">Completado</span>
								</div>
							{:else if dateStatus === 'overdue'}
								<div class="flex items-center space-x-1">
									<span class="text-red-600">⚠️</span>
									<span class="text-xs text-red-600 font-medium">Vencido</span>
								</div>
							{:else if dateStatus === 'today'}
								<div class="flex items-center space-x-1">
									<span class="text-blue-600">📅</span>
									<span class="text-xs text-blue-600 font-medium">Hoy</span>
								</div>
							{/if}

							<!-- Botones de acción -->
							<div class="flex items-center space-x-1">
								<button 
									class="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
									title="Editar evento"
									on:click={() => onEditEvent ? onEditEvent(event) : null}
								>
									✏️
								</button>
								<button 
									class="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
									title="{event.completed ? 'Marcar como pendiente' : 'Marcar como completado'}"
									on:click={() => onToggleComplete ? onToggleComplete(event.id) : null}
								>
									{event.completed ? '↩️' : '✅'}
								</button>
								<button 
									class="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
									title="Eliminar evento"
									on:click={() => onDeleteEvent ? onDeleteEvent(event.id) : null}
								>
									🗑️
								</button>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
