import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowLeft, Plus, Search, Filter, Grid, List,
  Star, Trash2, Edit2, FileText, ChevronRight, AlertTriangle
} from 'lucide-react';
import { getMember, getDocumentsByMember, deleteDocument, updateDocument } from '../db';
import { getCategoryInfo, DOC_CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function MemberDocs() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadData();
  }, [memberId]);

  const loadData = async () => {
    try {
      const memberData = await getMember(parseInt(memberId));
      if (!memberData) {
        navigate('/family');
        return;
      }
      setMember(memberData);

      const docs = await getDocumentsByMember(parseInt(memberId));
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    
    try {
      await deleteDocument(docId);
      toast.success('Document deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleToggleStar = async (doc) => {
    try {
      await updateDocument(doc.id, { isStarred: !doc.isStarred });
      loadData();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const filteredDocs = documents
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

  const getExpiryStatus = (doc) => {
    if (!doc.expiryDate) return null;
    const days = Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { status: 'expired', color: 'text-red-600', label: 'Expired' };
    if (days <= 30) return { status: 'warning', color: 'text-amber-600', label: `${days} days` };
    if (days <= 90) return { status: 'notice', color: 'text-yellow-600', label: `${days} days` };
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 bg-slate-200 rounded-xl animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/family')}
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: member?.color || '#4f46e5' }}
          >
            {member?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-slate-900">{member?.name}</h1>
            <p className="text-sm text-slate-600">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/upload/${memberId}`)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="input pl-10"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input w-full sm:w-40"
        >
          <option value="all">All Categories</option>
          {Object.entries(DOC_CATEGORIES).map(([key, cat]) => (
            <option key={key} value={key}>{cat.label}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input w-full sm:w-32"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">A-Z</option>
        </select>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocs.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
          {filteredDocs.map(doc => {
            const expiryStatus = getExpiryStatus(doc);
            const category = getCategoryInfo(doc.category);

            return (
              <div
                key={doc.id}
                onClick={() => navigate(`/document/${doc.id}`)}
                className={`card p-3 hover:shadow-md transition-shadow cursor-pointer ${
                  viewMode === 'grid' ? 'text-center' : 'flex items-center gap-3'
                }`}
              >
                <div
                  className={`${viewMode === 'grid' ? 'w-12 h-12 mx-auto mb-2' : 'w-10 h-10 flex-shrink-0'} rounded-lg flex items-center justify-center`}
                  style={{ backgroundColor: category.bg }}
                >
                  <FileText className="w-5 h-5" style={{ color: category.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900 truncate">{doc.title}</h3>
                    {doc.isStarred && <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-500">
                    {category.label} • {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                  </p>
                  {expiryStatus && (
                    <div className={`flex items-center gap-1 text-xs ${expiryStatus.color}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {expiryStatus.label}
                    </div>
                  )}
                </div>

                {viewMode === 'list' && (
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-medium text-slate-900 mb-1">No documents found</h3>
          <p className="text-sm text-slate-500 mb-4">
            {searchQuery ? 'Try a different search' : 'Add your first document'}
          </p>
          <button
            onClick={() => navigate(`/upload/${memberId}`)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Document
          </button>
        </div>
      )}
    </div>
  );
}
