<script lang="ts">
	import { type Subject } from '@ramo-libre/shared';
	import { currentSubjects } from '$lib/stores/subject';
	import { currentSchedules } from '$lib/stores/schedule';
	import { currentGrades } from '$lib/stores/grades';
	import { currentCategories } from '$lib/stores/categories';
	import { currentSubjectGradeConfigs } from '$lib/stores/config';

	import SubjectModal from '$components/modals/SubjectModal.svelte';
	import ScheduleModal from '$components/modals/ScheduleModal.svelte';
	import GradeModal from '$components/modals/GradeModal.svelte';
	import GradeConfigModal from '../../components/modals/GradeConfigModal.svelte';
	import GradeEquationDisplay from '../../components/GradeEquationDisplay.svelte';
	import GradeCategoryModal from '../../components/modals/GradeCategoryModal.svelte';

	// ICONS
	import PlusIcon from '$embedded-icons/plus.svg?component';
	import CalendarPlusIcon from '$embedded-icons/calendar-plus.svg?component';
	import GestionIcon from '$embedded-icons/gestion.svg?component';
	import BooksIcon from '$embedded-icons/books.svg?component';
	import EditIcon from '$embedded-icons/edit.svg?component';
	import TrashIcon from '$embedded-icons/trash.svg?component';
	import ConfigIcon from '$embedded-icons/config.svg?component';
	import CheckIcon from '$embedded-icons/check.svg?component';
	import XIcon from '$embedded-icons/x.svg?component';
	import GradeIcon from '$embedded-icons/grade.svg?component';
	import WarningIcon from '$embedded-icons/warning.svg?component';
    import BookIcon from '$embedded-icons/book.svg?component';
	import LabIcon from '$embedded-icons/lab.svg?component';
	import IdeaIcon from '$embedded-icons/idea.svg?component';
	import TutorialIcon from '$embedded-icons/tutorial.svg?component';

	type Modals = null | 'subject' | 'schedule' | 'deleteConfirm' | 'grade' | 'category' | 'config';
	type DeleteTargetType = 'subject' | 'schedule' | 'grade' | 'category' | null;

	let currentModal: Modals = null;
	let targetObject: any = null;
	let targetType: DeleteTargetType = null;
	let expandedSubject: string | null = null;

	$: schedulesBySubject = currentSchedules.by<Subject>(
		$currentSubjects,
		$currentSchedules,
		'id',
		'subjectId'
	);
	$: gradesBySubject = currentGrades.by<Subject>(
		$currentSubjects,
		$currentGrades,
		'id',
		'subjectId'
	);
	$: categoriesBySubject = currentCategories.by<Subject>(
		$currentSubjects,
		$currentCategories,
		'id',
		'subjectId'
	);
	$: configsBySubject = currentSubjectGradeConfigs.by<Subject>(
		$currentSubjects,
		$currentSubjectGradeConfigs,
		'id',
		'subjectId'
	);

	function toggleSubject(subjectId: string) {
		expandedSubject = expandedSubject === subjectId ? null : subjectId;
	}

	function openModal(modalType: Modals, object: any = null, type: DeleteTargetType = null) {
		currentModal = modalType;
		targetObject = object;
		targetType = type;
	}

	function handleSaveSubject(event: CustomEvent<{ subject: Subject }>) {
		const { subject } = event.detail;
		if (targetObject) {
			currentSubjects.updateSubject(subject);
		} else {
			currentSubjects.addSubject(subject);
		}
		openModal(null);
	}

	function handleSaveSchedule(event: CustomEvent<{ schedule: any }>) {
		const { schedule } = event.detail;
		if (targetObject?.id) {
			currentSchedules.updateSchedule(schedule);
		} else {
			currentSchedules.addSchedule(schedule);
		}
		openModal(null);
	}

	function handleSaveGrade(event: CustomEvent<{ grade: any }>) {
		const { grade } = event.detail;
		if (targetObject.id) {
			currentGrades.updateGrade(grade);
		} else {
			currentGrades.addGrade(grade);
		}
		openModal(null);
	}

	function handleSaveConfig(event: CustomEvent<{ config: any }>) {
		const { config } = event.detail;
		if (targetObject.id) {
			currentSubjectGradeConfigs.updateConfig(config);
		} else {
			currentSubjectGradeConfigs.addConfig(config);
		}
		openModal(null);
	}

	function handleSaveCategory(event: CustomEvent<{ category: any }>) {
		const { category } = event.detail;
		if (targetObject.id) {
			currentCategories.updateCategory(category);
		} else {
			currentCategories.addCategory(category);
		}
		openModal(null);
	}

	function handleDelete() {
		if (!targetObject) return;
		switch (targetType) {
			case 'subject':
				currentSubjects.removeSubject(targetObject.id);
				currentSchedules.removeSchedulesBySubject(targetObject.id);
				currentGrades.removeGradesBySubject(targetObject.id);
				currentCategories.removeCategoriesBySubject(targetObject.id);
				currentSubjectGradeConfigs.removeConfigsBySubject(targetObject.id);
				break;
			case 'schedule':
				currentSchedules.removeSchedule(targetObject.id);
				break;
			case 'grade':
				currentGrades.removeGrade(targetObject.id);
				break;
			case 'category':
				currentCategories.removeCategory(targetObject.id);
				break;
		}
		openModal(null);
	}
</script>

<svelte:head>
	<title>Gestión de Horarios - Ramo Libre</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Encabezado -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-800 mb-2 flex items-center">
			<GestionIcon class="inline-block w-8 h-8 mr-2" />
			Gestión Académica
		</h1>
		<p class="text-gray-600">Administra tus materias, horarios y notas académicas</p>
	</div>

	<!-- Acciones principales -->
	<div class="flex flex-wrap gap-4 mb-8">
		<button
			on:click={() => openModal('subject')}
			class="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
		>
			<span>
				<PlusIcon class="w-5 h-5" />
			</span>
			<span>Nueva materia</span>
		</button>
		<button
			on:click={() => openModal('schedule')}
			disabled={$currentSubjects.length === 0}
			class="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			<span>
				<CalendarPlusIcon class="w-5 h-5" />
			</span>
			<span>Nuevo horario</span>
		</button>
	</div>

	{#if $currentSubjects.length === 0}
		<!-- Estado vacío -->
		<div class="text-center py-12">
			<div class="text-6xl mb-4">
				<BooksIcon class="inline-block w-12 h-12" />
			</div>
			<h3 class="text-xl font-semibold text-gray-800 mb-2">¡Comienza agregando materias!</h3>
			<p class="text-gray-600 mb-6">
				Crea tus materias y luego agrega sus horarios correspondientes.
			</p>
			<button
				on:click={() => openModal('subject')}
				class="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
			>
				<PlusIcon class="inline-block w-5 h-5" />
				<span>Crear mi primera materia</span>
			</button>
		</div>
	{:else}
		<!-- Lista de materias -->
		<div class="space-y-6">
			{#each $currentSubjects as subject}
				{@const scheduleData = schedulesBySubject.get(subject.id)}
				{@const gradesData = gradesBySubject.get(subject.id)}
				{@const categoriesData = categoriesBySubject.get(subject.id)}
				{@const configDataArray = configsBySubject.get(subject.id)}
				{@const configData =
					configDataArray && configDataArray.length > 0 ? configDataArray[0] : null}

				<div
					class={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 ${
						expandedSubject === subject.id ? 'border-opacity-80' : 'border-gray-200'
					}`}
					style={expandedSubject === subject.id ? `border-color: ${subject.color}` : ''}
				>
					<!-- Header de la materia -->
					<div class="px-6 py-5 bg-gray-50 border-b border-gray-200">
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
									<p class="text-sm text-gray-600">
										{subject.code} • {subject.credits} créditos
										{#if subject.professor}• {subject.professor}{/if}
									</p>
								</div>
							</div>
							<!-- Botones para desktop (ocultos en móvil) -->
							<div class="hidden lg:flex items-center space-x-2">
								<button
									on:click={() => toggleSubject(subject.id)}
									class="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
									title={expandedSubject === subject.id
										? 'Ocultar gestión de notas'
										: 'Mostrar gestión de notas'}
								>
									{expandedSubject === subject.id
										? 'Ocultar Notas'
										: 'Mostrar Notas'}
								</button>
								<button
									on:click={() => openModal('subject', subject)}
									class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
									title="Editar materia"
								>
									<EditIcon class="w-5 h-5" />
								</button>
								<button
									on:click={() => openModal('deleteConfirm', subject, 'subject')}
									class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
									title="Eliminar materia"
								>
									<TrashIcon class="w-5 h-5" />
								</button>
							</div>
						</div>
					</div>

					<!-- Barra de acciones móvil (solo visible en móvil) -->
					<div class="lg:hidden px-6 py-2 bg-gray-100 border-b border-gray-200">
						<div class="flex items-center justify-end space-x-2">
							<button
								on:click={() => toggleSubject(subject.id)}
								class="text-xs px-3 py-1 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors font-medium"
								title={expandedSubject === subject.id
									? 'Ocultar gestión de notas'
									: 'Mostrar gestión de notas'}
							>
								{expandedSubject === subject.id ? 'Ocultar Notas' : 'Mostrar Notas'}
							</button>
							<button
								on:click={() => openModal('subject', subject)}
								class="text-xs px-3 py-1 text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center rounded-md transition-colors font-medium"
								title="Editar materia"
							>
								<EditIcon class="inline-block w-4 h-4 mr-1" />
								Editar
							</button>
							<button
								on:click={() => openModal('deleteConfirm', subject, 'subject')}
								class="text-xs px-3 py-1 text-red-600 bg-red-50 hover:bg-red-100 flex items-center rounded-md transition-colors font-medium"
								title="Eliminar materia"
							>
								<TrashIcon class="inline-block w-4 h-4 mr-1" />
								Eliminar
							</button>
						</div>
					</div>

					<!-- Horarios de la materia -->
					<div class="lg:px-6 md:px-4 px-2 py-4 border-b border-gray-200">
						{#if !scheduleData || scheduleData.length === 0}
							<div class="text-center py-4">
								<p class="text-gray-500 text-sm mb-3">
									Esta materia no tiene horarios asignados
								</p>
								<button
									on:click={() =>
										openModal('schedule', { subjectId: subject.id })}
									class="text-sm text-blue-600 hover:text-blue-700 underline"
								>
									Agregar horario
								</button>
							</div>
						{:else}
							<div class="space-y-2">
								<h4 class="text-sm font-medium text-gray-700 mb-3">
									Horarios ({scheduleData.length})
								</h4>
								{#each scheduleData as schedule}
									<div class="p-3 bg-gray-50 rounded-lg">
										<!-- Layout móvil (< md): diseño vertical optimizado -->
										<div class="md:hidden">
											<div class="flex items-start justify-between">
												<div
													class="flex items-start space-x-3 flex-1 min-w-0"
												>
													{#if schedule.type === 'class'}
														<BookIcon class="inline-block w-6 h-6" />
													{:else if schedule.type === 'lab'}
														<LabIcon class="inline-block w-6 h-6" />
													{:else if schedule.type === 'tutorial'}
														<IdeaIcon class="inline-block w-6 h-6" />
													{:else}
														<TutorialIcon
															class="inline-block w-6 h-6"
														/>
													{/if}
													<div class="min-w-0 flex-1">
														<div
															class="flex flex-col items-start gap-1 mb-1"
														>
															<span
																class="font-medium text-gray-800 text-sm"
																>{currentSchedules.getDayName(
																	schedule.dayOfWeek
																)}</span
															>
															<span class="text-gray-600 text-sm"
																>{schedule.startTime} - {schedule.endTime}</span
															>
															{#if schedule.classroom}
																<span
																	class="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded whitespace-nowrap inline-block mt-1"
																	>{schedule.classroom}</span
																>
															{/if}
														</div>
													</div>
												</div>

												<!-- Botones de acción móvil -->
												<div
													class="flex items-center space-x-1 ml-2 shrink-0"
												>
													<button
														on:click={() =>
															openModal('schedule', schedule)}
														class="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
														title="Editar horario"
													>
														<EditIcon class="w-5 h-5" />
													</button>
													<button
														on:click={() =>
															openModal(
																'deleteConfirm',
																{
																	id: schedule.id,
																	name: `${currentSchedules.getDayName(schedule.dayOfWeek)} ${schedule.startTime}-${schedule.endTime}`,
																},
																'schedule'
															)}
														class="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
														title="Eliminar horario"
													>
														<TrashIcon class="w-5 h-5" />
													</button>
												</div>
											</div>
										</div>

										<!-- Layout desktop (>= md): diseño original horizontal completo -->
										<div class="hidden md:flex items-center justify-between">
											<div class="flex items-center space-x-3">
												{#if schedule.type === 'class'}
													<BookIcon class="inline-block w-6 h-6" />
												{:else if schedule.type === 'lab'}
													<LabIcon class="inline-block w-6 h-6" />
												{:else if schedule.type === 'tutorial'}
													<IdeaIcon class="inline-block w-6 h-6" />
												{:else}
													<TutorialIcon class="inline-block w-6 h-6" />
												{/if}
												<div>
													<div class="flex items-center space-x-2">
														<span class="font-medium text-gray-800"
															>{currentSchedules.getDayName(
																schedule.dayOfWeek
															)}</span
														>
														<span class="text-gray-600"
															>{schedule.startTime} - {schedule.endTime}</span
														>
														{#if schedule.classroom}
															<span
																class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
																>{schedule.classroom}</span
															>
														{/if}
													</div>
													<div class="text-xs text-gray-500">
														{schedule.type}
													</div>
												</div>
											</div>

											<!-- Botones de acción desktop -->
											<div class="flex items-center space-x-1">
												<button
													on:click={() => openModal('schedule', schedule)}
													class="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
													title="Editar horario"
												>
													<EditIcon class="w-5 h-5" />
												</button>
												<button
													on:click={() =>
														openModal(
															'deleteConfirm',
															{
																id: schedule.id,
																name: `${currentSchedules.getDayName(schedule.dayOfWeek)} ${schedule.startTime}-${schedule.endTime}`,
															},
															'schedule'
														)}
													class="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
													title="Eliminar horario"
												>
													<TrashIcon class="w-5 h-5" />
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Gestión de notas (expandible) -->
					{#if expandedSubject === subject.id}
						<div class="px-6 py-4 bg-gray-25">
							<!-- Resumen de notas -->
							<div class="mb-6">
								<div class="flex items-center justify-between mb-4">
									<h4 class="text-lg font-semibold text-gray-800">
										Gestión de Notas
									</h4>
									<!-- Botones para desktop (ocultos en móvil) -->
									<div class="hidden lg:flex items-center space-x-2">
										<button
											on:click={() =>
												openModal('grade', { subjectId: subject.id })}
											class="text-sm px-3 py-1 bg-blue-500 text-white rounded flex items-center hover:bg-blue-600 transition-colors"
										>
											<PlusIcon class="inline-block w-4 h-4 mr-1" />
											Nota
										</button>
										<button
											on:click={() =>
												openModal('category', { subjectId: subject.id })}
											class="text-sm px-3 py-1 bg-green-500 text-white rounded flex items-center hover:bg-green-600 transition-colors"
										>
											<PlusIcon class="inline-block w-4 h-4 mr-1" />
											Categoría
										</button>
										<button
											on:click={() =>
												openModal(
													'config',
													configData ?? { subjectId: subject.id }
												)}
											class="text-sm px-3 py-1 bg-purple-500 text-white rounded flex items-center hover:bg-purple-600 transition-colors"
										>
											<ConfigIcon class="inline-block w-4 h-4 mr-1" />
											Config
										</button>
									</div>
								</div>

								<!-- Barra de acciones móvil (solo visible en móvil) -->
								<div class="lg:hidden mb-4 p-3 bg-gray-100 rounded-lg">
									<div class="flex items-center justify-center space-x-2">
										<button
											on:click={() =>
												openModal('grade', { subjectId: subject.id })}
											class="text-xs px-3 py-2 bg-blue-500 text-white rounded-md flex items-center hover:bg-blue-600 transition-colors font-medium flex-1"
										>
											<PlusIcon class="inline-block w-4 h-4 mr-1" />
											Nota
										</button>
										<button
											on:click={() =>
												openModal('category', { subjectId: subject.id })}
											class="text-xs px-3 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600 transition-colors font-medium flex-1"
										>
											<PlusIcon class="inline-block w-4 h-4 mr-1" />
											Categoría
										</button>
										<button
											on:click={() =>
												openModal(
													'config',
													configData ?? { subjectId: subject.id }
												)}
											class="text-xs px-3 py-2 bg-purple-500 text-white rounded-md flex items-center hover:bg-purple-600 transition-colors font-medium flex-1"
										>
											<ConfigIcon class="inline-block w-4 h-4 mr-1" />
											Config
										</button>
									</div>
								</div>

								<div class="grid grid-cols-3 gap-2 lg:gap-4 mb-4">
									<div class="text-center p-2 lg:p-3 bg-blue-50 rounded-lg">
										<div class="text-lg lg:text-xl font-bold text-blue-600">
											{gradesData?.length ?? 0}
										</div>
										<div class="text-xs text-blue-800">Notas</div>
									</div>
									<div class="text-center p-2 lg:p-3 bg-green-50 rounded-lg">
										<div class="text-lg lg:text-xl font-bold text-green-600">
											{categoriesData?.length ?? 0}
										</div>
										<div class="text-xs text-green-800">Categorías</div>
									</div>
									<div
										class={`text-center p-2 lg:p-3 rounded-lg transition-colors duration-200 
											${configData ? 'bg-purple-50 text-purple-800' : 'bg-red-50 text-red-800 border border-red-300'}`}
									>
										<div
											class={`text-lg lg:text-xl font-bold ${configData ? 'text-purple-600' : 'text-red-600'}`}
										>
											{#if configData}
												<CheckIcon class="inline-block w-5 h-5 mr-1" />
											{:else}
												<XIcon class="inline-block w-5 h-5 mr-1" />
											{/if}
										</div>
										<div class="text-xs">Configuración</div>
									</div>
								</div>
							</div>
							<!-- Categorías -->
							{#if categoriesData && categoriesData.length > 0}
								<div class="mb-6">
									<h5 class="text-sm font-semibold text-gray-700 mb-3">
										Categorías de Evaluación
									</h5>
									<div class="space-y-2">
										{#each categoriesData as category}
											<div
												class="flex items-center justify-between p-2 bg-white rounded border"
											>
												<div class="flex-1">
													<div class="flex items-center space-x-2">
														<span
															class="font-medium text-gray-800 text-sm"
															>{category.name}</span
														>
														<span
															class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
															>{category.weight}%</span
														>
													</div>
													{#if category.description}
														<p class="text-xs text-gray-600 mt-1">
															{category.description}
														</p>
													{/if}
												</div>
												<div class="flex items-center space-x-1">
													<button
														on:click={() =>
															openModal('category', category)}
														class="p-1 text-gray-600 hover:text-blue-600 text-xs"
														title="Editar categoría"
													>
														<EditIcon class="w-5 h-5" />
													</button>
													<button
														on:click={() =>
															openModal(
																'deleteConfirm',
																category,
																'category'
															)}
														class="p-1 text-gray-600 hover:text-red-600 text-xs"
														title="Eliminar categoría"
													>
														<TrashIcon class="w-5 h-5" />
													</button>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Ecuación de cálculo de notas -->
							<GradeEquationDisplay
								grades={gradesData ?? []}
								categories={categoriesData ?? []}
								config={configData}
							/>

							<!-- Notas -->
							<div>
								<h5 class="text-sm font-semibold text-gray-700 mb-3">
									Notas Registradas
								</h5>
								{#if !gradesData?.length}
									<div class="text-center py-4">
										<div class="text-2xl mb-2">
											<GradeIcon class="inline-block w-6 h-6" />
										</div>
										<p class="text-gray-500 text-sm">
											No hay notas registradas
										</p>
									</div>
								{:else}
									<div class="space-y-2">
										{#each gradesData as grade}
											{@const categoryName = categoriesData?.find(
												(cat) => cat.id === grade.categoryId
											)?.name}
											{@const isFailingGrade =
												grade.value &&
												configData &&
												grade.value < configData.passingGrade}
											<div
												class="flex items-center md:items-start justify-between p-2 md:p-3 bg-white rounded border"
											>
												<div class="flex-1 min-w-0">
													<!-- Layout móvil (< md): vertical | Layout desktop (>= md): horizontal original -->
													<div
														class="md:flex md:items-center md:space-x-2 md:gap-1"
													>
														<div
															class="flex items-start space-x-2 md:space-x-3"
														>
															<span
																class="font-medium text-gray-800 text-sm md:truncate block md:inline"
																>{grade.description}</span
															>
															<span
																class="text-sm font-bold shrink-0 block md:inline"
																class:text-green-600={grade.value &&
																	configData &&
																	grade.value >=
																		configData.passingGrade}
																class:text-red-600={isFailingGrade}
																class:text-gray-500={!grade.value}
															>
																{#if grade.value !== null && grade.value !== undefined}
																	{grade.value.toFixed(
																		1
																	)}/{configData?.maxGrade || '-'}
																{:else}
																	—/{configData?.maxGrade || '-'}
																{/if}
															</span>
														</div>

														<!-- Tags/Badges - responsivos solo en móvil -->
														<div
															class="flex flex-wrap gap-1 mt-2 md:mt-0 md:contents"
														>
															<span
																class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded whitespace-nowrap"
																>{grade.type}</span
															>
															{#if categoryName}
																<span
																	class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap"
																	>{categoryName}</span
																>
															{/if}
															{#if !grade.value}
																<span
																	class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded whitespace-nowrap"
																	>Variable</span
																>
															{/if}
														</div>
													</div>

													<!-- Información adicional -->
													<div class="text-xs text-gray-600 mt-1 md:mt-1">
														<div>
															{new Date(
																grade.date
															).toLocaleDateString('es-ES')} • Peso: {grade.weight}%
														</div>
														{#if isFailingGrade && configData}
															<div
																class="text-red-600 font-medium mt-1"
															>
																Por debajo del mínimo ({configData.passingGrade})
															</div>
														{/if}
													</div>
												</div>

												<!-- Botones de acción -->
												<div
													class="flex items-center space-x-1 ml-2 shrink-0"
												>
													<button
														on:click={() => openModal('grade', grade)}
														class="p-1 md:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors text-xs md:text-base"
														title="Editar nota"
													>
														<EditIcon class="w-5 h-5" />
													</button>
													<button
														on:click={() =>
															openModal(
																'deleteConfirm',
																{
																	...grade,
																	name: grade.description,
																},
																'grade'
															)}
														class="p-1 md:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors text-xs md:text-base"
														title="Eliminar nota"
													>
														<TrashIcon class="w-5 h-5" />
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
	bind:currentModal
	modalId="subject"
	subject={targetObject}
	on:save={handleSaveSubject}
	on:cancel={() => openModal(null)}
/>
<ScheduleModal
	bind:currentModal
	modalId="schedule"
	schedule={targetObject}
	subjects={$currentSubjects}
	on:save={handleSaveSchedule}
	on:cancel={() => openModal(null)}
/>

<GradeModal
	bind:currentModal
	modalId="grade"
	grade={targetObject}
	categories={categoriesBySubject.get(targetObject?.subjectId) || []}
	config={configsBySubject.get(targetObject?.subjectId)?.[0] || null}
	on:configure-now={() => openModal('config', targetObject)}
	on:save={handleSaveGrade}
	on:close={() => openModal(null)}
/>

<GradeConfigModal
	bind:currentModal
	modalId="config"
	config={targetObject}
	on:save={handleSaveConfig}
	on:close={() => openModal(null)}
/>

<GradeCategoryModal
	bind:currentModal
	modalId="category"
	category={targetObject}
	on:save={handleSaveCategory}
	on:close={() => openModal(null)}
/>

<!-- Modal de confirmación de eliminación -->
{#if currentModal === 'deleteConfirm' && targetObject !== null}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl p-6 max-w-md w-full">
			<h3 class="text-xl font-bold text-red-600 mb-4 flex items-center">
				<WarningIcon class="inline-block w-6 h-6 mr-2" />
				Confirmar eliminación
			</h3>
			<p class="text-gray-700 mb-6">
				¿Estás seguro de que quieres eliminar "{targetObject.name}"?
				{#if targetType === 'subject'}
					<br /><strong
						>Esto también eliminará todos los horarios asociados a esta materia.</strong
					>
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
					on:click={() => openModal(null)}
					class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex-1"
				>
					Cancelar
				</button>
			</div>
		</div>
	</div>
{/if}
