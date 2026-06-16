import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*, doctor_profile:doctor_profiles(*)')
      .eq('role', 'doctor')
      .order('created_at', { ascending: false });
    setDoctors(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('profiles').update({ status }).eq('id', id);
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = doctors.filter(d => {
    const matchSearch = d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'full_name', label: 'Doctor',
      render: (d: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs">
            {d.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{d.full_name || 'Unnamed'}</p>
            <p className="text-xs text-gray-500">{d.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'specialization', label: 'Specialization',
      render: (d: any) => d.doctor_profile?.[0]?.specialization || '-',
    },
    {
      key: 'experience', label: 'Experience',
      render: (d: any) => d.doctor_profile?.[0]?.experience_years ? `${d.doctor_profile[0].experience_years} yrs` : '-',
    },
    {
      key: 'fee', label: 'Fee',
      render: (d: any) => d.doctor_profile?.[0]?.consultation_fee ? `₹${d.doctor_profile[0].consultation_fee}` : '-',
    },
    {
      key: 'status', label: 'Status',
      render: (d: any) => <StatusBadge status={d.status || 'pending'} />,
    },
    {
      key: 'created_at', label: 'Joined',
      render: (d: any) => new Date(d.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        <p className="text-sm text-gray-500 mt-1">Manage doctor registrations and approvals</p>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        }
        actions={(d: any) => (
          <div className="flex items-center gap-1.5 justify-end">
            <button onClick={() => setSelected(d)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded" title="View">
              <Eye size={15} />
            </button>
            {d.status !== 'approved' && (
              <button onClick={() => updateStatus(d.id, 'approved')} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded" title="Approve">
                <CheckCircle size={15} />
              </button>
            )}
            {d.status !== 'rejected' && (
              <button onClick={() => updateStatus(d.id, 'rejected')} className="p-1.5 text-gray-400 hover:text-red-600 rounded" title="Reject">
                <XCircle size={15} />
              </button>
            )}
          </div>
        )}
      />

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Doctor Details</h2>
              <StatusBadge status={selected.status || 'pending'} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{selected.full_name}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selected.email}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selected.phone || '-'}</span></div>
              <div><span className="text-gray-500">Specialization:</span> <span className="font-medium">{selected.doctor_profile?.[0]?.specialization || '-'}</span></div>
              <div><span className="text-gray-500">Experience:</span> <span className="font-medium">{selected.doctor_profile?.[0]?.experience_years || 0} yrs</span></div>
              <div><span className="text-gray-500">Fee:</span> <span className="font-medium">₹{selected.doctor_profile?.[0]?.consultation_fee || 0}</span></div>
              <div><span className="text-gray-500">Hospital:</span> <span className="font-medium">{selected.doctor_profile?.[0]?.hospital || '-'}</span></div>
              <div><span className="text-gray-500">Location:</span> <span className="font-medium">{selected.doctor_profile?.[0]?.location || '-'}</span></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {selected.status !== 'approved' && (
                <button onClick={() => updateStatus(selected.id, 'approved')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                  Approve
                </button>
              )}
              {selected.status !== 'rejected' && (
                <button onClick={() => updateStatus(selected.id, 'rejected')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                  Reject
                </button>
              )}
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
