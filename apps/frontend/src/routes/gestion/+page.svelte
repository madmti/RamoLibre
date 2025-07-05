<script lang="ts">
	import { onMount } from 'svelte';
	import { scheduleService, subjects, schedules } from '$lib/stores/schedule';
	import { gradeService, grades, gradeCategories, subjectGradeConfigs, gradesBySubject } from '$lib/stores/grades';
	import { currentUser } from '$lib/stores/user';
	import SubjectModal from '$lib/components/modals/SubjectModal.svelte';
	import ScheduleModal from '$lib/components/modals/ScheduleModal.svelte';
	import GradeModal from '$lib/components/modals/GradeModal.svelte';
	import GradeCategoryModal from '$lib/components/modals/GradeCategoryModal.svelte';
	import GradeConfigModal from '$lib/components/modals/GradeConfigModal.svelte';
	import GradeEquationDisplay from '$lib/components/GradeEquationDisplay.svelte';
	import type { Subject, Schedule, User, Grade, GradeCategory, SubjectGradeConfig } from '@ramo-libre/shared';

	let user: User | null = null;
	let subjectList: Subject[] = [];
	let scheduleList: Schedule[] = [];
	let subjectSchedulesMap: Record<string, Schedule[]> = {};
	let gradesBySubjectData: Record<string, any> = {};

	// Estado de expansión de materias para mostrar notas
	let expandedSubjects: Set<string> = new Set();

	// Estados de los modales
	let showSubjectModal = false;
	let showScheduleModal = false;
	let showGradeModal = false;
	let showCategoryModal = false;
	let showConfigModal = false;
	let editingSubject: Subject | null = null;
	let editingSchedule: Schedule | null = null;
	let editingGrade: Grade | null = null;
	let editingCategory: GradeCategory | null = null;
	let editingConfig: SubjectGradeConfig | null = null;
	let selectedSubjectForGrades: Subject | null = null;
	let showDeleteConfirm = false;
	let deleteTarget: { type: 'subject' | 'schedule' | 'grade' | 'category'; id: string; name: string } | null = null;

	// Crear mapa de horarios por materia cuando cambien los datos
	$: {
		subjectSchedulesMap = {};
		scheduleList.forEach(schedule => {
			if (!subjectSchedulesMap[schedule.subjectId]) {
				subjectSchedulesMap[schedule.subjectId] = [];
			}
			subjectSchedulesMap[schedule.subjectId].push(schedule);
		});
	}

	// Actualizar datos de notas por materia
	$: gradesBySubjectData = $gradesBySubject;

	// Suscripciones
	onMount(() => {
		// Inicializar servicios
		scheduleService.initialize();
		gradeService.initialize();

		const unsubscribeUser = currentUser.subscribe(value => {
			user = value;
		});

		const unsubscribeSubjects = subjects.subscribe(value => {
			subjectList = value;
		});

		const unsubscribeSchedules = schedules.subscribe(value => {
			scheduleList = value;
		});

		return () => {
			unsubscribeUser();
			unsubscribeSubjects();
			unsubscribeSchedules();
		};
	});

	// === MATERIAS ===

	function openCreateSubjectModal() {
		editingSubject = null;
		showSubjectModal = true;
	}

	function openEditSubjectModal(subject: Subject) {
		editingSubject = subject;
		showSubjectModal = true;
	}

	function handleSaveSubject(event: CustomEvent<{ subject: Omit<Subject, 'id' | 'createdAt' | 'userId'> }>) {
		if (!user) return;

		const subjectData = event.detail.subject;

		if (editingSubject) {
			// Editar materia existente
			scheduleService.updateSubject(editingSubject.id, subjectData);
		} else {
			// Crear nueva materia
			scheduleService.addSubject(subjectData, user.id);
		}

		showSubjectModal = false;
		editingSubject = null;
	}

	function confirmDeleteSubject(subject: Subject) {
		deleteTarget = { type: 'subject', id: subject.id, name: subject.name };
		showDeleteConfirm = true;
	}

	// === HORARIOS ===

	function openCreateScheduleModal() {
		editingSchedule = null;
		showScheduleModal = true;
	}

	function openEditScheduleModal(schedule: Schedule) {
		editingSchedule = schedule;
		showScheduleModal = true;
	}

	function handleSaveSchedule(event: CustomEvent<{ schedule: Omit<Schedule, 'id' | 'userId'> }>) {
		if (!user) return;

		const scheduleData = event.detail.schedule;

		if (editingSchedule) {
			// Editar horario existente
			scheduleService.updateSchedule(editingSchedule.id, scheduleData);
		} else {
			// Crear nuevo horario
			scheduleService.addSchedule(scheduleData, user.id);
		}

		showScheduleModal = false;
		editingSchedule = null;
	}

	function confirmDeleteSchedule(schedule: Schedule) {
		const subject = subjectList.find(s => s.id === schedule.subjectId);
		const name = subject ? `${subject.name} - ${getDayName(schedule.dayOfWeek)} ${schedule.startTime}` : 'Horario';
		deleteTarget = { type: 'schedule', id: schedule.id, name };
		showDeleteConfirm = true;
	}

	// === GESTIÓN DE NOTAS ===

	function toggleSubjectExpansion(subjectId: string) {
		if (expandedSubjects.has(subjectId)) {
			expandedSubjects.delete(subjectId);
		} else {
			expandedSubjects.add(subjectId);
		}
		expandedSubjects = new Set(expandedSubjects);
	}

	function openCreateGradeModal(subject: Subject) {
		selectedSubjectForGrades = subject;
		editingGrade = null;
		showGradeModal = true;
	}

	function openEditGradeModal(grade: Grade, subject: Subject) {
		selectedSubjectForGrades = subject;
		editingGrade = grade;
		showGradeModal = true;
	}

	function handleSaveGrade(event: CustomEvent<{ grade: Omit<Grade, 'id' | 'userId'> }>) {
		if (!user || !selectedSubjectForGrades) return;

		const gradeData = { ...event.detail.grade, subjectId: selectedSubjectForGrades.id, userId: user.id };

		if (editingGrade) {
			gradeService.updateGrade(editingGrade.id, gradeData);
		} else {
			gradeService.addGrade(gradeData, user.id);
		}

		showGradeModal = false;
		editingGrade = null;
	}

	function confirmDeleteGrade(grade: Grade) {
		deleteTarget = { type: 'grade', id: grade.id, name: grade.description || 'Nota' };
		showDeleteConfirm = true;
	}

	function openCreateCategoryModal(subject: Subject) {
		selectedSubjectForGrades = subject;
		editingCategory = null;
		showCategoryModal = true;
	}

	function openEditCategoryModal(category: GradeCategory, subject: Subject) {
		selectedSubjectForGrades = subject;
		editingCategory = category;
		showCategoryModal = true;
	}

	function handleSaveCategory(event: CustomEvent<{ category: Omit<GradeCategory, 'id' | 'userId' | 'createdAt'> }>) {
		if (!user || !selectedSubjectForGrades) return;

		const categoryData = { ...event.detail.category, subjectId: selectedSubjectForGrades.id, userId: user.id };

		if (editingCategory) {
			gradeService.updateGradeCategory(editingCategory.id, categoryData);
		} else {
			gradeService.addGradeCategory(categoryData, user.id);
		}

		showCategoryModal = false;
		editingCategory = null;
	}

	function confirmDeleteCategory(category: GradeCategory) {
		deleteTarget = { type: 'category', id: category.id, name: category.name };
		showDeleteConfirm = true;
	}

	function openConfigModal(subject: Subject) {
		selectedSubjectForGrades = subject;
		editingConfig = gradesBySubjectData[subject.id]?.config || null;
		showConfigModal = true;
	}

	function handleSaveConfig(event: CustomEvent<{ config: Omit<SubjectGradeConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'> }>) {
		if (!user || !selectedSubjectForGrades) return;

		const configData = { ...event.detail.config, subjectId: selectedSubjectForGrades.id, userId: user.id };
		gradeService.addOrUpdateSubjectGradeConfig(configData, user.id);

		showConfigModal = false;
	}

	// === UTILIDADES ===

	function handleDelete() {
		if (!deleteTarget) return;

		if (deleteTarget.type === 'subject') {
			scheduleService.deleteSubject(deleteTarget.id);
		} else if (deleteTarget.type === 'schedule') {
			scheduleService.deleteSchedule(deleteTarget.id);
		} else if (deleteTarget.type === 'grade') {
			gradeService.deleteGrade(deleteTarget.id);
		} else if (deleteTarget.type === 'category') {
			gradeService.deleteGradeCategory(deleteTarget.id);
		}

		showDeleteConfirm = false;
		deleteTarget = null;
	}

	function getDayName(dayOfWeek: number): string {
		const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
		return days[dayOfWeek] || 'N/A';
	}

	function getTypeIcon(type: string): string {
		switch (type) {
			case 'lab': return '🧪';
			case 'tutorial': return '💡';
			default: return '📚';
		}
	}

	function getTypeName(type: string): string {
		switch (type) {
			case 'lab': return 'Laboratorio';
			case 'tutorial': return 'Ayudantía';
			default: return 'Clase';
		}
	}

	function getCategoryName(categoryId: string | undefined, categories: GradeCategory[]): string | null {
		if (!categoryId) return null;
		const category = categories.find((c: GradeCategory) => c.id === categoryId);
		return category ? category.name : null;
	}
</script>

<svelte:head>
	<title>Gestión de Horarios - Ramo Libre</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Encabezado -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-800 mb-2">📚 Gestión Académica</h1>
		<p class="text-gray-600">Administra tus materias, horarios y notas académicas</p>
	</div>

	<!-- Acciones principales -->
	<div class="flex flex-wrap gap-4 mb-8">
		<button 
			on:click={openCreateSubjectModal}
			class="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
		>
			<span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg></span>
			<span>Nueva materia</span>
		</button>
		<button 
			on:click={openCreateScheduleModal}
			disabled={subjectList.length === 0}
			class="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			<span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-plus-icon lucide-calendar-plus"><path d="M16 19h6"/><path d="M16 2v4"/><path d="M19 16v6"/><path d="M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8.5"/><path d="M3 10h18"/><path d="M8 2v4"/></svg></span>
			<span>Nuevo horario</span>
		</button>
	</div>

	{#if subjectList.length === 0}
		<!-- Estado vacío -->
		<div class="text-center py-12">
			<div class="text-6xl mb-4">📚</div>
			<h3 class="text-xl font-semibold text-gray-800 mb-2">¡Comienza agregando materias!</h3>
			<p class="text-gray-600 mb-6">Crea tus materias y luego agrega sus horarios correspondientes.</p>
			<button 
				on:click={openCreateSubjectModal}
				class="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
			>
				<span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg></span>
				<span>Crear mi primera materia</span>
			</button>
		</div>
	{:else}
		<!-- Lista de materias -->
		<div class="space-y-6">
			{#each subjectList as subject}
				{@const subjectGradeData = gradesBySubjectData[subject.id] || { grades: [], categories: [], config: null, currentAverage: 0 }}
				{@const isExpanded = expandedSubjects.has(subject.id)}
				
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
									<p class="text-sm text-gray-600">
										{subject.code} • {subject.credits} créditos
										{#if subject.professor}• {subject.professor}{/if}
										{#if subjectGradeData.grades.length > 0}
											• Promedio: <span class="font-semibold" class:text-green-600={subjectGradeData.currentAverage >= 4.0} class:text-red-600={subjectGradeData.currentAverage < 4.0}>
												{subjectGradeData.currentAverage.toFixed(1)}
											</span>
										{/if}
									</p>
								</div>
							</div>
							<div class="flex items-center space-x-2">
								<button 
									on:click={() => toggleSubjectExpansion(subject.id)}
									class="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
									title={isExpanded ? 'Ocultar gestión de notas' : 'Mostrar gestión de notas'}
								>
									{isExpanded ? 'Ocultar Notas' : 'Mostrar Notas'}
								</button>
								<button 
									on:click={() => openEditSubjectModal(subject)}
									class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
									title="Editar materia"
								>
									✏️
								</button>
								<button 
									on:click={() => confirmDeleteSubject(subject)}
									class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
									title="Eliminar materia"
								>
									🗑️
								</button>
							</div>
						</div>
					</div>

					<!-- Horarios de la materia -->
					<div class="px-6 py-4 border-b border-gray-200">
						{#if !subjectSchedulesMap[subject.id] || subjectSchedulesMap[subject.id].length === 0}
							<div class="text-center py-4">
								<p class="text-gray-500 text-sm mb-3">Esta materia no tiene horarios asignados</p>
								<button 
									on:click={openCreateScheduleModal}
									class="text-sm text-blue-600 hover:text-blue-700 underline"
								>
									Agregar horario
								</button>
							</div>
						{:else}
							<div class="space-y-2">
								<h4 class="text-sm font-medium text-gray-700 mb-3">Horarios ({subjectSchedulesMap[subject.id].length})</h4>
								{#each subjectSchedulesMap[subject.id] as schedule}
									<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
										<div class="flex items-center space-x-3">
											<span class="text-lg">{getTypeIcon(schedule.type)}</span>
											<div>
												<div class="flex items-center space-x-2">
													<span class="font-medium text-gray-800">{getDayName(schedule.dayOfWeek)}</span>
													<span class="text-gray-600">{schedule.startTime} - {schedule.endTime}</span>
													{#if schedule.classroom}
														<span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{schedule.classroom}</span>
													{/if}
												</div>
												<div class="text-xs text-gray-500">{getTypeName(schedule.type)}</div>
											</div>
										</div>
										<div class="flex items-center space-x-1">
											<button 
												on:click={() => openEditScheduleModal(schedule)}
												class="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
												title="Editar horario"
											>
												✏️
											</button>
											<button 
												on:click={() => confirmDeleteSchedule(schedule)}
												class="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
												title="Eliminar horario"
											>
												🗑️
											</button>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Gestión de notas (expandible) -->
					{#if isExpanded}
						<div class="px-6 py-4 bg-gray-25">
							<!-- Resumen de notas -->
							<div class="mb-6">
								<div class="flex items-center justify-between mb-4">
									<h4 class="text-lg font-semibold text-gray-800">Gestión de Notas</h4>
									<div class="flex items-center space-x-2">
										<button 
											on:click={() => openCreateGradeModal(subject)}
											class="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
										>
											+ Nota
										</button>
										<button 
											on:click={() => openCreateCategoryModal(subject)}
											class="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
										>
											+ Categoría
										</button>
										<button 
											on:click={() => openConfigModal(subject)}
											class="text-sm px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
										>
											⚙️ Config
										</button>
									</div>
								</div>
								
								<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
									<div class="text-center p-3 bg-blue-50 rounded-lg">
										<div class="text-xl font-bold text-blue-600">{subjectGradeData.grades.length}</div>
										<div class="text-xs text-blue-800">Notas</div>
									</div>
									<div class="text-center p-3 bg-green-50 rounded-lg">
										<div class="text-xl font-bold text-green-600">{subjectGradeData.categories.length}</div>
										<div class="text-xs text-green-800">Categorías</div>
									</div>
									<div class="text-center p-3 bg-purple-50 rounded-lg">
										<div class="text-xl font-bold text-purple-600">
											{subjectGradeData.config ? '✓' : '✗'}
										</div>
										<div class="text-xs text-purple-800">Configuración</div>
									</div>
								</div>
							</div>

							<!-- Categorías -->
							{#if subjectGradeData.categories.length > 0}
								<div class="mb-6">
									<h5 class="text-sm font-semibold text-gray-700 mb-3">Categorías de Evaluación</h5>
									<div class="space-y-2">
										{#each subjectGradeData.categories as category}
											<div class="flex items-center justify-between p-2 bg-white rounded border">
												<div class="flex-1">
													<div class="flex items-center space-x-2">
														<span class="font-medium text-gray-800 text-sm">{category.name}</span>
														<span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{category.weight}%</span>
													</div>
													{#if category.description}
														<p class="text-xs text-gray-600 mt-1">{category.description}</p>
													{/if}
												</div>
												<div class="flex items-center space-x-1">
													<button 
														on:click={() => openEditCategoryModal(category, subject)}
														class="p-1 text-gray-600 hover:text-blue-600 text-xs"
														title="Editar categoría"
													>
														✏️
													</button>
													<button 
														on:click={() => confirmDeleteCategory(category)}
														class="p-1 text-gray-600 hover:text-red-600 text-xs"
														title="Eliminar categoría"
													>
														🗑️
													</button>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Ecuación de cálculo de notas -->
							<GradeEquationDisplay 
								grades={subjectGradeData.grades}
								categories={subjectGradeData.categories}
								config={subjectGradeData.config}
							/>

							<!-- Notas -->
							<div>
								<h5 class="text-sm font-semibold text-gray-700 mb-3">Notas Registradas</h5>
								{#if subjectGradeData.grades.length === 0}
									<div class="text-center py-4">
										<div class="text-2xl mb-2">📝</div>
										<p class="text-gray-500 text-sm">No hay notas registradas</p>
									</div>
								{:else}
									<div class="space-y-2">
										{#each subjectGradeData.grades as grade}
											{@const categoryName = getCategoryName(grade.categoryId, subjectGradeData.categories)}
											{@const config = subjectGradeData.config}
											{@const isFailingGrade = grade.value && config && grade.value < config.passingGrade}
											<div class="flex items-center justify-between p-2 bg-white rounded border">
												<div class="flex-1">
													<div class="flex items-center space-x-2">
														<span class="font-medium text-gray-800 text-sm">{grade.description}</span>
														<span class="text-sm font-bold" class:text-green-600={grade.value && config && grade.value >= config.passingGrade} class:text-red-600={isFailingGrade} class:text-gray-500={!grade.value}>
															{#if grade.value}
																{grade.value.toFixed(1)}/{grade.maxValue}
															{:else}
																—/{grade.maxValue}
															{/if}
														</span>
														<span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{grade.type}</span>
														{#if categoryName}
															<span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{categoryName}</span>
														{/if}
														{#if !grade.value}
															<span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Variable</span>
														{/if}
													</div>
													<p class="text-xs text-gray-600 mt-1">
														{new Date(grade.date).toLocaleDateString('es-ES')} • Peso: {grade.weight}%
														{#if isFailingGrade && config}
															<span class="text-red-600 font-medium">• Por debajo del mínimo ({config.passingGrade})</span>
														{/if}
													</p>
												</div>
												<div class="flex items-center space-x-1">
													<button 
														on:click={() => openEditGradeModal(grade, subject)}
														class="p-1 text-gray-600 hover:text-blue-600 text-xs"
														title="Editar nota"
													>
														✏️
													</button>
													<button 
														on:click={() => confirmDeleteGrade(grade)}
														class="p-1 text-gray-600 hover:text-red-600 text-xs"
														title="Eliminar nota"
													>
														🗑️
													</button>
												</div>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modales -->
<SubjectModal 
	bind:isOpen={showSubjectModal}
	subject={editingSubject}
	on:save={handleSaveSubject}
	on:cancel={() => { showSubjectModal = false; editingSubject = null; }}
/>

<ScheduleModal 
	bind:isOpen={showScheduleModal}
	schedule={editingSchedule}
	subjects={subjectList}
	on:save={handleSaveSchedule}
	on:cancel={() => { showScheduleModal = false; editingSchedule = null; }}
/>

<GradeModal 
	bind:isOpen={showGradeModal}
	grade={editingGrade}
	categories={selectedSubjectForGrades ? gradesBySubjectData[selectedSubjectForGrades.id]?.categories || [] : []}
	config={selectedSubjectForGrades ? gradesBySubjectData[selectedSubjectForGrades.id]?.config : null}
	on:save={handleSaveGrade}
	on:close={() => { showGradeModal = false; editingGrade = null; }}
/>

<GradeCategoryModal 
	bind:isOpen={showCategoryModal}
	category={editingCategory}
	on:save={handleSaveCategory}
	on:close={() => { showCategoryModal = false; editingCategory = null; }}
/>

<GradeConfigModal 
	bind:isOpen={showConfigModal}
	config={editingConfig}
	on:save={handleSaveConfig}
	on:close={() => { showConfigModal = false; editingConfig = null; }}
/>

<!-- Modal de confirmación de eliminación -->
{#if showDeleteConfirm && deleteTarget}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl p-6 max-w-md w-full">
			<h3 class="text-xl font-bold text-red-600 mb-4">⚠️ Confirmar eliminación</h3>
			<p class="text-gray-700 mb-6">
				¿Estás seguro de que quieres eliminar "{deleteTarget.name}"?
				{#if deleteTarget.type === 'subject'}
					<br><strong>Esto también eliminará todos los horarios asociados a esta materia.</strong>
				{/if}
				Esta acción no se puede deshacer.
			</p>
			<div class="flex space-x-3">
				<button 
					on:click={handleDelete}
					class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex-1"
				>
					Sí, eliminar
				</button>
				<button 
					on:click={() => { showDeleteConfirm = false; deleteTarget = null; }}
					class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex-1"
				>
					Cancelar
				</button>
			</div>
		</div>
	</div>
{/if}
