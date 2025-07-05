import GLPK from 'glpk.js';
import type { 
  Grade, 
  GradeCategory, 
  SubjectGradeConfig, 
  GradeCalculationResult,
  RequiredGrade 
} from '@ramo-libre/shared';

export class GradeCalculator {
  private glpk: any;

  constructor() {
    // Inicializar GLPK de forma asíncrona
    this.initGLPK();
  }

  private async initGLPK() {
    try {
      this.glpk = await GLPK();
    } catch (error) {
      console.error('Error initializing GLPK:', error);
    }
  }

  /**
   * Calcula la nota actual de una materia basada en las notas existentes y categorías
   * Usa la fórmula: ∑ c_i · w_i · s_i
   * donde c_i = nota normalizada, w_i = peso de la nota, s_i = peso de la sección (1.0 si no tiene categoría)
   */
  calculateCurrentGrade(
    grades: Grade[], 
    categories: GradeCategory[], 
    config: SubjectGradeConfig
  ): number {
    if (grades.length === 0) return 0;

    // Filtrar solo las notas que tienen valor asignado
    const gradesWithValue = grades.filter(g => g.value !== undefined && g.value !== null);
    if (gradesWithValue.length === 0) return 0;

    let totalWeightedGrade = 0;

    // Procesar cada nota individualmente usando la fórmula: ∑ c_i · w_i · s_i
    for (const grade of gradesWithValue) {
      // c_i: Normalizar la nota a la escala del config
      const normalizedGrade = (grade.value! / grade.maxValue) * config.maxGrade;
      
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
      
      console.log(`Grade ${grade.description}: ${grade.value} -> normalized=${normalizedGrade}, gradeWeight=${gradeWeight}, sectionWeight=${sectionWeight}, contribution=${contribution}`);
    }

    console.log(`Total current grade: ${totalWeightedGrade}`);
    return totalWeightedGrade;
  }

  /**
   * Calcula qué notas se necesitan para aprobar usando programación lineal
   */
  async calculateRequiredGrades(
    currentGrades: Grade[],
    categories: GradeCategory[],
    config: SubjectGradeConfig
  ): Promise<GradeCalculationResult> {
    if (!this.glpk) {
      await this.initGLPK();
    }

    const currentGrade = this.calculateCurrentGrade(currentGrades, categories, config);
    const targetGrade = config.passingGrade;
    
    // Identificar notas variables que necesitan ser optimizadas
    const variableCategories = this.findVariableGrades(currentGrades, categories);
    
    if (variableCategories.length === 0) {
      // Ya tiene todas las notas necesarias
      return {
        subjectId: config.subjectId,
        currentGrade,
        possibleFinalGrades: {
          minimum: currentGrade,
          maximum: currentGrade,
          target: targetGrade
        },
        canPass: currentGrade >= targetGrade,
        requiredGrades: [],
        recommendations: currentGrade >= targetGrade 
          ? ['¡Felicitaciones! Ya tienes la nota suficiente para aprobar.']
          : ['No es posible mejorar la nota con las evaluaciones actuales.'],
        calculatedAt: new Date().toISOString()
      };
    }

    // Usar programación lineal para encontrar las notas mínimas requeridas
    const result = await this.solveGradeOptimization(
      currentGrades, 
      categories, 
      config, 
      variableCategories, 
      targetGrade
    );

    return {
      subjectId: config.subjectId,
      currentGrade,
      possibleFinalGrades: result.possibleGrades,
      canPass: result.canPass,
      requiredGrades: result.requiredGrades,
      recommendations: result.recommendations,
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Resuelve el problema de optimización usando GLPK
   */
  private async solveGradeOptimization(
    currentGrades: Grade[],
    categories: GradeCategory[],
    config: SubjectGradeConfig,
    variableCategories: { category: GradeCategory | null; variableGrades: Grade[] }[],
    targetGrade: number
  ): Promise<{
    possibleGrades: { minimum: number; maximum: number; target: number };
    canPass: boolean;
    requiredGrades: RequiredGrade[];
    recommendations: string[];
  }> {
    try {
      // Verificar que GLPK esté inicializado
      if (!this.glpk) {
        console.error('GLPK not initialized');
        return {
          possibleGrades: { minimum: 0, maximum: 0, target: targetGrade },
          canPass: false,
          requiredGrades: [],
          recommendations: ['Error: GLPK no está inicializado.']
        };
      }

      // Preparar variables de decisión (una por cada nota variable)
      const variables: string[] = [];
      const bounds: { name: string; type: number; ub: number; lb: number }[] = [];
      const variableMapping: { name: string; grade: Grade; categoryIndex: number; gradeIndex: number }[] = [];
      
      variableCategories.forEach((item, categoryIndex) => {
        item.variableGrades.forEach((grade, gradeIndex) => {
          const varName = `grade_${categoryIndex}_${gradeIndex}`;
          variables.push(varName);
          variableMapping.push({
            name: varName,
            grade,
            categoryIndex,
            gradeIndex
          });
          bounds.push({
            name: varName,
            type: this.glpk.GLP_DB, // Variable acotada por ambos lados
            lb: config.minGrade, // Nota mínima 
            ub: config.maxGrade // Nota máxima
          });
        });
      });

      if (variables.length === 0) {
        return {
          possibleGrades: { minimum: 0, maximum: 0, target: targetGrade },
          canPass: false,
          requiredGrades: [],
          recommendations: ['No hay evaluaciones pendientes.']
        };
      }

      // Crear el problema de optimización
      const problem = {
        name: 'Grade Optimization',
        objective: {
          direction: this.glpk.GLP_MIN,
          name: 'minimize_required_grades',
          vars: variables.map(v => ({ name: v, coef: 1.0 }))
        },
        subjectTo: this.createConstraints(currentGrades, categories, config, variableCategories, targetGrade, variableMapping),
        bounds
      };

      // Validar que el problema esté bien formado
      if (!problem.subjectTo || problem.subjectTo.length === 0) {
        console.error('No constraints generated for optimization problem');
        return {
          possibleGrades: { minimum: 0, maximum: 0, target: targetGrade },
          canPass: false,
          requiredGrades: [],
          recommendations: ['No se pudieron generar restricciones para la optimización.']
        };
      }

      if (!problem.bounds || problem.bounds.length === 0) {
        console.error('No bounds generated for optimization problem');
        return {
          possibleGrades: { minimum: 0, maximum: 0, target: targetGrade },
          canPass: false,
          requiredGrades: [],
          recommendations: ['No se pudieron generar límites para las variables.']
        };
      }

      // Resolver el problema
      console.log('GLPK Problem:', JSON.stringify(problem, null, 2));
      const solution = await this.glpk.solve(problem, this.glpk.GLP_MSG_ERR);
      console.log('GLPK Solution:', solution);

      // Validar que la solución tenga la estructura esperada
      if (!solution || !solution.result) {
        console.error('GLPK returned invalid solution structure:', solution);
        return {
          possibleGrades: { minimum: 0, maximum: 0, target: targetGrade },
          canPass: false,
          requiredGrades: [],
          recommendations: ['Error en la configuración del problema de optimización.']
        };
      }

      if (solution.result.status === this.glpk.GLP_OPT) {
        // Solución óptima encontrada - balancear las notas para evitar extremos
        const minRequiredGrades = this.extractRequiredGrades(solution, variableCategories, variables, variableMapping, config);
        
        // Calcular la contribución objetivo necesaria
        const targetContribution = this.calculateTargetContribution(currentGrades, categories, config, targetGrade);
        
        const balancedGrades = this.balanceGrades(minRequiredGrades, variableMapping, variableCategories, config, targetContribution);
        const projectedGrade = this.calculateProjectedGrade(currentGrades, categories, config, balancedGrades);
        
        return {
          possibleGrades: {
            minimum: projectedGrade,
            maximum: config.maxGrade,
            target: targetGrade
          },
          canPass: projectedGrade >= targetGrade,
          requiredGrades: balancedGrades,
          recommendations: this.generateRecommendations(balancedGrades, projectedGrade, targetGrade, config)
        };
      } else {
        // No se encontró solución factible
        console.warn('GLPK optimization failed with status:', solution.result.status);
        return {
          possibleGrades: { minimum: 0, maximum: 0, target: targetGrade },
          canPass: false,
          requiredGrades: [],
          recommendations: ['No es posible alcanzar la nota requerida con las evaluaciones restantes.']
        };
      }
    } catch (error) {
      console.error('Error in grade optimization:', error);
      return {
        possibleGrades: { minimum: 0, maximum: 0, target: targetGrade },
        canPass: false,
        requiredGrades: [],
        recommendations: ['Error en el cálculo. Por favor, verifica la configuración de la materia.']
      };
    }
  }

  /**
   * Crea las restricciones para el problema de optimización
   * Resuelve: ∑ x_i · w_i · s_i + ∑ c_i · w_i · s_i >= nota_minima_aprobar
   */
  private createConstraints(
    currentGrades: Grade[],
    categories: GradeCategory[],
    config: SubjectGradeConfig,
    variableCategories: { category: GradeCategory | null; variableGrades: Grade[] }[],
    targetGrade: number,
    variableMapping: { name: string; grade: Grade; categoryIndex: number; gradeIndex: number }[]
  ): any[] {
    console.log('Creating constraints with:', {
      currentGrades: currentGrades.length,
      categories: categories.length,
      variableCategories: variableCategories.length,
      variableMapping: variableMapping.length,
      targetGrade
    });

    const constraints = [];

    // Restricción principal: la nota final debe ser >= nota objetivo
    const finalGradeConstraint = {
      name: 'final_grade_constraint',
      vars: [] as any[],
      bnds: { type: this.glpk.GLP_LO, lb: 0, ub: config.maxGrade }
    };

    // Calcular la contribución actual (∑ c_i · w_i · s_i)
    let currentContribution = 0;
    console.log('Calculating current contribution...');
    
    // Contribución de notas en categorías
    for (const category of categories) {
      const categoryGrades = currentGrades.filter(g => g.categoryId === category.id && g.value !== undefined);
      const categoryWeight = category.weight / 100; // s_i (peso de la sección)
      
      console.log(`Category ${category.name}: ${categoryGrades.length} grades, weight: ${categoryWeight}`);
      
      for (const grade of categoryGrades) {
        const gradeWeight = grade.weight / 100; // w_i (peso de la nota)
        const normalizedGrade = (grade.value! / grade.maxValue) * config.maxGrade; // c_i normalizada
        const contribution = normalizedGrade * gradeWeight * categoryWeight;
        currentContribution += contribution;
        console.log(`  Grade ${grade.description}: ${grade.value} -> ${normalizedGrade}, contribution: ${contribution}`);
      }
    }

    // Contribución de notas sin categoría (peso de sección = 1.0)
    const noCategoryGrades = currentGrades.filter(g => !g.categoryId && g.value !== undefined);
    console.log(`No Category: ${noCategoryGrades.length} grades, weight: 1.0`);
    
    for (const grade of noCategoryGrades) {
      const gradeWeight = grade.weight / 100; // w_i (peso de la nota)
      const normalizedGrade = (grade.value! / grade.maxValue) * config.maxGrade; // c_i normalizada
      const contribution = normalizedGrade * gradeWeight; // Sin peso de categoría (s_i = 1.0)
      currentContribution += contribution;
      console.log(`  Grade ${grade.description}: ${grade.value} -> ${normalizedGrade}, contribution: ${contribution}`);
    }

    console.log('Current contribution:', currentContribution);

    // Agregar variables de las notas faltantes (∑ x_i · w_i · s_i)
    console.log('Adding variable constraints...');
    for (const mapping of variableMapping) {
      const categoryItem = variableCategories[mapping.categoryIndex];
      const categoryWeight = categoryItem.category ? (categoryItem.category.weight / 100) : 1.0; // s_i (peso de la sección, 1.0 si no hay categoría)
      const gradeWeight = mapping.grade.weight / 100; // w_i (peso real de la nota variable)
      const coefficient = gradeWeight * categoryWeight; // w_i · s_i
      
      console.log(`Variable ${mapping.name}: gradeWeight=${gradeWeight}, categoryWeight=${categoryWeight}, coef=${coefficient}`);
      
      finalGradeConstraint.vars.push({
        name: mapping.name,
        coef: coefficient
      });
    }

    // La restricción es: currentContribution + ∑(x_i · w_i · s_i) >= targetGrade
    // Reorganizado: ∑(x_i · w_i · s_i) >= targetGrade - currentContribution
    const requiredContribution = targetGrade - currentContribution;
    finalGradeConstraint.bnds.lb = requiredContribution;
    
    console.log(`Final constraint: sum(vars) >= ${requiredContribution}`);
    console.log('Variables in constraint:', finalGradeConstraint.vars.length);

    if (finalGradeConstraint.vars.length === 0) {
      console.error('No variables in constraint!');
      return [];
    }

    constraints.push(finalGradeConstraint);
    console.log('Generated constraints:', constraints.length);
    return constraints;
  }

  /**
   * Extrae las notas requeridas de la solución
   */
  private extractRequiredGrades(
    solution: any,
    variableCategories: { category: GradeCategory | null; variableGrades: Grade[] }[],
    variables: string[],
    variableMapping: { name: string; grade: Grade; categoryIndex: number; gradeIndex: number }[],
    config: SubjectGradeConfig
  ): RequiredGrade[] {
    const requiredGrades: RequiredGrade[] = [];

    // Extraer cada nota individual requerida
    for (const mapping of variableMapping) {
      const categoryItem = variableCategories[mapping.categoryIndex];
      const gradeValue = solution.result.vars[mapping.name];
      const grade = mapping.grade;
      
      // Crear el identificador de la nota
      const categoryName = categoryItem.category ? categoryItem.category.name : 'Sin categoría';
      const gradeDescription = grade.description || `Nota ${mapping.gradeIndex + 1}`;
      
      requiredGrades.push({
        categoryId: categoryItem.category ? categoryItem.category.id : 'no-category',
        categoryName: `${categoryName} - ${gradeDescription}`,
        requiredValue: Math.round(gradeValue * 10) / 10,
        description: `Se necesita una nota de ${(Math.round(gradeValue * 10) / 10).toFixed(1)} en "${gradeDescription}" ${categoryItem.category ? `(${categoryName})` : '(Sin categoría)'}`,
        achievable: gradeValue <= config.maxGrade && gradeValue >= config.minGrade
      });
    }

    return requiredGrades;
  }

  /**
   * Calcula la nota proyectada con las notas requeridas
   * Usa la misma fórmula: ∑ x_i · w_i · s_i + ∑ c_i · w_i · s_i
   */
  private calculateProjectedGrade(
    currentGrades: Grade[],
    categories: GradeCategory[],
    config: SubjectGradeConfig,
    requiredGrades: RequiredGrade[]
  ): number {
    let totalWeightedGrade = 0;

    // Contribución de notas actuales en categorías
    categories.forEach(category => {
      const categoryGrades = currentGrades.filter(g => g.categoryId === category.id && g.value !== undefined);
      const categoryWeight = category.weight / 100; // s_i

      // Contribución de notas actuales (∑ c_i · w_i · s_i)
      for (const grade of categoryGrades) {
        const gradeWeight = grade.weight / 100; // w_i
        const normalizedGrade = (grade.value! / grade.maxValue) * config.maxGrade; // c_i
        totalWeightedGrade += normalizedGrade * gradeWeight * categoryWeight;
      }
    });

    // Contribución de notas actuales sin categoría (peso de sección = 1.0)
    const noCategoryGrades = currentGrades.filter(g => !g.categoryId && g.value !== undefined);
    
    for (const grade of noCategoryGrades) {
      const gradeWeight = grade.weight / 100; // w_i
      const normalizedGrade = (grade.value! / grade.maxValue) * config.maxGrade; // c_i
      totalWeightedGrade += normalizedGrade * gradeWeight; // Sin peso de categoría (s_i = 1.0)
    }

    // Contribución de notas variables requeridas
    const variableGrades = currentGrades.filter(g => g.value === undefined);
    
    for (const variableGrade of variableGrades) {
      // Buscar la nota requerida correspondiente por descripción
      const requiredGrade = requiredGrades.find(rg => 
        rg.categoryName.includes(variableGrade.description || '')
      );
      
      if (requiredGrade) {
        const gradeWeight = variableGrade.weight / 100; // w_i
        
        if (variableGrade.categoryId) {
          // Nota con categoría
          const category = categories.find(c => c.id === variableGrade.categoryId);
          if (category) {
            const categoryWeight = category.weight / 100; // s_i
            totalWeightedGrade += requiredGrade.requiredValue * gradeWeight * categoryWeight;
          }
        } else {
          // Nota sin categoría (s_i = 1.0)
          totalWeightedGrade += requiredGrade.requiredValue * gradeWeight;
        }
      }
    }

    return totalWeightedGrade;
  }

  /**
   * Genera recomendaciones basadas en los resultados
   */
  private generateRecommendations(
    requiredGrades: RequiredGrade[],
    projectedGrade: number,
    targetGrade: number,
    config: SubjectGradeConfig
  ): string[] {
    const recommendations: string[] = [];

    // Estado del curso
    if (projectedGrade >= targetGrade) {
      recommendations.push('📊 Estado: En curso - Es posible aprobar');
    } else {
      recommendations.push('📊 Estado: En riesgo - No es posible aprobar con las evaluaciones restantes');
    }

    // Calcular rangos dinámicos basados en la escala
    const scale = config.maxGrade - config.minGrade;
    const veryHighThreshold = config.minGrade + (scale * 0.85); // 85% de la escala
    const highThreshold = config.minGrade + (scale * 0.70);     // 70% de la escala
    const moderateThreshold = config.passingGrade;              // Nota de aprobación

    // Detalles por nota individual
    requiredGrades.forEach(rg => {
      if (!rg.achievable) {
        recommendations.push(`❌ ${rg.categoryName}: Nota requerida (${rg.requiredValue}) imposible de alcanzar`);
      } else if (rg.requiredValue >= veryHighThreshold) {
        recommendations.push(`🔥 ${rg.categoryName}: Se necesita una nota muy alta (${rg.requiredValue})`);
      } else if (rg.requiredValue >= highThreshold) {
        recommendations.push(`📈 ${rg.categoryName}: Se necesita una nota alta (${rg.requiredValue})`);
      } else if (rg.requiredValue >= moderateThreshold) {
        recommendations.push(`✅ ${rg.categoryName}: Se necesita una nota moderada (${rg.requiredValue})`);
      } else {
        recommendations.push(`💚 ${rg.categoryName}: Se necesita una nota baja (${rg.requiredValue})`);
      }
    });

    return recommendations;
  }

  /**
   * Identifica las notas variables (sin valor) que necesitan ser optimizadas
   */
  private findVariableGrades(
    currentGrades: Grade[],
    categories: GradeCategory[]
  ): { category: GradeCategory | null; variableGrades: Grade[] }[] {
    const variablesByCategory: { category: GradeCategory | null; variableGrades: Grade[] }[] = [];

    // Procesar categorías existentes
    categories.forEach(category => {
      // Encontrar notas variables en esta categoría
      const variableGrades = currentGrades.filter(g => 
        g.categoryId === category.id && g.value === undefined
      );
      
      if (variableGrades.length > 0) {
        variablesByCategory.push({
          category,
          variableGrades
        });
      } else if (category.weight > 0) {
        // Si no hay notas en una categoría con peso, crear una nota variable temporal
        const tempGrade: Grade = {
          id: `temp_${category.id}`,
          subjectId: '',
          userId: '',
          value: undefined,
          maxValue: 7, // Usar valor por defecto
          description: `Nota faltante en ${category.name}`,
          date: new Date().toISOString().split('T')[0],
          type: 'other',
          weight: 100, // Peso completo de la categoría
          categoryId: category.id
        };
        
        variablesByCategory.push({
          category,
          variableGrades: [tempGrade]
        });
      }
    });

    // Procesar notas variables SIN categoría (peso de sección = 1.0)
    const variableGradesWithoutCategory = currentGrades.filter(g => 
      !g.categoryId && g.value === undefined
    );
    
    if (variableGradesWithoutCategory.length > 0) {
      variablesByCategory.push({
        category: null, // Sin categoría
        variableGrades: variableGradesWithoutCategory
      });
    }

    return variablesByCategory;
  }

  /**
   * Determina el estado actual del curso
   */
  getSubjectStatus(
    currentGrade: number,
    targetGrade: number,
    canPass: boolean
  ): 'Aprobado' | 'En curso' | 'Reprobado' {
    if (currentGrade >= targetGrade) {
      return 'Aprobado';
    } else if (canPass) {
      return 'En curso';
    } else {
      return 'Reprobado';
    }
  }

  /**
   * Mapea nombres de categorías a tipos de notas
   */
  private mapCategoryToGradeType(categoryName: string): Grade['type'] {
    const name = categoryName.toLowerCase();
    if (name.includes('examen') || name.includes('exam')) return 'exam';
    if (name.includes('tarea') || name.includes('homework')) return 'homework';
    if (name.includes('proyecto') || name.includes('project')) return 'project';
    if (name.includes('participacion') || name.includes('participation')) return 'participation';
    return 'other';
  }

  /**
   * Balancea las notas requeridas para evitar soluciones extremas
   */
  private balanceGrades(
    requiredGrades: RequiredGrade[],
    variableMapping: { name: string; grade: Grade; categoryIndex: number; gradeIndex: number }[],
    variableCategories: { category: GradeCategory | null; variableGrades: Grade[] }[],
    config: SubjectGradeConfig,
    targetContribution: number
  ): RequiredGrade[] {
    if (requiredGrades.length <= 1) {
      return requiredGrades; // No hay nada que balancear
    }

    // Calcular pesos relativos para distribución proporcional
    let totalWeight = 0;
    const weights: number[] = [];
    
    for (let i = 0; i < variableMapping.length; i++) {
      const mapping = variableMapping[i];
      const categoryItem = variableCategories[mapping.categoryIndex];
      const gradeWeight = mapping.grade.weight / 100;
      const categoryWeight = categoryItem.category ? (categoryItem.category.weight / 100) : 1.0;
      const effectiveWeight = gradeWeight * categoryWeight;
      
      weights.push(effectiveWeight);
      totalWeight += effectiveWeight;
    }

    // Distribución inicial proporcional al peso
    const balancedGrades: RequiredGrade[] = [];
    let distributedContribution = 0;
    
    for (let i = 0; i < requiredGrades.length; i++) {
      const originalGrade = requiredGrades[i];
      const mapping = variableMapping[i];
      const categoryItem = variableCategories[mapping.categoryIndex];
      
      // Calcular una nota basada en distribución proporcional
      const weightRatio = weights[i] / totalWeight;
      const contributionNeeded = targetContribution * weightRatio;
      const gradeNeeded = contributionNeeded / weights[i];
      
      // Suavizar mezclando con el promedio
      const averageGrade = targetContribution / totalWeight; // Promedio simple
      const smoothedGrade = (gradeNeeded * 0.6) + (averageGrade * 0.4);
      
      // Asegurar que esté dentro de los límites
      const clampedValue = Math.max(config.minGrade, Math.min(config.maxGrade, smoothedGrade));
      
      const categoryName = categoryItem.category ? categoryItem.category.name : 'Sin categoría';
      
      balancedGrades.push({
        ...originalGrade,
        requiredValue: Math.round(clampedValue * 10) / 10,
        description: `Se necesita una nota de ${(Math.round(clampedValue * 10) / 10).toFixed(1)} en "${mapping.grade.description}" ${categoryItem.category ? `(${categoryName})` : '(Sin categoría)'}`
      });
      
      distributedContribution += clampedValue * weights[i];
    }
    
    // Ajuste final si la distribución no alcanza el objetivo
    if (distributedContribution < targetContribution) {
      const deficit = targetContribution - distributedContribution;
      const adjustmentPerGrade = deficit / requiredGrades.length;
      
      for (let i = 0; i < balancedGrades.length; i++) {
        const grade = balancedGrades[i];
        const mapping = variableMapping[i];
        const adjustedValue = grade.requiredValue + adjustmentPerGrade;
        const clampedValue = Math.max(config.minGrade, Math.min(config.maxGrade, adjustedValue));
        
        grade.requiredValue = Math.round(clampedValue * 10) / 10;
        grade.description = `Se necesita una nota de ${grade.requiredValue.toFixed(1)} en "${mapping.grade.description}" ${grade.categoryName.includes('Sin categoría') ? '(Sin categoría)' : `(${grade.categoryName.split(' - ')[0]})`}`;
      }
    }
    
    return balancedGrades;
  }

  /**
   * Calcula la contribución total de las notas balanceadas
   */
  private calculateTotalContributionForBalance(
    grades: RequiredGrade[],
    variableMapping: { name: string; grade: Grade; categoryIndex: number; gradeIndex: number }[],
    variableCategories: { category: GradeCategory | null; variableGrades: Grade[] }[]
  ): number {
    let totalContribution = 0;
    
    for (let i = 0; i < grades.length; i++) {
      const grade = grades[i];
      const mapping = variableMapping[i];
      const gradeWeight = mapping.grade.weight / 100;
      
      // Determinar el peso de la categoría
      const categoryItem = variableCategories[mapping.categoryIndex];
      const categoryWeight = categoryItem.category ? (categoryItem.category.weight / 100) : 1.0;
      
      totalContribution += grade.requiredValue * gradeWeight * categoryWeight;
    }
    
    return totalContribution;
  }

  /**
   * Calcula la contribución objetivo necesaria de las notas variables
   */
  private calculateTargetContribution(
    currentGrades: Grade[],
    categories: GradeCategory[],
    config: SubjectGradeConfig,
    targetGrade: number
  ): number {
    // Calcular la contribución actual de las notas existentes
    let currentContribution = 0;
    
    // Contribución de notas en categorías
    for (const category of categories) {
      const categoryGrades = currentGrades.filter(g => g.categoryId === category.id && g.value !== undefined);
      const categoryWeight = category.weight / 100; // s_i (peso de la sección)
      
      for (const grade of categoryGrades) {
        const gradeWeight = grade.weight / 100; // w_i (peso de la nota)
        const normalizedGrade = (grade.value! / grade.maxValue) * config.maxGrade; // c_i normalizada
        currentContribution += normalizedGrade * gradeWeight * categoryWeight;
      }
    }

    // Contribución de notas sin categoría (peso de sección = 1.0)
    const noCategoryGrades = currentGrades.filter(g => !g.categoryId && g.value !== undefined);
    
    for (const grade of noCategoryGrades) {
      const gradeWeight = grade.weight / 100; // w_i (peso de la nota)
      const normalizedGrade = (grade.value! / grade.maxValue) * config.maxGrade; // c_i normalizada
      currentContribution += normalizedGrade * gradeWeight; // Sin peso de categoría (s_i = 1.0)
    }

    // La contribución objetivo de las notas variables es: targetGrade - currentContribution
    return targetGrade - currentContribution;
  }

}

// Instancia singleton del calculador
export const gradeCalculator = new GradeCalculator();
