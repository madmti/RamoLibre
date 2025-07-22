import { config } from 'dotenv';
import { resolve } from 'path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Cargar variables de entorno desde la raíz del proyecto
config({ path: resolve(__dirname, '../../../.env') });

const app = new Hono();

// Configurar CORS para permitir requests desde el frontend
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Endpoint default que devuelve "Hola mundo"
app.get('/', (c) => {
  return c.json({ message: 'Hola mundo' });
});

// Ruta para verificar el estado de la API
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    message: 'Ramo Libre API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

const port = Bun.env.API_PORT || 3000;

console.log(`🚀 Servidor corriendo en http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
