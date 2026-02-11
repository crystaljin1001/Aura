/**
 * Encryption utilities for GitHub Personal Access Tokens
 * Uses AES-256-GCM encryption with the Web Crypto API
 */

export interface EncryptedData {
  encrypted: string;
  iv: string;
}

/**
 * Gets the encryption key from environment variables
 * @throws Error if GITHUB_TOKEN_ENCRYPTION_KEY is not set
 */
function getEncryptionKey(): string {
  const key = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      'GITHUB_TOKEN_ENCRYPTION_KEY environment variable is not set'
    );
  }
  if (key.length !== 64) {
    throw new Error(
      'GITHUB_TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes)'
    );
  }
  return key;
}

/**
 * Converts a hex string to a Uint8Array
 */
function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Converts a Uint8Array to a hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Imports the encryption key for use with Web Crypto API
 */
async function importKey(): Promise<CryptoKey> {
  const keyHex = getEncryptionKey();
  const keyBytes = hexToBytes(keyHex);

  return await crypto.subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a GitHub token using AES-256-GCM
 * @param token - The GitHub Personal Access Token to encrypt
 * @returns Promise containing encrypted data and initialization vector
 * @throws Error if encryption fails
 */
export async function encryptToken(token: string): Promise<EncryptedData> {
  try {
    // Generate a random 12-byte IV (recommended for AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Import the encryption key
    const key = await importKey();

    // Convert token to bytes
    const encoder = new TextEncoder();
    const tokenBytes = encoder.encode(token);

    // Encrypt the token
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      tokenBytes
    );

    // Convert encrypted data to hex string
    const encrypted = bytesToHex(new Uint8Array(encryptedBuffer));
    const ivHex = bytesToHex(iv);

    return {
      encrypted,
      iv: ivHex,
    };
  } catch (error) {
    throw new Error(
      `Token encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Decrypts a GitHub token using AES-256-GCM
 * @param data - The encrypted data containing encrypted token and IV
 * @returns Promise containing the decrypted token
 * @throws Error if decryption fails
 */
export async function decryptToken(data: EncryptedData): Promise<string> {
  try {
    // Convert hex strings back to bytes
    const encryptedBytes = hexToBytes(data.encrypted);
    const ivBytes = hexToBytes(data.iv);

    // Import the encryption key
    const key = await importKey();

    // Decrypt the token
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes as BufferSource,
      },
      key,
      encryptedBytes as BufferSource
    );

    // Convert decrypted bytes back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error(
      `Token decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extracts the last 4 characters of a token for display purposes
 * @param token - The full token
 * @returns The last 4 characters
 */
export function getTokenLastFour(token: string): string {
  if (token.length < 4) {
    return token;
  }
  return token.slice(-4);
}
