import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import PatientsPage from '@/pages/PatientsPage';
import DoctorsPage from '@/pages/DoctorsPage';
import AssignmentsPage from '@/pages/AssignmentsPage';
import ProfilePage from '@/pages/ProfilePage';
import PatientDetailPage from '@/pages/PatientDetailPage';
import api from './services/api';

function ProtectedRoute({ children, user }: { children: React.ReactNode; user: any }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((response: any) => {
        setUser(response.data.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onAuthSuccess={setUser} />} />
      <Route path="/register" element={<RegisterPage onAuthSuccess={setUser} />} />
      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            <DashboardPage user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute user={user}>
            <PatientsPage user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute user={user}>
            <PatientDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctors"
        element={
          <ProtectedRoute user={user}>
            <DoctorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute user={user}>
            <AssignmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute user={user}>
            <ProfilePage onLogout={() => setUser(null)} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
