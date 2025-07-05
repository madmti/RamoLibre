<script lang="ts">
	import { onMount } from 'svelte';
	import { scheduleService, subjects, schedules } from '$lib/stores/schedule';
	import { currentUser } from '$lib/stores/user';
	import SubjectModal from '$lib/components/modals/SubjectModal.svelte';
	import ScheduleModal from '$lib/components/modals/ScheduleModal.svelte';
	import type { Subject, Schedule, User } from '@ramo-libre/shared';

	let user: User | null = null;
	let subjectList: Subject[] = [];
	let scheduleList: Schedule[] = [];
	let subjectSchedulesMap: Record<string, Schedule[]> = {};

	// Estados de los modales
	let showSubjectModal = false;
	let showScheduleModal = false;
	let editingSubject: Subject | null = null;
	let editingSchedule: Schedule | null = null;
	let showDeleteConfirm = false;
	let deleteTarget: { type: 'subject' | 'schedule'; id: string; name: string } | null = null;

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

	// Suscripciones
	onMount(() => {
		// Inicializar el servicio de horarios
		scheduleService.initialize();

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

	// === UTILIDADES ===

	function handleDelete() {
		if (!deleteTarget) return;

		if (deleteTarget.type === 'subject') {
			scheduleService.deleteSubject(deleteTarget.id);
		} else {
			scheduleService.deleteSchedule(deleteTarget.id);
		}

		showDeleteConfirm = false;
		deleteTarget = null;
	}

	function getDayName(dayOfWeek: number): string {
		const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
		return days[dayOfWeek] || 'N/A';
	}

	function getSubjectName(subjectId: string): string {
		const subject = subjectList.find(s => s.id === subjectId);
		return subject ? subject.name : 'Materia eliminada';
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
</script>

<svelte:head>
	<title>Gestión de Horarios - Ramo Libre</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Encabezado -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-800 mb-2">📚 Gestión de Horarios</h1>
		<p class="text-gray-600">Administra tus materias y horarios académicos</p>
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
		<a 
			href="/horario"
			class="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
		>
			<span>👀</span>
			<span>Ver horarios</span>
		</a>
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
									</p>
								</div>
							</div>
							<div class="flex items-center space-x-2">
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
					<div class="px-6 py-4">
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
