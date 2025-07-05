<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Grade, GradeCategory, SubjectGradeConfig } from '@ramo-libre/shared';

	export let isOpen = false;
	export let grade: Grade | null = null;
	export let categories: GradeCategory[] = [];
	export let config: SubjectGradeConfig | null = null;

	const dispatch = createEventDispatcher();

	let formData: {
		value: number;
		hasValue?: boolean;
		maxValue: number;
		description: string;
		date: string;
		type: Grade['type'];
		weight: number;
		categoryId?: string;
	} = {
		value: 0,
		hasValue: true,
		maxValue: 7,
		description: '',
		date: new Date().toISOString().split('T')[0],
		type: 'other' as Grade['type'],
		weight: 1,
		categoryId: ''
	};

	// Variable para controlar si ya se inicializó el formulario
	let isFormInitialized = false;

	$: if (isOpen && !isFormInitialized) {
		if (grade) {
			formData = {
				value: grade.value || 0,
				hasValue: grade.value !== undefined,
				maxValue: grade.maxValue,
				description: grade.description,
				date: grade.date,
				type: grade.type,
				weight: grade.weight,
				categoryId: grade.categoryId || ''
			};
		} else {
			// Reset form when opening for new grade
			const defaultMaxValue = config?.maxGrade || 7;
			formData = {
				value: 0,
				hasValue: true,
				maxValue: defaultMaxValue,
				description: '',
				date: new Date().toISOString().split('T')[0],
				type: 'other',
				weight: 1,
				categoryId: ''
			};
		}
		isFormInitialized = true;
	}

	// Reset cuando se cierra el modal
	$: if (!isOpen) {
		isFormInitialized = false;
	}

	function handleSubmit() {
		if (!formData.description.trim()) return;
		
		const gradeData = { 
			...formData,
			maxValue: config?.maxGrade || formData.maxValue, // Usar la configuración si está disponible
			value: formData.hasValue ? formData.value : undefined
		};
		delete gradeData.hasValue;
		
		if (!gradeData.categoryId) {
			delete gradeData.categoryId;
		}
		
		dispatch('save', { grade: gradeData });
		closeModal();
	}

	function closeModal() {
		isOpen = false;
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl p-6 w-full max-w-md">
			<h2 class="text-xl font-bold text-gray-800 mb-4">
				{grade ? 'Editar Nota' : 'Nueva Nota'}
			</h2>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<!-- Descripción -->
				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
						Descripción *
					</label>
					<input
						id="description"
						type="text"
						bind:value={formData.description}
						placeholder="ej: Prueba 1, Tarea 2, Proyecto Final"
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				<!-- Tipo de nota -->
				<div class="space-y-2">
					<div class="flex items-center">
						<input
							id="hasValue"
							type="checkbox"
							bind:checked={formData.hasValue}
							class="mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
						/>
						<label for="hasValue" class="text-sm font-medium text-gray-700">
							Nota ya calificada (desmarca si es una nota futura/variable)
						</label>
					</div>
				</div>

				<!-- Nota -->
				<div>
					<label for="value" class="block text-sm font-medium text-gray-700 mb-1">
						{formData.hasValue ? 'Nota obtenida *' : 'Nota estimada'}
					</label>
					<input
						id="value"
						type="number"
						step="0.1"
						min={config?.minGrade || 1}
						max={config?.maxGrade || 7}
						bind:value={formData.value}
						disabled={!formData.hasValue}
						required={formData.hasValue}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
					/>
					{#if !formData.hasValue}
						<p class="text-xs text-gray-500 mt-1">
							Esta nota se usará como variable en el cálculo
						</p>
					{/if}
					{#if config}
						<p class="text-xs text-gray-500 mt-1">
							Rango: {config.minGrade} - {config.maxGrade} (Mínimo para aprobar: {config.passingGrade})
						</p>
					{/if}
				</div>

				<!-- Tipo de evaluación y Categoría -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="type" class="block text-sm font-medium text-gray-700 mb-1">
							Tipo de evaluación
						</label>
						<select
							id="type"
							bind:value={formData.type}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="exam">Examen</option>
							<option value="homework">Tarea</option>
							<option value="project">Proyecto</option>
							<option value="participation">Participación</option>
							<option value="other">Otro</option>
						</select>
					</div>
					<div>
						<label for="category" class="block text-sm font-medium text-gray-700 mb-1">
							Categoría
						</label>
						<select
							id="category"
							bind:value={formData.categoryId}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">Sin categoría</option>
							{#each categories as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Fecha y Peso -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="date" class="block text-sm font-medium text-gray-700 mb-1">
							Fecha
						</label>
						<input
							id="date"
							type="date"
							bind:value={formData.date}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
					<div>
						<label for="weight" class="block text-sm font-medium text-gray-700 mb-1">
							Peso (%)
						</label>
						<input
							id="weight"
							type="number"
							step="0.1"
							min="0"
							max="100"
							bind:value={formData.weight}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>

				<!-- Botones -->
				<div class="flex justify-end space-x-3 mt-6">
					<button
						type="button"
						on:click={closeModal}
						class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={!formData.description.trim()}
						class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{grade ? 'Actualizar' : 'Crear'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
