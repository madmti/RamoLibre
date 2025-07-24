<script>
	import { APP_NAME } from '$lib';
	
	const pageTitle = `Gestión - ${APP_NAME}`;
	const pageDescription = 'Accede a herramientas avanzadas para gestionar tu experiencia académica. Administra clases, aulas y horarios de forma eficiente y personalizada.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="keywords" content="gestión académica, administración de clases, horarios universitarios, aulas, herramientas educativas" />

	<!-- Open Graph -->
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content="/gestion" />
	
	<!-- Twitter Card -->
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	
	<!-- Canonical URL -->
	<link rel="canonical" href="/gestion" />
</svelte:head>

<slot />
