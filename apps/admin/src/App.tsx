import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import MedicalStores from './pages/MedicalStores';
import DiagnosticCenters from './pages/DiagnosticCenters';
import Patients from './pages/Patients';
import Medicines from './pages/Medicines';
import Orders from './pages/Orders';
import Appointments from './pages/Appointments';
import LabBookings from './pages/LabBookings';

export default function App() {
  const { user, profile, loading, signIn, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user || !profile) {
    return <Login onLogin={signIn} />;
  }

  return (
    <Layout profile={profile} onLogout={signOut}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/medical-stores" element={<MedicalStores />} />
        <Route path="/diagnostic-centers" element={<DiagnosticCenters />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/lab-bookings" element={<LabBookings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
