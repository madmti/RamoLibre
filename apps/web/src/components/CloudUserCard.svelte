<script lang="ts">
	import type { Session } from '@supabase/supabase-js';

	export let session: Session;

	// Extraer datos del usuario
	$: userEmail = session.user?.email || '';
	$: userName = session.user?.user_metadata?.name || 
				  session.user?.user_metadata?.full_name || 
				  session.user?.identities?.[0]?.identity_data?.name || '';
	$: userAvatar = session.user?.identities?.[0]?.identity_data?.picture || 
					session.user?.user_metadata?.picture || 
					session.user?.user_metadata?.avatar_url || '';
	$: provider = session.user?.identities?.[0]?.provider || 'unknown';

	// Función para obtener las iniciales del nombre o email
	function getInitials(name: string, email: string): string {
		if (name && name.trim()) {
			return name.split(' ')
				.filter(n => n.length > 0)
				.map(n => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2);
		}
		if (email) {
			return email.slice(0, 2).toUpperCase();
		}
		return 'U';
	}

	// Función para obtener el color del provider
	function getProviderColor(provider: string): string {
		switch (provider) {
			case 'google':
				return 'border-red-200 bg-red-50';
			case 'github':
				return 'border-gray-300 bg-gray-50';
			case 'microsoft':
				return 'border-blue-200 bg-blue-50';
			default:
				return 'border-emerald-200 bg-emerald-50';
		}
	}
</script>

<div class="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
	<div class="flex items-center gap-3">
		<!-- Avatar o iniciales -->
		<div class="relative">
			{#if userAvatar}
				<img 
					src={userAvatar} 
					alt="Avatar de {userName || userEmail}"
					class="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
					loading="lazy"
					on:error={() => {
						// Fallback manejado por el bloque else
					}}
				/>
			{:else}
				<div class="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm ring-2 ring-white shadow-sm">
					{getInitials(userName, userEmail)}
				</div>
			{/if}
		</div>

        <!-- Información del usuario -->
		<div class="flex-1 min-w-0">
            <div class="flex flex-col items-start">
                {#if userName && userName.trim()}
                    <p class="font-semibold text-emerald-800 truncate text-sm">
                        {userName}
                    </p>
                    <p class="text-emerald-600 text-xs truncate">
                        {userEmail}
                    </p>
                {:else}
                    <p class="font-semibold text-emerald-800 truncate text-sm">
                        {userEmail}
                    </p>
                {/if}
            </div>
			
			<!-- Provider info -->
			<div class="flex items-center gap-1 mt-1">
				<div class="w-2 h-2 rounded-full bg-emerald-500"></div>
				<span class="text-emerald-600 text-xs capitalize">
					Conectado via {provider}
				</span>
			</div>
		</div>

		<!-- Icono de verificado -->
		<div class="flex-shrink-0">
			<svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
		</div>
	</div>
</div>
