<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Schedule, Subject } from '@ramo-libre/shared';

	export let schedule: Schedule | null = null; // null = crear, objeto = editar
	export let subjects: Subject[] = [];
	export let currentModal: string | null = null;
	export let modalId: string | null = null;
	$: isOpen = currentModal === modalId && modalId !== null;

	const dispatch = createEventDispatcher<{
		save: { schedule: Omit<Schedule, 'id' | 'userId'> };
		cancel: void;
	}>();

	// Datos del formulario
	let formData = {
		id: '',
		subjectId: '',
		dayOfWeek: 1,
		startTime: '08:00',
		endTime: '10:00',
		classroom: '',
		type: 'class' as 'class' | 'lab' | 'tutorial'
	};

	// Días de la semana
	const daysOfWeek = [
		{ value: 1, name: 'Lunes' },
		{ value: 2, name: 'Martes' },
		{ value: 3, name: 'Miércoles' },
		{ value: 4, name: 'Jueves' },
		{ value: 5, name: 'Viernes' },
		{ value: 6, name: 'Sábado' }
	];

	// Tipos de clase
	const classTypes = [
		{ value: 'class', name: 'Clase teórica', icon: '📚' },
		{ value: 'lab', name: 'Laboratorio', icon: '🧪' },
		{ value: 'tutorial', name: 'Ayudantía', icon: '💡' }
	];

	let initialized = false;

	// Inicializar formulario cuando se abre el modal
	$: if (isOpen && !initialized) {
		initializeForm();
		initialized = true;
	}

	// Reset cuando se cierra el modal
	$: if (!isOpen) {
		initialized = false;
	}

	function initializeForm() {
		if (schedule?.id) {
			// Modo edición - cargar datos del horario
			formData = {
				id: schedule.id,
				subjectId: schedule.subjectId,
				dayOfWeek: schedule.dayOfWeek,
				startTime: schedule.startTime,
				endTime: schedule.endTime,
				classroom: schedule.classroom || '',
				type: schedule.type
			};
		} else if (subjects.length > 0) {
			// Modo creación - valores por defecto
			formData = {
				id: crypto.randomUUID(), // Generar ID único
				subjectId: schedule?.subjectId ?? subjects[0].id,
				dayOfWeek: 1,
				startTime: '08:00',
				endTime: '10:00',
				classroom: '',
				type: 'class'
			};
		}
	}

	function handleSave() {
		if (!formData.subjectId || !formData.startTime || !formData.endTime) {
			return;
		}

		// Validar que la hora de inicio sea menor que la de fin
		if (formData.startTime >= formData.endTime) {
            console.log('La hora de inicio debe ser menor que la hora de fin', formData.startTime, formData.endTime);
			alert('La hora de inicio debe ser menor que la hora de fin');
			return;
		}

		dispatch('save', { schedule: formData });
		handleClose();
	}

	function handleClose() {
		dispatch('cancel');
		isOpen = false;
	}

	function handleOverlayClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}

	// Obtener el nombre de la materia seleccionada
	$: selectedSubject = subjects.find(s => s.id === formData.subjectId);
</script>

{#if isOpen}
	<!-- Modal backdrop -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
		role="button"
		tabindex="0"
		on:click={handleOverlayClick}
		on:keydown={(e) => e.key === 'Escape' && handleClose()}
		aria-label="Cerrar modal de horario"
	>
		<div class="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
			<!-- Header -->
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 
					id="schedule-modal-title" 
					class="text-xl font-bold text-gray-800 flex items-center text-center"
				>
					{#if schedule?.id}
						<span class="mr-2">✏️</span> Editar horario
					{:else}
						<span class="mr-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-plus-icon lucide-calendar-plus"><path d="M16 19h6"/><path d="M16 2v4"/><path d="M19 16v6"/><path d="M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8.5"/><path d="M3 10h18"/><path d="M8 2v4"/></svg>
						</span>
						Nuevo horario
					{/if}
				</h2>
			</div>

			<!-- Form -->
			<form on:submit|preventDefault={handleSave} class="px-6 py-4 space-y-4">
				<!-- Materia -->
				<div>
					<label for="schedule-subject" class="block text-sm font-medium text-gray-700 mb-1">
						Materia *
					</label>
					{#if subjects.length > 0}
						<select 
							id="schedule-subject"
							bind:value={formData.subjectId}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							required
						>
							{#each subjects as subject}
								<option value={subject.id}>{subject.name} ({subject.code})</option>
							{/each}
						</select>
					{:else}
						<div class="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
							⚠️ Primero debes crear al menos una materia para poder agregar horarios.
						</div>
					{/if}
				</div>

				<!-- Día de la semana -->
				<div>
					<label for="schedule-day" class="block text-sm font-medium text-gray-700 mb-1">
						Día de la semana *
					</label>
					<select 
						id="schedule-day"
						bind:value={formData.dayOfWeek}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						required
					>
						{#each daysOfWeek as day}
							<option value={day.value}>{day.name}</option>
						{/each}
					</select>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<!-- Hora de inicio -->
					<div>
						<label for="schedule-start" class="block text-sm font-medium text-gray-700 mb-1">
							Hora inicio *
						</label>
						<input 
							id="schedule-start"
							type="time" 
							bind:value={formData.startTime}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							required
						/>
					</div>

					<!-- Hora de fin -->
					<div>
						<label for="schedule-end" class="block text-sm font-medium text-gray-700 mb-1">
							Hora fin *
						</label>
						<input 
							id="schedule-end"
							type="time" 
							bind:value={formData.endTime}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							required
						/>
					</div>
				</div>

				<!-- Aula -->
				<div>
					<label for="schedule-classroom" class="block text-sm font-medium text-gray-700 mb-1">
						Aula/Lugar (opcional)
					</label>
					<input 
						id="schedule-classroom"
						type="text" 
						bind:value={formData.classroom}
						placeholder="Ej: Aula 201, Lab B"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				<!-- Tipo de clase -->
				<fieldset>
					<legend class="block text-sm font-medium text-gray-700 mb-3">Tipo de clase</legend>
					<div class="grid grid-cols-1 gap-2">
						{#each classTypes as type}
							<label class="relative cursor-pointer">
								<input 
									type="radio" 
									name="type"
									value={type.value}
									bind:group={formData.type}
									class="sr-only peer"
								/>
								<div class="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
									<span class="text-lg">{type.icon}</span>
									<span class="font-medium text-gray-700">{type.name}</span>
								</div>
							</label>
						{/each}
					</div>
				</fieldset>

				<!-- Preview -->
				{#if selectedSubject}
					<div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
						<h4 class="text-sm font-medium text-gray-700 mb-2">Vista previa:</h4>
						<div class="flex items-center space-x-2">
							<div 
								class="w-3 h-3 rounded"
								style="background-color: {selectedSubject.color}"
							></div>
							<span class="text-sm font-medium">{selectedSubject.name}</span>
							<span class="text-xs text-gray-500">
								• {daysOfWeek.find(d => d.value === formData.dayOfWeek)?.name} 
								{formData.startTime}-{formData.endTime}
								{#if formData.classroom}• {formData.classroom}{/if}
							</span>
						</div>
					</div>
				{/if}
			</form>

			<!-- Actions -->
			<div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
				<button 
					type="button"
					on:click={handleClose}
					class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
				>
					Cancelar
				</button>
				<button 
					type="button"
					on:click={handleSave}
					disabled={!formData.subjectId || subjects.length === 0}
					class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{schedule?.id ? 'Guardar cambios' : 'Crear horario'}
				</button>
			</div>
		</div>
	</div>
{/if}
