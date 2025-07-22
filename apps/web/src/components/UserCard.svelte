<script lang="ts">
    import { currentUser } from '$lib/stores/user';

    let showLoginForm = false;
	let loginData = {
		name: '',
		email: '',
		university: '',
		career: ''
    };

	// Función para obtener las iniciales del usuario
	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	// Colores para el avatar
	const getAvatarColor = (name: string | any[]): string => {
		const colors = [
			'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
			'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
		];
		return colors[name.length % colors.length];
	};

    const handleLogout = () => {
        currentUser.reset();
    };

    const handleLogin = () => {
        if (!loginData.name || !loginData.email) return;
        currentUser.createUser({
            name: loginData.name,
            email: loginData.email,
            university: loginData.university || undefined,
            career: loginData.career || undefined,
            semester: undefined,
        });
    };
</script>

<div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
	{#if $currentUser !== null}
		<!-- Usuario logueado -->
		<div class="flex items-center space-x-4">
			<!-- Avatar -->
			<div class="w-16 h-16 rounded-full {getAvatarColor($currentUser.name)} flex items-center justify-center text-white font-bold text-xl">
				{getInitials($currentUser.name)}
			</div>
			
			<!-- Info del usuario -->
			<div class="flex-1">
				<h3 class="text-xl font-bold text-gray-800">{$currentUser.name}</h3>
				<p class="text-gray-600">{$currentUser.email}</p>
				{#if $currentUser.university || $currentUser.career}
					<div class="text-sm text-gray-500 mt-1">
						{#if $currentUser.career}{$currentUser.career}{/if}
						{#if $currentUser.university && $currentUser.career} - {/if}
						{#if $currentUser.university}{$currentUser.university}{/if}
					</div>
				{/if}
			</div>
			
			<!-- Botón de logout -->
			<button 
				on:click={handleLogout}
				class="text-gray-400 hover:text-red-500 transition-colors p-2"
				title="Cerrar sesión"
			>
				<span class="text-xl"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out-icon lucide-log-out"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg></span>
			</button>
		</div>
	{:else}
		<!-- Usuario no logueado -->
		{#if !showLoginForm}
			<div class="text-center">
				<div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl text-gray-400">👤</span>
				</div>
				<h3 class="text-lg font-semibold text-gray-800 mb-2">¡Bienvenido!</h3>
				<p class="text-gray-600 mb-4">Inicia sesión para personalizar tu experiencia</p>
				<button 
					on:click={() => showLoginForm = true}
					class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
				>
					Iniciar Sesión
				</button>
			</div>
		{:else}
			<!-- Formulario de login -->
			<form on:submit|preventDefault={handleLogin} class="space-y-4">
				<h3 class="text-lg font-semibold text-gray-800 mb-4">Información del Usuario</h3>
				
				<div>
					<label for="login-name" class="block text-sm font-medium text-gray-700 mb-1">
						Nombre completo *
					</label>
					<input 
						id="login-name"
						type="text" 
						bind:value={loginData.name}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Ej: Juan Pérez"
					>
				</div>
				
				<div>
					<label for="login-email" class="block text-sm font-medium text-gray-700 mb-1">
						Email *
					</label>
					<input 
						id="login-email"
						type="email" 
						bind:value={loginData.email}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Ej: juan@ejemplo.com"
					>
				</div>
				
				<div>
					<label for="login-university" class="block text-sm font-medium text-gray-700 mb-1">
						Universidad
					</label>
					<input 
						id="login-university"
						type="text" 
						bind:value={loginData.university}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Ej: Universidad de Chile"
					>
				</div>
				
				<div>
					<label for="login-career" class="block text-sm font-medium text-gray-700 mb-1">
						Carrera
					</label>
					<input 
						id="login-career"
						type="text" 
						bind:value={loginData.career}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Ej: Ingeniería Informática"
					>
				</div>
				
				<div class="flex space-x-3 pt-2">
					<button 
						type="submit"
						class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
					>
						Guardar
					</button>
					<button 
						type="button"
						on:click={() => showLoginForm = false}
						class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-colors"
					>
						Cancelar
					</button>
				</div>
			</form>
		{/if}
	{/if}
</div>
