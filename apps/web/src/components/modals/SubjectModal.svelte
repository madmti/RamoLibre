<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Subject } from '@ramo-libre/shared';

    // ICONS
    import PlusIcon from '$embedded-icons/plus.svg?component';
    import EditIcon from '$embedded-icons/edit.svg?component';

	export let subject: Subject | null = null; // null = crear, objeto = editar
	export let currentModal: string | null = null;
	export let modalId: string | null = null;
	$: isOpen = currentModal === modalId && modalId !== null;

	const dispatch = createEventDispatcher<{
		save: { subject: Omit<Subject, 'id' | 'createdAt' | 'userId'> };
		cancel: void;
	}>();

	// Datos del formulario
	let formData = {
		id: '',
		name: '',
		code: '',
		credits: 4,
		color: '#3B82F6',
		professor: '',
		semester: 1
	};

	// Colores predefinidos
	const colors = [
		{ name: 'Azul', value: '#3B82F6' },
		{ name: 'Verde', value: '#10B981' },
		{ name: 'Púrpura', value: '#8B5CF6' },
		{ name: 'Amarillo', value: '#F59E0B' },
		{ name: 'Rojo', value: '#EF4444' },
		{ name: 'Rosa', value: '#EC4899' },
		{ name: 'Índigo', value: '#6366F1' },
		{ name: 'Cian', value: '#06B6D4' }
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
		if (subject) {
			// Modo edición - cargar datos de la materia
			formData = {
				id: subject.id,
				name: subject.name,
				code: subject.code,
				credits: subject.credits,
				color: subject.color,
				professor: subject.professor || '',
				semester: subject.semester
			};
		} else {
			// Modo creación - valores por defecto
			formData = {
				id: crypto.randomUUID(), // Generar ID único
				name: '',
				code: '',
				credits: 4,
				color: '#3B82F6',
				professor: '',
				semester: 1
			};
		}
	}

	function handleSave() {
		if (!formData.name.trim() || !formData.code.trim()) {
			return;
		}

		dispatch('save', { subject: formData });
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
</script>

{#if isOpen}
	<!-- Modal backdrop -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
		role="button"
		tabindex="0"
		on:click={handleOverlayClick}
		on:keydown={(e) => e.key === 'Escape' && handleClose()}
		aria-label="Cerrar modal de materia"
	>
		<div class="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
			<!-- Header -->
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 
					id="schedule-modal-title" 
					class="text-xl font-bold text-gray-800 flex items-center text-center"
				>
					{#if subject}
						<span class="mr-2"><EditIcon class="inline w-6 h-6" /></span> Editar materia
					{:else}
						<span class="mr-2">
							<PlusIcon class="inline w-6 h-6" />
						</span>
						Nueva materia
					{/if}
				</h2>
			</div>

			<!-- Form -->
			<form on:submit|preventDefault={handleSave} class="px-6 py-4 space-y-4">
				<!-- Nombre -->
				<div>
					<label for="subject-name" class="block text-sm font-medium text-gray-700 mb-1">
						Nombre de la materia *
					</label>
					<input 
						id="subject-name"
						type="text" 
						bind:value={formData.name}
						placeholder="Ej: Cálculo I"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						required
					/>
				</div>

				<!-- Código -->
				<div>
					<label for="subject-code" class="block text-sm font-medium text-gray-700 mb-1">
						Código *
					</label>
					<input 
						id="subject-code"
						type="text" 
						bind:value={formData.code}
						placeholder="Ej: MAT101"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						required
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<!-- Créditos -->
					<div>
						<label for="subject-credits" class="block text-sm font-medium text-gray-700 mb-1">
							Créditos
						</label>
						<input 
							id="subject-credits"
							type="number" 
							bind:value={formData.credits}
							min="1" 
							max="12"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<!-- Semestre -->
					<div>
						<label for="subject-semester" class="block text-sm font-medium text-gray-700 mb-1">
							Semestre
						</label>
						<input 
							id="subject-semester"
							type="number" 
							bind:value={formData.semester}
							min="1" 
							max="12"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>

				<!-- Profesor -->
				<div>
					<label for="subject-professor" class="block text-sm font-medium text-gray-700 mb-1">
						Profesor (opcional)
					</label>
					<input 
						id="subject-professor"
						type="text" 
						bind:value={formData.professor}
						placeholder="Ej: Dr. Juan Pérez"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				<!-- Color -->
				<fieldset>
					<legend class="block text-sm font-medium text-gray-700 mb-3">Color</legend>
					<div class="grid grid-cols-4 gap-2">
						{#each colors as color}
							<label class="relative cursor-pointer">
								<input 
									type="radio" 
									name="color"
									value={color.value}
									bind:group={formData.color}
									class="sr-only"
								/>
								<div 
									class="w-full h-10 rounded-lg border-2 transition-all {formData.color === color.value 
										? 'border-gray-800 scale-110' 
										: 'border-gray-300 hover:border-gray-400'}"
									style="background-color: {color.value}"
									title={color.name}
								></div>
							</label>
						{/each}
					</div>
				</fieldset>
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
					disabled={!formData.name.trim() || !formData.code.trim()}
					class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{subject ? 'Guardar cambios' : 'Crear materia'}
				</button>
			</div>
		</div>
	</div>
{/if}
