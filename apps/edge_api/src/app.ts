import { createApp } from './lib/create_app';

const app = createApp();

app.get('/', (c) => {
	return c.json({
		message: 'EDGE API is running successfully!',
		timestamp: new Date().toISOString(),
	});
});

export default app;
