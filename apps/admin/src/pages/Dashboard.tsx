import { useEffect, useState } from 'react';
import { Users, Stethoscope, Store, FlaskConical, Clock, ShoppingCart, CalendarCheck, Pill } from 'lucide-react';
import { supabase } from '../lib/supabase';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';

interface Stats {
  totalPatients: number;
  totalDoctors: number;
  totalStores: number;
  totalDiagnostics: number;
  pendingApprovals: number;
  totalOrders: number;
  totalAppointments: number;
  pendingMedicines: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0, totalDoctors: 0, totalStores: 0, totalDiagnostics: 0,
    pendingApprovals: 0, totalOrders: 0, totalAppointments: 0, pendingMedicines: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const [patients, doctors, stores, diagnostics, pending, orders, appointments, pendingMeds, recent] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'patient'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'doctor'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'medical_store'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'diagnostics'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true }),
      supabase.from('medicines').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      totalPatients: patients.count || 0,
      totalDoctors: doctors.count || 0,
      totalStores: stores.count || 0,
      totalDiagnostics: diagnostics.count || 0,
      pendingApprovals: pending.count || 0,
      totalOrders: orders.count || 0,
      totalAppointments: appointments.count || 0,
      pendingMedicines: pendingMeds.count || 0,
    });
    setRecentUsers(recent.data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Patients" value={stats.totalPatients} icon={Users} color="blue" />
        <StatsCard title="Doctors" value={stats.totalDoctors} icon={Stethoscope} color="green" />
        <StatsCard title="Medical Stores" value={stats.totalStores} icon={Store} color="purple" />
        <StatsCard title="Diagnostic Centers" value={stats.totalDiagnostics} icon={FlaskConical} color="indigo" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Pending Approvals" value={stats.pendingApprovals} icon={Clock} color="amber" subtitle="Requires attention" />
        <StatsCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="blue" />
        <StatsCard title="Appointments" value={stats.totalAppointments} icon={CalendarCheck} color="green" />
        <StatsCard title="Pending Medicines" value={stats.pendingMedicines} icon={Pill} color="red" subtitle="Awaiting review" />
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Recent Registrations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.full_name || 'Unnamed'}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-600 capitalize">{u.role?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={u.status || 'approved'} />
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">No users yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
