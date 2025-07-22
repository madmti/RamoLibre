import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5173
	},
	// Configurar para leer variables de entorno desde la raíz del proyecto
	envDir: path.resolve(__dirname, '../../')
});
