<script lang="ts">
	import { currentUser } from '$lib/stores/user';
	import { userPreferences } from '$lib/stores/preferences';
	import { currentEvents } from '$lib/stores/events';
	import { cloudSession } from '$lib/stores/cloud';
	import SyncModal from '$components/modals/SyncModal.svelte';
	import { GradeCalculator, type AvailableMethods } from '$lib/utils/gradeCalculator';
	import { APP_NAME, VERSION } from '$lib';

	// ICONS
	import ConfigIcon from '$embedded-icons/config.svg?component';
	import UserIcon from '$embedded-icons/user.svg?component';
	import UserCircleIcon from '$embedded-icons/user-circle.svg?component';
	import IdeaIcon from '$embedded-icons/idea.svg?component';
	import CloudIcon from '$embedded-icons/cloud.svg?component';
	import SyncIcon from '$embedded-icons/sync.svg?component';
	import CalendarCheckIcon from '$embedded-icons/calendar-check.svg?component';
	import ListIcon from '$embedded-icons/list.svg?component';
	import TableIcon from '$embedded-icons/table.svg?component';
	import WalletCardsIcon from '$embedded-icons/wallet-cards.svg?component';
	import UpTrendIcon from '$embedded-icons/up-trend.svg?component';
	import CalendarIcon from '$embedded-icons/calendar.svg?component';
	import KanBanIcon from '$embedded-icons/kanban.svg?component';
	import TimeLineIcon from '$embedded-icons/time-line.svg?component';
	import ZapIcon from '$embedded-icons/zap.svg?component';
	import TrashIcon from '$embedded-icons/trash.svg?component';
	import HatIcon from '$embedded-icons/hat.svg?component';
	import LogoutIcon from '$embedded-icons/logout.svg?component';
	import EditIcon from '$embedded-icons/edit.svg?component';

	let editingAccount = false;
	let showDeleteDataConfirm = false;
	let showDeleteEventsConfirm = false;
	let showSyncModal = false;
	let tempUserData: any = $currentUser;

	const saveAccountChanges = () => {
		if ($currentUser !== null && tempUserData.name && tempUserData.email) {
			const updatedUser = {
				...$currentUser,
				...tempUserData,
				updatedAt: new Date().toISOString(),
			};
			currentUser.set(updatedUser);
			editingAccount = false;
		}
	};

	const handleLogout = () => {
		currentUser.reset();
		window.location.href = '/';
	};

	const cancelEdit = () => {
		if ($currentUser !== null) {
			tempUserData = { ...$currentUser };
		}
		editingAccount = false;
	};

	const updatePreference = (key: string, value: any) => {
		userPreferences.updatePreferences({ [key]: value });
	};

	const deleteAllData = () => {
		localStorage.clear();
		showDeleteDataConfirm = false;
		window.location.reload();
	};

	const deleteAllEvents = () => {
		currentEvents.reset();
		showDeleteEventsConfirm = false;
	};

	export function getMethodEmoji(method: AvailableMethods) {
		switch (method) {
			case 'LP_MIN_PASSING_DISTANCE':
				return '⚖️';
			case 'LP_MIN':
				return '🔥';
			default:
				return '❓';
		}
	}

	export function getMethodTitle(method: AvailableMethods) {
		switch (method) {
			case 'LP_MIN_PASSING_DISTANCE':
				return 'Justo para Pasar';
			case 'LP_MIN':
				return 'Todo o Nada';
			default:
				return 'Método de cálculo desconocido';
		}
	}

	function getMethodDescription(method: AvailableMethods) {
		switch (method) {
			case 'LP_MIN_PASSING_DISTANCE':
				return 'Este método calcula las notas mínimas necesarias intentando que cada nota faltante quede lo más cerca posible del mínimo para aprobar. Minimiza la distancia total hacia la nota de aprobación. Es ideal si buscas pasar con el menor esfuerzo global y con resultados realistas y progresivos.';
			case 'LP_MIN':
				return 'Este método asigna todo el esfuerzo posible a las primeras evaluaciones disponibles y deja el resto en cero. Busca alcanzar la nota de aprobación con la menor cantidad de evaluaciones activas posibles, sin importar el equilibrio. Es útil si quieres concentrarte en rendir muy bien en pocas instancias y luego no depender del resto.';
			default:
				return 'Descripción del método de cálculo desconocida.';
		}
	}
</script>

<svelte:head>
	<title>Configuración - Ramo Libre</title>
</svelte:head>

<div class="container mx-auto lg:px-4 lg:py-8 max-w-4xl">
	<div
		class="lg:bg-white/90 lg:backdrop-blur-sm lg:rounded-xl lg:shadow-lg lg:border lg:border-gray-200/50 lg:p-8"
	>
		<!-- Header móvil -->
		<div class="lg:hidden px-4 py-6 bg-white border-b border-gray-200">
			<h1 class="text-2xl font-bold text-gray-800 mb-1 flex items-center">
				<ConfigIcon class="inline-block h-8 w-8 mr-2" />
				Configuración
			</h1>
			<p class="text-gray-600 text-sm">Personaliza tu experiencia con Ramo Libre.</p>
		</div>

		<!-- Header desktop -->
		<div class="hidden lg:block">
			<h1 class="text-3xl font-bold text-gray-800 mb-2 flex items-center">
				<ConfigIcon class="inline-block h-8 w-8 mr-2" />
				Configuración
			</h1>
			<p class="text-gray-600 mb-8">Personaliza tu experiencia con Ramo Libre.</p>
		</div>

		<!-- === CUENTA === -->
		<section
			class="bg-white lg:bg-gray-50 lg:rounded-xl border-b lg:border-none border-gray-200 p-4 lg:p-6"
		>
			<div class="flex items-center justify-between mb-4 lg:mb-6">
				<h2 class="text-lg lg:text-2xl font-bold text-gray-800 flex items-center space-x-2">
					<UserIcon class="inline-block h-6 w-6" />
					<span>Cuenta</span>
				</h2>
				{#if $currentUser !== null && !editingAccount}
					<div class="flex flex-col lg:flex-row gap-2">
						{#if $cloudSession}
							<button
								on:click={() => {
									showSyncModal = true;
								}}
								class="px-2 py-2 rounded-lg hover:text-emerald-600 transition-colors flex items-center gap-2 justify-center lg:justify-start font-medium"
							>
								<SyncIcon class="h-5 w-5 inline-block" />
								Sincronizar
							</button>
						{:else}
							<button
								on:click={() => {
									showSyncModal = true;
								}}
								class="px-2 py-2 rounded-lg hover:text-indigo-600 transition-colors flex items-center gap-2 justify-center lg:justify-start font-medium"
							>
								<CloudIcon class="h-5 w-5 inline-block" />
								Conectar
							</button>
						{/if}
						<button
							on:click={() => (editingAccount = true)}
							class="px-2 py-2 rounded-lg hover:text-blue-600 transition-colors font-medium flex items-center gap-2"
						>
							<EditIcon class="h-5 w-5 inline-block" />
							Editar
						</button>
						<button
							on:click={handleLogout}
							class="px-2 py-2 rounded-lg hover:text-red-600 transition-colors font-medium flex items-center gap-2"
						>
							<LogoutIcon class="h-5 w-5 inline-block" />
							Cerrar sesión
						</button>
					</div>
				{/if}
			</div>

			{#if $currentUser === null}
				<!-- Usuario no logueado - Solo para la sección de cuenta -->
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6 text-center">
					<span class="text-3xl lg:text-4xl mb-3 lg:mb-4 block">
						<UserCircleIcon
							class="inline-block h-8 w-8 lg:h-10 lg:w-10 text-blue-700"
						/>
					</span>
					<h3 class="text-lg lg:text-xl font-semibold text-blue-800 mb-2">
						Gestiona tu cuenta
					</h3>
					<p class="text-blue-700 mb-4 text-sm lg:text-base">
						Inicia sesión para personalizar tu perfil académico y sincronizar tus datos.
					</p>
					<div class="flex flex-col gap-2 lg:flex-row lg:gap-3 lg:justify-center">
						<a
							href="/#usercard"
							class="bg-blue-600 text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
						>
							Crear cuenta
						</a>
						<a
							href="/#usercard"
							class="bg-white text-blue-600 border border-blue-300 px-4 lg:px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm lg:text-base"
						>
							Iniciar sesión
						</a>
					</div>
					<p
						class="text-xs lg:text-sm text-blue-600 mt-3 lg:mt-4 flex items-center justify-center"
					>
						<IdeaIcon class="h-4 w-4 inline-block mr-1 text-yellow-500" />
						<strong class="mr-1">Tip:</strong> Puedes usar la aplicación sin cuenta, pero
						registrarte te permitirá sincronizar tus datos.
					</p>
				</div>
			{:else}
				<!-- Usuario logueado - Mostrar información de cuenta -->
				{#if $currentUser !== null}
					<div class="grid md:grid-cols-2 gap-6">
						<!-- Información básica -->
						<div class="space-y-4">
							<div>
								<label
									for="user-name"
									class="block text-sm font-medium text-gray-700 mb-1"
									>Nombre</label
								>
								{#if editingAccount}
									<input
										id="user-name"
										type="text"
										bind:value={tempUserData.name}
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										placeholder="Tu nombre completo"
									/>
								{:else}
									<p class="text-gray-900 py-2">{$currentUser.name}</p>
								{/if}
							</div>

							<div>
								<label
									for="user-email"
									class="block text-sm font-medium text-gray-700 mb-1"
									>Correo electrónico</label
								>
								{#if editingAccount}
									<input
										id="user-email"
										type="email"
										bind:value={tempUserData.email}
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										placeholder="tu@email.com"
									/>
								{:else}
									<p class="text-gray-900 py-2">{$currentUser.email}</p>
								{/if}
							</div>

							<div>
								<label
									for="user-university"
									class="block text-sm font-medium text-gray-700 mb-1"
									>Universidad</label
								>
								{#if editingAccount}
									<input
										id="user-university"
										type="text"
										bind:value={tempUserData.university}
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										placeholder="Universidad (opcional)"
									/>
								{:else}
									<p class="text-gray-900 py-2">
										{$currentUser.university || 'No especificada'}
									</p>
								{/if}
							</div>
						</div>

						<!-- Información académica -->
						<div class="space-y-4">
							<div>
								<label
									for="user-career"
									class="block text-sm font-medium text-gray-700 mb-1"
									>Carrera</label
								>
								{#if editingAccount}
									<input
										id="user-career"
										type="text"
										bind:value={tempUserData.career}
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										placeholder="Tu carrera (opcional)"
									/>
								{:else}
									<p class="text-gray-900 py-2">
										{$currentUser.career || 'No especificada'}
									</p>
								{/if}
							</div>

							<div>
								<label
									for="user-semester"
									class="block text-sm font-medium text-gray-700 mb-1"
									>Semestre</label
								>
								{#if editingAccount}
									<input
										id="user-semester"
										type="number"
										bind:value={tempUserData.semester}
										min="1"
										max="12"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										placeholder="Semestre actual"
									/>
								{:else}
									<p class="text-gray-900 py-2">
										{$currentUser.semester || 'No especificado'}
									</p>
								{/if}
							</div>

							<div>
								<span class="block text-sm font-medium text-gray-700 mb-1"
									>Miembro desde</span
								>
								<p class="text-gray-600 py-2">
									{new Date($currentUser.createdAt).toLocaleDateString('es-ES', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</p>
							</div>
						</div>
					</div>

					{#if editingAccount}
						<div class="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
							<button
								on:click={saveAccountChanges}
								class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
							>
								Guardar cambios
							</button>
							<button
								on:click={cancelEdit}
								class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
							>
								Cancelar
							</button>
						</div>
					{/if}
				{/if}
			{/if}
		</section>

		<!-- === HORARIO === -->
		<section
			class="bg-white lg:bg-gray-50 lg:rounded-xl border-b lg:border-none border-gray-200 p-4 lg:p-6"
		>
			<h2
				class="text-lg lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6 flex items-center space-x-2"
			>
				<CalendarCheckIcon class="inline-block h-6 w-6" />
				<span>Horario</span>
			</h2>

			<div class="space-y-4">
				<div>
					<fieldset>
						<legend class="block text-sm font-medium text-gray-700 mb-3"
							>Vista preferida del horario</legend
						>
						<div class="space-y-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
							<!-- Vista Lista -->
							<label for="schedule-view-list" class="relative cursor-pointer">
								<input
									id="schedule-view-list"
									type="radio"
									name="scheduleView"
									value="list"
									checked={$userPreferences.scheduleView === 'list'}
									on:change={() => updatePreference('scheduleView', 'list')}
									class="sr-only peer"
								/>
								<div
									class="border-2 border-gray-200 rounded-lg p-3 lg:p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors"
								>
									<div class="flex items-center space-x-3 mb-1 lg:mb-2">
										<span class="text-xl lg:text-2xl">
											<ListIcon class="inline-block h-6 w-6" />
										</span>
										<h3 class="font-semibold text-gray-800">Lista</h3>
									</div>
									<p class="text-xs lg:text-sm text-gray-600">
										Vista detallada por día con información completa de cada
										clase.
									</p>
								</div>
							</label>

							<!-- Vista Tabla/Grid -->
							<label for="schedule-view-grid" class="relative cursor-pointer">
								<input
									id="schedule-view-grid"
									type="radio"
									name="scheduleView"
									value="grid"
									checked={$userPreferences.scheduleView === 'grid'}
									on:change={() => updatePreference('scheduleView', 'grid')}
									class="sr-only peer"
								/>
								<div
									class="border-2 border-gray-200 rounded-lg p-3 lg:p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors"
								>
									<div class="flex items-center space-x-3 mb-1 lg:mb-2">
										<span class="text-xl lg:text-2xl">
											<TableIcon class="inline-block h-6 w-6" />
										</span>
										<h3 class="font-semibold text-gray-800">Tabla</h3>
									</div>
									<p class="text-xs lg:text-sm text-gray-600">
										Vista semanal tipo calendario con horarios en tabla.
									</p>
								</div>
							</label>

							<!-- Vista Tarjetas -->
							<label for="schedule-view-cards" class="relative cursor-pointer">
								<input
									id="schedule-view-cards"
									type="radio"
									name="scheduleView"
									value="cards"
									checked={$userPreferences.scheduleView === 'cards'}
									on:change={() => updatePreference('scheduleView', 'cards')}
									class="sr-only peer"
								/>
								<div
									class="border-2 border-gray-200 rounded-lg p-3 lg:p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors"
								>
									<div class="flex items-center space-x-3 mb-1 lg:mb-2">
										<span class="text-xl lg:text-2xl">
											<WalletCardsIcon class="inline-block h-6 w-6" />
										</span>
										<h3 class="font-semibold text-gray-800">Tarjetas</h3>
									</div>
									<p class="text-xs lg:text-sm text-gray-600">
										Vista compacta con tarjetas organizadas por día.
									</p>
								</div>
							</label>
						</div>
					</fieldset>
				</div>

				<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
					<p class="text-xs lg:text-sm text-blue-700 flex items-center gap-1">
						<IdeaIcon class="h-4 w-4 inline-block text-yellow-500" />
						<strong>Tip:</strong> La vista seleccionada se aplicará automáticamente en la
						página de horarios.
					</p>
				</div>
			</div>
		</section>

		<!-- === NOTAS === -->
		<section
			class="bg-white lg:bg-gray-50 lg:rounded-xl border-b lg:border-none border-gray-200 p-4 lg:p-6"
		>
			<h2
				class="text-lg lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6 flex items-center space-x-2"
			>
				<UpTrendIcon class="h-6 w-6 inline-block text-gray-500" />
				<span>Notas</span>
			</h2>

			<div class="space-y-4 lg:space-y-6">
				<!-- Selección de método de cálculo -->
				<fieldset>
					<legend class="block text-sm font-medium text-gray-700 mb-3"
						>Método de cálculo de notas preferido</legend
					>
					<div class="space-y-3 lg:grid lg:grid-cols-1 lg:gap-4 lg:space-y-0">
						{#each GradeCalculator.availableMethods as method}
							<label for="grade-method-{method}" class="relative cursor-pointer">
								<input
									id="grade-method-{method}"
									type="radio"
									name="gradeMethod"
									value={method}
									checked={$userPreferences.gradeCalculationMethod === method}
									on:change={() =>
										updatePreference('gradeCalculationMethod', method)}
									class="sr-only peer"
								/>
								<div
									class="border-2 border-gray-200 rounded-lg p-3 lg:p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors"
								>
									<div class="flex items-center space-x-3 mb-1 lg:mb-2">
										<span class="text-xl lg:text-2xl"
											>{getMethodEmoji(method)}</span
										>
										<div class="flex items-center gap-2 flex-wrap">
											<h3 class="font-semibold text-gray-800">
												{getMethodTitle(method)}
											</h3>
											<span
												class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-mono"
											>
												{method}
											</span>
										</div>
									</div>
									<p class="text-xs lg:text-sm text-gray-600">
										{getMethodDescription(method)}
									</p>
								</div>
							</label>
						{/each}
					</div>
				</fieldset>

				<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
					<p class="text-xs lg:text-sm text-blue-700 flex items-center gap-1">
						<IdeaIcon class="h-4 w-4 inline-block text-yellow-500" />
						<strong>Tip:</strong> El método seleccionado se usará automáticamente para calcular
						tus notas en todas las materias.
					</p>
				</div>
			</div>
		</section>

		<!-- === EVENTOS === -->
		<section
			class="bg-white lg:bg-gray-50 lg:rounded-xl border-b lg:border-none border-gray-200 p-4 lg:p-6"
		>
			<h2
				class="text-lg lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6 flex items-center space-x-2"
			>
				<CalendarIcon class="inline-block h-6 w-6" />
				<span>Eventos</span>
			</h2>

			<div class="space-y-4 lg:space-y-6">
				<!-- Selección de vista -->
				<fieldset>
					<legend class="block text-sm font-medium text-gray-700 mb-3"
						>Vista preferida de eventos</legend
					>
					<div
						class="space-y-3 lg:grid lg:grid-cols-1 lg:md:grid-cols-4 lg:gap-4 lg:space-y-0"
					>
						<!-- Vista Calendario -->
						<label for="events-view-calendar" class="relative cursor-pointer">
							<input
								id="events-view-calendar"
								type="radio"
								name="eventsView"
								value="calendar"
								checked={$userPreferences.eventsView === 'calendar'}
								on:change={() => updatePreference('eventsView', 'calendar')}
								class="sr-only peer"
							/>
							<div
								class="border-2 border-gray-200 rounded-lg p-3 lg:p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors"
							>
								<div class="flex items-center space-x-3 mb-1 lg:mb-2">
									<CalendarIcon class="inline-block h-6 w-6" />
									<h3 class="font-semibold text-gray-800">Calendario</h3>
								</div>
								<p class="text-xs lg:text-sm text-gray-600">
									Vista mensual tipo calendario con eventos en cuadrícula.
								</p>
							</div>
						</label>

						<!-- Vista Lista -->
						<label for="events-view-list" class="relative cursor-pointer">
							<input
								id="events-view-list"
								type="radio"
								name="eventsView"
								value="list"
								checked={$userPreferences.eventsView === 'list'}
								on:change={() => updatePreference('eventsView', 'list')}
								class="sr-only peer"
							/>
							<div
								class="border-2 border-gray-200 rounded-lg p-3 lg:p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors"
							>
								<div class="flex items-center space-x-3 mb-1 lg:mb-2">
									<ListIcon class="inline-block h-6 w-6" />
									<h3 class="font-semibold text-gray-800">Lista</h3>
								</div>
								<p class="text-xs lg:text-sm text-gray-600">
									Vista lista ordenada por fecha con información detallada.
								</p>
							</div>
						</label>

						<!-- Vista Kanban -->
						<label for="events-view-kanban" class="relative cursor-pointer">
							<input
								id="events-view-kanban"
								type="radio"
								name="eventsView"
								value="kanban"
								checked={$userPreferences.eventsView === 'kanban'}
								on:change={() => updatePreference('eventsView', 'kanban')}
								class="sr-only peer"
							/>
							<div
								class="border-2 border-gray-200 rounded-lg p-3 lg:p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors"
							>
								<div class="flex items-center space-x-3 mb-1 lg:mb-2">
									<KanBanIcon class="inline-block h-6 w-6" />
									<h3 class="font-semibold text-gray-800">Kanban</h3>
								</div>
								<p class="text-xs lg:text-sm text-gray-600">
									Vista tablero con eventos organizados por columnas.
								</p>
							</div>
						</label>

						<!-- Vista Timeline -->
						<label for="events-view-timeline" class="relative cursor-pointer">
							<input
								id="events-view-timeline"
								type="radio"
								name="eventsView"
								value="timeline"
								checked={$userPreferences.eventsView === 'timeline'}
								on:change={() => updatePreference('eventsView', 'timeline')}
								class="sr-only peer"
							/>
							<div
								class="border-2 border-gray-200 rounded-lg p-3 lg:p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors"
							>
								<div class="flex items-center space-x-3 mb-1 lg:mb-2">
									<TimeLineIcon class="inline-block h-6 w-6" />
									<h3 class="font-semibold text-gray-800">Timeline</h3>
								</div>
								<p class="text-xs lg:text-sm text-gray-600">
									Vista cronológica tipo línea de tiempo con eventos.
								</p>
							</div>
						</label>
					</div>
				</fieldset>

				<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
					<p class="text-xs lg:text-sm text-blue-700 flex items-center gap-1">
						<IdeaIcon class="h-4 w-4 inline-block text-yellow-500" />
						<strong>Tip:</strong> La vista seleccionada se aplicará automáticamente al abrir
						la sección de eventos.
					</p>
				</div>
			</div>
		</section>

		<!-- === EXTRA === -->
		<section
			class="bg-white lg:bg-gray-50 lg:rounded-xl border-b lg:border-none border-gray-200 p-4 lg:p-6"
		>
			<h2
				class="text-lg lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6 flex items-center space-x-2"
			>
				<ZapIcon class="w-6 h-6 text-yellow-300" />
				<span>Extra</span>
			</h2>

			<div class="space-y-4 lg:space-y-6">
				<!-- Gestión de datos - Disponible para todos -->
				<div>
					<h3 class="text-lg font-semibold text-gray-800 mb-4">Gestión de datos</h3>
					<div class="bg-red-50 border border-red-200 rounded-lg p-4">
						<p class="text-red-700 mb-3 text-sm">
							Elimina todos tus datos guardados localmente. Esto incluye cuenta,
							horarios, notas, eventos y configuraciones.
						</p>
						<button
							on:click={() => (showDeleteDataConfirm = true)}
							class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
						>
							<TrashIcon class="h-4 w-4 inline-block" /> Limpiar todos los datos
						</button>
					</div>
				</div>

				<!-- Información de la app -->
				<div>
					<h3 class="text-lg font-semibold text-gray-800 mb-4">
						Acerca de la aplicación
					</h3>
					<div class="bg-white rounded-lg p-4 border border-gray-200">
						<div class="flex items-center gap-3 mb-3">
							<HatIcon class="h-8 w-8 text-blue-600" />
							<div>
								<p class="text-gray-700 font-semibold">
									<strong>{APP_NAME}</strong>
									v{VERSION}
								</p>
								<p class="text-gray-600 text-sm">Gestor académico universitario</p>
							</div>
						</div>
						<p class="text-gray-600 text-sm">
							Aplicación diseñada para ayudar a estudiantes universitarios a gestionar
							su información académica de manera eficiente.
						</p>
					</div>
				</div>
			</div>
		</section>
	</div>
</div>

<!-- Modal de confirmación para eliminar todos los datos -->
{#if showDeleteDataConfirm}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
			<div class="text-center mb-4">
				<span class="text-4xl">🗑️</span>
				<h3 class="text-xl font-bold text-red-600 mt-2">Limpiar todos los datos</h3>
			</div>
			<p class="text-gray-700 mb-6 text-center">
				¿Estás seguro de que quieres eliminar todos tus datos? Esta acción eliminará:
			</p>
			<ul class="text-sm text-gray-600 mb-6 space-y-1">
				<li>• Todas las materias y horarios</li>
				<li>• Todas las notas y configuraciones</li>
				<li>• Todos los eventos guardados</li>
				<li>• Configuraciones de usuario</li>
				<li>• Datos de sesión (si los hay)</li>
			</ul>
			<p class="text-sm text-red-600 mb-6 text-center font-medium">
				Esta acción <strong>no se puede deshacer</strong>.
			</p>
			<div class="flex space-x-3">
				<button
					on:click={deleteAllData}
					class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex-1 flex items-center justify-center gap-2"
				>
					<span>🗑️</span> Sí, limpiar todo
				</button>
				<button
					on:click={() => (showDeleteDataConfirm = false)}
					class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex-1"
				>
					Cancelar
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal de confirmación para eliminar todos los eventos -->
{#if showDeleteEventsConfirm}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
			<div class="text-center mb-4">
				<span class="text-4xl">🗑️</span>
				<h3 class="text-xl font-bold text-red-600 mt-2">Eliminar todos los eventos</h3>
			</div>
			<p class="text-gray-700 mb-6 text-center">
				¿Estás seguro de que quieres eliminar todos tus eventos? Esta acción eliminará todos
				los eventos guardados de forma permanente y <strong>no se puede deshacer</strong>.
			</p>
			<div class="flex space-x-3">
				<button
					on:click={deleteAllEvents}
					class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex-1 flex items-center justify-center gap-2"
				>
					<span>🗑️</span> Sí, eliminar todos
				</button>
				<button
					on:click={() => (showDeleteEventsConfirm = false)}
					class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex-1"
				>
					Cancelar
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal de Sync -->
<SyncModal bind:isOpen={showSyncModal} />
