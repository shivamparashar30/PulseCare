import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function Medicines() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('medicines')
      .select('*')
      .order('created_at', { ascending: false });
    setMedicines(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('medicines').update({ status }).eq('id', id);
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    if (selected?.id === id) setSelected(null);
  };

  const deleteMedicine = async (id: string) => {
    if (!confirm('Delete this medicine?')) return;
    await supabase.from('medicines').delete().eq('id', id);
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const filtered = medicines.filter(m => {
    const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.manufacturer?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'name', label: 'Medicine',
      render: (m: any) => (
        <div className="flex items-center gap-3">
          {m.image_url ? (
            <img src={m.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">Rx</div>
          )}
          <div>
            <p className="font-medium text-gray-900">{m.name}</p>
            <p className="text-xs text-gray-500">{m.manufacturer || '-'}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (m: any) => m.category || '-' },
    {
      key: 'price', label: 'Price',
      render: (m: any) => (
        <div>
          <span className="font-medium">₹{m.price}</span>
          {m.discount_percentage > 0 && (
            <span className="ml-1.5 text-xs text-emerald-600">-{m.discount_percentage}%</span>
          )}
        </div>
      ),
    },
    {
      key: 'requires_prescription', label: 'Rx',
      render: (m: any) => m.requires_prescription ? (
        <span className="text-xs text-red-600 font-medium">Required</span>
      ) : (
        <span className="text-xs text-gray-400">No</span>
      ),
    },
    { key: 'in_stock', label: 'Stock', render: (m: any) => m.in_stock ? <span className="text-emerald-600 text-xs font-medium">In Stock</span> : <span className="text-red-500 text-xs">Out</span> },
    { key: 'status', label: 'Status', render: (m: any) => <StatusBadge status={m.status || 'pending'} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve medicine uploads from stores</p>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or manufacturer..."
        filters={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        }
        actions={(m: any) => (
          <div className="flex items-center gap-1.5 justify-end">
            <button onClick={() => setSelected(m)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"><Eye size={15} /></button>
            {m.status !== 'approved' && <button onClick={() => updateStatus(m.id, 'approved')} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded" title="Approve"><CheckCircle size={15} /></button>}
            {m.status !== 'rejected' && <button onClick={() => updateStatus(m.id, 'rejected')} className="p-1.5 text-gray-400 hover:text-red-600 rounded" title="Reject"><XCircle size={15} /></button>}
            <button onClick={() => deleteMedicine(m.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded" title="Delete"><Trash2 size={15} /></button>
          </div>
        )}
      />

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Medicine Details</h2>
              <StatusBadge status={selected.status || 'pending'} />
            </div>
            {selected.image_url && <img src={selected.image_url} alt="" className="w-full h-40 object-cover rounded-lg" />}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{selected.name}</span></div>
              <div><span className="text-gray-500">Manufacturer:</span> <span className="font-medium">{selected.manufacturer || '-'}</span></div>
              <div><span className="text-gray-500">Category:</span> <span className="font-medium">{selected.category || '-'}</span></div>
              <div><span className="text-gray-500">Price:</span> <span className="font-medium">₹{selected.price}</span></div>
              <div><span className="text-gray-500">Discount:</span> <span className="font-medium">{selected.discount_percentage}%</span></div>
              <div><span className="text-gray-500">Prescription:</span> <span className="font-medium">{selected.requires_prescription ? 'Required' : 'No'}</span></div>
            </div>
            {selected.description && <p className="text-sm text-gray-600">{selected.description}</p>}
            <div className="flex justify-end gap-2 pt-2">
              {selected.status !== 'approved' && <button onClick={() => updateStatus(selected.id, 'approved')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Approve</button>}
              {selected.status !== 'rejected' && <button onClick={() => updateStatus(selected.id, 'rejected')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Reject</button>}
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
