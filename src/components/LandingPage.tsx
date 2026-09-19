import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Network,
  Search,
  Clock,
  TrendingUp,
  FileText,
  Award,
  Briefcase,
  Code,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Zap,
  Play,
  X,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VaultBrandHeader, VaultLogoIcon } from './VaultLogo';
import { useLanguage } from '../i18n/LanguageContext';
import { CareerAssistantIcon } from './CareerAssistantIcon';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const { t } = useLanguage();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const featureCards = [
    {
      icon: <VaultLogoIcon className="w-6 h-6 text-[#0F4C4C]" />,
      title: 'AI Document Understanding',
      description:
        'Upload PDFs, DOCX, Certificates, or Resumes. OCR and NLP extract text, skills, dates, and issuing institutions automatically.',
    },
    {
      icon: <Award className="w-6 h-6 text-[#0F4C4C]" />,
      title: 'Skills & Credential Indexing',
      description:
        'Automatically extract and structure your technical skills, certifications, capstone projects, and verified milestones in one vault.',
    },
    {
      icon: <Search className="w-6 h-6 text-[#0F4C4C]" />,
      title: 'Semantic Vector Search',
      description:
        'Query your vault naturally. Ask "Show all Python certificates" or "Show latest resume" using AI vector similarity search.',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-[#0F4C4C]" />,
      title: 'Career & ATS Insights',
      description:
        'Get an instant ATS resume score, identify missing high-demand industry skills, and receive step-by-step learning roadmaps.',
    },
    {
      icon: <Clock className="w-6 h-6 text-[#0F4C4C]" />,
      title: 'Digital Journey Timeline',
      description:
        'Watch your academic evolution unfold in a sleek vertical timeline from your first coursework to verified industry internships.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#0F4C4C]" />,
      title: 'RAG Chat Assistant',
      description:
        'A dedicated AI co-pilot that answers recruiters or your own career queries grounded strictly on your verified vault documents.',
    },
  ];

  const faqs = [
    {
      q: 'How is MyAI Vault different from standard cloud storage like Drive or Dropbox?',
      a: 'MyAI Vault is an intelligent digital identity engine. Instead of dumping files in folders, it parses document text using OCR and Gemini NLP, indexes vector embeddings, calculates your ATS score, and allows RAG conversational Q&A over your entire journey.',
    },
    {
      q: 'What document formats are supported?',
      a: 'MyAI Vault supports PDF, Microsoft Word (.docx), Images (.png, .jpg), and compressed archives (.zip) containing certificates or code samples.',
    },
    {
      q: 'Is my data secure and private?',
      a: 'Yes! Your documents are encrypted and indexed strictly inside your isolated user vault. AI processing operates server-side using secure endpoints.',
    },
    {
      q: 'How does MyAI Vault extract skills from my documents?',
      a: 'When you upload a document (e.g. Stanford Python Cert), our AI pipeline extracts skills (Python, PyTorch) and automatically connects them to related projects, internships, and career goals.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#2F3437] overflow-x-hidden selection:bg-[#0F4C4C] selection:text-white">
      {/* Background Subtle Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-[#0F4C4C]/5 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[#6F8F72]/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-[#0F4C4C]/5 rounded-full blur-[150px]" />
      </div>

      {/* Header / Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <VaultBrandHeader size="md" />

        <div className="flex items-center space-x-4">
          <button
            onClick={onLogin}
            className="text-sm font-medium text-[#5A6065] hover:text-[#2F3437] transition-colors px-4 py-2 rounded-lg hover:bg-[#E5E0D8]/40"
          >
            {t('landing.sign_in')}
          </button>
          <button
            onClick={onGetStarted}
            className="text-sm font-semibold text-white bg-[#0F4C4C] hover:bg-[#0C3E3E] px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {t('landing.get_started')}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#EAF0EC] border border-[#6F8F72]/30 text-[#577359] text-xs font-medium mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#6F8F72] animate-pulse" />
            <span>{t('landing.badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#2F3437] leading-[1.15] mb-6">
            {t('landing.hero_title')}
          </h1>

          <p className="text-lg sm:text-xl text-[#5A6065] max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            {t('landing.hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0F4C4C] hover:bg-[#0C3E3E] text-white font-semibold text-base shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 group"
            >
              <span>{t('landing.explore')}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowDemoModal(true)}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E0D8] text-[#2F3437] font-medium text-base transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <Play className="w-4 h-4 text-[#0F4C4C] fill-[#0F4C4C]" />
              <span>{t('landing.watch_demo')}</span>
            </button>
          </div>

          {/* Interactive Hero Preview Graphic / Glass Card */}
          <div className="relative mx-auto max-w-4xl rounded-2xl bg-white border border-[#E5E0D8] p-4 sm:p-6 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8] mb-6 text-xs text-[#8A9095]">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-2 font-mono text-[#5A6065]">MyAI Vault — Student Identity System</span>
              </div>
              <div className="flex items-center space-x-2 bg-[#EAF0EC] text-[#577359] px-2.5 py-1 rounded-md border border-[#6F8F72]/30 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified AI Sync Active</span>
              </div>
            </div>

            {/* Interactive Graph Node Chain Teaser */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-left mb-4">
              {[
                { label: 'Stanford Python Cert', type: 'Certificate', icon: <Award className="w-4 h-4 text-[#0F4C4C]" /> },
                { label: 'Python & PyTorch', type: 'Extracted Skill', icon: <Code className="w-4 h-4 text-[#6F8F72]" /> },
                { label: 'Banking Risk AI', type: 'Capstone Project', icon: <FileText className="w-4 h-4 text-[#0F4C4C]" /> },
                { label: 'Goldman Sachs Intern', type: 'Work Experience', icon: <Briefcase className="w-4 h-4 text-[#6F8F72]" /> },
                { label: 'AI/ML Engineer', type: 'Target Goal', icon: <GraduationCap className="w-4 h-4 text-[#0F4C4C]" /> },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] hover:border-[#0F4C4C]/40 transition-all relative group"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {step.icon}
                    <span className="text-[10px] font-mono text-[#0F4C4C] uppercase tracking-wider font-semibold">{step.type}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#2F3437] group-hover:text-[#0F4C4C] transition-colors">
                    {step.label}
                  </p>
                  {idx < 4 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-[#0F4C4C]/60">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#EAF0EC] rounded-xl border border-[#6F8F72]/20 flex items-center justify-between text-xs text-[#2F3437]">
              <div className="flex items-center space-x-2">
                <CareerAssistantIcon className="w-4 h-4 text-[#0F4C4C] animate-spin" />
                <span>
                  <strong>AI RAG Query:</strong> "How does my Banking Risk project relate to my Goldman Sachs offer?"
                </span>
              </div>
              <span className="text-[#577359] font-mono font-bold">98% Match</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Live Impact Metrics */}
      <section className="relative z-10 border-y border-[#E5E0D8] bg-white py-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { metric: '24+', label: 'Projects Understood & Indexed' },
            { metric: '18+', label: 'Certificates Verified & Mapped' },
            { metric: '45+', label: 'Unique Technical Skills Tagged' },
            { metric: '98%', label: 'RAG Semantic Accuracy' },
          ].map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0F4C4C] font-mono">
                {item.metric}
              </div>
              <div className="text-xs sm:text-sm text-[#5A6065] font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Capabilities Feature Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2F3437] mb-4">
            Designed for Modern Academic & Career Excellence
          </h2>
          <p className="text-[#5A6065] max-w-xl mx-auto text-base">
            Everything students and fresh graduates need to organize credentials, boost ATS resumes, and converse with an AI career memory system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-white border border-[#E5E0D8] hover:border-[#0F4C4C]/40 transition-all shadow-sm group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EAF0EC] border border-[#6F8F72]/30 flex items-center justify-center mb-5 group-hover:bg-[#6F8F72]/20 transition-colors">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-[#2F3437] mb-2 group-hover:text-[#0F4C4C] transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-[#5A6065] leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2F3437] mb-3">Frequently Asked Questions</h2>
          <p className="text-[#5A6065] text-sm">Everything you need to know about MyAI Vault.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-white border border-[#E5E0D8] shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left font-medium text-[#2F3437] flex items-center justify-between text-base"
              >
                <span>{faq.q}</span>
                <span className="text-[#0F4C4C] text-xl font-bold">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-5 text-sm text-[#5A6065] border-t border-[#E5E0D8] pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Call To Action Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-[#0F4C4C] border border-[#0F4C4C] p-10 sm:p-14 text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Activate Your AI Career Vault?
            </h2>
            <p className="text-[#F7F3EA]/90 mb-8 text-base">
              Upload your first certificate or resume and let Gemini AI structure your digital identity in seconds.
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-[#0F4C4C] font-bold text-base shadow-lg transition-all transform hover:scale-105"
            >
              Open MyAI Vault Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E5E0D8] bg-white py-10 text-xs text-[#8A9095] text-center">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <VaultLogoIcon className="w-4 h-4 text-[#0F4C4C]" />
            <span className="font-semibold text-[#2F3437]">MyAI Vault</span>
            <span>— Your Journey. Understood by AI.</span>
          </div>
          <div>© {new Date().getFullYear()} MyAI Vault Digital Identity Engine. All rights reserved.</div>
        </div>
      </footer>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 max-w-2xl w-full text-[#2F3437] shadow-2xl relative"
            >
              <button
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 text-[#8A9095] hover:text-[#2F3437] p-2 rounded-lg bg-[#F7F3EA]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-[#EAF0EC] text-[#0F4C4C] rounded-xl">
                  <Play className="w-6 h-6 fill-[#0F4C4C]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2F3437]">MyAI Vault Guided Tour</h3>
                  <p className="text-xs text-[#5A6065]">See how documents transform into an intelligent identity system</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-sm">
                <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#6F8F72] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#2F3437] block mb-0.5">1. Drag & Drop Upload</strong>
                    <p className="text-[#5A6065] text-xs">
                      Drop PDFs, certificates, or resumes. OCR extracts text and Gemini extracts key skills.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#6F8F72] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#2F3437] block mb-0.5">2. Automated Skill Indexing</strong>
                    <p className="text-[#5A6065] text-xs">
                      See certificates connect to capstone projects, internships, and target role goals automatically.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#6F8F72] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#2F3437] block mb-0.5">3. RAG Conversational Q&A & ATS Score</strong>
                    <p className="text-[#5A6065] text-xs">
                      Chat with your vault to find Python projects or evaluate your ATS score against top jobs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="px-5 py-2.5 rounded-xl text-[#5A6065] hover:text-[#2F3437] text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDemoModal(false);
                    onGetStarted();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#0F4C4C] hover:bg-[#0C3E3E] text-white font-bold text-sm shadow-md"
                >
                  Enter Sample Vault Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
