<script lang="ts">
	import { onMount } from 'svelte';
	import { currentSchedules } from '$lib/stores/schedule';
	import { currentSubjects } from '$lib/stores/subject';
	import type { Schedule, Subject } from '@ramo-libre/shared';
	
	let currentTime = new Date();

	// Días de la semana
	const weekDays = [
		{ id: 1, name: 'Lunes', short: 'Lun' },
		{ id: 2, name: 'Martes', short: 'Mar' },
		{ id: 3, name: 'Miércoles', short: 'Mié' },
		{ id: 4, name: 'Jueves', short: 'Jue' },
		{ id: 5, name: 'Viernes', short: 'Vie' },
		{ id: 6, name: 'Sábado', short: 'Sáb' }
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

	// Generar horarios para cada día
	$: scheduleByDay = weekDays.map(day => ({
		...day,
		schedules: $currentSchedules
			.filter(schedule => schedule.dayOfWeek === day.id)
			.sort((a, b) => a.startTime.localeCompare(b.startTime))
	}));

	// Función para obtener datos de materia por ID
	const getSubjectById = (subjectId: string): Subject | undefined => {
		return $currentSubjects.find(subject => subject.id === subjectId);
	};

	// Función para obtener el ícono del tipo de clase
	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'class': return '📚';
			case 'lab': return '🧪';
			case 'tutorial': return '�';
			default: return '📖';
		}
	};

	// Obtener el día actual (0 = domingo, 1 = lunes, etc.)
	$: today = currentTime.getDay();
	
	// Convertir día de JS (0=domingo) a nuestro formato (1=lunes)
	$: currentDayIndex = today === 0 ? 7 : today;

	// Función para verificar si es el día actual
	const isToday = (dayIndex: number) => dayIndex === currentDayIndex;

	// Función para verificar si una clase está en progreso
	const isClassInProgress = (schedule: Schedule, dayIndex: number) => {
		if (!isToday(dayIndex)) return false;
		
		const now = currentTime.getHours() * 60 + currentTime.getMinutes();
		const [startHour, startMin] = schedule.startTime.split(':').map(Number);
		const [endHour, endMin] = schedule.endTime.split(':').map(Number);
		const startMinutes = startHour * 60 + startMin;
		const endMinutes = endHour * 60 + endMin;
		
		return now >= startMinutes && now <= endMinutes;
	};

	// Función para verificar si una clase ya pasó
	const isClassPast = (schedule: any, dayIndex: number) => {
		if (!isToday(dayIndex)) return false;
		
		const now = currentTime.getHours() * 60 + currentTime.getMinutes();
		const [endHour, endMin] = schedule.endTime.split(':').map(Number);
		const endMinutes = endHour * 60 + endMin;
		
		return now > endMinutes;
	};

	// Función para verificar si una clase es próxima (dentro de 30 minutos)
	const isClassUpcoming = (schedule: any, dayIndex: number) => {
		if (!isToday(dayIndex)) return false;
		
		const now = currentTime.getHours() * 60 + currentTime.getMinutes();
		const [startHour, startMin] = schedule.startTime.split(':').map(Number);
		const startMinutes = startHour * 60 + startMin;
		
		return now < startMinutes && (startMinutes - now) <= 30;
	};
</script>

<div class="space-y-6">
	<!-- Indicador de tiempo actual -->
	{#if currentDayIndex >= 0 && currentDayIndex < 7}
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
					<span class="text-sm font-medium text-blue-800">
						Hoy es {weekDays[currentDayIndex - 1]?.name} - 
						{currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
					</span>
				</div>
			</div>
		</div>
	{/if}

	{#each scheduleByDay as day, dayIndex}
		{#if day.schedules.length > 0}
			<div class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 overflow-hidden {isToday(dayIndex) ? 'ring-2 ring-blue-300 shadow-lg' : ''}">
				<!-- Encabezado del día -->
				<div class="px-6 py-4 border-b {isToday(dayIndex) ? 'bg-blue-100 border-blue-200' : 'bg-blue-50 border-blue-100'}">
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold {isToday(dayIndex) ? 'text-blue-900' : 'text-blue-800'}">
							{day.name}
							{#if isToday(dayIndex)}
								<span class="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">HOY</span>
							{/if}
						</h3>
						{#if isToday(dayIndex)}
							<div class="text-sm text-blue-700 font-medium">
								{currentTime.toLocaleDateString('es-ES', { 
									day: 'numeric', 
									month: 'long' 
								})}
							</div>
						{/if}
					</div>
				</div>
				
				<!-- Lista de clases del día -->
				<div class="divide-y divide-gray-100">
					{#each day.schedules as schedule}
						{@const subject = getSubjectById(schedule.subjectId)}
						{@const start = new Date(`2000-01-01T${schedule.startTime}`)}
						{@const end = new Date(`2000-01-01T${schedule.endTime}`)}
						{@const duration = Math.round(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 10) / 10}
						{@const inProgress = isClassInProgress(schedule, dayIndex)}
						{@const isPast = isClassPast(schedule, dayIndex)}
						{@const isUpcoming = isClassUpcoming(schedule, dayIndex)}
						{#if subject}
							<div class="p-3 sm:p-4 transition-all duration-200 relative {
								inProgress 
									? 'bg-green-50 border-l-4 border-green-500 shadow-md' 
									: isPast 
										? 'bg-gray-50 opacity-60' 
										: isUpcoming 
											? 'bg-orange-50 border-l-4 border-orange-400' 
											: 'hover:bg-gray-50'
							}">
								<!-- Estado badge - responsivo -->
								{#if inProgress}
									<div class="absolute top-2 right-2">
										<span class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
											<div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
											<span class="hidden sm:inline">En progreso</span>
											<span class="sm:hidden">●</span>
										</span>
									</div>
								{:else if isUpcoming}
									<div class="absolute top-2 right-2">
										<span class="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
											<div class="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1"></div>
											<span class="hidden sm:inline">Próxima</span>
											<span class="sm:hidden">!</span>
										</span>
									</div>
								{:else if isPast}
									<div class="absolute top-2 right-2">
										<span class="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full">
											<span class="hidden sm:inline">✓ Finalizada</span>
											<span class="sm:hidden">✓</span>
										</span>
									</div>
								{/if}

								<!-- Layout móvil: vertical -->
								<div class="flex flex-col space-y-2 sm:hidden">
									<!-- Horario y duración -->
									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-2">
											<div class="text-sm font-medium {inProgress ? 'text-green-800' : isPast ? 'text-gray-500' : 'text-gray-900'}">
												{schedule.startTime}
											</div>
											<span class="text-xs {inProgress ? 'text-green-600' : isPast ? 'text-gray-400' : 'text-gray-500'}">
												- {schedule.endTime}
											</span>
										</div>
										<div class="text-xs {inProgress ? 'text-green-600 font-medium' : isPast ? 'text-gray-400' : 'text-gray-500'}">
											{duration}h
										</div>
									</div>
									
									<!-- Materia -->
									<div class="flex items-center space-x-2">
										<div 
											class="w-3 h-3 rounded-full flex-shrink-0 {inProgress ? 'ring-2 ring-green-300' : ''}" 
											style="background-color: {subject.color}"
										></div>
										<h4 class="font-medium text-sm {inProgress ? 'text-green-900' : isPast ? 'text-gray-600' : 'text-gray-900'} truncate">
											{subject.name}
										</h4>
									</div>
									
									<!-- Código y tipo -->
									<div class="flex flex-wrap items-center gap-2 text-xs {inProgress ? 'text-green-700' : isPast ? 'text-gray-500' : 'text-gray-600'}">
										<span class="px-2 py-1 rounded {
											inProgress ? 'bg-green-200 text-green-800' : 
											isPast ? 'bg-gray-200 text-gray-600' : 
											'bg-gray-100 text-gray-600'
										}">
											{subject.code}
										</span>
										<span class="flex items-center space-x-1">
											<span>{getTypeIcon(schedule.type)}</span>
											<span class="capitalize">{schedule.type}</span>
										</span>
									</div>
									
									<!-- Detalles adicionales -->
									<div class="flex flex-wrap items-center gap-2 text-xs {inProgress ? 'text-green-700' : isPast ? 'text-gray-500' : 'text-gray-600'}">
										{#if schedule.classroom}
											<span class="flex items-center space-x-1">
												<span>📍</span>
												<span class="truncate max-w-[120px]">{schedule.classroom}</span>
											</span>
										{/if}
										{#if subject.professor}
											<span class="flex items-center space-x-1">
												<span>👨‍🏫</span>
												<span class="truncate max-w-[100px]">{subject.professor}</span>
											</span>
										{/if}
									</div>
								</div>

								<!-- Layout desktop: horizontal -->
								<div class="hidden sm:flex sm:items-center sm:space-x-4">
									<!-- Horario -->
									<div class="text-center min-w-[80px]">
										<div class="text-sm font-medium {inProgress ? 'text-green-800' : isPast ? 'text-gray-500' : 'text-gray-900'}">
											{schedule.startTime}
										</div>
										<div class="text-xs {inProgress ? 'text-green-600' : isPast ? 'text-gray-400' : 'text-gray-500'}">
											{schedule.endTime}
										</div>
									</div>
									
									<!-- Información de la materia -->
									<div class="flex-1">
										<div class="flex items-center space-x-2 mb-1">
											<div 
												class="w-3 h-3 rounded-full {inProgress ? 'ring-2 ring-green-300' : ''}" 
												style="background-color: {subject.color}"
											></div>
											<h4 class="font-medium {inProgress ? 'text-green-900' : isPast ? 'text-gray-600' : 'text-gray-900'}">
												{subject.name}
											</h4>
											<span class="text-xs px-2 py-1 rounded {
												inProgress ? 'bg-green-200 text-green-800' : 
												isPast ? 'bg-gray-200 text-gray-600' : 
												'bg-gray-100 text-gray-600'
											}">
												{subject.code}
											</span>
										</div>
										<div class="flex items-center space-x-4 text-sm {
											inProgress ? 'text-green-700' : 
											isPast ? 'text-gray-500' : 
											'text-gray-600'
										}">
											<span class="flex items-center space-x-1">
												<span>{getTypeIcon(schedule.type)}</span>
												<span class="capitalize">{schedule.type}</span>
											</span>
											{#if schedule.classroom}
												<span class="flex items-center space-x-1">
													<span>📍</span>
													<span>{schedule.classroom}</span>
												</span>
											{/if}
											{#if subject.professor}
												<span class="flex items-center space-x-1">
													<span>👨‍🏫</span>
													<span>{subject.professor}</span>
												</span>
											{/if}
										</div>
									</div>
									
									<!-- Duración -->
									<div class="text-right text-sm {
										inProgress ? 'text-green-600 font-medium' : 
										isPast ? 'text-gray-400' : 
										'text-gray-500'
									}">
										{duration}h
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	{/each}

	<!-- Leyenda -->
	<div class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 p-3 sm:p-4">
		<h4 class="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Leyenda de estados:</h4>
		<div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs">
			<div class="flex items-center space-x-1 sm:space-x-2">
				<div class="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
				<span class="text-gray-600 text-xs">En progreso</span>
			</div>
			<div class="flex items-center space-x-1 sm:space-x-2">
				<div class="w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full flex-shrink-0"></div>
				<span class="text-gray-600 text-xs">Próxima</span>
			</div>
			<div class="flex items-center space-x-1 sm:space-x-2">
				<div class="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full flex-shrink-0"></div>
				<span class="text-gray-600 text-xs">Finalizada</span>
			</div>
			<div class="flex items-center space-x-1 sm:space-x-2">
				<div class="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
				<span class="text-gray-600 text-xs">Día actual</span>
			</div>
		</div>
	</div>
</div>
