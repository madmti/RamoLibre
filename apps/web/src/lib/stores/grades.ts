import { type Grade, GRADE_STORAGE_KEY, type Subject } from '@ramo-libre/shared';
import { type GradeCalculationResult } from '@ramo-libre/shared';
import { DefaultStore } from './default';
import { GradeCalculator, type AvailableMethods } from '$lib/utils/gradeCalculator';
import { get } from 'svelte/store';

const DEFAULT_GRADES: Grade[] = [];

type Stats = {
	totalSubjects: number;
	averageGrade: number;
	passingSubjects: number;
	failingSubjects: number;
};

export class GradeManager extends DefaultStore<Grade[]> {
	constructor() {
		super(GRADE_STORAGE_KEY, DEFAULT_GRADES);
	}

	addGrade(grade: Grade) {
		if (!grade.id) {
			grade.id = crypto.randomUUID();
		}
		this.update((current) => [...current, grade]);
	}

	removeGrade(gradeId: string) {
		this.update((current) => {
			const index = current.findIndex((grade) => grade.id === gradeId);
			if (index > -1) current.splice(index, 1);
			return current;
		});
	}

	removeGradesBySubject(subjectId: string) {
		this.update((current) => {
			return current.filter((grade) => grade.subjectId !== subjectId);
		});
	}

	updateGrade(updatedGrade: Grade) {
		this.update((current) =>
			current.map((grade) => (grade.id === updatedGrade.id ? updatedGrade : grade))
		);
	}

	getGradesBySubject(subjectId: string): Grade[] {
		const current = get(this);
		return current.filter((grade) => grade.subjectId === subjectId);
	}

	async getGradesCalculations(
		subjects: Subject[],
		method: AvailableMethods
	): Promise<Record<string, GradeCalculationResult>> {
		const results: Record<string, GradeCalculationResult> = {};
		for (const subject of subjects) {
			results[subject.id] = await GradeCalculator.calculate(subject, method);
		}
		return results;
	}

	getStats(gradeCalculations: Record<string, GradeCalculationResult>): Stats {
		const totalSubjects = Object.keys(gradeCalculations).length;
		const averageGrade =
			Object.values(gradeCalculations).reduce((sum, result) => sum + result.currentGrade, 0) /
				totalSubjects || 0;

		const passingSubjects = Object.values(gradeCalculations).filter(
			(result) => result.canPass
		).length;

		const failingSubjects = Object.values(gradeCalculations).filter(
			(result) => result.status === 'fail'
		).length;

		return {
			totalSubjects,
			averageGrade,
			passingSubjects,
			failingSubjects,
		};
	}
}

export const currentGrades = new GradeManager();
