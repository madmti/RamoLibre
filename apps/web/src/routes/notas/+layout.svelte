<script>
	import { APP_NAME } from '$lib';
	
	const pageTitle = `Seguimiento de Notas - ${APP_NAME}`;
	const pageDescription = 'Gestiona y calcula tus calificaciones universitarias. Lleva seguimiento de notas, promedios y progreso académico de forma organizada.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="keywords" content="calificaciones universitarias, notas académicas, promedio universidad, seguimiento notas, calculadora promedio" />
	
	<!-- Open Graph -->
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content="/notas" />
	
	<!-- Twitter Card -->
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	
	<!-- Canonical URL -->
	<link rel="canonical" href="/notas" />
</svelte:head>

<slot />
