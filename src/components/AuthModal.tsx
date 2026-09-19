import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, CheckCircle, X } from 'lucide-react';
import { VaultLogoIcon } from './VaultLogo';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'signup' ? '/api/auth/register' : mode === 'forgot' ? '/api/auth/forgot-password' : '/api/auth/login';
      const body = mode === 'signup'
        ? { name, email, password }
        : mode === 'forgot'
        ? { email }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('myai_vault_token', data.token);
        }
        onAuthSuccess(data.user);
        onClose();
      } else {
        setError(data.error || data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E0D8] rounded-2xl w-full max-w-md p-6 sm:p-8 text-[#2F3437] shadow-xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A9095] hover:text-[#2F3437] p-2 rounded-lg bg-[#F7F3EA] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C4C] text-white flex items-center justify-center shadow-xs shrink-0">
            <VaultLogoIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2F3437]">
              {mode === 'login' ? 'Welcome to MyAI Vault' : mode === 'signup' ? 'Create Your AI Vault' : 'Reset Password'}
            </h2>
            <p className="text-xs text-[#5A6065]">Your Journey. Understood by AI.</p>
          </div>
        </div>

        {error && <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#5A6065] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8A9095] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#5A6065] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A9095] absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="alex.morgan@stanford.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-medium text-[#5A6065] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A9095] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white font-semibold text-sm shadow-xs transition-all mt-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Vault' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#5A6065] flex items-center justify-between">
          {mode === 'login' ? (
            <>
              <button onClick={() => setMode('forgot')} className="hover:text-[#0F4C4C]">
                Forgot Password?
              </button>
              <button onClick={() => setMode('signup')} className="text-[#0F4C4C] font-semibold hover:underline">
                Create an Account
              </button>
            </>
          ) : (
            <button onClick={() => setMode('login')} className="text-[#0F4C4C] font-semibold hover:underline mx-auto">
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
