import { useEffect, useMemo, useState } from 'react';
import { Search, Pencil, Plus, Trash2, Eye, Loader2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    specialization: '',
    email: '',
    phoneNumber: '',
    clinicAddress: '',
    yearsOfExperience: 0,
    registrationNumber: '',
  });

  const fetchDoctors = async (nextPage = page, nextSearch = search, nextSpec = specialization) => {
    setLoading(true);
    try {
      const response = await api.get('/doctors', {
        params: { page: nextPage, limit: 10, search: nextSearch, specialization: nextSpec },
      });
      const result = response.data.data;
      setDoctors(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDoctors(1, search, specialization);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, specialization]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}`, form);
      } else {
        await api.post('/doctors', form);
      }
      setForm({ fullName: '', specialization: '', email: '', phoneNumber: '', clinicAddress: '', yearsOfExperience: 0, registrationNumber: '' });
      setEditingId(null);
      fetchDoctors();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to save doctor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to delete doctor');
    }
  };

  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Doctor directory</p>
            <h2 className="text-3xl font-bold text-slate-900">Doctors</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctor" className="pl-9" />
            </div>
            <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Specialization" className="min-w-44" />
            <Button className="gap-2"><Plus className="h-4 w-4" />Add doctor</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading doctors...</div>
            ) : error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-4 text-sm text-red-600">{error}</div>
            ) : doctors.length === 0 ? (
              <div className="py-10 text-center text-slate-500">No doctors match the current search.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Specialization</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doctor) => (
                      <tr key={doctor.id} className="border-b border-slate-100 align-middle">
                        <td className="py-3 pr-4 font-medium text-slate-800">{doctor.fullName}</td>
                        <td className="py-3 pr-4 text-slate-600">{doctor.specialization}</td>
                        <td className="py-3 pr-4 text-slate-600">{doctor.email}</td>
                        <td className="py-3 pr-4">
                          <div className="flex justify-end gap-2">
                            <button className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Eye className="h-4 w-4" /></button>
                            <button onClick={() => { setEditingId(doctor.id); setForm({ fullName: doctor.fullName, specialization: doctor.specialization, email: doctor.email, phoneNumber: doctor.phoneNumber || '', clinicAddress: doctor.clinicAddress || '', yearsOfExperience: doctor.yearsOfExperience, registrationNumber: doctor.registrationNumber || '' }); }} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(doctor.id)} className="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
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
                  <button key={pageNumber} onClick={() => { setPage(pageNumber); fetchDoctors(pageNumber, search, specialization); }} className={`h-8 w-8 rounded-md text-sm ${page === pageNumber ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {pageNumber}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold">{editingId ? 'Edit doctor' : 'Add new doctor'}</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Specialization</label>
                <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Phone number</label>
                <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Clinic address</label>
                <Input value={form.clinicAddress} onChange={(e) => setForm({ ...form, clinicAddress: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Experience</label>
                  <Input type="number" min={0} value={form.yearsOfExperience} onChange={(e) => setForm({ ...form, yearsOfExperience: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Registration</label>
                  <Input value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} />
                </div>
              </div>
              <Button type="submit" className="w-full">{editingId ? 'Update doctor' : 'Create doctor'}</Button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
