<script>
	import { APP_NAME } from '$lib';
	
	const pageTitle = `Gestión de Horarios - ${APP_NAME}`;
	const pageDescription = 'Organiza y visualiza tus horarios académicos universitarios. Gestiona clases, aulas y horarios semanales de forma eficiente y visual.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="keywords" content="horarios universitarios, gestión clases, horario académico, planificación estudiantil, calendario clases" />
	
	<!-- Open Graph -->
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content="/horario" />
	
	<!-- Twitter Card -->
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	
	<!-- Canonical URL -->
	<link rel="canonical" href="/horario" />
</svelte:head>

<slot />
