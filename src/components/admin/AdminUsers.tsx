// ============================================
// THE VIDEO POOL - ADMIN USERS TAB
// User management with search, filter, and actions
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MoreVertical,
  Mail,
  Ban,
  CheckCircle,
  Crown,
  Clock,
  Download,
  Edit2,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { get } from '@/api/client';

interface AdminUser {
  id: number;
  email: string;
  username: string;
  membershipType: string;
  membershipStatus: string;
  role: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  downloadLimit: number | null;
  downloadsUsed: number;
  createdAt: string;
  lastLogin: string | null;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Skeleton row for loading state
function UserRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="w-4 h-4 bg-tvp-bg-tertiary rounded" /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-tvp-bg-tertiary" />
          <div className="space-y-1">
            <div className="h-3 bg-tvp-bg-tertiary rounded w-24" />
            <div className="h-3 bg-tvp-bg-tertiary rounded w-32" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-5 bg-tvp-bg-tertiary rounded w-12" /></td>
      <td className="px-4 py-3"><div className="h-5 bg-tvp-bg-tertiary rounded w-14" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-tvp-bg-tertiary rounded w-16" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-tvp-bg-tertiary rounded w-20" /></td>
      <td className="px-4 py-3"><div className="w-4 h-4 bg-tvp-bg-tertiary rounded" /></td>
    </tr>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const LIMIT = 20;

  const fetchUsers = useCallback(async (pageNum: number, search: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page: pageNum, limit: LIMIT };
      if (search) params.search = search;
      const data = await get<UsersResponse>('/admin/users', params);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr?.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchUsers(page, searchQuery);
  }, [page, searchQuery, fetchUsers]);

  // Toggle user selection
  const toggleUserSelection = (id: number) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const getMembershipBadge = (type: string) => {
    switch (type) {
      case 'elite': return 'bg-amber-500/20 text-amber-400';
      case 'pro': return 'bg-tvp-accent-cyan/20 text-tvp-accent-cyan';
      case 'starter': return 'bg-tvp-accent-purple/20 text-tvp-accent-purple';
      default: return 'bg-tvp-bg-tertiary text-tvp-text-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-tvp-status-success/20 text-tvp-status-success';
      case 'suspended': return 'bg-tvp-status-error/20 text-tvp-status-error';
      case 'cancelled': return 'bg-tvp-status-error/20 text-tvp-status-error';
      default: return 'bg-tvp-status-warning/20 text-tvp-status-warning';
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tvp-text-muted" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan outline-none"
          />
        </div>

        {/* Total count */}
        <div className="text-sm text-tvp-text-muted">
          {total.toLocaleString()} total users
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-tvp-status-error/10 border border-tvp-status-error/30 rounded-lg text-sm text-tvp-status-error">
          {error} — <button onClick={() => fetchUsers(page, searchQuery)} className="underline">Retry</button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-tvp-bg-tertiary/50">
              <tr className="text-left text-tvp-text-muted">
                <th className="px-4 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === users.length && users.length > 0}
                    onChange={toggleAll}
                    className="rounded border-tvp-border-default"
                  />
                </th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Downloads</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tvp-border-subtle">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <UserRowSkeleton key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-tvp-text-muted text-sm">
                    {searchQuery ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-tvp-bg-tertiary/30">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-tvp-border-default"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-tvp-accent-cyan/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-tvp-accent-cyan" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-tvp-text-primary">{user.username}</span>
                            {user.role === 'admin' && <Crown className="w-3 h-3 text-amber-400" />}
                            {user.emailVerified && <CheckCircle className="w-3 h-3 text-tvp-status-success" />}
                          </div>
                          <span className="text-xs text-tvp-text-muted">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs font-medium capitalize',
                        getMembershipBadge(user.membershipType)
                      )}>
                        {user.membershipType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs font-medium capitalize',
                        getStatusBadge(user.membershipStatus)
                      )}>
                        {user.membershipStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-tvp-text-secondary">
                        <Download className="w-3 h-3" />
                        <span>{user.downloadsUsed ?? 0}</span>
                        <span className="text-tvp-text-muted">
                          / {user.downloadLimit === null ? '∞' : user.downloadLimit}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-tvp-text-muted text-xs">
                        <Clock className="w-3 h-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          className="p-1 hover:bg-tvp-bg-tertiary rounded transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-tvp-text-muted" />
                        </button>

                        {openMenuId === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-tvp-bg-secondary border border-tvp-border-default rounded-lg shadow-xl z-10 py-1">
                            <button className="w-full px-3 py-2 text-left text-sm text-tvp-text-secondary hover:bg-tvp-accent-cyan/10 hover:text-tvp-accent-cyan flex items-center gap-2">
                              <Edit2 className="w-3 h-3" />
                              Edit User
                            </button>
                            <button className="w-full px-3 py-2 text-left text-sm text-tvp-text-secondary hover:bg-tvp-accent-cyan/10 hover:text-tvp-accent-cyan flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              Send Email
                            </button>
                            {user.membershipStatus === 'active' ? (
                              <button className="w-full px-3 py-2 text-left text-sm text-tvp-status-error hover:bg-tvp-status-error/10 flex items-center gap-2">
                                <Ban className="w-3 h-3" />
                                Suspend User
                              </button>
                            ) : (
                              <button className="w-full px-3 py-2 text-left text-sm text-tvp-status-success hover:bg-tvp-status-success/10 flex items-center gap-2">
                                <CheckCircle className="w-3 h-3" />
                                Activate User
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination */}
        <div className="px-4 py-3 border-t border-tvp-border-subtle flex items-center justify-between">
          <span className="text-sm text-tvp-text-muted">
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</span>
            ) : (
              `Showing ${users.length} of ${total.toLocaleString()} users`
            )}
          </span>
          <div className="flex items-center gap-2">
            {selectedUsers.size > 0 && (
              <span className="text-sm text-tvp-accent-cyan mr-4">
                {selectedUsers.size} selected
              </span>
            )}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded hover:bg-tvp-bg-tertiary disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-tvp-text-muted" />
            </button>
            <span className="text-sm text-tvp-text-muted">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded hover:bg-tvp-bg-tertiary disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-tvp-text-muted" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
