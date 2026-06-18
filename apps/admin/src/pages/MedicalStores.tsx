import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function MedicalStores() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*, store:medical_stores(*)')
      .eq('role', 'medical_store')
      .order('created_at', { ascending: false });
    setStores(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    const update: any = { status };
    if (reason) update.rejection_reason = reason;
    await supabase.from('profiles').update(update).eq('id', id);
    setStores(prev => prev.map(s => s.id === id ? { ...s, status, rejection_reason: reason } : s));
    if (selected?.id === id) setSelected({ ...selected, status, rejection_reason: reason });
    setRejectId(null);
    setRejectReason('');
  };

  const st = (s: any) => Array.isArray(s.store) ? s.store[0] : s.store;

  const filtered = stores.filter(s => {
    const name = st(s)?.store_name || s.full_name || '';
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'store_name', label: 'Store',
      render: (s: any) => (
        <div className="flex items-center gap-3">
          {st(s)?.shop_photo_url ? (
            <img src={st(s).shop_photo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-xs">
              {(st(s)?.store_name || s.full_name || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{st(s)?.store_name || s.full_name || 'Unnamed'}</p>
            <p className="text-xs text-gray-500">{s.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'license', label: 'License No.', render: (s: any) => st(s)?.license_number || '-' },
    { key: 'phone', label: 'Phone', render: (s: any) => st(s)?.phone || s.phone || '-' },
    { key: 'status', label: 'Status', render: (s: any) => <StatusBadge status={s.status || 'pending'} /> },
    { key: 'created_at', label: 'Joined', render: (s: any) => new Date(s.created_at).toLocaleDateString() },
  ];

  const DocCard = ({ url, label }: { url?: string; label: string }) => (
    url ? (
      <a href={url} target="_blank" rel="noreferrer" className="block group">
        <div className="rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-300 transition-colors">
          <img src={url} alt={label} className="w-full h-32 object-cover bg-gray-100" />
          <div className="flex items-center justify-between px-3 py-2 bg-white">
            <span className="text-xs font-medium text-gray-700">{label}</span>
            <ExternalLink size={12} className="text-indigo-500" />
          </div>
        </div>
      </a>
    ) : (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center h-44">
        <FileText size={20} className="text-gray-300 mb-1" />
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-[10px] text-gray-300 mt-0.5">Not uploaded</span>
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medical Stores</h1>
        <p className="text-sm text-gray-500 mt-1">Manage pharmacy registrations and approvals</p>
      </div>

      <DataTable
        columns={columns} data={filtered} loading={loading}
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by store name or email..."
        filters={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        }
        actions={(s: any) => (
          <div className="flex items-center gap-1.5 justify-end">
            <button onClick={() => setSelected(s)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"><Eye size={15} /></button>
            {s.status !== 'approved' && <button onClick={() => updateStatus(s.id, 'approved')} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded"><CheckCircle size={15} /></button>}
            {s.status !== 'rejected' && <button onClick={() => setRejectId(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><XCircle size={15} /></button>}
          </div>
        )}
      />

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Store Details</h2>
              <StatusBadge status={selected.status || 'pending'} />
            </div>

            {st(selected)?.shop_photo_url && (
              <img src={st(selected).shop_photo_url} alt="Shop" className="w-full h-40 object-cover rounded-xl" />
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Store Name:</span> <span className="font-medium">{st(selected)?.store_name || '-'}</span></div>
              <div><span className="text-gray-500">Owner:</span> <span className="font-medium">{selected.full_name}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selected.email}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{st(selected)?.phone || selected.phone || '-'}</span></div>
              <div><span className="text-gray-500">Address:</span> <span className="font-medium">{st(selected)?.address || '-'}</span></div>
              <div><span className="text-gray-500">License No:</span> <span className="font-medium">{st(selected)?.license_number || '-'}</span></div>
              <div><span className="text-gray-500">Rating:</span> <span className="font-medium">{st(selected)?.rating || 0}</span></div>
              <div><span className="text-gray-500">Delivery:</span> <span className="font-medium">{st(selected)?.delivery_available ? 'Yes' : 'No'}</span></div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Verification Documents</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <DocCard url={st(selected)?.government_id_url} label="Government ID" />
                <DocCard url={st(selected)?.shop_photo_url} label="Shop Photo" />
                <DocCard url={st(selected)?.license_certificate_url} label="License Certificate" />
              </div>
            </div>

            {selected.rejection_reason && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-700">Rejection Reason:</p>
                <p className="text-sm text-red-600">{selected.rejection_reason}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              {selected.status !== 'approved' && <button onClick={() => updateStatus(selected.id, 'approved')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Approve</button>}
              {selected.status !== 'rejected' && <button onClick={() => setRejectId(selected.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Reject</button>}
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setRejectId(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Reject Registration</h3>
            <p className="text-sm text-gray-500">Provide a reason for rejection:</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Invalid pharmacy license, unclear shop photos..." className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none" rows={3} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectId(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
              <button onClick={() => updateStatus(rejectId, 'rejected', rejectReason)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
