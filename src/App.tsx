import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { DocumentsView } from './components/DocumentsView';
import { TimelineView } from './components/TimelineView';
import { SemanticSearchView } from './components/SemanticSearchView';
import { AiChatView } from './components/AiChatView';
import { CareerInsightsView } from './components/CareerInsightsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { UploadModal } from './components/UploadModal';
import { EvidenceVaultView } from './components/EvidenceVaultView';
import { ResumeBuilderView } from './components/ResumeBuilderView';
import { PortfolioBuilderView } from './components/PortfolioBuilderView';
import { ResetPasswordPage } from './components/ResetPasswordPage';

import {
  DocumentItem,
  UserProfile,
  TimelineEventItem,
  CareerInsightsData,
  AppNotification,
  CareerClaim,
  ClaimCategory,
  ClaimStatus,
  ResumeDocument,
  PortfolioDocument,
} from './types';

import {
  initialUserProfile,
  initialDocuments,
  initialTimelineEvents,
  initialCareerInsights,
  initialNotifications,
} from './data/mockData';

export default function App() {
  const [resetToken, setResetToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('resetToken');
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const isLoggedOut = localStorage.getItem('myai_vault_logged_out') === 'true';
    if (isLoggedOut) return false;
    const token = localStorage.getItem('myai_vault_token');
    return !!token;
  });

  const [unauthView, setUnauthView] = useState<'landing' | 'login'>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<UserProfile>(initialUserProfile);

  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventItem[]>(initialTimelineEvents);
  const [evidenceClaims, setEvidenceClaims] = useState<CareerClaim[]>([]);
  const [resumes, setResumes] = useState<ResumeDocument[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioDocument[]>([]);
  const [insights, setInsights] = useState<CareerInsightsData>(initialCareerInsights);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('myai_vault_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialNotifications;
      }
    }
    return initialNotifications;
  });

  useEffect(() => {
    localStorage.setItem('myai_vault_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Session token validation on startup
  useEffect(() => {
    const token = localStorage.getItem('myai_vault_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('myai_vault_token');
            setIsAuthenticated(false);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Handle browser back button navigation when logged out
  useEffect(() => {
    const handlePopState = () => {
      const isLoggedOut = localStorage.getItem('myai_vault_logged_out') === 'true';
      if (isLoggedOut || !isAuthenticated) {
        setIsAuthenticated(false);
        setUnauthView('login');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const handleAuthSuccess = (u: UserProfile) => {
    const cleanUser = { ...u, avatarUrl: '' };
    if (cleanUser.university === 'Stanford University') {
      cleanUser.university = '';
    }
    setUser(cleanUser);
    localStorage.removeItem('myai_vault_logged_out');
    localStorage.setItem('myai_vault_authenticated', 'true');
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleSignOut = () => {
    const token = localStorage.getItem('myai_vault_token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.setItem('myai_vault_logged_out', 'true');
    localStorage.removeItem('myai_vault_authenticated');
    localStorage.removeItem('myai_vault_session');
    localStorage.removeItem('myai_vault_token');
    
    setIsAuthenticated(false);
    setUser(initialUserProfile);
    setDocuments([]);
    setTimelineEvents([]);
    setEvidenceClaims([]);
    setResumes([]);
    setPortfolios([]);
    setUnauthView('login');
    
    // Prevent back navigation into authenticated views
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const purgeSampleDocs = (docs: DocumentItem[]): DocumentItem[] => {
    if (!Array.isArray(docs)) return [];
    return docs.filter((d) => {
      if (!d || !d.title) return false;
      const title = d.title.toLowerCase();
      const isSample =
        title.includes('deep learning') ||
        title.includes('banking risk') ||
        title.includes('goldman sachs') ||
        title.includes('alex_morgan') ||
        title.includes('aws certified') ||
        ['doc_01', 'doc_02', 'doc_03', 'doc_04', 'doc_05', 'doc_06', 'doc_07'].includes(d.id);
      return !isSample;
    });
  };

  // Load initial backend state for active user
  useEffect(() => {
    if (user?.email && isAuthenticated) {
      const savedDocs = localStorage.getItem(`myai_vault_docs_${user.email}`);
      if (savedDocs) {
        try {
          const parsed = JSON.parse(savedDocs);
          setDocuments(purgeSampleDocs(parsed));
        } catch (e) {
          setDocuments([]);
        }
      } else {
        setDocuments([]);
      }
      fetchDocuments(user.email);
      fetchTimeline(user.email);
      fetchEvidenceClaims(user.email);
      fetchResumes(user.email);
      fetchPortfolios(user.email);
      fetchInsights(user.email);
    }
  }, [user?.email, isAuthenticated]);

  useEffect(() => {
    if (user?.email && isAuthenticated) {
      const cleanDocs = purgeSampleDocs(documents);
      localStorage.setItem(`myai_vault_docs_${user.email}`, JSON.stringify(cleanDocs));
    }
  }, [documents, user?.email, isAuthenticated]);

  const fetchDocuments = async (email?: string) => {
    const reqEmail = email || user.email;
    try {
      const res = await fetch(`/api/documents?email=${encodeURIComponent(reqEmail)}`);
      const data = await res.json();
      if (data.documents && Array.isArray(data.documents)) {
        setDocuments(purgeSampleDocs(data.documents));
      }
    } catch (err) {
      console.warn('Backend documents fetch fallback');
    }
  };

  const fetchEvidenceClaims = async (email?: string) => {
    const reqEmail = email || user.email;
    try {
      const res = await fetch(`/api/evidence/claims?email=${encodeURIComponent(reqEmail)}`);
      const data = await res.json();
      if (data.claims && Array.isArray(data.claims)) {
        setEvidenceClaims(data.claims);
      }
    } catch (err) {
      console.warn('Backend evidence claims fetch fallback');
    }
  };

  const fetchResumes = async (email?: string) => {
    const reqEmail = email || user.email;
    try {
      const res = await fetch(`/api/resumes?email=${encodeURIComponent(reqEmail)}`);
      const data = await res.json();
      if (data.resumes && Array.isArray(data.resumes)) {
        setResumes(data.resumes);
      }
    } catch (err) {
      console.warn('Backend resumes fetch fallback');
    }
  };

  const fetchPortfolios = async (email?: string) => {
    const reqEmail = email || user.email;
    try {
      const res = await fetch(`/api/portfolios?email=${encodeURIComponent(reqEmail)}`);
      const data = await res.json();
      if (data.portfolios && Array.isArray(data.portfolios)) {
        setPortfolios(data.portfolios);
      }
    } catch (err) {
      console.warn('Backend portfolios fetch fallback');
    }
  };

  const handleGenerateResume = async (template: 'professional' | 'modern' = 'professional'): Promise<ResumeDocument | null> => {
    try {
      const res = await fetch('/api/resumes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, template }),
      });
      const data = await res.json();
      if (data.resume) {
        setResumes((prev) => [data.resume, ...prev.filter((r) => r.id !== data.resume.id)]);
        return data.resume;
      }
    } catch (err) {
      console.error('Error generating resume:', err);
    }
    return null;
  };

  const handleSaveResume = async (resume: ResumeDocument): Promise<void> => {
    try {
      await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, resume }),
      });
      setResumes((prev) => [resume, ...prev.filter((r) => r.id !== resume.id)]);
    } catch (err) {
      console.error('Error saving resume:', err);
    }
  };

  const handleDeleteResume = async (resumeId: string): Promise<void> => {
    try {
      await fetch(`/api/resumes/${resumeId}?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
      });
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (err) {
      console.error('Error deleting resume:', err);
    }
  };

  const handleGeneratePortfolio = async (template: 'clean' | 'showcase' = 'clean'): Promise<PortfolioDocument | null> => {
    try {
      const res = await fetch('/api/portfolios/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, template }),
      });
      const data = await res.json();
      if (data.portfolio) {
        setPortfolios((prev) => [data.portfolio, ...prev.filter((p) => p.id !== data.portfolio.id)]);
        return data.portfolio;
      }
    } catch (err) {
      console.error('Error generating portfolio:', err);
    }
    return null;
  };

  const handleSavePortfolio = async (portfolio: PortfolioDocument): Promise<void> => {
    try {
      await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, portfolio }),
      });
      setPortfolios((prev) => [portfolio, ...prev.filter((p) => p.id !== portfolio.id)]);
    } catch (err) {
      console.error('Error saving portfolio:', err);
    }
  };

  const handleDeletePortfolio = async (portfolioId: string): Promise<void> => {
    try {
      await fetch(`/api/portfolios/${portfolioId}?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
      });
      setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
    } catch (err) {
      console.error('Error deleting portfolio:', err);
    }
  };

  const handleUpdateClaimStatus = async (claimId: string, status: ClaimStatus, userVerified?: boolean) => {
    try {
      await fetch(`/api/evidence/claims/${claimId}?email=${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, userVerified }),
      });
    } catch (err) {
      console.warn('Update claim endpoint fallback');
    }
    setEvidenceClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status, userVerified: userVerified ?? c.userVerified } : c))
    );
  };

  const handleDeleteClaim = async (claimId: string) => {
    try {
      await fetch(`/api/evidence/claims/${claimId}?email=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Delete claim fallback');
    }
    setEvidenceClaims((prev) => prev.filter((c) => c.id !== claimId));
  };

  const handleAddClaim = async (claim: string, category: ClaimCategory) => {
    try {
      const res = await fetch('/api/evidence/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim, category, email: user.email }),
      });
      const data = await res.json();
      if (data.claim) {
        setEvidenceClaims((prev) => [data.claim, ...prev]);
      }
    } catch (err) {
      console.warn('Add claim endpoint fallback');
    }
  };

  const handleReprocessClaims = async () => {
    try {
      const res = await fetch('/api/evidence/reprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.claims) {
        setEvidenceClaims(data.claims);
      }
    } catch (err) {
      console.warn('Reprocess claims endpoint fallback');
    }
  };

  const fetchInsights = async (email?: string) => {
    const reqEmail = email || user.email;
    try {
      const res = await fetch(`/api/insights?email=${encodeURIComponent(reqEmail)}`);
      const data = await res.json();
      if (data.insights) {
        setInsights(data.insights);
      }
    } catch (err) {
      console.warn('Backend insights fetch fallback');
    }
  };

  const fetchTimeline = async (email?: string) => {
    const reqEmail = email || user.email;
    try {
      const res = await fetch(`/api/timeline?email=${encodeURIComponent(reqEmail)}`);
      const data = await res.json();
      if (data.timeline) setTimelineEvents(data.timeline);
    } catch (err) {
      console.warn('Backend timeline fetch fallback');
    }
  };

  const handleUploadSuccess = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
    fetchTimeline(user.email);
    fetchEvidenceClaims(user.email);
    fetchInsights(user.email);

    // Add notification
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now(),
      title: 'Document Uploaded & Indexed',
      message: `"${newDoc.title}" processed into ${newDoc.category} and mapped to ${newDoc.skills.length} skills.`,
      timestamp: 'Just now',
      type: 'upload',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await fetch(`/api/documents/${docId}?email=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Delete endpoint error');
    }
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    setTimelineEvents((prev) => prev.filter((t) => t.docId !== docId));
    fetchEvidenceClaims(user.email);
    fetchInsights(user.email);
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
    }
  };

  const handleRefreshInsights = async () => {
    try {
      const res = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.insights) {
        setInsights(data.insights);
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
    }
  };

  const handleResetData = async () => {
    try {
      await fetch('/api/reset-sample-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
    } catch (err) {
      console.warn('Reset endpoint error');
    }
    setDocuments([]);
    setTimelineEvents([]);
    setInsights(initialCareerInsights);
    setNotifications(initialNotifications);
    if (user?.email) {
      localStorage.removeItem(`myai_vault_docs_${user.email}`);
    }
    localStorage.removeItem('myai_vault_notifications');
  };

  // Password Reset URL flow
  if (resetToken) {
    return (
      <ResetPasswordPage
        resetToken={resetToken}
        onReturnToLogin={() => {
          setResetToken(null);
          window.history.replaceState(null, '', window.location.pathname);
          setUnauthView('login');
          setIsAuthenticated(false);
        }}
      />
    );
  }

  // Unauthenticated view flow (Landing Page or Full Login Page)
  if (!isAuthenticated) {
    if (unauthView === 'login') {
      return (
        <LoginPage
          onAuthSuccess={handleAuthSuccess}
          onBackToLanding={() => setUnauthView('landing')}
        />
      );
    }

    return (
      <div className="bg-[#F7F3EA] min-h-screen">
        <LandingPage
          onGetStarted={() => setUnauthView('login')}
          onLogin={() => setUnauthView('login')}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#2F3437] flex flex-col font-sans selection:bg-[#0F4C4C] selection:text-white">
      {/* Top Header */}
      <TopNav
        user={user}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onNavigate={(tab) => setActiveTab(tab)}
        onSearch={(q) => setSearchQuery(q)}
        onSignOut={handleSignOut}
        onResetData={handleResetData}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          user={user}
          docCount={documents.length}
          onNavigate={(tab) => setActiveTab(tab)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Center Main View Area */}
        <main className="flex-1 overflow-y-auto bg-[#F7F3EA] pb-12">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              user={user}
              documents={documents}
              insights={insights}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceVaultView
              claims={evidenceClaims}
              documents={documents}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
              onUpdateStatus={handleUpdateClaimStatus}
              onDeleteClaim={handleDeleteClaim}
              onAddClaim={handleAddClaim}
              onReprocess={handleReprocessClaims}
            />
          )}

          {activeTab === 'resume' && (
            <ResumeBuilderView
              user={user}
              documents={documents}
              claims={evidenceClaims}
              resumes={resumes}
              onNavigate={(tab) => setActiveTab(tab)}
              onGenerateResume={handleGenerateResume}
              onSaveResume={handleSaveResume}
              onDeleteResume={handleDeleteResume}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioBuilderView
              user={user}
              documents={documents}
              claims={evidenceClaims}
              portfolios={portfolios}
              onNavigate={(tab) => setActiveTab(tab)}
              onGeneratePortfolio={handleGeneratePortfolio}
              onSavePortfolio={handleSavePortfolio}
              onDeletePortfolio={handleDeletePortfolio}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineView
              events={timelineEvents}
              documents={documents}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
            />
          )}

          {activeTab === 'search' && (
            <SemanticSearchView
              documents={documents}
              initialQuery={searchQuery}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
            />
          )}

          {activeTab === 'chat' && (
            <AiChatView
              user={user}
              documents={documents}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
            />
          )}

          {activeTab === 'insights' && (
            <CareerInsightsView
              user={user}
              insights={insights}
              onRefreshInsights={handleRefreshInsights}
              evidenceClaims={evidenceClaims}
              documents={documents}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView documents={documents} />}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              documents={documents}
              onUpdateProfile={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <DocumentDetailModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDelete={handleDeleteDocument}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
