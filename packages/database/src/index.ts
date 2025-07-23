// packages/database/src/index.ts
import type { UserProfile } from '@ramo-libre/shared';

export type SyncDirection = 'push' | 'pull';

export interface DatabaseAdapter {
	/**
	 * Guarda o sincroniza el perfil completo del usuario
	 */
	push(profile: UserProfile, authId: string): Promise<void>;

	/**
	 * Recupera el perfil completo desde la base de datos
	 */
	pull(authId: string): Promise<UserProfile | null>;

	/**
	 * Elimina completamente el perfil del usuario (opcional)
	 */
	delete?(authId: string): Promise<void>;
}

/**
 * Registro interno de adaptadores disponibles
 */
const adapters: Record<string, () => DatabaseAdapter> = {};

/**
 * Registrar un nuevo adaptador
 */
export function registerDatabaseAdapter(
	name: string,
	factory: () => DatabaseAdapter
) {
	adapters[name] = factory;
}

/**
 * Crear una instancia de adaptador
 */
export function createDatabaseAdapter(name: string): DatabaseAdapter {
	const factory = adapters[name];
	if (!factory)
		throw new Error(`Database adapter "${name}" is not registered`);
	return factory();
}
