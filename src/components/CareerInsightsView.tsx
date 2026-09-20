import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  RefreshCw,
  Briefcase,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { CareerInsightsData, UserProfile, CareerClaim, DocumentItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface CareerInsightsViewProps {
  user: UserProfile;
  insights: CareerInsightsData;
  onRefreshInsights: () => void;
  evidenceClaims?: CareerClaim[];
  documents?: DocumentItem[];
}

export const CareerInsightsView: React.FC<CareerInsightsViewProps> = ({
  user,
  insights,
  onRefreshInsights,
  evidenceClaims = [],
  documents = [],
}) => {
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshInsights();
    setIsRefreshing(false);
  };

  const targetRole = user.targetRole || insights?.targetRole || 'Software Engineer';

  // Compute verified skills
  const verifiedSkillsMap = new Map<string, number>();

  if (insights?.skillGap?.verifiedSkills && insights.skillGap.verifiedSkills.length > 0) {
    insights.skillGap.verifiedSkills.forEach((s) => {
      verifiedSkillsMap.set(s.name, s.sourceCount);
    });
  } else if (evidenceClaims.length > 0 || documents.length > 0) {
    const verifiedClaims = evidenceClaims.filter(
      (c) => c.status === 'VERIFIED' && (!c.category || c.category === 'Skills')
    );
    verifiedClaims.forEach((c) => {
      const cnt = c.evidenceSources ? Math.max(1, c.evidenceSources.length) : 1;
      verifiedSkillsMap.set(c.claim, (verifiedSkillsMap.get(c.claim) || 0) + cnt);
    });
    documents.forEach((d) => {
      (d.skills || []).forEach((sk) => {
        if (!verifiedSkillsMap.has(sk)) verifiedSkillsMap.set(sk, 1);
      });
    });
  } else if (insights?.topSkills && insights.topSkills.length > 0) {
    insights.topSkills.forEach((s) => {
      verifiedSkillsMap.set(s.name, s.docCount || 1);
    });
  }

  const verifiedSkills = Array.from(verifiedSkillsMap.entries()).map(([name, sourceCount]) => ({
    name,
    sourceCount,
  }));

  const needsReviewSkills =
    insights?.skillGap?.needsReviewSkills && insights.skillGap.needsReviewSkills.length > 0
      ? insights.skillGap.needsReviewSkills
      : evidenceClaims
          .filter(
            (c) =>
              (c.status === 'NEEDS_REVIEW' || c.status === 'SELF_REPORTED') &&
              (!c.category || c.category === 'Skills')
          )
          .map((c) => ({
            name: c.claim,
            reason: c.evidenceDetails || 'Self-reported claim pending user verification.',
          }));

  const missingSkills =
    insights?.skillGap?.missingSkills && insights.skillGap.missingSkills.length > 0
      ? insights.skillGap.missingSkills
      : insights?.missingSkills && insights.missingSkills.length > 0
      ? insights.missingSkills.map((m) => ({ name: m.name, reason: m.reason }))
      : evidenceClaims
          .filter(
            (c) => c.status === 'UNSUPPORTED' && (!c.category || c.category === 'Skills')
          )
          .map((c) => ({
            name: c.claim,
            reason: 'No supporting document evidence found in vault.',
          }));

  let totalEvidenceSources = insights?.totalEvidenceSources ?? 0;
  if (totalEvidenceSources === 0) {
    verifiedSkills.forEach((s) => (totalEvidenceSources += s.sourceCount));
    if (totalEvidenceSources === 0 && documents.length > 0) {
      totalEvidenceSources = documents.length;
    }
  }

  const totalVerifiedSkills = insights?.totalVerifiedSkills ?? verifiedSkills.length;
  const isBacked =
    insights?.profileStatus === 'backed' || totalVerifiedSkills > 0 || totalEvidenceSources > 0;
  const hasNoData = totalVerifiedSkills === 0 && totalEvidenceSources === 0 && documents.length === 0;

  // Recommended roles
  const recommendedRoles =
    insights?.recommendedRoles && insights.recommendedRoles.length > 0
      ? insights.recommendedRoles
      : insights?.recommendedCareers && insights.recommendedCareers.length > 0
      ? insights.recommendedCareers.map((c) => ({
          title: c.title,
          description: c.description,
          relevantSkills: verifiedSkills.map((s) => s.name).slice(0, 3),
        }))
      : totalVerifiedSkills > 0
      ? [
          {
            title: targetRole,
            description: `Aligned directly with your ${totalVerifiedSkills} verified skills in MyAI Vault.`,
            relevantSkills: verifiedSkills.map((s) => s.name).slice(0, 4),
          },
          {
            title: 'Technical Specialist / Developer',
            description: 'Matches your verified document portfolio and skill verification records.',
            relevantSkills: verifiedSkills.map((s) => s.name).slice(0, 3),
          },
        ]
      : [];

  // Next steps (max 3)
  const nextSteps =
    insights?.nextSteps && insights.nextSteps.length > 0
      ? insights.nextSteps.slice(0, 3)
      : [
          needsReviewSkills.length > 0
            ? `Review ${needsReviewSkills.length} claim(s) pending verification in Evidence Vault.`
            : 'Upload additional certificates or project docs to expand your verified evidence base.',
          missingSkills.length > 0
            ? `Upload document proof for unsupported skills like ${missingSkills[0].name}.`
            : 'Export your verified skills into an evidence-backed Resume or Portfolio.',
          'Keep your target career role updated in Settings.',
        ].slice(0, 3);

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-6xl mx-auto text-[#2F3437]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2F3437] flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-[#0F4C4C]" />
            <span>Career Insights</span>
          </h1>
          <p className="text-xs text-[#5A6065] mt-1">
            Evidence-grounded summary of your profile, skill gaps, and next steps.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-5 py-2.5 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white font-semibold text-xs shadow-xs flex items-center space-x-2 shrink-0 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{t('insights.refresh_btn')}</span>
        </button>
      </div>

      {hasNoData ? (
        <div className="p-10 rounded-2xl bg-white border border-[#E5E0D8] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#0F4C4C]/10 text-[#0F4C4C] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#2F3437]">Not enough evidence yet</h3>
            <p className="text-xs text-[#5A6065] leading-relaxed">
              Upload documents or add verified claims to build your Career Insights.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Section 1: Career Profile Summary */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-[#2F3437] flex items-center space-x-2 border-b border-[#E5E0D8] pb-3">
              <Target className="w-4 h-4 text-[#0F4C4C]" />
              <span>Career Profile Summary</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-1">
                <span className="text-[10px] text-[#5A6065] uppercase font-mono tracking-wider font-semibold">
                  Target Role
                </span>
                <p className="text-sm font-bold text-[#2F3437] truncate">{targetRole}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-1">
                <span className="text-[10px] text-[#5A6065] uppercase font-mono tracking-wider font-semibold">
                  Verified Skills
                </span>
                <p className="text-sm font-bold text-[#0F4C4C]">{totalVerifiedSkills} Skills</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-1">
                <span className="text-[10px] text-[#5A6065] uppercase font-mono tracking-wider font-semibold">
                  Evidence Sources
                </span>
                <p className="text-sm font-bold text-[#2F3437]">{totalEvidenceSources} Sources</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-1">
                <span className="text-[10px] text-[#5A6065] uppercase font-mono tracking-wider font-semibold">
                  Profile Status
                </span>
                <div>
                  {isBacked ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#EAF0EC] text-[#0F4C4C] font-semibold text-[11px] border border-[#6F8F72]/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#6F8F72]" />
                      <span>Evidence-backed profile</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-semibold text-[11px] border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Insufficient evidence</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Skill Gap Analysis */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
            <div className="border-b border-[#E5E0D8] pb-3">
              <h2 className="text-sm font-bold text-[#2F3437] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F8F72]" />
                <span>Skill Gap Analysis</span>
              </h2>
              <p className="text-[11px] text-[#5A6065] mt-0.5">
                Classified based on supporting sources in your Evidence Vault.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Column 1: Verified Skills */}
              <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
                  <span className="font-bold text-[#2F3437] flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#6F8F72]" />
                    <span>Verified Skills</span>
                  </span>
                  <span className="text-[10px] bg-[#EAF0EC] text-[#0F4C4C] font-mono px-2 py-0.5 rounded font-bold">
                    {verifiedSkills.length}
                  </span>
                </div>
                {verifiedSkills.length > 0 ? (
                  <div className="space-y-2">
                    {verifiedSkills.map((sk, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white border border-[#E5E0D8] flex items-center justify-between"
                      >
                        <span className="font-medium text-[#2F3437]">{sk.name}</span>
                        <span className="text-[10px] text-[#5A6065] font-mono">
                          {sk.sourceCount} source{sk.sourceCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#8A9095] italic">No verified skills recorded yet.</p>
                )}
              </div>

              {/* Column 2: Needs Review */}
              <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
                  <span className="font-bold text-[#2F3437] flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Needs Review</span>
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-mono px-2 py-0.5 rounded font-bold">
                    {needsReviewSkills.length}
                  </span>
                </div>
                {needsReviewSkills.length > 0 ? (
                  <div className="space-y-2">
                    {needsReviewSkills.map((sk, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white border border-[#E5E0D8] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#2F3437]">{sk.name}</span>
                          <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                            NEEDS REVIEW
                          </span>
                        </div>
                        {sk.reason && (
                          <p className="text-[10px] text-[#5A6065] leading-tight">{sk.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#8A9095] italic">No skills pending review.</p>
                )}
              </div>

              {/* Column 3: No Evidence / Missing Skills */}
              <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
                  <span className="font-bold text-[#2F3437] flex items-center space-x-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>No Evidence</span>
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded font-bold">
                    {missingSkills.length}
                  </span>
                </div>
                {missingSkills.length > 0 ? (
                  <div className="space-y-2">
                    {missingSkills.map((sk, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white border border-[#E5E0D8] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#2F3437]">{sk.name}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                            UNSUPPORTED
                          </span>
                        </div>
                        {sk.reason && (
                          <p className="text-[10px] text-[#5A6065] leading-tight">{sk.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#8A9095] italic">No unsupported skill gaps listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Recommended Career Roles */}
          {recommendedRoles.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
              <div className="border-b border-[#E5E0D8] pb-3">
                <h2 className="text-sm font-bold text-[#2F3437] flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-[#0F4C4C]" />
                  <span>Recommended Career Roles</span>
                </h2>
                <p className="text-[11px] text-[#5A6065] mt-0.5">
                  Roles aligned directly with your verified evidence and skills.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {recommendedRoles.map((role, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-[#2F3437]">{role.title}</h3>
                      <p className="text-[#5A6065] text-[11px] leading-relaxed">{role.description}</p>
                    </div>

                    {role.relevantSkills && role.relevantSkills.length > 0 && (
                      <div className="pt-2 border-t border-[#E5E0D8]">
                        <span className="text-[10px] text-[#5A6065] font-semibold block mb-1">
                          Matching Verified Skills:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {role.relevantSkills.map((sk, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded bg-[#EAF0EC] text-[#0F4C4C] text-[10px] font-medium border border-[#6F8F72]/20"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Next Steps */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-[#2F3437] flex items-center space-x-2 border-b border-[#E5E0D8] pb-3">
              <ArrowRight className="w-4 h-4 text-[#0F4C4C]" />
              <span>Next Steps</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {nextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#F7F3EA] border border-[#E5E0D8] flex items-start space-x-3"
                >
                  <span className="w-6 h-6 rounded-full bg-[#0F4C4C] text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <p className="text-[#2F3437] leading-relaxed font-medium pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
