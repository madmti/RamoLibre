import type {
	Subject,
	Grade,
	GradeCategory,
	SubjectGradeConfig,
	GradeCalculationResult,
	RequiredGrade,
} from '@ramo-libre/shared';
import { currentCategories } from '../stores/categories';
import { currentSubjectGradeConfigs } from '../stores/config';
import { currentGrades } from '../stores/grades';
import { get } from 'svelte/store';
import glpkInitializer from 'glpk.js';
import type { GLPK, LP, Result, Options } from 'glpk.js';
import Bigjs from 'big.js';
import { Big } from 'big.js';

Big.DP = 20;

export type AvailableMethods = 'LP_MIN_PASSING_DISTANCE' | 'LP_MIN';

export class GradeCalculator {
	private static isInitialized = false;
	private static glpk: GLPK | null = null;
	public static readonly availableMethods: AvailableMethods[] = [
		'LP_MIN',
		'LP_MIN_PASSING_DISTANCE',
	];
	private static readonly methods: Record<
		AvailableMethods,
		(
			grades: Grade[],
			categories: GradeCategory[],
			config: SubjectGradeConfig | null,
			unbounded?: boolean
		) => Promise<RequiredGrade[]>
	> = {
		LP_MIN: GradeCalculator.LP_MIN,
		LP_MIN_PASSING_DISTANCE: GradeCalculator.LP_MIN_PASSING_DISTANCE,
	};

	static async initialize() {
		if (GradeCalculator.isInitialized) return;
		GradeCalculator.glpk = await glpkInitializer();
		if (!GradeCalculator.glpk) {
			throw new Error('Failed to initialize GLPK');
		}
		GradeCalculator.isInitialized = true;
	}

	static currentContribution(grades: Grade[], categories: GradeCategory[]): Big {
		let total = new Bigjs(0);
		if (!grades.length) return total;
		for (const grade of grades) {
			const category = categories.find((cat) => cat.id === grade.categoryId);
			const weight = category ? new Bigjs(category.weight || 100) : new Bigjs(100);
			const value = new Bigjs(grade.value || 0);
			total = total.plus(value.times(weight.div(100)));
		}
		return total;
	}

	static projectedContribution(
		requiredGrades: RequiredGrade[],
		grades: Grade[],
		categories: GradeCategory[]
	): Big {
		let total = new Bigjs(0);
		if (!requiredGrades.length || !grades.length) return total;
		for (const required of requiredGrades) {
			const category = categories.find((cat) => cat.id === required.categoryId);
			const grade = grades.find((g) => g.id === required.id);
			const weight = category ? new Bigjs(category.weight || 100) : new Bigjs(100);
			const requiredValue = new Bigjs(required.requiredValue || 0);
			total = total.plus(requiredValue.times(weight.div(100)));
		}
		return total;
	}

	static recomendationsByRequiredGrades(
		requiredGrades: RequiredGrade[],
		config: SubjectGradeConfig,
		canPass: boolean,
		alreadyPassed: boolean
	): string[] {
		let recommendations: string[] = [];
		if (alreadyPassed) {
			recommendations.push(
				'Ya has aprobado este ramo. No es necesario calcular notas adicionales.'
			);
			return recommendations;
		}
		if (canPass) {
			recommendations.push('Con las notas requeridas, puedes aprobar el ramo.');
		} else {
			recommendations.push(
				'No puedes aprobar el ramo con las notas actuales.',
				'Considera mejorar tus notas o hablar con tu profesor.'
			);
		}
		requiredGrades.forEach((required) => {
			if (!required.achievable) {
				recommendations.push(
					`❌ No es posible alcanzar la nota requerida para ${required.description}`
				);
				return;
			}
			if (required.requiredValue >= config.maxGrade * 0.9) {
				recommendations.push(
					`🔥 ${required.description}: Nota muy alta requerida (${required.requiredValue.toFixed(1)})`
				);
			} else if (required.requiredValue >= config.passingGrade * 1.2) {
				recommendations.push(
					`📈 ${required.description}: Nota alta requerida (${required.requiredValue.toFixed(1)})`
				);
			} else if (required.requiredValue >= config.passingGrade) {
				recommendations.push(
					`✅ ${required.description}: Nota moderada requerida (${required.requiredValue.toFixed(1)})`
				);
			} else if (required.requiredValue > config.minGrade) {
				recommendations.push(
					`😄 ${required.description}: Nota baja requerida (${required.requiredValue.toFixed(1)})`
				);
			} else {
				recommendations.push(
					`🥳 ${required.description}: Nota muy baja requerida (${required.requiredValue.toFixed(1)})`
				);
			}
		});

		return recommendations;
	}

	static async calculate(
		subject: Subject,
		method: AvailableMethods
	): Promise<GradeCalculationResult> {
		if (!GradeCalculator.isInitialized) await GradeCalculator.initialize();
		// Obtener datos necesarios
		const allOfGrades = get(currentGrades);
		const grades: Grade[] = allOfGrades.filter((grade) => grade.subjectId === subject.id);
		const categories: GradeCategory[] = get(currentCategories).filter(
			(category) => category.subjectId === subject.id
		);
		const config: SubjectGradeConfig | null =
			get(currentSubjectGradeConfigs).find((c) => c.subjectId === subject.id) || null;

		if (!config) {
			return {
				subjectId: subject.id,
				currentGrade: 0,
				canPass: false,
				status: 'in progress',
				requiredGrades: [],
				recommendations: [
					'No hay configuración de notas para este ramo.',
					'Asegúrate de configurar las notas antes de calcular.',
				],
				calculatedAt: new Date().toISOString(),
			};
		}

		if (!grades.length) {
			return {
				subjectId: subject.id,
				currentGrade: 0,
				canPass: false,
				status: 'in progress',
				requiredGrades: [],
				recommendations: [
					'No hay notas registradas para este ramo.',
					'Asegúrate de ingresar las notas antes de calcular.',
				],
				calculatedAt: new Date().toISOString(),
			};
		}

		if (!GradeCalculator.methods[method]) {
			throw new Error(`Method ${method} is not supported`);
		}

		let result: RequiredGrade[] = await GradeCalculator.methods[method](
			grades,
			categories,
			config
		);
		const currentContribution = GradeCalculator.currentContribution(grades, categories);
		const projectedContribution = GradeCalculator.projectedContribution(
			result,
			grades,
			categories
		);
		const totalContribution = currentContribution.plus(projectedContribution);
		const canPass = totalContribution.gte(config?.passingGrade || 0);
		const alreadyPassed = currentContribution.gte(config?.passingGrade || 0);

		if (!canPass) {
			result = await GradeCalculator.LP_LOSS_DISTANCE(grades, categories, config, true);
		}
		return {
			subjectId: subject.id,
			currentGrade: currentContribution.toNumber(),
			canPass,
			status: alreadyPassed ? 'pass' : canPass ? 'in progress' : 'fail',
			requiredGrades: result,
			recommendations: GradeCalculator.recomendationsByRequiredGrades(
				result,
				config,
				canPass,
				alreadyPassed
			),
			calculatedAt: new Date().toISOString(),
		};
	}
	/**
	 * =========================================================================
	 *                                 LP_MIN
	 * =========================================================================
	 */
	static LP_MIN_weighted_grades_ids(
		categories: GradeCategory[],
		grades: Grade[]
	): Record<string, Big> {
		const weights: Record<string, Big> = {};
		grades.forEach((grade) => {
			const category = categories.find((cat) => cat.id === grade.categoryId);
			weights[grade.id] = category
				? new Big(category.weight).div(100).times(grade.weight).div(100)
				: new Big(grade.weight).div(100);
		});
		return weights;
	}

	static LP_MIN_categories_by_grade_id(
		categories: GradeCategory[],
		grades: Grade[]
	): Record<string, GradeCategory | undefined> {
		const categoryMap: Record<string, GradeCategory | undefined> = {};
		grades.forEach((grade) => {
			const category = categories.find((cat) => cat.id === grade.categoryId);
			categoryMap[grade.id] = category;
		});
		return categoryMap;
	}

	static LP_MIN_format_result(
		result: Result,
		categoriesByGradeId: Record<string, GradeCategory | undefined>,
		unsetGrades: Grade[],
		minGrade: number,
		maxGrade: number
	): RequiredGrade[] {
		let requiredGrades: RequiredGrade[] = [];
		Object.entries(result.result.vars).forEach(([name, varResult]) => {
			const grade = unsetGrades.find((g) => g.id === name);
			if (grade) {
				const category = categoriesByGradeId[name];
				requiredGrades.push({
					id: grade.id,
					categoryId: category?.id ?? '',
					categoryName: category?.name ?? 'Sin categoría',
					requiredValue: varResult,
					description: grade.description,
					achievable: varResult >= minGrade && varResult <= maxGrade,
				});
			}
		});
		return requiredGrades;
	}

	static async LP_MIN(
		grades: Grade[],
		categories: GradeCategory[],
		config: SubjectGradeConfig | null,
		unbounded: boolean = false
	): Promise<RequiredGrade[]> {
		const glpk = GradeCalculator.glpk;
		if (!config || !glpk || !grades.length) return [];

		const currentContribution = GradeCalculator.currentContribution(grades, categories);

		const minGrade = config.minGrade;
		const passingGrade = new Big(config.passingGrade).minus(currentContribution).toNumber();
		const maxGrade = config.maxGrade;

		const categoriesByGradeId = GradeCalculator.LP_MIN_categories_by_grade_id(
			categories,
			grades
		);
		const unsetGrades = grades.filter(
			(grade) => grade.value === null || grade.value === undefined
		);
		if (!unsetGrades.length) return [];
		const weights = GradeCalculator.LP_MIN_weighted_grades_ids(categories, grades);
		const unsetGradesVars = unsetGrades.map((grade) => ({
			name: grade.id,
			coef: weights[grade.id || ''].toNumber() || 1,
		}));

		const lp: LP = {
			name: 'Grade Calculation',
			objective: {
				direction: glpk.GLP_MIN,
				name: 'min_values',
				vars: unsetGradesVars,
			},
			subjectTo: [
				{
					name: 'passing_grade_constraint',
					vars: unsetGradesVars,
					bnds: {
						type: glpk.GLP_DB,
						ub: maxGrade,
						lb: passingGrade,
					},
				},
				{
					name: 'limit_z',
					vars: unsetGradesVars,
					bnds: {
						type: glpk.GLP_DB,
						ub: maxGrade,
						lb: minGrade,
					},
				},
				...unsetGrades.map((grade) => ({
					name: `limit_grade_${grade.id}`,
					vars: [
						{
							name: grade.id,
							coef: 1,
						},
					],
					bnds: {
						type: unbounded ? glpk.GLP_FR : glpk.GLP_DB,
						ub: maxGrade,
						lb: minGrade,
					},
				})),
			],
		};

		const options: Options = {
			tmlim: 60,
			msglev: glpk.GLP_MSG_ERR,
			presol: true,
		};

		const lpResult: Result = await glpk.solve(lp, options);

		let requiredGrades: RequiredGrade[] = [];

		if (lpResult.result.status === glpk.GLP_OPT) {
			requiredGrades = GradeCalculator.LP_MIN_format_result(
				lpResult,
				categoriesByGradeId,
				unsetGrades,
				minGrade,
				maxGrade
			);
		}
		return requiredGrades;
	}
	/**
	 * =========================================================================
	 *                          LP_MIN_PASSING_DISTANCE
	 * =========================================================================
	 */
	static async LP_MIN_PASSING_DISTANCE(
		grades: Grade[],
		categories: GradeCategory[],
		config: SubjectGradeConfig | null,
		unbounded: boolean = false
	): Promise<RequiredGrade[]> {
		const glpk = GradeCalculator.glpk;
		if (!config || !glpk || !grades.length) return [];

		const currentContribution = GradeCalculator.currentContribution(grades, categories);
		const minGrade = config.minGrade;
		const passingGrade = new Big(config.passingGrade).minus(currentContribution).toNumber();
		const maxGrade = config.maxGrade;

		const categoriesByGradeId = GradeCalculator.LP_MIN_categories_by_grade_id(
			categories,
			grades
		);
		const unsetGrades = grades.filter(
			(grade) => grade.value === null || grade.value === undefined
		);
		if (!unsetGrades.length) return [];
		const weights = GradeCalculator.LP_MIN_weighted_grades_ids(categories, grades);
		const unsetGradesVars = unsetGrades.map((grade) => ({
			name: grade.id,
			coef: weights[grade.id || ''].toNumber() || 1,
		}));
		const distanceVars = unsetGrades.map((grade) => ({
			name: `distance_${grade.id}`,
			coef: 1,
		}));

		const lp: LP = {
			name: 'Grade Calculation',
			objective: {
				direction: glpk.GLP_MIN,
				name: 'min_distance',
				vars: distanceVars,
			},
			subjectTo: [
				{
					name: 'passing_grade_constraint',
					vars: unsetGradesVars,
					bnds: {
						type: glpk.GLP_DB,
						ub: maxGrade,
						lb: passingGrade,
					},
				},
				...unsetGrades.map((grade) => ({
					name: `limit_grade_${grade.id}`,
					vars: [
						{
							name: grade.id,
							coef: 1,
						},
					],
					bnds: {
						type: unbounded ? glpk.GLP_FR : glpk.GLP_DB,
						ub: maxGrade,
						lb: minGrade,
					},
				})),
				...unsetGrades.map((grade) => ({
					name: `distance_constraint_${grade.id}`,
					vars: [
						{
							name: grade.id,
							coef: 1,
						},
						{
							name: `distance_${grade.id}`,
							coef: -1,
						},
					],
					bnds: {
						type: glpk.GLP_FX,
						ub: passingGrade,
						lb: passingGrade,
					},
				})),
			],
		};

		const options: Options = {
			tmlim: 60,
			msglev: glpk.GLP_MSG_ERR,
			presol: true,
		};

		const lpResult: Result = await glpk.solve(lp, options);

		let requiredGrades: RequiredGrade[] = [];

		if (lpResult.result.status === glpk.GLP_OPT) {
			requiredGrades = GradeCalculator.LP_MIN_format_result(
				lpResult,
				categoriesByGradeId,
				unsetGrades,
				minGrade,
				maxGrade
			);
		}

		return requiredGrades;
	}
	/**
	 * =========================================================================
	 *                          LP_LOSS_DISTANCE
	 * =========================================================================
	 */
	static async LP_LOSS_DISTANCE(
		grades: Grade[],
		categories: GradeCategory[],
		config: SubjectGradeConfig | null,
		unbounded: boolean = false
	): Promise<RequiredGrade[]> {
		const glpk = GradeCalculator.glpk;
		if (!config || !glpk || !grades.length) return [];

		const currentContribution = GradeCalculator.currentContribution(grades, categories);
		const minGrade = config.minGrade;
		const passingGrade = new Big(config.passingGrade).minus(currentContribution).toNumber();
		const maxGrade = config.maxGrade;

		const categoriesByGradeId = GradeCalculator.LP_MIN_categories_by_grade_id(
			categories,
			grades
		);
		const unsetGrades = grades.filter(
			(grade) => grade.value === null || grade.value === undefined
		);
		if (!unsetGrades.length) return [];
		const weights = GradeCalculator.LP_MIN_weighted_grades_ids(categories, grades);
		const unsetGradesVars = unsetGrades.map((grade) => ({
			name: grade.id,
			coef: weights[grade.id || ''].toNumber() || 1,
		}));
		const distanceVars = unsetGrades.map((grade) => ({
			name: `distance_${grade.id}`,
			coef: 1,
		}));

		const lp: LP = {
			name: 'Grade Calculation',
			objective: {
				direction: glpk.GLP_MIN,
				name: 'min_distance',
				vars: distanceVars,
			},
			subjectTo: [
				{
					name: 'passing_grade_constraint',
					vars: unsetGradesVars,
					bnds: {
						type: glpk.GLP_DB,
						ub: maxGrade,
						lb: passingGrade,
					},
				},
				...unsetGrades.map((grade) => ({
					name: `limit_grade_${grade.id}`,
					vars: [
						{
							name: grade.id,
							coef: 1,
						},
					],
					bnds: {
						type: unbounded ? glpk.GLP_FR : glpk.GLP_DB,
						ub: maxGrade,
						lb: minGrade,
					},
				})),
				...unsetGrades.map((grade) => ({
					name: `distance_constraint_${grade.id}`,
					vars: [
						{
							name: grade.id,
							coef: 1,
						},
						{
							name: `distance_${grade.id}`,
							coef: -1,
						},
					],
					bnds: {
						type: glpk.GLP_FX,
						ub: maxGrade,
						lb: maxGrade,
					},
				})),
			],
		};

		const options: Options = {
			tmlim: 60,
			msglev: glpk.GLP_MSG_ERR,
			presol: true,
		};

		const lpResult: Result = await glpk.solve(lp, options);

		let requiredGrades: RequiredGrade[] = [];

		if (lpResult.result.status === glpk.GLP_OPT) {
			requiredGrades = GradeCalculator.LP_MIN_format_result(
				lpResult,
				categoriesByGradeId,
				unsetGrades,
				minGrade,
				maxGrade
			);
		}

		return requiredGrades;
	}
}
