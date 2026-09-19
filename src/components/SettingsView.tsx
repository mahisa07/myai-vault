import React, { useState } from 'react';
import {
  Settings,
  User,
  ShieldCheck,
  Download,
  RefreshCw,
  Trash2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { UserProfile, DocumentItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface SettingsViewProps {
  user: UserProfile;
  documents: DocumentItem[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  documents,
  onUpdateProfile,
  onResetData,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [university, setUniversity] = useState(user.university);
  const [targetRole, setTargetRole] = useState(user.targetRole);
  const [bio, setBio] = useState(user.bio);
  const [saved, setSaved] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, email, university, targetRole, bio });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ user, documents, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MyAI_Vault_Export_${user.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-4xl mx-auto text-[#2F3437]">
      {/* Header */}
      <div className="border-b border-[#E5E0D8] pb-6">
        <h1 className="text-2xl font-bold text-[#2F3437] flex items-center space-x-3">
          <Settings className="w-6 h-6 text-[#0F4C4C]" />
          <span>{t('settings.title')}</span>
        </h1>
        <p className="text-xs text-[#5A6065] mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Profile Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-[#E5E0D8] space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
          <h2 className="text-base font-bold text-[#2F3437] flex items-center space-x-2">
            <User className="w-4 h-4 text-[#0F4C4C]" />
            <span>Digital Identity Profile</span>
          </h2>
          {saved && (
            <span className="text-xs text-[#6F8F72] font-mono flex items-center space-x-1 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved Successfully</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#5A6065] font-medium mb-1">{t('settings.full_name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl px-3.5 py-2 text-xs text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
            />
          </div>

          <div>
            <label className="block text-[#5A6065] font-medium mb-1">{t('settings.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl px-3.5 py-2 text-xs text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
            />
          </div>

          <div>
            <label className="block text-[#5A6065] font-medium mb-1">{t('settings.university')}</label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl px-3.5 py-2 text-xs text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
            />
          </div>

          <div>
            <label className="block text-[#5A6065] font-medium mb-1">{t('settings.target_role')}</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl px-3.5 py-2 text-xs text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[#5A6065] font-medium mb-1">Professional Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl p-3 text-xs text-[#2F3437] focus:outline-none focus:border-[#0F4C4C]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white font-semibold text-xs shadow-xs flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{t('settings.save_btn')}</span>
          </button>
        </div>
      </form>

      {/* AI Key & Security Status Box */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#2F3437] flex items-center space-x-2 border-b border-[#E5E0D8] pb-4">
          <Lock className="w-4 h-4 text-[#0F4C4C]" />
          <span>Security & AI Configuration</span>
        </h2>

        <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#2F3437] font-semibold">Gemini API Key Integration:</span>
            <span className="px-2.5 py-0.5 rounded bg-[#EAF0EC] text-[#577359] font-mono font-bold text-[10px]">
              Server-Side Active
            </span>
          </div>
          <p className="text-[#5A6065] text-[11px] leading-relaxed">
            Your Gemini API key is managed securely on the server via the AI Studio Secrets panel.
          </p>
        </div>
      </div>

      {/* Data Operations */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#2F3437] flex items-center space-x-2 border-b border-[#E5E0D8] pb-4">
          <Download className="w-4 h-4 text-[#0F4C4C]" />
          <span>Vault Data Backup & Management</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <strong className="text-[#2F3437] block font-semibold">{t('settings.export_title')}</strong>
            <p className="text-[#5A6065] text-[11px]">{t('settings.export_desc')}</p>
          </div>

          <button
            onClick={handleExportData}
            className="px-5 py-2.5 rounded-xl bg-[#F7F3EA] hover:bg-[#E5E0D8] text-[#2F3437] text-xs font-semibold flex items-center space-x-2 shrink-0 border border-[#E5E0D8] transition-colors"
          >
            <Download className="w-4 h-4 text-[#0F4C4C]" />
            <span>{t('settings.export_btn')}</span>
          </button>
        </div>

        <div className="border-t border-[#E5E0D8] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <strong className="text-[#2F3437] block font-semibold">{t('settings.reset_title')}</strong>
            <p className="text-[#5A6065] text-[11px]">{t('settings.reset_desc')}</p>
          </div>

          <button
            onClick={onResetData}
            className="px-5 py-2.5 rounded-xl bg-[#EAF0EC] hover:bg-[#6F8F72]/20 text-[#577359] text-xs font-semibold flex items-center space-x-2 shrink-0 border border-[#6F8F72]/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-[#6F8F72]" />
            <span>{t('settings.reset_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
