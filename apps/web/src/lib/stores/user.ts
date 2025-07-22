import { type User, USER_STORAGE_KEY } from "@ramo-libre/shared";
import { DefaultStore } from "./default";
const DEFAULT_USER = null;

export class UserManager extends DefaultStore<User | null> {
    constructor() {
        super(USER_STORAGE_KEY, DEFAULT_USER, true);
    }

    createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
        const now = new Date().toISOString();
        const newUser: User = {
            ...userData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now
        };
        this.set(newUser);
        return newUser;
    };
};

export const currentUser = new UserManager();
