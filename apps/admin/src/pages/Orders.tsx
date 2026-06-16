import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        patient:profiles!orders_patient_id_fkey(full_name, email),
        items:order_items(*, medicine:medicines(name, price))
      `)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.patient?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'id', label: 'Order ID', render: (o: any) => <span className="font-mono text-xs">{o.id?.slice(0, 8)}...</span> },
    {
      key: 'patient', label: 'Patient',
      render: (o: any) => (
        <div>
          <p className="font-medium text-gray-900">{o.patient?.full_name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{o.patient?.email}</p>
        </div>
      ),
    },
    { key: 'items_count', label: 'Items', render: (o: any) => o.items?.length || 0 },
    { key: 'total_amount', label: 'Total', render: (o: any) => <span className="font-medium">₹{o.total_amount}</span> },
    { key: 'payment_status', label: 'Payment', render: (o: any) => <StatusBadge status={o.payment_status} /> },
    { key: 'status', label: 'Status', render: (o: any) => <StatusBadge status={o.status} /> },
    { key: 'created_at', label: 'Date', render: (o: any) => new Date(o.created_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage medicine orders</p>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by patient name or order ID..."
        filters={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        }
        actions={(o: any) => (
          <div className="flex items-center gap-1.5 justify-end">
            <button onClick={() => setSelected(o)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"><Eye size={15} /></button>
          </div>
        )}
      />

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
              <StatusBadge status={selected.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Patient:</span> <span className="font-medium">{selected.patient?.full_name}</span></div>
              <div><span className="text-gray-500">Total:</span> <span className="font-medium">₹{selected.total_amount}</span></div>
              <div><span className="text-gray-500">Payment:</span> <StatusBadge status={selected.payment_status} /></div>
              <div><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date(selected.created_at).toLocaleString()}</span></div>
              {selected.delivery_address && <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{selected.delivery_address}</span></div>}
            </div>
            {selected.items?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Items</p>
                <div className="space-y-2">
                  {selected.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <span>{item.medicine?.name || 'Unknown'} x{item.quantity}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs text-gray-500 self-center mr-auto">Update status:</span>
              {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                <button key={s} onClick={() => { updateOrderStatus(selected.id, s); setSelected({ ...selected, status: s }); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${selected.status === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
