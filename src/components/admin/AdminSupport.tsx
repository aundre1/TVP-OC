// ============================================
// THE VIDEO POOL - ADMIN SUPPORT TICKETS TAB
// ============================================

import { useState, useEffect } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { supportApi } from '@/api/support';

interface Ticket {
  id: string;
  user_email: string;
  category: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  assignee: string;
  admin_response: string | null;
  created_at: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  song_request: 'bg-blue-500/20 text-blue-400',
  bug: 'bg-red-500/20 text-red-400',
  billing: 'bg-yellow-500/20 text-yellow-400',
  other: 'bg-gray-500/20 text-gray-400',
};

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [response, setResponse] = useState('');

  const load = async () => {
    try {
      const params: any = {};
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      const data = await supportApi.adminList(params);
      setTickets(data.tickets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterCategory, filterStatus]);

  const handleRespond = async (id: string, status: string) => {
    await supportApi.adminUpdate(id, { status, admin_response: response || undefined });
    setResponse('');
    setExpanded(null);
    load();
  };

  if (loading) return <div className="text-tvp-text-muted p-8">Loading tickets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-tvp-text-primary flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Support Tickets
        </h2>
        <div className="flex gap-2">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary text-sm">
            <option value="">All Categories</option>
            <option value="song_request">Song Requests</option>
            <option value="bug">Bugs</option>
            <option value="billing">Billing</option>
            <option value="other">Other</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary text-sm">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {tickets.map(t => (
          <div key={t.id} className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl overflow-hidden">
            <button onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-tvp-bg-tertiary/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[t.category] || CATEGORY_COLORS.other}`}>
                  {t.category}
                </span>
                <span className="text-tvp-text-primary text-sm font-medium">{t.subject}</span>
                <span className="text-tvp-text-muted text-xs">{t.user_email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  t.status === 'open' ? 'bg-green-500/20 text-green-400' :
                  t.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>{t.status}</span>
                <span className="text-tvp-text-muted text-xs">{new Date(t.created_at).toLocaleDateString()}</span>
                {expanded === t.id ? <ChevronUp className="w-4 h-4 text-tvp-text-muted" /> : <ChevronDown className="w-4 h-4 text-tvp-text-muted" />}
              </div>
            </button>

            {expanded === t.id && (
              <div className="px-4 pb-4 border-t border-tvp-border-subtle pt-3 space-y-3">
                <p className="text-tvp-text-secondary text-sm">{t.message}</p>
                <div className="text-xs text-tvp-text-muted">Assigned to: {t.assignee} | Priority: {t.priority}</div>
                {t.admin_response && (
                  <div className="bg-tvp-bg-tertiary rounded-lg p-3">
                    <p className="text-xs text-tvp-text-muted mb-1">Admin Response:</p>
                    <p className="text-sm text-tvp-text-primary">{t.admin_response}</p>
                  </div>
                )}
                <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Write a response..."
                  className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary text-sm resize-none" rows={3} />
                <div className="flex gap-2">
                  <button onClick={() => handleRespond(t.id, 'in_progress')}
                    className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30">In Progress</button>
                  <button onClick={() => handleRespond(t.id, 'resolved')}
                    className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30">Resolve</button>
                  <button onClick={() => handleRespond(t.id, 'closed')}
                    className="px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded-lg text-sm hover:bg-gray-500/30">Close</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {tickets.length === 0 && (
          <div className="text-center text-tvp-text-muted py-12">No tickets found</div>
        )}
      </div>
    </div>
  );
}
