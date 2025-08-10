<script lang="ts">
	import { onMount } from 'svelte';
	import katex from 'katex';
	import type { Grade, GradeCategory, SubjectGradeConfig } from '@ramo-libre/shared';

	// ICONS
	import MathIcon from '$embedded-icons/math.svg?component';

	export let grades: Grade[] = [];
	export let categories: GradeCategory[] = [];
	export let config: SubjectGradeConfig | null = null;

	let equationContainer: HTMLElement;

	// Colores para categorías
	const categoryColors = [
		'#3B82F6', // Blue
		'#10B981', // Emerald
		'#F59E0B', // Amber
		'#EF4444', // Red
		'#8B5CF6', // Violet
		'#06B6D4', // Cyan
		'#F97316', // Orange
		'#84CC16', // Lime
	];

	// Función para obtener color de categoría
	function getCategoryColor(categoryId: string | null, categories: GradeCategory[]): string {
		if (!categoryId) return '#6B7280'; // Gray para notas sin categoría

		const categoryIndex = categories.findIndex((c) => c.id === categoryId);
		return categoryColors[categoryIndex % categoryColors.length];
	}

	// Función para generar la ecuación LaTeX con colores
	// Función para generar la ecuación LaTeX con colores
	function generateEquationLatex(grades: Grade[], categories: GradeCategory[]): string {
		if (!grades.length) {
			return '\\text{No hay notas registradas}';
		}

		// Agrupar notas por categoría
		const gradesByCategory = new Map<string | null, Grade[]>();

		// Inicializar grupos
		gradesByCategory.set(null, []); // Notas sin categoría
		categories.forEach((cat) => {
			gradesByCategory.set(cat.id, []);
		});

		// Clasificar notas
		grades.forEach((grade) => {
			const categoryId = grade.categoryId || null;
			if (gradesByCategory.has(categoryId)) {
				gradesByCategory.get(categoryId)!.push(grade);
			}
		});

		const terms: string[] = [];

		// Procesar cada categoría
		for (const [categoryId, categoryGrades] of gradesByCategory) {
			if (categoryGrades.length === 0) continue;

			const category = categories.find((c) => c.id === categoryId);
			const categoryWeight = category ? category.weight / 100 : 1;
			const color = getCategoryColor(categoryId, categories);

			if (categoryGrades.length === 1) {
				// Una sola nota en la categoría
				const grade = categoryGrades[0];
				const noteName = cleanNoteName(
					grade.description || `Nota${getGradeIndex(grade, grades)}`
				);
				const gradeWeight = grade.weight / 100;

				if (category) {
					// Con categoría: manejar ambos pesos
					const gradeTermWithWeight = generateWeightedTerm(
						gradeWeight,
						`\\text{${noteName}}`
					);
					const fullTerm = generateWeightedTerm(categoryWeight, gradeTermWithWeight);
					terms.push(`\\textcolor{${color}}{${fullTerm}}`);
				} else {
					// Sin categoría: solo peso de la nota
					const fullTerm = generateWeightedTerm(gradeWeight, `\\text{${noteName}}`);
					terms.push(`\\textcolor{${color}}{${fullTerm}}`);
				}
			} else {
				// Múltiples notas en la categoría
				const gradeTerms = categoryGrades.map((grade) => {
					const noteName = cleanNoteName(
						grade.description || `Nota${getGradeIndex(grade, grades)}`
					);
					const gradeWeight = grade.weight / 100;
					return generateWeightedTerm(gradeWeight, `\\text{${noteName}}`);
				});

				if (category) {
					// Con categoría - agrupar con paréntesis y color
					const groupedTerm = `\\left( ${gradeTerms.join(' + ')} \\right)`;
					const fullTerm = generateWeightedTerm(categoryWeight, groupedTerm);
					terms.push(`\\textcolor{${color}}{${fullTerm}}`);
				} else {
					// Sin categoría - agregar términos individuales con color
					const individualTerms = categoryGrades.map((grade) => {
						const noteName = cleanNoteName(
							grade.description || `Nota${getGradeIndex(grade, grades)}`
						);
						const gradeWeight = grade.weight / 100;
						const fullTerm = generateWeightedTerm(gradeWeight, `\\text{${noteName}}`);
						return `\\textcolor{${color}}{${fullTerm}}`;
					});
					terms.push(...individualTerms);
				}
			}
		}

		if (terms.length === 0) {
			return '\\text{No hay notas válidas}';
		}

		const equation = terms.join(' + ');
		return `\\text{Nota Final} = ${equation}`;
	}

	// Función para limpiar nombres de notas (remover caracteres especiales de LaTeX)
	function cleanNoteName(name: string): string {
		return name
			.replace(/[{}\\]/g, '') // Remover caracteres especiales de LaTeX
			.replace(/\s+/g, ' ') // Normalizar espacios
			.trim()
			.substring(0, 15); // Limitar longitud para legibilidad
	}

	// Función para formatear pesos de manera limpia
	function formatWeight(weight: number): string {
		// Si es 1, no mostrar nada (se manejará la multiplicación por separado)
		if (weight === 1) return '';

		// Si es un decimal simple (0.5, 0.3, etc.), mostrar como decimal
		if (weight.toString().split('.')[1]?.length <= 2) {
			return weight.toString();
		}

		// Para decimales más complejos, redondear a 2 decimales
		return weight.toFixed(2);
	}

	// Función para generar término con peso (maneja la multiplicación correctamente)
	function generateWeightedTerm(weight: number, term: string): string {
		if (weight === 1) {
			// Sin multiplicación para peso 1
			return term;
		} else {
			// Con multiplicación para otros pesos
			return `${formatWeight(weight)} \\ ${term}`;
		}
	}

	// Función auxiliar para obtener el índice de una nota
	function getGradeIndex(targetGrade: Grade, allGrades: Grade[]): number {
		return allGrades.findIndex((g) => g.id === targetGrade.id) + 1;
	}

	// Función para generar la leyenda de variables con colores
	function generateVariableLegend(
		grades: Grade[]
	): { name: string; description: string; categoryName?: string; color: string }[] {
		return grades
			.filter((grade) => grade.value === undefined)
			.map((grade) => {
				const category = categories.find((c) => c.id === grade.categoryId);
				const color = getCategoryColor(grade.categoryId || null, categories);
				return {
					name: cleanNoteName(
						grade.description || `Nota ${getGradeIndex(grade, grades)}`
					),
					description: `${grade.description || 'Sin descripción'} (${grade.weight}%)`,
					categoryName: category?.name,
					color: color,
				};
			});
	}

	// Función para generar leyenda de categorías
	function generateCategoryLegend(): { name: string; color: string; weight: number }[] {
		return categories.map((category) => ({
			name: category.name,
			color: getCategoryColor(category.id, categories),
			weight: category.weight,
		}));
	}

	// Renderizar la ecuación cuando cambien los datos
	$: if (equationContainer && (grades.length > 0 || categories.length > 0)) {
		try {
			const latex = generateEquationLatex(grades, categories);
			katex.render(latex, equationContainer, {
				displayMode: true,
				throwOnError: false,
				errorColor: '#cc0000',
				macros: {
					'\\text': '\\textrm',
				},
			});
		} catch (error) {
			console.error('Error rendering equation:', error);
			equationContainer.innerHTML =
				'<span class="text-red-500">Error al renderizar la ecuación</span>';
		}
	}

	onMount(() => {
		// Asegurar que se renderice al montar el componente
		if (grades.length > 0 || categories.length > 0) {
			const latex = generateEquationLatex(grades, categories);
			try {
				katex.render(latex, equationContainer, {
					displayMode: true,
					throwOnError: false,
					errorColor: '#cc0000',
					macros: {
						'\\text': '\\textrm',
					},
				});
			} catch (error) {
				console.error('Error rendering equation on mount:', error);
			}
		}
	});

	$: variableLegend = generateVariableLegend(grades);
	$: categoryLegend = generateCategoryLegend();
</script>

<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
	<h6 class="text-sm font-semibold text-blue-800 mb-3 flex items-center space-x-2">
		<MathIcon class="w-4 h-4" />
		<span>Ecuación de Cálculo</span>
	</h6>

	{#if grades.length === 0}
		<div class="text-center py-3">
			<span class="text-blue-600 text-sm">Agrega notas para ver la ecuación de cálculo</span>
		</div>
	{:else}
		<!-- Ecuación principal -->
		<div class="bg-white rounded-lg p-4 mb-3 overflow-x-auto">
			<div bind:this={equationContainer} class="text-center min-h-[2rem]"></div>
		</div>

		<!-- Leyenda de categorías -->
		{#if categoryLegend.length > 0}
			<div class="bg-white rounded-lg p-3 mb-3">
				<p class="text-xs font-medium text-blue-800 mb-2">Categorías:</p>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
					{#each categoryLegend as category}
						<div class="flex items-center space-x-2 text-xs">
							<div
								class="w-3 h-3 rounded-full"
								style="background-color: {category.color}"
							></div>
							<span class="font-medium text-gray-800">{category.name}</span>
							<span class="text-gray-600">({category.weight}%)</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Leyenda de notas pendientes -->
		{#if variableLegend.length > 0}
			<div class="bg-white rounded-lg p-3 mb-3">
				<p class="text-xs font-medium text-blue-800 mb-2">Notas pendientes:</p>
				<div class="space-y-1">
					{#each variableLegend as item}
						<div class="flex items-start space-x-2 text-xs">
							<div class="flex items-center space-x-2">
								<div
									class="w-3 h-3 rounded-full"
									style="background-color: {item.color}"
								></div>
								<span
									class="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800 whitespace-nowrap"
									>{item.description}</span
								>
							</div>
							<div class="flex-1"></div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Información adicional -->
		<div class="text-xs text-blue-700">
			{#if config}
				<p><strong>Meta:</strong> Nota Final ≥ {config.passingGrade}</p>
				<p>
					<strong>Escala:</strong>
					{config.gradeScale === 'chilean'
						? 'Chilena (1.0 - 7.0)'
						: config.gradeScale === 'utfsm'
							? 'UTFSM (0 - 100)'
							: 'Personalizada'}
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Estilos personalizados para mejorar la visualización */
	:global(.katex) {
		font-size: 1.1em;
	}

	:global(.katex-display) {
		margin: 0.5em 0;
	}
</style>
