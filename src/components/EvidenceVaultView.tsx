import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Search,
  Filter,
  FileText,
  Layers,
  ChevronRight,
  Upload,
  RefreshCw,
  Info,
} from 'lucide-react';
import { CareerClaim, ClaimCategory, ClaimStatus, DocumentItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { EvidenceDetailModal } from './EvidenceDetailModal';

interface EvidenceVaultViewProps {
  claims: CareerClaim[];
  documents: DocumentItem[];
  onOpenUpload: () => void;
  onSelectDocument: (doc: DocumentItem) => void;
  onUpdateStatus: (claimId: string, status: ClaimStatus, userVerified?: boolean) => void;
  onDeleteClaim: (claimId: string) => void;
  onAddClaim: (claim: string, category: ClaimCategory) => void;
  onReprocess: () => void;
}

export const EvidenceVaultView: React.FC<EvidenceVaultViewProps> = ({
  claims,
  documents,
  onOpenUpload,
  onSelectDocument,
  onUpdateStatus,
  onDeleteClaim,
  onAddClaim,
  onReprocess,
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectClaim, setInspectClaim] = useState<CareerClaim | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newClaimTitle, setNewClaimTitle] = useState<string>('');
  const [newClaimCategory, setNewClaimCategory] = useState<ClaimCategory>('Skills');

  const categories: (ClaimCategory | 'All')[] = [
    'All',
    'Skills',
    'Projects',
    'Certifications',
    'Experience',
    'Achievements',
    'Technologies',
  ];

  // Calculate summary counts
  const totalSources = Array.from(
    new Set(claims.flatMap((c) => c.evidenceSources.map((s) => s.documentId)))
  ).length;
  const verifiedCount = claims.filter((c) => c.status === 'VERIFIED').length;
  const reviewCount = claims.filter((c) => c.status === 'NEEDS_REVIEW').length;
  const unsupportedCount = claims.filter((c) => c.status === 'UNSUPPORTED').length;

  // Filter claims
  const filteredClaims = claims.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    const matchesSearch = c.claim.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  const handleCreateManualClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimTitle.trim()) return;
    onAddClaim(newClaimTitle.trim(), newClaimCategory);
    setNewClaimTitle('');
    setShowAddModal(false);
  };

  const statusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF0EC] text-[#0F4C4C] border border-[#6F8F72]/40">
            <CheckCircle2 className="w-3 h-3 text-[#6F8F72]" />
            <span>VERIFIED</span>
          </span>
        );
      case 'NEEDS_REVIEW':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>NEEDS REVIEW</span>
          </span>
        );
      case 'SELF_REPORTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#0F4C4C] border border-teal-200">
            <Info className="w-3 h-3 text-[#0F4C4C]" />
            <span>SELF-REPORTED</span>
          </span>
        );
      case 'UNSUPPORTED':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <AlertCircle className="w-3 h-3 text-slate-500" />
            <span>UNSUPPORTED</span>
          </span>
        );
    }
  };

  const strengthBadge = (strength?: string) => {
    switch (strength) {
      case 'Strong':
        return <span className="text-[10px] font-mono text-[#0F4C4C] font-semibold">Strong evidence</span>;
      case 'Moderate':
        return <span className="text-[10px] font-mono text-blue-700 font-semibold">Moderate evidence</span>;
      case 'Weak':
        return <span className="text-[10px] font-mono text-amber-700 font-semibold">Weak evidence</span>;
      default:
        return <span className="text-[10px] font-mono text-slate-500 font-normal">No evidence</span>;
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto text-[#2F3437]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#2F3437] flex items-center space-x-3">
            <ShieldCheck className="w-7 h-7 text-[#0F4C4C]" />
            <span>Evidence Vault</span>
          </h1>
          <p className="text-xs text-[#5A6065] mt-1">
            Build a verified career profile from the evidence in your documents and projects.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onReprocess}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F7F3EA] text-[#5A6065] border border-[#E5E0D8] text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
            title="Re-extract evidence from vault documents"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Evidence</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Claim</span>
          </button>
        </div>
      </div>

      {/* Principle Banner */}
      <div className="p-4 rounded-2xl bg-[#EAF0EC] border border-[#6F8F72]/30 flex items-start space-x-3 text-xs text-[#2F3437]">
        <Info className="w-5 h-5 text-[#0F4C4C] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#0F4C4C] block mb-0.5">Evidence-Grounded Principle</strong>
          Every career claim in MyAI Vault is traced back to supporting evidence extracted from your verified source documents.
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] space-y-1 shadow-xs">
          <span className="text-[10px] text-[#8A9095] uppercase font-mono tracking-wider font-semibold block">
            Total Sources
          </span>
          <span className="text-2xl font-extrabold font-mono text-[#0F4C4C]">{totalSources}</span>
          <span className="text-[10px] text-[#5A6065] block">Contributing documents</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] space-y-1 shadow-xs">
          <span className="text-[10px] text-[#0F4C4C] uppercase font-mono tracking-wider font-semibold block">
            Verified Claims
          </span>
          <span className="text-2xl font-extrabold font-mono text-[#577359]">{verifiedCount}</span>
          <span className="text-[10px] text-[#6F8F72] block">Supported by evidence</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] space-y-1 shadow-xs">
          <span className="text-[10px] text-amber-700 uppercase font-mono tracking-wider font-semibold block">
            Needs Review
          </span>
          <span className="text-2xl font-extrabold font-mono text-amber-800">{reviewCount}</span>
          <span className="text-[10px] text-amber-700 block">Pending confirmation</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-600 uppercase font-mono tracking-wider font-semibold block">
            Unsupported
          </span>
          <span className="text-2xl font-extrabold font-mono text-slate-700">{unsupportedCount}</span>
          <span className="text-[10px] text-slate-500 block">Lacks document evidence</span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0F4C4C] text-white shadow-xs'
                  : 'text-[#5A6065] hover:bg-[#F7F3EA] hover:text-[#2F3437]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A9095] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C]"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl px-3 py-1.5 text-xs text-[#2F3437] font-semibold focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="SELF_REPORTED">Self-Reported</option>
            <option value="UNSUPPORTED">Unsupported</option>
          </select>
        </div>
      </div>

      {/* Claims List / Grid OR Empty State */}
      {documents.length === 0 && claims.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E0D8] space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF0EC] text-[#0F4C4C] flex items-center justify-center mx-auto border border-[#6F8F72]/30 shadow-xs">
            <ShieldCheck className="w-8 h-8 text-[#0F4C4C]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-[#2F3437]">Your Evidence Vault is empty</h3>
            <p className="text-xs text-[#5A6065] leading-relaxed max-w-md mx-auto">
              Upload a certificate, project, resume, or internship document to start building your evidence-backed career profile.
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="px-6 py-2.5 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white font-bold text-xs shadow-md inline-flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E0D8] text-xs text-[#8A9095]">
          No career claims match your selected category or status filter.
        </div>
      ) : (
        /* Claims Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClaims.map((item) => {
            const hasSources = item.evidenceSources && item.evidenceSources.length > 0;
            return (
              <div
                key={item.id}
                onClick={() => setInspectClaim(item)}
                className="p-5 rounded-2xl bg-white border border-[#E5E0D8] hover:border-[#6F8F72]/50 space-y-3 cursor-pointer shadow-xs hover:shadow-md transition-all group relative overflow-hidden"
              >
                {/* Header: Title, Category, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-[#0F4C4C]/10 text-[#0F4C4C] font-mono text-[10px] uppercase font-bold tracking-wider">
                        {item.category}
                      </span>
                      {strengthBadge(item.evidenceStrength)}
                    </div>
                    <h3 className="text-base font-bold text-[#2F3437] group-hover:text-[#0F4C4C] transition-colors">
                      {item.claim}
                    </h3>
                  </div>
                  {statusBadge(item.status)}
                </div>

                {/* Evidence Details / Description */}
                <p className="text-xs text-[#5A6065] leading-relaxed line-clamp-2">
                  {item.evidenceDetails}
                </p>

                {/* Supporting Sources Badges or Unsupported Banner */}
                {hasSources ? (
                  <div className="pt-2 border-t border-[#E5E0D8]/60 space-y-1.5">
                    <span className="text-[10px] font-mono text-[#0F4C4C] uppercase font-bold tracking-wider block">
                      Supporting Sources ({item.evidenceSources.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.evidenceSources.slice(0, 3).map((src, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-1 rounded-lg bg-[#F7F3EA] border border-[#E5E0D8] text-[11px] text-[#2F3437] font-medium flex items-center space-x-1"
                        >
                          <FileText className="w-3 h-3 text-[#0F4C4C]" />
                          <span className="truncate max-w-[140px]">{src.sourceTitle}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[#E5E0D8]/60 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center space-x-1 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>No supporting evidence found in current documents.</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenUpload();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#EAF0EC] hover:bg-[#6F8F72]/20 text-[#0F4C4C] text-[10px] font-bold uppercase font-mono border border-[#6F8F72]/30 transition-colors"
                    >
                      Add Evidence
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Claim Inspection Modal */}
      <EvidenceDetailModal
        claim={inspectClaim}
        documents={documents}
        onClose={() => setInspectClaim(null)}
        onUpdateStatus={onUpdateStatus}
        onDeleteClaim={onDeleteClaim}
        onSelectDocument={onSelectDocument}
      />

      {/* Add Manual Claim Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl w-full max-w-md p-6 text-[#2F3437] shadow-xl relative">
            <h3 className="text-lg font-bold text-[#2F3437] mb-1">Add Career Claim</h3>
            <p className="text-xs text-[#5A6065] mb-4">
              Add a self-reported claim. You can later upload supporting document evidence to verify it.
            </p>

            <form onSubmit={handleCreateManualClaim} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2F3437] mb-1">Claim Title / Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. SQL, Power BI, Customer Segmentation"
                  value={newClaimTitle}
                  onChange={(e) => setNewClaimTitle(e.target.value)}
                  className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0F4C4C]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#2F3437] mb-1">Category</label>
                <select
                  value={newClaimCategory}
                  onChange={(e) => setNewClaimCategory(e.target.value as ClaimCategory)}
                  className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="Skills">Skills</option>
                  <option value="Projects">Projects</option>
                  <option value="Certifications">Certifications</option>
                  <option value="Experience">Experience</option>
                  <option value="Achievements">Achievements</option>
                  <option value="Technologies">Technologies</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-[#5A6065] hover:text-[#2F3437] text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white font-bold text-xs shadow-xs"
                >
                  Save Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceVaultView;
