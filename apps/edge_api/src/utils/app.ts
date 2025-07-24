import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Variables = {
	authId: string;
};

export function createApp() {
	const app = new Hono<{ Variables: Variables }>().basePath('/api/');

	const allowedOrigins = [
		'http://localhost:5173',
		process.env.PUBLIC_WEB_URL || 'https://ramolibre.vercel.app',
	];

	app.use(
		'*',
		cors({
			origin: allowedOrigins,
			allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
			allowHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
		})
	);

	app.options('*', (c) => {
		return new Response(null, {
			status: 204,
			headers: {
				'Access-Control-Allow-Origin': c.req.header('Origin') ?? '*',
				'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type,Authorization',
				'Access-Control-Allow-Credentials': 'true',
			},
		});
	});

	return app;
}
