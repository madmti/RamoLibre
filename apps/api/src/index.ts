import './database/register';
import { createApp } from './utils/app';
import { requireAuth } from './utils/middleware';
import { createDatabaseAdapter } from '@ramo-libre/database';
import { type ApiResponse, type UserProfileResponse } from '@ramo-libre/shared';

const app = createApp();

app.get('/', (c) => {
	return c.json({
		message: 'API is running',
		timestamp: new Date().toISOString(),
	});
});

app.post('/pull/', requireAuth, async (c) => {
	const authId = c.get('authId');
	const db = createDatabaseAdapter('supabase');
	const profile = await db.pull(authId);
	const response: ApiResponse<UserProfileResponse> = {
		ok: true,
		data: {
			profile: profile,
		},
	};
	return c.json(response);
});

app.post('/push/', requireAuth, async (c) => {
	const authId = c.get('authId');
	const body = await c.req.json();
	const db = createDatabaseAdapter('supabase');

	await db.push(body.profile, authId);
	return c.json({ ok: true });
});

app.post('/forget/', requireAuth, async (c) => {
	const authId = c.get('authId');
	const db = createDatabaseAdapter('supabase');
	if (db.delete) {
		await db.delete(authId);
	}

	return c.json({ ok: true });
});

export default app;
