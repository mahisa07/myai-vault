import React, { useState } from 'react';
import {
  Clock,
  Award,
  Briefcase,
  FileText,
  Code,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Eye,
  Calendar,
} from 'lucide-react';
import { motion } from 'motion/react';
import { TimelineEventItem, DocumentItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface TimelineViewProps {
  events: TimelineEventItem[];
  documents: DocumentItem[];
  onSelectDocument: (doc: DocumentItem) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  documents,
  onSelectDocument,
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Certificates', 'Projects', 'Internships', 'Academics', 'Hackathons', 'Resume'];

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'All': return t('docs.all');
      case 'Certificates': return t('docs.certificates');
      case 'Projects': return t('docs.projects');
      case 'Internships': return t('docs.internships');
      case 'Academics': return t('docs.academics');
      case 'Hackathons': return t('docs.hackathons');
      case 'Resume': return t('docs.resume');
      default: return cat;
    }
  };

  const filteredEvents = events.filter(
    (ev) => selectedCategory === 'All' || ev.category === selectedCategory
  );

  // Group events by year
  const eventsByYear = new Map<string, TimelineEventItem[]>();
  filteredEvents.forEach((ev) => {
    const year = ev.year || '2026';
    if (!eventsByYear.has(year)) {
      eventsByYear.set(year, []);
    }
    eventsByYear.get(year)?.push(ev);
  });

  const sortedYears = Array.from(eventsByYear.keys()).sort((a, b) => a.localeCompare(b));

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'Certificates':
        return <Award className="w-4 h-4 text-[#0F4C4C]" />;
      case 'Projects':
        return <Code className="w-4 h-4 text-[#0F4C4C]" />;
      case 'Internships':
        return <Briefcase className="w-4 h-4 text-[#6F8F72]" />;
      case 'Hackathons':
        return <Sparkles className="w-4 h-4 text-[#6F8F72]" />;
      default:
        return <GraduationCap className="w-4 h-4 text-[#2F3437]" />;
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto text-[#2F3437]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2F3437] flex items-center space-x-3">
            <Clock className="w-6 h-6 text-[#0F4C4C]" />
            <span>{t('timeline.title')}</span>
          </h1>
          <p className="text-xs text-[#5A6065] mt-1">
            {t('timeline.subtitle')}
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0F4C4C] text-white font-bold shadow-xs'
                  : 'bg-white text-[#5A6065] hover:text-[#2F3437] border border-[#E5E0D8]'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Timeline Stack */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E5E0D8] rounded-2xl space-y-3 shadow-xs">
          <Clock className="w-10 h-10 text-[#8A9095] mx-auto" />
          <h3 className="text-base font-bold text-[#2F3437]">No timeline events yet</h3>
          <p className="text-xs text-[#5A6065] max-w-sm mx-auto">
            Upload your certificates and documents to automatically generate your digital timeline.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 md:pl-10 space-y-12 before:absolute before:left-3 md:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#0F4C4C]">
          {sortedYears.map((year) => {
            const yearEvents = eventsByYear.get(year) || [];
            return (
              <div key={year} className="space-y-6 relative">
                {/* Year Marker Badge */}
                <div className="flex items-center space-x-3 -ml-6 md:-ml-10 mb-4">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#0F4C4C] text-white font-bold text-xs flex items-center justify-center ring-4 ring-[#F7F3EA] shadow-xs">
                    {year.slice(-2)}
                  </div>
                  <span className="text-xl font-extrabold text-[#2F3437] font-mono tracking-wider">{year}</span>
                </div>

                {/* Event Cards */}
                <div className="space-y-4">
                  {yearEvents.map((ev, idx) => {
                    const linkedDoc = documents.find((d) => d.id === ev.docId);

                    return (
                      <motion.div
                        key={ev.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                        className="p-5 rounded-2xl bg-white border border-[#E5E0D8] hover:border-[#0F4C4C]/40 transition-all relative space-y-3 shadow-xs group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 rounded-lg bg-[#EAF0EC] border border-[#6F8F72]/30">
                              {getEventIcon(ev.category)}
                            </div>
                            <span className="px-2 py-0.5 rounded bg-[#0F4C4C]/10 text-[#0F4C4C] font-mono text-[10px] font-bold uppercase">
                              {ev.category}
                            </span>
                          </div>
                          <span className="text-xs text-[#8A9095] font-mono flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-[#0F4C4C]" />
                            <span>{ev.date}</span>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#2F3437] group-hover:text-[#0F4C4C] transition-colors">
                          {ev.title}
                        </h3>

                        <p className="text-xs text-[#5A6065] leading-relaxed">{ev.description}</p>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E0D8]">
                          <div className="flex flex-wrap gap-1">
                            {ev.skills.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded bg-[#EAF0EC] text-[#577359] text-[10px] font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>

                          {linkedDoc && (
                            <button
                              onClick={() => onSelectDocument(linkedDoc)}
                              className="text-xs text-[#0F4C4C] hover:text-[#145959] font-semibold flex items-center space-x-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{t('timeline.view_doc')}</span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
