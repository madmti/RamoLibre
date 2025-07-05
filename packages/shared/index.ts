// Tipos y utilidades compartidas entre frontend y backend

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

// === TIPOS DE USUARIO ===
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  university?: string;
  career?: string;
  semester?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  user: User;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  notifications: boolean;
  syncEnabled: boolean;
  privateMode: boolean;
  scheduleView: 'list' | 'grid' | 'cards';
  eventsView: 'calendar' | 'list' | 'kanban' | 'timeline';
}

export interface UserStats {
  totalSubjects: number;
  averageGrade: number;
  completedTasks: number;
  upcomingEvents: number;
  lastActivity: string;
}

// === TIPOS ACADÉMICOS ===
export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  color: string;
  professor?: string;
  semester: number;
  userId: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  subjectId: string;
  value: number;
  maxValue: number;
  description: string;
  date: string;
  type: 'exam' | 'homework' | 'project' | 'participation' | 'other';
  weight: number;
  userId: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:MM format
  endTime?: string; // HH:MM format for duration
  type: 'exam' | 'assignment' | 'class' | 'meeting' | 'project' | 'deadline' | 'other';
  subjectId?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  location?: string;
  reminder?: number; // minutes before event
  isAllDay?: boolean;
  userId: string;
  createdAt: string;
}

export interface Schedule {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:MM format
  endTime: string;
  classroom?: string;
  type: 'class' | 'lab' | 'tutorial';
  userId: string;
}

// === UTILIDADES ===
export type EntityWithId = { id: string };

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// === CONSTANTES ===
export const USER_STORAGE_KEY = 'ramo-libre-user';
export const PREFERENCES_STORAGE_KEY = 'ramo-libre-preferences';
export const OFFLINE_DATA_KEY = 'ramo-libre-offline-data';
