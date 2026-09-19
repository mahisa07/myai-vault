import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { VaultBrandHeader } from './VaultLogo';

interface ResetPasswordPageProps {
  resetToken: string;
  onReturnToLogin: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ resetToken, onReturnToLogin }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to reset password. The link may be invalid or expired.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#2F3437] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#0F4C4C] selection:text-white">
      {/* Background Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0F4C4C]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#6F8F72]/5 rounded-full blur-[160px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <VaultBrandHeader size="md" />
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="max-w-md w-full rounded-3xl bg-white border border-[#E5E0D8] shadow-xl p-8 text-[#2F3437]">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF0EC] text-[#6F8F72] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7 text-[#6F8F72]" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#2F3437]">Password Reset Successful</h2>
              <p className="text-xs text-[#5A6065] leading-relaxed">
                Your password has been reset successfully. You can now log in to your MyAI Vault using your new password.
              </p>
              <button
                onClick={onReturnToLogin}
                className="w-full py-3 rounded-xl bg-[#0F4C4C] hover:bg-[#0C3E3E] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>Return to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#0F4C4C] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#2F3437]">Reset Password</h2>
                <p className="text-xs text-[#5A6065] mt-1">Please enter your new password below.</p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#2F3437] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A9095] absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
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
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A9095] absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0F4C4C] hover:bg-[#0C3E3E] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center space-x-2 mt-2"
              >
                <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-[#8A9095]">
        © {new Date().getFullYear()} MyAI Vault. All rights reserved.
      </footer>
    </div>
  );
};
