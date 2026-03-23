import React, { useEffect, useState } from 'react';
import { getDocuments } from '../api';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const docs = await getDocuments();
      const recentDocs = [...docs]
        .sort((a, b) => new Date(b.uploaded_at || 0) - new Date(a.uploaded_at || 0))
        .slice(0, 8);
      setActivities(recentDocs);
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const uploadedAgo = (iso) => {
    if (!iso) return 'Unknown time';
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getIcon = (filename) => {
    if (!filename) return 'description';
    if (filename.endsWith('.pdf')) return 'picture_as_pdf';
    if (filename.endsWith('.csv')) return 'table_chart';
    return 'description';
  };

  return (
    <aside className="w-[220px] min-w-[220px] h-full bg-surface-low border-r border-surface-high flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-surface-high flex items-center justify-between">
        <span className="font-semibold text-[14px] text-on-surface">Recent Activity</span>
        <button
          onClick={loadActivities}
          title="Refresh"
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-container transition-all"
        >
          <span className="material-symbols-outlined text-[15px] text-on-surface-variant">refresh</span>
        </button>
      </div>

      {/* Activity list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2 space-y-1">
        {loading && (
          <div className="flex flex-col gap-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-surface-container animate-pulse" />
            ))}
          </div>
        )}

        {!loading && activities.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant opacity-40 mb-2">
              inbox
            </span>
            <p className="text-[11px] text-on-surface-variant">No recent activity</p>
          </div>
        )}

        {!loading && activities.map((doc) => (
          <div
            key={doc.id}
            className="flex items-start gap-2.5 px-2 py-2.5 rounded-btn hover:bg-surface-container transition-all cursor-default group"
          >
            {/* Icon */}
            <div className="w-8 h-8 rounded-full bg-secondary-fixed flex-shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px] text-secondary">
                {getIcon(doc.filename)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-on-surface-variant mb-0.5">
                Upload · {uploadedAgo(doc.uploaded_at)}
              </p>
              <p className="text-[12px] font-medium text-on-surface truncate group-hover:text-primary" title={doc.filename}>
                {doc.filename}
              </p>
              <span
                className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${
                  doc.status === 'indexed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {doc.status || 'Processed'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default RecentActivity;
