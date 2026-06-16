import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Stethoscope, Store, FlaskConical, Users,
  Pill, ShoppingCart, CalendarCheck, TestTube2, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/medical-stores', icon: Store, label: 'Medical Stores' },
  { to: '/diagnostic-centers', icon: FlaskConical, label: 'Diagnostic Centers' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/medicines', icon: Pill, label: 'Medicines' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/appointments', icon: CalendarCheck, label: 'Appointments' },
  { to: '/lab-bookings', icon: TestTube2, label: 'Lab Bookings' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-gray-900">PulseCare</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
