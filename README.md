# RamoLibre

Monorepo para el proyecto RamoLibre construido con Turborepo y Bun.

## Estructura del proyecto

```
RamoLibre/
├── apps/
│   ├── web/          # App SvelteKit
│   ├── mobile/       # App React Native + Expo
│   └── api/          # API Hono
├── packages/
│   └── shared/       # Código TypeScript compartido
└── ...
```

## Comandos disponibles

### Desarrollo

```bash
# Ejecutar todas las apps en modo desarrollo
bun dev

# Ejecutar apps individuales
bun web:dev     # SvelteKit
bun mobile:dev  # React Native + Expo
bun api:dev     # API Hono
```

### Construcción

```bash
# Construir todas las apps
bun build

# Construir apps individuales
bun web:build
bun mobile:build
bun api:build
```

### Otros comandos

```bash
# Instalar dependencias
bun install

# Linting
bun lint

# Formateo de código
bun format

# Verificación de tipos
bun type-check

# Limpiar archivos de build
bun clean
```

## Apps

### Web (SvelteKit)

- Puerto de desarrollo: 5173
- Framework: SvelteKit
- Lenguaje: TypeScript

### Mobile (React Native + Expo)

- Framework: React Native con Expo
- Lenguaje: TypeScript
- Soporta: iOS, Android, Web

### API (Hono)

- Puerto: 3001
- Framework: Hono
- Runtime: Bun
- Lenguaje: TypeScript

## Paquetes compartidos

### @ramo-libre/shared

Contiene tipos, utilidades y constantes compartidas entre todas las aplicaciones.

### @ramo-libre/database

Contiene tipos y utilidades para implementar adaptadores de bases de datos

## Configuración

El proyecto está configurado para usar:

- **Bun** como gestor de paquetes y runtime
- **Turborepo** para la gestión del monorepo
- **TypeScript** en todas las aplicaciones
- **ESLint** para linting
- **Prettier** para formateo de código
