# 🎓 Ramo Libre

**Ramo Libre** es una aplicación web ligera, rápida y centrada en el estudiante universitario. Su objetivo es brindar una experiencia fluida para organizar y seguir el progreso académico, incluso sin conexión a internet.

## 🚀 Inicio rápido

### Prerrequisitos

- [Bun](https://bun.sh/) >= 1.0.0

### Instalación

```bash
# Instalar dependencias en todos los workspaces
bun run install:all

# O instalar manualmente
bun install
cd apps/frontend && bun install
cd ../backend && bun install
```

### Desarrollo

```bash
# Ejecutar frontend y backend simultáneamente
bun run dev

# O ejecutar por separado
bun run dev:frontend  # Frontend en http://localhost:5173
bun run dev:backend   # Backend en http://localhost:3000
```

### Estructura del proyecto

```
ramo-libre/
├── apps/
│   ├── frontend/          # SvelteKit app
│   └── backend/           # Hono + Bun API
├── packages/
│   └── shared/            # Tipos y utilidades compartidas
└── package.json           # Configuración del monorepo
```

## 🛠️ Stack tecnológico

- **Frontend**: SvelteKit + TypeScript + Tailwind CSS
- **Backend**: Hono + Bun + TypeScript  
- **Monorepo**: Bun workspaces
- **Almacenamiento**: localStorage/IndexedDB (offline-first)

## 📝 Estado actual

- ✅ Estructura base del monorepo
- ✅ Frontend con página en blanco (SvelteKit + Tailwind CSS)
- ✅ Backend con endpoint "Hola mundo" (Hono + Bun)
- ✅ Configuración de Tailwind CSS integrada
- ⏳ Implementación de funcionalidades principales

## 🔗 Endpoints disponibles

- `GET /` - Devuelve "Hola mundo"
- `GET /api/health` - Estado de la API

---

Para más información, consulta la [documentación completa](./context.md).
