// AES-256-GCM via Web Crypto API

export function generateSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2)
    bytes[i/2] = parseInt(hex.slice(i, i+2), 16);
  return bytes.buffer;
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2,'0')).join('');
}

function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// PBKDF2 key derivation — same inputs = same output (deterministic)
export async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: hexToBuffer(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Hash password with salt for storage
export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(password + '::' + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hash);
}

// Hash PIN with salt
export async function hashPin(pin, salt) {
  const enc = new TextEncoder();
  const data = enc.encode('PIN::' + pin + '::' + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hash);
}

// Encrypt file
export async function encryptFile(arrayBuffer, cryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, cryptoKey, arrayBuffer
  );
  return { encryptedData: bufferToBase64(encrypted), iv: bufferToHex(iv) };
}

// Decrypt file
export async function decryptFile(encryptedBase64, ivHex, cryptoKey) {
  return crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: hexToBuffer(ivHex) },
    cryptoKey,
    base64ToBuffer(encryptedBase64)
  );
}

// Encrypt string
export async function encryptString(str, cryptoKey) {
  return encryptFile(new TextEncoder().encode(str), cryptoKey);
}

// Decrypt string
export async function decryptString(encryptedBase64, ivHex, cryptoKey) {
  const buf = await decryptFile(encryptedBase64, ivHex, cryptoKey);
  return new TextDecoder().decode(buf);
}

// Compress image
export async function compressImage(file, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      const MAX = 2000;
      let { width, height } = img;
      if (width > MAX) { height = height * MAX / width; width = MAX; }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg', quality
      );
    };
    img.onerror = () => reject(new Error('Image load failed'));
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
