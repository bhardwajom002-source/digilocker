import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Shield, Upload, Download, Eye, Trash2, Lock, Unlock, Plus, Edit, X } from 'lucide-react';
import { getActivityLogs, addActivityLog } from '../db';

const actionIcons = {
  app_setup: Shield,
  app_unlock: Unlock,
  app_unlock_pin: Unlock,
  app_lock: Lock,
  document_upload: Upload,
  document_view: Eye,
  document_download: Download,
  document_delete: Trash2,
  document_edit: Edit,
  member_add: Plus,
  member_edit: Edit,
  member_delete: Trash2,
  password_changed: Shield,
  pin_changed: Shield,
  backup_created: Download,
  backup_restored: Upload,
};

const actionLabels = {
  app_setup: 'App Setup',
  app_unlock: 'Unlocked App',
  app_unlock_pin: 'Unlocked with PIN',
  app_lock: 'Locked App',
  document_upload: 'Document Uploaded',
  document_view: 'Document Viewed',
  document_download: 'Document Downloaded',
  document_delete: 'Document Deleted',
  document_edit: 'Document Updated',
  member_add: 'Member Added',
  member_edit: 'Member Updated',
  member_delete: 'Member Deleted',
  password_changed: 'Password Changed',
  pin_changed: 'PIN Changed',
  backup_created: 'Backup Created',
  backup_restored: 'Backup Restored',
};

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await getActivityLogs(100);
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    const today = new Date();
    const logDate = new Date(log.timestamp);
    
    if (filter === 'today') {
      return logDate.toDateString() === today.toDateString();
    }
    if (filter === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return logDate >= weekAgo;
    }
    if (filter === 'month') {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return logDate >= monthAgo;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-slate-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="font-heading text-2xl font-bold text-slate-900">Activity Log</h1>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="card p-8 text-center">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-medium text-slate-900 mb-1">No activity yet</h3>
          <p className="text-sm text-slate-500">Your actions will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => {
            const Icon = actionIcons[log.action] || Shield;
            const label = actionLabels[log.action] || log.action;

            return (
              <div key={log.id} className="card p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{label}</p>
                  <p className="text-sm text-slate-500 truncate">
                    {log.details?.userName || log.details?.documentTitle || log.details?.memberName || ''}
                  </p>
                </div>
                <p className="text-xs text-slate-400 whitespace-nowrap">
                  {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
