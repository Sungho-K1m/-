import type { Adjacency, Axis, Benefit, Job, JobFamily, YouthProfile } from "./types";

// SPEC 6장의 기준값. [예시값] — 팀 논의로 확정하면 여기만 고친다.
export const WEIGHTS: Record<Axis, number> = { job: 0.35, salary: 0.3, conditions: 0.2, skills: 0.15 };
export const JOB_FAMILY_SCORE = { same: 100, adjacent: 60, other: 20 } as const;
export const SALARY_GAP_MULTIPLIER = 400;
export const CONDITION_PENALTY = 35;
export const BADGE_THRESHOLD = { match: 80, mid: 50 } as const;

export type Badge = "match" | "mid" | "gap";
export const BADGE_LABEL: Record<Badge, string> = { match: "일치", mid: "보통", gap: "큰 격차" };
export const AXIS_LABEL: Record<Axis, string> = {
  job: "직무",
  salary: "임금",
  conditions: "근무조건",
  skills: "역량",
};

export function badgeFor(score: number): Badge {
  if (score >= BADGE_THRESHOLD.match) return "match";
  if (score >= BADGE_THRESHOLD.mid) return "mid";
  return "gap";
}

export interface JobFamilyResult {
  score: number;
  relation: "same" | "adjacent" | "other";
  /** 인접일 때, 어느 희망 직무와 가까운지 */
  nearFamily?: JobFamily;
  commonTasks: string[];
}

export function scoreJobFamily(job: Job, profile: YouthProfile, adjacency: Adjacency): JobFamilyResult {
  if (profile.desiredFamilies.includes(job.jobFamily)) {
    return { score: JOB_FAMILY_SCORE.same, relation: "same", commonTasks: [] };
  }
  for (const desired of profile.desiredFamilies) {
    const tasks = adjacency[desired]?.[job.jobFamily];
    if (tasks) {
      return { score: JOB_FAMILY_SCORE.adjacent, relation: "adjacent", nearFamily: desired, commonTasks: tasks };
    }
  }
  return { score: JOB_FAMILY_SCORE.other, relation: "other", commonTasks: [] };
}

export interface SalaryResult {
  score: number;
  /** 희망 월급 − 최대 월급 (만원). 격차가 없으면 0 */
  shortfall: number;
}

export function scoreSalary(job: Job, profile: YouthProfile): SalaryResult {
  if (job.salaryMax >= profile.minSalary) return { score: 100, shortfall: 0 };
  const shortfall = profile.minSalary - job.salaryMax;
  const gap = shortfall / profile.minSalary;
  return { score: Math.round(Math.max(0, 100 - gap * SALARY_GAP_MULTIPLIER)), shortfall };
}

export type ConditionMismatch =
  | { kind: "shift" }
  | { kind: "weekend" }
  | { kind: "commute"; overMin: number };

export interface ConditionsResult {
  score: number;
  mismatches: ConditionMismatch[];
}

export function scoreConditions(job: Job, profile: YouthProfile): ConditionsResult {
  const mismatches: ConditionMismatch[] = [];
  if (job.shift && !profile.canShift) mismatches.push({ kind: "shift" });
  if (job.weekendWork && !profile.canWeekend) mismatches.push({ kind: "weekend" });
  if (job.commuteMinFromCampus > profile.maxCommuteMin) {
    mismatches.push({ kind: "commute", overMin: job.commuteMinFromCampus - profile.maxCommuteMin });
  }
  return { score: Math.max(0, 100 - mismatches.length * CONDITION_PENALTY), mismatches };
}

export interface SkillsResult {
  score: number;
  owned: string[];
  missing: string[];
}

export function scoreSkills(job: Job, profile: YouthProfile): SkillsResult {
  if (job.requiredSkills.length === 0) return { score: 100, owned: [], missing: [] };
  const owned = job.requiredSkills.filter((skill) => profile.skills.includes(skill));
  const missing = job.requiredSkills.filter((skill) => !profile.skills.includes(skill));
  return { score: Math.round((owned.length / job.requiredSkills.length) * 100), owned, missing };
}

export interface EffectivePay {
  base: number;
  benefits: Benefit[];
  total: number;
}

/** 실질 보상 = 최대 월급 + 연결된 지원 혜택의 월 환산액 */
export function effectivePay(job: Job, allBenefits: Benefit[]): EffectivePay {
  const linked = allBenefits.filter((benefit) => job.benefitIds.includes(benefit.id));
  const total = linked.reduce((sum, benefit) => sum + benefit.monthlyValue, job.salaryMax);
  return { base: job.salaryMax, benefits: linked, total };
}

export interface GapReport {
  overall: number;
  job: JobFamilyResult;
  salary: SalaryResult;
  conditions: ConditionsResult;
  skills: SkillsResult;
}

export function analyzeJob(job: Job, profile: YouthProfile, adjacency: Adjacency): GapReport {
  const axes = {
    job: scoreJobFamily(job, profile, adjacency),
    salary: scoreSalary(job, profile),
    conditions: scoreConditions(job, profile),
    skills: scoreSkills(job, profile),
  };
  const weighted = (Object.keys(WEIGHTS) as Axis[]).reduce(
    (sum, axis) => sum + axes[axis].score * WEIGHTS[axis],
    0,
  );
  return { overall: Math.round(weighted), ...axes };
}

export interface RankedJob {
  job: Job;
  report: GapReport;
}

/** 모든 공고를 일치도 높은 순으로. 같은 점수면 공고 번호 순. 아무것도 걸러내지 않는다. */
export function rankJobs(jobs: Job[], profile: YouthProfile, adjacency: Adjacency): RankedJob[] {
  return jobs
    .map((job) => ({ job, report: analyzeJob(job, profile, adjacency) }))
    .sort((a, b) => b.report.overall - a.report.overall || a.job.id.localeCompare(b.job.id));
}

export const TEMPLATE_KEYS = ["salaryMin", "salaryMax", "commute"] as const;

/** 미리 작성한 설명 문장의 자리표시자를 공고 데이터 값으로 채운다. */
export function fillExplanation(text: string, job: Job): string {
  const values: Record<(typeof TEMPLATE_KEYS)[number], number> = {
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    commute: job.commuteMinFromCampus,
  };
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key as keyof typeof values]) : match,
  );
}
