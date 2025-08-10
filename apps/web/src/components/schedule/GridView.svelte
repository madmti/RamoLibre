<script lang="ts">
	import { onMount } from 'svelte';
	import { currentSchedules } from '$lib/stores/schedule';
	import { currentSubjects } from '$lib/stores/subject';
	import type { Subject } from '@ramo-libre/shared';

	// ICONOS
	import InfoIcon from '$embedded-icons/info.svg?component';
	import ClockIcon from '$embedded-icons/clock.svg?component';
	import BooksIcon from '$embedded-icons/books.svg?component';
	import BookIcon from '$embedded-icons/book.svg?component';
	import LabIcon from '$embedded-icons/lab.svg?component';
	import TutorialIcon from '$embedded-icons/tutorial.svg?component';
	import IdeaIcon from '$embedded-icons/idea.svg?component';
	import TargetIcon from '$embedded-icons/target.svg?component';

	let now = new Date();
	let tick: ReturnType<typeof setInterval>;

	// Días de la semana (1-6)
	const weekDays = [
		{ id: 1, name: 'Lunes', short: 'Lun' },
		{ id: 2, name: 'Martes', short: 'Mar' },
		{ id: 3, name: 'Miércoles', short: 'Mié' },
		{ id: 4, name: 'Jueves', short: 'Jue' },
		{ id: 5, name: 'Viernes', short: 'Vie' },
		{ id: 6, name: 'Sábado', short: 'Sáb' }
	];

	// Rango horario mostrado (inclusive-inicio, exclusivo-fin)
	const rangeHours: [number, number] = [8, 21];

	// Escala
	const PX_PER_MINUTE = 2; // 2px/min → 30min = 60px, 13h ≈ 1560px
	const TIME_GUTTER_PX = 64; // ancho columna de horas
	const BOTTOM_PADDING_PX = 28; // espacio extra al final para que 21:00 no se corte

	// Layout horizontal dentro de cada columna de día
	const COL_INSET_PCT = 2; // margen interno a ambos lados (0 para ocupar ancho completo)
	const LANE_GAP_PCT = 2; // separación entre eventos solapados

	// Slots cada 30 minutos para líneas guía y etiquetas
	let timeSlots: { label: string; h: number; m: number }[] = [];
	for (let h = rangeHours[0]; h <= rangeHours[1]; h++) {
		for (let m = 0; m < 60; m += 30) {
			if (h === rangeHours[1] && m > 0) break;
			const hh = String(h).padStart(2, '0');
			const mm = String(m).padStart(2, '0');
			timeSlots.push({ label: `${hh}:${mm}`, h, m });
		}
	}

	const toMinutes = (t: string) => {
		const [hh, mm] = t.split(':').map(Number);
		return hh * 60 + mm;
	};
	const minutesFromStart = (t: string) =>
		Math.max(0, toMinutes(t) - rangeHours[0] * 60);
	const yFromTime = (t: string) => minutesFromStart(t) * PX_PER_MINUTE;
	const clampY = (y: number) => Math.max(0, Math.min(y, boardHeight));

	// Altura total del lienzo
	const totalMinutes = (rangeHours[1] - rangeHours[0]) * 60;
	const boardHeight = totalMinutes * PX_PER_MINUTE + BOTTOM_PADDING_PX;

	onMount(() => {
		tick = setInterval(() => (now = new Date()), 60_000);
		return () => clearInterval(tick);
	});

	const getSubjectById = (id: string): Subject | undefined =>
		$currentSubjects.find((s) => s.id === id);

	$: nowStr = now.toTimeString().slice(0, 5);
	$: dow = (() => {
		const d = now.getDay();
		return d === 0 ? 7 : d; // domingo → 7
	})();
	$: isWorkDay = dow >= 1 && dow <= 6;

	// Clase en progreso (si aplica)
	$: currentClass = (() => {
		if (!isWorkDay) return null;
		return $currentSchedules.find((s) => s.dayOfWeek === dow && nowStr >= s.startTime && nowStr < s.endTime) || null;
	})();
	$: currentTimeY = clampY(minutesFromStart(nowStr) * PX_PER_MINUTE);
	$: showNowLine = isWorkDay && toMinutes(nowStr) >= rangeHours[0] * 60 && toMinutes(nowStr) <= rangeHours[1] * 60;

	// Estado de vista móvil: un día a la vez con navegación
	let selectedDayIndex = 0;
	$: if (isWorkDay) {
		selectedDayIndex = Math.min(Math.max(dow - 1, 0), weekDays.length - 1);
	}
	$: selectedDay = weekDays[selectedDayIndex];
	const prevDay = () => (selectedDayIndex = (selectedDayIndex - 1 + weekDays.length) % weekDays.length);
	const nextDay = () => (selectedDayIndex = (selectedDayIndex + 1) % weekDays.length);

	// Agrupar por día
	type EventItem = { schedule: any; subject: Subject; start: number; end: number };
	$: eventsByDay = (() => {
		const map: Record<number, EventItem[]> = {};
		for (const d of weekDays) map[d.id] = [];
		for (const s of $currentSchedules) {
			const subj = getSubjectById(s.subjectId);
			if (!subj) continue;
			const start = toMinutes(s.startTime);
			const end = toMinutes(s.endTime);
			// Filtrar fuera de rango total del lienzo
			if (end <= rangeHours[0] * 60 || start >= rangeHours[1] * 60) continue;
			map[s.dayOfWeek]?.push({ schedule: s, subject: subj, start, end });
		}
		// Ordenar por inicio
		for (const d of weekDays) map[d.id].sort((a, b) => a.start - b.start || a.end - b.end);
		return map;
	})();

	// Asignar "lanes" para eventos solapados en cada día
	type LaidEvent = EventItem & { lane: number; lanesCount: number };
	function layoutDay(events: EventItem[]): LaidEvent[] {
		const result: LaidEvent[] = [];
		let active: Map<number, LaidEvent> = new Map(); // lane -> event
		let group: LaidEvent[] = [];
		let maxLanes = 0;

		const flushGroup = () => {
			for (const e of group) e.lanesCount = Math.max(1, maxLanes);
			group = [];
			maxLanes = 0;
		};

		for (const ev of events) {
			// Retirar finalizados
			for (const [lane, act] of [...active]) {
				if (act.end <= ev.start) active.delete(lane);
			}
			if (active.size === 0 && group.length) flushGroup();

			// Buscar lane libre (0..n)
			let lane = 0;
			while (active.has(lane)) lane++;
			const laid: LaidEvent = { ...ev, lane, lanesCount: 1 };
			active.set(lane, laid);
			group.push(laid);
			maxLanes = Math.max(maxLanes, active.size);
			result.push(laid);
		}
		if (group.length) flushGroup();
		return result;
	}

	$: laidByDay = (() => {
		const out: Record<number, LaidEvent[]> = {};
		for (const d of weekDays) out[d.id] = layoutDay(eventsByDay[d.id]);
		return out;
	})();

	// Estilos de posición
	const eventRect = (e: LaidEvent) => {
		const startY = clampY((e.start - rangeHours[0] * 60) * PX_PER_MINUTE);
		const endY = clampY((e.end - rangeHours[0] * 60) * PX_PER_MINUTE);
		const height = Math.max(18, endY - startY);
		const c = Math.max(1, e.lanesCount);
		const widthPct = (100 - COL_INSET_PCT * 2 - LANE_GAP_PCT * (c - 1)) / c;
		const leftPct = COL_INSET_PCT + e.lane * (widthPct + LANE_GAP_PCT);
		return `top:${startY}px;height:${height}px;left:${leftPct}%;width:${widthPct}%;`;
	};
</script>

{#if currentClass && isWorkDay}
	{@const subj = getSubjectById(currentClass.subjectId)}
	{#if subj}
		<div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 mb-4 text-white">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-3">
					<TargetIcon class="w-8 h-8" />
					<div>
						<h3 class="font-bold">Clase en progreso</h3>
						<p class="text-green-100">{subj.name} • {currentClass.classroom}</p>
					</div>
				</div>
				<div class="text-right">
					<div class="text-lg font-semibold">{nowStr}</div>
					<div class="text-green-200 text-sm">Hasta {currentClass.endTime}</div>
				</div>
			</div>
		</div>
	{/if}
{/if}

<div class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/60 overflow-hidden">
	<!-- Encabezado de días -->
	<div class="grid" style={`grid-template-columns:${TIME_GUTTER_PX}px 1fr`}>
		<div class="p-3 text-xs text-gray-500 mt-4">Hora</div>
		<!-- Header móvil: un solo día con navegación -->
		<div class="p-3 lg:hidden">
			<div class="flex items-center justify-between">
				<button class="p-2 rounded hover:bg-gray-100" on:click={prevDay} aria-label="Día anterior">
					<svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
				</button>
				<div class="text-center font-semibold text-sm {isWorkDay && selectedDay.id===dow ? 'text-blue-700' : 'text-gray-800'}">
					<div>{selectedDay.name}</div>
					<div class="text-xs font-normal {isWorkDay && selectedDay.id===dow ? 'text-blue-600' : 'text-gray-500'}">{selectedDay.short}</div>
					{#if isWorkDay && selectedDay.id===dow}
						<div class="text-[10px] mt-0.5 inline-block bg-blue-600 text-white px-2 py-0.5 rounded-full">HOY</div>
					{/if}
				</div>
				<button class="p-2 rounded hover:bg-gray-100" on:click={nextDay} aria-label="Día siguiente">
					<svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
				</button>
			</div>
			<!-- Paginación de días -->
			<div class="mt-3 flex items-center justify-center gap-2">
				{#each weekDays as d, i}
					<button
						class="w-2.5 h-2.5 rounded-full transition-colors {i===selectedDayIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}"
						on:click={() => (selectedDayIndex = i)}
						aria-label={`Ir a ${d.name}`}
					></button>
				{/each}
			</div>
		</div>
		<!-- Header desktop: todos los días -->
		<div class="hidden lg:grid grid-cols-6 gap-3 p-3 min-w-[900px]">
			{#each weekDays as d}
				<div class="text-center font-semibold text-sm {isWorkDay && d.id===dow ? 'text-blue-700' : 'text-gray-800'}">
					<div>{d.name}</div>
					<div class="text-xs font-normal {isWorkDay && d.id===dow ? 'text-blue-600' : 'text-gray-500'}">{d.short}</div>
					{#if isWorkDay && d.id===dow}<div class="text-[10px] mt-0.5 inline-block bg-blue-600 text-white px-2 py-0.5 rounded-full">HOY</div>{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Lienzo móvil: un solo día -->
	<div class="grid lg:hidden border-t border-gray-100" style={`grid-template-columns:${TIME_GUTTER_PX}px 1fr`}>
		<!-- Columna de horas -->
		<div class="relative" style={`height:${boardHeight}px`}>
			{#each timeSlots as t}
				{#if t.m === 0}
					<div class="absolute -translate-y-1/2 left-2 text-[14px] text-gray-700 font-semibold" style={`top:${(t.h*60+t.m - rangeHours[0]*60)*PX_PER_MINUTE}px`}>
						{t.label}
					</div>
				{:else}
					<!-- etiqueta de media hora -->
					<div class="absolute -translate-y-1/2 left-2 text-[12px] text-gray-500" style={`top:${(t.h*60+t.m - rangeHours[0]*60)*PX_PER_MINUTE}px`}>
						{t.label}
					</div>
				{/if}
			{/each}
		</div>

		<!-- Área de un día -->
		<div class="relative" style={`height:${boardHeight}px`}>
			<!-- Guías -->
			<div class="pointer-events-none absolute inset-0">
				{#each timeSlots as t}
					<div class="absolute w-full {t.m===0 ? 'border-t border-gray-200' : 'border-t border-dashed border-gray-200/80'}" style={`top:${(t.h*60+t.m - rangeHours[0]*60)*PX_PER_MINUTE}px`}></div>
				{/each}
				{#if showNowLine}
					<div class="absolute w-full border-t-2 border-red-500 z-30" style={`top:${currentTimeY}px`}></div>
				{/if}
			</div>
			<!-- Columna del día seleccionado -->
			<div class="relative h-full border-l border-gray-100 rounded-sm {isWorkDay && selectedDay.id===dow ? 'bg-blue-50/60 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.3)]' : 'bg-white/50'}">
				{#each laidByDay[selectedDay.id] as ev}
					<div class="absolute rounded-lg p-2 text-xs text-white font-medium shadow-sm z-10" style={`background-color:${ev.subject.color};${eventRect(ev)}`}>
						<div class="flex items-center justify-between space-x-1 mb-1">
							<div class="flex items-center space-x-1 min-w-0">
								{#if ev.schedule.type === 'class'}
									<BookIcon class="w-4 h-4" />
								{:else if ev.schedule.type === 'lab'}
									<LabIcon class="w-4 h-4" />
								{:else if ev.schedule.type === 'tutorial'}
									<IdeaIcon class="w-4 h-4" />
								{:else}
									<TutorialIcon class="w-4 h-4" />
								{/if}
								<span class="truncate font-semibold">{ev.subject.name}</span>
							</div>
						</div>
						<div class="text-xs opacity-90 truncate">{ev.schedule.classroom || 'Sin aula'}</div>
						<div class="text-[11px] opacity-90">{ev.schedule.startTime}–{ev.schedule.endTime}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Lienzo semanal desktop -->
	<div class="hidden lg:grid border-t border-gray-100" style={`grid-template-columns:${TIME_GUTTER_PX}px 1fr`}>
		<!-- Columna de horas -->
		<div class="relative" style={`height:${boardHeight}px`}>
			{#each timeSlots as t}
				{#if t.m === 0}
					<div class="absolute -translate-y-1/2 left-2 text-[14px] text-gray-700 font-semibold" style={`top:${(t.h*60+t.m - rangeHours[0]*60)*PX_PER_MINUTE}px`}>
						{t.label}
					</div>
				{:else}
					<div class="absolute -translate-y-1/2 left-2 text-[12px] text-gray-500" style={`top:${(t.h*60+t.m - rangeHours[0]*60)*PX_PER_MINUTE}px`}>
						{t.label}
					</div>
				{/if}
			{/each}
		</div>
		<!-- Área de días -->
		<div class="overflow-x-auto">
			<div class="relative min-w-[900px]" style={`height:${boardHeight}px`}>
				<div class="pointer-events-none absolute inset-0">
					{#each timeSlots as t}
						<div class="absolute w-full {t.m===0 ? 'border-t border-gray-200' : 'border-t border-dashed border-gray-200/80'}" style={`top:${(t.h*60+t.m - rangeHours[0]*60)*PX_PER_MINUTE}px`}></div>
					{/each}
					{#if showNowLine}
						<div class="absolute w-full border-t-2 border-red-500 z-30" style={`top:${currentTimeY}px`}></div>
					{/if}
				</div>
				<div class="grid grid-cols-6 h-full">
					{#each weekDays as d}
						<div class="relative border-l border-gray-100 rounded-sm {isWorkDay && d.id===dow ? 'bg-blue-50/60 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.3)]' : 'bg-white/50'}">
							{#each laidByDay[d.id] as ev}
								<div class="absolute rounded-lg p-2 text-xs text-white font-medium shadow-sm z-10" style={`background-color:${ev.subject.color};${eventRect(ev)}`}>
									<div class="flex items-center justify-between space-x-1 mb-1">
										<div class="flex items-center space-x-1 min-w-0">
											{#if ev.schedule.type === 'class'}
												<BookIcon class="w-4 h-4" />
											{:else if ev.schedule.type === 'lab'}
												<LabIcon class="w-4 h-4" />
											{:else if ev.schedule.type === 'tutorial'}
												<IdeaIcon class="w-4 h-4" />
											{:else}
												<TutorialIcon class="w-4 h-4" />
											{/if}
											<span class="truncate font-semibold">{ev.subject.name}</span>
										</div>
									</div>
									<div class="text-xs opacity-90 truncate">{ev.schedule.classroom || 'Sin aula'}</div>
									<div class="text-[11px] opacity-90">{ev.schedule.startTime}–{ev.schedule.endTime}</div>
								</div>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Leyenda / indicadores -->
<div class="mt-4 space-y-4">
	<div>
		<h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
			<BooksIcon class="inline w-5 h-5 mr-1" />
			Materias
		</h4>
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
			{#each $currentSubjects as subject}
				<div class="flex items-center space-x-2 text-sm">
					<div class="w-3 h-3 rounded-full" style={`background-color:${subject.color}`}></div>
					<span class="text-gray-700">{subject.code}</span>
					<span class="text-gray-500 truncate">{subject.name}</span>
				</div>
			{/each}
		</div>
	</div>

	<div>
		<h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center">
			<ClockIcon class="inline w-5 h-5 mr-1" />
			Indicadores
		</h4>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 bg-green-500 rounded border-2 border-green-400"></div>
				<span class="text-gray-600">Clase en progreso</span>
			</div>
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 border border-dashed border-gray-300 rounded"></div>
				<span class="text-gray-600">Líneas de 30 min (sólida si es hora en punto)</span>
			</div>
		</div>
	</div>

	{#if isWorkDay}
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
			<div class="flex items-center space-x-2 text-blue-700 text-sm">
				<InfoIcon class="inline w-5 h-5 mr-1" />
				<span>Hora actual: {now.toTimeString().slice(0,5)}.</span>
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
