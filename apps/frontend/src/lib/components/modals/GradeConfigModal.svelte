<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SubjectGradeConfig, GradeCategory } from '@ramo-libre/shared';

	export let isOpen = false;
	export let config: SubjectGradeConfig | null = null;

	const dispatch = createEventDispatcher();

	// Escalas predefinidas
	const gradeScales = {
		chilena: { min: 1.0, passing: 4.0, max: 7.0, name: 'Chilena (1.0 - 7.0)' },
		utfsm: { min: 0, passing: 55, max: 100, name: 'UTFSM (0 - 100)' },
		personalizada: { min: 0, passing: 60, max: 100, name: 'Personalizada' }
	};

	let formData = {
		minGrade: 1.0,
		passingGrade: 4.0,
		maxGrade: 7.0,
		gradeScale: 'chilena' as SubjectGradeConfig['gradeScale']
	};

	// Actualizar valores cuando cambie la escala
	$: if (formData.gradeScale !== 'personalizada') {
		const scale = gradeScales[formData.gradeScale];
		formData.minGrade = scale.min;
		formData.passingGrade = scale.passing;
		formData.maxGrade = scale.max;
	}

	$: if (config) {
		formData = {
			minGrade: config.minGrade,
			passingGrade: config.passingGrade,
			maxGrade: config.maxGrade,
			gradeScale: config.gradeScale
		};
	} else if (isOpen) {
		// Reset form when opening for new config
		formData = {
			minGrade: 1.0,
			passingGrade: 4.0,
			maxGrade: 7.0,
			gradeScale: 'chilena'
		};
	}

	function handleSubmit() {
		const configData = {
			minGrade: formData.minGrade,
			passingGrade: formData.passingGrade,
			maxGrade: formData.maxGrade,
			gradeScale: formData.gradeScale
		};
		
		dispatch('save', { config: configData });
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
		<div class="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
			<h2 class="text-xl font-bold text-gray-800 mb-4">
				Configuración de Evaluación
			</h2>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<!-- Escala de notas -->
				<div>
					<label for="gradeScale" class="block text-sm font-medium text-gray-700 mb-1">
						Escala de notas
					</label>
					<select
						id="gradeScale"
						bind:value={formData.gradeScale}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						{#each Object.entries(gradeScales) as [key, scale]}
							<option value={key}>{scale.name}</option>
						{/each}
					</select>
				</div>

				<!-- Configuración de notas -->
				<div class="grid grid-cols-3 gap-4">
					<div>
						<label for="minGrade" class="block text-sm font-medium text-gray-700 mb-1">
							Nota mínima posible
						</label>
						<input
							id="minGrade"
							type="number"
							step="0.1"
							bind:value={formData.minGrade}
							disabled={formData.gradeScale !== 'personalizada'}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
						/>
					</div>
					<div>
						<label for="passingGrade" class="block text-sm font-medium text-gray-700 mb-1">
							Nota para aprobar
						</label>
						<input
							id="passingGrade"
							type="number"
							step="0.1"
							min={formData.minGrade}
							max={formData.maxGrade}
							bind:value={formData.passingGrade}
							disabled={formData.gradeScale !== 'personalizada'}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
						/>
					</div>
					<div>
						<label for="maxGrade" class="block text-sm font-medium text-gray-700 mb-1">
							Nota máxima posible
						</label>
						<input
							id="maxGrade"
							type="number"
							step="0.1"
							min={formData.passingGrade}
							bind:value={formData.maxGrade}
							disabled={formData.gradeScale !== 'personalizada'}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
						/>
					</div>
				</div>

				<!-- Información de las escalas -->
				<div class="bg-blue-50 rounded-lg p-4">
					<h3 class="text-sm font-semibold text-blue-800 mb-2">Escalas disponibles:</h3>
					<div class="space-y-1 text-xs text-blue-700">
						<div><strong>Chilena:</strong> 1.0 a 7.0 (Mínima para aprobar: 4.0)</div>
						<div><strong>UTFSM:</strong> 0 a 100 (Mínima para aprobar: 55)</div>
						<div><strong>Personalizada:</strong> Define tus propios valores</div>
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
						class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
					>
						Guardar Configuración
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
