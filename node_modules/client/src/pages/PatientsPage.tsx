import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Pencil, Plus, Search, Trash2, Eye } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function PatientsPage({ user }: { user: any }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    email: '',
    phoneNumber: '',
    address: '',
    medicalNotes: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchPatients = async (nextPage = page, nextSearch = search) => {
    setLoading(true);
    try {
      const response = await api.get('/patients', { params: { page: nextPage, limit: 10, search: nextSearch } });
      const result = response.data.data;
      setPatients(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPatients(1, search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, form);
      } else {
        await api.post('/patients', form);
      }
      setForm({ fullName: '', dateOfBirth: '', gender: 'Male', email: '', phoneNumber: '', address: '', medicalNotes: '' });
      setEditingId(null);
      fetchPatients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to save patient');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to delete patient');
    }
  };

  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Patient records</p>
            <h2 className="text-3xl font-bold text-slate-900">Patient management</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="pl-9" />
            </div>
            <Button onClick={() => setEditingId(null)} className="gap-2"><Plus className="h-4 w-4" /> Add patient</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading patients...</div>
            ) : error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-4 text-sm text-red-600">{error}</div>
            ) : patients.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-lg font-medium text-slate-700">No patients found</p>
                <p className="mt-2 text-sm text-slate-500">Create the first patient record to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Gender</th>
                      <th className="pb-3 pr-4">DOB</th>
                      <th className="pb-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id} className="border-b border-slate-100 align-middle">
                        <td className="py-3 pr-4 font-medium text-slate-800">{patient.fullName}</td>
                        <td className="py-3 pr-4 text-slate-600">{patient.email || '—'}</td>
                        <td className="py-3 pr-4 text-slate-600">{patient.gender}</td>
                        <td className="py-3 pr-4 text-slate-600">{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                        <td className="py-3 pr-4">
                          <div className="flex justify-end gap-2">
                            <Link to={`/patients/${patient.id}`} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Eye className="h-4 w-4" /></Link>
                            <button onClick={() => { setEditingId(patient.id); setForm({ fullName: patient.fullName, dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.slice(0,10) : '', gender: patient.gender, email: patient.email || '', phoneNumber: patient.phoneNumber || '', address: patient.address || '', medicalNotes: patient.medicalNotes || '' }); }} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(patient.id)} className="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-end gap-2">
                {pageNumbers.map((pageNumber) => (
                  <button key={pageNumber} onClick={() => { setPage(pageNumber); fetchPatients(pageNumber, search); }} className={`h-8 w-8 rounded-md text-sm ${page === pageNumber ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {pageNumber}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold">{editingId ? 'Edit patient' : 'Add new patient'}</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Date of birth</label>
                  <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Phone number</label>
                <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Medical notes</label>
                <textarea value={form.medicalNotes} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })} className="flex min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
              <Button type="submit" className="w-full gap-2"><CheckCircle2 className="h-4 w-4" /> {editingId ? 'Update patient' : 'Create patient'}</Button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
