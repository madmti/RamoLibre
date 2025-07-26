<script lang="ts">
	import { cloudSession } from '$lib/stores/cloud';
	import { currentUser } from '$lib/stores/user';
	import { currentSchedules } from '$lib/stores/schedule';
	import { currentSubjects } from '$lib/stores/subject';
	import { currentSubjectGradeConfigs } from '$lib/stores/config';
	import { currentCategories } from '$lib/stores/categories';
	import { currentGrades } from '$lib/stores/grades';
	import { userPreferences } from '$lib/stores/preferences';
	import { currentEvents } from '$lib/stores/events';
	import CloudUserCard from '$components/CloudUserCard.svelte';
	import type { Session, Provider } from '@supabase/supabase-js';

	// ICONS
	import LogoutIcon from '$embedded-icons/logout.svg?component';
	import UploadIcon from '$embedded-icons/upload.svg?component';
	import DownloadIcon from '$embedded-icons/download.svg?component';
	import TrashIcon from '$embedded-icons/trash.svg?component';

	export let isOpen = false;

	let currentSession: Session | null = null;
	let loading = false;
	let error = '';

	// Suscribirse a la sesión de cloud
	$: currentSession = $cloudSession;

	function handleBackdropClick(event: MouseEvent) {
		if ((event.target as HTMLElement).classList.contains('backdrop')) {
			isOpen = false;
		}
	}

	async function signIn(provider: Provider) {
		loading = true;
		error = '';
		try {
			await cloudSession.signIn(provider);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al iniciar sesión';
		} finally {
			loading = false;
		}
	}

	async function signOut() {
		loading = true;
		error = '';
		try {
			await cloudSession.signOut();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al cerrar sesión';
		} finally {
			loading = false;
		}
	}

	async function pushData() {
		loading = true;
		error = '';
		try {
			// Aquí puedes pasar los datos del usuario actual
			if (!$currentUser) {
				throw new Error('No hay usuario local para sincronizar');
			}
			await cloudSession.push({
				user: $currentUser,
				schedule: $currentSchedules,
				subjects: $currentSubjects,
				subjectGradeConfigs: $currentSubjectGradeConfigs,
				gradeCategories: $currentCategories,
				grades: $currentGrades,
				preferences: $userPreferences,
				events: $currentEvents,
			});
			alert('Datos sincronizados exitosamente');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al sincronizar datos';
		} finally {
			loading = false;
		}
	}

	async function pullData() {
		loading = true;
		error = '';
		try {
			const { data } = await cloudSession.pull();
			if (!data || !data.profile) {
				throw new Error('No se encontraron datos en la nube');
			}
			const profile = data.profile;
			currentUser.set(profile.user);
			currentSchedules.set(profile.schedule);
			currentSubjects.set(profile.subjects);
			currentSubjectGradeConfigs.set(profile.subjectGradeConfigs);
			currentCategories.set(profile.gradeCategories);
			currentGrades.set(profile.grades);
			userPreferences.set(profile.preferences);
			currentEvents.set(profile.events);
			alert('Datos descargados exitosamente');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al descargar datos';
		} finally {
			loading = false;
		}
	}

	async function forgetData() {
		if (
			confirm(
				'¿Estás seguro de que quieres eliminar todos tus datos de la nube? Esta acción no se puede deshacer.'
			)
		) {
			loading = true;
			error = '';
			try {
				await cloudSession.forget();
				alert('Datos eliminados de la nube');
			} catch (err) {
				error = err instanceof Error ? err.message : 'Error al eliminar datos';
			} finally {
				loading = false;
			}
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop"
		on:click={handleBackdropClick}
	>
		<div
			class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-100"
			on:click|stopPropagation
		>
			<h2 class="text-2xl font-bold mb-6 text-gray-800 text-center">
				Sincronización en la Nube
			</h2>

			{#if error}
				<div
					class="mb-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg"
				>
					<div class="flex items-center gap-2">
						<svg
							class="w-5 h-5 text-red-600 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<span class="text-red-800 text-sm">{error}</span>
					</div>
				</div>
			{/if}

			{#if !currentSession}
				<!-- Estado: No autenticado -->
				<div class="text-center">
					<p class="text-gray-600 mb-6">
						Conecta tu cuenta para sincronizar tus datos en la nube
					</p>

					{#if loading}
						<!-- Loader para autenticación -->
						<div class="flex flex-col items-center justify-center py-8">
							<div
								class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"
							></div>
							<p class="text-gray-600 font-medium">Conectando...</p>
						</div>
					{:else}
						<div class="space-y-3">
							<button
								class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
								on:click={() => signIn('google')}
								disabled={loading}
							>
								<svg class="w-5 h-5" viewBox="0 0 24 24">
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								<span class="font-medium"
									>{loading ? 'Conectando...' : 'Continuar con Google'}</span
								>
							</button>

							<button
								class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all duration-200 shadow-sm"
								on:click={() => signIn('github')}
							>
								<svg class="w-5 h-5 fill-white" viewBox="0 0 24 24">
									<path
										d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
									/>
								</svg>
								<span class="font-medium">Continuar con GitHub</span>
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Estado: Autenticado -->
				<div class="text-center">
					<CloudUserCard session={currentSession} />

					{#if loading}
						<!-- Loader para operaciones de sincronización -->
						<div class="flex flex-col items-center justify-center py-8">
							<div
								class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"
							></div>
							<p class="text-gray-600 font-medium">Procesando...</p>
						</div>
					{:else}
						<div class="space-y-3">
							<button
								class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
								on:click={pushData}
							>
								<span class="font-medium flex items-center">
									<UploadIcon class="inline w-5 h-5 mr-2" />
									Subir datos a la nube</span
								>
							</button>

							<button
								class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
								on:click={pullData}
							>
								<span class="font-medium flex items-center">
									<DownloadIcon class="inline w-5 h-5 mr-2" />
									Descargar datos de la nube</span
								>
							</button>

							<button
								class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
								on:click={forgetData}
							>
								<TrashIcon class="inline w-5 h-5" />
								<span class="font-medium">Eliminar datos de la nube</span>
							</button>

							<div class="border-t border-gray-200 my-4"></div>

							<button
								class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
								on:click={signOut}
							>
								<LogoutIcon class="inline w-5 h-5" />
								<span class="font-medium">Desconectar cuenta</span>
							</button>
						</div>
					{/if}
				</div>
			{/if}

			<div class="mt-6 text-center">
				<button
					class="px-6 py-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 font-medium"
					on:click={() => {
						isOpen = false;
					}}>Cerrar</button
				>
			</div>
		</div>
	</div>
{/if}
