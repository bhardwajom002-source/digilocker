import Dexie from 'dexie';

export const db = new Dexie('DigiLockerDB');

db.version(1).stores({
  appConfig:     'id',
  members:       '++id, name, relation, createdAt',
  documents:     '++id, memberId, category, docType, createdAt, expiryDate, isStarred, *tags',
  documentFiles: '++id, documentId, fileIndex',
  activityLog:   '++id, action, timestamp',
  shareLinks:    '++id, documentId, token, expiresAt',
  backups:       '++id, date, type',
});

// ─── Safe Database Wrapper ───────────────────────────────────────
// Prevents crashes when IndexedDB is corrupted or full
// Returns safe defaults instead of throwing errors

const safeAsync = async (fn, fallback) => {
  try {
    return await fn();
  } catch (error) {
    console.error('🔴 DB Error:', error.message);
    return fallback;
  }
};

// ─── App Config ───────────────────────────────────────────────
export async function getAppConfig() {
  try {
    return await db.appConfig.get(1) || null;
  } catch {
    return null;
  }
}

export async function updateAppConfig(data) {
  try {
    const existing = await db.appConfig.get(1);
    if (existing) {
      await db.appConfig.update(1, data);
    } else {
      await db.appConfig.put({ id: 1, ...data });
    }
    return true;
  } catch (err) {
    console.error('updateAppConfig error:', err);
    return false;
  }
}

// ─── Auth Helpers ─────────────────────────────────────────────
export async function isEmailRegistered(email) {
  try {
    const config = await getAppConfig();
    if (!config?.setupComplete) return false;
    return config.email?.toLowerCase() === email.toLowerCase();
  } catch {
    return false;
  }
}

export async function isUserLoggedIn() {
  try {
    const config = await getAppConfig();
    return config?.isLoggedIn === true && config?.setupComplete === true;
  } catch {
    return false;
  }
}

export async function setLoggedIn(value) {
  try {
    await updateAppConfig({ isLoggedIn: value, lastActivity: new Date() });
  } catch (err) {
    console.error('setLoggedIn error:', err);
  }
}

// ─── Members ──────────────────────────────────────────────────
export async function getAllMembers() {
  try {
    return await db.members.toArray();
  } catch { return []; }
}

export async function createMember(data) {
  try {
    return await db.members.add({ ...data, createdAt: new Date(), updatedAt: new Date() });
  } catch (err) {
    throw err;
  }
}

export async function updateMember(id, data) {
  try {
    return await db.members.update(id, { ...data, updatedAt: new Date() });
  } catch (err) {
    throw err;
  }
}

export async function deleteMember(id) {
  try {
    const docs = await db.documents.where('memberId').equals(id).toArray();
    for (const doc of docs) {
      await db.documentFiles.where('documentId').equals(doc.id).delete();
    }
    await db.documents.where('memberId').equals(id).delete();
    await db.members.delete(id);
    return true;
  } catch { return false; }
}

export async function getMember(id) {
  try {
    return await db.members.get(id);
  } catch { return null; }
}

// ─── Documents ────────────────────────────────────────────────
export async function getAllDocuments() {
  try {
    return await db.documents.reverse().sortBy('createdAt');
  } catch { return []; }
}

export async function getDocumentsByMember(memberId) {
  try {
    return await db.documents.where('memberId').equals(memberId).reverse().sortBy('createdAt');
  } catch { return []; }
}

export async function createDocument(data) {
  try {
    return await db.documents.add({ ...data, createdAt: new Date(), updatedAt: new Date() });
  } catch (err) { throw err; }
}

export async function updateDocument(id, data) {
  try {
    return await db.documents.update(id, { ...data, updatedAt: new Date() });
  } catch (err) { throw err; }
}

export async function deleteDocument(id) {
  try {
    await db.documentFiles.where('documentId').equals(id).delete();
    await db.documents.delete(id);
    return true;
  } catch { return false; }
}

export async function getDocument(id) {
  try {
    return await db.documents.get(id);
  } catch { return null; }
}

export async function getExpiringDocuments(days = 90) {
  try {
    const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return await db.documents
      .filter(d => d.expiryDate && new Date(d.expiryDate) <= future)
      .toArray();
  } catch { return []; }
}

export async function getStarredDocuments() {
  try {
    return await db.documents.filter(d => d.isStarred === true).toArray();
  } catch { return []; }
}

export async function getDocumentsByCategory(category) {
  try {
    return await db.documents.where('category').equals(category).reverse().sortBy('createdAt');
  } catch { return []; }
}

// ─── Document Files ───────────────────────────────────────────
export async function saveDocumentFile(documentId, fileIndex, encryptedData, iv, mimeType, originalName) {
  try {
    return await db.documentFiles.add({ documentId, fileIndex, encryptedData, iv, mimeType, originalName });
  } catch (err) { throw err; }
}

export async function getDocumentFiles(documentId) {
  try {
    return await db.documentFiles.where('documentId').equals(documentId).sortBy('fileIndex');
  } catch { return []; }
}

// ─── Activity Log ─────────────────────────────────────────────
export async function addActivityLog(action, details = {}) {
  try {
    return await db.activityLog.add({ action, ...details, timestamp: new Date() });
  } catch { return null; }
}

export async function getActivityLogs(limit = 100) {
  try {
    return await db.activityLog.orderBy('timestamp').reverse().limit(limit).toArray();
  } catch { return []; }
}

// ─── Storage Stats ────────────────────────────────────────────
export async function getStorageUsage() {
  try {
    const docs = await db.documents.toArray();
    const totalSize = docs.reduce((acc, d) => acc + (d.fileSize || 0), 0);
    return { documentCount: docs.length, totalSize };
  } catch { return { documentCount: 0, totalSize: 0 }; }
}

// ─── Clear All ────────────────────────────────────────────────
export async function clearAllData() {
  try {
    await db.transaction('rw',
      db.appConfig, db.members, db.documents,
      db.documentFiles, db.activityLog, db.shareLinks, db.backups,
      async () => {
        await Promise.all([
          db.appConfig.clear(),
          db.members.clear(),
          db.documents.clear(),
          db.documentFiles.clear(),
          db.activityLog.clear(),
          db.shareLinks.clear(),
          db.backups.clear(),
        ]);
      }
    );
    return true;
  } catch { return false; }
}
