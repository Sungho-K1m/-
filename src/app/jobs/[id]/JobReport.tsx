"use client";

import Link from "next/link";
import { NeedProfile } from "@/components/ProfileSummary";
import { useProfile } from "@/components/ProfileProvider";
import { ScoreBar, StatusBadge } from "@/components/Score";
import { adjacency, benefits } from "@/lib/data";
import {
  AXIS_LABEL,
  CONDITION_PENALTY,
  analyzeJob,
  effectivePay,
  fillExplanation,
  type ConditionMismatch,
  type GapReport,
} from "@/lib/scoring";
import { AXES, type Axis, type Job, type YouthProfile } from "@/lib/types";

export default function JobReport({ job }: { job: Job }) {
  const { profile } = useProfile();
  const report = profile ? analyzeJob(job, profile, adjacency) : null;
  const linkedBenefits = benefits.filter((b) => job.benefitIds.includes(b.id));

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16">
      <Link href="/matches" className="inline-flex min-h-10 items-center text-sm font-semibold text-brand">
        ← 매칭 결과
      </Link>

      <header className="mt-2">
        <p className="text-sm text-ink-faint">{job.company}</p>
        <h1 className="mt-1 text-2xl leading-snug font-bold tracking-tight">{job.title}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-ink-soft">
          <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-[13px] font-medium text-brand">{job.jobFamily}</span>
          <span className="tabular-nums">
            월 {job.salaryMin}~{job.salaryMax}만원
          </span>
        </p>
      </header>

      <section aria-labelledby="info-title" className="card mt-5 p-4">
        <h2 id="info-title" className="text-sm font-semibold text-ink-faint">
          공고 정보
        </h2>
        <dl className="mt-3 grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-2.5 text-[15px]">
          <dt className="text-ink-faint">교대근무</dt>
          <dd>{job.shift ? "있음" : "없음"}</dd>
          <dt className="text-ink-faint">주말 근무</dt>
          <dd>{job.weekendWork ? "있음" : "없음"}</dd>
          <dt className="text-ink-faint">통근 시간</dt>
          <dd>대학가에서 약 {job.commuteMinFromCampus}분</dd>
          <dt className="text-ink-faint">요구 역량</dt>
          <dd>{job.requiredSkills.length ? job.requiredSkills.join(", ") : "없음"}</dd>
          <dt className="text-ink-faint">지원 혜택</dt>
          <dd>
            {linkedBenefits.length
              ? linkedBenefits.map((b) => (
                  <span key={b.id} className="block">
                    {b.name} <span className="text-ink-faint tabular-nums">월 {b.monthlyValue}만원</span>
                  </span>
                ))
              : "없음"}
          </dd>
        </dl>
      </section>

      {profile && report ? (
        <GapSection job={job} profile={profile} report={report} />
      ) : (
        <div className="mt-8">
          <NeedProfile>조건을 입력하면 이 공고와의 격차 리포트를 볼 수 있어요.</NeedProfile>
        </div>
      )}
    </main>
  );
}

function GapSection({ job, profile, report }: { job: Job; profile: YouthProfile; report: GapReport }) {
  return (
    <section aria-labelledby="report-title" className="mt-8">
      <div className="flex items-end justify-between gap-3">
        <h2 id="report-title" className="text-xl font-bold tracking-tight">
          격차 리포트
        </h2>
        <p className="text-right">
          <span className="block text-[12px] text-ink-faint">종합 일치도</span>
          <span className="text-3xl leading-none font-bold tabular-nums">
            {report.overall}
            <span className="text-lg">%</span>
          </span>
        </p>
      </div>

      <div className="card mt-3 grid gap-4 p-4" role="group" aria-label="4축 격차 점수">
        {AXES.map((axis) => (
          <ScoreBar key={axis} axis={axis} score={report[axis].score} />
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {AXES.map((axis) => (
          <AxisDetail key={axis} axis={axis} job={job} profile={profile} report={report} />
        ))}
      </div>
    </section>
  );
}

function AxisDetail({ axis, job, profile, report }: { axis: Axis; job: Job; profile: YouthProfile; report: GapReport }) {
  const { fact, tip } = describeAxis(axis, job, profile, report);
  return (
    <article className="card p-4" aria-labelledby={`axis-${axis}`}>
      <header className="flex items-center justify-between gap-3">
        <h3 id={`axis-${axis}`} className="font-semibold">
          {AXIS_LABEL[axis]} <span className="ml-1 font-normal text-ink-faint tabular-nums">{report[axis].score}점</span>
        </h3>
        <StatusBadge score={report[axis].score} />
      </header>
      <div className="mt-2 text-[15px] leading-relaxed">{fact}</div>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{fillExplanation(job.explanations[axis], job)}</p>
      {tip && (
        <div className="mt-3 rounded-xl bg-brand-soft p-3.5 text-[15px] leading-relaxed">
          <p className="text-[13px] font-semibold text-brand">좁히는 방법</p>
          <div className="mt-1">{tip}</div>
        </div>
      )}
    </article>
  );
}

/** 축마다 계산값으로 만든 사실 문장과, 격차가 있을 때의 제안 (SPEC 7장) */
function describeAxis(
  axis: Axis,
  job: Job,
  profile: YouthProfile,
  report: GapReport,
): { fact: React.ReactNode; tip?: React.ReactNode } {
  switch (axis) {
    case "job": {
      const r = report.job;
      if (r.relation === "same") return { fact: `희망 직무(${job.jobFamily})와 같은 직무예요.` };
      if (r.relation === "adjacent") {
        return {
          fact: `희망 직무와 가까운 ${job.jobFamily} 직무예요.`,
          tip: (
            <>
              {r.nearFamily} 직무와 겹치는 업무예요. 이런 경험을 앞세우면 격차를 줄일 수 있어요.
              <TagList items={r.commonTasks} />
            </>
          ),
        };
      }
      return { fact: `희망 직무(${profile.desiredFamilies.join("·")})와 거리가 있는 ${job.jobFamily} 직무예요.` };
    }

    case "salary": {
      const r = report.salary;
      if (r.shortfall === 0) {
        return { fact: `최대 월급 ${job.salaryMax}만원이 희망 월급 ${profile.minSalary}만원 이상이에요.` };
      }
      const pay = effectivePay(job, benefits);
      return {
        fact: `최대 월급 ${job.salaryMax}만원이 희망 월급 ${profile.minSalary}만원보다 ${r.shortfall}만원 낮아요.`,
        tip: pay.benefits.length ? (
          <EffectivePayView pay={pay} minSalary={profile.minSalary} />
        ) : (
          "이 공고에는 연결된 지원 혜택이 없어서 실질 보상도 최대 월급과 같아요."
        ),
      };
    }

    case "conditions": {
      const r = report.conditions;
      if (r.mismatches.length === 0) return { fact: "선택한 근무조건과 모두 맞아요." };
      return {
        fact: (
          <ul className="grid gap-1">
            {r.mismatches.map((m) => (
              <li key={m.kind} className="flex justify-between gap-3">
                <span>{mismatchText(m, job, profile)}</span>
                <span className="shrink-0 text-gap tabular-nums">−{CONDITION_PENALTY}</span>
              </li>
            ))}
          </ul>
        ),
      };
    }

    case "skills": {
      const r = report.skills;
      const total = job.requiredSkills.length;
      if (total === 0) return { fact: "이 공고는 요구 역량이 없어요." };
      if (r.missing.length === 0) return { fact: `요구 역량 ${total}개를 모두 갖췄어요.` };
      return {
        fact: `요구 역량 ${total}개 중 ${r.owned.length}개를 갖췄어요.`,
        tip: (
          <>
            부족 역량
            <TagList items={r.missing} />
          </>
        ),
      };
    }
  }
}

function mismatchText(m: ConditionMismatch, job: Job, profile: YouthProfile): string {
  switch (m.kind) {
    case "shift":
      return "교대근무가 있어요 (교대 불가 선택)";
    case "weekend":
      return "주말 근무가 있어요 (주말 불가 선택)";
    case "commute":
      return `통근 ${job.commuteMinFromCampus}분 — 희망 최대 ${profile.maxCommuteMin}분보다 ${m.overMin}분 길어요`;
  }
}

function EffectivePayView({ pay, minSalary }: { pay: ReturnType<typeof effectivePay>; minSalary: number }) {
  const remaining = minSalary - pay.total;
  return (
    <>
      <p>지원 혜택을 더한 실질 보상</p>
      <p className="mt-1 font-semibold tabular-nums">
        월급 {pay.base}
        {pay.benefits.map((b) => (
          <span key={b.id}>
            {" "}
            + {b.name} {b.monthlyValue}
          </span>
        ))}{" "}
        = 실질 {pay.total}만원
      </p>
      <p className="mt-1 text-ink-soft">
        {remaining <= 0 ? `희망 월급 ${minSalary}만원에 닿아요.` : `희망 월급까지 ${remaining}만원 남아요.`}
      </p>
    </>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className="rounded-md border border-brand/20 bg-surface px-2 py-1 text-[14px] font-medium">
          {item}
        </li>
      ))}
    </ul>
  );
}
