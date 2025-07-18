import { Hono } from 'hono';
import { cors } from 'hono/cors';

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

const port = Bun.env.PORT || 3000;

console.log(`🚀 Servidor corriendo en http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
