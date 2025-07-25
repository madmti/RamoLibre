<script lang="ts">
	import { page } from '$app/stores';
	import { cloudSession } from '$lib/stores/cloud';
	import { onMount } from 'svelte';

	// ICONS
	import HomeIcon from '$embedded-icons/home.svg?component';
	import HatIcon from '$embedded-icons/hat.svg?component';
	import CalendarCheckIcon from '$embedded-icons/calendar-check.svg?component';
	import ColChartIcon from '$embedded-icons/col-chart.svg?component';
	import CalendarIcon from '$embedded-icons/calendar.svg?component';
	import GestionIcon from '$embedded-icons/gestion.svg?component';
	import ConfigIcon from '$embedded-icons/config.svg?component';
	import UpTrendIcon from '$embedded-icons/up-trend.svg?component';

	import { APP_NAME } from '$lib';

	let currentTime = new Date();
	let timeInterval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		// Actualizar la hora cada segundo
		timeInterval = setInterval(() => {
			currentTime = new Date();
		}, 1000);

		return () => {
			if (timeInterval) clearInterval(timeInterval);
		};
	});

	// Formatear la fecha
	$: formattedDate = currentTime.toLocaleDateString('es-ES', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	// Formatear la hora
	$: formattedTime = currentTime.toLocaleTimeString('es-ES', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});

	const navItems = [
		{
			href: '/',
			label: 'Inicio',
			icon: '🏠',
			description: 'Página principal de Ramo Libre',
		},
		{
			href: '/horario',
			label: 'Horario',
			icon: '📅',
			description: 'Gestión de horarios académicos',
		},
		{
			href: '/notas',
			label: 'Notas',
			icon: '📊',
			description: 'Seguimiento de calificaciones',
		},
		{
			href: '/eventos',
			label: 'Eventos',
			icon: '🎯',
			description: 'Eventos y fechas académicas',
		},
		{
			href: '/gestion',
			label: 'Gestión',
			icon: '📚',
			description: 'Gestión académica avanzada',
		},
		{
			href: '/configuracion',
			label: 'Configuración',
			icon: '⚙️',
			description: 'Configuración de la aplicación',
		},
	];
</script>

<nav
	class="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50"
	aria-label="Navegación principal"
>
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between h-16">
			<!-- Logo y título -->
			<div class="flex items-center space-x-3">
				<span class="text-2xl" role="img" aria-label="Graduación">
					<HatIcon class="h-8 w-8" />
				</span>
				<h1 class="text-xl font-bold text-gray-800">
					<a href="/" class="hover:text-blue-600 transition-colors">{APP_NAME}</a>
				</h1>
			</div>

			<!-- Navegación principal -->
			<div class="hidden lg:flex items-center space-x-1" role="menubar">
				<!-- Home -->
				<a
					href="/"
					class={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:text-gray-800 hover:bg-gray-100 ${
						$page.url.pathname === '/'
							? 'bg-gray-50 text-gray-700 border border-gray-200'
							: 'text-gray-600'
					}`}
					role="menuitem"
					aria-label="Página principal"
					aria-current={$page.url.pathname === '/' ? 'page' : undefined}
				>
					<span class="text-lg" role="img" aria-hidden="true">
						<HomeIcon class="h-6 w-6" />
					</span>
					<span>Inicio</span>
				</a>

				<!-- Horario -->
				<a
					href="/horario"
					class={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:text-blue-700 hover:bg-gray-100 ${
						$page.url.pathname === '/horario'
							? 'bg-blue-50 text-blue-700 border border-blue-200'
							: 'text-gray-600'
					}`}
					role="menuitem"
					aria-label="Gestión de horarios académicos"
					aria-current={$page.url.pathname === '/horario' ? 'page' : undefined}
				>
					<span class="text-lg" role="img" aria-hidden="true">
						<CalendarCheckIcon class="h-6 w-6" />
					</span>
					<span>Horario</span>
				</a>

				<!-- Notas -->
				<a
					href="/notas"
					class={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:text-green-700 hover:bg-gray-100 ${
						$page.url.pathname === '/notas'
							? 'bg-green-50 text-green-700 border border-green-200'
							: 'text-gray-600'
					}`}
					role="menuitem"
					aria-label="Seguimiento de calificaciones"
					aria-current={$page.url.pathname === '/notas' ? 'page' : undefined}
				>
					<span class="text-lg" role="img" aria-hidden="true">
						<UpTrendIcon class="h-6 w-6" />
					</span>
					<span>Notas</span>
				</a>

				<!-- Eventos -->
				<a
					href="/eventos"
					class={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:text-purple-700 hover:bg-gray-100 ${
						$page.url.pathname === '/eventos'
							? 'bg-purple-50 text-purple-700 border border-purple-200'
							: 'text-gray-600'
					}`}
					role="menuitem"
					aria-label="Eventos y fechas académicas"
					aria-current={$page.url.pathname === '/eventos' ? 'page' : undefined}
				>
					<span class="text-lg" role="img" aria-hidden="true">
						<CalendarIcon class="h-6 w-6" />
					</span>
					<span>Eventos</span>
				</a>

				<!-- Gestión -->
				<a
					href="/gestion"
					class={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:text-orange-700 hover:bg-gray-100 ${
						$page.url.pathname === '/gestion'
							? 'bg-orange-50 text-orange-700 border border-orange-200'
							: 'text-gray-600'
					}`}
					role="menuitem"
					aria-label="Gestión académica avanzada"
					aria-current={$page.url.pathname === '/gestion' ? 'page' : undefined}
				>
					<span class="text-lg" role="img" aria-hidden="true">
						<GestionIcon class="h-6 w-6" />
					</span>
					<span>Gestión</span>
				</a>

				<!-- Configuración -->
				<a
					href="/configuracion"
					class={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:text-gray-800 hover:bg-gray-100 ${
						$page.url.pathname === '/configuracion'
							? 'bg-gray-100 text-gray-800 border border-gray-300'
							: 'text-gray-600'
					}`}
					role="menuitem"
					aria-label="Configuración de la cuenta"
					aria-current={$page.url.pathname === '/configuracion' ? 'page' : undefined}
				>
					<span class="text-lg" role="img" aria-hidden="true">
						<ConfigIcon class="h-6 w-6" />
					</span>
					<span>Configuración</span>
				</a>
			</div>

			<!-- Navegación compacta (tablet) -->
			<div class="hidden md:flex lg:hidden items-center space-x-1" role="menubar">
				<!-- Inicio -->
				<a
					href="/"
					class="flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 {$page
						.url.pathname === '/'
						? 'bg-blue-50 text-blue-700 border border-blue-200'
						: 'text-gray-600 hover:text-gray-900'}"
					role="menuitem"
					aria-label="Inicio"
					aria-current={$page.url.pathname === '/' ? 'page' : undefined}
					title="Inicio"
				>
					<span class="text-lg" role="img" aria-hidden="true">
						<HomeIcon class="h-6 w-6" />
					</span>
				</a>

				<!-- Horario -->
				<a
					href="/horario"
					class={`flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 ${
						$page.url.pathname === '/horario'
							? 'bg-blue-50 text-blue-700 border border-blue-200'
							: 'text-gray-600 hover:text-gray-900'
					}`}
					role="menuitem"
					aria-label="Horario"
					aria-current={$page.url.pathname === '/horario' ? 'page' : undefined}
					title="Horario"
				>
					<span class="text-lg" role="img" aria-hidden="true">
						<CalendarCheckIcon class="h-6 w-6" />
					</span>
				</a>

				<!-- Notas -->
				<a
					href="/notas"
					class={`flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 ${
						$page.url.pathname === '/notas'
							? 'bg-green-50 text-green-700 border border-green-200'
							: 'text-gray-600 hover:text-gray-900'
					}`}
					role="menuitem"
					aria-label="Notas"
					aria-current={$page.url.pathname === '/notas' ? 'page' : undefined}
					title="Notas"
				>
					<span class="text-lg" role="img" aria-hidden="true">
						<UpTrendIcon class="h-6 w-6" />
					</span>
				</a>

				<!-- Eventos -->
				<a
					href="/eventos"
					class={`flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 ${
						$page.url.pathname === '/eventos'
							? 'bg-purple-50 text-purple-700 border border-purple-200'
							: 'text-gray-600 hover:text-gray-900'
					}`}
					role="menuitem"
					aria-label="Eventos"
					aria-current={$page.url.pathname === '/eventos' ? 'page' : undefined}
					title="Eventos"
				>
					<span class="text-lg" role="img" aria-hidden="true">
						<CalendarIcon class="h-6 w-6" />
					</span>
				</a>

				<!-- Gestión -->
				<a
					href="/gestion"
					class={`flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 ${
						$page.url.pathname === '/gestion'
							? 'bg-orange-50 text-orange-700 border border-orange-200'
							: 'text-gray-600 hover:text-gray-900'
					}`}
					role="menuitem"
					aria-label="Gestión"
					aria-current={$page.url.pathname === '/gestion' ? 'page' : undefined}
					title="Gestión"
				>
					<span class="text-lg" role="img" aria-hidden="true">
						<GestionIcon class="h-6 w-6" />
					</span>
				</a>

				<!-- Configuración -->
				<a
					href="/configuracion"
					class={`flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 ${
						$page.url.pathname === '/configuracion'
							? 'bg-gray-100 text-gray-800 border border-gray-300'
							: 'text-gray-600 hover:text-gray-900'
					}`}
					role="menuitem"
					aria-label="Configuración"
					aria-current={$page.url.pathname === '/configuracion' ? 'page' : undefined}
					title="Configuración"
				>
					<span class="text-lg" role="img" aria-hidden="true">
						<ConfigIcon class="h-6 w-6" />
					</span>
				</a>
			</div>

			<!-- Hora, fecha e indicador de conexión -->
			<div class="text-right ml-2" aria-live="polite">
				<div class="flex items-center justify-between gap-2 mb-1">
					<!-- Indicador de estado de conexión -->
					<div class="flex items-center gap-1">
						<div
							class="w-2 h-2 rounded-full {$cloudSession
								? 'bg-green-500'
								: 'bg-gray-400'} animate-pulse"
						></div>
						<span
							class={`text-xs ${$cloudSession ? 'text-green-500' : 'text-gray-500'} font-medium`}
						>
							{$cloudSession ? 'Conectado' : 'Desconectado'}
						</span>
					</div>

					<time
						class="text-sm font-medium text-gray-800"
						datetime={currentTime.toISOString()}
					>
						{formattedTime}
					</time>
				</div>
				<div class="text-xs text-gray-500 capitalize">{formattedDate}</div>
			</div>
		</div>

		<!-- Navegación móvil -->
		<div class="md:hidden pb-3 bg-gray-50/80 -mx-4 px-4 pt-2">
			<div
				class="flex space-x-1 overflow-x-auto max-md:justify-between"
				role="tablist"
				aria-label="Navegación móvil"
			>
				<!-- Horarios -->
				<a
					href="/horario"
					class="flex flex-col items-center min-w-[70px] p-2 rounded-lg text-xs font-medium transition-all text-blue-700 hover:bg-gray-100 {$page
						.url.pathname === '/horario'
						? 'bg-blue-50 border border-blue-200'
						: ''}"
					role="tab"
					aria-label="Ver horarios"
					aria-selected={$page.url.pathname === '/horario'}
				>
					<span class="text-lg mb-2" role="img" aria-hidden="true">
						<CalendarCheckIcon class="h-6 w-6" />
					</span>
					<span>Horarios</span>
				</a>

				<!-- Notas -->
				<a
					href="/notas"
					class="flex flex-col items-center min-w-[70px] p-2 rounded-lg text-xs font-medium transition-all text-green-700 hover:bg-gray-100 {$page
						.url.pathname === '/notas'
						? 'bg-green-50 border border-green-200'
						: ''}"
					role="tab"
					aria-label="Ver notas"
					aria-selected={$page.url.pathname === '/notas'}
				>
					<span class="text-lg mb-2" role="img" aria-hidden="true">
						<UpTrendIcon class="h-6 w-6" />
					</span>
					<span>Notas</span>
				</a>

				<!-- Eventos -->
				<a
					href="/eventos"
					class="flex flex-col items-center min-w-[70px] p-2 rounded-lg text-xs font-medium transition-all text-purple-700 hover:bg-gray-100 {$page
						.url.pathname === '/eventos'
						? 'bg-purple-50 border border-purple-200'
						: ''}"
					role="tab"
					aria-label="Ver eventos"
					aria-selected={$page.url.pathname === '/eventos'}
				>
					<span class="text-lg mb-2" role="img" aria-hidden="true">
						<CalendarIcon class="h-6 w-6" />
					</span>
					<span>Eventos</span>
				</a>

				<!-- Gestión -->
				<a
					href="/gestion"
					class="flex flex-col items-center min-w-[70px] p-2 rounded-lg text-xs font-medium transition-all text-orange-700 hover:bg-gray-100 {$page
						.url.pathname === '/gestion'
						? 'bg-orange-50 border border-orange-200'
						: ''}"
					role="tab"
					aria-label="Ver gestión"
					aria-selected={$page.url.pathname === '/gestion'}
				>
					<span class="text-lg mb-2" role="img" aria-hidden="true">
						<GestionIcon class="h-6 w-6" />
					</span>
					<span>Gestión</span>
				</a>

				<!-- Configuración -->
				<a
					href="/configuracion"
					class="flex flex-col items-center min-w-[70px] p-2 rounded-lg text-xs font-medium transition-all text-gray-800 hover:bg-gray-100 {$page
						.url.pathname === '/configuracion'
						? 'bg-gray-100 border border-gray-300'
						: ''}"
					role="tab"
					aria-label="Ver configuración"
					aria-selected={$page.url.pathname === '/configuracion'}
				>
					<span class="text-lg mb-2" role="img" aria-hidden="true">
						<ConfigIcon class="h-6 w-6" />
					</span>
					<span>Configuración</span>
				</a>
			</div>
		</div>
	</div>
</nav>
