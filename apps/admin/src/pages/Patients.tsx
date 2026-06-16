import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DataTable from '../components/DataTable';

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'patient')
      .order('created_at', { ascending: false });
    setPatients(data || []);
    setLoading(false);
  };

  const filtered = patients.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'full_name', label: 'Patient',
      render: (p: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
            {p.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{p.full_name || 'Unnamed'}</p>
            <p className="text-xs text-gray-500">{p.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone', render: (p: any) => p.phone || '-' },
    { key: 'created_at', label: 'Joined', render: (p: any) => new Date(p.created_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-sm text-gray-500 mt-1">View all registered patients</p>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
      />
    </div>
  );
}
