import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { FolderOpen, FileText, ChevronRight, Star } from 'lucide-react';
import { getDocumentsByCategory, getAllMembers } from '../db';
import { DOC_CATEGORIES, getCategoryInfo } from '../utils/constants';

export default function Categories() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [members, setMembers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [category]);

  const loadData = async () => {
    try {
      const membersList = await getAllMembers();
      const membersMap = {};
      membersList.forEach(m => { membersMap[m.id] = m; });
      setMembers(membersMap);

      if (category) {
        const docs = await getDocumentsByCategory(category);
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Show category grid if no specific category selected
  if (!category) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Categories</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(DOC_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => navigate(`/categories/${key}`)}
              className="card p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: cat.bg }}
                >
                  <span className="text-xl">{cat.label.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{cat.label}</h3>
                  <p className="text-sm text-slate-500">View documents</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Show documents for specific category
  const catInfo = DOC_CATEGORIES[category] || DOC_CATEGORIES.other;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/categories')} className="p-2 hover:bg-slate-100 rounded-lg">
          <ChevronRight className="w-5 h-5 text-slate-600 rotate-180" />
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: catInfo.bg }}
          >
            <span className="text-lg">{catInfo.label.charAt(0)}</span>
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-slate-900">{catInfo.label}</h1>
            <p className="text-sm text-slate-500">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map(doc => {
            const member = members[doc.memberId];
            return (
              <div
                key={doc.id}
                onClick={() => navigate(`/document/${doc.id}`)}
                className="card p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: catInfo.bg }}
                >
                  <FileText className="w-5 h-5" style={{ color: catInfo.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">{doc.title}</h3>
                  <p className="text-sm text-slate-500">
                    {member?.name || 'Unknown'} • {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                {doc.isStarred && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-medium text-slate-900 mb-1">No documents</h3>
          <p className="text-sm text-slate-500 mb-4">No {catInfo.label.toLowerCase()} documents yet</p>
          <button
            onClick={() => navigate('/upload')}
            className="btn btn-primary"
          >
            Add Document
          </button>
        </div>
      )}
    </div>
  );
}
