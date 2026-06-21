import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock, Check } from 'lucide-react';
import { sendForgotPasswordCode, resetPassword } from '@/api/auth';
import ParticleBackground from '@/components/ParticleBackground';
import HankoAvatar from '@/components/HankoAvatar';

type Step = 'email' | 'code' | 'reset' | 'success';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(60);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('邮箱格式不正确');
      return;
    }
    setLoading(true);
    try {
      await sendForgotPasswordCode({ email });
      setStep('code');
      startCountdown();
    } catch (err: any) {
      setError(err.message || '验证码发送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError('请输入验证码');
      return;
    }
    setStep('reset');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || !confirmPassword) {
      setError('请填写密码');
      return;
    }
    if (newPassword.length < 6) {
      setError('新密码长度不能少于 6 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, code, newPassword });
      setStep('success');
    } catch (err: any) {
      setError(err.message || '密码重置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setError(null);
    setLoading(true);
    try {
      await sendForgotPasswordCode({ email });
      startCountdown();
    } catch (err: any) {
      setError(err.message || '验证码发送失败');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-aiiro-light mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-aiiro-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white placeholder-aiiro-muted/50 focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all"
                  placeholder="请输入绑定的邮箱"
                  autoFocus
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-aiiro-accent hover:bg-aiiro-accent/90 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-neon-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>发送中...</span>
                </>
              ) : (
                <span>发送验证码</span>
              )}
            </button>
          </form>
        );

      case 'code':
        return (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-aiiro-light mb-2">
                验证码
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-3 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white placeholder-aiiro-muted/50 focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all text-center tracking-[0.5em] text-xl font-medium"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading || countdown > 0}
                  className="px-4 py-3 bg-aiiro-accent/10 text-aiiro-accent hover:bg-aiiro-accent/20 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? '...' : countdown > 0 ? `${countdown}s` : '重发'}
                </button>
              </div>
              <p className="text-xs text-aiiro-muted mt-2">
                验证码已发送至 {email}，有效期 10 分钟
              </p>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-aiiro-accent hover:bg-aiiro-accent/90 text-white font-medium rounded-xl transition-all duration-200 shadow-neon-sm"
            >
              验证并继续
            </button>
          </form>
        );

      case 'reset':
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-aiiro-light mb-2">
                新密码
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-aiiro-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white placeholder-aiiro-muted/50 focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all"
                  placeholder="请输入新密码（至少6位）"
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
            <div>
              <label className="block text-sm font-medium text-aiiro-light mb-2">
                确认新密码
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-aiiro-muted" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white placeholder-aiiro-muted/50 focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all"
                  placeholder="请再次输入新密码"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-aiiro-accent hover:bg-aiiro-accent/90 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-neon-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>重置中...</span>
                </>
              ) : (
                <span>确认重置</span>
              )}
            </button>
          </form>
        );

      case 'success':
        return (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Check size={32} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              密码重置成功
            </h3>
            <p className="text-aiiro-muted mb-8 text-sm">
              您的密码已成功重置，请使用新密码重新登录。
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 px-4 bg-aiiro-accent hover:bg-aiiro-accent/90 text-white font-medium rounded-xl transition-all duration-200 shadow-neon-sm"
            >
              去登录
            </button>
          </div>
        );
    }
  };

  const stepTitles: Record<Step, { title: string; subtitle: string }> = {
    email: { title: '找回密码', subtitle: '请输入您绑定的邮箱地址' },
    code: { title: '验证身份', subtitle: '输入邮箱收到的验证码' },
    reset: { title: '重置密码', subtitle: '设置一个新的密码' },
    success: { title: '操作完成', subtitle: '密码已成功重置' },
  };

  return (
    <div className="min-h-screen bg-aiiro-deep flex items-center justify-center px-4 relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none z-0" />

      <div className="w-full max-w-md relative z-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-aiiro-muted hover:text-aiiro-accent transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">返回登录</span>
        </Link>

        <div className="glass-card rounded-2xl p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <HankoAvatar size="lg" text="密" />
          </div>

          <h1
            className="text-3xl font-bold text-white text-center mb-2 font-serif-display"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {stepTitles[step].title}
          </h1>
          <p className="text-aiiro-muted text-center mb-8 text-sm">
            {stepTitles[step].subtitle}
          </p>

          {step !== 'success' && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {['email', 'code', 'reset'].map((s, idx) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      step === s
                        ? 'bg-aiiro-accent text-white'
                        : ['email', 'code', 'reset'].indexOf(step) > idx
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-aiiro-deep/50 text-aiiro-muted border border-aiiro-border'
                    }`}
                  >
                    {['email', 'code', 'reset'].indexOf(step) > idx ? (
                      <Check size={14} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {idx < 2 && (
                    <div
                      className={`w-12 h-0.5 rounded transition-all ${
                        ['email', 'code', 'reset'].indexOf(step) > idx
                          ? 'bg-emerald-500'
                          : 'bg-aiiro-border'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
