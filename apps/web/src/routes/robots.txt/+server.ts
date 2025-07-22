import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const baseUrl = 'https://ramo-libre.com'; // Cambia por tu dominio real
	
	const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (opcional, ajusta según necesites)
Crawl-delay: 1

# Disallow files/directories that shouldn't be indexed
Disallow: /api/
Disallow: /_app/
Disallow: /admin/

# Allow important directories
Allow: /horario
Allow: /notas
Allow: /eventos
Allow: /configuracion`;

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
