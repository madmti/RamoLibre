import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Variables = {
    authId: string;
};

export function createApp() {
    const app = new Hono<{ Variables: Variables }>().basePath('/api/');
    const frontendOrigin = process.env.VITE_WEB_URL || 'http://localhost:5173';

    app.use(
        '*',
        cors({
            origin: [frontendOrigin],
            allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowHeaders: ['Content-Type', 'Authorization'],
        })
    );

    return app;
}
