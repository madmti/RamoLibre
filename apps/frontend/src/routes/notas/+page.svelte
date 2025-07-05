<script lang="ts">
	import { onMount } from 'svelte';
	import { gradeService, gradesBySubject } from '$lib/stores/grades';
	import { scheduleService, subjects } from '$lib/stores/schedule';
	import { currentUser } from '$lib/stores/user';
	import { gradeCalculator } from '$lib/utils/gradeCalculator';
	import type { Subject, User, GradeCalculationResult, Grade } from '@ramo-libre/shared';

	let user: User | null = null;
	let subjectList: Subject[] = [];
	let gradeData: Record<string, any> = {};
	let calculationResults: Record<string, GradeCalculationResult> = {};
	let isCalculating = false;
	let subjectsInitialized = false;
	let gradesInitialized = false;
	let stats = { totalSubjects: 0, averageGrade: 0, passingSubjects: 0, failingSubjects: 0 };

	onMount(() => {
		// Inicializar servicios
		scheduleService.initialize(); // Esto carga las materias
		gradeService.initialize();

		const unsubscribeUser = currentUser.subscribe(value => {
			user = value;
		});

		const unsubscribeSubjects = subjects.subscribe(value => {
			subjectList = value;
			subjectsInitialized = true;
			// Calcular cuando tengamos tanto subjects como grades
			if (gradesInitialized) {
				calculateAllResults();
			}
		});

		const unsubscribeGrades = gradesBySubject.subscribe(value => {
			gradeData = value;
			gradesInitialized = true;
			// Calcular cuando tengamos tanto subjects como grades
			if (subjectsInitialized) {
				calculateAllResults();
			}
		});

		return () => {
			unsubscribeUser();
			unsubscribeSubjects();
			unsubscribeGrades();
		};
	});

	async function calculateAllResults() {
		if (isCalculating || !subjectsInitialized || !gradesInitialized) return;
		
		// No calcular si no hay materias
		if (subjectList.length === 0) {
			calculationResults = {};
			return;
		}
		
		isCalculating = true;
		
		const newResults: Record<string, GradeCalculationResult> = {};
		
		for (const subject of subjectList) {
			const subjectGradeData = gradeData[subject.id];
			if (subjectGradeData?.config && subjectGradeData?.grades?.length > 0) {
				try {
					console.log('Calculating all results...', subjectGradeData);
					const result = await gradeCalculator.calculateRequiredGrades(
						subjectGradeData.grades,
						subjectGradeData.categories || [],
						subjectGradeData.config
					);
					console.log("Result:", result);
					newResults[subject.id] = result;
				} catch (error) {
					console.error(`Error calculating grades for ${subject.name}:`, error);
				}
			}
		}
		
		calculationResults = newResults;
		isCalculating = false;
		
		// Forzar recálculo de estadísticas después de obtener los resultados
		stats = getOverallStats();
	}

	function getSubjectData(subjectId: string) {
		return gradeData[subjectId] || { grades: [], categories: [], config: null, currentAverage: 0 };
	}

	function getOverallStats() {
		if (!subjectsInitialized || !gradesInitialized || subjectList.length === 0) {
			return { totalSubjects: 0, averageGrade: 0, passingSubjects: 0, failingSubjects: 0 };
		}

		const subjectsWithGrades = subjectList.filter(s => {
			const data = getSubjectData(s.id);
			return data.grades.length > 0 && data.config;
		});
		
		const totalSubjects = subjectsWithGrades.length;
		
		if (totalSubjects === 0) {
			return { totalSubjects: 0, averageGrade: 0, passingSubjects: 0, failingSubjects: 0 };
		}

		// Calcular promedio general y estados correctos
		let totalWeightedGrade = 0;
		let approvedCount = 0;
		let inProgressCount = 0;
		let failedCount = 0;

		for (const subject of subjectsWithGrades) {
			const data = getSubjectData(subject.id);
			
			// Usar la nota actual ya calculada en el store
			const currentGrade = data.currentAverage;
			totalWeightedGrade += currentGrade;
			
			// Determinar estado de la materia
			const calculation = calculationResults[subject.id];
			// Solo puede aprobar si hay cálculo y canPass es true, o si no hay notas variables
			const hasVariableGrades = data.grades.some((g: Grade) => g.value === undefined);
			const canPass = hasVariableGrades 
				? (calculation ? calculation.canPass : false) 
				: true;
			
			const status = gradeCalculator.getSubjectStatus(currentGrade, data.config.passingGrade, canPass);
			
			if (status === 'Aprobado') {
				approvedCount++;
			} else if (status === 'En curso') {
				inProgressCount++;
			} else {
				failedCount++;
			}
		}

		const averageGrade = totalSubjects > 0 ? totalWeightedGrade / totalSubjects : 0;

		// Para las métricas de la UI:
		// "Aprobando" = Aprobados + En curso (materias que aún pueden aprobar)
		// "En Riesgo" = Reprobados (materias que ya no pueden aprobar)
		return { 
			totalSubjects, 
			averageGrade, 
			passingSubjects: approvedCount, // Aprobando = Aprobados + En curso
			failingSubjects: failedCount // En riesgo = Reprobados
		};
	}

	$: {
		// Solo recalcular estadísticas cuando cambien los datos base
		if (subjectsInitialized && gradesInitialized && !isCalculating) {
			stats = getOverallStats();
		}
	}
</script>

<svelte:head>
	<title>Resumen de Notas - Ramo Libre</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Encabezado -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-800 mb-2">📊 Resumen de Notas</h1>
		<p class="text-gray-600">Vista general de tu rendimiento académico y predicciones</p>
	</div>

	<!-- Estadísticas generales -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
		<div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-blue-600 text-sm font-medium">Materias</p>
					<p class="text-2xl font-bold text-blue-800">{stats.totalSubjects}</p>
				</div>
				<div class="text-2xl">📚</div>
			</div>
		</div>
		<div class="bg-green-50 border border-green-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-green-600 text-sm font-medium">Promedio General</p>
					<p class="text-2xl font-bold text-green-800">{stats.averageGrade.toFixed(1)}</p>
				</div>
				<div class="text-2xl">📈</div>
			</div>
		</div>
		<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-emerald-600 text-sm font-medium">Aprobando</p>
					<p class="text-2xl font-bold text-emerald-800">{stats.passingSubjects}</p>
				</div>
				<div class="text-2xl">✅</div>
			</div>
		</div>
		<div class="bg-red-50 border border-red-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-red-600 text-sm font-medium">En Riesgo</p>
					<p class="text-2xl font-bold text-red-800">{stats.failingSubjects}</p>
				</div>
				<div class="text-2xl">⚠️</div>
			</div>
		</div>
	</div>

	{#if !subjectsInitialized || !gradesInitialized}
		<!-- Estado de carga -->
		<div class="text-center py-12">
			<div class="text-6xl mb-4">⏳</div>
			<h3 class="text-xl font-semibold text-gray-800 mb-2">Cargando datos...</h3>
			<p class="text-gray-600">Obteniendo información de tus materias y notas.</p>
		</div>
	{:else if subjectList.length === 0}
		<!-- Estado vacío -->
		<div class="text-center py-12">
			<div class="text-6xl mb-4">📚</div>
			<h3 class="text-xl font-semibold text-gray-800 mb-2">No tienes materias registradas</h3>
			<p class="text-gray-600 mb-6">Crea materias y agrega notas para ver tu resumen académico.</p>
			<a 
				href="/gestion"
				class="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
			>
				<span>📚</span>
				<span>Gestionar Materias</span>
			</a>
		</div>
	{:else}
		<!-- Lista de materias con cálculos -->
		<div class="space-y-6">
			{#each subjectList as subject}
				{@const subjectGradeData = getSubjectData(subject.id)}
				{@const calculation = calculationResults[subject.id]}
				
				<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
					<!-- Header de la materia -->
					<div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-3">
								<div 
									class="w-4 h-4 rounded"
									style="background-color: {subject.color}"
								></div>
								<div>
									<h3 class="text-lg font-semibold text-gray-800">{subject.name}</h3>
									<p class="text-sm text-gray-600">{subject.code}</p>
								</div>
							</div>
							<div class="text-right">
								<div class="text-2xl font-bold" 
									class:text-green-600={subjectGradeData.currentAverage >= (subjectGradeData.config?.passingGrade || 4.0)}
									class:text-red-600={subjectGradeData.currentAverage < (subjectGradeData.config?.passingGrade || 4.0)}
								>
									{subjectGradeData.currentAverage.toFixed(1)}
								</div>
								<div class="text-xs text-gray-500">
									Nota actual
								</div>
							</div>
						</div>
					</div>

					<!-- Contenido -->
					<div class="px-6 py-4">
						{#if subjectGradeData.grades.length === 0}
							<!-- Sin notas -->
							<div class="text-center py-6">
								<p class="text-gray-500 mb-3">No hay notas registradas</p>
								<a 
									href="/gestion"
									class="text-sm text-blue-600 hover:text-blue-700 underline"
								>
									Agregar notas
								</a>
							</div>
						{:else if !subjectGradeData.config}
							<!-- Sin configuración -->
							<div class="text-center py-6 bg-amber-50 rounded-lg">
								<p class="text-amber-700 mb-3">⚠️ Configura la evaluación para ver predicciones</p>
								<a 
									href="/gestion"
									class="text-sm text-amber-600 hover:text-amber-700 underline"
								>
									Configurar evaluación
								</a>
							</div>
						{:else}
							<!-- Resumen detallado -->
							<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<!-- Estado actual -->
								<div>
									<h4 class="text-md font-semibold text-gray-800 mb-3">Estado Actual</h4>
									<div class="space-y-2">
										{#if calculation}
											{@const status = gradeCalculator.getSubjectStatus(subjectGradeData.currentAverage, subjectGradeData.config.passingGrade, calculation.canPass)}
											<div class="flex justify-between text-sm">
												<span class="text-gray-600">Estado:</span>
												<span class="font-medium" 
													class:text-green-600={status === 'Aprobado'}
													class:text-blue-600={status === 'En curso'}
													class:text-red-600={status === 'Reprobado'}
												>
													{status}
												</span>
											</div>
										{/if}
										<div class="flex justify-between text-sm">
											<span class="text-gray-600">Notas registradas:</span>
											<span class="font-medium">{subjectGradeData.grades.length}</span>
										</div>
										<div class="flex justify-between text-sm">
											<span class="text-gray-600">Nota para aprobar:</span>
											<span class="font-medium">{subjectGradeData.config.passingGrade}</span>
										</div>
										<div class="flex justify-between text-sm">
											<span class="text-gray-600">Nota máxima:</span>
											<span class="font-medium">{subjectGradeData.config.maxGrade}</span>
										</div>
										{#if calculation}
											<div class="flex justify-between text-sm">
												<span class="text-gray-600">¿Puede aprobar?</span>
												<span class="font-medium" class:text-green-600={calculation.canPass} class:text-red-600={!calculation.canPass}>
													{calculation.canPass ? '✅ Sí' : '❌ No'}
												</span>
											</div>
										{/if}
									</div>
								</div>

								<!-- Predicciones -->
								{#if calculation}
									<div>
										<h4 class="text-md font-semibold text-gray-800 mb-3">Predicciones</h4>
										
										{#if calculation.requiredGrades.length > 0}
											<div class="space-y-2">
												<p class="text-sm text-gray-600 mb-2">Notas requeridas:</p>
												{#each calculation.requiredGrades as required}
													<div class="flex justify-between text-sm">
														<span class="text-gray-600">{required.categoryName}:</span>
														<span class="font-medium" 
															class:text-green-600={required.achievable}
															class:text-red-600={!required.achievable}
														>
															{required.requiredValue.toFixed(1)}
															{required.achievable ? '' : ' (Muy alto)'}
														</span>
													</div>
												{/each}
											</div>
										{/if}

										{#if calculation.recommendations.length > 0}
											<div class="mt-4">
												<p class="text-sm text-gray-600 mb-2">Recomendaciones:</p>
												<div class="space-y-1">
													{#each calculation.recommendations as recommendation}
														<p class="text-xs text-gray-700 bg-gray-100 rounded px-2 py-1">
															{recommendation}
														</p>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								{:else if isCalculating}
									<div class="text-center py-4">
										<p class="text-sm text-gray-500">Calculando predicciones...</p>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
