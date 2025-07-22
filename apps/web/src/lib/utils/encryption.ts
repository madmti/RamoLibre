
import { BaseEncryption, type EncryptionAdapter } from '@ramo-libre/shared';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY ?? 'default_key';

export class WebEncryption extends BaseEncryption implements EncryptionAdapter {
    constructor() {
        super(ENCRYPTION_KEY);
    }

    encryptData(data: any): string {
        try {
            const jsonString = this.serializeData(data);
            const encoded = btoa(unescape(encodeURIComponent(jsonString + '::' + this.encryptionKey)));
            return encoded;
        } catch (error) {
            return this.handleEncryptError(error, data);
        }
    }

    decryptData(data: string): any {
        try {
            const decoded = decodeURIComponent(escape(atob(data)));
            const [jsonString, key] = decoded.split('::');

            if (!this.validateKey(key)) {
                throw new Error('Invalid encryption key');
            }

            return this.deserializeData(jsonString);
        } catch (error) {
            return this.handleDecryptError(error, data);
        }
    }
}

// Instancia singleton para usar en toda la app web
export const encryption = new WebEncryption();

// Exportar también las funciones individuales para compatibilidad hacia atrás
export const encryptData = (data: any): string => encryption.encryptData(data);
export const decryptData = (data: string): any => encryption.decryptData(data);