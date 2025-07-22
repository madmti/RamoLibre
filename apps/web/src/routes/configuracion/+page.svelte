<script lang="ts">
	import { currentUser } from '$lib/stores/user';
	import { userPreferences } from '$lib/stores/preferences';
	import { currentEvents } from '$lib/stores/events';
	import SyncModal from "$components/modals/SyncModal.svelte"

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
				updatedAt: new Date().toISOString()
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

</script>

<svelte:head>
	<title>Configuración - Ramo Libre</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-8">
		<h1 class="text-3xl font-bold text-gray-800 mb-2">⚙️ Configuración</h1>
		<p class="text-gray-600 mb-8">Personaliza tu experiencia con Ramo Libre.</p>
		
			<!-- === CUENTA === -->
			<section class="bg-gray-50 rounded-xl p-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-2xl font-bold text-gray-800 flex items-center space-x-2">
						<span>👤</span>
						<span>Cuenta</span>
					</h2>
					{#if $currentUser !== null && !editingAccount}
					<div class="flex gap-2">
						<button 
							on:click={() => {
								showSyncModal = true;
							}}
							class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
						>
							Sincronizar datos
						</button>
						<button 
							on:click={() => editingAccount = true}
							class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
						>
							Editar
						</button>
					</div>
					{/if}
				</div>

				{#if $currentUser === null}
					<!-- Usuario no logueado - Solo para la sección de cuenta -->
					<div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
						<span class="text-4xl mb-4 block">👤</span>
						<h3 class="text-xl font-semibold text-blue-800 mb-2">Gestiona tu cuenta</h3>
						<p class="text-blue-700 mb-4">Inicia sesión para personalizar tu perfil académico y sincronizar tus datos.</p>
						<div class="flex flex-col sm:flex-row gap-3 justify-center">
							<a href="/#usercard" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
								Crear cuenta
							</a>
							<a href="/#usercard" class="bg-white text-blue-600 border border-blue-300 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
								Iniciar sesión
							</a>
						</div>
						<p class="text-sm text-blue-600 mt-4">
							💡 <strong>Tip:</strong> Puedes usar la aplicación sin cuenta, pero registrarte te permitirá sincronizar tus datos.
						</p>
					</div>
				{:else}
					<!-- Usuario logueado - Mostrar información de cuenta -->
					{#if $currentUser !== null}
						<div class="grid md:grid-cols-2 gap-6">
							<!-- Información básica -->
							<div class="space-y-4">
								<div>
									<label for="user-name" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
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
									<label for="user-email" class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
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
									<label for="user-university" class="block text-sm font-medium text-gray-700 mb-1">Universidad</label>
									{#if editingAccount}
										<input 
											id="user-university"
											type="text" 
											bind:value={tempUserData.university}
											class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											placeholder="Universidad (opcional)"
										/>
									{:else}
										<p class="text-gray-900 py-2">{$currentUser.university || 'No especificada'}</p>
									{/if}
								</div>
							</div>

							<!-- Información académica -->
							<div class="space-y-4">
								<div>
									<label for="user-career" class="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
									{#if editingAccount}
										<input 
											id="user-career"
											type="text" 
											bind:value={tempUserData.career}
											class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											placeholder="Tu carrera (opcional)"
										/>
									{:else}
										<p class="text-gray-900 py-2">{$currentUser.career || 'No especificada'}</p>
									{/if}
								</div>

								<div>
									<label for="user-semester" class="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
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
										<p class="text-gray-900 py-2">{$currentUser.semester || 'No especificado'}</p>
									{/if}
								</div>

								<div>
									<span class="block text-sm font-medium text-gray-700 mb-1">Miembro desde</span>
									<p class="text-gray-600 py-2">
										{new Date($currentUser.createdAt).toLocaleDateString('es-ES', { 
											year: 'numeric', 
											month: 'long', 
											day: 'numeric' 
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
				<section class="bg-gray-50 rounded-xl p-6">
					<h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
						<span>📅</span>
						<span>Horario</span>
					</h2>

					<div class="space-y-4">
						<div>
							<fieldset>
								<legend class="block text-sm font-medium text-gray-700 mb-3">Vista preferida del horario</legend>
								<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
										<div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
											<div class="flex items-center space-x-3 mb-2">
												<span class="text-2xl">📋</span>
												<h3 class="font-semibold text-gray-800">Lista</h3>
											</div>
											<p class="text-sm text-gray-600">Vista detallada por día con información completa de cada clase.</p>
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
										<div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
											<div class="flex items-center space-x-3 mb-2">
												<span class="text-2xl">📊</span>
												<h3 class="font-semibold text-gray-800">Tabla</h3>
											</div>
											<p class="text-sm text-gray-600">Vista semanal tipo calendario con horarios en tabla.</p>
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
										<div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
											<div class="flex items-center space-x-3 mb-2">
												<span class="text-2xl">🗃️</span>
												<h3 class="font-semibold text-gray-800">Tarjetas</h3>
											</div>
											<p class="text-sm text-gray-600">Vista compacta con tarjetas organizadas por día.</p>
										</div>
									</label>
								</div>
							</fieldset>
						</div>

						<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<p class="text-sm text-blue-700">
								💡 <strong>Tip:</strong> La vista seleccionada se aplicará automáticamente en la página de horarios.
							</p>
						</div>
					</div>
				</section>

				<!-- === NOTAS === -->
				<section class="bg-gray-50 rounded-xl p-6">
					<h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
						<span>📊</span>
						<span>Notas</span>
					</h2>
					
					<div class="space-y-6">
						<!-- Método de cálculo de notas -->
						<div>
							<fieldset>
								<legend class="block text-sm font-medium text-gray-700 mb-3">Método de cálculo de predicciones</legend>
								<div class="space-y-3">
									<!-- LP Smooth Solution (Seleccionado) -->
									<label for="calc-method-lp-smooth" class="relative cursor-not-allowed opacity-75">
										<input 
											id="calc-method-lp-smooth"
											type="radio" 
											name="calculationMethod"
											value="lp-smooth"
											checked={true}
											disabled
											class="sr-only peer"
										/>
										<div class="border-2 border-blue-500 bg-blue-50 rounded-lg p-4 transition-colors">
											<div class="flex items-center justify-between mb-2">
												<div class="flex items-center space-x-3">
													<span class="text-2xl">🧮</span>
													<h3 class="font-semibold text-gray-800">LP Min Passing Distance</h3>
												</div>
												<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
													Activo
												</span>
											</div>
											<p class="text-sm text-gray-600">Optimización matemática con soluciones suaves y balanceadas. Evita notas extremas y proporciona predicciones realistas.</p>
										</div>
									</label>

									<!-- Método Simple (Deshabilitado) -->
									<label for="calc-method-simple" class="relative cursor-not-allowed opacity-50">
										<input 
											id="calc-method-simple"
											type="radio" 
											name="calculationMethod"
											value="simple"
											disabled
											class="sr-only peer"
										/>
										<div class="border-2 border-gray-200 rounded-lg p-4 transition-colors">
											<div class="flex items-center justify-between mb-2">
												<div class="flex items-center space-x-3">
													<span class="text-2xl">📝</span>
													<h3 class="font-semibold text-gray-400">Método Simple</h3>
												</div>
												<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
													Disponible próximamente
												</span>
											</div>
											<p class="text-sm text-gray-400">Cálculo básico de promedios sin optimización. Más directo pero menos preciso.</p>
										</div>
									</label>

									<!-- Método Avanzado (Deshabilitado) -->
									<label for="calc-method-advanced" class="relative cursor-not-allowed opacity-50">
										<input 
											id="calc-method-advanced"
											type="radio" 
											name="calculationMethod"
											value="advanced"
											disabled
											class="sr-only peer"
										/>
										<div class="border-2 border-gray-200 rounded-lg p-4 transition-colors">
											<div class="flex items-center justify-between mb-2">
												<div class="flex items-center space-x-3">
													<span class="text-2xl">🎯</span>
													<h3 class="font-semibold text-gray-400">Método Avanzado</h3>
												</div>
												<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
													Disponible próximamente
												</span>
											</div>
											<p class="text-sm text-gray-400">Algoritmos de machine learning para predicciones personalizadas basadas en tu historial.</p>
										</div>
									</label>
								</div>
							</fieldset>
						</div>

						<!-- Información adicional -->
						<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<p class="text-sm text-blue-700">
								💡 <strong>Información:</strong> El método LP Smooth Solution utiliza programación lineal para encontrar las notas mínimas requeridas de manera óptima, evitando soluciones extremas como 0.0 y 7.0 simultáneamente.
							</p>
						</div>
					</div>
				</section>

				<!-- === EVENTOS === -->
				<section class="bg-gray-50 rounded-xl p-6">
					<h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
						<span>🎯</span>
						<span>Eventos</span>
					</h2>

					<div class="space-y-6">
						<!-- Selección de vista -->
						<fieldset>
							<legend class="block text-sm font-medium text-gray-700 mb-3">Vista preferida de eventos</legend>
							<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
									<div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
										<div class="flex items-center space-x-3 mb-2">
											<span class="text-2xl">📅</span>
											<h3 class="font-semibold text-gray-800">Calendario</h3>
										</div>
										<p class="text-sm text-gray-600">Vista mensual tipo calendario con eventos en cuadrícula.</p>
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
									<div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
										<div class="flex items-center space-x-3 mb-2">
											<span class="text-2xl">📋</span>
											<h3 class="font-semibold text-gray-800">Lista</h3>
										</div>
										<p class="text-sm text-gray-600">Vista lista ordenada por fecha con información detallada.</p>
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
									<div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
										<div class="flex items-center space-x-3 mb-2">
											<span class="text-2xl">🗂️</span>
											<h3 class="font-semibold text-gray-800">Kanban</h3>
										</div>
										<p class="text-sm text-gray-600">Vista tablero con eventos organizados por columnas.</p>
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
									<div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
										<div class="flex items-center space-x-3 mb-2">
											<span class="text-2xl">📈</span>
											<h3 class="font-semibold text-gray-800">Timeline</h3>
										</div>
										<p class="text-sm text-gray-600">Vista cronológica tipo línea de tiempo con eventos.</p>
									</div>
								</label>
							</div>
						</fieldset>

						<!-- Gestión de eventos -->
						<div class="bg-red-50 border border-red-200 rounded-lg p-4">
							<h3 class="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
								<span>🗑️</span>
								Gestión de eventos
							</h3>
							<p class="text-red-700 mb-3 text-sm">
								Elimina todos tus eventos guardados. Esta acción no se puede deshacer.
							</p>
							<button 
								on:click={() => showDeleteEventsConfirm = true}
								class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
							>
								Eliminar todos los eventos
							</button>
						</div>

						<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<p class="text-sm text-blue-700">
								💡 <strong>Tip:</strong> La vista seleccionada se aplicará automáticamente al abrir la sección de eventos.
							</p>
						</div>
					</div>
				</section>

				<!-- === EXTRA === -->
				<section class="bg-gray-50 rounded-xl p-6">
					<h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
						<span>⚡</span>
						<span>Extra</span>
					</h2>
					
					<div class="space-y-6">
						<!-- Acciones de cuenta - Solo si está logueado -->
						{#if $currentUser !== null}
							<div>
								<h3 class="text-lg font-semibold text-gray-800 mb-4">Acciones de cuenta</h3>
								<div class="flex flex-wrap gap-3">
									<button 
										on:click={handleLogout}
										class="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
									>
										<span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out-icon lucide-log-out"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg></span> Cerrar sesión
									</button>
									
									<button 
										disabled
										class="bg-red-300 text-white px-4 py-2 rounded-lg cursor-not-allowed opacity-60 flex items-center gap-2"
									>
										Eliminar cuenta
									</button>
								</div>
							</div>
						{/if}

						<!-- Gestión de datos - Disponible para todos -->
						<div>
							<h3 class="text-lg font-semibold text-gray-800 mb-4">Gestión de datos</h3>
							<div class="bg-red-50 border border-red-200 rounded-lg p-4">
								<p class="text-red-700 mb-3 text-sm">
									Elimina todos tus datos guardados localmente. Esto incluye cuenta, horarios, notas, eventos y configuraciones.
								</p>
								<button 
									on:click={() => showDeleteDataConfirm = true}
									class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
								>
									<span>🗑️</span> Limpiar todos los datos
								</button>
							</div>
						</div>

						<!-- Información de la app -->
						<div>
							<h3 class="text-lg font-semibold text-gray-800 mb-4">Acerca de la aplicación</h3>
							<div class="bg-white rounded-lg p-4 border border-gray-200">
								<div class="flex items-center gap-3 mb-3">
									<span class="text-3xl">🎓</span>
									<div>
										<p class="text-gray-700 font-semibold"><strong>Ramo Libre</strong> v1.0.0</p>
										<p class="text-gray-600 text-sm">Gestor académico universitario</p>
									</div>
								</div>
								<p class="text-gray-600 text-sm">
									Aplicación diseñada para ayudar a estudiantes universitarios a gestionar su información académica de manera eficiente.
								</p>
							</div>
						</div>
		</div>
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
					on:click={() => showDeleteDataConfirm = false}
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
				¿Estás seguro de que quieres eliminar todos tus eventos? Esta acción eliminará todos los eventos guardados de forma permanente y <strong>no se puede deshacer</strong>.
			</p>
			<div class="flex space-x-3">
				<button 
					on:click={deleteAllEvents}
					class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex-1 flex items-center justify-center gap-2"
				>
					<span>🗑️</span> Sí, eliminar todos
				</button>
				<button 
					on:click={() => showDeleteEventsConfirm = false}
					class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex-1"
				>
					Cancelar
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal de Sync -->
<SyncModal
	bind:isOpen={showSyncModal}
/>