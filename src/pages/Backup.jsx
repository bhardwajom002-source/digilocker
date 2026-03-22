import { useState } from 'react';
import { HardDrive, Upload, Download, CheckCircle, AlertTriangle, FileUp } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { db } from '../db';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Backup() {
  const { cryptoKey } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();

      // Export members
      const members = await db.members.toArray();
      zip.file('members.json', JSON.stringify(members));

      // Export documents
      const documents = await db.documents.toArray();
      zip.file('documents.json', JSON.stringify(documents));

      // Export document files
      const files = await db.documentFiles.toArray();
      const filesFolder = zip.folder('files');
      for (const f of files) {
        filesFolder.file(
          `${f.documentId}_${f.fileIndex}.dat`,
          JSON.stringify({
            encryptedData: f.encryptedData,
            iv: f.iv,
            mimeType: f.mimeType,
            originalName: f.originalName,
          })
        );
      }

      // Metadata
      zip.file('meta.json', JSON.stringify({
        version: '1.0',
        exportDate: new Date().toISOString(),
        docCount: documents.length,
        memberCount: members.length,
        encrypted: true,
      }));

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const filename = `digilocker_backup_${new Date().toISOString().slice(0, 10)}.dlb`;
      saveAs(blob, filename);

      toast.success('Backup created successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const meta = JSON.parse(await zip.file('meta.json').async('string'));

      if (meta.version !== '1.0') {
        throw new Error('Incompatible backup version');
      }

      const members = JSON.parse(await zip.file('members.json').async('string'));
      const documents = JSON.parse(await zip.file('documents.json').async('string'));

      // Clear existing data and restore
      await db.transaction('rw', db.members, db.documents, db.documentFiles, async () => {
        await db.members.clear();
        await db.documents.clear();
        await db.documentFiles.clear();

        await db.members.bulkAdd(members);
        await db.documents.bulkAdd(documents);

        const filesFolder = zip.folder('files');
        const fileKeys = Object.keys(filesFolder.files).filter(k => !k.startsWith('_'));

        for (const key of fileKeys) {
          const content = JSON.parse(await filesFolder.files[key].async('string'));
          const [docId, idx] = key.replace('.dat', '').split('_');
          await db.documentFiles.add({
            documentId: parseInt(docId),
            fileIndex: parseInt(idx),
            ...content,
          });
        }
      });

      toast.success(`Restored ${members.length} members and ${documents.length} documents`);
      window.location.reload();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to restore backup: ' + error.message);
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <HardDrive className="w-6 h-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold text-slate-900">Backup & Restore</h1>
      </div>

      {/* Export */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900 mb-1">Export Backup</h2>
            <p className="text-sm text-slate-600 mb-4">
              Download all your documents as an encrypted backup file. 
              Use this to transfer data to another device.
            </p>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Backup
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Import */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900 mb-1">Restore Backup</h2>
            <p className="text-sm text-slate-600 mb-4">
              Restore from a previously exported backup file. 
              This will replace all existing data.
            </p>
            <label
              className={`btn btn-secondary inline-flex items-center gap-2 cursor-pointer ${
                isImporting ? 'opacity-50' : ''
              }`}
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4" />
                  Select Backup File
                </>
              )}
              <input
                type="file"
                accept=".dlb"
                onChange={handleImport}
                className="hidden"
                disabled={isImporting}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">Important</h3>
            <p className="text-sm text-amber-700 mt-1">
              Your backup is encrypted and can only be restored on a device where you know the master password.
              Without the password, backup files cannot be decrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
