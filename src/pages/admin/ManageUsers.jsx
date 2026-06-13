import { useEffect, useState } from 'react';
import userService from '@/services/userService';
import { getInitials, formatDate, statusColor } from '@/utils/helpers';
import { Search, ShieldOff, Shield, Trash2, Users } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRole] = useState('all');
  const [actionId, setAI]   = useState('');

  const load = () => {
    setLoad(true);
    userService.getAll()
      .then(r => setUsers(r.data?.data?.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoad(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.name?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const action = async (fn, id) => {
    setAI(id);
    try { await fn(id); load(); } catch {}
    setAI('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-surface-900">Manage Users</h1>
        <p className="text-surface-500 mt-1">View and manage all platform users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input className="input pl-9" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-40" value={roleFilter} onChange={e => setRole(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="passenger">Passenger</option>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="spinner w-6 h-6 border-[3px]" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-surface-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  <th className="text-left px-4 py-3 text-surface-500 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-surface-500 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-surface-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-surface-500 font-medium">Joined</th>
                  <th className="text-left px-4 py-3 text-surface-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700 flex-shrink-0">
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-surface-900 truncate">{u.name}</p>
                          <p className="text-xs text-surface-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize
                        ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'driver' ? 'bg-green-100 text-green-700' :
                          'bg-primary-100 text-primary-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusColor(u.status || 'active')}`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-surface-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {u.status === 'blocked' ? (
                          <button onClick={() => action(userService.unblock, u._id)}
                            disabled={actionId === u._id}
                            title="Unblock"
                            className="p-1.5 rounded hover:bg-green-50 text-green-600 hover:text-green-700 transition-colors">
                            {actionId === u._id ? <span className="spinner w-3 h-3" /> : <Shield size={14} />}
                          </button>
                        ) : (
                          <button onClick={() => action(userService.block, u._id)}
                            disabled={actionId === u._id}
                            title="Block"
                            className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600 hover:text-yellow-700 transition-colors">
                            {actionId === u._id ? <span className="spinner w-3 h-3" /> : <ShieldOff size={14} />}
                          </button>
                        )}
                        <button onClick={() => action(userService.delete, u._id)}
                          disabled={actionId === u._id}
                          title="Delete"
                          className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
