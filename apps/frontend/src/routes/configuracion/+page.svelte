<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser, userPreferences, userService, isLoggedIn } from '$lib/stores/user';
	import { eventsStore } from '$lib/stores/events';
	import type { User, UserPreferences } from '@ramo-libre/shared';
	
	let user: User | null = null;
	let preferences: UserPreferences;
	let editingAccount = false;
	let tempUserData: Partial<User> = {};
	let showDeleteConfirm = false;
	let showDeleteEventsConfirm = false;

	// Suscribirse a los stores
	onMount(() => {
		const unsubscribeUser = currentUser.subscribe(value => {
			user = value;
			if (value) {
				tempUserData = { ...value };
			}
		});
		
		const unsubscribePrefs = userPreferences.subscribe(value => {
			preferences = value;
		});

		return () => {
			unsubscribeUser();
			unsubscribePrefs();
		};
	});

	// Función para guardar cambios en la cuenta
	const saveAccountChanges = () => {
		if (user && tempUserData.name && tempUserData.email) {
			const updatedUser: User = {
				...user,
				...tempUserData,
				updatedAt: new Date().toISOString()
			};
			userService.saveUser(updatedUser);
			editingAccount = false;
		}
	};

	// Función para cancelar edición
	const cancelEdit = () => {
		if (user) {
			tempUserData = { ...user };
		}
		editingAccount = false;
	};

	// Función para actualizar preferencias
	const updatePreference = (key: keyof UserPreferences, value: any) => {
		userService.savePreferences({ [key]: value });
	};

	// Función para cerrar sesión
	const handleLogout = () => {
		userService.logout();
		window.location.href = '/';
	};

	// Función para eliminar cuenta
	const deleteAccount = () => {
		userService.logout();
		showDeleteConfirm = false;
		window.location.href = '/';
	};

	// Función para eliminar todos los eventos
	const deleteAllEvents = () => {
		eventsStore.clearAllEvents();
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
		
		{#if !$isLoggedIn}
			<!-- Usuario no logueado -->
			<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
				<span class="text-4xl">👤</span>
				<h2 class="text-xl font-semibold text-yellow-800 mt-2 mb-2">Inicia sesión para configurar tu cuenta</h2>
				<p class="text-yellow-700 mb-4">Necesitas estar logueado para acceder a las configuraciones.</p>
				<a href="/" class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
					Ir al inicio
				</a>
			</div>
		{:else}
			<!-- Configuraciones -->
			<div class="space-y-8">
				
				<!-- === CUENTA === -->
				<section class="bg-gray-50 rounded-xl p-6">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-2xl font-bold text-gray-800 flex items-center space-x-2">
							<span>👤</span>
							<span>Cuenta</span>
						</h2>
						{#if !editingAccount}
							<button 
								on:click={() => editingAccount = true}
								class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
							>
								✏️ Editar
							</button>
						{/if}
					</div>

					{#if user}
						<div class="grid md:grid-cols-2 gap-6">
							<!-- Información básica -->
							<div class="space-y-4">
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
									{#if editingAccount}
										<input 
											type="text" 
											bind:value={tempUserData.name}
											class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											placeholder="Tu nombre completo"
										/>
									{:else}
										<p class="text-gray-900 py-2">{user.name}</p>
									{/if}
								</div>

								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
									{#if editingAccount}
										<input 
											type="email" 
											bind:value={tempUserData.email}
											class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											placeholder="tu@email.com"
										/>
									{:else}
										<p class="text-gray-900 py-2">{user.email}</p>
									{/if}
								</div>

								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Universidad</label>
									{#if editingAccount}
										<input 
											type="text" 
											bind:value={tempUserData.university}
											class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											placeholder="Universidad (opcional)"
										/>
									{:else}
										<p class="text-gray-900 py-2">{user.university || 'No especificada'}</p>
									{/if}
								</div>
							</div>

							<!-- Información académica -->
							<div class="space-y-4">
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
									{#if editingAccount}
										<input 
											type="text" 
											bind:value={tempUserData.career}
											class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											placeholder="Tu carrera (opcional)"
										/>
									{:else}
										<p class="text-gray-900 py-2">{user.career || 'No especificada'}</p>
									{/if}
								</div>

								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
									{#if editingAccount}
										<input 
											type="number" 
											bind:value={tempUserData.semester}
											min="1" 
											max="12"
											class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											placeholder="Semestre actual"
										/>
									{:else}
										<p class="text-gray-900 py-2">{user.semester || 'No especificado'}</p>
									{/if}
								</div>

								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">Miembro desde</label>
									<p class="text-gray-600 py-2">
										{new Date(user.createdAt).toLocaleDateString('es-ES', { 
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
									✅ Guardar cambios
								</button>
								<button 
									on:click={cancelEdit}
									class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
								>
									❌ Cancelar
								</button>
							</div>
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
							<label class="block text-sm font-medium text-gray-700 mb-3">Vista preferida del horario</label>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								<!-- Vista Lista -->
								<label class="relative cursor-pointer">
									<input 
										type="radio" 
										name="scheduleView"
										value="list"
										checked={preferences?.scheduleView === 'list'}
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
								<label class="relative cursor-pointer">
									<input 
										type="radio" 
										name="scheduleView"
										value="grid"
										checked={preferences?.scheduleView === 'grid'}
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
								<label class="relative cursor-pointer">
									<input 
										type="radio" 
										name="scheduleView"
										value="cards"
										checked={preferences?.scheduleView === 'cards'}
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
					<div class="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
						<span class="text-2xl">🚧</span>
						<p class="text-gray-700 mt-2">Configuraciones de notas próximamente...</p>
						<p class="text-sm text-gray-500 mt-1">Esta sección estará disponible en futuras actualizaciones.</p>
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
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-3">Vista preferida de eventos</label>
							<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
								<!-- Vista Calendario -->
								<label class="relative cursor-pointer">
									<input 
										type="radio" 
										name="eventsView"
										value="calendar"
										checked={preferences?.eventsView === 'calendar'}
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
								<label class="relative cursor-pointer">
									<input 
										type="radio" 
										name="eventsView"
										value="list"
										checked={preferences?.eventsView === 'list'}
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
								<label class="relative cursor-pointer">
									<input 
										type="radio" 
										name="eventsView"
										value="kanban"
										checked={preferences?.eventsView === 'kanban'}
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
								<label class="relative cursor-pointer">
									<input 
										type="radio" 
										name="eventsView"
										value="timeline"
										checked={preferences?.eventsView === 'timeline'}
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
						</div>

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
								<span>🗑️</span> Eliminar todos los eventos
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
						<!-- Acciones de cuenta -->
						<div>
							<h3 class="text-lg font-semibold text-gray-800 mb-4">Acciones de cuenta</h3>
							<div class="flex flex-wrap gap-3">
								<button 
									on:click={handleLogout}
									class="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
								>
									<span>🚪</span> Cerrar sesión
								</button>
								
								<button 
									on:click={() => showDeleteConfirm = true}
									class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
								>
									<span>⚠️</span> Eliminar cuenta
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
									Desarrollado con ❤️ para estudiantes universitarios que buscan organizar mejor su vida académica.
								</p>
							</div>
						</div>
					</div>
				</section>

			</div>
		{/if}
	</div>
</div>

<!-- Modal de confirmación para eliminar cuenta -->
{#if showDeleteConfirm}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
			<div class="text-center mb-4">
				<span class="text-4xl">⚠️</span>
				<h3 class="text-xl font-bold text-red-600 mt-2">Eliminar cuenta</h3>
			</div>
			<p class="text-gray-700 mb-6 text-center">
				¿Estás seguro de que quieres eliminar tu cuenta? Esta acción eliminará todos tus datos de forma permanente y <strong>no se puede deshacer</strong>.
			</p>
			<div class="flex space-x-3">
				<button 
					on:click={deleteAccount}
					class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex-1 flex items-center justify-center gap-2"
				>
					<span>🗑️</span> Sí, eliminar
				</button>
				<button 
					on:click={() => showDeleteConfirm = false}
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