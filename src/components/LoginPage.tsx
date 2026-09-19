import React, { useState } from 'react';
import {
  Bot,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Building2,
  ChevronLeft,
  KeyRound,
  Briefcase,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VaultBrandHeader, VaultLogoIcon } from './VaultLogo';
import { UserProfile } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface LoginPageProps {
  onAuthSuccess: (user: UserProfile) => void;
  onBackToLanding?: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onAuthSuccess,
  onBackToLanding,
  initialMode = 'login',
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('myai_vault_token', data.token);
        }
        onAuthSuccess(data.user);
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Server connection error. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          university,
          targetRole,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('myai_vault_token', data.token);
        }
        onAuthSuccess(data.user);
      } else {
        setError(data.error || 'Failed to create account.');
      }
    } catch (err) {
      setError('Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSuccessMsg(data.message || 'If an account exists for this email address, a password reset link has been sent.');
    } catch (err) {
      setSuccessMsg('If an account exists for this email address, a password reset link has been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#2F3437] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#0F4C4C] selection:text-white">
      {/* Background Lighting Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0F4C4C]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#6F8F72]/5 rounded-full blur-[160px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <VaultBrandHeader size="md" />

        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-2 text-xs font-semibold text-[#5A6065] hover:text-[#2F3437] px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E0D8] transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Landing Page</span>
          </button>
        )}
      </header>

      {/* Main Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white border border-[#E5E0D8] shadow-xl overflow-hidden">
          {/* Left Feature & Branding Side Panel (Desktop) */}
          <div className="lg:col-span-5 bg-[#F7F3EA] p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E5E0D8] relative overflow-hidden">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAF0EC] border border-[#6F8F72]/30 text-[#577359] text-[11px] font-medium mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#6F8F72]" />
                <span>AI Memory System for Students</span>
              </div>

              <h2 className="text-2xl font-extrabold text-[#2F3437] leading-tight mb-3">
                {t('landing.hero_title')}
              </h2>

              <p className="text-xs text-[#5A6065] leading-relaxed mb-6">
                {t('landing.hero_subtitle')}
              </p>

              <div className="space-y-3.5">
                {[
                  {
                    icon: <Award className="w-4 h-4 text-[#0F4C4C]" />,
                    title: 'Automated OCR & Skills Indexing',
                    desc: 'Gemini parses document text and tags skills automatically.',
                  },
                  {
                    icon: <Briefcase className="w-4 h-4 text-[#6F8F72]" />,
                    title: 'Digital Journey & Skill Mapping',
                    desc: 'Connect credentials to target company roles and capstones.',
                  },
                  {
                    icon: <ShieldCheck className="w-4 h-4 text-[#0F4C4C]" />,
                    title: 'ATS Resume Scoring & Insights',
                    desc: 'Real-time gap analysis and career learning roadmaps.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-[#E5E0D8] flex items-start space-x-3 shadow-sm"
                  >
                    <div className="p-2 rounded-lg bg-[#EAF0EC] shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#2F3437]">{item.title}</h4>
                      <p className="text-[11px] text-[#5A6065]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Login / Sign Up / Forgot Password Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
            {/* Mode Tabs Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E5E0D8]">
              <div className="flex space-x-2 bg-[#F7F3EA] p-1 rounded-xl border border-[#E5E0D8]">
                <button
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'login'
                      ? 'bg-[#0F4C4C] text-white shadow-sm'
                      : 'text-[#5A6065] hover:text-[#2F3437]'
                  }`}
                >
                  {t('landing.sign_in')}
                </button>
                <button
                  onClick={() => {
                    setMode('signup');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'signup'
                      ? 'bg-[#0F4C4C] text-white shadow-sm'
                      : 'text-[#5A6065] hover:text-[#2F3437]'
                  }`}
                >
                  {t('login.create_account')}
                </button>
              </div>

              {mode === 'login' && (
                <button
                  onClick={() => setMode('forgot')}
                  className="text-xs text-[#0F4C4C] hover:underline font-medium"
                >
                  {t('login.forgot_password')}
                </button>
              )}
            </div>

            {/* Error or Success Alert Banners */}
            {error && (
              <div className="p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 animate-shake">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 mb-6 rounded-xl bg-[#EAF0EC] border border-[#6F8F72]/40 text-[#577359] text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F8F72] shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Forms */}
            <AnimatePresence mode="wait">
              {mode === 'login' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-[#2F3437] mb-1.5">
                      Student / Professional Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8A9095] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#2F3437]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-[#0F4C4C] hover:underline font-medium"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8A9095] absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#8A9095] hover:text-[#2F3437]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2 text-xs text-[#5A6065] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#E5E0D8] text-[#0F4C4C] focus:ring-0"
                      />
                      <span>Keep me signed in</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#0F4C4C] hover:bg-[#0C3E3E] text-white font-semibold text-xs shadow-md transition-all mt-2 flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Authenticating Vault...' : 'Sign In to MyAI Vault'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              )}

              {mode === 'signup' && (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSignupSubmit}
                  className="space-y-3.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2F3437] mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#8A9095] absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          placeholder="Jane Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2F3437] mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8A9095] absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="user@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2F3437] mb-1">
                        University / Institution (Optional)
                      </label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-[#8A9095] absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="e.g. Stanford University"
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2F3437] mb-1">
                        Target Career Role (Optional)
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-[#8A9095] absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="e.g. AI / ML Engineer"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2F3437] mb-1">
                        Set Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8A9095] absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-9 pr-10 py-2 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-[#8A9095] hover:text-[#2F3437]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2F3437] mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8A9095] absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-9 pr-4 py-2 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#0F4C4C] hover:bg-[#0C3E3E] text-white font-semibold text-xs shadow-md transition-all mt-2 flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Creating Vault Account...' : 'Create AI Vault Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              )}

              {mode === 'forgot' && (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleForgotSubmit}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-[#EAF0EC] border border-[#6F8F72]/30 flex items-start space-x-3 mb-2">
                    <KeyRound className="w-5 h-5 text-[#0F4C4C] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#2F3437]">Reset Vault Password</h4>
                      <p className="text-[11px] text-[#5A6065] leading-relaxed">
                        Enter your registered email address and we'll send you an encrypted recovery link to restore access to your MyAI Vault.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2F3437] mb-1.5">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8A9095] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-[#5A6065] hover:text-[#2F3437]"
                    >
                      ← Back to Sign In
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-[#0F4C4C] hover:bg-[#0C3E3E] text-white font-semibold text-xs shadow-md"
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer Notice */}
            <div className="mt-8 pt-4 border-t border-[#E5E0D8] text-center text-[10px] text-[#8A9095]">
              Protected by AES-256 Vault Encryption & Gemini AI Guardrails.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-[#8A9095]">
        © {new Date().getFullYear()} MyAI Vault Digital Identity Engine. All rights reserved.
      </footer>
    </div>
  );
};
