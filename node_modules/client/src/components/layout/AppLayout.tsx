import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Activity, CalendarCheck2, HeartPulse, Home, LogOut, Menu, Pill, UserCircle2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const links = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/doctors', label: 'Doctors', icon: Activity },
  { to: '/assignments', label: 'Assignments', icon: CalendarCheck2 },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
];

export default function AppLayout({ children, user }: { children: React.ReactNode; user?: any }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-5 transition-transform lg:static lg:translate-x-0`}>
          <div className="mb-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-primary-700">
              <div className="rounded-xl bg-primary-50 p-2"><HeartPulse className="h-5 w-5" /></div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Care</div>
                <div className="text-lg font-bold">HealthHub</div>
              </div>
            </div>
            <button className="rounded-md p-2 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(false)}><Menu /></button>
          </div>

          <nav className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-full bg-primary-100 p-2 text-primary-700"><UserCircle2 className="h-4 w-4" /></div>
              <div>
                <div className="text-sm font-semibold">{user?.fullName || 'Current user'}</div>
                <div className="text-xs text-slate-500">{user?.email || ''}</div>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-center gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-sm lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <button className="rounded-md p-2 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Healthcare overview</p>
                <h1 className="text-xl font-bold text-slate-900">Operations dashboard</h1>
              </div>
              <Link to="/patients" className="hidden items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 md:inline-flex">
                <Pill className="h-4 w-4" />
                Manage patients
              </Link>
            </div>
          </header>
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
