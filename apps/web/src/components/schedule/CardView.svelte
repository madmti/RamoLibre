<script lang="ts">
	import { onMount } from 'svelte';
	import { currentSchedules } from '$lib/stores/schedule';
	import { currentSubjects } from '$lib/stores/subject';
	import type { Schedule, Subject } from '@ramo-libre/shared';

	// ICONS
	import BooksIcon from '$embedded-icons/books.svg?component';
	import BookIcon from '$embedded-icons/book.svg?component';
	import LabIcon from '$embedded-icons/lab.svg?component';
	import TutorialIcon from '$embedded-icons/tutorial.svg?component';
	import IdeaIcon from '$embedded-icons/idea.svg?component';
	import TargetIcon from '$embedded-icons/target.svg?component';
	import NextForwardIcon from '$embedded-icons/next-forward.svg?component';
	import CheckIcon from '$embedded-icons/check.svg?component';

	let currentTime = new Date();

	// Días de la semana
	const weekDays = [
		{ id: 1, name: 'Lunes', short: 'Lun' },
		{ id: 2, name: 'Martes', short: 'Mar' },
		{ id: 3, name: 'Miércoles', short: 'Mié' },
		{ id: 4, name: 'Jueves', short: 'Jue' },
		{ id: 5, name: 'Viernes', short: 'Vie' },
		{ id: 6, name: 'Sábado', short: 'Sáb' },
	];

	onMount(() => {
		// Actualizar tiempo cada minuto
		const timeInterval = setInterval(() => {
			currentTime = new Date();
		}, 60000);

		return () => {
			clearInterval(timeInterval);
		};
	});

	// Agrupar materias por día
	$: scheduleByDay = weekDays.map((day) => ({
		...day,
		schedules: $currentSchedules
			.filter((schedule) => schedule.dayOfWeek === day.id)
			.sort((a, b) => a.startTime.localeCompare(b.startTime)),
	}));

	// Función para obtener datos de materia por ID
	const getSubjectById = (subjectId: string): Subject | undefined => {
		return $currentSubjects.find((subject) => subject.id === subjectId);
	};

	// Obtener el día actual (0 = domingo, 1 = lunes, etc.)
	$: today = currentTime.getDay();

	// Convertir día de JS (0=domingo) a nuestro formato (1=lunes)
	$: currentDayIndex = today === 0 ? 7 : today;

	// Función para verificar si es el día actual
	const isToday = (dayIndex: number) => dayIndex === currentDayIndex;

	// Función para verificar si una clase está en progreso
	const isClassInProgress = (schedule: Schedule) => {
		if (!isToday(schedule.dayOfWeek)) return false;

		const now = currentTime.getHours() * 60 + currentTime.getMinutes();
		const [startHour, startMin] = schedule.startTime.split(':').map(Number);
		const [endHour, endMin] = schedule.endTime.split(':').map(Number);
		const startMinutes = startHour * 60 + startMin;
		const endMinutes = endHour * 60 + endMin;

		return now >= startMinutes && now <= endMinutes;
	};

	// Función para verificar si una clase ya pasó
	const isClassPast = (schedule: any) => {
		const dayIndex = schedule.dayOfWeek - 1; // Convertir a índice 0-based
		if (!isToday(dayIndex)) return false;

		const now = currentTime.getHours() * 60 + currentTime.getMinutes();
		const [endHour, endMin] = schedule.endTime.split(':').map(Number);
		const endMinutes = endHour * 60 + endMin;

		return now > endMinutes;
	};

	// Función para verificar si una clase es próxima (dentro de 30 minutos)
	const isClassUpcoming = (schedule: any) => {
		const dayIndex = schedule.dayOfWeek - 1; // Convertir a índice 0-based
		if (!isToday(dayIndex)) return false;

		const now = currentTime.getHours() * 60 + currentTime.getMinutes();
		const [startHour, startMin] = schedule.startTime.split(':').map(Number);
		const startMinutes = startHour * 60 + startMin;

		return now < startMinutes && startMinutes - now <= 30;
	};

	// Encontrar clase actual en progreso
	$: currentClass = $currentSchedules.find((schedule) => isClassInProgress(schedule));

	// Obtener próxima clase
	$: nextClass = (() => {
		const now = currentTime;
		const currentDay = now.getDay();
		const currentTime_ = now.toTimeString().slice(0, 5);

		// Buscar en el día actual
		let daySchedules = $currentSchedules.filter((s) => s.dayOfWeek === currentDay);
		let upcoming = daySchedules.find((s) => s.startTime > currentTime_);

		if (upcoming) {
			return { schedule: upcoming, subject: getSubjectById(upcoming.subjectId) };
		}

		// Buscar en días siguientes
		for (let i = 1; i <= 7; i++) {
			const nextDay = (currentDay + i) % 7;
			if (nextDay === 0 || nextDay === 6) continue; // Skip weekend

			daySchedules = $currentSchedules.filter((s) => s.dayOfWeek === nextDay);
			if (daySchedules.length > 0) {
                daySchedules.sort((a, b) => a.startTime.localeCompare(b.startTime));
				return {
					schedule: daySchedules[0],
					subject: getSubjectById(daySchedules[0].subjectId),
				};
			}
		}

		return null;
	})();
</script>

<div class="space-y-6">
	<!-- Indicador de tiempo actual -->
	{#if currentDayIndex >= 0 && currentDayIndex < 5}
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
					<span class="text-sm font-medium text-blue-800">
						Hoy es {weekDays[currentDayIndex]?.name} -
						{currentTime.toLocaleTimeString('es-ES', {
							hour: '2-digit',
							minute: '2-digit',
						})}
					</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- Clase actual en progreso -->
	{#if currentClass}
		{@const currentSubject = getSubjectById(currentClass.subjectId)}
		{#if currentSubject}
			<div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
				<h3 class="text-lg font-semibold mb-2 flex items-center">
					<TargetIcon class="inline-block mr-2 w-4 h-4" />
					Clase en progreso
				</h3>
				<div class="flex items-center justify-between">
					<div>
						<h4 class="text-xl font-bold">{currentSubject.name}</h4>
						<p class="text-green-100">
							{currentSubject.code} • {currentClass.classroom}
						</p>
					</div>
					<div class="text-right">
						<div class="text-lg font-semibold">
							{currentClass.startTime} - {currentClass.endTime}
						</div>
						<div class="text-green-200 text-sm">En progreso ahora</div>
					</div>
				</div>
			</div>
		{/if}
		<!-- Próxima clase (solo si no hay clase actual) -->
	{:else if nextClass && nextClass.subject}
		<div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
			<h3 class="text-lg font-semibold mb-2 flex items-center">
				<NextForwardIcon class="inline-block mr-2 w-4 h-4" />
				Próxima clase
			</h3>
			<div class="flex items-center justify-between">
				<div>
					<h4 class="text-xl font-bold">{nextClass.subject.name}</h4>
					<p class="text-blue-100">
						{nextClass.subject.code} • {nextClass.schedule.classroom}
					</p>
				</div>
				<div class="text-right">
					<div class="text-lg font-semibold">{nextClass.schedule.startTime}</div>
					<div class="text-blue-200 text-sm">
						{weekDays.find((d) => d.id === nextClass.schedule.dayOfWeek)?.name}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Grid de días -->
	<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each scheduleByDay as day, dayIndex}
			<div
				class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4 {isToday(
					dayIndex
				)
					? 'ring-2 ring-blue-300 shadow-lg'
					: ''}"
			>
				<!-- Encabezado del día -->
				<div class="flex items-center justify-between mb-4">
					<h3
						class="text-lg font-semibold {isToday(dayIndex)
							? 'text-blue-800'
							: 'text-gray-800'}"
					>
						{day.name}
						{#if isToday(dayIndex)}
							<span class="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full"
								>HOY</span
							>
						{/if}
					</h3>
					<span class="text-sm text-gray-500">{day.schedules.length} clases</span>
				</div>

				<!-- Lista de clases -->
				{#if day.schedules.length > 0}
					<div class="space-y-3">
						{#each day.schedules as schedule}
							{@const subject = getSubjectById(schedule.subjectId)}
							{@const inProgress = isClassInProgress(schedule)}
							{@const isPast = isClassPast(schedule)}
							{@const isUpcoming = isClassUpcoming(schedule)}
							{#if subject}
								<div
									class="rounded-lg p-3 border-l-4 transition-all duration-200 {inProgress
										? 'bg-green-50 border-green-500 shadow-md'
										: isPast
											? 'bg-gray-50 opacity-60'
											: isUpcoming
												? 'bg-orange-50 border-orange-400'
												: 'bg-gray-50'}"
									style="border-left-color: {inProgress
										? '#10B981'
										: isPast
											? '#9CA3AF'
											: isUpcoming
												? '#F59E0B'
												: subject.color}"
								>
									<div class="flex items-center justify-between mb-1">
										<h4
											class="font-medium text-sm flex items-center {inProgress
												? 'text-green-900'
												: isPast
													? 'text-gray-600'
													: 'text-gray-900'}"
										>
											{subject.name}
											{#if inProgress}
												<span class="ml-1 text-xs">
													<TargetIcon
														class="inline-block w-4 h-4 text-green-600"
													/>
												</span>
											{:else if isUpcoming}
												<NextForwardIcon
													class="inline-block w-4 h-4 text-orange-600"
												/>
											{:else if isPast}
												<CheckIcon
													class="inline-block w-4 h-4 text-gray-600"
												/>
											{/if}
										</h4>
										<span
											class="text-xs {inProgress
												? 'text-green-600 font-semibold'
												: isPast
													? 'text-gray-400'
													: 'text-gray-500'}"
										>
											{schedule.startTime}
										</span>
									</div>
									<div
										class="flex items-center space-x-2 text-xs {inProgress
											? 'text-green-700'
											: isPast
												? 'text-gray-500'
												: 'text-gray-600'}"
									>
										{#if schedule.type === 'class'}
											<BookIcon class="inline-block w-4 h-4" />
										{:else if schedule.type === 'lab'}
											<LabIcon class="inline-block w-4 h-4" />
										{:else if schedule.type === 'tutorial'}
											<IdeaIcon class="inline-block w-4 h-4" />
										{:else}
											<TutorialIcon class="inline-block w-4 h-4" />
										{/if}
										{#if schedule.classroom}
											<span>•</span>
											<span>{schedule.classroom}</span>
										{/if}
									</div>
								</div>
							{/if}
						{/each}
					</div>
				{:else}
					<div class="text-center py-8 text-gray-500">
						<span class="text-2xl">😴</span>
						<p class="text-sm mt-2">Sin clases</p>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Leyenda -->
	<div class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
		<h4 class="text-sm font-medium text-gray-700 mb-3">Leyenda de estados:</h4>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
			<div class="flex items-center space-x-2">
				<span class="text-sm">
					<TargetIcon class="inline-block w-4 h-4 text-green-600" />
				</span>
				<span class="text-gray-600">En progreso</span>
			</div>
			<div class="flex items-center space-x-2">
				<NextForwardIcon class="inline-block w-4 h-4 text-orange-600" />
				<span class="text-gray-600">Próxima (30 min)</span>
			</div>
			<div class="flex items-center space-x-2">
				<CheckIcon class="inline-block w-4 h-4 text-gray-600" />
				<span class="text-gray-600">Finalizada</span>
			</div>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-blue-500 rounded-full"></div>
				<span class="text-gray-600">Día actual</span>
			</div>
		</div>
	</div>

	<!-- Resumen de materias -->
	<div class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
		<h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
			<BooksIcon class="inline-block mr-2 w-4 h-4" />
			Materias del semestre
		</h3>
		<div class="grid md:grid-cols-2 gap-4">
			{#each $currentSubjects as subject}
				<div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
					<div
						class="w-4 h-4 rounded-full"
						style="background-color: {subject.color}"
					></div>
					<div class="flex-1">
						<h4 class="font-medium text-gray-900 text-sm">{subject.name}</h4>
						<p class="text-xs text-gray-600">
							{subject.code} • {subject.credits} créditos
						</p>
					</div>
					<span class="text-xs text-gray-500">
						{$currentSchedules.filter((s) => s.subjectId === subject.id).length} clases/sem
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>
