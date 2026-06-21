import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Home, BookOpen, Tag, Info, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface VerticalSidebarProps {
  categories?: Category[];
}

export default function VerticalSidebar({ categories = [] }: VerticalSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { label: '首页', path: '/', icon: Home },
    { label: '文章', path: '/#articles', icon: BookOpen },
    { label: '标签', path: '/#tags', icon: Tag },
    { label: '关于', path: '/#about', icon: Info },
  ];

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-4 right-4 z-50 p-3 rounded-xl glass-card text-aiiro-light hover:text-aiiro-accent transition-colors"
          aria-label="菜单"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {mobileOpen && (
          <div
            className="fixed inset-0 bg-aiiro-deep/80 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <nav
          className={cn(
            'fixed top-0 right-0 h-full w-72 bg-aiiro-surface/95 backdrop-blur-xl z-40 transition-transform duration-300 ease-out border-l border-aiiro-border',
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="h-full flex flex-col px-6 py-20">
            <div className="mb-10">
              <h2
                className="font-serif-display text-2xl text-white mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                蓝染
              </h2>
              <p className="text-xs text-aiiro-muted tracking-widest">AIIRO BLOG</p>
            </div>

            <div className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg text-aiiro-muted hover:text-aiiro-accent hover:bg-aiiro-accent/10 transition-all"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {categories.length > 0 && (
              <div className="mb-8">
                <p className="text-xs text-aiiro-muted tracking-widest mb-4 px-4">
                  分类
                </p>
                <div className="space-y-1">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/?category=${cat.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-4 py-2 rounded-lg text-sm text-aiiro-muted hover:text-aiiro-accent hover:bg-aiiro-accent/5 transition-all"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-aiiro-muted/60 tabular-nums">
                        {cat.articleCount}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-aiiro-border/50">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-aiiro-muted hover:text-aiiro-accent transition-all"
              >
                <Settings size={18} />
                <span>管理后台</span>
              </Link>
            </div>
          </div>
        </nav>
      </>
    );
  }

  return (
    <aside className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
      <nav className="flex flex-col items-center gap-8 py-6">
        <div className="flex flex-col items-center gap-2 mb-4">
          <span
            className="writing-vertical font-serif-jp text-white text-xl tracking-widest"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            藍染
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-aiiro-accent/50 to-transparent mt-2" />
        </div>

        <div className="flex flex-col items-center gap-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group flex flex-col items-center gap-1.5 text-aiiro-muted hover:text-aiiro-accent transition-all duration-300"
                title={item.label}
              >
                <div className="p-2 rounded-lg group-hover:bg-aiiro-accent/10 transition-colors">
                  <Icon size={18} />
                </div>
                <span
                  className="writing-vertical text-xs tracking-wider group-hover:translate-y-1 transition-transform"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="w-px h-8 bg-gradient-to-b from-aiiro-border to-transparent my-2" />

        <div className="flex flex-col items-center gap-3">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              to={`/?category=${cat.id}`}
              className="group writing-vertical text-xs text-aiiro-muted hover:text-aiiro-accent transition-colors duration-300 py-1"
              title={`${cat.name} (${cat.articleCount})`}
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="w-px h-8 bg-gradient-to-b from-aiiro-border to-transparent my-2" />

        <Link
          to="/login"
          className="group flex flex-col items-center gap-1.5 text-aiiro-muted hover:text-aiiro-accent transition-all duration-300"
          title="管理后台"
        >
          <div className="p-2 rounded-lg group-hover:bg-aiiro-accent/10 transition-colors">
            <Settings size={16} />
          </div>
          <span
            className="writing-vertical text-xs tracking-wider"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            管理
          </span>
        </Link>
      </nav>
    </aside>
  );
}
