import Dexie from 'dexie';

export const db = new Dexie('DigiLockerDB');

db.version(1).stores({
  appConfig: 'id',
  members: '++id, name, relation, dob, color, createdAt, updatedAt',
  documents: '++id, memberId, category, docType, title, docNumber, issueDate, expiryDate, isStarred, isEncrypted, fileType, fileSize, createdAt, updatedAt, *tags',
  documentFiles: '++id, documentId, fileIndex',
  activityLog: '++id, action, documentId, memberId, timestamp, details',
  shareLinks: '++id, documentId, token, expiresAt, maxViews, viewCount, isRevoked',
  backups: '++id, date, size, docCount, memberCount, type',
});

export async function getAppConfig() {
  const config = await db.appConfig.get(1);
  return config || null;
}

export async function updateAppConfig(data) {
  await db.appConfig.put({ id: 1, ...data });
}

export async function createMember(memberData) {
  return await db.members.add({
    ...memberData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateMember(id, memberData) {
  return await db.members.update(id, {
    ...memberData,
    updatedAt: new Date(),
  });
}

export async function deleteMember(id) {
  const docs = await db.documents.where('memberId').equals(id).toArray();
  for (const doc of docs) {
    await db.documentFiles.where('documentId').equals(doc.id).delete();
  }
  await db.documents.where('memberId').equals(id).delete();
  return await db.members.delete(id);
}

export async function getAllMembers() {
  return await db.members.toArray();
}

export async function getMember(id) {
  return await db.members.get(id);
}

export async function createDocument(docData) {
  const id = await db.documents.add({
    ...docData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

export async function updateDocument(id, docData) {
  return await db.documents.update(id, {
    ...docData,
    updatedAt: new Date(),
  });
}

export async function deleteDocument(id) {
  await db.documentFiles.where('documentId').equals(id).delete();
  return await db.documents.delete(id);
}

export async function getDocument(id) {
  return await db.documents.get(id);
}

export async function getDocumentsByMember(memberId) {
  return await db.documents.where('memberId').equals(memberId).reverse().sortBy('createdAt');
}

export async function getDocumentsByCategory(category) {
  return await db.documents.where('category').equals(category).reverse().sortBy('createdAt');
}

export async function getAllDocuments() {
  return await db.documents.reverse().sortBy('createdAt');
}

export async function getStarredDocuments() {
  return await db.documents.where('isStarred').equals(1).toArray();
}

export async function getExpiringDocuments(days = 90) {
  const today = new Date();
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  return await db.documents
    .filter(doc => doc.expiryDate && new Date(doc.expiryDate) <= futureDate)
    .toArray();
}

export async function saveDocumentFile(documentId, fileIndex, encryptedData, iv, mimeType, originalName) {
  return await db.documentFiles.add({
    documentId,
    fileIndex,
    encryptedData,
    iv,
    mimeType,
    originalName,
  });
}

export async function getDocumentFiles(documentId) {
  return await db.documentFiles.where('documentId').equals(documentId).sortBy('fileIndex');
}

export async function deleteDocumentFiles(documentId) {
  return await db.documentFiles.where('documentId').equals(documentId).delete();
}

export async function addActivityLog(action, details = {}) {
  return await db.activityLog.add({
    action,
    ...details,
    timestamp: new Date(),
  });
}

export async function getActivityLogs(limit = 100) {
  return await db.activityLog.orderBy('timestamp').reverse().limit(limit).toArray();
}

export async function getStorageUsage() {
  const docs = await db.documents.toArray();
  const totalSize = docs.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);
  return {
    documentCount: docs.length,
    totalSize,
  };
}

export async function clearAllData() {
  await db.transaction('rw', db.appConfig, db.members, db.documents, db.documentFiles, db.activityLog, db.shareLinks, db.backups, async () => {
    await db.appConfig.clear();
    await db.members.clear();
    await db.documents.clear();
    await db.documentFiles.clear();
    await db.activityLog.clear();
    await db.shareLinks.clear();
    await db.backups.clear();
  });
}
