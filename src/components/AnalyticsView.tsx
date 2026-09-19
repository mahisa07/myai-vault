import React from 'react';
import { BarChart3, PieChart as PieIcon, TrendingUp, Calendar, ShieldCheck, Award } from 'lucide-react';
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
  LineChart,
  Line,
} from 'recharts';
import { DocumentItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface AnalyticsViewProps {
  documents: DocumentItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ documents }) => {
  const { t } = useLanguage();
  // Monthly uploads data
  const monthlyData = [
    { month: 'Jan', uploads: 1 },
    { month: 'Feb', uploads: 0 },
    { month: 'Mar', uploads: 1 },
    { month: 'Apr', uploads: 0 },
    { month: 'May', uploads: 0 },
    { month: 'Jun', uploads: 2 },
    { month: 'Jul', uploads: 1 },
    { month: 'Aug', uploads: 1 },
    { month: 'Sep', uploads: 1 },
    { month: 'Oct', uploads: 1 },
    { month: 'Nov', uploads: 1 },
    { month: 'Dec', uploads: 1 },
  ];

  // Category breakdown data
  const categoryMap = new Map<string, number>();
  documents.forEach((d) => {
    categoryMap.set(d.category, (categoryMap.get(d.category) || 0) + 1);
  });

  const categoryChartData = Array.from(categoryMap.entries()).map(([name, value], idx) => ({
    name,
    value,
    color: ['#0F4C4C', '#6F8F72', '#5A6065', '#2F3437', '#8A9095', '#145959'][idx % 6],
  }));

  // ATS Score trend over versions
  const resumeScoreTrend = [
    { version: 'v1.0 (2024)', score: 72 },
    { version: 'v1.5 (Late 2024)', score: 79 },
    { version: 'v2.0 (Mid 2025)', score: 84 },
    { version: 'v3.0 (2026 Today)', score: 88 },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto text-[#2F3437]">
      {/* Header */}
      <div className="border-b border-[#E5E0D8] pb-6">
        <h1 className="text-2xl font-bold text-[#2F3437] flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-[#0F4C4C]" />
          <span>{t('analytics.title')}</span>
        </h1>
        <p className="text-xs text-[#5A6065] mt-1">
          {t('analytics.subtitle')}
        </p>
      </div>

      {/* Grid of Recharts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Documents Uploaded Monthly */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
            <h3 className="text-sm font-bold text-[#2F3437] flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#0F4C4C]" />
              <span>{t('analytics.cat_breakdown')}</span>
            </h3>
            <span className="text-[10px] text-[#8A9095] font-mono">2024 - 2026</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#5A6065" fontSize={10} />
                <YAxis stroke="#5A6065" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E0D8', color: '#2F3437', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="uploads" fill="#0F4C4C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Categories Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
            <h3 className="text-sm font-bold text-[#2F3437] flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-[#6F8F72]" />
              <span>{t('analytics.cat_breakdown')}</span>
            </h3>
            <span className="text-[10px] text-[#6F8F72] font-mono font-semibold">{documents.length} Docs</span>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryChartData} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {categoryChartData.map((entry, index) => (
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

        {/* ATS Score Growth Trend */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
            <h3 className="text-sm font-bold text-[#2F3437] flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#6F8F72]" />
              <span>{t('insights.ats_score')} Progression</span>
            </h3>
            <span className="text-[10px] text-[#6F8F72] font-mono font-semibold">+16 pts Gain</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resumeScoreTrend}>
                <XAxis dataKey="version" stroke="#5A6065" fontSize={9} />
                <YAxis stroke="#5A6065" fontSize={10} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E0D8', color: '#2F3437', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="score" stroke="#6F8F72" strokeWidth={3} dot={{ r: 5, fill: '#6F8F72' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
