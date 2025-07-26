<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Event, Subject } from '@ramo-libre/shared';

	// ICONS
	import PlusIcon from '$embedded-icons/plus.svg?component';
	import EditIcon from '$embedded-icons/edit.svg?component';
	import XIcon from '$embedded-icons/x.svg?component';
	import TrashIcon from '$embedded-icons/trash.svg?component';

	export let event: Event | null = null;
	export let subjectList: Subject[] = [];
	export let mode: 'create' | 'edit' | null = 'create';
	$: isOpen = mode !== null;

	const dispatch = createEventDispatcher();

	// Formulario
	let formData = {
		title: '',
		description: '',
		date: '',
		time: '',
		endTime: '',
		type: 'other' as Event['type'],
		subjectId: '',
		priority: 'medium' as Event['priority'],
		location: '',
		reminder: 30,
		isAllDay: false,
	};

	let errors: Record<string, string> = {};

	// Resetear formulario cuando se abre/cierra
	$: if (isOpen) {
		resetForm();
	}

	function resetForm() {
		if (mode === 'edit' && event) {
			formData = {
				title: event.title,
				description: event.description || '',
				date: event.date,
				time: event.time || '',
				endTime: event.endTime || '',
				type: event.type,
				subjectId: event.subjectId || '',
				priority: event.priority,
				location: event.location || '',
				reminder: event.reminder || 30,
				isAllDay: event.isAllDay || false,
			};
		} else {
			// Usar fecha local para evitar desfases por zona horaria
			const today = new Date();
			const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

			formData = {
				title: '',
				description: '',
				date: localDate,
				time: '',
				endTime: '',
				type: 'other',
				subjectId: '',
				priority: 'medium',
				location: '',
				reminder: 30,
				isAllDay: false,
			};
		}
		errors = {};
	}

	function validateForm(): boolean {
		errors = {};

		if (!formData.title.trim()) {
			errors.title = 'El título es requerido';
		}

		if (!formData.date) {
			errors.date = 'La fecha es requerida';
		}

		if (formData.time && formData.endTime) {
			if (formData.time >= formData.endTime) {
				errors.endTime = 'La hora de fin debe ser posterior a la hora de inicio';
			}
		}

		return Object.keys(errors).length === 0;
	}

	function handleSubmit() {
		if (!validateForm()) return;

		const eventData = {
			...formData,
			time: formData.isAllDay ? undefined : formData.time || undefined,
			endTime: formData.isAllDay ? undefined : formData.endTime || undefined,
			subjectId: formData.subjectId || undefined,
		};

		if (mode === 'edit' && event) {
			dispatch('save', { id: event.id, data: eventData });
		} else {
			dispatch('create', eventData);
		}

		closeModal();
	}

	function handleDelete() {
		if (!event) return;

		if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
			dispatch('delete', event.id);
			closeModal();
		}
	}

	function closeModal() {
		isOpen = false;
		dispatch('close');
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			closeModal();
		}
	}

	function getEventTypeOptions() {
		return [
			{ value: 'exam', label: 'Examen' },
			{ value: 'assignment', label: 'Tarea' },
			{ value: 'project', label: 'Proyecto' },
			{ value: 'deadline', label: 'Fecha límite' },
			{ value: 'class', label: 'Clase' },
			{ value: 'meeting', label: 'Reunión' },
			{ value: 'other', label: 'Otro' },
		];
	}

	function getPriorityOptions() {
		return [
			{ value: 'low', label: 'Baja' },
			{ value: 'medium', label: 'Media' },
			{ value: 'high', label: 'Alta' },
		];
	}

	function getReminderOptions() {
		return [
			{ value: 0, label: 'Sin recordatorio' },
			{ value: 15, label: '15 minutos antes' },
			{ value: 30, label: '30 minutos antes' },
			{ value: 60, label: '1 hora antes' },
			{ value: 120, label: '2 horas antes' },
			{ value: 1440, label: '1 día antes' },
		];
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
		role="button"
		tabindex="0"
		on:click={handleBackdropClick}
		on:keydown={(e) => e.key === 'Escape' && closeModal()}
		aria-label="Cerrar modal"
	>
		<div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<!-- Header -->
			<div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
				<h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
					{#if mode === 'edit'}
						<EditIcon class="w-6 h-6" />
						Editar Evento
					{:else}
						<PlusIcon class="w-6 h-6" />
						Nuevo Evento
					{/if}
				</h2>
				<button
					on:click={closeModal}
					class="text-gray-400 hover:text-gray-600 transition-colors"
				>
					<XIcon class="w-6 h-6" />
				</button>
			</div>

			<!-- Form -->
			<form on:submit|preventDefault={handleSubmit} class="p-6 space-y-6">
				<!-- Título -->
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">
						Título *
					</label>
					<input
						id="title"
						type="text"
						bind:value={formData.title}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.title
							? 'border-red-500'
							: ''}"
						placeholder="Ej: Examen de Matemáticas"
					/>
					{#if errors.title}
						<p class="text-red-600 text-sm mt-1">{errors.title}</p>
					{/if}
				</div>

				<!-- Descripción -->
				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
						Descripción
					</label>
					<textarea
						id="description"
						bind:value={formData.description}
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Descripción del evento..."
					></textarea>
				</div>

				<!-- Fecha y hora -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="date" class="block text-sm font-medium text-gray-700 mb-1">
							Fecha *
						</label>
						<input
							id="date"
							type="date"
							bind:value={formData.date}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.date
								? 'border-red-500'
								: ''}"
						/>
						{#if errors.date}
							<p class="text-red-600 text-sm mt-1">{errors.date}</p>
						{/if}
					</div>

					<div>
						<label
							class="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1"
						>
							<input
								type="checkbox"
								bind:checked={formData.isAllDay}
								class="rounded"
							/>
							<span>Todo el día</span>
						</label>
					</div>
				</div>

				{#if !formData.isAllDay}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="time" class="block text-sm font-medium text-gray-700 mb-1">
								Hora de inicio
							</label>
							<input
								id="time"
								type="time"
								bind:value={formData.time}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label
								for="endTime"
								class="block text-sm font-medium text-gray-700 mb-1"
							>
								Hora de fin
							</label>
							<input
								id="endTime"
								type="time"
								bind:value={formData.endTime}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {errors.endTime
									? 'border-red-500'
									: ''}"
							/>
							{#if errors.endTime}
								<p class="text-red-600 text-sm mt-1">{errors.endTime}</p>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Tipo y Prioridad -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="type" class="block text-sm font-medium text-gray-700 mb-1">
							Tipo
						</label>
						<select
							id="type"
							bind:value={formData.type}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							{#each getEventTypeOptions() as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="priority" class="block text-sm font-medium text-gray-700 mb-1">
							Prioridad
						</label>
						<select
							id="priority"
							bind:value={formData.priority}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							{#each getPriorityOptions() as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Materia y Ubicación -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="subject" class="block text-sm font-medium text-gray-700 mb-1">
							Materia
						</label>
						<select
							id="subject"
							bind:value={formData.subjectId}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">Sin materia</option>
							{#each subjectList as subject}
								<option value={subject.id}>{subject.name}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="location" class="block text-sm font-medium text-gray-700 mb-1">
							Ubicación
						</label>
						<input
							id="location"
							type="text"
							bind:value={formData.location}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Ej: Aula 301"
						/>
					</div>
				</div>

				<!-- Recordatorio -->
				<div>
					<label for="reminder" class="block text-sm font-medium text-gray-700 mb-1">
						Recordatorio
					</label>
					<select
						disabled
						id="reminder"
						bind:value={formData.reminder}
						class:opacity-60={true}
						class:cursor-not-allowed={true}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						{#each getReminderOptions() as option}
							<option value={option.value} selected={!option.value}
								>{option.label}</option
							>
						{/each}
					</select>
				</div>

				<!-- Botones -->
				<div
					class="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-gray-200"
				>
					<div>
						{#if mode === 'edit'}
							<button
								type="button"
								on:click={handleDelete}
								class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
							>
								<TrashIcon class="inline w-4 h-4 mr-1" />
								Eliminar
							</button>
						{/if}
					</div>

					<div class="flex space-x-3">
						<button
							type="button"
							on:click={closeModal}
							class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
						>
							Cancelar
						</button>
						<button
							type="submit"
							class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
						>
							{mode === 'edit' ? 'Guardar' : 'Crear'}
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
{/if}
