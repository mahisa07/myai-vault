import React from 'react';
import {
  FileText,
  Award,
  Briefcase,
  Code,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Upload,
  Bot,
  Eye,
  Trash2,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { DocumentItem, UserProfile, CareerInsightsData } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { CareerAssistantIcon } from './CareerAssistantIcon';

interface DashboardOverviewProps {
  user: UserProfile;
  documents: DocumentItem[];
  insights: CareerInsightsData;
  onOpenUpload: () => void;
  onNavigate: (tab: string) => void;
  onSelectDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  user,
  documents,
  insights,
  onOpenUpload,
  onNavigate,
  onSelectDocument,
  onDeleteDocument,
}) => {
  const { t } = useLanguage();

  const displayName = user.name || (user.email ? user.email.split('@')[0] : 'User');
  const atsDisplay = typeof insights?.atsScore === 'number' && !isNaN(insights.atsScore) ? `${insights.atsScore}/100` : 'N/A';
  const atsPercentDisplay = typeof insights?.atsScore === 'number' && !isNaN(insights.atsScore) ? `${insights.atsScore}%` : 'N/A';

  // Compute metric stats
  const totalDocs = documents.length;
  const certCount = documents.filter((d) => d.category === 'Certificates').length;
  const projCount = documents.filter((d) => d.category === 'Projects').length;
  const internCount = documents.filter((d) => d.category === 'Internships').length;
  const resumeCount = documents.filter((d) => d.category === 'Resume').length;

  const allSkills = Array.from(new Set(documents.flatMap((d) => d.skills)));

  // Category counts for Pie Chart
  const categoryCounts = [
    { name: t('docs.projects', 'Projects'), value: projCount, color: '#0F4C4C' },
    { name: t('docs.certificates', 'Certificates'), value: certCount, color: '#6F8F72' },
    { name: t('docs.internships', 'Internships'), value: internCount, color: '#5A6065' },
    { name: t('docs.resume', 'Resume'), value: resumeCount, color: '#2F3437' },
    {
      name: 'Other',
      value: totalDocs - (projCount + certCount + internCount + resumeCount),
      color: '#8A9095',
    },
  ].filter((c) => c.value > 0);

  // Top Skills for Bar Chart
  const skillFreqMap = new Map<string, number>();
  documents.forEach((doc) => {
    doc.skills.forEach((s) => {
      skillFreqMap.set(s, (skillFreqMap.get(s) || 0) + 1);
    });
  });

  const skillsChartData = Array.from(skillFreqMap.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Growth timeline mock area data
  const growthData = [
    { month: 'Jan 24', docs: 1, skills: 3 },
    { month: 'Jun 24', docs: 3, skills: 7 },
    { month: 'Oct 24', docs: 5, skills: 10 },
    { month: 'Mar 25', docs: 6, skills: 11 },
    { month: 'Summer 25', docs: 7, skills: 12 },
    { month: '2026 Today', docs: totalDocs, skills: allSkills.length },
  ];

  return (
    <div className="bg-[#F7F3EA] text-[#2F3437] p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-white border border-[#E5E0D8] p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAF0EC] border border-[#6F8F72]/30 text-[#577359] text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#6F8F72]" />
              <span>AI Identity System Sync Complete</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2F3437]">
              {t('dash.welcome', 'Welcome back')}, {displayName}!
            </h1>
            <p className="text-[#5A6065] text-xs sm:text-sm max-w-xl">
              {t('dash.target_role', 'Target Role')}: <span className="text-[#0F4C4C] font-semibold">{user.targetRole || 'AI Candidate'}</span>{user.university && user.university !== 'Stanford University' ? ` • ${user.university}` : ''}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2.5 rounded-xl bg-[#F7F3EA] hover:bg-[#E5E0D8] text-[#2F3437] text-xs font-semibold flex items-center space-x-2 border border-[#E5E0D8] transition-colors"
            >
              <CareerAssistantIcon className="w-4 h-4 text-[#0F4C4C]" />
              <span>{t('dash.ask_ai', 'Ask AI Assistant')}</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white text-xs font-semibold shadow-sm flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4" />
              <span>{t('header.upload_btn', 'Upload Document')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: t('dash.total_docs', 'Total Vault Documents'), value: totalDocs, icon: <FileText className="w-4 h-4 text-[#0F4C4C]" /> },
          { label: t('docs.certificates', 'Certificates'), value: certCount, icon: <Award className="w-4 h-4 text-[#6F8F72]" /> },
          { label: t('docs.projects', 'Projects'), value: projCount, icon: <Code className="w-4 h-4 text-[#0F4C4C]" /> },
          { label: t('dash.unique_skills', 'Extracted Skills'), value: allSkills.length, icon: <GraduationCap className="w-4 h-4 text-[#6F8F72]" /> },
          { label: t('docs.internships', 'Internships'), value: internCount, icon: <Briefcase className="w-4 h-4 text-[#5A6065]" /> },
          { label: t('dash.ats_score', 'ATS Resume Score'), value: atsDisplay, icon: <TrendingUp className="w-4 h-4 text-[#0F4C4C]" /> },
        ].map((card, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white border border-[#E5E0D8] hover:border-[#0F4C4C]/40 transition-all shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#5A6065] font-medium">{card.label}</span>
              <div className="p-1.5 rounded-lg bg-[#F7F3EA]">{card.icon}</div>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#2F3437]">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills Distribution Bar Chart */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
            <h3 className="text-sm font-bold text-[#2F3437] flex items-center space-x-2">
              <Code className="w-4 h-4 text-[#0F4C4C]" />
              <span>Skills Frequency</span>
            </h3>
            <span className="text-[10px] text-[#6F8F72] font-mono font-semibold">Mapped from Vault</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillsChartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="skill" type="category" stroke="#5A6065" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E0D8', color: '#2F3437', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0F4C4C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Documents by Category Donut Chart */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
            <h3 className="text-sm font-bold text-[#2F3437] flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#6F8F72]" />
              <span>Vault Composition</span>
            </h3>
            <span className="text-[10px] text-[#8A9095] font-mono">{totalDocs} Items</span>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryCounts} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {categoryCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E0D8', color: '#2F3437', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth & Timeline Area Chart */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
            <h3 className="text-sm font-bold text-[#2F3437] flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#6F8F72]" />
              <span>Journey Growth</span>
            </h3>
            <span className="text-[10px] text-[#6F8F72] font-mono font-semibold">Trajectory</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <XAxis dataKey="month" stroke="#5A6065" fontSize={10} />
                <YAxis stroke="#5A6065" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E0D8', color: '#2F3437', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="skills" stroke="#6F8F72" fill="#6F8F7230" />
                <Area type="monotone" dataKey="docs" stroke="#0F4C4C" fill="#0F4C4C20" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick AI Career Insights Recommendation Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-[#EAF0EC] text-[#0F4C4C] shrink-0">
            <CareerAssistantIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold text-[#0F4C4C] uppercase tracking-wider font-mono">
                AI Career Insight
              </span>
              <span className="text-[10px] bg-[#EAF0EC] text-[#577359] px-2 py-0.5 rounded font-mono font-semibold">
                ATS Score: {atsPercentDisplay}
              </span>
            </div>
            <h4 className="text-base font-bold text-[#2F3437] mb-1">
              Target Role: {user.targetRole || 'AI/ML Engineer'}
            </h4>
            <p className="text-xs text-[#5A6065] max-w-2xl leading-relaxed">
              {documents.length === 0
                ? 'Upload your documents, degrees, and certificates to receive personalized ATS evaluations and career recommendations.'
                : `Your ${documents.length} verified document(s) match your target profile. Upload additional certificates to further boost your ATS match and career scope.`}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('insights')}
          className="px-5 py-2.5 rounded-xl bg-[#0F4C4C]/10 hover:bg-[#0F4C4C]/20 border border-[#0F4C4C]/30 text-[#0F4C4C] text-xs font-semibold whitespace-nowrap flex items-center space-x-2 transition-colors"
        >
          <span>View Full Career Insights</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Recent Uploaded Documents Table */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#2F3437]">Recent Documents Vault</h3>
            <p className="text-xs text-[#5A6065]">Indexed documents, certificates, and extracted skills</p>
          </div>

          <button
            onClick={() => onNavigate('documents')}
            className="text-xs font-semibold text-[#0F4C4C] hover:text-[#145959] flex items-center space-x-1"
          >
            <span>View All Documents</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#8A9095] font-mono border-b border-[#E5E0D8] uppercase text-[10px]">
                <th className="py-3 px-3">Title & File</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Issuer / Org</th>
                <th className="py-3 px-3">Extracted Skills</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#5A6065]">
                    No documents uploaded yet. Click "Upload Document" to add your first certification.
                  </td>
                </tr>
              ) : (
                documents.slice(0, 5).map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F7F3EA] transition-colors">
                    <td className="py-3 px-3">
                      <strong className="text-[#2F3437] block font-semibold hover:text-[#0F4C4C] cursor-pointer" onClick={() => onSelectDocument(doc)}>
                        {doc.title}
                      </strong>
                      <span className="text-[10px] text-[#8A9095] font-mono">{doc.fileName} • {doc.fileSize}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#0F4C4C]/10 text-[#0F4C4C] font-mono text-[10px] font-medium">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#5A6065]">{doc.organization}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {doc.skills.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-[#EAF0EC] text-[#577359] text-[10px] font-medium">
                            {s}
                          </span>
                        ))}
                        {doc.skills.length > 3 && (
                          <span className="text-[10px] text-[#8A9095]">+{doc.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center space-x-1 text-[#6F8F72] font-mono text-[10px] font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Indexed</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
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
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
