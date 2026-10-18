import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function ProfilePage({ onLogout }: { onLogout: () => void }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((response: any) => setUser(response.data.data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      onLogout();
      window.location.href = '/login';
    }
  };

  return (
    <AppLayout user={user}>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-full bg-primary-100 p-4 text-primary-700"><UserCircle2 className="h-8 w-8" /></div>
          <div>
            <p className="text-sm text-slate-500">Authenticated account</p>
            <h2 className="text-2xl font-bold text-slate-900">{user?.fullName || 'User profile'}</h2>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Email</span>
            <span className="font-medium text-slate-800">{user?.email || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Authentication</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span>
          </div>
        </div>

        <Button variant="outline" className="mt-6 w-full gap-2 text-red-600" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </AppLayout>
  );
}
