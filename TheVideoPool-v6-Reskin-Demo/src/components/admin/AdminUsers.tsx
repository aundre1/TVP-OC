// ============================================
// THE VIDEO POOL - ADMIN USERS TAB
// User management with search, filter, and actions
// ============================================

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Mail,
  Ban,
  CheckCircle,
  XCircle,
  Crown,
  Clock,
  Download,
  Edit2,
  Trash2,
  User,
} from 'lucide-react';
import { clsx } from 'clsx';

interface AdminUser {
  id: number;
  email: string;
  username: string;
  membershipType: 'free' | 'pro' | 'elite';
  isAdmin: boolean;
  emailVerified: boolean;
  createdAt: string;
  downloadsThisMonth: number;
  downloadLimit: number;
  status: 'active' | 'suspended' | 'pending';
}

// Mock users data
const mockUsers: AdminUser[] = [
  {
    id: 1,
    email: 'dev@thevideopool.com',
    username: 'DevUser',
    membershipType: 'pro',
    isAdmin: true,
    emailVerified: true,
    createdAt: '2024-01-01',
    downloadsThisMonth: 15,
    downloadLimit: 200,
    status: 'active',
  },
  {
    id: 2,
    email: 'djmike@gmail.com',
    username: 'DJMike23',
    membershipType: 'pro',
    isAdmin: false,
    emailVerified: true,
    createdAt: '2025-06-15',
    downloadsThisMonth: 89,
    downloadLimit: 200,
    status: 'active',
  },
  {
    id: 3,
    email: 'beatmaster@outlook.com',
    username: 'BeatMaster',
    membershipType: 'elite',
    isAdmin: false,
    emailVerified: true,
    createdAt: '2024-03-20',
    downloadsThisMonth: 156,
    downloadLimit: 500,
    status: 'active',
  },
  {
    id: 4,
    email: 'newbie@yahoo.com',
    username: 'NewbieDJ',
    membershipType: 'free',
    isAdmin: false,
    emailVerified: false,
    createdAt: '2026-01-20',
    downloadsThisMonth: 1,
    downloadLimit: 2,
    status: 'pending',
  },
  {
    id: 5,
    email: 'suspended@test.com',
    username: 'SuspendedUser',
    membershipType: 'pro',
    isAdmin: false,
    emailVerified: true,
    createdAt: '2025-01-10',
    downloadsThisMonth: 0,
    downloadLimit: 200,
    status: 'suspended',
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMembership, setFilterMembership] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMembership =
      filterMembership === 'all' || user.membershipType === filterMembership;
    const matchesStatus =
      filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesMembership && matchesStatus;
  });

  // Toggle user selection
  const toggleUserSelection = (id: number) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle all
  const toggleAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  // Get membership badge
  const getMembershipBadge = (type: string) => {
    switch (type) {
      case 'elite':
        return 'bg-amber-500/20 text-amber-400';
      case 'pro':
        return 'bg-tvp-accent-cyan/20 text-tvp-accent-cyan';
      default:
        return 'bg-tvp-bg-tertiary text-tvp-text-muted';
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-tvp-status-success/20 text-tvp-status-success';
      case 'suspended':
        return 'bg-tvp-status-error/20 text-tvp-status-error';
      default:
        return 'bg-tvp-status-warning/20 text-tvp-status-warning';
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filterMembership}
            onChange={(e) => setFilterMembership(e.target.value)}
            className="px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg text-tvp-text-primary text-sm focus:border-tvp-accent-cyan outline-none"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="elite">Elite</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg text-tvp-text-primary text-sm focus:border-tvp-accent-cyan outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-tvp-bg-tertiary/50">
              <tr className="text-left text-tvp-text-muted">
                <th className="px-4 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
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
              {filteredUsers.map((user) => (
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
                          {user.isAdmin && <Crown className="w-3 h-3 text-amber-400" />}
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
                      getStatusBadge(user.status)
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-tvp-text-secondary">
                      <Download className="w-3 h-3" />
                      <span>{user.downloadsThisMonth}</span>
                      <span className="text-tvp-text-muted">/ {user.downloadLimit}</span>
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
                          {user.status === 'active' ? (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-tvp-border-subtle flex items-center justify-between">
          <span className="text-sm text-tvp-text-muted">
            Showing {filteredUsers.length} of {users.length} users
          </span>
          {selectedUsers.size > 0 && (
            <span className="text-sm text-tvp-accent-cyan">
              {selectedUsers.size} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
