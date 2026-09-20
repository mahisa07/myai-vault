import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Clock,
  Bot,
  TrendingUp,
  BarChart3,
  Settings,
  ShieldCheck,
  FileCode,
  FolderGit2,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { UserProfile } from '../types';
import { CareerAssistantIcon } from './CareerAssistantIcon';

interface SidebarProps {
  activeTab: string;
  user: UserProfile;
  docCount: number;
  onNavigate: (tab: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  user,
  docCount,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard', 'Dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'documents', label: t('nav.documents', 'Documents Vault'), icon: <FileText className="w-4 h-4" />, badge: docCount },
    { id: 'evidence', label: t('nav.evidence', 'Evidence Vault'), icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'resume', label: t('nav.resume', 'Resume Builder'), icon: <FileCode className="w-4 h-4" /> },
    { id: 'portfolio', label: t('nav.portfolio', 'Portfolio Builder'), icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'timeline', label: t('nav.timeline', 'Digital Timeline'), icon: <Clock className="w-4 h-4" /> },
    { id: 'chat', label: t('nav.chat', 'AI Assistant'), icon: <CareerAssistantIcon className="w-4 h-4" />, highlight: true },
    { id: 'insights', label: t('nav.insights', 'Career Insights'), icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'analytics', label: t('nav.analytics', 'Analytics'), icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: t('nav.settings', 'Settings'), icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const displayName = user.name || (user.email ? user.email.split('@')[0] : 'User');
  const initials = displayName ? displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-[#E5E0D8] flex flex-col justify-between transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Top Label */}
          <div className="px-3 pt-2 text-xs text-[#8A9095] font-mono uppercase tracking-wider">
            <span>Navigation</span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0F4C4C] text-white shadow-sm'
                      : item.highlight
                      ? 'bg-[#EAF0EC] text-[#0F4C4C] hover:bg-[#6F8F72]/20 border border-[#6F8F72]/30'
                      : 'text-[#5A6065] hover:text-[#2F3437] hover:bg-[#F7F3EA]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-white' : 'text-[#0F4C4C]'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#EAF0EC] text-[#577359]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick AI Status Box */}
          <div className="p-3.5 rounded-2xl bg-[#F7F3EA] border border-[#E5E0D8] text-xs text-[#2F3437] space-y-2">
            <div className="flex items-center space-x-2 text-[#0F4C4C] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#6F8F72]" />
              <span>{t('nav.identity_active', 'Identity Vault Active')}</span>
            </div>
            <p className="text-[11px] text-[#5A6065] leading-relaxed">
              {t('nav.ai_indexing', 'Gemini AI is actively vectorizing and connecting your credentials.')}
            </p>
          </div>
        </div>

        {/* Bottom User Card */}
        <div className="p-4 border-t border-[#E5E0D8] bg-[#F7F3EA]/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F4C4C] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-[#0F4C4C]/20">
              {initials}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-[#2F3437] truncate">{displayName}</div>
              {user.university && user.university !== 'Stanford University' ? (
                <div className="text-[10px] text-[#6F8F72] font-mono font-semibold truncate">{user.university}</div>
              ) : null}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
