import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const baseUrl = 'https://ramo-libre.com'; // Cambia por tu dominio real
	const pages = [
		{ url: '', priority: '1.0', changefreq: 'weekly' },
		{ url: '/horario', priority: '0.9', changefreq: 'weekly' },
		{ url: '/notas', priority: '0.9', changefreq: 'weekly' },
		{ url: '/eventos', priority: '0.9', changefreq: 'weekly' },
		{ url: '/configuracion', priority: '0.7', changefreq: 'monthly' },
	];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map(
		(page) => `	<url>
		<loc>${baseUrl}${page.url}</loc>
		<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
		<changefreq>${page.changefreq}</changefreq>
		<priority>${page.priority}</priority>
	</url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
