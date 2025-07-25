/*
==================================================================
                            Utils
==================================================================
*/
export { EncryptionAdapter, BaseEncryption, deriveKey } from './utils/encryption';

/*
==================================================================
                            Entitys
==================================================================
*/
export type User = {
	id: string;

	name: string;
	email: string;
	avatar?: string;
	university?: string;
	career?: string;
	semester?: number;

	createdAt: string;
	updatedAt: string;
};

export type Subject = {
	id: string;
	userId: string;

	name: string;
	code: string;
	credits: number;
	color: string;
	professor?: string;
	semester: number;

	createdAt: string;
};

export type Grade = {
	id: string;
	userId: string;
	subjectId: string;
	categoryId?: string;

	value?: number;
	description: string;
	date: string;
	type: 'exam' | 'homework' | 'project' | 'participation' | 'other';
	weight: number;
};

export type GradeCategory = {
	id: string;
	userId: string;
	subjectId: string;

	name: string;
	description?: string;
	weight: number;

	createdAt: string;
};

export type SubjectGradeConfig = {
	id: string;
	userId: string;
	subjectId: string;

	minGrade: number;
	passingGrade: number;
	maxGrade: number;
	gradeScale: 'chilean' | 'utfsm' | 'custom';

	createdAt: string;
	updatedAt: string;
};

export type Event = {
	id: string;
	userId: string;
	subjectId?: string;

	title: string;
	description?: string;
	date: string; // YYYY-MM-DD format
	time?: string; // HH:MM format
	endTime?: string; // HH:MM format for duration
	type: 'exam' | 'assignment' | 'class' | 'meeting' | 'project' | 'deadline' | 'other';
	priority: 'low' | 'medium' | 'high';
	completed: boolean;
	location?: string;
	reminder?: number; // minutes before event
	isAllDay?: boolean;

	createdAt: string;
};

export type Schedule = {
	id: string;
	userId: string;
	subjectId: string;

	dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
	startTime: string; // HH:MM format
	endTime: string; // HH:MM format
	classroom?: string;
	type: 'class' | 'lab' | 'tutorial';
};

/*
==================================================================
                            Interfaces
==================================================================
*/
export interface UserPreferences {
	theme: 'light' | 'dark' | 'auto';
	language: 'es' | 'en';
	scheduleView: 'list' | 'grid' | 'cards';
	eventsView: 'calendar' | 'list' | 'kanban' | 'timeline';
	gradeCalculationMethod: string;
}

export interface UserProfile {
	user: User;
	preferences: UserPreferences;
	subjects: Subject[];
	grades: Grade[];
	gradeCategories: GradeCategory[];
	subjectGradeConfigs: SubjectGradeConfig[];
	events: Event[];
	schedule: Schedule[];

	lastPush?: string; // ISO date string of the last push to the server
	lastPull?: string; // ISO date string of the last pull from the server
}

export interface RequiredGrade {
	id: string;
	categoryId: string;
	categoryName: string;
	requiredValue: number;
	description: string;
	achievable: boolean;
}

export interface GradeCalculationResult {
	subjectId: string;

	currentGrade: number;
	canPass: boolean;
	status: 'pass' | 'fail' | 'in progress';

	requiredGrades: RequiredGrade[];
	recommendations: string[];

	calculatedAt: string;
}

/*
==================================================================
                            API Responses
==================================================================
*/

export interface ApiResponse<T> {
	ok: boolean;
	data?: T;
	error?: string;
}

export interface UserProfileResponse {
	profile: UserProfile | null;
}

/*
==================================================================
                            Constants
==================================================================
*/
export const USER_STORAGE_KEY = 'ramo-libre-user';
export const PREFERENCES_STORAGE_KEY = 'ramo-libre-preferences';
export const SUBJECT_STORAGE_KEY = 'ramo-libre-subjects';
export const GRADE_STORAGE_KEY = 'ramo-libre-grades';
export const CATEGORY_STORAGE_KEY = 'ramo-libre-categories';
export const SUBJECT_GRADE_CONFIG_STORAGE_KEY = 'ramo-libre-subject-grade-config';
export const EVENT_STORAGE_KEY = 'ramo-libre-events';
export const SCHEDULE_STORAGE_KEY = 'ramo-libre-schedule';
export const CLOUD_STORAGE_KEY = 'ramo-libre-cloud';
