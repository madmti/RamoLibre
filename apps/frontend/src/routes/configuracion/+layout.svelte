<script>
	import { APP_NAME } from '$lib';
	
	const pageTitle = `Configuración - ${APP_NAME}`;
	const pageDescription = 'Personaliza tu experiencia académica. Configura preferencias, ajustes de privacidad y opciones de la aplicación universitaria.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="keywords" content="configuración app universitaria, personalizar aplicación, preferencias académicas, ajustes privacidad" />
	
	<!-- Open Graph -->
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content="/configuracion" />
	
	<!-- Twitter Card -->
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	
	<!-- Canonical URL -->
	<link rel="canonical" href="/configuracion" />
</svelte:head>

<slot />
