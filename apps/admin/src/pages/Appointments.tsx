import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(full_name, email),
        doctor:doctor_profiles(*, profile:profiles(full_name))
      `)
      .order('created_at', { ascending: false });
    setAppointments(data || []);
    setLoading(false);
  };

  const filtered = appointments.filter(a => {
    const matchSearch =
      a.patient?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor?.profile?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'patient', label: 'Patient',
      render: (a: any) => (
        <div>
          <p className="font-medium text-gray-900">{a.patient?.full_name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{a.patient?.email}</p>
        </div>
      ),
    },
    {
      key: 'doctor', label: 'Doctor',
      render: (a: any) => (
        <div>
          <p className="font-medium text-gray-900">{a.doctor?.profile?.full_name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{a.doctor?.specialization}</p>
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (a: any) => new Date(a.date).toLocaleDateString() },
    { key: 'time', label: 'Time' },
    {
      key: 'type', label: 'Type',
      render: (a: any) => <span className="capitalize text-sm">{a.type}</span>,
    },
    { key: 'payment_amount', label: 'Fee', render: (a: any) => a.payment_amount ? `₹${a.payment_amount}` : '-' },
    { key: 'status', label: 'Status', render: (a: any) => <StatusBadge status={a.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-sm text-gray-500 mt-1">View all doctor appointments</p>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by patient or doctor name..."
        filters={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="all">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        }
      />
    </div>
  );
}
