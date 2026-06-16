import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function LabBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('lab_bookings')
      .select(`
        *,
        patient:profiles!lab_bookings_patient_id_fkey(full_name, email),
        lab_test:lab_tests(name, category, price)
      `)
      .order('created_at', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('lab_bookings').update({ status }).eq('id', id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const filtered = bookings.filter(b => {
    const matchSearch =
      b.patient?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.lab_test?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'patient', label: 'Patient',
      render: (b: any) => (
        <div>
          <p className="font-medium text-gray-900">{b.patient?.full_name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{b.patient?.email}</p>
        </div>
      ),
    },
    {
      key: 'test', label: 'Test',
      render: (b: any) => (
        <div>
          <p className="font-medium text-gray-900">{b.lab_test?.name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{b.lab_test?.category}</p>
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (b: any) => new Date(b.date).toLocaleDateString() },
    { key: 'collection_type', label: 'Collection', render: (b: any) => <span className="capitalize text-sm">{b.collection_type}</span> },
    { key: 'payment_amount', label: 'Amount', render: (b: any) => b.payment_amount ? `₹${b.payment_amount}` : '-' },
    { key: 'status', label: 'Status', render: (b: any) => <StatusBadge status={b.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lab Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage lab test bookings</p>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by patient or test name..."
        filters={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="all">All Status</option>
            <option value="booked">Booked</option>
            <option value="sample_collected">Sample Collected</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        }
        actions={(b: any) => (
          <div className="flex flex-wrap gap-1 justify-end">
            {b.status === 'booked' && (
              <button onClick={() => updateStatus(b.id, 'sample_collected')} className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100">
                Collect Sample
              </button>
            )}
            {b.status === 'sample_collected' && (
              <button onClick={() => updateStatus(b.id, 'processing')} className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100">
                Processing
              </button>
            )}
            {b.status === 'processing' && (
              <button onClick={() => updateStatus(b.id, 'completed')} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">
                Complete
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
}
