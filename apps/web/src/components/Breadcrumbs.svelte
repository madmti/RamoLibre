<script lang="ts">
	import { page } from '$app/stores';
	
	interface Breadcrumb {
		label: string;
		href: string;
		current?: boolean;
	}
	
	$: pathname = $page.url.pathname;
	
	$: breadcrumbs = (() => {
		const pathSegments = pathname.split('/').filter(Boolean);
		const breadcrumbs: Breadcrumb[] = [
			{ label: 'Inicio', href: '/' }
		];
		
		let currentPath = '';
		pathSegments.forEach((segment, index) => {
			currentPath += `/${segment}`;
			const isLast = index === pathSegments.length - 1;
			
			const labels: Record<string, string> = {
				horario: 'Horarios',
				notas: 'Notas',
				eventos: 'Eventos',
				configuracion: 'Configuración',
				gestion: 'Gestión'
			};
			
			breadcrumbs.push({
				label: labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
				href: currentPath,
				current: isLast
			});
		});
		
		return breadcrumbs;
	})();
	
	$: breadcrumbJsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": breadcrumbs.map((crumb, index) => ({
			"@type": "ListItem",
			"position": index + 1,
			"name": crumb.label,
			"item": `${$page.url.origin}${crumb.href}`
		}))
	};
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>`}
</svelte:head>

{#if breadcrumbs.length > 1}
	<nav aria-label="Breadcrumb" class="bg-gray-50/80 border-b border-gray-200/50">
		<div class="container mx-auto px-4 py-3">
			<ol class="flex items-center space-x-2 text-sm">
				{#each breadcrumbs as crumb, index}
					<li class="flex items-center">
						{#if index > 0}
							<svg 
								class="w-4 h-4 text-gray-400 mx-2" 
								fill="currentColor" 
								viewBox="0 0 20 20"
								aria-hidden="true"
							>
								<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
							</svg>
						{/if}
						
						{#if crumb.current}
							<span class="font-medium text-gray-900" aria-current="page">
								{crumb.label}
							</span>
						{:else}
							<a 
								href={crumb.href} 
								class="text-gray-600 hover:text-blue-600 transition-colors"
								aria-label={`Ir a ${crumb.label}`}
							>
								{crumb.label}
							</a>
						{/if}
					</li>
				{/each}
			</ol>
		</div>
	</nav>
{/if}

<!-- JSON-LD Structured Data for Breadcrumbs -->
