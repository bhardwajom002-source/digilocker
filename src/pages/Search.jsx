import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search as SearchIcon, X, FileText, Filter, Star } from 'lucide-react';
import { getAllDocuments, getAllMembers } from '../db';
import { getCategoryInfo, DOC_CATEGORIES } from '../utils/constants';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [members, setMembers] = useState({});
  const [filters, setFilters] = useState({
    category: 'all',
    member: 'all',
    starred: false,
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const membersList = await getAllMembers();
    const membersMap = {};
    membersList.forEach(m => { membersMap[m.id] = m; });
    setMembers(membersMap);
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const allDocs = await getAllDocuments();
        const searchLower = query.toLowerCase();

        let filtered = allDocs.filter(doc => {
          const member = members[doc.memberId];
          const matchesQuery = 
            doc.title.toLowerCase().includes(searchLower) ||
            doc.docType?.toLowerCase().includes(searchLower) ||
            doc.docNumber?.toLowerCase().includes(searchLower) ||
            doc.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
            member?.name?.toLowerCase().includes(searchLower);

          const matchesCategory = filters.category === 'all' || doc.category === filters.category;
          const matchesMember = filters.member === 'all' || doc.memberId === parseInt(filters.member);
          const matchesStarred = !filters.starred || doc.isStarred;

          return matchesQuery && matchesCategory && matchesMember && matchesStarred;
        });

        setResults(filtered);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, filters, members]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <h1 className="font-heading text-2xl font-bold text-slate-900">Search</h1>

      {/* Search Input */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents, members, tags..."
          className="input pl-10 pr-10 text-lg"
          autoFocus
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="input w-auto"
        >
          <option value="all">All Categories</option>
          {Object.entries(DOC_CATEGORIES).map(([key, cat]) => (
            <option key={key} value={key}>{cat.label}</option>
          ))}
        </select>

        <select
          value={filters.member}
          onChange={(e) => setFilters({ ...filters, member: e.target.value })}
          className="input w-auto"
        >
          <option value="all">All Members</option>
          {Object.values(members).map(member => (
            <option key={member.id} value={member.id}>{member.name}</option>
          ))}
        </select>

        <button
          onClick={() => setFilters({ ...filters, starred: !filters.starred })}
          className={`btn ${filters.starred ? 'btn-primary' : 'btn-secondary'} flex items-center gap-1`}
        >
          <Star className={`w-4 h-4 ${filters.starred ? 'fill-current' : ''}`} />
          Starred
        </button>
      </div>

      {/* Results */}
      {isSearching ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-slate-500">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          {results.map(doc => {
            const category = getCategoryInfo(doc.category);
            const member = members[doc.memberId];

            return (
              <div
                key={doc.id}
                onClick={() => navigate(`/document/${doc.id}`)}
                className="card p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: category.bg }}
                >
                  <FileText className="w-5 h-5" style={{ color: category.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900 truncate">{doc.title}</h3>
                    {doc.isStarred && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-sm text-slate-500">
                    {category.label} {member && `• ${member.name}`} • {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : query ? (
        <div className="text-center py-8">
          <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No documents found</p>
          <p className="text-sm text-slate-500">Try a different search term</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">Start typing to search</p>
        </div>
      )}
    </div>
  );
}
