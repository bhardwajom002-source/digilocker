import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FileText, Users, AlertTriangle, HardDrive, 
  Plus, Search, Star, Upload, BarChart3,
  ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllDocuments, getAllMembers, getExpiringDocuments, getStorageUsage } from '../db';
import { DOC_CATEGORIES, getCategoryInfo } from '../utils/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userName } = useAuth();
  const [stats, setStats] = useState({ totalDocs: 0, members: 0, expiring: 0, storage: 0 });
  const [members, setMembers] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [docs, membersList, expiring, storage] = await Promise.all([
          getAllDocuments(),
          getAllMembers(),
          getExpiringDocuments(90),
          getStorageUsage(),
        ]);

        setStats({
          totalDocs: docs.length,
          members: membersList.length,
          expiring: expiring.length,
          storage: storage.totalSize,
        });

        setMembers(membersList.slice(0, 5));
        setRecentDocs(docs.slice(0, 8));
        setExpiringDocs(expiring.slice(0, 3));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">
            {getGreeting()}, {userName || 'User'}! 👋
          </h1>
          <p className="text-slate-600 mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalDocs}</p>
            <p className="text-sm text-slate-500">Documents</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.members}</p>
            <p className="text-sm text-slate-500">Family Members</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.expiring}</p>
            <p className="text-sm text-slate-500">Expiring Soon</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
            <HardDrive className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatSize(stats.storage)}</p>
            <p className="text-sm text-slate-500">Storage Used</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => navigate('/upload')}
          className="btn btn-primary flex items-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
        <button
          onClick={() => navigate('/family')}
          className="btn bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary dark:hover:border-primary flex items-center gap-2 whitespace-nowrap transition-all"
        >
          <Users className="w-4 h-4" />
          Add Member
        </button>
        <button
          onClick={() => navigate('/search')}
          className="btn bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary dark:hover:border-primary flex items-center gap-2 whitespace-nowrap transition-all"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="btn bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary dark:hover:border-primary flex items-center gap-2 whitespace-nowrap transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          Reports
        </button>
      </div>

      {/* Expiry Alerts */}
      {expiringDocs.length > 0 && (
        <div className="card p-4 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">
              {expiringDocs.length} document{expiringDocs.length > 1 ? 's' : ''} expiring soon
            </h3>
          </div>
          <div className="space-y-2">
            {expiringDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => navigate(`/document/${doc.id}`)}
                className="flex items-center justify-between p-2 bg-white rounded-lg cursor-pointer hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">{doc.title}</span>
                <span className="text-xs text-amber-600 font-medium">
                  {new Date(doc.expiryDate) < new Date() ? 'Expired' : 'Expiring'}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="text-sm text-amber-700 hover:underline mt-2"
          >
            View all alerts →
          </button>
        </div>
      )}

      {/* Family Members */}
      {members.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-slate-900">Family Members</h2>
            <button
              onClick={() => navigate('/family')}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {members.map(member => (
              <div
                key={member.id}
                onClick={() => navigate(`/family/${member.id}`)}
                className="card p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: member.color || '#4f46e5' }}
                >
                  {member.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <p className="font-medium text-slate-900 truncate">{member.name}</p>
                <p className="text-xs text-slate-500">{member.relation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div>
        <h2 className="font-heading font-semibold text-slate-900 mb-3">Categories</h2>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(DOC_CATEGORIES).slice(0, 8).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => navigate(`/categories/${key}`)}
              className="card p-3 text-center hover:shadow-md transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: cat.bg }}
              >
                <span className="text-lg">{getCategoryInfo(key).label.charAt(0)}</span>
              </div>
              <p className="text-xs text-slate-700 truncate">{cat.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      {recentDocs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-slate-900">Recent Documents</h2>
          </div>
          <div className="space-y-2">
            {recentDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => navigate(`/document/${doc.id}`)}
                className="card p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: getCategoryInfo(doc.category).bg }}
                >
                  <FileText className="w-5 h-5" style={{ color: getCategoryInfo(doc.category).color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{doc.title}</p>
                  <p className="text-xs text-slate-500">
                    {getCategoryInfo(doc.category).label} • {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                {doc.isStarred && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalDocs === 0 && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-heading font-semibold text-slate-900 mb-2">
            No documents yet
          </h3>
          <p className="text-slate-600 mb-4">
            Start by adding your first document to the vault
          </p>
          <button
            onClick={() => navigate('/upload')}
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
