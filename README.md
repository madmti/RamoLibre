# 🎓 Ramo Libre

**Ramo Libre** es una aplicación web completa diseñada específicamente para estudiantes universitarios. Permite gestionar horarios académicos, calcular notas con predicciones inteligentes, organizar eventos académicos y llevar un seguimiento detallado del progreso universitario, todo de manera offline-first.

## ✨ Características principales

### 🗓️ **Gestión de Horarios**
- **Múltiples vistas**: Lista detallada, cuadrícula semanal y tarjetas compactas
- **Gestión de materias**: Crear, editar y eliminar asignaturas con información completa
- **Horarios flexibles**: Soporte para horarios complejos y bloques de tiempo personalizables
- **Vista responsiva**: Optimizada para escritorio y móviles

### 📊 **Sistema de Notas Inteligente**
- **Cálculo predictivo**: Algoritmo LP Smooth Solution para predicciones realistas
- **Configuración flexible**: Múltiples categorías de evaluaciones con ponderaciones personalizables
- **Análisis visual**: Gráficos y visualizaciones del rendimiento académico
- **Metas académicas**: Establecimiento y seguimiento de objetivos de notas

### 🎯 **Gestión de Eventos**
- **4 vistas disponibles**: Calendario, Lista, Kanban y Timeline
- **Tipos de eventos**: Exámenes, tareas, proyectos, fechas límite, clases, reuniones
- **Prioridades**: Sistema de prioridades (baja, media, alta) con colores distintivos
- **Estados**: Pendiente, en progreso, completado, atrasado
- **Notificaciones**: Recordatorios y alertas de eventos próximos

### ⚙️ **Configuración Avanzada**
- **Gestión de cuenta**: Perfiles de usuario con información académica
- **Personalización**: Vistas preferidas, temas y configuraciones de interfaz
- **Gestión de datos**: Importación, exportación y limpieza de datos
- **Accesibilidad**: Cumple estándares WCAG 2.1 con navegación por teclado

### 🔒 **Funcionalidad Offline-First**
- **Sin cuenta requerida**: Uso completo sin necesidad de registro
- **Almacenamiento local**: Todos los datos se guardan localmente
- **Sincronización opcional**: Opción de crear cuenta para sincronizar entre dispositivos
- **Copia de seguridad**: Exportación e importación de datos

## 🚀 Inicio rápido

### Prerrequisitos

- [Bun](https://bun.sh/) >= 1.0.0

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/ramo-libre.git
cd ramo-libre

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

### Construcción para producción

```bash
# Construir frontend
bun run build:frontend

# Construir backend
bun run build:backend

# Construir todo
bun run build:all
```

## 📁 Estructura del proyecto

```
ramo-libre/
├── apps/
│   ├── frontend/                    # SvelteKit app
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/      # Componentes reutilizables
│   │   │   │   │   ├── events/      # Vistas de eventos
│   │   │   │   │   ├── modals/      # Modales de la aplicación
│   │   │   │   │   ├── schedule/    # Vistas de horarios
│   │   │   │   │   ├── GradeEquationDisplay.svelte
│   │   │   │   │   ├── Navigation.svelte
│   │   │   │   │   └── UserCard.svelte
│   │   │   │   ├── data/            # Datos de ejemplo
│   │   │   │   ├── stores/          # Estados globales (Svelte stores)
│   │   │   │   └── utils/           # Utilidades y helpers
│   │   │   └── routes/              # Páginas de la aplicación
│   │   │       ├── configuracion/   # Página de configuración
│   │   │       ├── eventos/         # Gestión de eventos
│   │   │       ├── gestion/         # Gestión de datos
│   │   │       ├── horario/         # Gestión de horarios
│   │   │       └── notas/           # Sistema de notas
│   │   └── static/                  # Archivos estáticos
│   └── backend/                     # Hono + Bun API
│       └── src/
│           └── index.ts
├── packages/
│   └── shared/                      # Tipos TypeScript compartidos
│       ├── index.ts
│       └── package.json
└── package.json                     # Configuración del monorepo
```

## 🛠️ Stack tecnológico

### Frontend
- **Framework**: SvelteKit con TypeScript
- **Estilos**: Tailwind CSS con diseño responsivo
- **Estado**: Svelte stores para manejo de estado global
- **Almacenamiento**: localStorage con fallback a IndexedDB
- **Accesibilidad**: WCAG 2.1 AA compliant

### Backend
- **Runtime**: Bun (JavaScript runtime rápido)
- **Framework**: Hono (framework web ultraligero)
- **Lenguaje**: TypeScript
- **API**: RESTful con validación de tipos

### Desarrollo
- **Monorepo**: Bun workspaces
- **Bundling**: Vite (frontend) + Bun (backend)
- **Linting**: ESLint + Prettier
- **Tipos**: TypeScript estricto en todo el proyecto

## 🎯 Características implementadas

### ✅ **Completado**

#### 🏗️ **Infraestructura**
- ✅ Estructura del monorepo con Bun workspaces
- ✅ Configuración de desarrollo con hot-reload
- ✅ Frontend SvelteKit completamente funcional
- ✅ Backend Hono con endpoints básicos
- ✅ Sistema de tipos compartidos entre frontend y backend
- ✅ Configuración de Tailwind CSS con tema personalizado

#### 🎨 **Interfaz de Usuario**
- ✅ Navegación principal responsive
- ✅ Componente de tarjeta de usuario con autenticación opcional
- ✅ Sistema de modales reutilizables
- ✅ Diseño mobile-first con breakpoints responsivos
- ✅ Tema visual cohesivo con paleta de colores académica

#### � **Sistema de Horarios**
- ✅ CRUD completo de materias (crear, leer, actualizar, eliminar)
- ✅ Gestión de bloques horarios con validación de solapamientos
- ✅ Vista lista con información detallada por día
- ✅ Vista cuadrícula estilo calendario semanal
- ✅ Vista tarjetas compacta para vista rápida
- ✅ Persistencia en localStorage
- ✅ Datos de ejemplo para demostración

#### 📊 **Sistema de Notas**
- ✅ Calculadora de notas con algoritmo LP Smooth Solution
- ✅ Gestión de categorías de evaluación con ponderaciones
- ✅ Predicción de notas faltantes para alcanzar metas
- ✅ Visualización de ecuaciones matemáticas
- ✅ Configuración flexible de esquemas de evaluación
- ✅ Análisis de rendimiento por materia

#### 🎯 **Gestión de Eventos**
- ✅ CRUD completo de eventos académicos
- ✅ Vista calendario mensual con eventos
- ✅ Vista lista cronológica ordenada
- ✅ Vista Kanban por estados de progreso
- ✅ Vista timeline temporal
- ✅ Sistema de prioridades y estados
- ✅ Filtrado y búsqueda de eventos
- ✅ Marcado de eventos completados

#### ⚙️ **Configuración y Preferencias**
- ✅ Gestión de cuenta de usuario (opcional)
- ✅ Configuración de vistas preferidas
- ✅ Gestión de datos (exportar/importar/limpiar)
- ✅ Configuraciones de accesibilidad
- ✅ Página de configuración completa y accesible

#### 🔐 **Autenticación y Datos**
- ✅ Sistema de usuario opcional (sin cuenta requerida)
- ✅ Almacenamiento local persistente
- ✅ Gestión de sesiones de usuario
- ✅ Exportación e importación de datos
- ✅ Limpieza selectiva de datos

#### ♿ **Accesibilidad**
- ✅ Navegación por teclado completa
- ✅ Etiquetas ARIA apropiadas
- ✅ Asociación correcta de labels con controles
- ✅ Estructura semántica con fieldsets/legends
- ✅ Cumplimiento WCAG 2.1 AA
- ✅ Soporte para lectores de pantalla

### 🔄 **En desarrollo**
- ⏳ Notificaciones push para eventos
- ⏳ Exportación a formatos estándar (iCal, PDF)
- ⏳ Integración con calendarios externos
- ⏳ Análisis avanzado de rendimiento académico
- ⏳ Modo oscuro
- ⏳ PWA (Progressive Web App)

### 🚀 **Próximas características**
- 📱 Aplicación móvil nativa
- 🔄 Sincronización en tiempo real
- 🤖 IA para recomendaciones de estudio
- 📈 Dashboard de analíticas avanzadas
- 🎓 Integración con sistemas universitarios
- 👥 Funcionalidades colaborativas

## 🔗 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Información del usuario actual

### Usuarios
- `GET /api/users/profile` - Perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil
- `DELETE /api/users/account` - Eliminar cuenta

### Horarios
- `GET /api/schedule` - Obtener horario
- `POST /api/schedule/subjects` - Crear materia
- `PUT /api/schedule/subjects/:id` - Actualizar materia
- `DELETE /api/schedule/subjects/:id` - Eliminar materia

### Notas
- `GET /api/grades` - Obtener notas
- `POST /api/grades` - Crear nota
- `PUT /api/grades/:id` - Actualizar nota
- `DELETE /api/grades/:id` - Eliminar nota
- `POST /api/grades/calculate` - Calcular predicciones

### Eventos
- `GET /api/events` - Listar eventos
- `POST /api/events` - Crear evento
- `PUT /api/events/:id` - Actualizar evento
- `DELETE /api/events/:id` - Eliminar evento

### Utilidades
- `GET /api/health` - Estado de la API
- `POST /api/data/export` - Exportar datos
- `POST /api/data/import` - Importar datos

## 🎓 Para desarrolladores

### Comandos útiles

```bash
# Desarrollo
bun run dev                # Ejecutar en modo desarrollo
bun run dev:frontend       # Solo frontend
bun run dev:backend        # Solo backend

# Construcción
bun run build:all          # Construir todo
bun run build:frontend     # Solo frontend
bun run build:backend      # Solo backend

# Utilidades
bun run clean              # Limpiar archivos de construcción
bun run install:all        # Instalar dependencias en todo el monorepo
bun run type-check         # Verificar tipos TypeScript
```

### Estructura de componentes

La aplicación sigue un patrón de componentes reutilizables:

- **Páginas** (`/routes`): Componentes de nivel superior para cada ruta
- **Componentes** (`/lib/components`): Componentes reutilizables organizados por función
- **Stores** (`/lib/stores`): Estado global de la aplicación
- **Utilidades** (`/lib/utils`): Funciones helper y utilidades
- **Tipos** (`/packages/shared`): Definiciones de tipos compartidas

### Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Realiza tus cambios siguiendo las convenciones del proyecto
4. Asegúrate de que todos los tests pasen y no hay errores de TypeScript
5. Commit tus cambios (`git commit -am 'Agrega nueva característica'`)
6. Push a la rama (`git push origin feature/nueva-caracteristica`)
7. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Agradecimientos

- **SvelteKit** por el framework frontend moderno y eficiente
- **Bun** por el runtime JavaScript ultrarrápido
- **Hono** por el framework web minimalista
- **Tailwind CSS** por el sistema de diseño utility-first
- Comunidad open source por las herramientas y librerías utilizadas

---

**Ramo Libre** - Gestión académica hecha simple. 🎓✨
