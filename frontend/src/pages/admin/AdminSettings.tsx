import { useState, useRef } from 'react';
import {
  User,
  Lock,
  Mail,
  Type,
  Upload,
  Camera,
  Check,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFontSettings } from '@/hooks/useFontSettings';
import {
  uploadAvatar,
  updateUsername,
  updatePassword,
  sendBindEmailCode,
  bindEmail,
} from '@/api/user';

interface SectionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SectionCard({ icon: Icon, title, description, children }: SectionCardProps) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-xl bg-aiiro-accent/15 text-aiiro-accent shrink-0">
          <Icon size={22} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-aiiro-muted mt-1">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function AdminSettings() {
  const { user, updateUser, setAuth } = useAuthStore();
  const { fontSettings, updateSettings } = useFontSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [username, setUsername] = useState(user?.username || '');
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [email, setEmail] = useState(user?.email || '');
  const [emailCode, setEmailCode] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [emailLoading, setEmailLoading] = useState(false);
  const [bindLoading, setBindLoading] = useState(false);

  const [selectedFont, setSelectedFont] = useState(fontSettings.fontFamily);
  const [fontSize, setFontSize] = useState(fontSettings.fontSize);
  const [fontLoading, setFontLoading] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setErrorMsg(null);
    } else {
      setErrorMsg(msg);
      setSuccessMsg(null);
    }
    setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
    }, 3000);
  };

  const startCountdown = () => {
    setEmailCountdown(60);
    setEmailCodeSent(true);
    const timer = setInterval(() => {
      setEmailCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setEmailCodeSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      showToast('请上传图片文件', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过 5MB', 'error');
      return;
    }

    setAvatarUploading(true);
    try {
      const updatedUser = await uploadAvatar(file);
      updateUser(updatedUser);
      showToast('头像更新成功');
    } catch (error: any) {
      showToast(error.message || '头像上传失败', 'error');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      showToast('用户名不能为空', 'error');
      return;
    }
    if (username === user?.username) {
      showToast('用户名未修改', 'error');
      return;
    }
    setUsernameLoading(true);
    try {
      const response = await updateUsername({ username });
      if (response.token) {
        setAuth(response.token, response.user);
      } else {
        updateUser(response.user);
      }
      showToast('用户名更新成功');
    } catch (error: any) {
      showToast(error.message || '用户名更新失败', 'error');
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('请填写所有密码字段', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('新密码长度不能少于 6 位', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('两次输入的新密码不一致', 'error');
      return;
    }
    if (oldPassword === newPassword) {
      showToast('新密码不能与旧密码相同', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      await updatePassword({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('密码修改成功');
    } catch (error: any) {
      showToast(error.message || '密码修改失败', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendEmailCode = async () => {
    if (!email.trim()) {
      showToast('请输入邮箱地址', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('邮箱格式不正确', 'error');
      return;
    }
    setEmailLoading(true);
    try {
      await sendBindEmailCode({ email });
      startCountdown();
      showToast('验证码已发送，请查收');
    } catch (error: any) {
      showToast(error.message || '验证码发送失败', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleBindEmail = async () => {
    if (!email.trim()) {
      showToast('请输入邮箱地址', 'error');
      return;
    }
    if (!emailCode.trim()) {
      showToast('请输入验证码', 'error');
      return;
    }
    setBindLoading(true);
    try {
      const updatedUser = await bindEmail({ email, code: emailCode });
      updateUser(updatedUser);
      setEmailCode('');
      setEmailCodeSent(false);
      setEmailCountdown(0);
      showToast('邮箱绑定成功');
    } catch (error: any) {
      showToast(error.message || '邮箱绑定失败', 'error');
    } finally {
      setBindLoading(false);
    }
  };

  const handleUpdateFont = async () => {
    setFontLoading(true);
    try {
      await updateSettings({ fontFamily: selectedFont, fontSize });
      showToast('字体设置已保存');
    } catch (error: any) {
      showToast(error.message || '字体设置保存失败', 'error');
    } finally {
      setFontLoading(false);
    }
  };

  const fontOptions = [
    { value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', label: '系统默认 (System' },
    { value: '"Inter", "Noto Sans JP", system-ui, sans-serif', label: 'Inter (现代无衬线)' },
    { value: 'Georgia, "Noto Serif JP", serif', label: 'Georgia (衬线体)' },
    { value: '"Playfair Display", "Noto Serif JP", Georgia, serif', label: 'Playfair Display (优雅衬线)' },
    { value: '"Noto Serif SC", Georgia, serif', label: '思源宋体' },
    { value: '"JetBrains Mono", "Fira Code", monospace', label: '等宽字体' },
  ];

  const fontSizeOptions = ['14', '15', '16', '17', '18', '20'];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="mb-8">
      <h1
        className="text-3xl font-bold text-white mb-2 font-serif-display"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        设置
      </h1>
      <p className="text-aiiro-muted">管理您的账户和系统偏好设置</p>
    </div>

    {(successMsg || errorMsg) && (
      <div
        className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-3 ${
          successMsg
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}
      >
        {successMsg ? <Check size={18} /> : <AlertCircle size={18} />}
        <span className="text-sm">{successMsg || errorMsg}</span>
      </div>
    )}

      <SectionCard icon={User} title="个人头像" description="上传或更换您的头像">
      <div className="flex items-center gap-6">
        <div className="relative group">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="头像"
              className="w-20 h-20 rounded-xl object-cover border-2 border-aiiro-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-aiiro-surface flex items-center justify-center border border-aiiro-border">
              <User size={32} className="text-aiiro-muted" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute inset-0 bg-aiiro-deep/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white disabled:cursor-not-allowed"
          >
            {avatarUploading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Camera size={20} />
            )}
          </button>
        </div>
        <div className="flex-1">
          <p className="text-aiiro-light mb-2">
            {user?.username}
          </p>
          <p className="text-sm text-aiiro-muted mb-3">
            支持 JPG、PNG、GIF 格式，大小不超过 5MB
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-aiiro-accent/10 text-aiiro-accent hover:bg-aiiro-accent/20 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16} />
            <span>上传头像</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
      </div>
    </SectionCard>

    <SectionCard icon={Type} title="用户名" description="修改您的显示名称">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-aiiro-light mb-2">
            用户名
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white placeholder-aiiro-muted/50 focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all"
            placeholder="请输入新用户名"
          />
        </div>
        <button
          onClick={handleUpdateUsername}
          disabled={usernameLoading || username === user?.username}
          className="px-6 py-2.5 bg-aiiro-accent hover:bg-aiiro-accent/90 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {usernameLoading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
          <span>保存修改</span>
        </button>
      </div>
    </SectionCard>

    <SectionCard icon={Lock} title="修改密码" description="定期更改密码以保护账户安全">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-aiiro-light mb-2">
            当前密码
          </label>
          <div className="relative">
            <input
              type={showOldPassword ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white placeholder-aiiro-muted/50 focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all"
              placeholder="请输入当前密码"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-aiiro-muted hover:text-aiiro-accent transition-colors"
            >
              {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-aiiro-light mb-2">
            新密码
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white placeholder-aiiro-muted/50 focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all"
              placeholder="请输入新密码（至少6位）"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-aiiro-muted hover:text-aiiro-accent transition-colors"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-aiiro-light mb-2">
            确认新密码
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white placeholder-aiiro-muted/50 focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all"
            placeholder="请再次输入新密码"
          />
        </div>
        <button
          onClick={handleUpdatePassword}
          disabled={passwordLoading}
          className="px-6 py-2.5 bg-aiiro-accent hover:bg-aiiro-accent/90 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {passwordLoading ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
          <span>修改密码</span>
        </button>
      </div>
    </SectionCard>

    <SectionCard icon={Mail} title="关联邮箱" description="绑定邮箱用于找回密码和接收通知">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-aiiro-light mb-2">
        邮箱地址
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white placeholder-aiiro-muted/50 focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all"
            placeholder="请输入邮箱地址"
          />
          {user?.email && (
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
              <Check size={14} />
              当前已绑定：{user.email}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-aiiro-light mb-2">
            验证码
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              className="flex-1 px-4 py-3 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white placeholder-aiiro-muted/50 focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all"
              placeholder="请输入6位验证码"
              maxLength={6}
            />
            <button
              onClick={handleSendEmailCode}
              disabled={emailLoading || emailCodeSent}
              className="px-4 py-2.5 bg-aiiro-accent/10 text-aiiro-accent hover:bg-aiiro-accent/20 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[120px]"
            >
              {emailLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={14} />
                  发送中
                </span>
              ) : emailCodeSent ? (
                `${emailCountdown}s 后重发`
              ) : (
                '发送验证码'
              )}
            </button>
          </div>
        </div>
        <button
          onClick={handleBindEmail}
          disabled={bindLoading}
          className="px-6 py-2.5 bg-aiiro-accent hover:bg-aiiro-accent/90 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {bindLoading ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />}
          <span>绑定邮箱</span>
        </button>
      </div>
    </SectionCard>

    <SectionCard icon={Type} title="全局字体" description="自定义网站显示字体">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-aiiro-light mb-2">
            字体样式
          </label>
          <select
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            className="w-full px-4 py-3 bg-aiiro-deep/50 border border-aiiro-border rounded-xl text-white focus:outline-none focus:border-aiiro-accent focus:ring-1 focus:ring-aiiro-accent/30 transition-all appearance-none cursor-pointer"
            style={{ fontFamily: selectedFont }}
          >
            {fontOptions.map((font) => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-aiiro-light mb-2">
            字体大小：{fontSize}px
          </label>
          <div className="flex gap-2 flex-wrap">
            {fontSizeOptions.map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  fontSize === size
                    ? 'bg-aiiro-accent text-white'
                    : 'bg-aiiro-deep/50 text-aiiro-muted hover:text-white border border-aiiro-border hover:border-aiiro-accent/50'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>
        <div className="pt-2">
          <p className="text-sm text-aiiro-muted mb-3">预览效果：</p>
          <div
            className="p-4 bg-aiiro-deep/30 rounded-xl border border-aiiro-border"
            style={{ fontFamily: selectedFont, fontSize: `${fontSize}px` }}
          >
            <p className="text-white mb-2">这是一段示例文字，用于预览字体效果。</p>
            <p className="text-aiiro-muted">
              The quick brown fox jumps over the lazy dog. 1234567890
            </p>
          </div>
        </div>
        <button
          onClick={handleUpdateFont}
          disabled={fontLoading}
          className="px-6 py-2.5 bg-aiiro-accent hover:bg-aiiro-accent/90 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {fontLoading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
          <span>保存字体设置</span>
        </button>
      </div>
    </SectionCard>
    </div>
  );
}
