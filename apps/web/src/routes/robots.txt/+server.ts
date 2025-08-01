import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const baseUrl = 'https://ramolibre.vercel.app';
	
	const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow internal/API directories
Disallow: /api/
Disallow: /_app/

# Optional crawl delay for better server performance
Crawl-delay: 1`;

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
