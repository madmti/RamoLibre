import type { 
  Subject, 
  Grade, 
  GradeCategory, 
  SubjectGradeConfig, 
  GradeCalculationResult,
  RequiredGrade 
} from '@ramo-libre/shared';
import { currentCategories } from '../stores/categories';
import { currentSubjectGradeConfigs } from '../stores/config';
import { get } from 'svelte/store';

// Tipo para el GradeManager que coincida con la interfaz esperada
interface IGradeManager {
  subscribe: (run: (value: Grade[]) => void) => () => void;
}

export type AvailableMethods = 'LP_MIN_PASSING_DISTANCE';

/**
 * Calculadora de notas moderna con soporte para múltiples métodos de cálculo.
 * 
 * Métodos disponibles:
 * - LP_MIN_PASSING_DISTANCE: Usa programación lineal para minimizar la distancia a la nota de aprobación
 */
export class GradeCalculator {

  /**
   * Función principal de cálculo que actúa como dispatcher para diferentes métodos
   */
  calculate(
    subject: Subject,
    gradeManager: IGradeManager,
    method: AvailableMethods
  ): GradeCalculationResult {
    // Obtener datos necesarios
    const grades = this.getGradesBySubject(gradeManager, subject.id);
    const categories = this.getCategoriesBySubject(subject.id);
    const config = this.getSubjectConfig(subject.id);

    // Validar que tenemos una configuración válida
    if (!config) {
      return this.createErrorResult(subject.id, 'No se encontró configuración para esta materia');
    }

    // Calcular nota actual
    const currentGrade = this.calculateCurrentGrade(grades, categories);

    // Dispatch al método específico
    switch (method) {
      case 'LP_MIN_PASSING_DISTANCE':
        return this.calculateWithLinearProgramming(subject.id, grades, categories, config, currentGrade);
      default:
        return this.createErrorResult(subject.id, `Método de cálculo desconocido: ${method}`);
    }
  }

  /**
   * Calcula la nota actual usando la fórmula: ∑ c_i · w_i · s_i
   * donde c_i = nota normalizada, w_i = peso de la nota, s_i = peso de la sección
   */
  private calculateCurrentGrade(
    grades: Grade[], 
    categories: GradeCategory[]
  ): number {
    if (grades.length === 0) return 0;

    // Filtrar solo las notas que tienen valor asignado
    const gradesWithValue = grades.filter(g => g.value !== undefined && g.value !== null);
    if (gradesWithValue.length === 0) return 0;

    let totalWeightedGrade = 0;

    // Procesar cada nota individualmente usando la fórmula: ∑ c_i · w_i · s_i
    for (const grade of gradesWithValue) {
      // c_i: Normalizar la nota a la escala del config (asumiendo que las notas están en la escala correcta)
      const normalizedGrade = grade.value!;
      
      // w_i: Peso de la nota individual
      const gradeWeight = grade.weight / 100;
      
      // s_i: Peso de la sección/categoría (1.0 si no tiene categoría)
      let sectionWeight = 1.0; // Default para notas sin categoría
      
      if (grade.categoryId) {
        // Buscar la categoría correspondiente
        const category = categories.find(c => c.id === grade.categoryId);
        if (category) {
          sectionWeight = category.weight / 100;
        }
      }
      
      // Aplicar la fórmula: c_i · w_i · s_i
      const contribution = normalizedGrade * gradeWeight * sectionWeight;
      totalWeightedGrade += contribution;
    }

    return totalWeightedGrade;
  }

  /**
   * Método de cálculo usando programación lineal (versión simplificada sin GLPK)
   * Se enfoca en encontrar la distribución mínima necesaria para aprobar
   */
  private calculateWithLinearProgramming(
    subjectId: string,
    grades: Grade[],
    categories: GradeCategory[],
    config: SubjectGradeConfig,
    currentGrade: number
  ): GradeCalculationResult {
    const targetGrade = config.passingGrade;
    
    // Identificar notas variables (sin valor)
    const variableGrades = grades.filter(g => g.value === undefined || g.value === null);
    
    if (variableGrades.length === 0) {
      // Ya tiene todas las notas necesarias
      return {
        subjectId,
        currentGrade,
        canPass: currentGrade >= targetGrade,
        requiredGrades: [],
        recommendations: currentGrade >= targetGrade 
          ? ['¡Felicitaciones! Ya tienes la nota suficiente para aprobar.']
          : ['No es posible mejorar la nota con las evaluaciones actuales.'],
        calculatedAt: new Date().toISOString()
      };
    }

    // Calcular contribución actual y necesaria
    const currentContribution = this.calculateCurrentContribution(grades, categories);
    const requiredContribution = targetGrade - currentContribution;

    // Si ya pasamos, no necesitamos calcular más
    if (requiredContribution <= 0) {
      return {
        subjectId,
        currentGrade,
        canPass: true,
        requiredGrades: variableGrades.map(grade => ({
          categoryId: grade.categoryId || 'no-category',
          categoryName: this.getGradeName(grade, categories),
          requiredValue: config.minGrade,
          achievable: config.minGrade <= config.maxGrade,
          description: `Nota mínima sugerida: ${config.minGrade.toFixed(1)} en "${grade.description}"`
        })),
        recommendations: ['Ya tienes suficiente nota para aprobar. Las notas sugeridas son mínimas.'],
        calculatedAt: new Date().toISOString()
      };
    }

    // Calcular pesos efectivos de las notas variables
    const variableWeights = variableGrades.map(grade => {
      const gradeWeight = grade.weight / 100;
      const categoryWeight = grade.categoryId 
        ? (categories.find(c => c.id === grade.categoryId)?.weight || 100) / 100
        : 1.0;
      return gradeWeight * categoryWeight;
    });

    const totalVariableWeight = variableWeights.reduce((sum, weight) => sum + weight, 0);

    // Si no hay peso en las variables, no se puede pasar
    if (totalVariableWeight === 0) {
      return {
        subjectId,
        currentGrade,
        canPass: false,
        requiredGrades: [],
        recommendations: ['No es posible aprobar: las evaluaciones restantes no tienen peso.'],
        calculatedAt: new Date().toISOString()
      };
    }

    // Calcular notas requeridas usando distribución proporcional equilibrada
    const requiredGrades: RequiredGrade[] = [];
    const recommendations: string[] = [];

    // Método simplificado: distribuir equitativamente la contribución necesaria
    const baseContributionPerGrade = requiredContribution / variableGrades.length;
    let totalDistributedContribution = 0;

    for (let i = 0; i < variableGrades.length; i++) {
      const grade = variableGrades[i];
      const effectiveWeight = variableWeights[i];
      
      // Calcular nota requerida para esta contribución
      let requiredValue = effectiveWeight > 0 ? baseContributionPerGrade / effectiveWeight : config.maxGrade;
      
      // Ajustar si excede los límites
      if (requiredValue > config.maxGrade) {
        requiredValue = config.maxGrade;
      }
      if (requiredValue < config.minGrade) {
        requiredValue = config.minGrade;
      }

      const gradeName = this.getGradeName(grade, categories);
      const categoryName = grade.categoryId 
        ? categories.find(c => c.id === grade.categoryId)?.name || 'Sin categoría'
        : 'Sin categoría';

      requiredGrades.push({
        categoryId: grade.categoryId || 'no-category',
        categoryName: gradeName,
        requiredValue: Math.round(requiredValue * 10) / 10,
        achievable: requiredValue <= config.maxGrade,
        description: `Se necesita una nota de ${requiredValue.toFixed(1)} en "${grade.description}" (${categoryName})`
      });

      totalDistributedContribution += requiredValue * effectiveWeight;

      // Generar recomendaciones
      if (requiredValue >= config.maxGrade * 0.9) {
        recommendations.push(`🔥 ${gradeName}: Nota muy alta requerida (${requiredValue.toFixed(1)})`);
      } else if (requiredValue >= config.passingGrade * 1.2) {
        recommendations.push(`📈 ${gradeName}: Nota alta requerida (${requiredValue.toFixed(1)})`);
      } else {
        recommendations.push(`✅ ${gradeName}: Nota moderada requerida (${requiredValue.toFixed(1)})`);
      }
    }

    // Verificar si es posible aprobar
    const projectedGrade = currentContribution + totalDistributedContribution;
    const canPass = projectedGrade >= targetGrade && requiredGrades.every(rg => rg.requiredValue <= config.maxGrade);

    if (!canPass) {
      recommendations.unshift('❌ No es posible aprobar con las evaluaciones restantes');
    } else {
      recommendations.unshift('✅ Es posible aprobar con las notas calculadas');
    }

    return {
      subjectId,
      currentGrade,
      canPass,
      requiredGrades,
      recommendations,
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Calcula la contribución actual de las notas existentes
   */
  private calculateCurrentContribution(
    grades: Grade[],
    categories: GradeCategory[]
  ): number {
    let currentContribution = 0;
    
    const gradesWithValue = grades.filter(g => g.value !== undefined && g.value !== null);
    
    for (const grade of gradesWithValue) {
      const gradeWeight = grade.weight / 100;
      const categoryWeight = grade.categoryId 
        ? (categories.find(c => c.id === grade.categoryId)?.weight || 100) / 100
        : 1.0;
      
      currentContribution += grade.value! * gradeWeight * categoryWeight;
    }
    
    return currentContribution;
  }

  /**
   * Obtiene un nombre descriptivo para una nota
   */
  private getGradeName(grade: Grade, categories: GradeCategory[]): string {
    const categoryName = grade.categoryId 
      ? categories.find(c => c.id === grade.categoryId)?.name || 'Sin categoría'
      : 'Sin categoría';
    
    return `${categoryName} - ${grade.description || 'Nota'}`;
  }

  /**
   * Crea un resultado de error
   */
  private createErrorResult(subjectId: string, errorMessage: string): GradeCalculationResult {
    return {
      subjectId,
      currentGrade: 0,
      canPass: false,
      requiredGrades: [],
      recommendations: [errorMessage],
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Obtiene las notas de una materia desde el store
   */
  private getGradesBySubject(gradeManager: IGradeManager, subjectId: string): Grade[] {
    const allGrades = get(gradeManager) as Grade[];
    return allGrades.filter(grade => grade.subjectId === subjectId);
  }

  /**
   * Obtiene las categorías de una materia desde el store
   */
  private getCategoriesBySubject(subjectId: string): GradeCategory[] {
    const allCategories = get(currentCategories) as GradeCategory[];
    return allCategories.filter(category => category.subjectId === subjectId);
  }

  /**
   * Obtiene la configuración de una materia desde el store
   */
  private getSubjectConfig(subjectId: string): SubjectGradeConfig | null {
    const configs = get(currentSubjectGradeConfigs) as SubjectGradeConfig[];
    return configs.find(config => config.subjectId === subjectId) || null;
  }

/**
 * Determina el estado de la materia según el promedio actual, la nota de aprobación y si es posible aprobar.
 */
public getSubjectStatus(
    currentAvg: number,
    passingGrade: number,
    canPass: boolean
): 'Aprobado' | 'En curso' | 'Reprobado' {
    if (currentAvg >= passingGrade) {
        return 'Aprobado';
    }
    if (canPass) {
        return 'En curso';
    }
    return 'Reprobado';
}
}

// Instancia singleton del calculador
export const gradeCalculator = new GradeCalculator();
