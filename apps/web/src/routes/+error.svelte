<script>
	import { APP_NAME } from '$lib';
	
	const pageTitle = `Página no encontrada - ${APP_NAME}`;
	const pageDescription = 'La página que buscas no existe. Explora las funcionalidades de Ramo Libre para gestionar tu vida académica universitaria.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="robots" content="noindex, follow" />
	
	<!-- Open Graph -->
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	
	<!-- Twitter Card -->
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
</svelte:head>

<div class="container mx-auto px-4 py-16">
	<div class="max-w-2xl mx-auto text-center">
		<!-- Error 404 -->
		<div class="mb-8">
			<h1 class="text-9xl font-bold text-gray-200 mb-4">404</h1>
			<h2 class="text-3xl font-bold text-gray-800 mb-4">Página no encontrada</h2>
			<p class="text-lg text-gray-600 mb-8">
				Lo sentimos, la página que buscas no existe o ha sido movida.
			</p>
		</div>

		<!-- Sugerencias de navegación -->
		<div class="bg-white/90 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 mb-8">
			<h3 class="text-xl font-semibold text-gray-800 mb-6">¿Qué puedes hacer?</h3>
			
			<div class="grid md:grid-cols-2 gap-4">
				<a href="/" class="flex items-center p-4 border border-blue-200/50 rounded-lg hover:shadow-lg hover:border-blue-300/50 transition-all group">
					<span class="text-2xl mr-3" role="img" aria-label="Inicio">🏠</span>
					<div class="text-left">
						<div class="font-medium text-gray-800">Ir al Inicio</div>
						<div class="text-sm text-gray-600">Página principal de {APP_NAME}</div>
					</div>
				</a>

				<a href="/horario" class="flex items-center p-4 border border-green-200/50 rounded-lg hover:shadow-lg hover:border-green-300/50 transition-all group">
					<span class="text-2xl mr-3" role="img" aria-label="Horarios">📅</span>
					<div class="text-left">
						<div class="font-medium text-gray-800">Ver Horarios</div>
						<div class="text-sm text-gray-600">Gestiona tus clases</div>
					</div>
				</a>

				<a href="/notas" class="flex items-center p-4 border border-purple-200/50 rounded-lg hover:shadow-lg hover:border-purple-300/50 transition-all group">
					<span class="text-2xl mr-3" role="img" aria-label="Notas">📊</span>
					<div class="text-left">
						<div class="font-medium text-gray-800">Ver Notas</div>
						<div class="text-sm text-gray-600">Revisa tus calificaciones</div>
					</div>
				</a>

				<a href="/eventos" class="flex items-center p-4 border border-orange-200/50 rounded-lg hover:shadow-lg hover:border-orange-300/50 transition-all group">
					<span class="text-2xl mr-3" role="img" aria-label="Eventos">🎯</span>
					<div class="text-left">
						<div class="font-medium text-gray-800">Ver Eventos</div>
						<div class="text-sm text-gray-600">Fechas importantes</div>
					</div>
				</a>
			</div>
		</div>

		<!-- Contacto o ayuda -->
		<div class="text-center">
			<p class="text-gray-600 mb-4">
				Si crees que esto es un error, puedes reportarlo o buscar ayuda.
			</p>
			<div class="flex justify-center space-x-4">
				<button 
					on:click={() => history.back()}
					class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
				>
					← Volver atrás
				</button>
				<a 
					href="/" 
					class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Ir al inicio
				</a>
			</div>
		</div>
	</div>
</div>
