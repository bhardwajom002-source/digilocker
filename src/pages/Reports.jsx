import { useState, useEffect } from 'react';
import { BarChart3, FileText, Users, HardDrive } from 'lucide-react';
import { getAllDocuments, getAllMembers, getStorageUsage } from '../db';
import { DOC_CATEGORIES, getCategoryInfo } from '../utils/constants';

export default function Reports() {
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalMembers: 0,
    storage: 0,
    byCategory: {},
    byMember: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [docs, members, storage] = await Promise.all([
        getAllDocuments(),
        getAllMembers(),
        getStorageUsage(),
      ]);

      const byCategory = {};
      const byMember = {};

      docs.forEach(doc => {
        byCategory[doc.category] = (byCategory[doc.category] || 0) + 1;
        byMember[doc.memberId] = (byMember[doc.memberId] || 0) + 1;
      });

      setStats({
        totalDocs: docs.length,
        totalMembers: members.length,
        storage: storage.totalSize,
        byCategory,
        byMember,
        members,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const maxCategoryCount = Math.max(...Object.values(stats.byCategory), 1);
  const maxMemberCount = Math.max(...Object.values(stats.byMember), 1);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold text-slate-900">Reports</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{stats.totalDocs}</p>
          <p className="text-sm text-slate-500">Documents</p>
        </div>
        <div className="card p-4 text-center">
          <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{stats.totalMembers}</p>
          <p className="text-sm text-slate-500">Members</p>
        </div>
        <div className="card p-4 text-center">
          <HardDrive className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{formatSize(stats.storage)}</p>
          <p className="text-sm text-slate-500">Storage</p>
        </div>
      </div>

      {/* By Category */}
      <div className="card p-4">
        <h2 className="font-semibold text-slate-900 mb-4">Documents by Category</h2>
        {stats.totalDocs === 0 ? (
          <p className="text-slate-500 text-center py-4">No documents yet</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(DOC_CATEGORIES).map(([key, cat]) => {
              const count = stats.byCategory[key] || 0;
              const percentage = (count / maxCategoryCount) * 100;

              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-slate-600 truncate">{cat.label}</div>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                  <div className="w-8 text-sm text-slate-600 text-right">{count}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* By Member */}
      <div className="card p-4">
        <h2 className="font-semibold text-slate-900 mb-4">Documents by Member</h2>
        {stats.totalMembers === 0 ? (
          <p className="text-slate-500 text-center py-4">No members yet</p>
        ) : (
          <div className="space-y-3">
            {stats.members.map(member => {
              const count = stats.byMember[member.id] || 0;
              const percentage = (count / maxMemberCount) * 100;

              return (
                <div key={member.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: member.color || '#4f46e5' }}
                  >
                    {member.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-8 text-sm text-slate-600 text-right">{count}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
