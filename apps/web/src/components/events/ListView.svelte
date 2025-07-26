<script lang="ts">
	import type { Event } from '@ramo-libre/shared';

	// ICONS
	import GradeIcon from '$embedded-icons/grade.svg?component';
	import BookIcon from '$embedded-icons/book.svg?component';
	import ClockIcon from '$embedded-icons/clock.svg?component';
	import HandshakeIcon from '$embedded-icons/handshake.svg?component';
	import ColChartIcon from '$embedded-icons/col-chart.svg?component';
	import CalendarCheckIcon from '$embedded-icons/calendar-check.svg?component';
	import IdeaIcon from '$embedded-icons/idea.svg?component';
	import CheckMarkIcon from '$embedded-icons/check-mark.svg?component';
	import AlarmIcon from '$embedded-icons/alarm.svg?component';
	import PinIcon from '$embedded-icons/pin.svg?component';
	import EditIcon from '$embedded-icons/edit.svg?component';
	import UndoIcon from '$embedded-icons/undo.svg?component';
	import TrashIcon from '$embedded-icons/trash.svg?component';
	import CalendarIcon from '$embedded-icons/calendar.svg?component';
	import WarningIcon from '$embedded-icons/warning.svg?component';
	import ZapIcon from '$embedded-icons/zap.svg?component';

	export let events: Event[] = [];
	export let getSubjectName: (id: string) => string;
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
			day: 'numeric',
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
			case 'today':
				return 'text-blue-600 bg-blue-100';
			case 'upcoming':
				return 'text-green-600 bg-green-100';
			case 'overdue':
				return 'text-red-600 bg-red-100';
			default:
				return 'text-gray-600 bg-gray-100';
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
					class="px-3 py-2 text-sm transition-colors flex items-center {sortBy === 'date'
						? 'bg-blue-500 text-white'
						: 'bg-white text-gray-700 hover:bg-gray-50'}"
				>
					<CalendarIcon class="inline-block w-4 h-4 mr-1" />
					Fecha {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
				</button>
				<button
					on:click={() => toggleSort('priority')}
					class="px-3 py-2 text-sm transition-colors border-l flex items-center border-gray-300 {sortBy ===
					'priority'
						? 'bg-blue-500 text-white'
						: 'bg-white text-gray-700 hover:bg-gray-50'}"
				>
					<ZapIcon class="inline-block w-4 h-4 mr-1" />
					Prioridad {sortBy === 'priority' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
				</button>
				<button
					on:click={() => toggleSort('type')}
					class="px-3 py-2 text-sm transition-colors flex items-center border-l border-gray-300 {sortBy ===
					'type'
						? 'bg-blue-500 text-white'
						: 'bg-white text-gray-700 hover:bg-gray-50'}"
				>
					<GradeIcon class="inline-block w-4 h-4 mr-1" />
					Tipo {sortBy === 'type' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
				</button>
				<button
					on:click={() => toggleSort('subject')}
					class="px-3 py-2 text-sm transition-colors flex items-center border-l border-gray-300 {sortBy ===
					'subject'
						? 'bg-blue-500 text-white'
						: 'bg-white text-gray-700 hover:bg-gray-50'}"
				>
					<BookIcon class="inline-block w-4 h-4 mr-1" />
					Materia {sortBy === 'subject' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
				</button>
			</div>
		</div>
	</div>

	<!-- Lista de eventos -->
	{#if sortedEvents.length === 0}
		<div class="text-center py-12">
			<div class="text-6xl mb-4">
				<WarningIcon class="inline-block w-12 h-12 text-gray-400" />
			</div>
			<h3 class="text-xl font-semibold text-gray-800 mb-2">No hay eventos</h3>
			<p class="text-gray-600">No se encontraron eventos con los filtros aplicados.</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each sortedEvents as event}
				{@const dateStatus = getDateStatus(event.date)}
				<div
					class="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
				>
					<div class="flex items-start justify-between">
						<!-- Información principal -->
						<div class="flex-1">
							<div class="flex items-center space-x-3 mb-2">
								{#if event.type === 'exam'}
									<GradeIcon class="inline-block w-4 h-4 mr-1" />
								{:else if event.type === 'assignment'}
									<IdeaIcon class="inline-block w-4 h-4 mr-1" />
								{:else if event.type === 'deadline'}
									<AlarmIcon class="inline-block w-4 h-4 mr-1" />
								{:else if event.type === 'meeting'}
									<HandshakeIcon class="inline-block w-4 h-4 mr-1" />
								{:else if event.type === 'project'}
									<ColChartIcon class="inline-block w-4 h-4 mr-1" />
								{:else if event.type === 'class'}
									<BookIcon class="inline-block w-4 h-4 mr-1" />
								{:else}
									<CalendarCheckIcon class="inline-block w-4 h-4 mr-1" />
								{/if}
								<div class="flex-1">
									<h3
										class="font-semibold text-gray-800 {event.completed
											? 'line-through text-gray-500'
											: ''}"
									>
										{event.title}
									</h3>
									<div class="flex items-center space-x-3 mt-1">
										<span
											class="text-xs px-2 py-1 rounded {getDateStatusColor(
												dateStatus
											)}"
										>
											{formatDate(event.date)}
										</span>
										{#if event.time}
											<span class="text-xs text-gray-600">
												<ClockIcon class="inline-block w-4 h-4 mr-1" />
												{event.time}
												{#if event.endTime}
													- {event.endTime}
												{/if}
											</span>
										{/if}
										<span
											class="text-xs px-2 py-1 rounded {getPriorityColor(
												event.priority
											)}"
										>
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

								<div
									class="flex flex-wrap items-center gap-4 text-xs text-gray-500"
								>
									<span class="flex items-center space-x-1">
										<GradeIcon class="inline-block w-4 h-4" />
										<span>{getEventTypeName(event.type)}</span>
									</span>

									{#if event.subjectId}
										<span class="flex items-center space-x-1">
											<BookIcon class="inline-block w-4 h-4" />
											<span>{getSubjectName(event.subjectId)}</span>
										</span>
									{/if}

									{#if event.location}
										<span class="flex items-center space-x-1">
											<PinIcon class="inline-block w-4 h-4" />
											<span>{event.location}</span>
										</span>
									{/if}

									{#if event.reminder}
										<span class="flex items-center space-x-1">
											<AlarmIcon class="inline-block w-4 h-4" />
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
									<CheckMarkIcon class="inline-block w-4 h-4 text-green-600" />
									<span class="text-xs text-green-600 font-medium"
										>Completado</span
									>
								</div>
							{:else if dateStatus === 'overdue'}
								<div class="flex items-center space-x-1">
									<WarningIcon class="inline-block w-4 h-4 text-red-600" />
									<span class="text-xs text-red-600 font-medium">Vencido</span>
								</div>
							{:else if dateStatus === 'today'}
								<div class="flex items-center space-x-1">
									<CalendarIcon class="inline-block w-4 h-4 text-blue-600" />
									<span class="text-xs text-blue-600 font-medium">Hoy</span>
								</div>
							{/if}

							<!-- Botones de acción -->
							<div class="flex items-center space-x-1">
								<button
									class="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
									title="Editar evento"
									on:click={() => (onEditEvent ? onEditEvent(event) : null)}
								>
									<EditIcon class="inline-block w-4 h-4" />
								</button>
								<button
									class="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
									title={event.completed
										? 'Marcar como pendiente'
										: 'Marcar como completado'}
									on:click={() =>
										onToggleComplete ? onToggleComplete(event.id) : null}
								>
                                    {#if event.completed}
                                        <UndoIcon class="inline-block w-4 h-4" />
                                    {:else}
                                        <CheckMarkIcon class="inline-block w-4 h-4" />
                                    {/if}
								</button>
								<button
									class="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
									title="Eliminar evento"
									on:click={() =>
										onDeleteEvent ? onDeleteEvent(event.id) : null}
								>
									<TrashIcon class="inline-block w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
