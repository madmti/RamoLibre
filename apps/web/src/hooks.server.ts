import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Manejar headers de SEO y seguridad
	const response = await resolve(event);
	
	// Headers de seguridad importantes para SEO
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	
	// Cache headers para recursos estáticos
	if (event.url.pathname.startsWith('/favicon') || 
		event.url.pathname.startsWith('/_app/') ||
		event.url.pathname.includes('.css') ||
		event.url.pathname.includes('.js')) {
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	}
	
	return response;
};
