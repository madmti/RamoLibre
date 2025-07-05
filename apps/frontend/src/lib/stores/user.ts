import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, UserProfile, UserPreferences } from '@ramo-libre/shared';
import { USER_STORAGE_KEY, PREFERENCES_STORAGE_KEY } from '@ramo-libre/shared';

// Preferencias por defecto
const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'es',
  notifications: true,
  syncEnabled: false,
  privateMode: false,
  scheduleView: 'cards',
  eventsView: 'calendar'
};

// Store para el usuario actual
export const currentUser = writable<User | null>(null);

// Store para las preferencias del usuario
export const userPreferences = writable<UserPreferences>(defaultPreferences);

// Store para indicar si el usuario está logueado
export const isLoggedIn = writable<boolean>(false);

// Funciones para manejar el localStorage
export const userService = {
  // Cargar datos del usuario desde localStorage
  loadUser: (): User | null => {
    if (!browser) return null;
    
    try {
      const userData = localStorage.getItem(USER_STORAGE_KEY);
      if (userData) {
        const user = JSON.parse(userData) as User;
        currentUser.set(user);
        isLoggedIn.set(true);
        return user;
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
    
    currentUser.set(null);
    isLoggedIn.set(false);
    return null;
  },

  // Guardar usuario en localStorage
  saveUser: (user: User): void => {
    if (!browser) return;
    
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      currentUser.set(user);
      isLoggedIn.set(true);
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  },

  // Cargar preferencias del usuario
  loadPreferences: (): UserPreferences => {
    if (!browser) return defaultPreferences;
    
    try {
      const prefsData = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (prefsData) {
        const prefs = { ...defaultPreferences, ...JSON.parse(prefsData) };
        userPreferences.set(prefs);
        return prefs;
      }
    } catch (error) {
      console.error('Error loading preferences from localStorage:', error);
    }
    
    userPreferences.set(defaultPreferences);
    return defaultPreferences;
  },

  // Guardar preferencias del usuario
  savePreferences: (preferences: Partial<UserPreferences>): void => {
    if (!browser) return;
    
    try {
      userPreferences.update(current => {
        const updated = { ...current, ...preferences };
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error saving preferences to localStorage:', error);
    }
  },

  // Crear un nuevo usuario (registro local)
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const user: User = {
      id: crypto.randomUUID(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    userService.saveUser(user);
    return user;
  },

  // Cerrar sesión
  logout: (): void => {
    if (!browser) return;
    
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(PREFERENCES_STORAGE_KEY);
      currentUser.set(null);
      isLoggedIn.set(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  // Inicializar el servicio (llamar al cargar la app)
  init: (): void => {
    userService.loadUser();
    userService.loadPreferences();
  }
};

// Generar avatar por defecto basado en el nombre
export const generateAvatar = (name: string): string => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
  ];
  
  const colorIndex = name.length % colors.length;
  return `<div class="w-full h-full ${colors[colorIndex]} text-white font-bold flex items-center justify-center text-lg">${initials}</div>`;
};
