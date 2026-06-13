import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Users, Car, BarChart2, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { getInitials } from '@/utils/helpers';

const links = [
  { to: '/admin',            label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/users',      label: 'Manage Users', icon: Users  },
  { to: '/admin/rides',      label: 'Manage Rides', icon: Car    },
  { to: '/admin/analytics',  label: 'Analytics',    icon: BarChart2 },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const handleLogout = async () => { await logout(); navigate('/login'); };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-surface-100 w-64">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-100">
        <div className="w-8 h-8 rounded-lg bg-purple-700 flex items-center justify-center">
          <span className="text-white font-heading font-bold text-sm">N</span>
        </div>
        <span className="font-heading font-bold text-surface-900 text-lg">NepRide</span>
        <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setOpen(false)}
          >
            <Icon size={18} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-surface-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-700">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-surface-900 truncate">{user?.name}</p>
            <p className="text-xs text-surface-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-outline w-full justify-center text-xs gap-2">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-surface-50">
      <div className="hidden md:flex flex-shrink-0"><Sidebar /></div>
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-50 flex flex-col w-64"><Sidebar /></div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-surface-100">
          <button onClick={() => setOpen(true)} className="p-1 rounded-md hover:bg-surface-100"><Menu size={20} /></button>
          <span className="font-heading font-bold text-surface-900">NepRide Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
