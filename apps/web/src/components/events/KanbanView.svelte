<script lang="ts">
	import type { Event } from '@ramo-libre/shared';

	// ICONS
	import GradeIcon from '$embedded-icons/grade.svg?component';
	import BookIcon from '$embedded-icons/book.svg?component';
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
	import NextForwardIcon from '$embedded-icons/next-forward.svg?component';
	import CalendarIcon from '$embedded-icons/calendar.svg?component';
	import WarningIcon from '$embedded-icons/warning.svg?component';
	import SparklesIcon from '$embedded-icons/sparkles.svg?component';
	import TargetIcon from '$embedded-icons/target.svg?component';

	export let events: Event[] = [];
	export let getSubjectName: (id: string) => string;
	export let getPriorityColor: (priority: string) => string;
	export let onToggleComplete: ((eventId: string) => void) | undefined = undefined;
	export let onEditEvent: ((event: Event) => void) | undefined = undefined;
	export let onDeleteEvent: ((eventId: string) => void) | undefined = undefined;

	// Clasificar eventos por estado
	$: eventsByStatus = {
		pending: events.filter((e) => {
			const today = new Date();
			const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
			return e.date >= todayString && !e.completed;
		}),
		overdue: events.filter((e) => {
			const today = new Date();
			const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
			return e.date < todayString && !e.completed;
		}),
		completed: events.filter((e) => e.completed),
	};

	function formatDate(dateString: string): string {
		// Crear fecha local sin interpretación UTC
		const [year, month, day] = dateString.split('-').map(Number);
		const date = new Date(year, month - 1, day);
		const today = new Date();
		const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);
		const tomorrowString = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

		if (dateString === todayString) {
			return 'Hoy';
		} else if (dateString === tomorrowString) {
			return 'Mañana';
		} else {
			return date.toLocaleDateString('es-ES', {
				month: 'short',
				day: 'numeric',
			});
		}
	}

	function getDaysUntil(dateString: string): number {
		const [year, month, day] = dateString.split('-').map(Number);
		const eventDate = new Date(year, month - 1, day);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		eventDate.setHours(0, 0, 0, 0);
		const diffTime = eventDate.getTime() - today.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}
</script>

<div class="p-6">
	<h2 class="text-xl font-bold text-gray-800 mb-6">Vista Kanban</h2>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<!-- Columna: Próximos -->
		<div class="bg-blue-50 rounded-xl border border-blue-200">
			<div class="p-4 border-b border-blue-200">
				<div class="flex items-center justify-between">
					<h3 class="font-semibold text-blue-800 flex items-center">
						<NextForwardIcon class="inline-block w-4 h-4 mr-1" />
						Próximos
					</h3>
					<span class="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
						{eventsByStatus.pending.length}
					</span>
				</div>
			</div>
			<div class="p-4 space-y-3 max-h-96 overflow-y-auto">
				{#each eventsByStatus.pending as event}
					{@const daysUntil = getDaysUntil(event.date)}
					<div
						class="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
					>
						<div class="flex items-start justify-between mb-2">
							<div class="flex items-center space-x-2">
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
								<h4 class="font-medium text-gray-800 text-sm">{event.title}</h4>
							</div>
							<span
								class="text-xs px-2 py-1 rounded {getPriorityColor(event.priority)}"
							>
								{event.priority === 'high'
									? 'Alta'
									: event.priority === 'medium'
										? 'Media'
										: 'Baja'}
							</span>
						</div>

						<div class="text-xs text-gray-600 space-y-1">
							<div class="flex items-center space-x-1">
								<CalendarIcon class="inline-block w-4 h-4" />
								<span>{formatDate(event.date)}</span>
								{#if event.time}
									<span>• {event.time}</span>
								{/if}
								{#if daysUntil === 0}
									<span class="text-blue-600 font-medium">• Hoy</span>
								{:else if daysUntil === 1}
									<span class="text-orange-600 font-medium">• Mañana</span>
								{:else if daysUntil <= 3}
									<span class="text-yellow-600 font-medium"
										>• En {daysUntil} días</span
									>
								{/if}
							</div>

							{#if event.subjectId}
								<div class="flex items-center space-x-1">
									<BookIcon class="inline-block w-4 h-4" />
									<span>{getSubjectName(event.subjectId)}</span>
								</div>
							{/if}

							{#if event.location}
								<div class="flex items-center space-x-1">
									<PinIcon class="inline-block w-4 h-4" />
									<span>{event.location}</span>
								</div>
							{/if}
						</div>

						{#if event.description}
							<p class="text-xs text-gray-500 mt-2 line-clamp-2">
								{event.description}
							</p>
						{/if}

						<div class="flex items-center justify-end space-x-1 mt-2">
							<button
								class="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
								title="Editar"
								on:click={() => (onEditEvent ? onEditEvent(event) : null)}
							>
								<EditIcon class="inline-block w-4 h-4" />
							</button>
							<button
								class="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
								title="Marcar como completado"
								on:click={() =>
									onToggleComplete ? onToggleComplete(event.id) : null}
							>
								<CheckMarkIcon class="inline-block w-4 h-4" />
							</button>
						</div>
					</div>
				{/each}

				{#if eventsByStatus.pending.length === 0}
					<div class="text-center py-8 flex flex-col items-center">
						<GradeIcon class="text-3xl mb-2 w-8 h-8 text-blue-500" />
						<p class="text-blue-600 text-sm">No hay eventos próximos</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Columna: Vencidos -->
		<div class="bg-red-50 rounded-xl border border-red-200">
			<div class="p-4 border-b border-red-200">
				<div class="flex items-center justify-between">
					<h3 class="font-semibold text-red-800 flex items-center">
						<WarningIcon class="inline-block w-4 h-4 mr-1" />
						Vencidos
					</h3>
					<span class="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full">
						{eventsByStatus.overdue.length}
					</span>
				</div>
			</div>
			<div class="p-4 space-y-3 max-h-96 overflow-y-auto">
				{#each eventsByStatus.overdue as event}
					{@const daysOverdue = Math.abs(getDaysUntil(event.date))}
					<div
						class="bg-white rounded-lg border border-red-200 p-3 shadow-sm hover:shadow-md transition-shadow"
					>
						<div class="flex items-start justify-between mb-2">
							<div class="flex items-center space-x-2">
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
								<h4 class="font-medium text-gray-800 text-sm">{event.title}</h4>
							</div>
							<span
								class="text-xs px-2 py-1 rounded {getPriorityColor(event.priority)}"
							>
								{event.priority === 'high'
									? 'Alta'
									: event.priority === 'medium'
										? 'Media'
										: 'Baja'}
							</span>
						</div>

						<div class="text-xs text-gray-600 space-y-1">
							<div class="flex items-center space-x-1">
								<CalendarIcon class="inline-block w-4 h-4" />
								<span>{formatDate(event.date)}</span>
								{#if event.time}
									<span>• {event.time}</span>
								{/if}
								<span class="text-red-600 font-medium">
									• Vencido {daysOverdue === 0
										? 'hoy'
										: `hace ${daysOverdue} día${daysOverdue > 1 ? 's' : ''}`}
								</span>
							</div>

							{#if event.subjectId}
								<div class="flex items-center space-x-1">
									<BookIcon class="inline-block w-4 h-4" />
									<span>{getSubjectName(event.subjectId)}</span>
								</div>
							{/if}

							{#if event.location}
								<div class="flex items-center space-x-1">
									<PinIcon class="inline-block w-4 h-4" />
									<span>{event.location}</span>
								</div>
							{/if}
						</div>

						{#if event.description}
							<p class="text-xs text-gray-500 mt-2 line-clamp-2">
								{event.description}
							</p>
						{/if}

						<div class="flex items-center justify-end space-x-1 mt-2">
							<button
								class="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
								title="Editar"
								on:click={() => (onEditEvent ? onEditEvent(event) : null)}
							>
								<EditIcon class="inline-block w-4 h-4" />
							</button>
							<button
								class="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
								title="Marcar como completado"
								on:click={() =>
									onToggleComplete ? onToggleComplete(event.id) : null}
							>
								<CheckMarkIcon class="inline-block w-4 h-4" />
							</button>
							<button
								class="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
								title="Eliminar"
								on:click={() => (onDeleteEvent ? onDeleteEvent(event.id) : null)}
							>
								<TrashIcon class="inline-block w-4 h-4" />
							</button>
						</div>
					</div>
				{/each}

				{#if eventsByStatus.overdue.length === 0}
					<div class="text-center py-8">
						<div class="text-3xl mb-2">
							<SparklesIcon class="inline-block w-8 h-8 text-yellow-500" />
						</div>
						<p class="text-red-600 text-sm">¡Genial! No hay eventos vencidos</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Columna: Completados -->
		<div class="bg-green-50 rounded-xl border border-green-200">
			<div class="p-4 border-b border-green-200">
				<div class="flex items-center justify-between">
					<h3 class="font-semibold text-green-800 flex items-center">
						<CheckMarkIcon class="inline-block w-4 h-4 mr-1" />
						Completados
					</h3>
					<span class="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
						{eventsByStatus.completed.length}
					</span>
				</div>
			</div>
			<div class="p-4 space-y-3 max-h-96 overflow-y-auto">
				{#each eventsByStatus.completed as event}
					<div
						class="bg-white rounded-lg border border-green-200 p-3 shadow-sm hover:shadow-md transition-shadow opacity-75"
					>
						<div class="flex items-start justify-between mb-2">
							<div class="flex items-center space-x-2">
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
								<h4 class="font-medium text-gray-600 text-sm line-through">
									{event.title}
								</h4>
							</div>
							<span class="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
								Completado
							</span>
						</div>

						<div class="text-xs text-gray-500 space-y-1">
							<div class="flex items-center space-x-1">
								<CalendarIcon class="inline-block w-4 h-4" />
								<span>{formatDate(event.date)}</span>
								{#if event.time}
									<span>• {event.time}</span>
								{/if}
							</div>

							{#if event.subjectId}
								<div class="flex items-center space-x-1">
									<BookIcon class="inline-block w-4 h-4" />
									<span>{getSubjectName(event.subjectId)}</span>
								</div>
							{/if}
						</div>

						<div class="flex items-center justify-end space-x-1 mt-2">
							<button
								class="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
								title="Editar"
								on:click={() => (onEditEvent ? onEditEvent(event) : null)}
							>
								<EditIcon class="inline-block w-4 h-4" />
							</button>
							<button
								class="p-1 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
								title="Marcar como pendiente"
								on:click={() =>
									onToggleComplete ? onToggleComplete(event.id) : null}
							>
								<UndoIcon class="inline-block w-4 h-4" />
							</button>
							<button
								class="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
								title="Eliminar"
								on:click={() => (onDeleteEvent ? onDeleteEvent(event.id) : null)}
							>
								<TrashIcon class="inline-block w-4 h-4" />
							</button>
						</div>
					</div>
				{/each}

				{#if eventsByStatus.completed.length === 0}
					<div class="text-center py-8">
						<div class="text-3xl mb-2">
							<TargetIcon class="inline-block w-8 h-8 text-green-500" />
						</div>
						<p class="text-green-600 text-sm">Aún no hay eventos completados</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
