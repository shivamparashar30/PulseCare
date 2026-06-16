import { useState } from 'react';
import { Menu, LogOut, Bell } from 'lucide-react';
import Sidebar from './Sidebar';

interface LayoutProps {
  profile: { full_name: string; email: string; avatar_url: string | null };
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ profile, onLogout, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="h-8 w-px bg-gray-200" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-700 font-semibold text-xs">
                  {profile.full_name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{profile.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{profile.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
