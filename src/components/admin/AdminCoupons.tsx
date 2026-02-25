// ============================================
// THE VIDEO POOL - ADMIN COUPONS TAB
// ============================================

import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { couponsApi } from '@/api/coupons';

interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed' | 'trial_days';
  value: number;
  max_uses: number | null;
  current_uses: number;
  applicable_plans: string[];
  expires_at: string | null;
  is_active: boolean;
  total_redemptions: string;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', maxUses: '', expiresAt: '', applicablePlans: '' });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await couponsApi.list();
      setCoupons(data.coupons || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await couponsApi.create({
        code: form.code,
        type: form.type,
        value: parseFloat(form.value),
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
        applicablePlans: form.applicablePlans ? form.applicablePlans.split(',').map(s => s.trim()) : undefined,
      });
      setShowCreate(false);
      setForm({ code: '', type: 'percent', value: '', maxUses: '', expiresAt: '', applicablePlans: '' });
      load();
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await couponsApi.remove(id);
    load();
  };

  const formatType = (type: string, value: number) =>
    type === 'percent' ? `${value}% off` : type === 'fixed' ? `$${value} off` : `${value} day trial`;

  if (loading) return <div className="text-tvp-text-muted p-8">Loading coupons...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-tvp-text-primary flex items-center gap-2">
          <Tag className="w-5 h-5" /> Coupons
        </h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-tvp-accent-cyan text-tvp-bg-primary rounded-lg hover:bg-tvp-accent-cyan-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {error && <div className="p-3 bg-tvp-error/10 border border-tvp-error/20 rounded-lg text-sm text-tvp-error">{error}</div>}

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Code (e.g. SAVE20)" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required
              className="px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary">
              <option value="percent">Percent Off</option>
              <option value="fixed">Fixed Amount Off</option>
              <option value="trial_days">Trial Days</option>
            </select>
            <input type="number" placeholder="Value" value={form.value} onChange={e => setForm({...form, value: e.target.value})} required
              className="px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary" />
            <input type="number" placeholder="Max Uses (optional)" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})}
              className="px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary" />
            <input type="datetime-local" placeholder="Expires" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})}
              className="px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary" />
            <input placeholder="Plans (basic,pro,lifetime)" value={form.applicablePlans} onChange={e => setForm({...form, applicablePlans: e.target.value})}
              className="px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary" />
          </div>
          <button type="submit" className="px-6 py-2 bg-tvp-accent-cyan text-tvp-bg-primary rounded-lg hover:bg-tvp-accent-cyan-hover">Create</button>
        </form>
      )}

      <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-tvp-bg-tertiary text-tvp-text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Uses</th>
              <th className="px-4 py-3 text-left">Expires</th>
              <th className="px-4 py-3 text-left">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="border-t border-tvp-border-subtle">
                <td className="px-4 py-3 text-tvp-text-primary font-mono">{c.code}</td>
                <td className="px-4 py-3 text-tvp-text-secondary">{formatType(c.type, c.value)}</td>
                <td className="px-4 py-3 text-tvp-text-secondary">{c.current_uses}/{c.max_uses || '∞'}</td>
                <td className="px-4 py-3 text-tvp-text-muted">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
                <td className="px-4 py-3">{c.is_active ? <span className="text-tvp-success">✓</span> : <span className="text-tvp-error">✗</span>}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(c.id)} className="text-tvp-error hover:text-tvp-error/80">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-tvp-text-muted">No coupons yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
