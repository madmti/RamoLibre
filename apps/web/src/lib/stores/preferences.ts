import { type UserPreferences, PREFERENCES_STORAGE_KEY } from "@ramo-libre/shared";
import { DefaultStore } from "./default";

const DEFAULT_PREFERENCES: UserPreferences = {
    theme: 'light',
    language: 'es',
    scheduleView: 'list',
    eventsView: 'calendar'
};

export class UserPreferencesManager extends DefaultStore<UserPreferences> {
    constructor() {
        super(PREFERENCES_STORAGE_KEY, DEFAULT_PREFERENCES);
    }

    updatePreferences(preferences: Partial<UserPreferences>) {
        this.update(current => ({
            ...current,
            ...preferences
        }));
    }
}

export const userPreferences = new UserPreferencesManager();
