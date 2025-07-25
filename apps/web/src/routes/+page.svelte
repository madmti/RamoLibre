<script>
	import { APP_NAME, VERSION } from '$lib';
	import UserCard from '$components/UserCard.svelte';

	// ICONS
	import CheckMarkIcon from '$embedded-icons/check-mark.svg?component';
	import MobileIcon from '$embedded-icons/mobile.svg?component';
	import SecureIcon from '$embedded-icons/secure.svg?component';
	import RocketIcon from '$embedded-icons/rocket.svg?component';
	import ColChartIcon from '$embedded-icons/col-chart.svg?component';
	import UpTrendIcon from '$embedded-icons/up-trend.svg?component';
	import CalendarCheckIcon from '$embedded-icons/calendar-check.svg?component';
	import CalendarIcon from '$embedded-icons/calendar.svg?component';
	import ConfigIcon from '$embedded-icons/config.svg?component';
	import SparkleIcon from '$embedded-icons/sparkle.svg?component';
	import SparklesIcon from '$embedded-icons/sparkles.svg?component';
	import SavingsIcon from '$embedded-icons/savings.svg?component';
	import ZapIcon from '$embedded-icons/zap.svg?component';
	import HatIcon from '$embedded-icons/hat.svg?component';

	// SEO Data
	const pageTitle = `${APP_NAME} - Organiza tu vida académica universitaria`;
	const pageDescription =
		'Aplicación web gratuita y ligera para estudiantes universitarios. Gestiona horarios, calificaciones y eventos académicos. Funciona offline con datos seguros.';
	const keywords =
		'estudiantes universitarios, gestión académica, horarios universidad, calificaciones, notas, eventos académicos, organización estudiantil, app educativa';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="keywords" content={keywords} />

	<!-- Open Graph -->
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content="/" />
	<meta property="og:image" content="/favicon.svg" />

	<!-- Twitter Card -->
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content="/favicon.svg" />

	<!-- Canonical URL -->
	<link rel="canonical" href="/" />

	<!-- Schema.org structured data -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"name": "{pageTitle}",
			"description": "{pageDescription}",
			"url": "/",
			"mainEntity": {
				"@type": "SoftwareApplication",
				"name": "{APP_NAME}",
				"applicationCategory": "EducationalApplication",
				"operatingSystem": "Web Browser",
				"description": "{pageDescription}",
				"featureList": [
					"Gestión de horarios académicos",
					"Seguimiento de calificaciones y notas",
					"Organización de eventos y fechas importantes",
					"Configuración personalizable",
					"Funcionamiento offline",
					"Interfaz optimizada para móviles"
				],
				"offers": {
					"@type": "Offer",
					"price": "0",
					"priceCurrency": "EUR"
				}
			}
		}
	</script>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
	<!-- Hero Section mejorado -->
	<header
		class="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"
	>
		<!-- Decoración de fondo -->
		<div class="absolute inset-0 bg-black/10"></div>

		<div class="relative container mx-auto px-4 py-16 lg:py-24">
			<div class="text-center text-white">
				<div class="mb-6">
					<span class="inline-block text-6xl lg:text-7xl mb-4 animate-bounce">
						<HatIcon class="w-20 h-20 lg:w-24 lg:h-24" />
					</span>
				</div>
				<h1 class="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
					<span
						class="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
					>
						{APP_NAME}
					</span>
				</h1>
				<p class="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto mb-8 leading-relaxed">
					La aplicación web <span class="text-white font-semibold">gratuita y ligera</span
					> que ayuda a estudiantes universitarios a gestionar horarios, calificaciones y eventos
					académicos.
				</p>

				<!-- Badges mejorados -->
				<div class="flex flex-wrap justify-center items-center gap-4 mb-10">
					<div
						class="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
					>
						<span class="text-green-400">
							<CheckMarkIcon class="w-4 h-4" />
						</span>
						<span class="text-sm font-medium">Gratis y sin registro</span>
					</div>
					<div
						class="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
					>
						<span class="text-blue-400">
							<MobileIcon class="w-4 h-4" />
						</span>
						<span class="text-sm font-medium">Funciona offline</span>
					</div>
					<div
						class="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
					>
						<span class="text-purple-400">
							<SecureIcon class="w-4 h-4" />
						</span>
						<span class="text-sm font-medium">Datos seguros</span>
					</div>
					<div class="text-blue-200 text-sm">v{VERSION}</div>
				</div>

				<!-- CTA Principal -->
				<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<a
						href="/horario"
						class="group relative inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
					>
						<span class="mr-2">
							<RocketIcon class="w-5 h-5" />
						</span>
						Comenzar ahora
						<span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
					</a>
					<a
						href="/#funcionalidades"
						class="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
					>
						<span class="mr-2">
							<ColChartIcon class="w-5 h-5" />
						</span>
						Ver funcionalidades
					</a>
				</div>
			</div>
		</div>

		<!-- Wave divisor -->
		<div class="absolute bottom-[-1px] left-0 right-0 overflow-hidden">
			<svg
				viewBox="0 0 1440 120"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="w-full h-8 sm:h-12 lg:h-20"
				preserveAspectRatio="none"
			>
				<path
					d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
					fill="rgb(248 250 252)"
				/>
			</svg>
		</div>
	</header>

	<!-- Contenido principal -->
	<main class="container mx-auto px-4 py-16">
		<!-- Funcionalidades principales rediseñadas -->
		<section id="funcionalidades" class="mb-20">
			<div class="text-center mb-12">
				<h2 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
					Todo lo que necesitas para tu vida académica
				</h2>
				<p class="text-xl text-gray-600 max-w-3xl mx-auto">
					Herramientas poderosas y fáciles de usar diseñadas específicamente para
					estudiantes universitarios
				</p>
			</div>

			<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
				<!-- Horarios -->
				<article class="group">
					<a href="/horario" class="block h-full">
						<div
							class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2 h-full"
						>
							<div
								class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
							>
								<span
									class="text-2xl text-white"
									role="img"
									aria-label="Calendario"
								>
									<CalendarCheckIcon class="w-6 h-6" />
								</span>
							</div>
							<h3 class="text-xl font-bold text-gray-800 mb-3">
								Gestión de Horarios
							</h3>
							<p class="text-gray-600 leading-relaxed">
								Organiza y visualiza tus clases, horarios académicos y
								disponibilidad semanal de manera intuitiva.
							</p>
							<div class="mt-6 flex items-center text-blue-600 font-medium">
								<span>Explorar</span>
								<span class="ml-2 group-hover:translate-x-1 transition-transform"
									>→</span
								>
							</div>
						</div>
					</a>
				</article>

				<!-- Notas -->
				<article class="group">
					<a href="/notas" class="block h-full">
						<div
							class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-green-200 transition-all duration-300 transform hover:-translate-y-2 h-full"
						>
							<div
								class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
							>
								<span class="text-2xl text-white" role="img" aria-label="Gráfico">
									<UpTrendIcon class="w-6 h-6" />
								</span>
							</div>
							<h3 class="text-xl font-bold text-gray-800 mb-3">
								Seguimiento de Calificaciones
							</h3>
							<p class="text-gray-600 leading-relaxed">
								Lleva control detallado de tus notas, calcula promedios y visualiza
								tu progreso académico.
							</p>
							<div class="mt-6 flex items-center text-green-600 font-medium">
								<span>Explorar</span>
								<span class="ml-2 group-hover:translate-x-1 transition-transform"
									>→</span
								>
							</div>
						</div>
					</a>
				</article>

				<!-- Eventos -->
				<article class="group">
					<a href="/eventos" class="block h-full">
						<div
							class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-2 h-full"
						>
							<div
								class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
							>
								<span class="text-2xl text-white" role="img" aria-label="Objetivo">
									<CalendarIcon class="w-6 h-6" />
								</span>
							</div>
							<h3 class="text-xl font-bold text-gray-800 mb-3">Eventos Académicos</h3>
							<p class="text-gray-600 leading-relaxed">
								Mantente al día con exámenes, entregas, presentaciones y fechas
								importantes del calendario académico.
							</p>
							<div class="mt-6 flex items-center text-purple-600 font-medium">
								<span>Explorar</span>
								<span class="ml-2 group-hover:translate-x-1 transition-transform"
									>→</span
								>
							</div>
						</div>
					</a>
				</article>

				<!-- Configuración -->
				<article class="group">
					<a href="/configuracion" class="block h-full">
						<div
							class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-2 h-full"
						>
							<div
								class="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
							>
								<span
									class="text-2xl text-white"
									role="img"
									aria-label="Configuración"
								>
									<ConfigIcon class="w-6 h-6" />
								</span>
							</div>
							<h3 class="text-xl font-bold text-gray-800 mb-3">Personalización</h3>
							<p class="text-gray-600 leading-relaxed">
								Adapta la aplicación a tus necesidades con opciones de configuración
								flexibles y personalizables.
							</p>
							<div class="mt-6 flex items-center text-gray-600 font-medium">
								<span>Explorar</span>
								<span class="ml-2 group-hover:translate-x-1 transition-transform"
									>→</span
								>
							</div>
						</div>
					</a>
				</article>
			</div>
		</section>

		<!-- Grid principal con sidebar mejorado y balanceado -->
		<div class="grid lg:grid-cols-5 gap-12">
			<!-- Sección de características - Ocupa 3 columnas -->
			<div class="lg:col-span-3 space-y-8">
				<section class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
					<h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
						<span class="mr-3">
							<SparklesIcon class="w-6 h-6 text-yellow-500" />
						</span>
						¿Por qué elegir Ramo Libre?
					</h2>
					<div class="grid md:grid-cols-1 gap-6">
						<div class="flex items-start space-x-4">
							<div
								class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0"
							>
								<span class="text-green-600 text-2xl">
									<RocketIcon class="w-6 h-6" />
								</span>
							</div>
							<div>
								<h3 class="font-semibold text-gray-800 mb-2 text-lg">
									Rendimiento Optimizado
								</h3>
								<p class="text-gray-600">
									Carga ultrarrápida y experiencia fluida en cualquier
									dispositivo. Diseñado para ser eficiente y ligero.
								</p>
							</div>
						</div>

						<div class="flex items-start space-x-4">
							<div
								class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0"
							>
								<span class="text-blue-600 text-2xl">
									<MobileIcon class="w-6 h-6" />
								</span>
							</div>
							<div>
								<h3 class="font-semibold text-gray-800 mb-2 text-lg">
									Funciona Offline
								</h3>
								<p class="text-gray-600">
									Accede a tus datos sin conexión a internet. Todos tus horarios y
									notas siempre disponibles.
								</p>
							</div>
						</div>

						<div class="flex items-start space-x-4">
							<div
								class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0"
							>
								<span class="text-purple-600 text-2xl">
									<SecureIcon class="w-6 h-6" />
								</span>
							</div>
							<div>
								<h3 class="font-semibold text-gray-800 mb-2 text-lg">
									Datos Seguros
								</h3>
								<p class="text-gray-600">
									Tus datos están protegidos con las mejores prácticas de
									seguridad. Siempre tienes control total sobre tu información.
								</p>
							</div>
						</div>

						<div class="flex items-start space-x-4">
							<div
								class="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0"
							>
								<span class="text-orange-600 text-2xl">
									<SavingsIcon class="w-6 h-6" />
								</span>
							</div>
							<div>
								<h3 class="font-semibold text-gray-800 mb-2 text-lg">
									Completamente Gratuito
								</h3>
								<p class="text-gray-600">
									Sin suscripciones, sin anuncios, sin restricciones. Toda la
									funcionalidad sin costo alguno.
								</p>
							</div>
						</div>
					</div>
				</section>

				<!-- Stats mejorados -->
				<section class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
					<h3
						class="font-bold text-gray-800 mb-6 text-center text-lg flex items-center justify-center"
					>
						<span class="mr-2">
							<SparkleIcon class="w-6 h-6 text-yellow-500" />
						</span>
						En números
					</h3>
					<div class="grid grid-cols-2 gap-6">
						<div class="text-center p-4 bg-blue-50 rounded-xl">
							<div class="text-3xl font-bold text-blue-600 mb-1">100%</div>
							<div class="text-sm text-gray-600 font-medium">Gratuito</div>
							<div class="text-xs text-gray-500 mt-1">Para siempre</div>
						</div>
						<div class="text-center p-4 bg-green-50 rounded-xl">
							<div class="text-3xl font-bold text-green-600 mb-1">0</div>
							<div class="text-sm text-gray-600 font-medium">Anuncios</div>
							<div class="text-xs text-gray-500 mt-1">Experiencia limpia</div>
						</div>
						<div class="text-center p-4 bg-purple-50 rounded-xl">
							<div class="text-3xl font-bold text-purple-600 mb-1">∞</div>
							<div class="text-sm text-gray-600 font-medium">Uso ilimitado</div>
							<div class="text-xs text-gray-500 mt-1">Sin restricciones</div>
						</div>
						<div class="text-center p-4 bg-orange-50 rounded-xl">
							<div class="text-3xl font-bold text-orange-600 mb-1">24/7</div>
							<div class="text-sm text-gray-600 font-medium">Disponible</div>
							<div class="text-xs text-gray-500 mt-1">Acceso completo</div>
						</div>
					</div>
				</section>
			</div>

			<!-- Sidebar balanceado - Ocupa 2 columnas -->
			<aside id="usercard" class="lg:col-span-2 space-y-8">
				<!-- Tarjeta de usuario expandida -->
				<div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
					<UserCard />
				</div>

				<!-- CTA Section mejorado -->
				<section
					class="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl p-8 text-white"
				>
					<div class="absolute inset-0 bg-black/10"></div>
					<div
						class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
					></div>
					<div
						class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"
					></div>
					<div class="relative">
						<div class="text-center mb-6">
							<span
								class="text-4xl mb-4 block animate-pulse flex w-full justify-center"
							>
								<SparklesIcon class="w-8 h-8" />
							</span>
							<h3 class="text-xl font-bold mb-2">¡Comienza tu organización!</h3>
							<p class="text-blue-100 leading-relaxed">
								No necesitas registro. Empieza a organizar tu vida académica de
								inmediato.
							</p>
						</div>
						<div class="space-y-3">
							<a
								href="/horario"
								class="flex items-center justify-center w-full text-center px-6 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
							>
								<span class="mr-2">
									<CalendarCheckIcon class="w-5 h-5" />
								</span>
								Crear mi primer horario
							</a>
							<a
								href="/notas"
								class="flex items-center justify-center w-full text-center px-6 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
							>
								<span class="mr-2">
									<UpTrendIcon class="w-5 h-5" />
								</span>
								Gestionar mis notas
							</a>
						</div>
					</div>
				</section>

				<!-- Nueva sección de inicio rápido -->
				<section
					class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200"
				>
					<h3 class="font-bold text-gray-800 mb-4 flex items-center">
						<span class="mr-2">
							<ZapIcon class="w-4 h-4 text-yellow-300" />
						</span>
						Inicio rápido
					</h3>
					<div class="space-y-3">
						<div class="flex items-center space-x-3 text-sm">
							<span
								class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold"
								>1</span
							>
							<span class="text-gray-700">Crea tu primer horario</span>
						</div>
						<div class="flex items-center space-x-3 text-sm">
							<span
								class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold"
								>2</span
							>
							<span class="text-gray-700">Añade tus materias</span>
						</div>
						<div class="flex items-center space-x-3 text-sm">
							<span
								class="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold"
								>3</span
							>
							<span class="text-gray-700">Registra tus notas</span>
						</div>
						<div class="flex items-center space-x-3 text-sm">
							<span
								class="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold"
								>4</span
							>
							<span class="text-gray-700">¡Organízate mejor!</span>
						</div>
					</div>
				</section>
			</aside>
		</div>
	</main>
</div>
