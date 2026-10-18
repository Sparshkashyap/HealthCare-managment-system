import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ patientId: '', doctorId: '' });
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patientsRes, doctorsRes, mappingsRes] = await Promise.all([
        api.get('/patients?page=1&limit=100'),
        api.get('/doctors?page=1&limit=100'),
        api.get('/mappings?page=1&limit=100'),
      ]);
      setPatients(patientsRes.data.data.data || []);
      setDoctors(doctorsRes.data.data.data || []);
      setAssignments(mappingsRes.data.data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/mappings', form);
      setForm({ patientId: '', doctorId: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to assign doctor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this assignment?')) return;
    try {
      await api.delete(`/mappings/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to remove assignment');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Care coordination</p>
            <h2 className="text-3xl font-bold text-slate-900">Assignments</h2>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading assignments...</div>
            ) : error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-4 text-sm text-red-600">{error}</div>
            ) : assignments.length === 0 ? (
              <div className="py-10 text-center text-slate-500">No assignments recorded.</div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                    <div>
                      <p className="font-medium text-slate-800">{assignment.patient?.fullName || 'Patient'} → {assignment.doctor?.fullName || 'Doctor'}</p>
                      <p className="text-xs text-slate-500">Assigned on {new Date(assignment.assignedAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDelete(assignment.id)} className="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold">Assign doctor</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Patient</label>
                <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="">Select patient</option>
                  {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Doctor</label>
                <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full gap-2"><Plus className="h-4 w-4" />Create assignment</Button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
