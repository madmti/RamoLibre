<script lang="ts">
	import { onMount } from 'svelte';
	import { currentSchedules } from '$lib/stores/schedule';
	import { currentSubjects } from '$lib/stores/subject';
	import type { Schedule, Subject } from '@ramo-libre/shared';
	
	let currentTime = new Date();
	let timeInterval: ReturnType<typeof setInterval>;

	// Días de la semana
	const weekDays = [
		{ id: 1, name: 'Lunes', short: 'Lun' },
		{ id: 2, name: 'Martes', short: 'Mar' },
		{ id: 3, name: 'Miércoles', short: 'Mié' },
		{ id: 4, name: 'Jueves', short: 'Jue' },
		{ id: 5, name: 'Viernes', short: 'Vie' },
		{ id: 6, name: 'Sábado', short: 'Sáb' }
	];

	// Slots de tiempo predefinidos
	const timeSlots = [
		'08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
		'11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
		'14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
		'17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
		'20:00', '20:30', '21:00'
	];

	onMount(() => {
		// Actualizar la hora cada minuto
		timeInterval = setInterval(() => {
			currentTime = new Date();
		}, 60000);

		return () => {
			if (timeInterval) clearInterval(timeInterval);
		};
	});

	// Función para obtener datos de materia por ID
	const getSubjectById = (subjectId: string): Subject | undefined => {
		return $currentSubjects.find(subject => subject.id === subjectId);
	};

	// Obtener la hora actual en formato HH:MM
	$: currentTimeString = currentTime.toTimeString().slice(0, 5);
	
	// Obtener el día actual (1 = Lunes, 2 = Martes, etc.)
	$: currentDayOfWeek = (() => {
		const day = currentTime.getDay();
		return day === 0 ? 7 : day; // Convertir domingo (0) a 7
	})();

	// Verificar si es un día de la semana laboral
	$: isWorkDay = currentDayOfWeek >= 1 && currentDayOfWeek <= 6;

	// Encontrar la clase actual
	$: currentClass = (() => {
		if (!isWorkDay) return null;
		
		return $currentSchedules.find(schedule => {
			if (schedule.dayOfWeek !== currentDayOfWeek) return false;
			
			const startTime = schedule.startTime;
			const endTime = schedule.endTime;
			
			return currentTimeString >= startTime && currentTimeString < endTime;
		});
	})();

	// Calcular la posición de la línea de tiempo actual
	$: currentTimePosition = (() => {
		if (!isWorkDay) return null;
		
		// Encontrar el slot de tiempo más cercano
		const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
		
		for (let i = 0; i < timeSlots.length; i++) {
			const slotTime = timeSlots[i];
			const [hours, minutes] = slotTime.split(':').map(Number);
			const slotMinutes = hours * 60 + minutes;
			
			// Si estamos dentro del rango de horarios de clase
			if (currentMinutes >= slotMinutes && (i === timeSlots.length - 1 || currentMinutes < (parseInt(timeSlots[i + 1].split(':')[0]) * 60 + parseInt(timeSlots[i + 1].split(':')[1])))) {
				// Calcular la posición exacta dentro del slot
				const nextSlotMinutes = i < timeSlots.length - 1 
					? parseInt(timeSlots[i + 1].split(':')[0]) * 60 + parseInt(timeSlots[i + 1].split(':')[1])
					: slotMinutes + 30;
				
				const progressInSlot = (currentMinutes - slotMinutes) / (nextSlotMinutes - slotMinutes);
				
				return {
					slotIndex: i,
					progress: Math.min(Math.max(progressInSlot, 0), 1)
				};
			}
		}
		
		return null;
	})();

	// Crear una matriz para organizar las clases
	$: scheduleGrid = (() => {
		const grid: { [time: string]: { [dayId: string]: any } } = {};
		
		// Inicializar la grid
		timeSlots.forEach(time => {
			grid[time] = {};
			weekDays.forEach(day => {
				grid[time][day.id] = null;
			});
		});
		
		// Función para encontrar el slot más cercano
		const findClosestSlot = (time: string) => {
			const [hours, minutes] = time.split(':').map(Number);
			const timeMinutes = hours * 60 + minutes;
			
			// Buscar el slot exacto primero
			if (timeSlots.includes(time)) {
				return time;
			}
			
			// Si no hay coincidencia exacta, buscar el slot más cercano hacia atrás
			for (let i = timeSlots.length - 1; i >= 0; i--) {
				const [slotHours, slotMinutes] = timeSlots[i].split(':').map(Number);
				const slotTimeMinutes = slotHours * 60 + slotMinutes;
				
				if (timeMinutes >= slotTimeMinutes) {
					return timeSlots[i];
				}
			}
			
			// Si no encuentra nada, usar el primer slot
			return timeSlots[0];
		};
		
		// Llenar la grid con las clases
		$currentSchedules.forEach(schedule => {
			const subject = getSubjectById(schedule.subjectId);
			if (subject) {
				const closestSlot = findClosestSlot(schedule.startTime);
				if (!grid[closestSlot][schedule.dayOfWeek]) {
					grid[closestSlot][schedule.dayOfWeek] = {
						schedule,
						subject
					};
				}
			}
		});
		
		return grid;
	})();

	// Función para obtener el ícono del tipo de clase
	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'class': return '📚';
			case 'lab': return '🔬';
			case 'tutorial': return '👥';
			default: return '📖';
		}
	};

	// Función para calcular la duración en slots
	const getDurationSlots = (startTime: string, endTime: string) => {
		// Calcular duración en minutos
		const [startHours, startMinutes] = startTime.split(':').map(Number);
		const [endHours, endMinutes] = endTime.split(':').map(Number);
		
		const startTotalMinutes = startHours * 60 + startMinutes;
		const endTotalMinutes = endHours * 60 + endMinutes;
		const durationMinutes = endTotalMinutes - startTotalMinutes;
		
		// Convertir a slots (cada slot es de 30 minutos)
		const slots = Math.ceil(durationMinutes / 30);
		return Math.max(slots, 1); // Mínimo 1 slot
	};

	// Estado para el día seleccionado en vista móvil
	let selectedDayIndex = 0;
	
	// Inicializar con el día actual si es un día laboral
	$: if (isWorkDay && currentDayOfWeek >= 1 && currentDayOfWeek <= 6) {
		selectedDayIndex = currentDayOfWeek - 1; // Convertir a índice (0-5)
	}
	
	// Día actualmente seleccionado en vista móvil
	$: selectedDay = weekDays[selectedDayIndex];
	
	// Funciones de navegación móvil
	const goToPreviousDay = () => {
		selectedDayIndex = selectedDayIndex > 0 ? selectedDayIndex - 1 : weekDays.length - 1;
	};
	
	const goToNextDay = () => {
		selectedDayIndex = selectedDayIndex < weekDays.length - 1 ? selectedDayIndex + 1 : 0;
	};
</script>

<!-- Indicador de clase actual (si hay una en progreso) -->
{#if currentClass && isWorkDay}
	{@const currentSubject = getSubjectById(currentClass.subjectId)}
	{#if currentSubject}
		<div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 mb-4 text-white">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-3">
					<span class="text-2xl">🟢</span>
					<div>
						<h3 class="font-bold">Clase en progreso</h3>
						<p class="text-green-100">{currentSubject.name} • {currentClass.classroom}</p>
					</div>
				</div>
				<div class="text-right">
					<div class="text-lg font-semibold">{currentTimeString}</div>
					<div class="text-green-200 text-sm">Hasta {currentClass.endTime}</div>
				</div>
			</div>
		</div>
	{/if}
{/if}

<!-- Navegación de días (solo móvil) -->
<div class="block lg:hidden mb-4">
	<div class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
		<div class="flex items-center justify-between">
			<button 
				on:click={goToPreviousDay}
				class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
			>
				<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
				</svg>
			</button>
			
			<div class="text-center">
				<h3 class="text-lg font-bold {currentDayOfWeek === selectedDay.id && isWorkDay ? 'text-blue-600' : 'text-gray-800'}">
					{selectedDay.name}
					{#if currentDayOfWeek === selectedDay.id && isWorkDay}
						<span class="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">HOY</span>
					{/if}
				</h3>
				<p class="text-sm text-gray-500">{selectedDay.short}</p>
			</div>
			
			<button 
				on:click={goToNextDay}
				class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
			>
				<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
				</svg>
			</button>
		</div>
		
		<!-- Indicadores de días -->
		<div class="flex justify-center mt-3 space-x-2">
			{#each weekDays as day, index}
				<button
					on:click={() => selectedDayIndex = index}
					class="w-2 h-2 rounded-full transition-colors {index === selectedDayIndex ? 'bg-blue-600' : 'bg-gray-300'}"
				></button>
			{/each}
		</div>
	</div>
</div>

<div class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 overflow-hidden relative">
	<div class="overflow-x-auto lg:overflow-x-visible">
		<table class="w-full lg:min-w-[800px]">
			<!-- Encabezado -->
			<thead>
				<tr class="bg-blue-50 border-b border-blue-100">
					<th class="w-12 lg:w-20 p-1 lg:p-3 text-left text-xs lg:text-sm font-semibold text-blue-800">Hora</th>
					<!-- Vista móvil: solo día seleccionado -->
					<th class="block lg:hidden p-2 lg:p-3 text-center text-sm font-semibold text-blue-800 {currentDayOfWeek === selectedDay.id && isWorkDay ? 'bg-blue-100' : ''}">
						<div>{selectedDay.name}</div>
						<div class="text-xs font-normal text-blue-600">{selectedDay.short}</div>
						{#if currentDayOfWeek === selectedDay.id && isWorkDay}
							<div class="text-xs font-medium text-blue-700 mt-1">Hoy</div>
						{/if}
					</th>
					<!-- Vista desktop: todos los días -->
					{#each weekDays as day}
						<th class="hidden lg:table-cell p-3 text-center text-sm font-semibold text-blue-800 {currentDayOfWeek === day.id && isWorkDay ? 'bg-blue-100' : ''}">
							<div>{day.name}</div>
							<div class="text-xs font-normal text-blue-600">{day.short}</div>
							{#if currentDayOfWeek === day.id && isWorkDay}
								<div class="text-xs font-medium text-blue-700 mt-1">Hoy</div>
							{/if}
						</th>
					{/each}
				</tr>
			</thead>
			
			<!-- Cuerpo de la tabla -->
			<tbody class="relative">
				{#each timeSlots as time, timeIndex}
                {@const classData = scheduleGrid[time][selectedDay.id]}
					<tr class="border-b border-gray-100 hover:bg-gray-50/50 relative">
						<!-- Columna de hora -->
						<td class="w-12 lg:w-20 p-0.5 lg:p-2 text-xs lg:text-sm text-gray-600 font-medium bg-gray-50/50 text-center {currentTimePosition && currentTimePosition.slotIndex === timeIndex && isWorkDay ? 'bg-red-100 text-red-700' : ''}">
							<div class="leading-tight">
								{time}
								{#if currentTimePosition && currentTimePosition.slotIndex === timeIndex && isWorkDay}
									<div class="text-xs text-red-500 font-bold">AHORA</div>
								{/if}
							</div>
						</td>
						
						<!-- Vista móvil: solo día seleccionado -->
						<td class="block lg:hidden p-1 relative h-12 lg:h-16 {currentDayOfWeek === selectedDay.id && isWorkDay ? 'bg-blue-50/30' : ''}">
							{#if classData}
								{@const { schedule, subject } = classData}
								{@const isCurrentClass = currentClass && currentClass.id === schedule.id}
								<div 
									class="absolute inset-1 rounded-lg p-1 lg:p-2 text-xs text-white font-medium overflow-hidden {isCurrentClass ? 'ring-2 ring-green-400 ring-offset-1' : ''}"
									style="background-color: {subject.color}; height: {getDurationSlots(schedule.startTime, schedule.endTime) * 3}rem;"
								>
									<div class="flex items-center justify-between mb-1/2">
										<div class="flex items-center space-x-1 min-w-0 flex-1">
											<span class="text-sm flex-shrink-0">{getTypeIcon(schedule.type)}</span>
											<span class="truncate font-semibold text-sm">{subject.name}</span>
										</div>
										{#if isCurrentClass}
											<span class="text-sm flex-shrink-0">🔴</span>
										{/if}
									</div>
									<!-- Lugar y horas en una fila para móvil -->
									<div class="flex items-center justify-between text-sm opacity-90">
										<span class="truncate">{schedule.classroom || 'Sin aula'}</span>
										<span class="flex-shrink-0 ml-2">{schedule.startTime}-{schedule.endTime}</span>
									</div>
								</div>
							{/if}
						</td>
						
						<!-- Vista desktop: todas las columnas de días -->
						{#each weekDays as day}
                        {@const classData = scheduleGrid[time][day.id]}
							<td class="hidden lg:table-cell p-1 relative h-16 border-r border-gray-100 {currentDayOfWeek === day.id && isWorkDay ? 'bg-blue-50/30' : ''}">
								{#if classData}
									{@const { schedule, subject } = classData}
									{@const isCurrentClass = currentClass && currentClass.id === schedule.id}
									<div 
										class="absolute inset-1 rounded-lg p-2 text-xs text-white font-medium overflow-hidden {isCurrentClass ? 'ring-2 ring-green-400 ring-offset-1' : ''}"
										style="background-color: {subject.color}; height: {getDurationSlots(schedule.startTime, schedule.endTime) * 4}rem;"
									>
										<div class="flex items-center space-x-1 mb-1">
											<span>{getTypeIcon(schedule.type)}</span>
											<span class="truncate font-semibold">{subject.name}</span>
											{#if isCurrentClass}
												<span class="text-xs">🔴</span>
											{/if}
										</div>
										<div class="text-xs opacity-90 truncate">{schedule.classroom}</div>
										<div class="text-xs opacity-75">{schedule.startTime}-{schedule.endTime}</div>
									</div>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- Leyenda y explicación -->
<div class="mt-4 space-y-4">
	<!-- Leyenda de materias -->
	<div>
		<h4 class="text-sm font-medium text-gray-700 mb-2">📚 Materias</h4>
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
			{#each $currentSubjects as subject}
				<div class="flex items-center space-x-2 text-sm">
					<div 
						class="w-3 h-3 rounded-full" 
						style="background-color: {subject.color}"
					></div>
					<span class="text-gray-700">{subject.code}</span>
					<span class="text-gray-500 truncate">{subject.name}</span>
				</div>
			{/each}
		</div>
	</div>
	
	<!-- Indicadores de tiempo -->
	<div>
		<h4 class="text-sm font-medium text-gray-700 mb-2">🕐 Indicadores</h4>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-green-500 rounded border-2 border-green-400"></div>
				<span class="text-gray-600">Clase en progreso</span>
			</div>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-blue-100 rounded"></div>
				<span class="text-gray-600">Día actual</span>
			</div>
		</div>
	</div>
	
	<!-- Información adicional -->
	{#if isWorkDay}
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
			<div class="flex items-center space-x-2 text-blue-700 text-sm">
				<span>ℹ️</span>
				<span>
					Hora actual: {currentTimeString}. 
					{#if currentClass}
						Actualmente tienes clase en progreso.
					{:else}
						No tienes clases en este momento.
					{/if}
				</span>
			</div>
		</div>
	{:else}
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
			<div class="flex items-center space-x-2 text-gray-600 text-sm">
				<span>🏖️</span>
				<span>Es fin de semana. Los indicadores de tiempo solo se muestran en días laborales.</span>
			</div>
		</div>
	{/if}
</div>
