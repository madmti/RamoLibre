import { type MiddlewareHandler } from 'hono';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);

export const requireAuth: MiddlewareHandler = async (c, next) => {
	const token = c.req.header('Authorization')?.replace('Bearer ', '');
	if (!token) return c.json({ error: 'Unauthorized' }, 401);

	try {
		const { payload } = await jwtVerify(token, secret);
		c.set('authId', payload.sub);
		await next();
	} catch {
		return c.json({ error: 'Invalid token' }, 401);
	}
};
