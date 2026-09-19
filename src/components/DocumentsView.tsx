import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Search,
  Grid,
  List,
  Eye,
  Trash2,
  Download,
  Filter,
  Sparkles,
  Bot,
  Plus,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { DocumentItem, DocumentCategory } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface DocumentsViewProps {
  documents: DocumentItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenUpload: () => void;
  onSelectDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  selectedCategory,
  onSelectCategory,
  onOpenUpload,
  onSelectDocument,
  onDeleteDocument,
}) => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterQuery, setFilterQuery] = useState('');

  const categories: string[] = [
    'All',
    'Projects',
    'Certificates',
    'Internships',
    'Achievements',
    'Research',
    'Hackathons',
    'Academics',
    'Skills',
    'Resume',
  ];

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'All': return t('docs.all');
      case 'Projects': return t('docs.projects');
      case 'Certificates': return t('docs.certificates');
      case 'Internships': return t('docs.internships');
      case 'Achievements': return t('docs.achievements');
      case 'Research': return t('docs.research');
      case 'Hackathons': return t('docs.hackathons');
      case 'Academics': return t('docs.academics');
      case 'Skills': return t('docs.skills');
      case 'Resume': return t('docs.resume');
      default: return cat;
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const q = filterQuery.toLowerCase();
    const matchesSearch =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.organization.toLowerCase().includes(q) ||
      doc.skills.some((s) => s.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto text-[#2F3437]">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2F3437] flex items-center space-x-3">
            <FileText className="w-6 h-6 text-[#0F4C4C]" />
            <span>{t('docs.title')}</span>
          </h1>
          <p className="text-xs text-[#5A6065] mt-1">
            {t('docs.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white font-semibold text-xs shadow-sm flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <Upload className="w-4 h-4" />
            <span>{t('header.upload_btn')}</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Scrollable Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#0F4C4C] text-white font-bold shadow-xs'
                    : 'bg-[#F7F3EA] text-[#5A6065] hover:text-[#2F3437] border border-[#E5E0D8] hover:border-[#0F4C4C]/30'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            );
          })}
        </div>

        {/* Filter Input & Layout Switcher */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 lg:w-64">
            <Search className="w-3.5 h-3.5 text-[#8A9095] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('docs.search_input')}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-white border border-[#E5E0D8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C]"
            />
          </div>

          <div className="flex items-center p-1 bg-white border border-[#E5E0D8] rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs ${viewMode === 'grid' ? 'bg-[#0F4C4C] text-white font-bold' : 'text-[#8A9095] hover:text-[#2F3437]'}`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs ${viewMode === 'table' ? 'bg-[#0F4C4C] text-white font-bold' : 'text-[#8A9095] hover:text-[#2F3437]'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Table Display */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E5E0D8] rounded-2xl space-y-3 shadow-xs">
          <FileText className="w-10 h-10 text-[#8A9095] mx-auto" />
          <h3 className="text-base font-bold text-[#2F3437]">No documents yet</h3>
          <p className="text-xs text-[#5A6065] max-w-sm mx-auto">
            Your document vault is currently empty. Upload your certificates and documents to begin building your AI career portfolio.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white text-xs font-semibold shadow-sm inline-flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-white border border-[#E5E0D8] hover:border-[#0F4C4C]/40 transition-all shadow-xs flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#0F4C4C]/10 text-[#0F4C4C] font-mono text-[10px] font-semibold uppercase tracking-wider">
                    {doc.category}
                  </span>
                  <span className="text-[10px] text-[#8A9095] font-mono">{doc.issueDate}</span>
                </div>

                <h3
                  onClick={() => onSelectDocument(doc)}
                  className="text-base font-bold text-[#2F3437] group-hover:text-[#0F4C4C] transition-colors cursor-pointer line-clamp-1"
                >
                  {doc.title}
                </h3>

                <p className="text-xs text-[#5A6065] font-medium">{doc.organization}</p>

                <p className="text-xs text-[#5A6065] leading-relaxed line-clamp-2">{doc.summary}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#E5E0D8]">
                <div className="flex flex-wrap gap-1">
                  {doc.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#EAF0EC] text-[#577359] text-[10px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[10px] text-[#6F8F72] font-mono font-semibold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>AI Verified</span>
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="p-1.5 rounded-lg bg-[#0F4C4C]/10 hover:bg-[#0F4C4C]/20 text-[#0F4C4C]"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#8A9095] font-mono border-b border-[#E5E0D8] uppercase text-[10px]">
                <th className="py-3 px-3">{t('docs.table_title')}</th>
                <th className="py-3 px-3">{t('docs.table_cat')}</th>
                <th className="py-3 px-3">{t('docs.table_org')}</th>
                <th className="py-3 px-3">{t('detail.summary')}</th>
                <th className="py-3 px-3">{t('docs.table_skills')}</th>
                <th className="py-3 px-3 text-right">{t('docs.table_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#F7F3EA] transition-colors">
                  <td className="py-3 px-3">
                    <strong
                      onClick={() => onSelectDocument(doc)}
                      className="text-[#2F3437] block font-semibold hover:text-[#0F4C4C] cursor-pointer"
                    >
                      {doc.title}
                    </strong>
                    <span className="text-[10px] text-[#8A9095] font-mono">{doc.fileName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-[#0F4C4C]/10 text-[#0F4C4C] font-mono text-[10px] font-medium">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#5A6065]">{doc.organization}</td>
                  <td className="py-3 px-3 text-[#5A6065] max-w-xs truncate">{doc.summary}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {doc.skills.map((s, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-[#EAF0EC] text-[#577359] text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="p-1.5 rounded-lg bg-[#0F4C4C]/10 hover:bg-[#0F4C4C]/20 text-[#0F4C4C]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
