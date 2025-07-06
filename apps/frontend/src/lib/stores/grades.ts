import { writable, get, derived } from 'svelte/store';
import { gradeCalculator } from '$lib/utils/gradeCalculator';
import type { 
  Grade, 
  GradeCategory, 
  SubjectGradeConfig, 
  GradeCalculationResult,
  Subject 
} from '@ramo-libre/shared';

// Estados de los stores
export const grades = writable<Grade[]>([]);
export const gradeCategories = writable<GradeCategory[]>([]);
export const subjectGradeConfigs = writable<SubjectGradeConfig[]>([]);
export const isLoading = writable(false);

// Claves para localStorage
const GRADES_STORAGE_KEY = 'ramo-libre-grades';
const GRADE_CATEGORIES_STORAGE_KEY = 'ramo-libre-grade-categories';
const SUBJECT_GRADE_CONFIGS_STORAGE_KEY = 'ramo-libre-subject-grade-configs';

// Store derivado para cálculos de notas por materia
export const gradesBySubject = derived(
  [grades, gradeCategories, subjectGradeConfigs],
  ([allGrades, categories, configs]) => {
    const result: Record<string, {
      grades: Grade[];
      categories: GradeCategory[];
      config: SubjectGradeConfig | null;
      currentAverage: number;
    }> = {};

    // Agrupar por materia
    const subjectIds = new Set([
      ...allGrades.map(g => g.subjectId),
      ...categories.map(c => c.subjectId),
      ...configs.map(c => c.subjectId)
    ]);

    subjectIds.forEach(subjectId => {
      const subjectGrades = allGrades.filter(g => g.subjectId === subjectId);
      const subjectCategories = categories.filter(c => c.subjectId === subjectId);
      const subjectConfig = configs.find(c => c.subjectId === subjectId) || null;

      // Calcular promedio actual usando el gradeCalculator
      let currentAverage = 0;
      if (subjectGrades.length > 0 && subjectConfig) {
        currentAverage = gradeCalculator.calculateCurrentGrade(subjectGrades, subjectCategories, subjectConfig);
      } else if (subjectGrades.length > 0) {
        // Fallback si no hay configuración: promedio simple ponderado
        const gradesWithValue = subjectGrades.filter(g => g.value !== undefined && g.value !== null);
        if (gradesWithValue.length > 0) {
          const totalWeight = gradesWithValue.reduce((sum, g) => sum + g.weight, 0);
          const weightedSum = gradesWithValue.reduce((sum, g) => sum + (g.value! * g.weight), 0);
          currentAverage = totalWeight > 0 ? weightedSum / totalWeight : 0;
        }
      }

      result[subjectId] = {
        grades: subjectGrades,
        categories: subjectCategories,
        config: subjectConfig,
        currentAverage
      };
    });

    return result;
  }
);

// Servicio para manejar notas
class GradeService {
  // === GESTIÓN DE NOTAS ===
  
  loadGrades(): Grade[] {
    try {
      const stored = localStorage.getItem(GRADES_STORAGE_KEY);
      if (!stored) {
        grades.set([]);
        return [];
      }
      
      const data = JSON.parse(stored);
      if (!Array.isArray(data)) {
        console.warn('Invalid grades data in localStorage, resetting...');
        grades.set([]);
        return [];
      }
      
      const validGrades = data.filter(grade => 
        grade && 
        typeof grade === 'object' && 
        grade.id && 
        grade.subjectId &&
        (typeof grade.value === 'number' || grade.value === undefined || grade.value === null) // Permitir notas variables
      );
      
      grades.set(validGrades);
      return validGrades;
    } catch (error) {
      console.error('Error loading grades:', error);
      localStorage.removeItem(GRADES_STORAGE_KEY);
      grades.set([]);
      return [];
    }
  }

  saveGrades(gradesToSave: Grade[]): void {
    try {
      localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(gradesToSave));
    } catch (error) {
      console.error('Error saving grades:', error);
    }
  }

  addGrade(gradeData: Omit<Grade, 'id'>, userId?: string): void {
    // Usar un userId por defecto si no se proporciona
    const finalUserId = userId || 'anonymous';
    const newGrade: Grade = {
      ...gradeData,
      id: crypto.randomUUID(),
    };

    const currentGrades = get(grades);
    const updatedGrades = [...currentGrades, newGrade];
    
    grades.set(updatedGrades);
    this.saveGrades(updatedGrades);
  }

  updateGrade(gradeId: string, gradeData: Partial<Omit<Grade, 'id' | 'userId'>>): void {
    const currentGrades = get(grades);
    const gradeIndex = currentGrades.findIndex(g => g.id === gradeId);
    
    if (gradeIndex === -1) {
      console.error('Grade not found:', gradeId);
      return;
    }

    const updatedGrades = [...currentGrades];
    updatedGrades[gradeIndex] = { ...updatedGrades[gradeIndex], ...gradeData };
    
    grades.set(updatedGrades);
    this.saveGrades(updatedGrades);
  }

  deleteGrade(gradeId: string): void {
    const currentGrades = get(grades);
    const updatedGrades = currentGrades.filter(g => g.id !== gradeId);
    
    grades.set(updatedGrades);
    this.saveGrades(updatedGrades);
  }

  getGradesBySubject(subjectId: string): Grade[] {
    return get(grades).filter(g => g.subjectId === subjectId);
  }

  // === GESTIÓN DE CATEGORÍAS ===

  loadGradeCategories(): GradeCategory[] {
    try {
      const stored = localStorage.getItem(GRADE_CATEGORIES_STORAGE_KEY);
      if (!stored) {
        gradeCategories.set([]);
        return [];
      }
      
      const data = JSON.parse(stored);
      if (!Array.isArray(data)) {
        console.warn('Invalid grade categories data in localStorage, resetting...');
        gradeCategories.set([]);
        return [];
      }
      
      const validCategories = data.filter(category => 
        category && 
        typeof category === 'object' && 
        category.id && 
        category.subjectId && 
        category.name
      );
      
      gradeCategories.set(validCategories);
      return validCategories;
    } catch (error) {
      console.error('Error loading grade categories:', error);
      localStorage.removeItem(GRADE_CATEGORIES_STORAGE_KEY);
      gradeCategories.set([]);
      return [];
    }
  }

  saveGradeCategories(categoriesToSave: GradeCategory[]): void {
    try {
      localStorage.setItem(GRADE_CATEGORIES_STORAGE_KEY, JSON.stringify(categoriesToSave));
    } catch (error) {
      console.error('Error saving grade categories:', error);
    }
  }

  addGradeCategory(categoryData: Omit<GradeCategory, 'id' | 'createdAt'>, userId?: string): void {
    // Usar un userId por defecto si no se proporciona
    const finalUserId = userId || 'anonymous';
    const newCategory: GradeCategory = {
      ...categoryData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    const currentCategories = get(gradeCategories);
    const updatedCategories = [...currentCategories, newCategory];
    
    gradeCategories.set(updatedCategories);
    this.saveGradeCategories(updatedCategories);
  }

  updateGradeCategory(categoryId: string, categoryData: Partial<Omit<GradeCategory, 'id' | 'userId' | 'createdAt'>>): void {
    const currentCategories = get(gradeCategories);
    const categoryIndex = currentCategories.findIndex(c => c.id === categoryId);
    
    if (categoryIndex === -1) {
      console.error('Grade category not found:', categoryId);
      return;
    }

    const updatedCategories = [...currentCategories];
    updatedCategories[categoryIndex] = { ...updatedCategories[categoryIndex], ...categoryData };
    
    gradeCategories.set(updatedCategories);
    this.saveGradeCategories(updatedCategories);
  }

  deleteGradeCategory(categoryId: string): void {
    const currentCategories = get(gradeCategories);
    const updatedCategories = currentCategories.filter(c => c.id !== categoryId);
    
    gradeCategories.set(updatedCategories);
    this.saveGradeCategories(updatedCategories);
  }

  getCategoriesBySubject(subjectId: string): GradeCategory[] {
    return get(gradeCategories).filter(c => c.subjectId === subjectId);
  }

  // === GESTIÓN DE CONFIGURACIONES ===

  loadSubjectGradeConfigs(): SubjectGradeConfig[] {
    try {
      const stored = localStorage.getItem(SUBJECT_GRADE_CONFIGS_STORAGE_KEY);
      if (!stored) {
        subjectGradeConfigs.set([]);
        return [];
      }
      
      const data = JSON.parse(stored);
      if (!Array.isArray(data)) {
        console.warn('Invalid subject grade configs data in localStorage, resetting...');
        subjectGradeConfigs.set([]);
        return [];
      }
      
      const validConfigs = data.filter(config => 
        config && 
        typeof config === 'object' && 
        config.id && 
        config.subjectId
      );
      
      subjectGradeConfigs.set(validConfigs);
      return validConfigs;
    } catch (error) {
      console.error('Error loading subject grade configs:', error);
      localStorage.removeItem(SUBJECT_GRADE_CONFIGS_STORAGE_KEY);
      subjectGradeConfigs.set([]);
      return [];
    }
  }

  saveSubjectGradeConfigs(configsToSave: SubjectGradeConfig[]): void {
    try {
      localStorage.setItem(SUBJECT_GRADE_CONFIGS_STORAGE_KEY, JSON.stringify(configsToSave));
    } catch (error) {
      console.error('Error saving subject grade configs:', error);
    }
  }

  addOrUpdateSubjectGradeConfig(configData: Omit<SubjectGradeConfig, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): void {
    // Usar un userId por defecto si no se proporciona
    const finalUserId = userId || 'anonymous';
    const currentConfigs = get(subjectGradeConfigs);
    const existingConfigIndex = currentConfigs.findIndex(c => c.subjectId === configData.subjectId);

    if (existingConfigIndex >= 0) {
      // Actualizar configuración existente
      const updatedConfigs = [...currentConfigs];
      updatedConfigs[existingConfigIndex] = {
        ...updatedConfigs[existingConfigIndex],
        ...configData,
        updatedAt: new Date().toISOString()
      };
      
      subjectGradeConfigs.set(updatedConfigs);
      this.saveSubjectGradeConfigs(updatedConfigs);
    } else {
      // Crear nueva configuración
      const newConfig: SubjectGradeConfig = {
        ...configData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedConfigs = [...currentConfigs, newConfig];
      
      subjectGradeConfigs.set(updatedConfigs);
      this.saveSubjectGradeConfigs(updatedConfigs);
    }
  }

  deleteSubjectGradeConfig(subjectId: string): void {
    const currentConfigs = get(subjectGradeConfigs);
    const updatedConfigs = currentConfigs.filter(c => c.subjectId !== subjectId);
    
    subjectGradeConfigs.set(updatedConfigs);
    this.saveSubjectGradeConfigs(updatedConfigs);
  }

  getSubjectGradeConfig(subjectId: string): SubjectGradeConfig | null {
    return get(subjectGradeConfigs).find(c => c.subjectId === subjectId) || null;
  }

  // Inicializar servicio
  initialize(): void {
    this.loadGrades();
    this.loadGradeCategories();
    this.loadSubjectGradeConfigs();
  }

  // Limpiar todos los datos
  clearAllData(): void {
    grades.set([]);
    gradeCategories.set([]);
    subjectGradeConfigs.set([]);
    
    localStorage.removeItem(GRADES_STORAGE_KEY);
    localStorage.removeItem(GRADE_CATEGORIES_STORAGE_KEY);
    localStorage.removeItem(SUBJECT_GRADE_CONFIGS_STORAGE_KEY);
  }
}

// Instancia del servicio
export const gradeService = new GradeService();
