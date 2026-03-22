// AES-256-GCM encryption utilities using Web Crypto API

// Generate a random salt
export function generateSalt() {
  return bufferToHex(crypto.getRandomValues(new Uint8Array(32)));
}

// Generate a random IV
function generateIV() {
  return crypto.getRandomValues(new Uint8Array(12));
}

// Convert ArrayBuffer to hex string
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string to ArrayBuffer
function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes.buffer;
}

// Convert ArrayBuffer to base64
function bufferToBase64(buffer) {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary);
}

// Convert base64 to ArrayBuffer
function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Derive encryption key from password using PBKDF2
export async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: hexToBuffer(salt),
      iterations: 250000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt file data (ArrayBuffer)
export async function encryptFile(arrayBuffer, cryptoKey) {
  const iv = generateIV();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    arrayBuffer
  );
  
  return {
    encryptedData: bufferToBase64(encrypted),
    iv: bufferToHex(iv),
  };
}

// Decrypt file data
export async function decryptFile(encryptedBase64, ivHex, cryptoKey) {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: hexToBuffer(ivHex) },
    cryptoKey,
    base64ToBuffer(encryptedBase64)
  );
  
  return decrypted;
}

// Encrypt string data
export async function encryptString(str, cryptoKey) {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(str);
  return encryptFile(buffer, cryptoKey);
}

// Decrypt string data
export async function decryptString(encryptedBase64, ivHex, cryptoKey) {
  const buffer = await decryptFile(encryptedBase64, ivHex, cryptoKey);
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// Encrypt object (serializes to JSON, then encrypts)
export async function encryptObject(obj, cryptoKey) {
  const jsonStr = JSON.stringify(obj);
  return encryptString(jsonStr, cryptoKey);
}

// Decrypt object (decrypts, then parses JSON)
export async function decryptObject(encryptedBase64, ivHex, cryptoKey) {
  const jsonStr = await decryptString(encryptedBase64, ivHex, cryptoKey);
  return JSON.parse(jsonStr);
}

// Hash password for storage (NOT for encryption - use deriveKey for that)
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

// Simple hash for PIN
export async function hashPin(pin) {
  return hashPassword('pin_' + pin);
}

// Compress image file before encryption
export async function compressImage(file, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    
    img.onload = () => {
      const MAX_WIDTH = 2000;
      let { width, height } = img;
      
      if (width > MAX_WIDTH) {
        height = (height * MAX_WIDTH) / width;
        width = MAX_WIDTH;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Format file size for display
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
