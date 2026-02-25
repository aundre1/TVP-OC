// ============================================
// THE VIDEO POOL - ADMIN MARKETING TAB
// ============================================

import { useState, useEffect } from 'react';
import { Send, Mail, MessageCircle } from 'lucide-react';
import { marketingApi } from '@/api/marketing';

interface Blast {
  id: string;
  type: 'email' | 'sms';
  subject: string | null;
  message: string;
  segment: string;
  recipient_count: number;
  sent_count: number;
  open_count: number;
  status: string;
  created_at: string;
}

export default function AdminMarketing() {
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'history' | 'email' | 'sms'>('history');
  const [emailForm, setEmailForm] = useState({ subject: '', htmlBody: '', segment: 'all' });
  const [smsForm, setSmsForm] = useState({ message: '', segment: 'all' });
  const [feedback, setFeedback] = useState('');

  const load = async () => {
    try {
      const data = await marketingApi.history();
      setBlasts(data.blasts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleEmailBlast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await marketingApi.sendEmail(emailForm);
      setFeedback(result.message);
      setMode('history');
      setEmailForm({ subject: '', htmlBody: '', segment: 'all' });
      load();
    } catch (e: any) {
      setFeedback(e.response?.data?.error || e.message);
    }
  };

  const handleSmsBlast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await marketingApi.sendSms(smsForm);
      setFeedback(result.message);
      setMode('history');
      setSmsForm({ message: '', segment: 'all' });
      load();
    } catch (e: any) {
      setFeedback(e.response?.data?.error || e.message);
    }
  };

  const segments = ['all', 'subscribers', 'free', 'inactive'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-tvp-text-primary flex items-center gap-2">
          <Send className="w-5 h-5" /> Marketing
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setMode('email')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${mode === 'email' ? 'bg-tvp-accent-cyan text-tvp-bg-primary' : 'bg-tvp-bg-tertiary text-tvp-text-secondary hover:text-tvp-text-primary'}`}>
            <Mail className="w-4 h-4" /> New Email
          </button>
          <button onClick={() => setMode('sms')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${mode === 'sms' ? 'bg-tvp-accent-cyan text-tvp-bg-primary' : 'bg-tvp-bg-tertiary text-tvp-text-secondary hover:text-tvp-text-primary'}`}>
            <MessageCircle className="w-4 h-4" /> New SMS
          </button>
        </div>
      </div>

      {feedback && <div className="p-3 bg-tvp-accent-cyan/10 border border-tvp-accent-cyan/20 rounded-lg text-sm text-tvp-accent-cyan">{feedback}</div>}

      {mode === 'email' && (
        <form onSubmit={handleEmailBlast} className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl p-6 space-y-4">
          <h3 className="font-medium text-tvp-text-primary">Compose Email Blast</h3>
          <input placeholder="Subject" value={emailForm.subject} onChange={e => setEmailForm({...emailForm, subject: e.target.value})} required
            className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary" />
          <textarea placeholder="HTML Body" value={emailForm.htmlBody} onChange={e => setEmailForm({...emailForm, htmlBody: e.target.value})} required rows={6}
            className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary resize-none" />
          <select value={emailForm.segment} onChange={e => setEmailForm({...emailForm, segment: e.target.value})}
            className="px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary">
            {segments.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="px-6 py-2 bg-tvp-accent-cyan text-tvp-bg-primary rounded-lg hover:bg-tvp-accent-cyan-hover">Save Email Blast</button>
        </form>
      )}

      {mode === 'sms' && (
        <form onSubmit={handleSmsBlast} className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl p-6 space-y-4">
          <h3 className="font-medium text-tvp-text-primary">Compose SMS Blast</h3>
          <div>
            <textarea placeholder="Message (max 160 chars)" value={smsForm.message} onChange={e => setSmsForm({...smsForm, message: e.target.value.slice(0, 160)})} required rows={3}
              className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary resize-none" />
            <p className={`text-xs mt-1 ${smsForm.message.length > 150 ? 'text-tvp-error' : 'text-tvp-text-muted'}`}>{smsForm.message.length}/160</p>
          </div>
          <select value={smsForm.segment} onChange={e => setSmsForm({...smsForm, segment: e.target.value})}
            className="px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary">
            {segments.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="px-6 py-2 bg-tvp-accent-cyan text-tvp-bg-primary rounded-lg hover:bg-tvp-accent-cyan-hover">Save SMS Blast</button>
        </form>
      )}

      {mode === 'history' && (
        <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-tvp-bg-tertiary text-tvp-text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Subject/Message</th>
                <th className="px-4 py-3 text-left">Segment</th>
                <th className="px-4 py-3 text-left">Recipients</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {blasts.map(b => (
                <tr key={b.id} className="border-t border-tvp-border-subtle">
                  <td className="px-4 py-3">{b.type === 'email' ? <Mail className="w-4 h-4 text-tvp-accent-cyan" /> : <MessageCircle className="w-4 h-4 text-green-400" />}</td>
                  <td className="px-4 py-3 text-tvp-text-primary truncate max-w-xs">{b.subject || b.message.slice(0, 50)}</td>
                  <td className="px-4 py-3 text-tvp-text-muted">{b.segment}</td>
                  <td className="px-4 py-3 text-tvp-text-secondary">{b.recipient_count}</td>
                  <td className="px-4 py-3 text-tvp-text-muted">{b.status}</td>
                  <td className="px-4 py-3 text-tvp-text-muted">{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {blasts.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-tvp-text-muted">No blasts yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
