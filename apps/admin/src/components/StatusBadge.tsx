interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
  Upcoming: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  refunded: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  shipped: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  processing: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  confirmed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  booked: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  sample_collected: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
