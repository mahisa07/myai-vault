import React, { useState } from 'react';
import {
  FileCode,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  Copy,
  Trash2,
  Edit3,
  Eye,
  Plus,
  ArrowRight,
  RefreshCw,
  Save,
  ChevronRight,
  FileText,
  User,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
} from 'lucide-react';
import { CareerClaim, DocumentItem, ResumeDocument, ResumeContent, UserProfile } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ResumeBuilderViewProps {
  user: UserProfile;
  documents: DocumentItem[];
  claims: CareerClaim[];
  resumes: ResumeDocument[];
  onNavigate: (tab: string) => void;
  onGenerateResume: (template?: 'professional' | 'modern') => Promise<ResumeDocument | null>;
  onSaveResume: (resume: ResumeDocument) => Promise<void>;
  onDeleteResume: (resumeId: string) => Promise<void>;
}

export const ResumeBuilderView: React.FC<ResumeBuilderViewProps> = ({
  user,
  documents,
  claims,
  resumes,
  onNavigate,
  onGenerateResume,
  onSaveResume,
  onDeleteResume,
}) => {
  const { t } = useLanguage();
  const [activeResume, setActiveResume] = useState<ResumeDocument | null>(() => resumes[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('preview');

  const verifiedClaims = claims.filter((c) => c.status === 'VERIFIED');
  const reviewClaims = claims.filter((c) => c.status === 'NEEDS_REVIEW');
  const unsupportedClaims = claims.filter((c) => c.status === 'UNSUPPORTED');

  const handleGenerate = async (template: 'professional' | 'modern' = 'professional') => {
    setIsGenerating(true);
    const newRes = await onGenerateResume(template);
    if (newRes) {
      setActiveResume(newRes);
      setViewMode('preview');
    }
    setIsGenerating(false);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleSaveCurrent = async () => {
    if (activeResume) {
      await onSaveResume(activeResume);
    }
  };

  const updateContentField = (field: keyof ResumeContent, value: any) => {
    if (!activeResume) return;
    setActiveResume({
      ...activeResume,
      content: {
        ...activeResume.content,
        [field]: value,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto text-[#2F3437]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#2F3437] flex items-center space-x-3">
            <FileCode className="w-7 h-7 text-[#0F4C4C]" />
            <span>AI Resume Builder</span>
          </h1>
          <p className="text-xs text-[#5A6065] mt-1">
            Create an evidence-backed resume from your verified career information.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleGenerate(activeResume?.template || 'professional')}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-[#6F8F72] ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Resume...' : 'Generate Resume'}</span>
          </button>
        </div>
      </div>

      {/* Concept Explanation Banner */}
      <div className="p-4 rounded-2xl bg-[#EAF0EC] border border-[#6F8F72]/30 flex items-start space-x-3 text-xs text-[#2F3437]">
        <ShieldCheck className="w-5 h-5 text-[#0F4C4C] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#0F4C4C] block mb-0.5">Evidence-Grounded Resume Pipeline</strong>
          MyAI Vault uses information from your Evidence Vault to create your resume while helping you avoid unsupported career claims.
        </div>
      </div>

      {/* Main Container OR Empty State */}
      {documents.length === 0 && claims.length === 0 && !activeResume ? (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E0D8] space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF0EC] text-[#0F4C4C] flex items-center justify-center mx-auto border border-[#6F8F72]/30 shadow-xs">
            <FileCode className="w-8 h-8 text-[#0F4C4C]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-[#2F3437]">Build Your Career Profile First</h3>
            <p className="text-xs text-[#5A6065] leading-relaxed max-w-md mx-auto">
              Upload certificates, projects, internship documents, resumes, or other career documents to generate an evidence-backed resume.
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
          {/* Resume Evidence Review Bar */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#0F4C4C] uppercase font-mono tracking-wider flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#6F8F72]" />
                <span>Resume Evidence Review</span>
              </h3>
              <span className="text-[10px] text-[#5A6065] font-mono">
                Verified: {verifiedClaims.length} • Needs Review: {reviewClaims.length} • Unsupported: {unsupportedClaims.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {claims.slice(0, 8).map((c, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 text-xs font-semibold ${
                    c.status === 'VERIFIED'
                      ? 'bg-[#EAF0EC] border-[#6F8F72]/40 text-[#0F4C4C]'
                      : c.status === 'NEEDS_REVIEW'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-slate-100 border-slate-300 text-slate-600'
                  }`}
                >
                  <span>{c.claim}</span>
                  {c.status === 'VERIFIED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6F8F72]" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Toolbar & Mode Switcher */}
          {activeResume && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-xs">
              {/* Template Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#2F3437]">Template:</span>
                <button
                  onClick={() => updateContentField('template' as any, 'professional')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeResume.template === 'professional'
                      ? 'bg-[#0F4C4C] text-white shadow-xs'
                      : 'bg-[#F7F3EA] text-[#5A6065] hover:text-[#2F3437]'
                  }`}
                >
                  Professional (ATS)
                </button>
                <button
                  onClick={() => updateContentField('template' as any, 'modern')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeResume.template === 'modern'
                      ? 'bg-[#0F4C4C] text-white shadow-xs'
                      : 'bg-[#F7F3EA] text-[#5A6065] hover:text-[#2F3437]'
                  }`}
                >
                  Modern
                </button>
              </div>

              {/* View Mode & Action Buttons */}
              <div className="flex items-center space-x-2">
                <div className="bg-[#F7F3EA] p-1 rounded-xl flex items-center space-x-1 border border-[#E5E0D8]">
                  <button
                    onClick={() => setViewMode('editor')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === 'editor' ? 'bg-white text-[#0F4C4C] shadow-xs' : 'text-[#5A6065]'
                    }`}
                  >
                    Edit Resume
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
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F7F3EA] border border-[#E5E0D8] text-xs font-semibold text-[#0F4C4C] flex items-center space-x-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>

                <button
                  onClick={handlePrintPDF}
                  className="px-4 py-2 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download / Print</span>
                </button>
              </div>
            </div>
          )}

          {/* Editor or Preview View */}
          {activeResume ? (
            viewMode === 'editor' ? (
              /* Inline Resume Editor Form */
              <div className="p-6 bg-white border border-[#E5E0D8] rounded-3xl space-y-6 shadow-xs text-xs">
                <h3 className="text-sm font-bold text-[#0F4C4C] uppercase font-mono tracking-wider border-b pb-2">
                  Edit Resume Content
                </h3>

                {/* Professional Summary */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#2F3437]">Professional Summary</label>
                  <textarea
                    rows={3}
                    value={activeResume.content.summary}
                    onChange={(e) => updateContentField('summary', e.target.value)}
                    className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl p-3 text-xs focus:outline-none focus:border-[#0F4C4C]"
                  />
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <label className="font-bold text-[#2F3437]">Evidence-Backed Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {activeResume.content.skills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] font-medium flex items-center space-x-1.5"
                      >
                        <span>{sk.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6F8F72]" />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-3">
                  <label className="font-bold text-[#2F3437] block">Experience / Internships</label>
                  {activeResume.content.experience.map((exp, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const updated = [...activeResume.content.experience];
                            updated[idx].title = e.target.value;
                            updateContentField('experience', updated);
                          }}
                          className="bg-white border p-2 rounded-lg"
                        />
                        <input
                          type="text"
                          value={exp.organization}
                          onChange={(e) => {
                            const updated = [...activeResume.content.experience];
                            updated[idx].organization = e.target.value;
                            updateContentField('experience', updated);
                          }}
                          className="bg-white border p-2 rounded-lg"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...activeResume.content.experience];
                          updated[idx].description = e.target.value;
                          updateContentField('experience', updated);
                        }}
                        className="w-full bg-white border p-2 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Professional Printable / Preview Document Container */
              <div className="p-8 sm:p-12 bg-white border border-[#E5E0D8] rounded-3xl shadow-lg space-y-6 text-[#2F3437] font-sans printable-area">
                {/* Header / Contact */}
                <div className="border-b-2 border-[#0F4C4C] pb-4 space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F4C4C] tracking-tight">
                    {activeResume.content.contact.name}
                  </h1>
                  <p className="text-xs font-semibold text-[#6F8F72] font-mono">
                    {user.targetRole || 'Software & Data Engineer'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5A6065] pt-1">
                    <span>{activeResume.content.contact.email}</span>
                    <span>•</span>
                    <span>{activeResume.content.contact.location}</span>
                    {activeResume.content.contact.linkedin && (
                      <>
                        <span>•</span>
                        <span>{activeResume.content.contact.linkedin}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-1.5">
                  <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-[#0F4C4C] border-b pb-1">
                    Professional Summary
                  </h2>
                  <p className="text-xs leading-relaxed text-[#2F3437]">{activeResume.content.summary}</p>
                </div>

                {/* Verified Skills */}
                {activeResume.content.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-[#0F4C4C] border-b pb-1">
                      Technical Skills & Competencies
                    </h2>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeResume.content.skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-[#F7F3EA] border border-[#E5E0D8] text-xs font-medium text-[#2F3437] inline-flex items-center space-x-1"
                        >
                          <span>{sk.name}</span>
                          <span className="text-[10px] text-[#6F8F72] font-bold">✓</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {activeResume.content.projects.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-[#0F4C4C] border-b pb-1">
                      Evidence-Backed Projects
                    </h2>
                    {activeResume.content.projects.map((proj, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-[#2F3437]">
                          <span>{proj.title}</span>
                          <span className="text-[10px] text-[#6F8F72] font-mono">Verified Project ✓</span>
                        </div>
                        <p className="text-[11px] text-[#5A6065] leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Experience */}
                {activeResume.content.experience.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-[#0F4C4C] border-b pb-1">
                      Experience & Internships
                    </h2>
                    {activeResume.content.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-[#2F3437]">
                          <span>{exp.title} — {exp.organization}</span>
                          <span className="text-[10px] text-[#8A9095] font-mono">{exp.date}</span>
                        </div>
                        <p className="text-[11px] text-[#5A6065] leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                {activeResume.content.education.length > 0 && (
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-[#0F4C4C] border-b pb-1">
                      Education
                    </h2>
                    {activeResume.content.education.map((edu, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-[#2F3437]">
                        <div>
                          <strong>{edu.degree}</strong> — {edu.institution}
                        </div>
                        <span className="text-[10px] text-[#8A9095] font-mono">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E0D8] text-xs text-[#8A9095]">
              Click <strong>"Generate Resume"</strong> to create an evidence-backed ATS resume.
            </div>
          )}

          {/* Saved Resumes List */}
          {resumes.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold text-[#0F4C4C] uppercase font-mono tracking-wider">
                My Saved Resumes ({resumes.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resumes.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => setActiveResume(res)}
                    className={`p-4 rounded-2xl bg-white border cursor-pointer space-y-1 transition-all ${
                      activeResume?.id === res.id ? 'border-[#0F4C4C] shadow-md' : 'border-[#E5E0D8] hover:border-[#6F8F72]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#2F3437] font-bold">{res.title}</strong>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteResume(res.id);
                        }}
                        className="text-[#8A9095] hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-[#8A9095] font-mono block">
                      Template: {res.template} • Updated: {res.updatedAt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeBuilderView;
