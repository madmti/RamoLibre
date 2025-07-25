import { type UserPreferences, PREFERENCES_STORAGE_KEY } from '@ramo-libre/shared';
import { DefaultStore } from './default';
import type { AvailableMethods } from '$lib/utils/gradeCalculator';

const DEFAULT_PREFERENCES: UserPreferences = {
	theme: 'light',
	language: 'es',
	scheduleView: 'list',
	eventsView: 'calendar',
	gradeCalculationMethod: 'LP_MIN_PASSING_DISTANCE' as AvailableMethods,
};

export class UserPreferencesManager extends DefaultStore<UserPreferences> {
	constructor() {
		super(PREFERENCES_STORAGE_KEY, DEFAULT_PREFERENCES);
	}

	updatePreferences(preferences: Partial<UserPreferences>) {
		this.update((current) => ({
			...current,
			...preferences,
		}));
	}
}

export const userPreferences = new UserPreferencesManager();
