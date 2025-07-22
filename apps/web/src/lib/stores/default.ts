import { writable, type Writable } from "svelte/store";
import { WebEncryption } from "$lib/utils/encryption";

export function loadFromLocalStorage<T>(key: string, defaultValue: T, encrypted: boolean = false): T {
    const encryptor = new WebEncryption();
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    if (item) {
        return encrypted ? encryptor.decryptData(item) : JSON.parse(item);
    }
    return defaultValue;
}

export abstract class DefaultStore<T> implements Writable<T> {
    protected store: Writable<T>;
    protected storageKey: string;
    protected defaultValue: T;
    protected encrypted: boolean = false;
    private encryptor: WebEncryption | null = null;
    private static initializedInstances: Map<string, boolean> = new Map();

    public static allInitialized(): boolean {
        return Array.from(DefaultStore.initializedInstances.values()).every(initialized => initialized);
    }

    constructor(storageKey: string, defaultValue: T, encrypted: boolean = false) {
        DefaultStore.initializedInstances.set(storageKey, false);
        this.storageKey = storageKey;
        this.defaultValue = defaultValue;
        this.store = writable(loadFromLocalStorage<T>(storageKey, defaultValue, encrypted));
        this.encrypted = encrypted;
        if (encrypted) {
            this.encryptor = new WebEncryption();
        }
        DefaultStore.initializedInstances.set(storageKey, true);
    }

    subscribe(run: (value: T) => void): () => void {
        return this.store.subscribe(run);
    }

    reset(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.storageKey);
        }
        this.store.set(this.defaultValue);
    };

    set(value: T): void {
        if (typeof window !== 'undefined') {
            let storageValue = this.encrypted && this.encryptor ? this.encryptor.encryptData(value) : JSON.stringify(value);
            localStorage.setItem(this.storageKey, storageValue);
        }
        this.store.set(value);
    }

    update(updater: (value: T) => T): void {
        const currentValue = loadFromLocalStorage<T>(this.storageKey, this.defaultValue, this.encrypted);
        const newValue = updater(currentValue);
        this.set(newValue);
    }

    getStorageKey(): string {
        return this.storageKey;
    }

    getDefaultValue(): T {
        return this.defaultValue;
    }

    by<U>(list: U[], current: T, externalKey: keyof U, internalKey: keyof T): Map<string, T> {
        if (!Array.isArray(current)) throw new Error("Current store value is not an array");

        const map = new Map<string, T>();
        list.forEach(item => {
            const key = item[externalKey] as string;
            const values = current.filter(value => value[internalKey] === key);
            if (values.length > 0) {
                map.set(key, values as unknown as T);
            }
        });
        return map;
    }
}
