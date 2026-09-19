import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Bot,
  FileText,
  Eye,
  ShieldCheck,
  Tag,
  Calendar,
  Building,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface SemanticSearchViewProps {
  documents: DocumentItem[];
  initialQuery?: string;
  onSelectDocument: (doc: DocumentItem) => void;
}

export const SemanticSearchView: React.FC<SemanticSearchViewProps> = ({
  documents,
  initialQuery = '',
  onSelectDocument,
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<DocumentItem[]>(documents);
  const [isSearching, setIsSearching] = useState(false);

  const sampleQueries = [
    'Show all Python certificates',
    'Show latest resume',
    'Show internship letters',
    'Show SQL projects',
    'Find AI certifications',
  ];

  const handleSearch = async (q: string) => {
    setQuery(q);
    setIsSearching(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto text-[#2F3437]">
      {/* Header */}
      <div className="border-b border-[#E5E0D8] pb-6">
        <h1 className="text-2xl font-bold text-[#2F3437] flex items-center space-x-3">
          <Search className="w-6 h-6 text-[#0F4C4C]" />
          <span>{t('search.title')}</span>
        </h1>
        <p className="text-xs text-[#5A6065] mt-1">
          {t('search.subtitle')}
        </p>
      </div>

      {/* Main Search Bar & Quick Example Chips */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
        <form onSubmit={handleFormSubmit} className="relative">
          <Search className="w-5 h-5 text-[#0F4C4C] absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder={t('header.search_placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#F7F3EA] border border-[#E5E0D8] rounded-xl pl-12 pr-32 py-3 text-sm text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C] shadow-inner"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-2 px-5 py-1.5 rounded-lg bg-[#0F4C4C] hover:bg-[#145959] text-white text-xs font-semibold shadow-xs"
          >
            {isSearching ? 'Searching...' : t('search.btn')}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="space-y-2">
          <div className="text-[10px] text-[#8A9095] font-mono uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#6F8F72]" />
            <span>{t('chat.quick_prompts')}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSearch(sample)}
                className="px-3 py-1.5 rounded-xl bg-[#EAF0EC] hover:bg-[#6F8F72]/20 border border-[#6F8F72]/30 text-[#577359] text-xs font-medium transition-all flex items-center space-x-1"
              >
                <span>{sample}</span>
                <ArrowRight className="w-3 h-3 text-[#6F8F72]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#5A6065] font-mono px-1">
          <span>{t('search.title')} ({searchResults.length})</span>
          {query && <span className="text-[#0F4C4C] font-semibold">{t('search.match')}</span>}
        </div>

        <div className="space-y-4">
          {searchResults.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#E5E0D8] rounded-2xl space-y-3 shadow-xs">
              <Search className="w-10 h-10 text-[#8A9095] mx-auto" />
              <h3 className="text-base font-bold text-[#2F3437]">No matching documents found</h3>
              <p className="text-xs text-[#5A6065] max-w-sm mx-auto">
                No documents match your search or your vault is currently empty. Upload your documents to begin searching.
              </p>
            </div>
          ) : (
            searchResults.map((doc) => {
              const matchScore = doc.embeddingVectorSim
                ? Math.round(doc.embeddingVectorSim * 100)
                : 88;

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl bg-white border border-[#E5E0D8] hover:border-[#0F4C4C]/40 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#0F4C4C]/10 text-[#0F4C4C] font-mono text-[10px] font-bold uppercase">
                        {doc.category}
                      </span>
                      <span className="text-xs text-[#8A9095] font-mono">{doc.organization}</span>
                      <span className="text-xs text-[#6F8F72] font-mono font-bold ml-auto sm:ml-0">
                        {matchScore}% {t('search.match')}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectDocument(doc)}
                      className="text-base font-bold text-[#2F3437] group-hover:text-[#0F4C4C] transition-colors cursor-pointer"
                    >
                      {doc.title}
                    </h3>

                    <p className="text-xs text-[#5A6065] leading-relaxed">{doc.summary}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {doc.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[#EAF0EC] text-[#577359] text-[10px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2 border-t md:border-t-0 md:border-l border-[#E5E0D8] pt-3 md:pt-0 md:pl-4">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="px-4 py-2 rounded-xl bg-[#0F4C4C]/10 hover:bg-[#0F4C4C]/20 text-[#0F4C4C] text-xs font-semibold flex items-center space-x-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t('docs.inspect')}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
