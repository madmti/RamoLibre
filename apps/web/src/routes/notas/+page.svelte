<script lang="ts">
	import { onMount } from 'svelte';
	import { userPreferences } from '$lib/stores/preferences';
	import { currentSubjects } from '$lib/stores/subject';
	import { currentGrades } from '$lib/stores/grades';
	import { currentSubjectGradeConfigs } from '$lib/stores/config';
	import { type GradeCalculationResult } from '@ramo-libre/shared';
	import type { AvailableMethods } from '$lib/utils/gradeCalculator';

	// ICONS
	import BooksIcon from '$embedded-icons/books.svg?component';
	import GestionIcon from '$embedded-icons/gestion.svg?component';
	import UpTrendIcon from '$embedded-icons/up-trend.svg?component';
	import CheckIcon from '$embedded-icons/check.svg?component';
	import WarningIcon from '$embedded-icons/warning.svg?component';
	import FaceIcon from '$embedded-icons/face.svg?component';
	import FaceSmileIcon from '$embedded-icons/face-smile.svg?component';
	import FaceSadIcon from '$embedded-icons/face-sad.svg?component';
	import XIcon from '$embedded-icons/x.svg?component';

	let gradeCalculations: Record<string, GradeCalculationResult> = {};
	let stats = {
		totalSubjects: 0,
		averageGrade: 0,
		passingSubjects: 0,
		failingSubjects: 0,
	};
	let isCalculating = true;

	onMount(async () => {
		gradeCalculations = await currentGrades.getGradesCalculations(
			$currentSubjects,
			($userPreferences.gradeCalculationMethod as AvailableMethods) ||
				'LP_MIN_PASSING_DISTANCE'
		);
		stats = currentGrades.getStats(gradeCalculations);
		isCalculating = false;
	});

	function getStatusName(status: 'pass' | 'in progress' | 'fail'): string {
		switch (status) {
			case 'pass':
				return 'Aprobado';
			case 'in progress':
				return 'En curso';
			case 'fail':
				return 'Reprobado';
			default:
				return 'Desconocido';
		}
	}
</script>

<svelte:head>
	<title>Resumen de Notas - Ramo Libre</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Encabezado -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-800 mb-2">
			<UpTrendIcon class="inline w-8 h-8 mr-2" />
			Resumen de Notas
		</h1>
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
				<div class="text-2xl">
					<BooksIcon class="w-8 h-8 text-blue-600" />
				</div>
			</div>
		</div>
		<div class="bg-green-50 border border-green-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-green-600 text-sm font-medium">Promedio General</p>
					<p class="text-2xl font-bold text-green-800">{stats.averageGrade.toFixed(2)}</p>
				</div>
				<div class="text-2xl">
					<UpTrendIcon class="w-8 h-8 text-green-600" />
				</div>
			</div>
		</div>
		<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-emerald-600 text-sm font-medium">Aprobando</p>
					<p class="text-2xl font-bold text-emerald-800">{stats.passingSubjects}</p>
				</div>
				<div class="text-2xl">
					<CheckIcon class="w-8 h-8 text-emerald-600" />
				</div>
			</div>
		</div>
		<div class="bg-red-50 border border-red-200 rounded-xl p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-red-600 text-sm font-medium">En Riesgo</p>
					<p class="text-2xl font-bold text-red-800">{stats.failingSubjects}</p>
				</div>
				<div class="text-2xl">
					<WarningIcon class="w-8 h-8 text-red-600" />
				</div>
			</div>
		</div>
	</div>

	{#if $currentSubjects.length === 0}
		<!-- Estado vacío -->
		<div class="text-center py-12">
			<div class="text-6xl mb-4">
				<BooksIcon class="w-16 h-16 mx-auto" />
			</div>
			<h3 class="text-xl font-semibold text-gray-800 mb-2">No tienes materias registradas</h3>
			<p class="text-gray-600 mb-6">
				Crea materias y agrega notas para ver tu resumen académico.
			</p>
			<a
				href="/gestion"
				class="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
			>
				<span>
					<GestionIcon class="w-5 h-5" />
				</span>
				<span>Gestionar Materias</span>
			</a>
		</div>
	{:else}
		<!-- Lista de materias con cálculos -->
		<div class="space-y-6">
			{#if isCalculating}
				<!-- Cargando estado -->
				<div class="text-center py-4">
					<p class="text-sm text-gray-500">Calculando predicciones...</p>
				</div>
			{:else}
				{#each $currentSubjects as subject}
					{@const calculation = gradeCalculations[subject.id]}
					{@const subjectData = currentSubjectGradeConfigs.getConfigBySubject(subject.id)}
					{@const grades = currentGrades.getGradesBySubject(subject.id)}
					{#if !subjectData}
						<!-- Materia sin configuración -->
						<div class="bg-red-50 border border-red-200 rounded-xl p-6">
							<p class="text-red-600">
								<WarningIcon class="inline w-5 h-5 mr-2" />
								No hay configuración para la materia {subject.name}. Configura la
								evaluación en "Gestión".
							</p>
						</div>
					{:else}
						<div class="bg-white rounded-xl border border-gray-200 relative">
							<!-- Badge/Notification icon -->
							<div class="absolute -top-2 -right-2 z-10">
								{#if calculation.status === 'fail'}
									<FaceSadIcon class="w-6 h-6 text-red-600" />
								{:else if calculation.status === 'in progress'}
									<FaceIcon class="w-6 h-6 text-yellow-600" />
								{:else}
									<FaceSmileIcon class="w-6 h-6 text-green-600" />
								{/if}
							</div>

							<!-- Header de la materia -->
							<div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-3">
										<div
											class="w-4 h-4 rounded"
											style="background-color: {subject.color}"
										></div>
										<div>
											<h3 class="text-lg font-semibold text-gray-800">
												{subject.name}
											</h3>
											<p class="text-sm text-gray-600">{subject.code}</p>
										</div>
									</div>
									<div class="text-right">
										<div
											class="text-2xl font-bold
                                                {calculation.currentGrade >=
											(subjectData.passingGrade || 0.0)
												? 'text-green-600'
												: 'text-red-600'}"
											class:text-green-600={calculation.currentGrade >=
												(subjectData.passingGrade || 0.0)}
											class:text-red-600={calculation.currentGrade <
												(subjectData.passingGrade || 0.0)}
										>
											{calculation.currentGrade.toFixed(2)}
										</div>
										<div class="text-xs text-gray-500">Nota actual</div>
									</div>
								</div>
							</div>

							<!-- Contenido -->
							<div class="px-6 py-4">
								{#if grades.length === 0}
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
								{:else if !subjectData}
									<!-- Sin configuración -->
									<div class="text-center py-6 bg-amber-50 rounded-lg">
										<p class="text-amber-700 mb-3">
											<WarningIcon class="inline w-5 h-5 mr-2" />
											Configura la evaluación para ver predicciones
										</p>
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
											<h4 class="text-md font-semibold text-gray-800 mb-3">
												Estado Actual
											</h4>
											<div class="space-y-2">
												{#if calculation.requiredGrades.length > 0}
													<div class="flex justify-between text-sm">
														<span class="text-gray-600">Estado:</span>
														<span
															class="font-medium"
															class:text-green-600={calculation.status ===
																'pass'}
															class:text-blue-600={calculation.status ===
																'in progress'}
															class:text-red-600={calculation.status ===
																'fail'}
														>
															{getStatusName(calculation.status)}
														</span>
													</div>
												{/if}
												<div class="flex justify-between text-sm">
													<span class="text-gray-600"
														>Notas registradas:</span
													>
													<span class="font-medium">{grades.length}</span>
												</div>
												<div class="flex justify-between text-sm">
													<span class="text-gray-600"
														>Nota para aprobar:</span
													>
													<span class="font-medium"
														>{subjectData.passingGrade}</span
													>
												</div>
												<div class="flex justify-between text-sm">
													<span class="text-gray-600">Nota máxima:</span>
													<span class="font-medium"
														>{subjectData.maxGrade}</span
													>
												</div>
												{#if calculation}
													<div class="flex justify-between text-sm">
														<span class="text-gray-600"
															>¿Puede aprobar?</span
														>
														<span
															class="font-medium flex items-center"
															class:text-green-600={calculation.canPass}
															class:text-red-600={!calculation.canPass}
														>
															{#if calculation.canPass}
																<CheckIcon
																	class="inline w-4 h-4 mr-1"
																/>
																Si
															{:else}
																<XIcon
																	class="inline w-4 h-4 mr-1"
																/>
																No
															{/if}
														</span>
													</div>
												{/if}
											</div>
										</div>

										<!-- Predicciones -->
										{#if calculation}
											<div>
												<h4
													class="text-md font-semibold text-gray-800 mb-3"
												>
													Predicciones
												</h4>

												{#if calculation.requiredGrades.length > 0}
													<div class="space-y-2">
														<p class="text-sm text-gray-600 mb-2">
															Notas requeridas:
														</p>
														{#each calculation.requiredGrades as required}
															<div
																class="flex justify-between text-sm"
															>
																<span class="text-gray-600"
																	>{`${required.categoryName} - ${required.description}`}:</span
																>
																<span
																	class="font-medium"
																	class:text-green-600={required.achievable}
																	class:text-red-600={!required.achievable}
																>
																	{required.requiredValue.toFixed(
																		2
																	)}
																	{required.achievable
																		? ''
																		: ' (Imposible)'}
																</span>
															</div>
														{/each}
													</div>
												{/if}

												{#if calculation.recommendations.length > 0}
													<div class="mt-4">
														<p class="text-sm text-gray-600 mb-2">
															Recomendaciones:
														</p>
														<div class="space-y-1">
															{#each calculation.recommendations as recommendation}
																<p
																	class="text-xs text-gray-700 bg-gray-100 rounded px-2 py-1"
																>
																	{recommendation}
																</p>
															{/each}
														</div>
													</div>
												{/if}
											</div>
										{/if}
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	{/if}
</div>
