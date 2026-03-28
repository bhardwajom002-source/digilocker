import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowLeft, Download, Share2, Trash2, Edit2, Star, 
  Eye, EyeOff, FileText, Calendar, Hash, Tag, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getDocument, getDocumentFiles, getMember, deleteDocument, updateDocument, addActivityLog } from '../db';
import { useAuth } from '../context/AuthContext';
import { getCategoryInfo, DOC_TYPES } from '../utils/constants';
import { decryptFile, formatFileSize } from '../crypto/encryption';
import toast from 'react-hot-toast';

export default function DocumentView() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { cryptoKey } = useAuth();
  const [document, setDocument] = useState(null);
  const [member, setMember] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [decryptedUrls, setDecryptedUrls] = useState([]);
  const [showDocNumber, setShowDocNumber] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocument();
  }, [docId, cryptoKey]);

  const loadDocument = async () => {
    try {
      const doc = await getDocument(parseInt(docId));
      if (!doc) {
        navigate('/');
        return;
      }
      setDocument(doc);

      const memberData = await getMember(doc.memberId);
      setMember(memberData);

      const docFiles = await getDocumentFiles(doc.id);
      setFiles(docFiles);

      // Log view
      await addActivityLog('document_view', { documentId: doc.id, documentTitle: doc.title });

      // Decrypt files if key available
      if (cryptoKey && docFiles.length > 0) {
        const urls = await Promise.all(
          docFiles.map(async (f) => {
            try {
              const decrypted = await decryptFile(f.encryptedData, f.iv, cryptoKey);
              const blob = new Blob([decrypted], { type: f.mimeType });
              return URL.createObjectURL(blob);
            } catch (e) {
              console.error('Decrypt error:', e);
              return null;
            }
          })
        );
        setDecryptedUrls(urls);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this document permanently?')) return;
    
    try {
      await deleteDocument(document.id);
      toast.success('Document deleted');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleToggleStar = async () => {
    try {
      await updateDocument(document.id, { isStarred: !document.isStarred });
      setDocument({ ...document, isStarred: !document.isStarred });
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleDownload = async () => {
    if (!decryptedUrls[currentFileIndex]) return;
    
    const link = document.createElement('a');
    link.href = decryptedUrls[currentFileIndex];
    link.download = files[currentFileIndex]?.originalName || 'document';
    link.click();
    
    // Log download activity
    await addActivityLog('document_download', { 
      documentId: document.id, 
      documentTitle: document.title 
    });
  };

  const handlePreview = () => {
    if (!decryptedUrls[currentFileIndex]) return;
    window.open(decryptedUrls[currentFileIndex], '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!document) return null;

  const category = getCategoryInfo(document.category);
  const docTypeInfo = DOC_TYPES[document.category]?.find(t => t.value === document.docType);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading text-xl font-bold text-slate-900 truncate">{document.title}</h1>
          <p className="text-sm text-slate-500">{category.label}</p>
        </div>
        <button onClick={handleToggleStar} className="p-2 hover:bg-slate-100 rounded-lg">
          <Star className={`w-5 h-5 ${document.isStarred ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
        </button>
      </div>

      {/* Document Viewer */}
      <div className="card overflow-hidden">
        {decryptedUrls.length > 0 && decryptedUrls[currentFileIndex] ? (
          <div className="relative">
            {files[currentFileIndex]?.mimeType?.startsWith('image/') ? (
              <img
                src={decryptedUrls[currentFileIndex]}
                alt={document.title}
                className="w-full h-64 sm:h-96 object-contain bg-slate-900"
              />
            ) : (
              <div className="w-full h-64 sm:h-96 flex items-center justify-center bg-slate-100">
                <FileText className="w-16 h-16 text-slate-400" />
              </div>
            )}
            
            {/* Navigation for multiple files */}
            {files.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentFileIndex(Math.max(0, currentFileIndex - 1))}
                  disabled={currentFileIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentFileIndex(Math.min(files.length - 1, currentFileIndex + 1))}
                  disabled={currentFileIndex === files.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {files.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${idx === currentFileIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-64 sm:h-96 flex items-center justify-center bg-slate-100">
            <div className="text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">Document encrypted</p>
              <p className="text-sm text-slate-400">Unlock to view</p>
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold text-slate-900">Details</h2>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Member</p>
            <p className="font-medium text-slate-900">{member?.name || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-slate-500">Category</p>
            <p className="font-medium text-slate-900">{category.label}</p>
          </div>
          <div>
            <p className="text-slate-500">Document Type</p>
            <p className="font-medium text-slate-900">{docTypeInfo?.label || document.docType}</p>
          </div>
          <div>
            <p className="text-slate-500">Uploaded</p>
            <p className="font-medium text-slate-900">
              {format(new Date(document.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          {document.issueDate && (
            <div>
              <p className="text-slate-500">Issue Date</p>
              <p className="font-medium text-slate-900">
                {format(new Date(document.issueDate), 'MMM d, yyyy')}
              </p>
            </div>
          )}
          {document.expiryDate && (
            <div>
              <p className="text-slate-500">Expiry Date</p>
              <p className="font-medium text-slate-900">
                {format(new Date(document.expiryDate), 'MMM d, yyyy')}
              </p>
            </div>
          )}
          {document.docNumber && (
            <div className="col-span-2">
              <p className="text-slate-500">Document Number</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-medium text-slate-900">
                  {showDocNumber ? document.docNumber : '••••••••••••'}
                </p>
                <button
                  onClick={() => setShowDocNumber(!showDocNumber)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  {showDocNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
          <div>
            <p className="text-slate-500">File Size</p>
            <p className="font-medium text-slate-900">{formatFileSize(document.fileSize || 0)}</p>
          </div>
        </div>

        {document.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {document.tags.map((tag, idx) => (
              <span key={idx} className="badge badge-primary">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handlePreview} className="btn btn-secondary flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" />
          Preview
        </button>
        <button onClick={handleDownload} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button className="btn btn-secondary flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" />
        </button>
        <button onClick={handleDelete} className="btn btn-danger flex items-center justify-center gap-2">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
