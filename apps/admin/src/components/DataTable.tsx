import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  actions?: (item: T) => React.ReactNode;
  filters?: React.ReactNode;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  page = 1,
  totalPages = 1,
  onPageChange,
  actions,
  filters,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      {(onSearchChange || filters) && (
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          {onSearchChange && (
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}
          {filters}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-sm text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
