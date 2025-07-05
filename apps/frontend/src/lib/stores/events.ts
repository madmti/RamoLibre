import { writable, get } from 'svelte/store';
import type { Event, Subject } from '@ramo-libre/shared';

// Función auxiliar para crear fecha local sin interpretación UTC
function createLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Función auxiliar para obtener fecha local en formato YYYY-MM-DD
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Estados de los stores
export const events = writable<Event[]>([]);
export const isLoading = writable(false);

// Clave para localStorage
const EVENTS_STORAGE_KEY = 'ramo-libre-events';

// Servicio para manejar eventos
class EventService {
  // Cargar eventos desde localStorage
  loadEvents(): Event[] {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (!stored) {
        events.set([]);
        return [];
      }
      
      const data = JSON.parse(stored);
      // Validar que sea un array
      if (!Array.isArray(data)) {
        console.warn('Invalid events data in localStorage, resetting...');
        events.set([]);
        return [];
      }
      
      // Filtrar eventos válidos
      const validEvents = data.filter(event => 
        event && 
        typeof event === 'object' && 
        event.id && 
        event.title && 
        event.date
      );
      
      events.set(validEvents);
      return validEvents;
    } catch (error) {
      console.error('Error loading events:', error);
      // Limpiar localStorage corrupto
      localStorage.removeItem(EVENTS_STORAGE_KEY);
      events.set([]);
      return [];
    }
  }

  // Guardar eventos en localStorage
  saveEvents(eventList: Event[]) {
    try {
      // Validar que la lista sea válida
      if (!Array.isArray(eventList)) {
        console.error('Invalid event list provided to saveEvents');
        return;
      }
      
      const serialized = JSON.stringify(eventList);
      localStorage.setItem(EVENTS_STORAGE_KEY, serialized);
      events.set(eventList);
    } catch (error) {
      console.error('Error saving events:', error);
      // Si hay error de espacio, intentar limpiar y guardar solo eventos esenciales
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, trying to save essential data only');
        try {
          const essentialEvents = eventList.map(event => ({
            id: event.id,
            title: event.title,
            date: event.date,
            type: event.type,
            priority: event.priority,
            completed: event.completed,
            userId: event.userId,
            createdAt: event.createdAt
          }));
          localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(essentialEvents));
          events.set(eventList);
        } catch (secondError) {
          console.error('Failed to save even essential events data:', secondError);
        }
      }
    }
  }

  // Agregar nuevo evento
  addEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'userId'>, userId: string): Event {
    // Normalizar fecha a formato local YYYY-MM-DD
    let localDate = eventData.date;
    if (Object.prototype.toString.call(eventData.date) === '[object Date]') {
      const d = eventData.date as unknown as Date;
      localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    const newEvent: Event = {
      ...eventData,
      date: localDate,
      id: this.generateId(),
      userId,
      createdAt: new Date().toISOString()
    };

    const currentEvents = get(events);
    const updatedEvents = [...currentEvents, newEvent];
    this.saveEvents(updatedEvents);

    return newEvent;
  }

  // Actualizar evento existente
  updateEvent(id: string, updates: Partial<Event>) {
    const currentEvents = get(events);
    const updatedEvents = currentEvents.map(event =>
      event.id === id ? { ...event, ...updates } : event
    );
    this.saveEvents(updatedEvents);
  }

  // Eliminar evento
  deleteEvent(id: string) {
    const currentEvents = get(events);
    const updatedEvents = currentEvents.filter(event => event.id !== id);
    this.saveEvents(updatedEvents);
  }

  // Marcar evento como completado/pendiente
  toggleEventCompleted(id: string) {
    const currentEvents = get(events);
    const updatedEvents = currentEvents.map(event =>
      event.id === id ? { ...event, completed: !event.completed } : event
    );
    this.saveEvents(updatedEvents);
  }

  // Obtener eventos por fecha
  getEventsForDate(date: string): Event[] {
    const currentEvents = get(events);
    return currentEvents.filter(event => event.date === date);
  }

  // Obtener eventos por materia
  getEventsForSubject(subjectId: string): Event[] {
    const currentEvents = get(events);
    return currentEvents.filter(event => event.subjectId === subjectId);
  }

  // Obtener eventos próximos (siguiente semana)
  getUpcomingEvents(days: number = 7): Event[] {
    const currentEvents = get(events);
    const today = new Date();
    const todayString = getLocalDateString(today);
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    const futureDateString = getLocalDateString(futureDate);

    return currentEvents.filter(event => {
      return event.date >= todayString && event.date <= futureDateString && !event.completed;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Obtener eventos vencidos
  getOverdueEvents(): Event[] {
    const currentEvents = get(events);
    const today = new Date();
    const todayString = getLocalDateString(today);

    return currentEvents.filter(event => {
      return event.date < todayString && !event.completed;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }

  // Generar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Inicializar datos (cargar desde localStorage)
  async initialize() {
    isLoading.set(true);
    try {
      this.loadEvents();
    } finally {
      isLoading.set(false);
    }
  }

  // Limpiar todos los datos
  clearAll() {
    try {
      localStorage.removeItem(EVENTS_STORAGE_KEY);
      events.set([]);
    } catch (error) {
      console.error('Error clearing events:', error);
      // Forzar limpieza del store aunque falle localStorage
      events.set([]);
    }
  }
}

// Instancia singleton del servicio
export const eventService = new EventService();

// Store principal con métodos de conveniencia
export const eventsStore = {
  // Store reactivo
  subscribe: events.subscribe,
  // Métodos del servicio
  loadEvents: () => eventService.loadEvents(),
  addEvent: (eventData: Omit<Event, 'id' | 'createdAt' | 'userId'>, userId: string) => 
    eventService.addEvent(eventData, userId),
  updateEvent: (id: string, updates: Partial<Event>) => eventService.updateEvent(id, updates),
  deleteEvent: (id: string) => eventService.deleteEvent(id),
  toggleEventCompleted: (id: string) => eventService.toggleEventCompleted(id),
  getEventsForDate: (date: string) => eventService.getEventsForDate(date),
  getEventsForSubject: (subjectId: string) => eventService.getEventsForSubject(subjectId),
  getUpcomingEvents: (days?: number) => eventService.getUpcomingEvents(days),
  getOverdueEvents: () => eventService.getOverdueEvents(),
  initialize: () => eventService.initialize(),
  clearAllEvents: () => eventService.clearAll()
};
