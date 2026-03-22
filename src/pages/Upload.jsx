import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, Upload as UploadIcon, X, Check, 
  Camera, FileText, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllMembers, createDocument, saveDocumentFile, addActivityLog } from '../db';
import { encryptFile, compressImage } from '../crypto/encryption';
import { DOC_CATEGORIES, DOC_TYPES, getCategoryInfo, getDocTypeLabel } from '../utils/constants';
import toast from 'react-hot-toast';

const steps = ['Member', 'Category', 'Files', 'Details', 'Encrypt'];

export default function Upload() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { cryptoKey } = useAuth();
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form data
  const [selectedMemberId, setSelectedMemberId] = useState(memberId ? parseInt(memberId) : null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (selectedCategory && selectedDocType) {
      const label = getDocTypeLabel(selectedCategory, selectedDocType);
      if (!title) setTitle(label);
    }
  }, [selectedCategory, selectedDocType]);

  const loadMembers = async () => {
    try {
      const membersList = await getAllMembers();
      setMembers(membersList);
      
      if (memberId) {
        setSelectedMemberId(parseInt(memberId));
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedMemberId !== null;
      case 1: return selectedCategory && selectedDocType;
      case 2: return files.length > 0;
      case 3: return title.trim().length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!cryptoKey) {
      toast.error('Please unlock the app first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const docId = await createDocument({
        memberId: selectedMemberId,
        category: selectedCategory,
        docType: selectedDocType,
        title: title.trim(),
        docNumber: docNumber.trim(),
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
        notes: notes.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        isStarred,
        isEncrypted: true,
        fileType: files[0]?.type || 'application/pdf',
        fileSize: files.reduce((acc, f) => acc + f.size, 0),
        fileCount: files.length,
      });

      setUploadProgress(30);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        let fileToEncrypt = file;
        if (file.type.startsWith('image/')) {
          fileToEncrypt = await compressImage(file, 0.8);
        }

        const arrayBuffer = await fileToEncrypt.arrayBuffer();
        const { encryptedData, iv } = await encryptFile(arrayBuffer, cryptoKey);

        await saveDocumentFile(docId, i, encryptedData, iv, file.type, file.name);
        
        setUploadProgress(30 + ((i + 1) / files.length) * 60);
      }

      setUploadProgress(100);

      await addActivityLog('document_upload', {
        documentId: docId,
        memberId: selectedMemberId,
        documentTitle: title.trim(),
      });

      toast.success('Document saved securely!');

      setTimeout(() => {
        navigate(`/document/${docId}`);
      }, 500);

    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="font-heading font-semibold text-slate-900 mb-2">
          No family members found
        </h3>
        <p className="text-slate-600 mb-4">
          Please add a family member first before uploading documents
        </p>
        <button
          onClick={() => navigate('/family')}
          className="btn btn-primary"
        >
          Add Family Member
        </button>
      </div>
    );
  }

  const currentMember = members.find(m => m.id === selectedMemberId);
  const currentCategory = DOC_CATEGORIES[selectedCategory];
  const docTypes = DOC_TYPES[selectedCategory] || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentStep
                  ? 'bg-primary text-white'
                  : index === currentStep
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-0.5 mx-1 ${
                index < currentStep ? 'bg-primary' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Progress for final step */}
      {isUploading && (
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="font-medium text-slate-700">
              {uploadProgress < 30 ? 'Creating record...' : 
               uploadProgress < 90 ? 'Encrypting files...' : 
               'Finalizing...'}
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="card p-6">
        {/* Step 1: Select Member */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold">Who is this document for?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {members.map(member => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedMemberId === member.id
                      ? 'border-primary bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: member.color || '#4f46e5' }}
                  >
                    {member.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <p className="font-medium text-slate-900 truncate">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.relation}</p>
                  {selectedMemberId === member.id && (
                    <Check className="w-5 h-5 text-primary mx-auto mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Category & Type */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold">Select document type</h2>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Object.entries(DOC_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedCategory(key); setSelectedDocType(''); }}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    selectedCategory === key
                      ? 'border-primary bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg mb-1 mx-auto flex items-center justify-center" style={{ backgroundColor: cat.bg }}>
                    <span className="text-sm font-medium" style={{ color: cat.color }}>
                      {cat.label.charAt(0)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{cat.label}</p>
                </button>
              ))}
            </div>

            {selectedCategory && docTypes.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-slate-700 mb-2">Document Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {docTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedDocType(type.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedDocType === type.value
                          ? 'border-primary bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-medium text-slate-900">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: File Upload */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold">Upload Files</h2>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <UploadIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Click to upload or drag and drop</p>
              <p className="text-sm text-slate-500 mt-1">PDF, JPG, PNG (max 20MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span className="flex-1 text-sm text-slate-700 truncate">{file.name}</span>
                    <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-slate-400 hover:text-danger"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Details */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold">Document Details</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Document title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Number</label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="input font-mono"
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="input"
                  placeholder="Important, Original (comma separated)"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStarred}
                  onChange={(e) => setIsStarred(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Mark as starred</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 5: Confirm */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold">Review & Save</h2>
            
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Member:</span>
                <span className="font-medium text-slate-900">{currentMember?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-medium text-slate-900">{currentCategory?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="font-medium text-slate-900">{getDocTypeLabel(selectedCategory, selectedDocType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Title:</span>
                <span className="font-medium text-slate-900">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Files:</span>
                <span className="font-medium text-slate-900">{files.length}</span>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Your document will be encrypted with AES-256 before storing.
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {currentStep > 0 && (
          <button
            onClick={handleBack}
            disabled={isUploading}
            className="btn btn-secondary flex-1"
          >
            Back
          </button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Document
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
