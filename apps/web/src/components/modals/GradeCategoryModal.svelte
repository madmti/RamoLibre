<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { GradeCategory } from '@ramo-libre/shared';

	export let currentModal: string | null = null;
	export let modalId: string | null = null;
	$: isOpen = currentModal === modalId && modalId !== null;
	export let category: GradeCategory | null = null;

	const dispatch = createEventDispatcher();

	let formData:Omit<GradeCategory, 'userId' | 'createdAt'> = {
        id: '',
        subjectId: '',
		name: '',
		description: '',
		weight: 0
	};

	// Solo actualizar formData cuando el modal se abre o cambia la categoría inicial
	let initialCategory: GradeCategory | null = null;
	
	$: if (isOpen && category !== initialCategory) {
		initialCategory = category;
		if (category.id) {
			formData = {
                id: category.id,
                subjectId: category.subjectId,
				name: category.name,
				description: category.description || '',
				weight: category.weight
			};
		} else {
			// Reset form when opening for new category
			formData = {
                id: crypto.randomUUID(), // Generate a unique ID for new categories
                subjectId: category?.subjectId,
				name: '',
				description: '',
				weight: 0
			};
		}
	}

	function handleSubmit() {
		if (!formData.name.trim()) {
			return;
		}

		const categoryData = {
            id: formData.id,
            subjectId: formData.subjectId || '',
			name: formData.name.trim(),
			description: formData.description.trim() || undefined,
			weight: formData.weight
		};
		
		dispatch('save', { category: categoryData });
		closeModal();
	}

	function closeModal() {
		isOpen = false;
		initialCategory = null; // Reset the initial category reference
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
				{category?.id ? 'Editar Categoría' : 'Nueva Categoría'}
			</h2>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<!-- Nombre -->
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
						Nombre de la categoría *
					</label>
					<input
						id="name"
						type="text"
						bind:value={formData.name}
						placeholder="Ej: Pruebas, Tareas, Proyectos"
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				<!-- Descripción -->
				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
						Descripción (opcional)
					</label>
					<textarea
						id="description"
						bind:value={formData.description}
						placeholder="Descripción de qué incluye esta categoría"
						rows="2"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					></textarea>
				</div>

				<!-- Peso -->
				<div>
					<label for="weight" class="block text-sm font-medium text-gray-700 mb-1">
						Peso (%)
					</label>
					<input
						id="weight"
						type="number"
						bind:value={formData.weight}
						min="0"
						max="100"
						step="1"
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
					<p class="text-xs text-gray-500 mt-1">
						Porcentaje que representa esta categoría en la nota final
					</p>
				</div>

				<!-- Información adicional -->
				<div class="bg-blue-50 rounded-lg p-3">
					<p class="text-xs text-blue-700">
						💡 <strong>Tip:</strong> Las categorías te permiten organizar tus notas (pruebas, tareas, proyectos, etc.) 
						y manejar diferentes pesos para cada tipo de evaluación.
					</p>
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
						disabled={!formData.name.trim()}
						class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{category?.id ? 'Actualizar' : 'Crear'} Categoría
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
