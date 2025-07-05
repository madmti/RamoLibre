import { writable, get } from 'svelte/store';
import type { Subject, Schedule } from '@ramo-libre/shared';

// Estados de los stores
export const subjects = writable<Subject[]>([]);
export const schedules = writable<Schedule[]>([]);
export const isLoading = writable(false);

// Claves para localStorage
const SUBJECTS_STORAGE_KEY = 'ramo-libre-subjects';
const SCHEDULES_STORAGE_KEY = 'ramo-libre-schedules';

// Servicio para manejar materias y horarios
class ScheduleService {
  // === MATERIAS ===

  // Cargar materias desde localStorage
  loadSubjects(): Subject[] {
    try {
      const stored = localStorage.getItem(SUBJECTS_STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : [];
      subjects.set(data);
      return data;
    } catch (error) {
      console.error('Error loading subjects:', error);
      subjects.set([]);
      return [];
    }
  }

  // Guardar materias en localStorage
  saveSubjects(subjectList: Subject[]) {
    try {
      localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjectList));
      subjects.set(subjectList);
    } catch (error) {
      console.error('Error saving subjects:', error);
    }
  }

  // Agregar nueva materia
  addSubject(subjectData: Omit<Subject, 'id' | 'createdAt' | 'userId'>, userId: string): Subject {
    const newSubject: Subject = {
      ...subjectData,
      id: this.generateId(),
      userId,
      createdAt: new Date().toISOString()
    };

    const currentSubjects = get(subjects);
    const updatedSubjects = [...currentSubjects, newSubject];
    this.saveSubjects(updatedSubjects);

    return newSubject;
  }

  // Actualizar materia existente
  updateSubject(id: string, updates: Partial<Subject>) {
    const currentSubjects = get(subjects);
    const updatedSubjects = currentSubjects.map(subject =>
      subject.id === id ? { ...subject, ...updates } : subject
    );
    this.saveSubjects(updatedSubjects);
  }

  // Eliminar materia (y sus horarios relacionados)
  deleteSubject(id: string) {
    const currentSubjects = get(subjects);
    const updatedSubjects = currentSubjects.filter(subject => subject.id !== id);
    this.saveSubjects(updatedSubjects);

    // También eliminar horarios relacionados
    const currentSchedules = get(schedules);
    const updatedSchedules = currentSchedules.filter(schedule => schedule.subjectId !== id);
    this.saveSchedules(updatedSchedules);
  }

  // === HORARIOS ===

  // Cargar horarios desde localStorage
  loadSchedules(): Schedule[] {
    try {
      const stored = localStorage.getItem(SCHEDULES_STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : [];
      schedules.set(data);
      return data;
    } catch (error) {
      console.error('Error loading schedules:', error);
      schedules.set([]);
      return [];
    }
  }

  // Guardar horarios en localStorage
  saveSchedules(scheduleList: Schedule[]) {
    try {
      localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(scheduleList));
      schedules.set(scheduleList);
    } catch (error) {
      console.error('Error saving schedules:', error);
    }
  }

  // Agregar nuevo horario
  addSchedule(scheduleData: Omit<Schedule, 'id' | 'userId'>, userId: string): Schedule {
    const newSchedule: Schedule = {
      ...scheduleData,
      id: this.generateId(),
      userId
    };

    const currentSchedules = get(schedules);
    const updatedSchedules = [...currentSchedules, newSchedule];
    this.saveSchedules(updatedSchedules);

    return newSchedule;
  }

  // Actualizar horario existente
  updateSchedule(id: string, updates: Partial<Schedule>) {
    const currentSchedules = get(schedules);
    const updatedSchedules = currentSchedules.map(schedule =>
      schedule.id === id ? { ...schedule, ...updates } : schedule
    );
    this.saveSchedules(updatedSchedules);
  }

  // Eliminar horario
  deleteSchedule(id: string) {
    const currentSchedules = get(schedules);
    const updatedSchedules = currentSchedules.filter(schedule => schedule.id !== id);
    this.saveSchedules(updatedSchedules);
  }

  // === UTILIDADES ===

  // Generar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Inicializar datos (cargar desde localStorage)
  async initialize() {
    isLoading.set(true);
    try {
      this.loadSubjects();
      this.loadSchedules();
    } finally {
      isLoading.set(false);
    }
  }

  // Limpiar todos los datos
  clearAll() {
    localStorage.removeItem(SUBJECTS_STORAGE_KEY);
    localStorage.removeItem(SCHEDULES_STORAGE_KEY);
    subjects.set([]);
    schedules.set([]);
  }

  // Obtener horarios de una materia específica
  getSchedulesForSubject(subjectId: string): Schedule[] {
    const currentSchedules = get(schedules);
    return currentSchedules.filter(schedule => schedule.subjectId === subjectId);
  }

  // Obtener horarios por día
  getSchedulesForDay(dayOfWeek: number): Schedule[] {
    const currentSchedules = get(schedules);
    return currentSchedules.filter(schedule => schedule.dayOfWeek === dayOfWeek);
  }
}

// Instancia singleton del servicio
export const scheduleService = new ScheduleService();
