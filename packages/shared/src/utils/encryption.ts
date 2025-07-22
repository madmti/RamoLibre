// Interfaz común para adaptadores de encriptación
export interface EncryptionAdapter {
    encryptData(data: any): string | Promise<string>;
    decryptData(data: string): any | Promise<any>;
}

// Clase base compartida con lógica común
export class BaseEncryption {
    protected encryptionKey: string;

    constructor(key: string) {
        this.encryptionKey = key;
    }

    protected validateKey(key: string): boolean {
        return key === this.encryptionKey;
    }

    protected serializeData(data: any): string {
        return JSON.stringify(data);
    }

    protected deserializeData(data: string): any {
        return JSON.parse(data);
    }

    protected handleEncryptError(error: unknown, data: any): string {
        console.error('Error encrypting data:', error);
        return this.serializeData(data); // Fallback a datos sin encriptar
    }

    protected handleDecryptError(error: unknown, data: string): any {
        console.error('Error decrypting data:', error);
        // Intentar parsear como JSON sin encriptar (para compatibilidad hacia atrás)
        try {
            return this.deserializeData(data);
        } catch (parseError) {
            console.error('Error parsing unencrypted data:', parseError);
            return null;
        }
    }
}

// Función para derivar una clave de encriptación (si está disponible crypto.subtle)
export async function deriveKey(password: string): Promise<CryptoKey> {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
        throw new Error('Web Crypto API not available');
    }

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('RamoLibreSalt'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}
