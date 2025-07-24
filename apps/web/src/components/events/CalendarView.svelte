<script lang="ts">
	import type { Event } from '@ramo-libre/shared';

	export let events: Event[] = [];
	export let selectedDate: string;
	export let getSubjectName: (id: string) => string;
	export let getEventTypeIcon: (type: Event['type']) => string;
	export let getPriorityColor: (priority: string) => string;
	export let onToggleComplete: ((eventId: string) => void) | undefined = undefined;
	export let onEditEvent: ((event: Event) => void) | undefined = undefined;
	export let onDeleteEvent: ((eventId: string) => void) | undefined = undefined;

	let currentMonth = new Date();

	// Funciones auxiliares
	function formatDate(date: Date): string {
		// Usar fecha local para evitar desfases por zona horaria
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function getMonthName(date: Date): string {
		return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
	}

	function getDaysInMonth(date: Date): Date[] {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysInMonth = lastDay.getDate();
		
		// Obtener el primer día de la semana (0 = domingo, 1 = lunes, etc.)
		const firstDayOfWeek = firstDay.getDay();
		const startDate = new Date(firstDay);
		startDate.setDate(firstDay.getDate() - firstDayOfWeek);

		const days: Date[] = [];
		for (let i = 0; i < 42; i++) { // 6 semanas * 7 días
			const day = new Date(startDate);
			day.setDate(startDate.getDate() + i);
			days.push(day);
		}

		return days;
	}

	// Declaraciones reactivas para asegurar actualización automática
	$: calendarDays = getDaysInMonth(currentMonth);
	$: selectedDateEvents = events.filter(event => event.date === selectedDate);
	
	// Función reactiva para obtener eventos de cualquier fecha
	$: getEventsForDateReactive = (date: string) => events.filter(event => event.date === date);
	
	function isToday(date: Date): boolean {
		const today = new Date();
		return formatDate(date) === formatDate(today);
	}

	function isCurrentMonth(date: Date): boolean {
		return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
	}

	function previousMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
	}

	function nextMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
	}

	function goToToday() {
		const today = new Date();
		currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const todayFormatted = formatDate(today);
		if (todayFormatted !== selectedDate) {
			selectedDate = todayFormatted;
		}
	}

	function selectDate(date: Date) {
		const newDate = formatDate(date);
		if (newDate !== selectedDate) {
			selectedDate = newDate;
		}
	}
</script>

<div class="p-6">
	<!-- Header del calendario -->
	<div class="flex items-center justify-between mb-6">
		<div class="flex items-center space-x-4">
			<h2 class="text-xl font-bold text-gray-800 capitalize">{getMonthName(currentMonth)}</h2>
			<button 
				on:click={goToToday}
				class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
			>
				Hoy
			</button>
		</div>
		<div class="flex items-center space-x-2">
			<button 
				on:click={previousMonth}
				class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
			>
				◀
			</button>
			<button 
				on:click={nextMonth}
				class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
			>
				▶
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Calendario -->
		<div class="lg:col-span-2">
			<!-- Días de la semana -->
			<div class="grid grid-cols-7 gap-1 mb-2">
				{#each ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as day}
					<div class="p-2 text-center text-sm font-medium text-gray-600">
						{day}
					</div>
				{/each}
			</div>

			<!-- Días del mes -->
			<div class="grid grid-cols-7 gap-1">
				{#each calendarDays as day}
					{@const dayEvents = getEventsForDateReactive(formatDate(day))}
					{@const isTodayDay = isToday(day)}
					{@const isCurrentMonthDay = isCurrentMonth(day)}
					<button
						on:click={() => selectDate(day)}
						class="min-h-[80px] p-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
						class:bg-blue-50={isTodayDay}
						class:border-blue-300={isTodayDay}
						class:ring-2={formatDate(day) === selectedDate}
						class:ring-blue-500={formatDate(day) === selectedDate}
						class:text-gray-400={!isCurrentMonthDay}
						class:bg-gray-50={!isCurrentMonthDay}
					>
						<div class="text-left">
							<span class="text-sm font-medium" class:text-blue-600={isTodayDay}>
								{day.getDate()}
							</span>
							{#if dayEvents.length > 0}
								<div class="mt-1 space-y-1">
									{#each dayEvents.slice(0, 2) as event}
										<div class="text-xs px-1 py-0.5 rounded {getPriorityColor(event.priority)} truncate">
											{getEventTypeIcon(event.type)} {event.title}
										</div>
									{/each}
									{#if dayEvents.length > 2}
										<div class="text-xs text-gray-500">
											+{dayEvents.length - 2} más
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Panel de eventos del día seleccionado -->
		<div class="lg:col-span-1">
			<div class="bg-gray-50 rounded-lg p-4">
				<h3 class="text-lg font-semibold text-gray-800 mb-4">
					Eventos - {(() => {
						// Crear fecha local sin interpretación UTC
						const [year, month, day] = selectedDate.split('-').map(Number);
						const localDate = new Date(year, month - 1, day);
						return localDate.toLocaleDateString('es-ES', { 
							weekday: 'long', 
							year: 'numeric', 
							month: 'long', 
							day: 'numeric' 
						});
					})()}
				</h3>

				{#if selectedDateEvents.length === 0}
					<div class="text-center py-8">
						<div class="text-4xl mb-2">📅</div>
						<p class="text-gray-500 text-sm">No hay eventos para este día</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each selectedDateEvents as event}
							<div class="bg-white border border-gray-200 rounded-lg p-3">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="flex items-center space-x-2 mb-1">
											<span class="text-lg">{getEventTypeIcon(event.type)}</span>
											<h4 class="font-medium text-gray-800 text-sm">{event.title}</h4>
										</div>
										{#if event.time}
											<p class="text-xs text-gray-600 mb-1">
												🕐 {event.time}
												{#if event.endTime}
													- {event.endTime}
												{/if}
											</p>
										{/if}
										{#if event.subjectId}
											<p class="text-xs text-gray-600 mb-1">
												📚 {getSubjectName(event.subjectId)}
											</p>
										{/if}
										{#if event.location}
											<p class="text-xs text-gray-600 mb-1">
												📍 {event.location}
											</p>
										{/if}
										{#if event.description}
											<p class="text-xs text-gray-500 mt-2">{event.description}</p>
										{/if}
									</div>
									<div class="ml-2">
										<span class="text-xs px-2 py-1 rounded {getPriorityColor(event.priority)}">
											{event.priority === 'high' ? 'Alta' : event.priority === 'medium' ? 'Media' : 'Baja'}
										</span>
									</div>
								</div>
								
								<!-- Botones de acción y estado -->
								<div class="mt-2 flex items-center justify-between">
									{#if event.completed}
										<div class="flex items-center space-x-1">
											<span class="text-green-600">✅</span>
											<span class="text-xs text-green-600 font-medium">Completado</span>
										</div>
									{:else}
										<div></div>
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
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
