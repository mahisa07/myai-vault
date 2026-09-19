import React from 'react';
import {
  X,
  FileText,
  Award,
  Briefcase,
  CheckCircle2,
  Download,
  Trash2,
  Sparkles,
  Tag,
  Calendar,
  Building,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface DocumentDetailModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onDelete: (docId: string) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  onClose,
  onDelete,
}) => {
  const { t } = useLanguage();
  if (!document) return null;

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([document.extractedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${document.title.replace(/\s+/g, '_')}_Transcript.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#E5E0D8] rounded-2xl w-full max-w-3xl p-6 sm:p-8 text-[#2F3437] shadow-xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A9095] hover:text-[#2F3437] p-2 rounded-lg bg-[#F7F3EA] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-4 mb-6 border-b border-[#E5E0D8] pb-5">
          <div className="p-3.5 rounded-2xl bg-[#EAF0EC] border border-[#6F8F72]/30 text-[#0F4C4C] shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div className="pr-8">
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-[#0F4C4C]/10 text-[#0F4C4C] font-mono text-[10px] uppercase font-bold tracking-wider">
                {document.category}
              </span>
              <span className="text-xs text-[#6F8F72] font-mono font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('dash.verified_status')}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#2F3437]">{document.title}</h2>
            <p className="text-xs text-[#8A9095] font-mono mt-0.5">
              File: {document.fileName} • {document.fileSize}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Metadata Info Box */}
          <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-3">
            <h3 className="text-xs font-bold text-[#0F4C4C] uppercase font-mono tracking-wider">
              {t('detail.title')}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#5A6065]">
                <span className="text-[#8A9095] flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-[#0F4C4C]" />
                  <span>{t('docs.table_org')}:</span>
                </span>
                <strong className="text-[#2F3437]">{document.organization}</strong>
              </div>

              <div className="flex items-center justify-between text-[#5A6065]">
                <span className="text-[#8A9095] flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0F4C4C]" />
                  <span>{t('docs.table_date')}:</span>
                </span>
                <strong className="text-[#2F3437] font-mono">{document.issueDate}</strong>
              </div>

              <div className="flex items-center justify-between text-[#5A6065]">
                <span className="text-[#8A9095] flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#0F4C4C]" />
                  <span>{t('docs.table_cat')}:</span>
                </span>
                <strong className="text-[#2F3437]">{document.category}</strong>
              </div>
            </div>
          </div>

          {/* AI Extracted Skills & Evidence Claims */}
          <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-3">
            <h3 className="text-xs font-bold text-[#0F4C4C] uppercase font-mono tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#6F8F72]" />
              <span>{t('detail.skills')} & Evidence Claims</span>
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {document.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#EAF0EC] border border-[#6F8F72]/30 text-[#577359] text-xs font-medium flex items-center space-x-1"
                >
                  <ShieldCheck className="w-3 h-3 text-[#6F8F72]" />
                  <span>{skill}</span>
                </span>
              ))}
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[#0F4C4C] text-xs font-semibold">
                ⚡ {document.category} Claim
              </span>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-2 mb-6">
          <h3 className="text-xs font-bold text-[#0F4C4C] uppercase font-mono tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6F8F72]" />
            <span>{t('detail.summary')}</span>
          </h3>
          <p className="text-xs text-[#5A6065] leading-relaxed">{document.summary}</p>
        </div>

        {/* Styled Document Content Viewer */}
        <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-2 mb-6 max-h-48 overflow-y-auto font-mono text-xs text-[#2F3437]">
          <div className="text-[10px] text-[#8A9095] uppercase tracking-widest border-b border-[#E5E0D8] pb-1 mb-2">
            {t('detail.extracted_text')}
          </div>
          <p className="leading-relaxed whitespace-pre-line">{document.extractedText}</p>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-[#E5E0D8] pt-5">
          <button
            onClick={() => {
              onDelete(document.id);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center space-x-2 border border-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('docs.delete')}</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[#5A6065] hover:text-[#2F3437] text-xs font-medium"
            >
              {t('upload.close')}
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white text-xs font-semibold flex items-center space-x-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Transcript</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
