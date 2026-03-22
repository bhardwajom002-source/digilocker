import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { Bell, AlertTriangle, CheckCircle, Clock, FileText, ChevronRight } from 'lucide-react';
import { getExpiringDocuments, getAllMembers } from '../db';
import { getCategoryInfo } from '../utils/constants';

export default function Notifications() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [members, setMembers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const [expiringDocs, membersList] = await Promise.all([
        getExpiringDocuments(365),
        getAllMembers(),
      ]);

      const membersMap = {};
      membersList.forEach(m => { membersMap[m.id] = m; });
      setMembers(membersMap);

      const alertsData = expiringDocs.map(doc => {
        const daysLeft = differenceInDays(new Date(doc.expiryDate), new Date());
        let severity = 'info';
        if (daysLeft < 0) severity = 'expired';
        else if (daysLeft <= 7) severity = 'critical';
        else if (daysLeft <= 30) severity = 'warning';
        else if (daysLeft <= 90) severity = 'notice';

        return {
          doc,
          member: membersMap[doc.memberId],
          daysLeft,
          severity,
        };
      });

      // Sort: expired first, then by days left
      alertsData.sort((a, b) => a.daysLeft - b.daysLeft);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'expired':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-danger', label: 'Expired' };
      case 'critical':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-danger', label: 'Critical' };
      case 'warning':
        return { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', label: 'Warning' };
      case 'notice':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600', label: 'Soon' };
      default:
        return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', label: 'Info' };
    }
  };

  const groupedAlerts = {
    expired: alerts.filter(a => a.severity === 'expired'),
    critical: alerts.filter(a => a.severity === 'critical'),
    warning: alerts.filter(a => a.severity === 'warning'),
    notice: alerts.filter(a => a.severity === 'notice'),
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold text-slate-900">Notifications</h1>
      </div>

      {alerts.length === 0 ? (
        <div className="card p-8 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-medium text-slate-900 mb-1">All clear!</h3>
          <p className="text-sm text-slate-500">No documents expiring soon</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAlerts).map(([severity, items]) => {
            if (items.length === 0) return null;
            const style = getSeverityStyle(severity);

            return (
              <div key={severity}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`w-4 h-4 ${style.icon}`} />
                  <h2 className={`font-medium capitalize ${style.icon}`}>
                    {style.label} ({items.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {items.map(alert => (
                    <div
                      key={alert.doc.id}
                      onClick={() => navigate(`/document/${alert.doc.id}`)}
                      className={`card p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow ${style.bg} ${style.border}`}
                    >
                      <FileText className={`w-5 h-5 ${style.icon}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{alert.doc.title}</p>
                        <p className="text-sm text-slate-600">
                          {alert.member?.name || 'Unknown'} • Expires {alert.daysLeft < 0 ? `${Math.abs(alert.daysLeft)} days ago` : `in ${alert.daysLeft} days`}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
