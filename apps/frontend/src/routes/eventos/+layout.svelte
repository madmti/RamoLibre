<script>
	import { APP_NAME } from '$lib';
	
	const pageTitle = `Eventos Académicos - ${APP_NAME}`;
	const pageDescription = 'Organiza eventos académicos, exámenes, entregas y fechas importantes. Mantente al día con tu calendario universitario.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="keywords" content="eventos académicos, exámenes universidad, calendario académico, fechas importantes, entregas universitarias" />
	
	<!-- Open Graph -->
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content="/eventos" />
	
	<!-- Twitter Card -->
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	
	<!-- Canonical URL -->
	<link rel="canonical" href="/eventos" />
</svelte:head>

<slot />
