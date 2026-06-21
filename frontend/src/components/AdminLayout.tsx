import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Tags,
  FolderOpen,
  Settings2,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import HankoAvatar from '@/components/HankoAvatar';

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
    { path: '/admin/settings', label: '设置', icon: Settings2 },
  ];

  return (
    <div className="min-h-screen bg-aiiro-deep flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-aiiro-surface/90 backdrop-blur-xl border-r border-aiiro-border/50 transition-all duration-300 flex flex-col shrink-0`}
      >
        <div className="p-4 border-b border-aiiro-border/50 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <HankoAvatar size="sm" text="管" />
              <div>
                <h1
                  className="text-lg font-bold text-white font-serif-display"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  管理
                </h1>
                <p className="text-[10px] text-aiiro-muted tracking-widest uppercase">
                  Admin Panel
                </p>
              </div>
            </div>
          ) : (
            <HankoAvatar size="sm" text="管" className="mx-auto" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-aiiro-muted hover:text-aiiro-accent transition-colors p-2 rounded-lg hover:bg-aiiro-accent/10 shrink-0"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
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
                      ? 'bg-aiiro-accent/15 text-aiiro-accent border border-aiiro-accent/30'
                      : 'text-aiiro-muted hover:text-aiiro-light hover:bg-aiiro-border/30'
                  }`
                }
              >
                <Icon size={18} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-aiiro-border/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-aiiro-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="text-sm">退出登录</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
