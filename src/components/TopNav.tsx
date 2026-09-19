import React, { useState } from 'react';
import {
  Bot,
  Search,
  Bell,
  Upload,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { VaultBrandHeader, VaultLogoIcon } from './VaultLogo';
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext';
import { UserProfile, AppNotification } from '../types';

interface TopNavProps {
  user: UserProfile;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onOpenUpload: () => void;
  onNavigate: (view: string) => void;
  onToggleMobileMenu: () => void;
  onSignOut: () => void;
  onSearch?: (query: string) => void;
  onResetData: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  user,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenUpload,
  onNavigate,
  onToggleMobileMenu,
  onSignOut,
  onResetData,
}) => {
  const { t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-[#E5E0D8] backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      {/* Left Brand & Mobile Toggle */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-[#5A6065] hover:text-[#2F3437] rounded-lg hover:bg-[#F7F3EA]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => onNavigate('dashboard')}
          className="cursor-pointer group"
        >
          <VaultBrandHeader size="sm" subtitleText={t('header.system', 'Digital Identity System')} />
        </div>
      </div>

      {/* Center Semantic Vector Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A9095] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder={t('header.search_placeholder', "AI Search: 'Show Python certificates', 'Latest resume'...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-10 pr-16 py-2 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C] transition-colors shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 top-1.5 px-2 py-0.5 rounded-lg bg-[#0F4C4C]/10 hover:bg-[#0F4C4C]/20 text-[#0F4C4C] text-[10px] font-mono font-semibold border border-[#0F4C4C]/20 transition-colors"
          >
            Ask AI
          </button>
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Language Selector Dropdown */}
        <LanguageSelector />

        {/* Upload Button CTA */}
        <button
          onClick={onOpenUpload}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white font-semibold text-xs shadow-sm transition-all transform hover:-translate-y-0.5"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('header.upload_btn', 'Upload Document')}</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl bg-[#F7F3EA] hover:bg-[#E5E0D8] text-[#5A6065] hover:text-[#2F3437] relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6F8F72] ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E5E0D8] rounded-2xl shadow-xl py-3 z-50 text-[#2F3437]">
              <div className="px-4 pb-2 border-b border-[#E5E0D8] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#2F3437]">{t('header.notifications', 'Notifications')}</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#6F8F72]/20 text-[#577359] font-mono text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-[10px] text-[#0F4C4C] hover:text-[#145959] font-semibold hover:underline transition-colors"
                  >
                    {t('notif.mark_all_read', 'Mark all as read')}
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#E5E0D8]/60 text-xs">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-[#8A9095]">
                    {t('notif.no_notifs', 'No notifications')}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 transition-colors ${
                        !n.read ? 'bg-[#F7F3EA]/60 border-l-2 border-l-[#0F4C4C]' : 'hover:bg-[#F7F3EA]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5 truncate pr-2">
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0F4C4C] shrink-0" />
                          )}
                          <strong className={`truncate ${!n.read ? 'text-[#0F4C4C] font-bold' : 'text-[#2F3437] font-medium'}`}>
                            {n.title}
                          </strong>
                        </div>
                        <span className="text-[10px] text-[#8A9095] shrink-0">{n.timestamp}</span>
                      </div>

                      <p className="text-[#5A6065] text-[11px] leading-relaxed mb-2">{n.message}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-[#E5E0D8]/40">
                        <span className="text-[10px] font-mono text-[#8A9095]">
                          {n.read ? (
                            <span className="text-[#6F8F72] flex items-center space-x-1 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t('notif.read', 'Read')}</span>
                            </span>
                          ) : null}
                        </span>

                        {!n.read && (
                          <button
                            onClick={() => onMarkAsRead(n.id)}
                            className="text-[10px] text-[#0F4C4C] hover:text-[#145959] font-semibold flex items-center space-x-1 px-2 py-0.5 rounded bg-[#0F4C4C]/5 hover:bg-[#0F4C4C]/10 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#0F4C4C]" />
                            <span>{t('notif.mark_read', 'Mark as Read')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-[#F7F3EA] transition-colors border border-transparent hover:border-[#E5E0D8]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0F4C4C] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-[#0F4C4C]/20">
              {user.name ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
            </div>
            <span className="hidden xl:inline text-xs font-semibold text-[#2F3437] max-w-[120px] truncate">
              {user.name}
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E0D8] rounded-2xl shadow-xl py-2 z-50 text-[#2F3437] text-xs">
              <div className="px-4 py-2 border-b border-[#E5E0D8] mb-1">
                <strong className="block text-[#2F3437] font-semibold truncate">{user.name}</strong>
                <span className="text-[10px] text-[#8A9095] block truncate">{user.email}</span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#EAF0EC] text-[#577359] font-mono text-[9px] font-medium">
                  {user.targetRole}
                </span>
              </div>

              <button
                onClick={() => {
                  onNavigate('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-[#F7F3EA] flex items-center space-x-2 text-[#5A6065] hover:text-[#2F3437]"
              >
                <Settings className="w-3.5 h-3.5 text-[#0F4C4C]" />
                <span>{t('nav.settings', 'Vault Settings')}</span>
              </button>

              <button
                onClick={() => {
                  onResetData();
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-[#F7F3EA] flex items-center space-x-2 text-[#5A6065] hover:text-[#2F3437]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#6F8F72]" />
                <span>{t('header.reset_demo', 'Reset Demo Data')}</span>
              </button>

              <div className="border-t border-[#E5E0D8] mt-1 pt-1">
                <button
                  onClick={() => {
                    onSignOut();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center space-x-2 text-red-600"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('header.sign_out', 'Sign Out')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
