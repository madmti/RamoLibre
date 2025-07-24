<script lang="ts">
	import type { Event, Subject } from '@ramo-libre/shared';

	export let events: Event[] = [];
	export let getSubjectName: (id: string) => string;
	export let getEventTypeIcon: (type: string) => string;
	export let getEventTypeName: (type: string) => string;
	export let getPriorityColor: (priority: string) => string;
	export let onToggleComplete: ((eventId: string) => void) | undefined = undefined;
	export let onEditEvent: ((event: Event) => void) | undefined = undefined;
	export let onDeleteEvent: ((eventId: string) => void) | undefined = undefined;

	let timelineView: 'week' | 'month' = 'week';
	let selectedDate = new Date();

	// Funciones auxiliares para fechas locales
	function createLocalDate(dateString: string): Date {
		const [year, month, day] = dateString.split('-').map(Number);
		return new Date(year, month - 1, day);
	}

	function getLocalDateString(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	// Obtener eventos para el período seleccionado (reactivo)
	$: timelineEvents = getEventsForPeriod(selectedDate, timelineView, events);

	// Texto del rango de fechas (reactivo)
	$: dateRangeText = getDateRangeText(selectedDate, timelineView);

	function getEventsForPeriod(date: Date, period: 'week' | 'month', eventList: Event[]): Event[] {
		const startDate = new Date(date);
		const endDate = new Date(date);

		if (period === 'week') {
			// Obtener el lunes de la semana
			const day = startDate.getDay();
			const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
			startDate.setDate(diff);
			endDate.setDate(startDate.getDate() + 6);
		} else {
			// Primer y último día del mes
			startDate.setDate(1);
			endDate.setMonth(endDate.getMonth() + 1, 0);
		}

		const startDateString = getLocalDateString(startDate);
		const endDateString = getLocalDateString(endDate);

		return eventList.filter(event => {
			return event.date >= startDateString && event.date <= endDateString;
		}).sort((a, b) => {
			const dateCompare = a.date.localeCompare(b.date);
			if (dateCompare === 0 && a.time && b.time) {
				return a.time.localeCompare(b.time);
			}
			return dateCompare;
		});
	}

	function getDateRangeText(date: Date, view: 'week' | 'month'): string {
		if (view === 'week') {
			const startDate = new Date(date);
			const day = startDate.getDay();
			const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
			startDate.setDate(diff);
			
			const endDate = new Date(startDate);
			endDate.setDate(startDate.getDate() + 6);

			return `${startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
		} else {
			return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
		}
	}

	function navigatePrevious() {
		if (timelineView === 'week') {
			selectedDate.setDate(selectedDate.getDate() - 7);
		} else {
			selectedDate.setMonth(selectedDate.getMonth() - 1);
		}
		selectedDate = new Date(selectedDate);
	}

	function navigateNext() {
		if (timelineView === 'week') {
			selectedDate.setDate(selectedDate.getDate() + 7);
		} else {
			selectedDate.setMonth(selectedDate.getMonth() + 1);
		}
		selectedDate = new Date(selectedDate);
	}

	function goToToday() {
		selectedDate = new Date();
	}

	function formatEventDate(dateString: string): string {
		// Crear fecha local sin interpretación UTC
		const [year, month, day] = dateString.split('-').map(Number);
		const date = new Date(year, month - 1, day);
		const today = new Date();
		const todayString = getLocalDateString(today);
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);
		const tomorrowString = getLocalDateString(tomorrow);
		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);
		const yesterdayString = getLocalDateString(yesterday);

		if (dateString === todayString) {
			return 'Hoy';
		} else if (dateString === tomorrowString) {
			return 'Mañana';
		} else if (dateString === yesterdayString) {
			return 'Ayer';
		} else {
			return date.toLocaleDateString('es-ES', {
				weekday: 'long',
				day: 'numeric',
				month: 'long'
			});
		}
	}

	// Agrupar eventos por fecha
	$: eventsByDate = timelineEvents.reduce((acc, event) => {
		const dateKey = event.date;
		if (!acc[dateKey]) {
			acc[dateKey] = [];
		}
		acc[dateKey].push(event);
		return acc;
	}, {} as Record<string, Event[]>);

	$: sortedDates = Object.keys(eventsByDate).sort();
</script>

<div class="p-4 sm:p-6">
	<!-- Header con controles -->
	<div class="flex flex-col gap-4 mb-6">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<div class="flex items-center space-x-4">
				<h2 class="text-xl font-bold text-gray-800">Timeline</h2>
				<div class="flex rounded-lg border border-gray-300 overflow-hidden">
					<button 
						on:click={() => timelineView = 'week'}
						class="px-3 py-2 text-sm transition-colors {timelineView === 'week' 
							? 'bg-blue-500 text-white' 
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						Semana
					</button>
					<button 
						on:click={() => timelineView = 'month'}
						class="px-3 py-2 text-sm transition-colors border-l border-gray-300 {timelineView === 'month' 
							? 'bg-blue-500 text-white' 
							: 'bg-white text-gray-700 hover:bg-gray-50'}"
					>
						Mes
					</button>
				</div>
			</div>

			<div class="flex items-center justify-between sm:justify-end space-x-2">
				<div class="flex items-center gap-1">
					<button 
						on:click={navigatePrevious}
						class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
					>
						◀
					</button>
					<span class="text-sm font-medium text-gray-700 min-w-[160px] sm:min-w-[200px] text-center px-2">
						{dateRangeText}
					</span>
					<button 
						on:click={navigateNext}
						class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
					>
						▶
					</button>
				</div>
				<button 
					on:click={goToToday}
					class="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
				>
					Hoy
				</button>
			</div>
		</div>
	</div>

	<!-- Timeline -->
	<div class="bg-gray-50 rounded-xl p-4 sm:p-6">
		{#if timelineEvents.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">📈</div>
				<h3 class="text-xl font-semibold text-gray-800 mb-2">No hay eventos</h3>
				<p class="text-gray-600">No hay eventos programados para este período.</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each sortedDates as date}
					<div class="relative">
						<!-- Línea del timeline -->
						<div class="absolute left-2 sm:left-4 top-8 bottom-0 w-0.5 bg-gray-300"></div>
						
						<!-- Fecha -->
						<div class="flex items-center space-x-3 sm:space-x-4 mb-4">
							<div class="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center relative z-10">
								<span class="text-white text-xs font-bold">
									{createLocalDate(date).getDate()}
								</span>
							</div>
							<h3 class="text-base sm:text-lg font-semibold text-gray-800 capitalize">
								{formatEventDate(date)}
							</h3>
						</div>

						<!-- Eventos del día -->
						<div class="ml-6 sm:ml-12 space-y-3">
							{#each eventsByDate[date] as event}
								<div class="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
									<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
										<div class="flex-1">
											<!-- Header del evento -->
											<div class="flex items-start space-x-3 mb-3">
												<span class="text-lg sm:text-xl mt-0.5">{getEventTypeIcon(event.type)}</span>
												<div class="flex-1 min-w-0">
													<h4 class="font-semibold text-gray-800 {event.completed ? 'line-through text-gray-500' : ''} text-sm sm:text-base leading-tight">
														{event.title}
													</h4>
													
													<!-- Info badges - stack en móvil, inline en desktop -->
													<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2">
														{#if event.time}
															<span class="text-sm text-gray-600 order-1">
																🕐 {event.time}
																{#if event.endTime}
																	- {event.endTime}
																{/if}
															</span>
														{/if}
														
														<div class="flex items-center gap-2 order-2">
															<span class="text-xs px-2 py-1 rounded {getPriorityColor(event.priority)} whitespace-nowrap">
																{event.priority === 'high' ? 'Alta' : event.priority === 'medium' ? 'Media' : 'Baja'}
															</span>
															<span class="text-xs text-gray-500 whitespace-nowrap">
																{getEventTypeName(event.type)}
															</span>
														</div>
													</div>
												</div>
											</div>

											{#if event.description}
												<p class="text-sm text-gray-600 mb-3 pl-8 sm:pl-9">{event.description}</p>
											{/if}

											<!-- Información adicional -->
											<div class="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs text-gray-500 pl-8 sm:pl-9">
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
														<span>Recordatorio {event.reminder} min antes</span>
													</span>
												{/if}
											</div>
										</div>

										<!-- Estado y acciones -->
										<div class="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2 sm:gap-2 sm:ml-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
											<!-- Estado del evento -->
											<div class="flex items-center">
												{#if event.completed}
													<div class="flex items-center space-x-1">
														<span class="text-green-600">✅</span>
														<span class="text-xs text-green-600 font-medium">Completado</span>
													</div>
												{:else}
													{@const today = new Date()}
													{@const todayString = getLocalDateString(today)}
													{@const isOverdue = event.date < todayString}
													{@const isToday = event.date === todayString}
													
													{#if isOverdue}
														<div class="flex items-center space-x-1">
															<span class="text-red-600">⚠️</span>
															<span class="text-xs text-red-600 font-medium">Vencido</span>
														</div>
													{:else if isToday}
														<div class="flex items-center space-x-1">
															<span class="text-blue-600">📅</span>
															<span class="text-xs text-blue-600 font-medium">Hoy</span>
														</div>
													{/if}
												{/if}
											</div>

											<!-- Botones de acción -->
											<div class="flex items-center space-x-1">
												<button 
													class="p-1.5 sm:p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
													title="Editar evento"
													on:click={() => onEditEvent ? onEditEvent(event) : null}
												>
													✏️
												</button>
												<button 
													class="p-1.5 sm:p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
													title="{event.completed ? 'Marcar como pendiente' : 'Marcar como completado'}"
													on:click={() => onToggleComplete ? onToggleComplete(event.id) : null}
												>
													{event.completed ? '↩️' : '✅'}
												</button>
												<button 
													class="p-1.5 sm:p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
