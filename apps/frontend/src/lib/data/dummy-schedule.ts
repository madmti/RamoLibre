import type { Schedule, Subject } from '@ramo-libre/shared';

// Materias dummy
export const dummySubjects: Subject[] = [
  {
    id: '1',
    name: 'Cálculo I',
    code: 'MAT101',
    credits: 6,
    color: '#3B82F6', // blue-500
    professor: 'Dr. Ana García',
    semester: 1,
    userId: 'dummy-user',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Introducción a la Programación',
    code: 'INF101',
    credits: 8,
    color: '#10B981', // green-500
    professor: 'Prof. Carlos López',
    semester: 1,
    userId: 'dummy-user',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Álgebra Lineal',
    code: 'MAT102',
    credits: 6,
    color: '#8B5CF6', // purple-500
    professor: 'Dra. María Rodríguez',
    semester: 1,
    userId: 'dummy-user',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Física I',
    code: 'FIS101',
    credits: 6,
    color: '#F59E0B', // yellow-500
    professor: 'Dr. Juan Pérez',
    semester: 1,
    userId: 'dummy-user',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Química General',
    code: 'QUI101',
    credits: 5,
    color: '#EF4444', // red-500
    professor: 'Dra. Laura Torres',
    semester: 1,
    userId: 'dummy-user',
    createdAt: '2025-01-01T00:00:00Z'
  }
];

// Horarios dummy (0 = Domingo, 1 = Lunes, etc.)
export const dummySchedules: Schedule[] = [
  // Lunes
  {
    id: '1',
    subjectId: '1', // Cálculo I
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '10:00',
    classroom: 'Aula 201',
    type: 'class',
    userId: 'dummy-user'
  },
  {
    id: '2',
    subjectId: '2', // Programación
    dayOfWeek: 1,
    startTime: '10:30',
    endTime: '12:30',
    classroom: 'Lab 101',
    type: 'lab',
    userId: 'dummy-user'
  },
  {
    id: '3',
    subjectId: '3', // Álgebra
    dayOfWeek: 1,
    startTime: '14:00',
    endTime: '16:00',
    classroom: 'Aula 305',
    type: 'class',
    userId: 'dummy-user'
  },
  
  // Martes
  {
    id: '4',
    subjectId: '4', // Física
    dayOfWeek: 2,
    startTime: '08:00',
    endTime: '10:00',
    classroom: 'Aula 401',
    type: 'class',
    userId: 'dummy-user'
  },
  {
    id: '5',
    subjectId: '1', // Cálculo I
    dayOfWeek: 2,
    startTime: '10:30',
    endTime: '12:30',
    classroom: 'Aula 201',
    type: 'tutorial',
    userId: 'dummy-user'
  },
  {
    id: '6',
    subjectId: '5', // Química
    dayOfWeek: 2,
    startTime: '14:00',
    endTime: '17:00',
    classroom: 'Lab Química',
    type: 'lab',
    userId: 'dummy-user'
  },
  
  // Miércoles
  {
    id: '7',
    subjectId: '2', // Programación
    dayOfWeek: 3,
    startTime: '08:00',
    endTime: '10:00',
    classroom: 'Aula 102',
    type: 'class',
    userId: 'dummy-user'
  },
  {
    id: '8',
    subjectId: '3', // Álgebra
    dayOfWeek: 3,
    startTime: '10:30',
    endTime: '12:30',
    classroom: 'Aula 305',
    type: 'class',
    userId: 'dummy-user'
  },
  {
    id: '9',
    subjectId: '4', // Física
    dayOfWeek: 3,
    startTime: '14:00',
    endTime: '17:00',
    classroom: 'Lab Física',
    type: 'lab',
    userId: 'dummy-user'
  },
  
  // Jueves
  {
    id: '10',
    subjectId: '1', // Cálculo I
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '10:00',
    classroom: 'Aula 201',
    type: 'class',
    userId: 'dummy-user'
  },
  {
    id: '11',
    subjectId: '5', // Química
    dayOfWeek: 4,
    startTime: '10:30',
    endTime: '12:30',
    classroom: 'Aula 501',
    type: 'class',
    userId: 'dummy-user'
  },
  {
    id: '12',
    subjectId: '2', // Programación
    dayOfWeek: 4,
    startTime: '14:00',
    endTime: '17:00',
    classroom: 'Lab 102',
    type: 'lab',
    userId: 'dummy-user'
  },
  
  // Viernes
  {
    id: '13',
    subjectId: '3', // Álgebra
    dayOfWeek: 5,
    startTime: '08:00',
    endTime: '10:00',
    classroom: 'Aula 305',
    type: 'class',
    userId: 'dummy-user'
  },
  {
    id: '14',
    subjectId: '4', // Física
    dayOfWeek: 5,
    startTime: '10:30',
    endTime: '12:30',
    classroom: 'Aula 401',
    type: 'class',
    userId: 'dummy-user'
  },
  {
    id: '15',
    subjectId: '5', // Química
    dayOfWeek: 5,
    startTime: '14:00',
    endTime: '16:00',
    classroom: 'Lab Química',
    type: 'tutorial',
    userId: 'dummy-user'
  }
];

// Días de la semana
export const weekDays = [
  { id: 1, name: 'Lunes', short: 'Lun' },
  { id: 2, name: 'Martes', short: 'Mar' },
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' },
  { id: 5, name: 'Viernes', short: 'Vie' }
];

// Horas del día para la vista de grid
export const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

// Función para obtener la materia por ID
export const getSubjectById = (id: string): Subject | undefined => {
  return dummySubjects.find(subject => subject.id === id);
};

// Función para obtener horarios por día
export const getSchedulesByDay = (dayOfWeek: number): Schedule[] => {
  return dummySchedules.filter(schedule => schedule.dayOfWeek === dayOfWeek);
};
