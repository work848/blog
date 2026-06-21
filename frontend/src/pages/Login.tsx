import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import ParticleBackground from '@/components/ParticleBackground';
import HankoAvatar from '@/components/HankoAvatar';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/admin');
    }
  }, [token, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
      navigate('/admin');
    } catch {
      // Error is handled in store
    }
  };

  return (
    <div className="min-h-screen bg-aiiro-deep flex items-center justify-center px-4 relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none z-0" />

      <div className="w-full max-w-md relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-aiiro-muted hover:text-aiiro-accent transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span
            className="font-serif-jp text-sm tracking-wider"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            表へ戻る
          </span>
        </Link>

        <div className="glass-card rounded-2xl p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <HankoAvatar size="lg" text="管" />
          </div>

          <h1
            className="text-3xl font-bold text-white text-center mb-2 font-serif-display"
            style={{ fontFamily: "'Playfair Display', 'Noto Serif JP', serif" }}
          >
            管理登錄
          </h1>
          <p
            className="text-aiiro-muted text-center mb-8 font-serif-jp text-sm"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            藍染管理システムへようこそ
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium text-aiiro-light mb-2 font-serif-jp"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                ユーザー名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white placeholder-aiiro-muted/50 focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all"
                placeholder="请输入用户名"
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-aiiro-light mb-2 font-serif-jp"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white placeholder-aiiro-muted/50 focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-aiiro-muted hover:text-aiiro-accent transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-aiiro-accent hover:bg-aiiro-accent/90 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-neon-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>ログイン中...</span>
                </>
              ) : (
                <span
                  className="font-serif-jp tracking-wider"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  ログイン
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-aiiro-border to-transparent mb-6" />
            <p className="text-xs text-aiiro-muted/60">
              Default: admin / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
