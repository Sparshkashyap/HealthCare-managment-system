import { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarRange, FileText, Users, Stethoscope, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/services/api';

export default function DashboardPage({ user }: { user: any }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, mappingsRes] = await Promise.all([
          api.get('/patients?page=1&limit=10'),
          api.get('/doctors?page=1&limit=10'),
          api.get('/mappings?page=1&limit=20'),
        ]);

        setPatients(patientsRes.data.data.data || []);
        setDoctors(doctorsRes.data.data.data || []);
        setMappings(mappingsRes.data.data.data || []);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(
    () => [
      { label: 'Patients', value: patients.length, icon: Users, tone: 'bg-blue-50 text-blue-600' },
      { label: 'Doctors', value: doctors.length, icon: Stethoscope, tone: 'bg-emerald-50 text-emerald-600' },
      { label: 'Assignments', value: mappings.length, icon: Activity, tone: 'bg-violet-50 text-violet-600' },
    ],
    [patients.length, doctors.length, mappings.length],
  );

  const chartData = useMemo(() => {
    const bySpecialization = doctors.reduce((acc: Record<string, number>, doctor) => {
      acc[doctor.specialization] = (acc[doctor.specialization] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(bySpecialization).map(([name, value]) => ({ name, value }));
  }, [doctors]);

  const pieData = [
    { name: 'Patients', value: patients.length },
    { name: 'Doctors', value: doctors.length },
    { name: 'Assignments', value: mappings.length },
  ];
  const COLORS = ['#1d63d8', '#10b981', '#8b5cf6'];

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <h2 className="text-3xl font-bold text-slate-900">{user?.fullName || 'Healthcare team'}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/patients" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"><Plus className="h-4 w-4" />Add patient</Link>
            <Link to="/doctors" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Plus className="h-4 w-4" />Add doctor</Link>
            <Link to="/assignments" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><CalendarRange className="h-4 w-4" />Assign doctor</Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '—' : value}</p>
                </div>
                <div className={`rounded-xl p-3 ${tone}`}><Icon className="h-6 w-6" /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Doctor specialization mix</h3>
              <span className="text-sm text-slate-500">Live data</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1d63d8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold">Population overview</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45}>
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recently added patients</h3>
              <Link to="/patients" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600">View all <ArrowRight className="h-4 w-4"/></Link>
            </div>
            <div className="space-y-3">
              {patients.length ? patients.slice(0, 4).map((patient) => (
                <div key={patient.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div>
                    <p className="font-medium text-slate-800">{patient.fullName}</p>
                    <p className="text-xs text-slate-500">{patient.email || 'No email provided'}</p>
                  </div>
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>
              )) : <div className="text-sm text-slate-500">No patients yet.</div>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent assignments</h3>
              <Link to="/assignments" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600">View all <ArrowRight className="h-4 w-4"/></Link>
            </div>
            <div className="space-y-3">
              {mappings.length ? mappings.slice(0, 4).map((mapping) => (
                <div key={mapping.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div>
                    <p className="font-medium text-slate-800">{mapping.patient?.fullName || 'Patient'} → {mapping.doctor?.fullName || 'Doctor'}</p>
                    <p className="text-xs text-slate-500">{new Date(mapping.assignedAt).toLocaleDateString()}</p>
                  </div>
                  <CalendarRange className="h-4 w-4 text-slate-400" />
                </div>
              )) : <div className="text-sm text-slate-500">No assignments yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
