const SECRET_KEY = process.env.NEXT_PUBLIC_ID_ENCRYPTION_KEY || 'default';

export function encryptId(id: number): string {
  const encrypted = (id * 7) % 100000; // Simple multiplication and modulo
  return encrypted.toString().padStart(5, '0');
}

export function decryptId(encryptedId: string): number {
  if (!/^\d{1,5}$/.test(encryptedId)) {
    throw new Error('Invalid encrypted ID');
  }
  const numEncrypted = parseInt(encryptedId);
  for (let i = 0; i < 100000; i++) {
    if ((i * 7) % 100000 === numEncrypted) {
      return i;
    }
  }
  throw new Error('Unable to decrypt ID');
}

export function isValidEncryptedId(encryptedId: string): boolean {
  return /^\d{1,5}$/.test(encryptedId);
}

