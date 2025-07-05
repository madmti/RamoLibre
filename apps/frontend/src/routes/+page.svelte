<script>
	import { APP_NAME, VERSION } from '$lib';
	import UserCard from '$lib/components/UserCard.svelte';
</script>

<svelte:head>
	<title>{APP_NAME}</title>
	<meta name="description" content="Aplicación web ligera para estudiantes universitarios" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Grid principal -->
	<div class="grid lg:grid-cols-3 gap-8">
		<!-- Columna principal -->
		<div class="lg:col-span-2 space-y-8">
			<!-- Bienvenida -->
			<div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-8">
				<h2 class="text-3xl font-bold text-gray-800 mb-4">¡Bienvenido a {APP_NAME}!</h2>
				<p class="text-gray-600 mb-4">Tu aplicación web ligera y rápida para organizar tu vida académica.</p>
				<div class="flex items-center space-x-4">
					<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
						✅ Online
					</span>
					<span class="text-sm text-gray-500">Versión {VERSION}</span>
				</div>
			</div>

			<!-- Accesos rápidos -->
			<div class="grid md:grid-cols-2 gap-6">
				<!-- Horarios -->
				<a href="/horario" class="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50 hover:shadow-lg hover:border-blue-300/50 transition-all group">
					<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
						<span class="text-2xl">📅</span>
					</div>
					<h3 class="font-semibold text-gray-800 mb-2">Horario</h3>
					<p class="text-sm text-gray-600">Organiza tus clases y horarios académicos</p>
				</a>

				<!-- Notas -->
				<a href="/notas" class="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-green-200/50 hover:shadow-lg hover:border-green-300/50 transition-all group">
					<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
						<span class="text-2xl">📊</span>
					</div>
					<h3 class="font-semibold text-gray-800 mb-2">Notas</h3>
					<p class="text-sm text-gray-600">Lleva seguimiento de tus calificaciones</p>
				</a>

				<!-- Eventos -->
				<a href="/eventos" class="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 hover:shadow-lg hover:border-purple-300/50 transition-all group">
					<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
						<span class="text-2xl">🎯</span>
					</div>
					<h3 class="font-semibold text-gray-800 mb-2">Eventos</h3>
					<p class="text-sm text-gray-600">Mantente al día con fechas importantes</p>
				</a>

				<!-- Configuración -->
				<a href="/configuracion" class="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:shadow-lg hover:border-gray-300/50 transition-all group">
					<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
						<span class="text-2xl">⚙️</span>
					</div>
					<h3 class="font-semibold text-gray-800 mb-2">Configuración</h3>
					<p class="text-sm text-gray-600">Personaliza tu experiencia</p>
				</a>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Tarjeta de usuario -->
			<UserCard />

			<!-- Estado de la aplicación -->
			<div class="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
				<h3 class="font-semibold text-gray-800 mb-4">Características</h3>
				<div class="space-y-3">
					<div class="flex items-center space-x-3">
						<span class="text-green-500">🚀</span>
						<span class="text-sm text-gray-600">Performance-first</span>
					</div>
					<div class="flex items-center space-x-3">
						<span class="text-blue-500">📱</span>
						<span class="text-sm text-gray-600">Offline-friendly</span>
					</div>
					<div class="flex items-center space-x-3">
						<span class="text-purple-500">🔒</span>
						<span class="text-sm text-gray-600">Privacidad y control</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
