import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, Loader2, Pencil, Trash2, UserPlus } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ patientId: '', doctorId: '' });
  const [doctors, setDoctors] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [patientRes, doctorsRes, mappingRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get('/doctors?page=1&limit=100'),
        api.get(`/mappings/${id}`),
      ]);
      setPatient(patientRes.data.data);
      setDoctors(doctorsRes.data.data.data || []);
      setAssignments(mappingRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    try {
      await api.post('/mappings', { patientId: id, doctorId: form.doctorId });
      setForm({ patientId: '', doctorId: '' });
      fetchData();
    } catch (error) {
      console.error('Assign doctor failed', error);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this patient?')) return;
    await api.delete(`/patients/${id}`);
    window.location.href = '/patients';
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-20 text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading patient details...</div></AppLayout>;
  }

  if (!patient) return <AppLayout><div className="py-20 text-center text-slate-500">Patient not found.</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"><ChevronLeft className="h-4 w-4" />Back</button>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><Pencil className="h-4 w-4" />Edit</Button>
            <Button variant="destructive" className="gap-2" onClick={handleDelete}><Trash2 className="h-4 w-4" />Delete</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">Patient record</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-900">{patient.fullName}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs uppercase tracking-wide text-slate-500">Email</p><p className="mt-1 text-slate-800">{patient.email || '—'}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-slate-500">Phone</p><p className="mt-1 text-slate-800">{patient.phoneNumber || '—'}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-slate-500">Date of birth</p><p className="mt-1 text-slate-800">{new Date(patient.dateOfBirth).toLocaleDateString()}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-slate-500">Gender</p><p className="mt-1 text-slate-800">{patient.gender}</p></div>
              <div className="sm:col-span-2"><p className="text-xs uppercase tracking-wide text-slate-500">Address</p><p className="mt-1 text-slate-800">{patient.address || '—'}</p></div>
              <div className="sm:col-span-2"><p className="text-xs uppercase tracking-wide text-slate-500">Medical notes</p><p className="mt-1 text-slate-800">{patient.medicalNotes || 'No notes provided.'}</p></div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold">Assign doctor</h3>
            <form className="mt-4 space-y-4" onSubmit={handleAssignment}>
              <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="">Select doctor</option>
                {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName}</option>)}
              </select>
              <Button type="submit" className="w-full gap-2"><UserPlus className="h-4 w-4" />Assign</Button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold">Assigned doctors</h3>
          {assignments.length === 0 ? <div className="mt-4 text-sm text-slate-500">No doctors assigned yet.</div> : (
            <div className="mt-4 space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="font-medium text-slate-800">{assignment.doctor?.fullName}</p>
                    <p className="text-xs text-slate-500">{assignment.doctor?.specialization}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={async () => { await api.delete(`/mappings/${assignment.id}`); fetchData(); }}>Remove</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
