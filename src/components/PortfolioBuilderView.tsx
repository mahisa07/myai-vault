import React, { useState } from 'react';
import {
  FolderGit2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  Save,
  Trash2,
  ArrowRight,
  Eye,
  Edit3,
  FileText,
  Globe,
  Mail,
  Github,
  Linkedin,
  X,
} from 'lucide-react';
import { CareerClaim, DocumentItem, PortfolioDocument, PortfolioProject, UserProfile } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface PortfolioBuilderViewProps {
  user: UserProfile;
  documents: DocumentItem[];
  claims: CareerClaim[];
  portfolios: PortfolioDocument[];
  onNavigate: (tab: string) => void;
  onGeneratePortfolio: (template?: 'clean' | 'showcase') => Promise<PortfolioDocument | null>;
  onSavePortfolio: (portfolio: PortfolioDocument) => Promise<void>;
  onDeletePortfolio: (portfolioId: string) => Promise<void>;
  onSelectDocument: (doc: DocumentItem) => void;
}

export const PortfolioBuilderView: React.FC<PortfolioBuilderViewProps> = ({
  user,
  documents,
  claims,
  portfolios,
  onNavigate,
  onGeneratePortfolio,
  onSavePortfolio,
  onDeletePortfolio,
  onSelectDocument,
}) => {
  const { t } = useLanguage();
  const [activePortfolio, setActivePortfolio] = useState<PortfolioDocument | null>(() => portfolios[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('preview');
  const [inspectEvidenceProject, setInspectEvidenceProject] = useState<PortfolioProject | null>(null);

  const handleGenerate = async (template: 'clean' | 'showcase' = 'clean') => {
    setIsGenerating(true);
    const newPort = await onGeneratePortfolio(template);
    if (newPort) {
      setActivePortfolio(newPort);
      setViewMode('preview');
    }
    setIsGenerating(false);
  };

  const handleSaveCurrent = async () => {
    if (activePortfolio) {
      await onSavePortfolio(activePortfolio);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto text-[#2F3437]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#2F3437] flex items-center space-x-3">
            <FolderGit2 className="w-7 h-7 text-[#0F4C4C]" />
            <span>AI Portfolio Builder</span>
          </h1>
          <p className="text-xs text-[#5A6065] mt-1">
            Turn your verified career evidence into a professional portfolio.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleGenerate(activePortfolio?.template || 'clean')}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-[#6F8F72] ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Portfolio...' : 'Generate Portfolio'}</span>
          </button>
        </div>
      </div>

      {/* Main Content OR Empty State */}
      {documents.length === 0 && claims.length === 0 && !activePortfolio ? (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E0D8] space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF0EC] text-[#0F4C4C] flex items-center justify-center mx-auto border border-[#6F8F72]/30 shadow-xs">
            <FolderGit2 className="w-8 h-8 text-[#0F4C4C]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-[#2F3437]">Build Your Career Profile First</h3>
            <p className="text-xs text-[#5A6065] leading-relaxed max-w-md mx-auto">
              Upload certificates, projects, internship documents, resumes, or other career documents to generate an evidence-backed portfolio.
            </p>
          </div>
          <button
            onClick={() => onNavigate('evidence')}
            className="px-6 py-2.5 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white font-bold text-xs shadow-md inline-flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <span>Go to Evidence Vault</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls & Toolbar */}
          {activePortfolio && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-xs">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#2F3437]">Layout:</span>
                <span className="px-2.5 py-1 rounded bg-[#0F4C4C]/10 text-[#0F4C4C] font-mono text-xs font-bold uppercase">
                  {activePortfolio.template}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="bg-[#F7F3EA] p-1 rounded-xl flex items-center space-x-1 border border-[#E5E0D8]">
                  <button
                    onClick={() => setViewMode('editor')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === 'editor' ? 'bg-white text-[#0F4C4C] shadow-xs' : 'text-[#5A6065]'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === 'preview' ? 'bg-white text-[#0F4C4C] shadow-xs' : 'text-[#5A6065]'
                    }`}
                  >
                    Preview
                  </button>
                </div>

                <button
                  onClick={handleSaveCurrent}
                  className="px-4 py-2 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Portfolio</span>
                </button>
              </div>
            </div>
          )}

          {/* Editor or Preview Container */}
          {activePortfolio ? (
            viewMode === 'editor' ? (
              /* Inline Editor */
              <div className="p-6 bg-white border border-[#E5E0D8] rounded-3xl space-y-4 text-xs shadow-xs">
                <h3 className="text-sm font-bold text-[#0F4C4C] uppercase font-mono tracking-wider border-b pb-2">
                  Edit Portfolio Info
                </h3>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#2F3437]">Hero Title / Role</label>
                  <input
                    type="text"
                    value={activePortfolio.content.hero.role}
                    onChange={(e) => {
                      setActivePortfolio({
                        ...activePortfolio,
                        content: {
                          ...activePortfolio.content,
                          hero: { ...activePortfolio.content.hero, role: e.target.value },
                        },
                      });
                    }}
                    className="w-full bg-[#F7F3EA] border p-2.5 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#2F3437]">About Section</label>
                  <textarea
                    rows={3}
                    value={activePortfolio.content.about}
                    onChange={(e) => {
                      setActivePortfolio({
                        ...activePortfolio,
                        content: { ...activePortfolio.content, about: e.target.value },
                      });
                    }}
                    className="w-full bg-[#F7F3EA] border p-2.5 rounded-xl"
                  />
                </div>
              </div>
            ) : (
              /* Live Portfolio Showcase Render */
              <div className="p-8 sm:p-12 bg-white border border-[#E5E0D8] rounded-3xl shadow-xl space-y-10 text-[#2F3437]">
                {/* Hero Banner */}
                <div className="p-8 rounded-3xl bg-[#F7F3EA] border border-[#E5E0D8] text-center space-y-3 relative overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-[#0F4C4C] text-white flex items-center justify-center text-xl font-extrabold mx-auto shadow-md">
                    {activePortfolio.content.hero.name.charAt(0)}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2F3437] tracking-tight">
                    {activePortfolio.content.hero.name}
                  </h1>
                  <p className="text-sm font-bold text-[#0F4C4C] font-mono">
                    {activePortfolio.content.hero.role}
                  </p>
                  <p className="text-xs text-[#5A6065] max-w-xl mx-auto leading-relaxed">
                    {activePortfolio.content.hero.bio}
                  </p>
                </div>

                {/* About Section */}
                <div className="space-y-2">
                  <h2 className="text-sm font-extrabold uppercase font-mono tracking-wider text-[#0F4C4C] border-b pb-2 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#6F8F72]" />
                    <span>Verified Career Overview</span>
                  </h2>
                  <p className="text-xs text-[#5A6065] leading-relaxed">{activePortfolio.content.about}</p>
                </div>

                {/* Evidence Skills Grid */}
                <div className="space-y-3">
                  <h2 className="text-sm font-extrabold uppercase font-mono tracking-wider text-[#0F4C4C] border-b pb-2">
                    Evidence-Backed Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {activePortfolio.content.skills.map((sk, idx) => (
                      <div
                        key={idx}
                        className="px-3.5 py-1.5 rounded-xl bg-[#EAF0EC] border border-[#6F8F72]/30 text-xs font-semibold text-[#0F4C4C] flex items-center space-x-1.5 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6F8F72]" />
                        <span>{sk.name}</span>
                        <span className="text-[10px] text-[#577359] font-mono">({sk.sourceCount} source)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured Projects with Evidence Interaction */}
                {activePortfolio.content.projects.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-sm font-extrabold uppercase font-mono tracking-wider text-[#0F4C4C] border-b pb-2">
                      Featured Projects & Milestones
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activePortfolio.content.projects.map((proj, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-3 flex flex-col justify-between shadow-xs"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-[#2F3437]">{proj.title}</h3>
                              <span className="text-[10px] bg-[#EAF0EC] text-[#577359] font-mono px-2 py-0.5 rounded font-semibold border border-[#6F8F72]/30">
                                Verified Project ✓
                              </span>
                            </div>
                            <p className="text-xs text-[#5A6065] leading-relaxed">{proj.description}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {proj.technologies.map((tech, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 rounded bg-white border text-[10px] font-mono text-[#0F4C4C]"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* View Evidence Connection Button */}
                          <div className="pt-2 border-t border-[#E5E0D8]">
                            <button
                              onClick={() => setInspectEvidenceProject(proj)}
                              className="w-full px-3 py-1.5 rounded-xl bg-white hover:bg-[#EAF0EC] border border-[#E5E0D8] text-xs font-semibold text-[#0F4C4C] flex items-center justify-center space-x-1.5 transition-colors"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#6F8F72]" />
                              <span>View Evidence →</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E0D8] text-xs text-[#8A9095]">
              Click <strong>"Generate Portfolio"</strong> to create a verified career portfolio showcase.
            </div>
          )}

          {/* Saved Portfolios List */}
          {portfolios.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold text-[#0F4C4C] uppercase font-mono tracking-wider">
                My Saved Portfolios ({portfolios.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {portfolios.map((port) => (
                  <div
                    key={port.id}
                    onClick={() => setActivePortfolio(port)}
                    className={`p-4 rounded-2xl bg-white border cursor-pointer space-y-1 transition-all ${
                      activePortfolio?.id === port.id ? 'border-[#0F4C4C] shadow-md' : 'border-[#E5E0D8] hover:border-[#6F8F72]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#2F3437] font-bold">{port.title}</strong>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePortfolio(port.id);
                        }}
                        className="text-[#8A9095] hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-[#8A9095] font-mono block">
                      Template: {port.template} • Updated: {port.updatedAt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Evidence Connection Modal */}
      {inspectEvidenceProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl w-full max-w-md p-6 text-[#2F3437] shadow-xl relative space-y-4">
            <button
              onClick={() => setInspectEvidenceProject(null)}
              className="absolute top-4 right-4 text-[#8A9095] hover:text-[#2F3437] p-2 rounded-lg bg-[#F7F3EA]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#0F4C4C]" />
              <h3 className="text-base font-bold text-[#2F3437]">Portfolio Project Evidence</h3>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-2 text-xs">
              <strong className="text-[#0F4C4C] block">{inspectEvidenceProject.title}</strong>
              <p className="text-[#5A6065] leading-relaxed">{inspectEvidenceProject.description}</p>
              <div className="pt-2 border-t border-[#E5E0D8] text-[11px] font-mono">
                <span className="text-[#8A9095] block mb-1">Source Document:</span>
                <span className="text-[#2F3437] font-semibold">{inspectEvidenceProject.evidenceDocTitle || inspectEvidenceProject.title}</span>
              </div>
              {inspectEvidenceProject.evidenceSnippet && (
                <div className="p-2.5 rounded-lg bg-white border border-[#E5E0D8] font-mono text-[10px] text-[#2F3437]">
                  "{inspectEvidenceProject.evidenceSnippet}"
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setInspectEvidenceProject(null)}
                className="px-4 py-2 rounded-xl bg-[#0F4C4C] text-white text-xs font-bold"
              >
                Close Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioBuilderView;
