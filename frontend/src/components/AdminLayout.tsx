import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Tags,
  FolderOpen,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: '概览', icon: LayoutDashboard },
    { path: '/admin/articles', label: '文章管理', icon: FileText },
    { path: '/admin/categories', label: '分类标签', icon: Tags },
    { path: '/admin/drafts', label: '草稿箱', icon: FolderOpen },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-[#121212] border-r border-white/10 transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              管理后台
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#ff6b35]/20 text-[#ff6b35]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
