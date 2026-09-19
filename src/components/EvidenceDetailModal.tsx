import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ExternalLink,
  Edit2,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { CareerClaim, ClaimStatus, DocumentItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface EvidenceDetailModalProps {
  claim: CareerClaim | null;
  documents: DocumentItem[];
  onClose: () => void;
  onUpdateStatus: (claimId: string, status: ClaimStatus, userVerified?: boolean) => void;
  onDeleteClaim: (claimId: string) => void;
  onSelectDocument?: (doc: DocumentItem) => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({
  claim,
  documents,
  onClose,
  onUpdateStatus,
  onDeleteClaim,
  onSelectDocument,
}) => {
  const { t } = useLanguage();
  if (!claim) return null;

  const statusConfig = {
    VERIFIED: {
      label: 'VERIFIED',
      badgeClass: 'bg-[#EAF0EC] text-[#0F4C4C] border-[#6F8F72]/40',
      icon: <CheckCircle2 className="w-4 h-4 text-[#6F8F72]" />,
    },
    NEEDS_REVIEW: {
      label: 'NEEDS REVIEW',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: <Clock className="w-4 h-4 text-amber-600" />,
    },
    SELF_REPORTED: {
      label: 'SELF-REPORTED',
      badgeClass: 'bg-teal-50 text-[#0F4C4C] border-teal-200',
      icon: <Info className="w-4 h-4 text-[#0F4C4C]" />,
    },
    UNSUPPORTED: {
      label: 'UNSUPPORTED',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: <AlertCircle className="w-4 h-4 text-slate-500" />,
    },
  };

  const currentStatus = statusConfig[claim.status] || statusConfig.UNSUPPORTED;

  const strengthColor = {
    Strong: 'bg-[#EAF0EC] text-[#0F4C4C] border-[#6F8F72]/30',
    Moderate: 'bg-blue-50 text-blue-800 border-blue-200',
    Weak: 'bg-amber-50 text-amber-800 border-amber-200',
    None: 'bg-slate-100 text-slate-600 border-slate-200',
  }[claim.evidenceStrength || 'None'];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#E5E0D8] rounded-2xl w-full max-w-2xl p-6 sm:p-8 text-[#2F3437] shadow-xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A9095] hover:text-[#2F3437] p-2 rounded-lg bg-[#F7F3EA] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-4 mb-6 border-b border-[#E5E0D8] pb-5">
          <div className="p-3.5 rounded-2xl bg-[#EAF0EC] border border-[#6F8F72]/30 text-[#0F4C4C] shrink-0">
            <ShieldCheck className="w-7 h-7 text-[#0F4C4C]" />
          </div>
          <div className="pr-8 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded bg-[#0F4C4C]/10 text-[#0F4C4C] font-mono text-[10px] uppercase font-bold tracking-wider">
                {claim.category}
              </span>
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStatus.badgeClass}`}>
                {currentStatus.icon}
                <span>{currentStatus.label}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#2F3437]">{claim.claim}</h2>
            <p className="text-xs text-[#8A9095] font-mono">
              Created: {claim.createdAt} • Updated: {claim.updatedAt}
            </p>
          </div>
        </div>

        {/* Metadata Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] text-center space-y-1">
            <span className="text-[10px] text-[#8A9095] uppercase font-mono tracking-wider font-semibold block">
              Evidence Strength
            </span>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${strengthColor}`}>
              {claim.evidenceStrength || 'None'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] text-center space-y-1">
            <span className="text-[10px] text-[#8A9095] uppercase font-mono tracking-wider font-semibold block">
              Confidence Level
            </span>
            <span className="text-xs font-bold text-[#0F4C4C] font-mono">
              {claim.confidence || 'Medium'} Confidence
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] text-center space-y-1">
            <span className="text-[10px] text-[#8A9095] uppercase font-mono tracking-wider font-semibold block">
              User Verification
            </span>
            <span className="text-xs font-bold text-[#577359] flex items-center justify-center space-x-1">
              {claim.userVerified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6F8F72]" />
                  <span>Confirmed by user</span>
                </>
              ) : (
                <span className="text-[#8A9095]">Unverified by user</span>
              )}
            </span>
          </div>
        </div>

        {/* Claim Details / Reason */}
        <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-1.5 mb-6">
          <h3 className="text-xs font-bold text-[#0F4C4C] uppercase font-mono tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6F8F72]" />
            <span>Claim Reasoning & Summary</span>
          </h3>
          <p className="text-xs text-[#5A6065] leading-relaxed">{claim.evidenceDetails}</p>
        </div>

        {/* Supporting Evidence Sources List */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold text-[#0F4C4C] uppercase font-mono tracking-wider flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-[#0F4C4C]" />
              <span>Supporting Evidence Sources ({claim.evidenceSources?.length || 0})</span>
            </span>
          </h3>

          {claim.evidenceSources && claim.evidenceSources.length > 0 ? (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {claim.evidenceSources.map((src, idx) => {
                const linkedDoc = documents.find((d) => d.id === src.documentId);
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-2 hover:border-[#6F8F72]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-[#0F4C4C]" />
                        <strong className="text-xs text-[#2F3437] font-semibold">{src.sourceTitle}</strong>
                        <span className="text-[10px] bg-[#EAF0EC] text-[#577359] px-2 py-0.5 rounded font-mono font-medium">
                          {src.sourceType}
                        </span>
                      </div>
                      {linkedDoc && onSelectDocument && (
                        <button
                          onClick={() => {
                            onSelectDocument(linkedDoc);
                            onClose();
                          }}
                          className="text-[11px] text-[#0F4C4C] hover:underline font-semibold flex items-center space-x-1"
                        >
                          <span>View Document</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#5A6065] font-mono bg-white p-2.5 rounded-lg border border-[#E5E0D8]">
                      "{src.extractedText}"
                    </p>
                    <div className="text-[10px] text-[#8A9095] font-mono flex items-center justify-between">
                      <span>Location: {src.location}</span>
                      <span>Extracted: {src.createdAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center space-y-1">
              <AlertCircle className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <strong className="block text-slate-700">No supporting evidence sources found</strong>
              <p className="text-[11px] text-slate-500">
                Upload a document or certificate mentioning "{claim.claim}" to verify this career claim.
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E5E0D8] pt-5">
          <button
            onClick={() => {
              onDeleteClaim(claim.id);
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center justify-center space-x-2 border border-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Claim</span>
          </button>

          <div className="w-full sm:w-auto flex items-center justify-end space-x-2">
            <button
              onClick={() => {
                onUpdateStatus(claim.id, 'UNSUPPORTED', false);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
            >
              Mark as Unsupported
            </button>

            <button
              onClick={() => {
                onUpdateStatus(claim.id, 'VERIFIED', true);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Claim</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetailModal;
